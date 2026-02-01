//! The consumer implementation from Barnes
//!

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};
use std::fmt::Debug;

use async_channel::{Receiver, Sender};
use num_traits::Float;
use num_traits::float::TotalOrder;
use ordered_float::FloatCore;
use oxscape::{GridMeta, XSHIFT, YSHIFT};

use crate::array_2d::skirt_starts;
use crate::{TLabel, fill::NextUp, tile::TileInfo};

pub type SpillGraph<T> = Vec<HashMap<TLabel, T>>;
pub type TileGrid = HashMap<(usize, usize), TileInfo>;
pub type FillGrid<T> = HashMap<TileInfo, FillData<T>>;
pub type RaiseGrid<T> = HashMap<TileInfo, Vec<T>>;

#[derive(Debug)]
pub struct FillData<T> {
    pub(crate) spill_graph: SpillGraph<T>,
    pub(crate) dem_edges: Vec<T>,
    pub(crate) label_edges: Vec<TLabel>,
    /// Offset of the label into the supergraph
    pub(crate) label_offset: Option<usize>
    // GridMeta is in TileInfo struct....
}

pub struct Producer<T: FloatCore + NextUp> {
    producer: ProducerSpecifics<T>,
    meta: GridMeta,
}

pub struct ProducerSpecifics<T: FloatCore + NextUp> {
    graph_elevations: Vec<T>,
}

/// Enum with different messages that can be passed producer-consumer
pub enum ProducerMessage<T> {
    /// Fill the tile DEM and note its catchments
    InitialFill(TileInfo),
    /// Fill the tile DEM's catchments to the given levels
    CatchmentRaise(TileInfo, Vec<T>),
    /// Everything done, quit
    Quit,
}

/// Different messages that can be passed consumer-producer
#[derive(Debug)]
pub enum ConsumerMessage<T> {
    /// Tile filled, these are it's catchments and spillover elevations
    InitialFillComplete(TileInfo, FillData<T>),
    /// Completed filling the catchments
    CatchmentFillComplete,
}

///Producer takes a collection of Jobs and delegates them to Consumers. Once all
///of the jobs have received their initial processing, it uses that information
///to compute the global properties necessary to the solution. Each Job, suitably
///modified, is then redelegated to a Consumer which ultimately finishes the
///processing.
pub async fn producer<T: Debug + TotalOrder + Default + FloatCore>(
    tiles: TileGrid,
    sender: Sender<ProducerMessage<T>>,
    receiver: Receiver<ConsumerMessage<T>>,
) {
    let n_tiles = tiles.len();
    // send all tiles to consumers
    // they will fill their tile and give catchment information
    for (_coords, tile) in tiles {
        sender
            .send(ProducerMessage::InitialFill(tile))
            .await
            .expect("Channel should be open");
    }

    // get catchment connectivity information from consumers
    let mut job1_grid = FillGrid::with_capacity(n_tiles);
    for _ in 0..n_tiles {
        if let ConsumerMessage::InitialFillComplete(tile, graph) =
            receiver.recv().await.expect("channel receive error")
        {
            job1_grid.insert(tile, graph);
        } else {
            unreachable!(
                "At this point no other messages have been sent that way, so none should be returned this way"
            );
        };
    }

    // Connect edge tiles to special watershed 1... well, this could just be done together with connecting normal edges
    println!("TODO: Connect edge tiles to special watershed 0");
    // fill the supergraph DEM
    let jobs_2 = fill_supergraph(job1_grid);

    // tell all consumers to fill their tiles to the amount given in jobs2
    for (tile, job2) in jobs_2 {
        sender
            .send(ProducerMessage::CatchmentRaise(tile, job2))
            .await
            .expect("Channel should be open");
    }

    // await their completion
    // This currently doesn't return anything, but results are saved to cache
    for _ in 0..n_tiles {
        match receiver.recv().await.expect("channel should be open") {
            ConsumerMessage::CatchmentFillComplete => {}
            other_message => unreachable!(
                "Received message {other_message:?}, whereas only `CatchmentFillComplete` was expected"
            ),
        }
    }

    // tell consumers to quit
    for _ in 0..n_tiles {
        sender
            .send(ProducerMessage::Quit)
            .await
            .expect("channel should be open");
    }
}

/// This takes the job grid, which I guess should be like ordered for
/// deterministic results. However, I don't know if that's really necessary
///
/// basically this transformation:
/// ```raw
/// [Job1_1[x,x,2->3@1.0,3->4@0.5],Job1_2[x,x,2->3@1.2,3->4@0.2]] -> [x,x,2->3@1.0,3->4@0.5,x,x,6->7@1.2,7->8@0.2]
/// ```
/// and making edges bi-directional
///
/// and connecting edges between tiles (with edge info)
///
fn build_supergraph<T: Copy + FloatCore>(
    fill_grid: &FillGrid<T>,
) -> (Vec<(TileInfo, usize)>, SpillGraph<T>) {
    // This locs-vec is a bit ugly. I don't like that we're iterating a hashmap
    // also, and I think the worst part is that the keys are TileInfo. They'd
    // ideally be some x,y index, and the info be added to the FillGrid struct.
    // Barnes keeps the offsets in the supergaph also in the TileInfo struct,
    // which works quite well... The problem with TileInfo as key is that we
    // can't mutate them while in the map...
    // 
    // The other problem is that we lose TileInfo information. If we would
    // mutate the FillGrid, we can just output a SpillGraph and the user will
    // know the indices in the graph from the mutated FillGrid. 
    let mut locs = Vec::with_capacity(fill_grid.len());
    let total_size: usize = fill_grid.iter().map(|(_, v)| v.spill_graph.len()).sum();
    let mut supergraph: SpillGraph<T> = vec![HashMap::new(); 1 + total_size];
    let mut idx_offset = 0;
    for (tile, fd) in fill_grid {
        let graph = &fd.spill_graph;
        for (idx, node) in graph.iter().enumerate() {
            for (neighbour, spill_elev) in node {
                // insert edges at the offset bidirectionally
                supergraph[idx].insert(neighbour + idx_offset, *spill_elev);
                supergraph[usize::try_from(neighbour + idx_offset).unwrap()]
                    .insert(TLabel::try_from(idx).unwrap(), *spill_elev);
            }
        }
        idx_offset += TLabel::try_from(graph.len()).unwrap();
        locs.push((tile.clone(), usize::try_from(idx_offset).unwrap()));
    }
    // check this tile's edges and connect them accordingly
    for (tile, my_idx_offset) in &locs {
        let fd = &fill_grid[tile];
        // now check all tiles and connect their nodes
        let (tx, ty) = tile.xy();
        // for indexing into edges
        let edge_offsets = skirt_starts(tile.meta());
        // manual index shifting because we don't have a super-meta
        for dir in 0..8 {
            let nx = (isize::try_from(tx).unwrap() + XSHIFT[dir]) as usize;
            let ny = (isize::try_from(ty).unwrap() + YSHIFT[dir]) as usize;
            let Some((n_tile, idx_offset)) = locs
                .iter()
                .find(|(a, _)| a.xy() == (nx as usize, ny as usize))
            else {
                continue;
            };
            // now we also know it's in fill_grid:
            let n_fd = &fill_grid[n_tile];
            // something something edges
            // TODO: different tiles etc
            assert_eq!(tile.meta(), n_tile.meta());
            for edge_idx in edge_offsets[dir]..edge_offsets[dir + 1] {
                let n_label = n_fd.label_edges[edge_idx];
                let my_label = fd.label_edges[edge_idx];
                let spill_elev = n_fd.dem_edges[edge_idx].max(fd.dem_edges[edge_idx]);
                if let Some(elev) = supergraph[usize::try_from(my_label).unwrap() + my_idx_offset]
                    .get_mut(&(n_label + *idx_offset as TLabel))
                {
                    if *elev > spill_elev {
                        *elev = spill_elev;
                        supergraph[usize::try_from(n_label).unwrap() + *idx_offset].insert(
                            my_label + TLabel::try_from(*my_idx_offset).unwrap(),
                            spill_elev,
                        );
                    }
                } else {
                    supergraph[usize::try_from(my_label).unwrap() + my_idx_offset]
                        .insert(n_label + *idx_offset as TLabel, spill_elev);
                    supergraph[usize::try_from(n_label).unwrap() + *idx_offset].insert(
                        my_label + TLabel::try_from(*my_idx_offset).unwrap(),
                        spill_elev,
                    );
                }
            }
        }
    }
    (locs, supergraph)
}

/// Cell of a graph with reverse ordering for the priority queue
struct GraphCell<T> {
    label: TLabel,
    spill_elev: T,
}

impl<T: TotalOrder> Eq for GraphCell<T> {}
impl<T: TotalOrder> PartialEq for GraphCell<T> {
    fn eq(&self, other: &Self) -> bool {
        matches!(self.cmp(other), Ordering::Equal)
    }
}
impl<T: TotalOrder> PartialOrd for GraphCell<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match other.spill_elev.total_cmp(&self.spill_elev) {
            Ordering::Equal => Some(other.label.cmp(&self.label)),
            unequal => Some(unequal),
        }
    }
}
impl<T: TotalOrder> Ord for GraphCell<T> {
    fn cmp(&self, other: &Self) -> Ordering {
        self.partial_cmp(other).unwrap()
    }
}

fn fill_supergraph<T: TotalOrder + Default + FloatCore>(graph_grid: FillGrid<T>) -> RaiseGrid<T> {
    let (mut locs, supergraph) = build_supergraph(&graph_grid);
    let mut graph_elevs = vec![T::default(); supergraph.len()];
    // So ideally this would be Zhou, but I guess we can just priority-queue (Barnes) our way out?
    let mut pq = BinaryHeap::with_capacity(supergraph.len());
    // the edge: special watershed 0 (why 1? was something else 0?) is connected to all edges of the grid
    for (&label, &spill_elev) in &supergraph[0] {
        pq.push(GraphCell { label, spill_elev });
    }
    fill_graph(&supergraph, &mut graph_elevs, &mut pq);
    let mut res = HashMap::with_capacity(locs.len());
    for idx in 0..locs.len() {
        // locs is a (TileInfo, end_index) vec. This means that
        let range = if idx == 0 {
            0..locs[0].1
        } else {
            locs[idx - 1].1..locs[idx].1
        };
        // TODO: can we share references here in stead of vecs?
        res.insert(
            std::mem::take(&mut locs[idx].0),
            graph_elevs[range].to_vec(),
        );
    }
    res
}

/// Depression-fill the graph
fn fill_graph<T: TotalOrder + Default + FloatCore>(
    spill_graph: &[HashMap<TLabel, T>],
    graph_elevs: &mut [T],
    pq: &mut BinaryHeap<GraphCell<T>>,
) {
    let mut processed = vec![false; spill_graph.len()];
    // Do the priority-queue depression filling. This is somewhat different from
    // a normal depression filling, because the elevation is now captured on the
    // edges, rather than that a cell has a single elevation. Since the priority
    // queue still travels lowest-first, it will find elevations from the lowest
    // possible direction.
    while let Some(cell) = pq.pop() {
        for (&label, n_elev) in &spill_graph[cell.label as usize] {
            let l: usize = label.try_into().unwrap();
            // if we're re-visiting the cell, it has already flowed to the edge
            if processed[l] {
                continue;
            }
            // take the maximum elevation, this will fill depressions
            //
            // we don't need to modify spill_graph: the spill elevation only
            // works for this watershed. Also we'll only visit every cell once
            let spill_elev = cell.spill_elev.max(*n_elev);
            graph_elevs[l] = spill_elev;
            processed[l] = true;
            // add cell to the priority queue
            pq.push(GraphCell { label, spill_elev });
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[tokio::test]
    async fn test_channel() {
        let (s, r1) = async_channel::unbounded();
        let r2 = r1.clone();
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r2.recv().await.unwrap(), 42);
        assert_eq!(r1.recv().await.unwrap(), 43);
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r1.recv().await.unwrap(), 42);
        assert_eq!(r2.recv().await.unwrap(), 43);
    }

    #[test]
    fn test_fill_graph_depression() {
        // not sure what type of graph we'd do that has like a depression... well... let's do the easiest 3-node one
        let graph = vec![
            HashMap::from([(1, 1.0)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut pq = BinaryHeap::new();
        pq.push(GraphCell {
            label: 0,
            spill_elev: graph[0][&1],
        });
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs, &mut pq);
        assert_eq!(&elevs, &[0.0, 1.0, 1.0]);
    }

    #[test]
    fn test_fill_graph_flat() {
        // not sure what type of graph we'd do that has like a depression... well... let's do the easiest 3-node one
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut pq = BinaryHeap::new();
        pq.push(GraphCell {
            label: 0,
            spill_elev: graph[0][&1],
        });
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs, &mut pq);
        assert_eq!(&elevs, &[0.0, 0.5, 0.5]);
    }

    #[test]
    fn test_fill_graph_slope() {
        // not sure what type of graph we'd do that has like a depression... well... let's do the easiest 3-node one
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 1.0)]),
            HashMap::new(),
        ];
        let mut pq = BinaryHeap::new();
        pq.push(GraphCell {
            label: 0,
            spill_elev: graph[0][&1],
        });
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs, &mut pq);
        assert_eq!(&elevs, &[0.0, 0.5, 1.0]);
    }
}

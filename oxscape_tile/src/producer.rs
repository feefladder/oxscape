//! The consumer implementation from Barnes
//!

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};
use std::fmt::Debug;

use async_channel::{Receiver, Sender};
use num_traits::float::TotalOrder;
use ordered_float::FloatCore;
use oxscape::{GridMeta, XSHIFT, YSHIFT};

use crate::{TLabel, fill::NextUp, tile::TileInfo};

pub type SpillGraph<T> = Vec<HashMap<TLabel, T>>;

/// graph of spill elevations that also keeps track of which ranges map to which tiles
#[derive(Debug, Clone, PartialEq)]
pub struct SuperGraph<T> {
    spill_graph: SpillGraph<T>,
    offsets: HashMap<TileCoord, (TLabel, usize)>,
}

impl<T> SuperGraph<T> {
    pub fn spill_graph(&self) -> &SpillGraph<T> {
        &self.spill_graph
    }
    pub fn offsets(&self) -> &HashMap<TileCoord, (TLabel, usize)> {
        &self.offsets
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct TileCoord {
    pub x: usize,
    pub y: usize,
}

impl TileCoord {
    pub fn new(x: usize, y: usize) -> Self {
        Self { x, y }
    }
}

impl From<(usize, usize)> for TileCoord {
    fn from(value: (usize, usize)) -> Self {
        Self::new(value.0, value.1)
    }
}

// Ideally there'd be some logic to this
pub type TileGrid = HashMap<TileCoord, TileInfo>;
pub type RaiseGrid<T> = HashMap<TileInfo, Vec<T>>;

pub struct HashMapFillGrid<T> {
    pub grid: HashMap<TileCoord, FillData<T>>,
}

pub trait FillGrid<T> {
    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a;
    fn n_tiles(&self) -> usize;
    fn tile(&self, coord: &TileCoord) -> &FillData<T>;
    fn edge(&self, coord: &TileCoord, dir: u8) -> (&[TLabel], &[T]);
    fn neighbour(&self, coord: &TileCoord, dir: u8) -> Option<TileCoord>;
}

impl<T> FillGrid<T> for HashMapFillGrid<T> {
    fn n_tiles(&self) -> usize {
        self.grid.len()
    }

    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a,
    {
        self.grid.values()
    }

    fn tile(&self, coord: &TileCoord) -> &FillData<T> {
        &self.grid[coord]
    }

    fn edge(&self, coord: &TileCoord, dir: u8) -> (&[TLabel], &[T]) {
        let fill_data = &self.grid[coord];
        let range = fill_data.tile_info.meta().skirt_range(dir);
        (
            &fill_data.label_edges[range.clone()],
            &fill_data.dem_edges[range],
        )
    }

    fn neighbour(&self, my_coord: &TileCoord, dir: u8) -> Option<TileCoord> {
        let Ok(x) = usize::try_from(my_coord.x as isize + XSHIFT[dir as usize]) else {
            return None;
        };
        let Ok(y) = usize::try_from(my_coord.y as isize + YSHIFT[dir as usize]) else {
            return None;
        };
        let n_coord = TileCoord { x, y };
        if self.grid.contains_key(&n_coord) {
            Some(n_coord)
        } else {
            None
        }
    }
}

pub struct VecFillGrid<T> {
    meta: GridMeta,
    data: Vec<FillData<T>>,
}

impl<T> VecFillGrid<T> {
    pub fn new(meta: GridMeta, data: Vec<FillData<T>>) -> Self {
        Self { meta, data }
    }

    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
    pub fn data(&self) -> &Vec<FillData<T>> {
        &self.data
    }
}

impl<T> FillGrid<T> for VecFillGrid<T> {
    fn n_tiles(&self) -> usize {
        self.meta.size()
    }
    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a,
    {
        self.data.iter()
    }
    fn edge(&self, coord: &TileCoord, dir: u8) -> (&[TLabel], &[T]) {
        let fd = self.tile(coord);
        let range = fd.tile_info.meta.skirt_range(dir);
        (&fd.label_edges[range.clone()], &fd.dem_edges[range])
    }
    fn tile(&self, coord: &TileCoord) -> &FillData<T> {
        &self.data[self.meta.xy_to_i(coord.x, coord.y)]
    }
    fn neighbour(&self, coord: &TileCoord, dir: u8) -> Option<TileCoord> {
        self.meta
            .try_shift(coord.x, coord.y, dir)
            .map(|i| self.meta.i_to_xy(i).into())
    }
}

#[derive(Debug)]
pub struct FillData<T> {
    pub(crate) tile_info: TileInfo,
    pub(crate) spill_graph: SpillGraph<T>,
    pub(crate) dem_edges: Vec<T>,
    pub(crate) label_edges: Vec<TLabel>,
}

impl<T> FillData<T> {
    pub fn new(
        tile_coord: TileCoord,
        meta: GridMeta,
        spill_graph: SpillGraph<T>,
        dem_edges: Vec<T>,
        label_edges: Vec<TLabel>,
    ) -> Self {
        Self {
            tile_info: TileInfo { tile_coord, meta },
            spill_graph,
            dem_edges,
            label_edges,
        }
    }

    pub fn spill_graph(&self) -> &SpillGraph<T> {
        &self.spill_graph
    }
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
    InitialFillComplete(FillData<T>),
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
    let mut job1_grid = HashMapFillGrid {
        grid: HashMap::with_capacity(n_tiles),
    };
    for _ in 0..n_tiles {
        if let ConsumerMessage::InitialFillComplete(fill_data) =
            receiver.recv().await.expect("channel receive error")
        {
            job1_grid.grid.insert(fill_data.tile_info.xy(), fill_data);
        } else {
            unreachable!(
                "At this point no other messages have been sent that way, so none should be returned this way"
            );
        };
    }

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

/// create a supergraph from tiles' graphs and edge data
///
/// basically this transformation:
/// ```raw
/// [Job1_1[x,x,2->3@1.0,3->4@0.5],Job1_2[x,x,2->3@1.2,3->4@0.2]] -> [x,x,2->3@1.0,3->4@0.5,x,x,6->7@1.2,7->8@0.2]
/// ```
/// and making edges bi-directional
///
/// and connecting edges between tiles (with edge info)
///
pub fn build_supergraph<T: Copy + FloatCore + Debug>(
    fill_grid: &impl FillGrid<T>,
) -> SuperGraph<T> {
    let total_size: usize = fill_grid.iter().map(|v| v.spill_graph.len()).sum::<usize>() + 1;
    let mut supergraph: SpillGraph<T> = vec![HashMap::new(); total_size];
    let mut idx_offsets = HashMap::with_capacity(fill_grid.n_tiles());
    let mut idx_offset: TLabel = 1;
    for fd in fill_grid.iter() {
        let graph = &fd.spill_graph;
        for (idx, node) in graph.iter().enumerate() {
            for (neighbour, spill_elev) in node {
                let my_label = idx as TLabel + idx_offset;
                let n_label = neighbour + idx_offset;
                // insert edges at the offset bidirectionally
                supergraph[my_label as usize].insert(n_label, *spill_elev);
                supergraph[n_label as usize].insert(my_label, *spill_elev);
            }
        }
        idx_offsets.insert(
            fd.tile_info.tile_coord,
            (idx_offset, fd.spill_graph().len()),
        );
        idx_offset += TLabel::try_from(graph.len()).unwrap();
    }

    // check this tile's edges and connect them accordingly
    for fd in fill_grid.iter() {
        let my_coord = &fd.tile_info.tile_coord;
        // let tile = &fd.tile_info;
        // now check all tiles and connect their nodes
        // for indexing into edges
        for dir in 0..8 {
            // get the edge
            let (my_labels, my_elevs) = fill_grid.edge(my_coord, dir);
            // if we have a neighbour, connect edges
            if let Some(n_coord) = fill_grid.neighbour(my_coord, dir) {
                let (n_labels, n_elevs) =
                    fill_grid.edge(&n_coord, GridMeta::rev(dir as usize) as u8);
                for edge_idx in 0..my_labels.len() {
                    let my_label = my_labels[edge_idx] + idx_offsets[my_coord].0;
                    let n_label = n_labels[edge_idx] + idx_offsets[&n_coord].0;
                    if my_label == n_label {
                        panic!("found a duplicate somehow");
                        // continue;
                    }
                    let spill_elev = my_elevs[edge_idx].max(n_elevs[edge_idx]);
                    if !supergraph[my_label as usize].contains_key(&n_label) {
                        supergraph[my_label as usize].insert(n_label, spill_elev);
                        supergraph[n_label as usize].insert(my_label, spill_elev);
                    } else if supergraph[my_label as usize][&n_label] > spill_elev {
                        supergraph[my_label as usize].insert(n_label, spill_elev);
                        supergraph[n_label as usize].insert(my_label, spill_elev);
                    }
                }
            } else {
                // otherwise, connect edges to special watershed 0 which represents the edge of the grid
                for edge_idx in 0..my_labels.len() {
                    let my_label = my_labels[edge_idx] + idx_offsets[my_coord].0;
                    let spill_elev = my_elevs[edge_idx];
                    if !supergraph[my_label as usize].contains_key(&0) {
                        supergraph[my_label as usize].insert(0, spill_elev);
                        supergraph[0].insert(my_label, spill_elev);
                    } else if supergraph[my_label as usize][&0] > spill_elev {
                        supergraph[my_label as usize].insert(0, spill_elev);
                        supergraph[0].insert(my_label, spill_elev);
                    }
                }
            }
        }
    }
    SuperGraph {
        spill_graph: supergraph,
        offsets: idx_offsets,
    }
}

/// Cell of a graph with reverse ordering for the priority queue
pub struct GraphCell<T> {
    label: TLabel,
    spill_elev: T,
}

impl<T> GraphCell<T> {
    pub fn label(&self) -> TLabel {
        self.label
    }

    pub fn spill_elev(&self) -> &T {
        &self.spill_elev
    }
}

impl<T: TotalOrder> Eq for GraphCell<T> {}
impl<T: TotalOrder> PartialEq for GraphCell<T> {
    fn eq(&self, other: &Self) -> bool {
        matches!(self.cmp(other), Ordering::Equal)
    }
}
impl<T: TotalOrder> PartialOrd for GraphCell<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}
impl<T: TotalOrder> Ord for GraphCell<T> {
    fn cmp(&self, other: &Self) -> Ordering {
        match other.spill_elev.total_cmp(&self.spill_elev) {
            Ordering::Equal => other.label.cmp(&self.label),
            unequal => unequal,
        }
    }
}

fn fill_supergraph<T: TotalOrder + Default + FloatCore + Debug>(
    graph_grid: impl FillGrid<T>,
) -> RaiseGrid<T> {
    let supergraph = build_supergraph(&graph_grid);

    let mut graph_elevs = vec![T::default(); supergraph.spill_graph.len()];
    // So ideally this would be Zhou, but I guess we can just priority-queue (Barnes) our way out?
    // let mut pq = BinaryHeap::new();
    // // the edge: special watershed 0 (why 1? was something else 0?) is connected to all edges of the grid
    // for (&label, &spill_elev) in &supergraph.spill_graph[0] {
    //     pq.push(GraphCell { label, spill_elev });
    // }
    fill_graph(&supergraph.spill_graph, &mut graph_elevs);

    let mut res = HashMap::with_capacity(graph_grid.n_tiles());
    for (coord, offset) in supergraph.offsets {
        let fd = graph_grid.tile(&coord);
        let range = offset.0 as usize..offset.0 as usize + offset.1;
        // TODO: can we share references here in stead of vecs?
        res.insert(fd.tile_info.clone(), graph_elevs[range].to_vec());
    }
    res
}

pub struct GraphFillState<T> {
    processed: Vec<bool>,
    priority_queue: BinaryHeap<GraphCell<T>>,
}

impl<T: FloatCore + TotalOrder> GraphFillState<T> {
    pub fn new(size: usize) -> Self {
        Self {
            processed: vec![false; size],
            priority_queue: BinaryHeap::new(),
        }
    }

    pub fn priority_queue(&self) -> &BinaryHeap<GraphCell<T>> {
        &self.priority_queue
    }

    pub fn seed(&mut self, label: TLabel, spill_elev: T) {
        self.priority_queue.push(GraphCell { label, spill_elev });
    }

    /// Single step of depression filling
    ///
    /// Do the priority-queue depression filling. This is somewhat different from
    /// a normal depression filling, because the elevation is now captured on the
    /// edges, rather than that a cell has a single elevation. Since the priority
    /// queue still travels lowest-first, it will find elevations from the lowest
    /// possible direction. The lowest-path elevation for a cell is noted in graph_elevs
    pub fn step(&mut self, spill_graph: &[HashMap<TLabel, T>], graph_elevs: &mut [T]) -> bool {
        if let Some(cell) = self.priority_queue.pop() {
            for (&label, n_elev) in &spill_graph[cell.label as usize] {
                let l: usize = label.try_into().unwrap();
                // if we're re-visiting the cell, it has already flowed to the edge
                if self.processed[l] {
                    continue;
                }
                // take the maximum elevation, this will fill depressions
                //
                // we don't need to modify spill_graph: the spill elevation only
                // works for this watershed. Also we'll only visit every cell once
                let spill_elev = cell.spill_elev.max(*n_elev);
                graph_elevs[l] = spill_elev;
                self.processed[l] = true;
                // add cell to the priority queue
                self.priority_queue.push(GraphCell { label, spill_elev });
            }
            true
        } else {
            false
        }
    }
}

/// Depression-fill the graph
fn fill_graph<T: TotalOrder + Default + FloatCore>(
    spill_graph: &[HashMap<TLabel, T>],
    graph_elevs: &mut [T],
) {
    let mut state = GraphFillState::new(spill_graph.len());
    state.seed(0, T::min_value());
    while state.step(spill_graph, graph_elevs) {}
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
    fn test_build_supergraph_single_empty() {
        let meta = GridMeta::new(2, 2);
        let grid = VecFillGrid::new(
            GridMeta::new(1, 1),
            vec![FillData {
                tile_info: TileInfo {
                    tile_coord: (0, 0).into(),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 2, 3].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            }],
        );
        let supergraph = build_supergraph(&grid);
        assert_eq!(
            supergraph,
            SuperGraph {
                spill_graph: vec![HashMap::from([(1, 0.0)]), HashMap::from([(0, 0.0)])],
                offsets: HashMap::from([((0, 0).into(), (1, 1))])
            }
        )
    }

    #[test]
    fn test_build_supergraph_single_twolabels() {
        let meta = GridMeta::new(2, 2);
        let grid = VecFillGrid::new(
            GridMeta::new(1, 1),
            vec![FillData {
                tile_info: TileInfo {
                    tile_coord: (0, 0).into(),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::from([(1, 2.0)]), HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 2, 3].map(|v| v as f32)),
                label_edges: meta.edges(&[0, 0, 1, 1]),
            }],
        );
        let supergraph = build_supergraph(&grid);
        assert_eq!(
            supergraph,
            SuperGraph {
                spill_graph: vec![
                    HashMap::from([(1, 0.0), (2, 2.0)]),
                    HashMap::from([(0, 0.0), (2, 2.0)]),
                    HashMap::from([(0, 2.0), (1, 2.0)])
                ],
                offsets: HashMap::from([((0, 0).into(), (1, 2))])
            }
        )
    }

    #[test]
    fn test_build_supergraph_double_empty() {
        let meta = GridMeta::new(2, 2);
        let grid = vec![
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 4, 5].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[2, 3, 6, 7].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
        ];
        let supergraph = build_supergraph(&VecFillGrid {
            meta: GridMeta::new(2, 1),
            data: grid,
        });
        assert_eq!(
            supergraph,
            SuperGraph {
                spill_graph: vec![
                    HashMap::from([(1, 0.0), (2, 2.0)]),
                    HashMap::from([(0, 0.0), (2, 2.0)]),
                    HashMap::from([(0, 2.0), (1, 2.0)])
                ],
                offsets: HashMap::from([((0, 0).into(), (1, 1)), ((1, 0).into(), (2, 1))])
            }
        )
    }

    #[test]
    fn test_build_supergraph_quad_empty() {
        let meta = GridMeta::new(2, 2);
        let grid = vec![
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 4, 5].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[2, 3, 6, 7].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 1),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[8, 9, 12, 13].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 1),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[10, 11, 14, 15].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_range(7).end],
            },
        ];
        let supergraph = build_supergraph(&VecFillGrid {
            meta: GridMeta::new(2, 2),
            data: grid,
        });
        //   1      2
        // 0  1 | 2  3
        // 4  5 | 6  7
        // -----+-----    0
        // 8  9 |10 11
        //12  13|14 15
        //   3     4
        let spill_graph = vec![
            HashMap::from([(1, 0.0), (2, 2.0), (3, 8.0), (4, 11.0)]), // 0
            HashMap::from([(0, 0.0), (2, 2.0), (3, 8.0), (4, 10.0)]), // 1
            HashMap::from([(0, 2.0), (1, 2.0), (3, 9.0), (4, 10.0)]), // 2
            HashMap::from([(0, 8.0), (1, 8.0), (2, 9.0), (4, 10.0)]), // 3
            HashMap::from([(0, 11.0), (1, 10.0), (2, 10.0), (3, 10.0)]), // 4
        ];
        assert_eq!(supergraph.spill_graph(), &spill_graph);
        let offsets = HashMap::from([
            ((0, 0).into(), (1, 1)),
            ((1, 0).into(), (2, 1)),
            ((0, 1).into(), (3, 1)),
            ((1, 1).into(), (4, 1)),
        ]);
        assert_eq!(supergraph.offsets(), &offsets);
    }

    #[test]
    fn test_fill_graph_depression() {
        // not sure what type of graph we'd do that has like a depression... well... let's do the easiest 3-node one
        let graph = vec![
            HashMap::from([(1, 1.0)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[0.0, 1.0, 1.0]);
    }

    #[test]
    fn test_fill_graph_flat() {
        // This algorithm currently doesn't resolve flats, because we're sad
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[0.0, 0.5, 0.5]);
    }

    #[test]
    fn test_fill_graph_slope() {
        // no depressions
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 1.0)]),
            HashMap::new(),
        ];
        let mut elevs = vec![0.0; 3];
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[0.0, 0.5, 1.0]);
    }
}

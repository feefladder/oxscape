use std::collections::{BinaryHeap, HashMap};
use std::fmt::Debug;

use num_traits::float::{Float, TotalOrder};

use crate::TLabel;
use crate::depfill::GraphCell;
use crate::depfill::graph::SuperGraph;
use crate::depfill::grid::{FillGrid, RaiseGrid};

/// Counter for catchments in graph filling
///
/// This replaces the processed boolean mask in priority-filling catchments to
/// keep track of order. That way, the ?producer? can know which catchments are
/// downstream, so flat resolution can be done per tile
///
/// I doubt the number of catchments will exceed 4 billion anytime soon,
/// [hydrobasins](https://www.hydrosheds.org/products/hydrobasins) has ~1
/// million
pub type CatchmentCounter = u32;
/// Marker value for unprocessed graph node
pub const UNPROCESSED: u32 = u32::MAX;

/// Fill state of a grah filling process
///
/// Mostly useful for introspection and debuggin. Generally, this is not used
/// directly, but rather [`fill_graph`]
///
/// ```
/// # use std::collections::HashMap;
/// use oxscape_tile::depfill::GraphFillState;
/// // easiest 3-node one graph that has a depression
/// let spill_graph = vec![
///     HashMap::from([(1, 1.0)]),
///     HashMap::from([(2, 0.5)]),
///     HashMap::new(),
/// ];
/// let mut graph_elevs = vec![f64::MIN; 3];
/// let mut state = GraphFillState::new(spill_graph.len());
/// state.seed(0, f64::MIN);
/// while state.step(&spill_graph, &mut graph_elevs) {}
/// assert_eq!(&graph_elevs, &[f64::MIN, 1.0, 1.0]);
/// ```
#[derive(Debug, Clone)]
pub struct GraphFillState<T> {
    /// which nodes are processed
    ///
    /// maybe can make this a counter, so we can use depression filling to find a flow order?
    ///
    /// I think it's completely valid to have catchments D?-routed between each other
    ///
    /// u32 can have 4 billion catchments, guess that's enough?
    processed: Vec<CatchmentCounter>,
    priority_queue: BinaryHeap<GraphCell<T>>,
    current_count: CatchmentCounter,
}

impl<T: Float + TotalOrder> GraphFillState<T> {
    /// Create a new GraphFillState
    pub fn new(size: usize) -> Self {
        Self {
            processed: vec![UNPROCESSED; size],
            priority_queue: BinaryHeap::new(),
            current_count: 0,
        }
    }

    /// Consume self and return the resulting catchment order
    ///
    /// This is a rather rudimentary ordering
    pub fn into_processed(self) -> Vec<CatchmentCounter> {
        self.processed
    }

    /// Get immutable access to the priority queue for debugging/visualizing
    pub fn priority_queue(&self) -> &BinaryHeap<GraphCell<T>> {
        &self.priority_queue
    }

    /// Seed the graph with the given label and spill elevation.
    ///
    /// To properly fill, a graph should be seeded with all draining nodes. Typically, these are edge nodes.
    pub fn seed(&mut self, label: TLabel, spill_elev: T) {
        self.priority_queue.push(GraphCell::new(label, spill_elev));
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
            let my_vertex_num = cell.label as usize;
            if self.processed[my_vertex_num] != UNPROCESSED {
                return true;
            }
            graph_elevs[my_vertex_num] = cell.spill_elev;
            self.processed[my_vertex_num] = self.current_count;
            self.current_count += 1;

            for (&label, n_elev) in &spill_graph[cell.label() as usize] {
                let l: usize = label.try_into().unwrap();
                // if we're re-visiting the cell, it has already flowed to the edge
                if self.processed[l] != UNPROCESSED {
                    continue;
                }
                // take the maximum elevation, this will fill depressions
                //
                // we don't need to modify spill_graph: the spill elevation only
                // works for this watershed. Also we'll only visit every cell once
                let spill_elev = cell.spill_elev().max(*n_elev);
                // graph_elevs[l] = spill_elev;
                // self.processed[l] = true;
                // add cell to the priority queue
                self.priority_queue.push(GraphCell::new(label, spill_elev));
            }
            true
        } else {
            false
        }
    }
}

/// Fill a [`supergraph`]: a graph that is made from multiple per-tile graphs
/// and returns a [`RaiseGrid`]: A grid of raise elevations
///
///
pub fn fill_supergraph<T: TotalOrder + Default + Float + Debug>(
    graph_grid: impl FillGrid<T>,
) -> RaiseGrid<T> {
    let supergraph = SuperGraph::from_grid(&graph_grid).connect_edges(&graph_grid);

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

/// Depression-fill the graph
///
/// This assumes the first node is a special catchment that everything flows
/// towards. as such, this function seeds the alogoritm with `(0,
/// T::min_value())` to signify all water flows to the edge.
pub fn fill_graph<T: TotalOrder + Default + Float>(
    spill_graph: &[HashMap<TLabel, T>],
    graph_elevs: &mut [T],
) -> Vec<CatchmentCounter> {
    let mut state = GraphFillState::new(spill_graph.len());
    state.seed(0, T::min_value());
    while state.step(spill_graph, graph_elevs) {}
    state.into_processed()
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_fill_graph_depression() {
        // easiest 3-node one graph that has a depression
        let graph = vec![
            HashMap::from([(1, 1.0)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut elevs = vec![f64::MIN; 3];
        let flow_order = fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 1.0, 1.0]);
        assert_eq!(&flow_order, &[0, 1, 2]);
    }

    #[test]
    fn test_fill_graph_flat() {
        // This algorithm currently doesn't resolve flats, because we're sad
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut elevs = vec![f64::MIN; 3];
        let flow_order = fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 0.5]);
        assert_eq!(&flow_order, &[0, 1, 2]);
    }

    #[test]
    fn test_fill_graph_slope() {
        // no depressions
        let graph = vec![
            HashMap::from([(1, 0.5)]),
            HashMap::from([(2, 1.0)]),
            HashMap::new(),
        ];
        let mut elevs = vec![f64::MIN; 3];
        let flow_order = fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 1.0]);
        assert_eq!(&flow_order, &[0, 1, 2]);
    }

    #[test]
    fn test_fill_graph_square() {
        let graph = vec![
            HashMap::from([(1, 0.5), (2, 1.0)]),
            HashMap::from([(0, 0.5), (3, 1.0)]),
            HashMap::from([(0, 1.0), (3, 1.5)]),
            HashMap::from([(1, 1.0), (2, 1.5)]),
        ];
        let mut elevs = vec![f64::MIN; 4];
        let flow_order = fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 1.0, 1.0]);
        assert_eq!(&flow_order, &[0, 1, 2, 3]);
    }

    #[test]
    fn test_fill_graph_tet() {
        let graph = vec![
            HashMap::from([(1, 0.25), (2, 1.0), (3, 0.0)]),
            HashMap::from([(0, 0.25), (3, 1.0)]),
            HashMap::from([(0, 1.0), (3, 1.5)]),
            HashMap::from([(1, 1.0), (2, 1.5)]),
        ];
        let mut elevs = vec![f64::MIN; 4];
        let flow_order = fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.25, 1.0, 0.0]);
        assert_eq!(&flow_order, &[0, 2, 3, 1]);
    }
}

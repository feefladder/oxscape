use std::collections::{BinaryHeap, HashMap};
use std::fmt::Debug;

use num_traits::float::{FloatCore, TotalOrder};

use crate::TLabel;
use crate::fill_deps::GraphCell;
use crate::fill_deps::graph::SuperGraph;
use crate::fill_deps::grid::{FillGrid, RaiseGrid};

#[derive(Debug, Clone)]
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
            if self.processed[my_vertex_num] {
                return true;
            }
            graph_elevs[my_vertex_num] = cell.spill_elev;
            self.processed[my_vertex_num] = true;
            for (&label, n_elev) in &spill_graph[cell.label() as usize] {
                let l: usize = label.try_into().unwrap();
                // if we're re-visiting the cell, it has already flowed to the edge
                if self.processed[l] {
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

pub fn fill_supergraph<T: TotalOrder + Default + FloatCore + Debug>(
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
pub fn fill_graph<T: TotalOrder + Default + FloatCore>(
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

    #[test]
    fn test_fill_graph_depression() {
        // easiest 3-node one graph that has a depression
        let graph = vec![
            HashMap::from([(1, 1.0)]),
            HashMap::from([(2, 0.5)]),
            HashMap::new(),
        ];
        let mut elevs = vec![f64::MIN; 3];
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 1.0, 1.0]);
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
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 0.5]);
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
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 1.0]);
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
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 1.0, 1.0]);
    }

    #[test]
    fn test_fill_graph_tet() {
        let graph = vec![
            HashMap::from([(1, 0.5), (2, 1.0), (3, 0.0)]),
            HashMap::from([(0, 0.5), (3, 1.0)]),
            HashMap::from([(0, 1.0), (3, 1.5)]),
            HashMap::from([(1, 0.5), (2, 1.0)]),
        ];
        let mut elevs = vec![f64::MIN; 4];
        fill_graph(&graph, &mut elevs);
        assert_eq!(&elevs, &[f64::MIN, 0.5, 1.0, 0.0]);
    }
}

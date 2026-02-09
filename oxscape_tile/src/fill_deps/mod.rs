use std::cmp::Ordering;

use num_traits::float::TotalOrder;

use crate::TLabel;

pub mod fill;
pub mod fill_graph;
pub mod graph;
pub mod grid;

/// A struct that implements Ord in reverse order
#[derive(Debug, Clone)]
pub struct Cell<T> {
    pub x: usize,
    pub y: usize,
    pub z: T,
    /// Whether we are in the Region of Interest
    pub roi: bool,
}

impl<T: TotalOrder> PartialEq for Cell<T> {
    fn eq(&self, other: &Self) -> bool {
        matches!(self.cmp(other), Ordering::Equal)
    }
}
impl<T: TotalOrder> Eq for Cell<T> {}
/// reverse ordering for Cell based on z elevation.
/// BinaryHeap is a max-heap, so based on z-value, we should insert lowest z first
/// However, the roi should grow first on equality.
impl<T: TotalOrder> PartialOrd for Cell<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}
impl<T: TotalOrder> Ord for Cell<T> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // reverse ordering on z-value
        match other.z.total_cmp(&self.z) {
            // but roi takes precedence
            Ordering::Equal => self.roi.cmp(&other.roi),
            other => other,
        }
    }
}

/// Cell of a graph with reverse ordering for the priority queue
#[derive(Debug, Clone)]
pub struct GraphCell<T> {
    label: TLabel,
    spill_elev: T,
}

impl<T> GraphCell<T> {
    pub fn new(label: TLabel, spill_elev: T) -> Self {
        Self { label, spill_elev }
    }

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
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
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

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use oxscape_core::GridMeta;

    use crate::fill_deps::{
        fill::{FillData, fill_zhou_watersheds},
        graph::SuperGraph,
        grid::VecFillGrid,
    };

    use super::*;

    #[test]
    fn test_cell() {
        let a = Cell {
            x: 0,
            y: 0,
            z: 0.0,
            roi: true,
        };
        let b = Cell {
            x: 0,
            y: 0,
            z: 1.0,
            roi: true,
        };
        assert_eq!(a, a);
        assert_ne!(a, b);
        assert!(a > b);
        let a = Cell {
            x: 0,
            y: 1,
            z: 0.0,
            roi: true,
        };
        let b = Cell {
            x: 1,
            y: 0,
            z: 1.0,
            roi: true,
        };
        assert_ne!(a, b);
        assert!(a > b);
    }

    #[test]
    fn test_quad() {
        let dems = [[1, 1, 1, 0], [1, 1, 0, 1], [1, 0, 1, 1], [0, 1, 1, 1]];
        let meta = GridMeta::new(2, 2);
        let supermeta = GridMeta::new(2, 2);

        let mut filled_dems = Vec::with_capacity(dems.len());
        let mut all_labels = Vec::with_capacity(dems.len());
        let fill_grid = VecFillGrid::new(
            supermeta.clone(),
            dems.iter()
                .enumerate()
                .map(|(i, d)| {
                    let mut dem = d.map(|v| v as f32);
                    let (labels, spill_graph) = fill_zhou_watersheds(&meta, &mut dem);
                    let res = FillData::new(
                        supermeta.i_to_xy(i).into(),
                        meta.clone(),
                        spill_graph,
                        meta.edges(&dem),
                        meta.edges(&labels),
                    );
                    filled_dems.push(dem);
                    all_labels.push(labels);
                    res
                })
                .collect(),
        );

        // there were no depressions in individual tiles
        assert_eq!(filled_dems, dems.map(|t| t.map(|v| v as f32)));
        // and they're all one catchment
        assert_eq!(all_labels, &[[0; 4]; 4]);

        let supergraph = SuperGraph::from_grid(&fill_grid).connect_edges(&fill_grid);

        assert_eq!(
            supergraph.spill_graph(),
            &vec![
                HashMap::from([(1, 1.0), (2, 1.0), (3, 1.0), (4, 1.0)]),
                HashMap::from([(0, 1.0), (2, 0.0), (3, 0.0), (4, 0.0)]),
                HashMap::from([(0, 1.0), (1, 0.0), (3, 0.0), (4, 0.0)]),
                HashMap::from([(0, 1.0), (1, 0.0), (2, 0.0), (4, 0.0)]),
                HashMap::from([(0, 1.0), (1, 0.0), (2, 0.0), (3, 0.0)]),
            ]
        );

        let mut graph_elevs = vec![f32::MIN; supergraph.spill_graph().len()];
        crate::fill_deps::fill_graph::fill_graph(supergraph.spill_graph(), &mut graph_elevs);
        // the graph is now filled;
        for (tc, (start, len)) in supergraph.offsets() {
            let su = *start as usize;
            let spill_elevs = &graph_elevs[su..su + len];
            let idx = supermeta.xy_to_i(tc.x, tc.y);
            let tile = &mut filled_dems[idx];
            let labels = &all_labels[idx];
            for (z, label) in tile.iter_mut().zip(labels) {
                if *z < spill_elevs[*label as usize] {
                    *z = spill_elevs[*label as usize]
                }
            }
        }
        // the central depression is now filled
        assert_eq!(filled_dems, &[[1.0; 4]; 4]);
    }
}

//! Depression filling on tiled and normal dems
//!
//! This module contains depression filling for tiled dems. Non-tiled dems are
//! tiled dems with a single tile, so the main depression filling algorithm can
//! also be used for that.
//!
//! ```
//! use oxscape_core::GridMeta;
//! use oxscape_tile::depfill::{fill_zhou2016, fill_zhou_watersheds, VecFillGrid, fill_supergraph, NOT_FILLED, FillData, raise_catchments};
//! // the simple case: filling a simple dem
//! let mut dem = [
//!     1,2,2,2,
//!     2,0,0,2,
//!     2,0,0,2,
//!     2,2,2,2,
//! ].map(|v| v as f32);
//! fill_zhou2016(&GridMeta::new(4,4),&mut dem, &mut [NOT_FILLED;16]);
//! assert_eq!(&dem,&[
//!     1,2,2,2,
//!     2,1,1,2,
//!     2,1,1,2,
//!     2,2,2,2,
//! ].map(|v| v as f32));
//! // the more complex case: filling a tiled dem
//! let supermeta = GridMeta::new(2,2); // 2 tiles-by-2 tiles
//! let mut tiled_dem = [[
//!     1.0,2.0,
//!     2.0,0.0,
//! ],[
//!     2.0,2.0,
//!     0.0,2.0,
//! ],[
//!     2.0,0.0,
//!     2.0,2.0,
//! ],[
//!     0.0,2.0,
//!     2.0,2.0,
//! ]];
//! let mut tiled_labels = [[NOT_FILLED;4];4];
//! // this should all be made easier
//! let mut all_labels = Vec::with_capacity(tiled_dem.len());
//! let fill_datas = tiled_dem.iter_mut().zip(&mut tiled_labels).enumerate().map(|(idx,(dem, labels))| {
//!     // 2-by-2 tiles
//!     let tile_meta = GridMeta::new(2,2);
//!     let spill_graph = fill_zhou_watersheds(&tile_meta, dem, labels);
//!     let dem_edges = tile_meta.edges(dem);
//!     let label_edges = tile_meta.edges(labels);
//!     let tile_coord = supermeta.i_to_xy(idx);
//!     all_labels.push(labels);
//!     FillData::new(tile_coord.into(),tile_meta,spill_graph,dem_edges,label_edges)
//! }).collect();
//! println!("fill_datas: {fill_datas:?}");
//! let fill_grid = VecFillGrid::new(supermeta.clone(), fill_datas);
//! let raise_grid = fill_supergraph(fill_grid);
//! for (tile_info, graph_elevs) in raise_grid {
//!     let tile_idx = supermeta.xy_to_i(tile_info.xy().x,tile_info.xy().y);
//!     raise_catchments(&mut tiled_dem[tile_idx],all_labels[tile_idx],&graph_elevs);
//! }
//! assert_eq!(&tiled_dem, &[[
//!     1.0,2.0,
//!     2.0,1.0,
//! ],[
//!     2.0,2.0,
//!     1.0,2.0,
//! ],[
//!     2.0,1.0,
//!     2.0,2.0,
//! ],[
//!     1.0,2.0,
//!     2.0,2.0,
//! ]]);
//! ```

use std::cmp::Ordering;

use num_traits::float::TotalOrder;

use crate::TLabel;

mod fill;
pub use fill::{
    FillData, NOT_FILLED, ROI_FLAG, RidgePoint, ZhouFillState, fill_zhou_watersheds, fill_zhou2016,
    raise_catchments, watersheds_meet,
};
mod fill_graph;
pub use fill_graph::{GraphFillState, fill_graph, fill_supergraph};
mod graph;
pub use graph::{SpillGraph, SuperGraph};
mod grid;
pub use grid::{FillGrid, HashMapFillGrid, RaiseGrid, TileGrid, VecFillGrid};

/// A struct that implements Ord in reverse order
#[derive(Debug, Clone)]
pub struct Cell<T> {
    /// The cell's x-coordinate
    pub x: usize,
    /// The cell's y-coordinate
    pub y: usize,
    /// The height value
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
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
impl<T: TotalOrder> Ord for Cell<T> {
    fn cmp(&self, other: &Self) -> Ordering {
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
    /// Create a new graphcell for the label and spill elevation
    pub fn new(label: TLabel, spill_elev: T) -> Self {
        Self { label, spill_elev }
    }

    /// Get the label
    pub fn label(&self) -> TLabel {
        self.label
    }

    /// get spill elevation
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

    use crate::depfill::{
        fill::{FillData, fill_zhou_watersheds},
        fill_graph::fill_graph,
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
        let mut all_labels = [[NOT_FILLED; 4]; 4];
        let fill_grid = VecFillGrid::new(
            supermeta.clone(),
            dems.iter()
                .zip(&mut all_labels)
                .enumerate()
                .map(|(i, (d, labels))| {
                    let mut dem = d.map(|v| v as f32);
                    let spill_graph = fill_zhou_watersheds(&meta, &mut dem, labels);
                    let res = FillData::new(
                        supermeta.i_to_xy(i).into(),
                        meta.clone(),
                        spill_graph,
                        meta.edges(&dem),
                        meta.edges(labels),
                    );
                    filled_dems.push(dem);
                    res
                })
                .collect(),
        );

        // there were no depressions in individual tiles
        assert_eq!(filled_dems, dems.map(|t| t.map(|v| v as f32)));
        // and they're all one catchment
        assert_eq!(&all_labels, &[[0; 4]; 4]);

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
        fill_graph(supergraph.spill_graph(), &mut graph_elevs);
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

    #[test]
    fn test_doctest() {
        use crate::depfill::{
            FillData, NOT_FILLED, VecFillGrid, fill_supergraph, fill_zhou_watersheds,
            fill_zhou2016, raise_catchments,
        };
        use oxscape_core::GridMeta;
        // the simple case: filling a simple dem
        let mut dem = [1, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 2, 2, 2].map(|v| v as f32);
        fill_zhou2016(&GridMeta::new(4, 4), &mut dem, &mut [NOT_FILLED; 16]);
        assert_eq!(
            &dem,
            &[1, 2, 2, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2,].map(|v| v as f32)
        );
        // the more complex case: filling a tiled dem
        let supermeta = GridMeta::new(2, 2); // 2 tiles-by-2 tiles
        let mut tiled_dem = [
            [1.0, 2.0, 2.0, 0.0],
            [2.0, 2.0, 0.0, 2.0],
            [2.0, 0.0, 2.0, 2.0],
            [0.0, 2.0, 2.0, 2.0],
        ];
        let mut tiled_labels = [[NOT_FILLED; 4]; 4];
        // this should all be made easier
        let fill_datas = tiled_dem
            .iter_mut()
            .zip(&mut tiled_labels)
            .enumerate()
            .map(|(idx, (dem, labels))| {
                // 2-by-2 tiles
                let tile_meta = GridMeta::new(2, 2);
                let spill_graph = fill_zhou_watersheds(&tile_meta, dem, labels);
                let dem_edges = tile_meta.edges(dem);
                let label_edges = tile_meta.edges(labels);
                let tile_coord = supermeta.i_to_xy(idx);
                FillData::new(
                    tile_coord.into(),
                    tile_meta,
                    spill_graph,
                    dem_edges,
                    label_edges,
                )
            })
            .collect();
        let fill_grid = VecFillGrid::new(supermeta.clone(), fill_datas);
        let raise_grid = fill_supergraph(fill_grid);
        for (tile_info, graph_elevs) in raise_grid {
            let tile_idx = supermeta.xy_to_i(tile_info.xy().x, tile_info.xy().y);
            raise_catchments(
                &mut tiled_dem[tile_idx],
                &tiled_labels[tile_idx],
                &graph_elevs,
            );
        }
        assert_eq!(
            &tiled_dem,
            &[
                [1.0, 2.0, 2.0, 1.0,],
                [2.0, 2.0, 1.0, 2.0,],
                [2.0, 1.0, 2.0, 2.0,],
                [1.0, 2.0, 2.0, 2.0,]
            ]
        );
    }
}

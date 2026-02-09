//! Most things graph-related
//!
//! The graph, in depression-filling and flow accumulation determines how tiles connect to each
//! other so that the results can be passed back.
//!

use std::collections::HashMap;
use std::fmt::Debug;

use num_traits::float::FloatCore;
use oxscape_core::GridMeta;

use crate::fill_deps::grid::FillGrid;
use crate::{TLabel, tile::TileCoord};

pub type SpillGraph<T> = Vec<HashMap<TLabel, T>>;

/// graph of spill elevations that also keeps track of which ranges map to which tiles
#[derive(Debug, Clone, PartialEq)]
pub struct SuperGraph<T> {
    pub(super) spill_graph: SpillGraph<T>,
    pub(super) offsets: HashMap<TileCoord, (TLabel, usize)>,
}

impl<T> SuperGraph<T> {
    pub fn spill_graph(&self) -> &SpillGraph<T> {
        &self.spill_graph
    }

    pub fn offsets(&self) -> &HashMap<TileCoord, (TLabel, usize)> {
        &self.offsets
    }
}
impl<T: Copy + FloatCore + Debug> SuperGraph<T> {
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
    pub fn from_grid(fill_grid: &impl FillGrid<T>) -> Self {
        let total_size: usize = fill_grid.iter().map(|v| v.spill_graph.len()).sum::<usize>() + 1;
        let mut spill_graph: SpillGraph<T> = vec![HashMap::new(); total_size];
        let mut idx_offsets = HashMap::with_capacity(fill_grid.n_tiles());
        let mut idx_offset: TLabel = 1;
        for fd in fill_grid.iter() {
            let graph = &fd.spill_graph;
            for (idx, node) in graph.iter().enumerate() {
                for (neighbour, spill_elev) in node {
                    let my_label = idx as TLabel + idx_offset;
                    let n_label = neighbour + idx_offset;
                    // insert edges at the offset bidirectionally
                    spill_graph[my_label as usize].insert(n_label, *spill_elev);
                    spill_graph[n_label as usize].insert(my_label, *spill_elev);
                }
            }
            idx_offsets.insert(
                fd.tile_info.tile_coord,
                (idx_offset, fd.spill_graph().len()),
            );
            idx_offset += TLabel::try_from(graph.len()).unwrap();
        }
        SuperGraph {
            spill_graph: spill_graph,
            offsets: idx_offsets,
        }
    }

    pub fn connect_edges(mut self, fill_grid: &impl FillGrid<T>) -> Self {
        let idx_offsets = &mut self.offsets;
        let spill_graph = &mut self.spill_graph;
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
                        for n_offset in -1..=1 {
                            let Ok(n_edge_idx) = usize::try_from(edge_idx as isize + n_offset)
                            else {
                                continue;
                            };
                            if n_edge_idx >= n_labels.len() {
                                continue;
                            }
                            let my_label = my_labels[edge_idx] + idx_offsets[my_coord].0;
                            let n_label = n_labels[n_edge_idx]
                                + idx_offsets
                                    .get(&n_coord)
                                    .expect(&format!(
                                        "no offset for {n_coord:?}, offsets: {idx_offsets:?}"
                                    ))
                                    .0;
                            if my_label == n_label {
                                panic!("found a duplicate somehow");
                                // continue;
                            }
                            let spill_elev = my_elevs[edge_idx].max(n_elevs[n_edge_idx]);
                            if !spill_graph[my_label as usize].contains_key(&n_label) {
                                spill_graph[my_label as usize].insert(n_label, spill_elev);
                                spill_graph[n_label as usize].insert(my_label, spill_elev);
                            } else if spill_graph[my_label as usize][&n_label] > spill_elev {
                                spill_graph[my_label as usize].insert(n_label, spill_elev);
                                spill_graph[n_label as usize].insert(my_label, spill_elev);
                            }
                        }
                    }
                } else {
                    // otherwise, connect edges to special watershed 0 which represents the edge of the grid
                    for edge_idx in 0..my_labels.len() {
                        let my_label = my_labels[edge_idx] + idx_offsets[my_coord].0;
                        let spill_elev = my_elevs[edge_idx];
                        if !spill_graph[my_label as usize].contains_key(&0) {
                            spill_graph[my_label as usize].insert(0, spill_elev);
                            spill_graph[0].insert(my_label, spill_elev);
                        } else if spill_graph[my_label as usize][&0] > spill_elev {
                            spill_graph[my_label as usize].insert(0, spill_elev);
                            spill_graph[0].insert(my_label, spill_elev);
                        }
                    }
                }
            }
        }
        self
    }
}
#[cfg(test)]
mod test {
    use crate::{
        fill_deps::{fill::FillData, grid::VecFillGrid},
        tile::TileInfo,
    };

    use super::*;

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
                label_edges: vec![0; meta.skirt_size()],
            }],
        );
        let supergraph = SuperGraph::from_grid(&grid).connect_edges(&grid);
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
        let supergraph = SuperGraph::from_grid(&grid).connect_edges(&grid);
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
        let filldatas = vec![
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 4, 5].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[2, 3, 6, 7].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
        ];
        let grid = VecFillGrid::new(GridMeta::new(2, 1), filldatas);
        let supergraph = SuperGraph::from_grid(&grid).connect_edges(&grid);
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
    fn test_build_supergraph_double_diagonal() {
        let meta = GridMeta::new(2, 2);
        // 0 1|0 0
        // 0 0|1 0
        let filldatas = vec![
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 0, 0].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 0, 1, 0].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
        ];
        let grid = VecFillGrid::new(GridMeta::new(2, 1), filldatas);
        let supergraph = SuperGraph::from_grid(&grid).connect_edges(&grid);
        assert_eq!(
            supergraph,
            SuperGraph {
                spill_graph: vec![
                    HashMap::from([(1, 0.0), (2, 0.0)]),
                    HashMap::from([(0, 0.0), (2, 0.0)]),
                    HashMap::from([(0, 0.0), (1, 0.0)])
                ],
                offsets: HashMap::from([((0, 0).into(), (1, 1)), ((1, 0).into(), (2, 1))])
            }
        )
    }

    #[test]
    fn test_build_supergraph_quad_empty() {
        let meta = GridMeta::new(2, 2);
        let filldatas = vec![
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[0, 1, 4, 5].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 0),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[2, 3, 6, 7].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(0, 1),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[8, 9, 12, 13].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
            FillData {
                tile_info: TileInfo {
                    tile_coord: TileCoord::new(1, 1),
                    meta: meta.clone(),
                },
                spill_graph: vec![HashMap::new()],
                dem_edges: meta.edges(&[10, 11, 14, 15].map(|v| v as f32)),
                label_edges: vec![0; meta.skirt_size()],
            },
        ];
        let grid = VecFillGrid::new(GridMeta::new(2, 2), filldatas);
        let mut supergraph = SuperGraph::from_grid(&grid);
        assert_eq!(supergraph.spill_graph(), &vec![HashMap::new(); 5]);
        supergraph = supergraph.connect_edges(&grid);
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
}

//! Flat resolution
//!
//! Basically something ported-ish from barnes, but he just uses some A2Array2D
//! and that feels like it avoids the entire
//! solve-globally-so-only-need-load-from-cache-once optimization.
//!
//! Another way would be to have the flat resolution keep around information
//! about at which cell watersheds meet.
//!
//! then pass that into a `raise_catchments_and_resolve_flats` function. We
//! merge them so it saves io. Kind of sad about mixing state though, but... I
//! mean the alternative, and arguably kinda-easier approach is to re-run a bfs on the full dem?
//!
//! Oh well, anyways, I think we need to first solve this problem without tiles eh?
//!
//! The main problem is that a dem-with-flats needs a flat-resistant flow metric
//! or have a two-pass flow metric that doesn't re-assign flow to already-determined cells
//!
//! and if it is two-pass, which is easier implementation-wise and maybe not
//! that much more compute, then the global graph is not solving two problems at
//! the same time (i like).
//!
//! So is that a flowmets thing?
//! I think it is!
//!
//! So solved it for non-tiled case. Now when tiled, the minimum required
//! information for the global problem is actually exactly-sort-of what is
//! already there for depression filling:
//! main components needed are:
//! 1. edge elevations
//! 2. connectivity+spill elevations
//!
//! then we can basically say:
//!
//! 1. for each watershed, add all raised neighbours of the raised downstream watershed
//!
//! There is a small problem wrt. large depressions that flow parallel to a tile
//! edge, where directions would suddendly become perpendicular in the
//! neighbouring tile. Not sure how to solve that though...
//!
//! And there was a thing with skirted tiles or passing a double-edge to the
//! producer, since otherwise flow directions cannot be determined And afaik
//! edge flow is handled by the producer and it's just [`NO_FLOW`] at the
//! consumer's side. In other words: Edges flow directly off the grid and that's
//! fixed later.
//!
//! I think the double edge is more elegant compared to skirted tiles, since it
//! preserves the edges-are-handled-by-producer dynamic.

// I guess the first thing to do is sort of re-create the FillData-type struct,
// but then with all required information for the current "thing", Then once
// that is there, it's becoming a runtime problem to merge depfill step 2 and flatresolve step 1
// but ?maybe?
//
// aah I still don't know where to start if we're not filling depressions, they give so much useful information!
//
// The required data for determining flow directions on any flat is basically it's "level" in a region growing algorithm
//
// so... Yeah I think that's actually a useful piece of data to keep around.
// ah interesting stuff, because tiles completely mess up the edges-drain assumption
//

use std::collections::HashMap;
use std::fmt::Debug;

use num_traits::{Float, float::TotalOrder};
use oxscape_core::{Dir, GridMeta};

use crate::{
    TLabel, TileCoord, TileInfo,
    depfill::{FillGrid, SuperGraph, fill_graph},
};

// Data we want to pass down into tiles

/// For each tile, the downstream cells of a flat on the border
pub type FlatGrid = HashMap<TileInfo, FlatData>;

/// in-tile coordinates of seed cells
///
/// These are used for a region-growing process
pub type FlatData = Vec<usize>;

// data that is needed to determine the above

/// All per-tile data that is needed by the global problem solver to determine which cells should be seeded
pub struct FlatRequiredDataPlzImproveName<T> {
    pub(crate) tile_info: TileInfo,
    pub(crate) dem_edges: Vec<T>,
    pub(crate) label_edges: Vec<TLabel>,
    pub(crate) label_elevs: Vec<T>,
    pub(crate) label_order: Vec<TLabel>,
}

/// find connectivity and edge seeds of all tile-spanning flats
///
/// A flat is defined as:
/// - `elevation[i] <= graph_elevs[range][labels[i]]` (it is being filled)
/// a draining flat adds the requirement that there is a neighbour `n` such that:
/// - there is a draining edge in the spill graph to a neighbour cell e.g.
///   - supergraph.spill_graph[my_idx][n] exists, and:
///   - order[my_label] > order[n_label]
pub fn seed_superflat<T: TotalOrder + Default + Float + Debug>(
    graph_grid: &impl FillGrid<T>,
    supergraph: &SuperGraph<T>,
    order: &[u32],
    graph_elevs: &[T],
) -> FlatGrid {
    let offsets = supergraph.offsets();
    // there's just quite some magic involved getting those indices right
    // Code is adapted from supergraph.connect_edges
    let mut res = HashMap::with_capacity(graph_grid.n_tiles());
    for (my_coord, my_offset) in offsets {
        let fd = graph_grid.tile(&my_coord);
        let range = my_offset.0 as usize..my_offset.0 as usize + my_offset.1;

        let my_raise_elevs = &graph_elevs[range];

        let mut seed_indices = Vec::new();
        for dir in Dir::iter() {
            println!("checking {my_coord:?} in direction {dir:?}");
            let (my_labels, my_elevs) = graph_grid.edge(my_coord, dir);
            let my_offset = offsets[my_coord].0;

            // if we have a neighbour in this direction, check the above
            if let Some(n_coord) = graph_grid.neighbour(my_coord, dir) {
                println!("neighbour {n_coord:?} in dir {dir:?}");
                let (n_labels, n_elevs) = graph_grid.edge(&n_coord, dir.rev());
                let n_offset = offsets[&n_coord].0;

                for edge_idx in 0..my_labels.len() {
                    let cell_i = fd.tile_info.meta().edge_idx_to_i(dir, edge_idx);
                    println!("processing cell {cell_i}");
                    // - elevation[i] <= graph_elevs[range][labels[i]] (it is being filled)
                    if my_elevs[edge_idx] > my_raise_elevs[my_labels[edge_idx] as usize] {
                        println!("cell {cell_i} is not raised");
                        // this cell won't be raised, so it doesn't need to be filled
                        continue;
                    }
                    // check all neighbours of this cell if they have a draining catchment
                    // We visit diagonal and opposite neighbours
                    //
                    // you may think: But what about
                    // diagonals to corners? That is a special case in
                    // which both my_labels and n_labels are a length-1
                    // array, so it only takes the middle
                    //
                    // 0 1 2
                    //  \|/
                    // 0 1 2
                    for n_shift in -1..=1 {
                        //  0 1 2 ignore the \
                        // \|/    on this line
                        //  0 1 2 because -1 isn't usize
                        let Ok(n_edge_idx) = usize::try_from(edge_idx as isize + n_shift) else {
                            continue;
                        };

                        // 0 1 2  ignore the /
                        //    \|/ on this line
                        // 0 1 2  because it exceeds the edge
                        if n_edge_idx >= n_labels.len() {
                            continue;
                        }

                        let my_label = my_labels[edge_idx] + my_offset;
                        let n_label = n_labels[n_edge_idx] + n_offset;

                        // the neighbour cell needs to be lower than our raise elevation
                        //
                        // WHY??
                        // if n_elevs[n_edge_idx] >  {
                        //     println!("skipping {n_edge_idx} for cell {cell_i}");
                        //     // if the neighbour cell is higher, it could be that
                        //     // we are filling to their height, so in that case
                        //     // we also need to check if they are higher than our raise elevation
                        //     continue;
                        // }
                        //   - supergraph.spill_graph[my_idx][n] exists, and:
                        //   - order[my_label] > order[n_label]
                        if supergraph.spill_graph()[my_label as usize].contains_key(&n_label)
                            && order[my_label as usize] > order[n_label as usize]
                            && n_elevs[n_edge_idx] <= my_raise_elevs[my_labels[edge_idx] as usize]
                        {
                            // add this cell's tile index to the seed thing need
                            // to do smartness wrt. finding tile index from bla,
                            // but I think that's alltogether sad and we just
                            // want to use (x,y)-based indexing at this level?
                            // Or not... and add some magic function on
                            // `GridMeta`
                            println!("cell {cell_i} drains",);
                            seed_indices.push(cell_i);
                        } else {
                            println!(
                                "cell {cell_i} was not draining, because {:?} doesn't contain {n_label} or {} !> {} ",
                                supergraph.spill_graph()[my_label as usize],
                                order[my_label as usize],
                                order[n_label as usize]
                            );
                        }
                    }
                }
            } else {
                // depressions are draining
                // kind of always adding everything as seed cells?
                // actually no, we don't want everything as seed cells, only actually filled cells
                // (there is this edge rule that stops catchments from fragmenting, so an edge will have the same label for many non-filled cells)
                // I think that's fine because the growing algorithm only grows on flats
                for edge_idx in 0..my_labels.len() {
                    // - elevation[i] <= graph_elevs[range][labels[i]] (it is being filled)
                    if my_elevs[edge_idx] > my_raise_elevs[my_labels[edge_idx] as usize] {
                        // this cell won't be raised, so it doesn't need to be filled
                        continue;
                    }
                    seed_indices.push(fd.tile_info.meta().edge_idx_to_i(dir, edge_idx))
                }
            }
        }

        res.insert(fd.tile_info.clone(), seed_indices);
    }
    res
}

#[cfg(test)]
mod test {
    use std::collections::{BTreeSet, HashMap, HashSet};

    use oxscape_core::GridMeta;

    use super::*;
    use crate::{
        TileCoord, TileInfo,
        depfill::{FillData, SuperGraph, VecFillGrid},
    };

    #[test]
    #[rustfmt::skip]
    fn test_resolve_flats_single_edge() {
        let meta = GridMeta::new(5, 3);

        // upper tile (yes it's a single row)
        let ti00 = TileInfo::new((0, 0).into(), meta.clone());
        let dem00 = vec![
            1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 0.0, 1.0,
            1.0, 0.5,0.25,0.125,1.0,
        ];
        let l00 = vec![0;15];

        // top edge of the lower tile
        let ti01 = TileInfo::new((0, 1).into(), meta.clone());
        let dem01 = vec![
            1.0, 0.5,0.25,0.125,1.0,
            1.0, 0.0, 0.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 0.5,
        ];
        let l01 = vec![0; 15];

        let grid = VecFillGrid::new(
            GridMeta::new(1, 2),
            vec![
                FillData {
                    tile_info: ti00.clone(),
                    spill_graph: Vec::new(),
                    dem_edges: meta.edges(&dem00),
                    label_edges: meta.edges(&l00),
                },
                FillData {
                    tile_info: ti01.clone(),
                    spill_graph: Vec::new(),
                    dem_edges: meta.edges(&dem01),
                    label_edges: meta.edges(&l01),
                },
            ],
        );

        let supergraph = SuperGraph {
            spill_graph: vec![
                HashMap::new(), // special watershed 0
                HashMap::from([(2, 0.5)]), // 2 and 1 are connected
                HashMap::from([(1, 0.5)]), // 1 and 2 are connected
            ],
            offsets: HashMap::from([
                (TileCoord { x: 0, y: 0 }, (1, 1)),
                (TileCoord { x: 0, y: 1 }, (2, 1)),
            ]),
        };

        // top tile drains to bottom tile
        // reverse of visit order
        let order = vec![0, 2, 1];

        // spill elevation 0.5
        let graph_elevs = vec![f64::MIN, 0.5, 0.5];
        let flats = seed_superflat(&grid, &supergraph, &order, &graph_elevs);
        // the top tile spills into the bottom tile
        assert_eq!(
            BTreeSet::from_iter(flats[&ti00].iter().cloned()),
            BTreeSet::from([11, 12, 13])
        );
        // the bottom tile has a spill point on its bottom-left corner
        assert_eq!(
            BTreeSet::from_iter(flats[&ti01].iter().cloned()),
            BTreeSet::from([14])
        );

        // spill elevation 0.25
        let graph_elevs = vec![f64::MIN, 0.25, 0.25];
        let flats = seed_superflat(&grid, &supergraph, &order, &graph_elevs);
        assert_eq!(
            BTreeSet::from_iter(flats[&ti00].iter().cloned()),
            BTreeSet::from([12, 13])
        );
        // bottom-left corner doesn't spill now
        assert_eq!(
            BTreeSet::from_iter(flats[&ti01].iter().cloned()),
            BTreeSet::from([])
        );
    }

    #[test]
    #[rustfmt::skip]
    fn test_re_entrant() {
        let meta = GridMeta::new(7, 3);
        let ti00 = TileInfo::new((0,0).into(), meta.clone());
        let dem00 = [
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
        ];
        //   0    1   2   3   4   5   6
        //   7    8   9  10  11  12  13
        //  14   15  16  17  18  19  20
        let l00 = [
             0,  0,  0,  0,  1,  1,  1,
             0,  0,  0,  0,  1,  1,  1,
             0,  0,  0,  0,  1,  1,  1,
        ];

        let ti01 = TileInfo::new((0,1).into(), meta.clone());
        let dem01 = [
            0.5,1.0,1.0,0.2,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
        ];

        let l01 = [
              0,  0,  1,  1,  1,  2,  2,
              0,  0,  1,  1,  1,  2,  2,
              2,  2,  2,  2,  2,  2,  2,
        ];
        // re-entrant case should be fine, because we have access to labels and
        // only seed edge cells that hug a neighbouring downstream label

        let grid = VecFillGrid::new(
            GridMeta::new(1, 2),
            vec![
                FillData {
                    tile_info: ti00.clone(),
                    spill_graph: Vec::new(),
                    dem_edges: meta.edges(&dem00),
                    label_edges: meta.edges(&l00),
                },
                FillData {
                    tile_info: ti01.clone(),
                    spill_graph: Vec::new(),
                    dem_edges: meta.edges(&dem01),
                    label_edges: meta.edges(&l01),
                },
            ],
        );

        let supergraph = SuperGraph {
            spill_graph: vec![
                HashMap::new(), // special watershed 0
                // tile 00 has two labels
                HashMap::from([(3, 0.5),(4, 0.2)]), // 2 and 1 are connected
                HashMap::from([(4, 0.2)]),
                // tile 01 has four labels starting from 3
                HashMap::from([(1, 0.5)]), // 1 and 2 are connected
                HashMap::from([(3, 0.2),(1, 0.2)]), // 2 => 5
                HashMap::new(),
            ],
            offsets: HashMap::from([
                (TileCoord { x: 0, y: 0 }, (1, 2)),
                (TileCoord { x: 0, y: 1 }, (3, 3)),
            ]),
        };

        // zig-zag across the edge
        //      0\  1\
        // 0->0/  1/  2
        let order = vec![0, 2, 4, 1, 3, 5];

        // spill elevation 0.5
        let graph_elevs = vec![f64::MIN, 0.5, 0.5, 0.5, 0.5, 0.5];
        let flats = seed_superflat(&grid, &supergraph, &order, &graph_elevs);
        assert_eq!(
            BTreeSet::from_iter(flats[&ti00].iter().cloned()),
            BTreeSet::from([15,18])
        );
    }
}

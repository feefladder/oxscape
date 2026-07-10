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
    TLabel, TileInfo,
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
/// Currently re-runs catchment-level depression filling in order to get catchment connectivity
pub fn seed_superflat<T: TotalOrder + Default + Float + Debug>(
    graph_grid: impl FillGrid<T>,
) -> FlatGrid {
    let supergraph = SuperGraph::from_grid(&graph_grid).connect_edges(&graph_grid);
    let mut graph_elevs = vec![T::default(); supergraph.spill_graph().len()];
    let order = fill_graph(&supergraph.spill_graph(), &mut graph_elevs);

    // now the algorithm!
    //
    // At this point, a flat is defined as:
    // - elevation[i] <= graph_elevs[range][labels[i]] (it is being filled)
    // a draining flat adds the requirement that there is a neighbour `n` such that:
    // - there is a draining edge in the spill graph to a neighbour cell e.g.
    //   - supergraph.spill_graph[my_idx][n] exists, and:
    //   - order[my_label] > order[n_label]
    // there's just quite some magic involved getting those indices right
    // so let's copy over the connect_edges code here!
    let mut res = HashMap::with_capacity(graph_grid.n_tiles());
    for (my_coord, my_offset) in supergraph.offsets() {
        let fd = graph_grid.tile(&my_coord);
        let range = my_offset.0 as usize..my_offset.0 as usize + my_offset.1;

        let my_raise_elevs = &graph_elevs[range];

        let mut seed_indices = Vec::new();
        for dir in Dir::iter() {
            let (my_labels, my_elevs) = graph_grid.edge(my_coord, dir);
            let my_offset = supergraph.offsets()[my_coord].0;

            // if we have a neighbour in this direction, check the above
            if let Some(n_coord) = graph_grid.neighbour(my_coord, dir) {
                let (n_labels, n_elevs) = graph_grid.edge(&n_coord, dir.rev());
                let n_offset = supergraph.offsets()[&n_coord].0;

                for edge_idx in 0..my_labels.len() {
                    // - elevation[i] <= graph_elevs[range][labels[i]] (it is being filled)
                    if my_elevs[edge_idx] > my_raise_elevs[my_labels[edge_idx] as usize] {
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

                        // the neighbour cell needs to be lower
                        if n_elevs[n_edge_idx] > my_elevs[edge_idx] {
                            continue;
                        }
                        //   - supergraph.spill_graph[my_idx][n] exists, and:
                        //   - order[my_label] > order[n_label]
                        if supergraph.spill_graph()[my_label as usize].contains_key(&n_label)
                            && order[my_label as usize] > order[n_label as usize]
                        {
                            // add this cell's tile index to the seed thing need
                            // to do smartness wrt. finding tile index from bla,
                            // but I think that's alltogether sad and we just
                            // want to use (x,y)-based indexing at this level?
                            // Or not... and add some magic function on
                            // `GridMeta`

                            seed_indices.push(fd.tile_info.meta().edge_idx_to_i(dir, edge_idx))
                        }
                    }
                }
            } else {
                // depressions are draining
                // kind of always adding everything as seed cells?
                // I think that's fine because the growing algorithm only grows on flats
                for edge_idx in 0..fd.tile_info.meta().skirt_range(dir).len() {
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
    #[test]
    fn test_edge() {
        // so this here is a draining bottom edge. it flows into the catchment
        // with a global spill elevation of `0.5` Therefore, the middle three cells should be marked as seed cells
        let edge = vec![1.0, 0.5, 0.25, 0.125, 1.0];

        // for "clarity", labels are global here.
        let labels = vec![0, 0, 0, 0, 0, 0];
        // these are needed to show that they all drain to the same catchment
        let bottom_neighbour_labels = vec![1, 1, 1, 1, 1];
        // label 0 is later than label 1, so 1->0 (1 receives from 0; 0 drains into 1, flow accumulation is in reverse order);
        let label_order = vec![1, 0];

        let label_elevs = vec![0.5];
        let expected = vec![1, 2, 3];
        // however, if spill elevation was 0.25
        let label_elevs = vec![0.25];
        let expected = vec![2, 3];
    }

    #[test]
    #[rustfmt::skip]
    fn test_bad() {
        // example of a hostile dem:
        // the two
        let dem = [
            [
                1.0,0.5,1.0,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
            ],
            [
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,1.0,1.0,1.0,
            ]
        ];
        let raised = [
            [
                1.0,0.5,1.0,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
            ],
            [
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,1.0,1.0,1.0,
            ]
        ];
        // and now the top edge of tile 1 will be rather arbitrarily flowing to
        // either the left or right.
        //
        // That's kind of fine because people ignore lake dynamics?
        // but actually not fine...
        //
        // The answer is that both top cells have to be added to the queue
        // that's doable
    }

    #[test]
    #[rustfmt::skip]
    fn test_ugly() {
        // example of a hostile dem:
        // the bottom edge of top tile has unequal levels.
        let dem = [
            [
                1.0,1.0,1.0,1.0,1.0,
                1.0,0.2,0.2,0.2,1.0,
                0.5,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
            ],
            [
                1.0,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
                1.0,1.0,1.0,1.0,1.0,
            ]
        ];
        let raised = [
            [
                1.0,1.0,1.0,1.0,1.0,
                1.0,0.5,0.5,0.5,1.0,
                0.5,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
            ],
            [
                1.0,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
                1.0,1.0,1.0,1.0,1.0,
            ]
        ];
        // and now the top edge of tile 1 will have seeds that should be on
        // different levels. That's kinda bad, but maybe we can accept that?
        //
    }

    #[test]
    #[rustfmt::skip]
    fn test_re_entrant() {
        let dem = [[
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
        ],[
            0.5,1.0,1.0,0.2,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
        ]];
        let filled = [[
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,0.5,0.5,1.0,0.5,0.5,1.0,
            1.0,0.5,0.5,1.0,0.5,0.5,1.0,
        ],[
            0.5,1.0,1.0,0.5,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
        ]];
        // re-entrant case should be fine, because we have access to labels and
        // only seed edge cells that hug a neighbouring downstream label

    }
}

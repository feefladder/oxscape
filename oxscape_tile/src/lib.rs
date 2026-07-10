//! Tile-based parallel hydrology algorithms
//!
//! As it says in the title, this sub-crate implements tile-based hydrology
//! algorithms. Depression filling and single-flow directions are near-direct ports of Barnes (2016, 2017), while
//! adding multiple flow directions and support for non-linear algorithms are original work.
//!
//!
//! ## References
//!
//! - Barnes, R. (2016). Parallel Priority-Flood Depression Filling For Trillion Cell Digital Elevation Models On Desktops Or Clusters. Computers & Geosciences, 96, 56–68. https://doi.org/10.1016/j.cageo.2016.07.001
//! - Barnes, R. (2017). Parallel non-divergent flow accumulation for trillion cell digital elevation models on desktops or clusters. Environmental Modelling & Software, 92, 202–212. https://doi.org/10.1016/j.envsoft.2017.02.022
//!

use num_traits::float::Float;
use oxscape_core::GridMeta;

pub mod consumer;

pub mod producer;
mod tile;
pub use tile::{TileCoord, TileInfo};

pub mod depfill;
pub mod flow_accum;
pub mod resolve_flats;

/// The labels used for identifying watersheds
pub type TLabel = u32;

#[warn(missing_docs)]

/// Gets a new label
#[allow(unused)]
fn get_new_label<T: Float>(
    meta: &GridMeta,
    x: usize,
    y: usize,
    dem: &[T],
    labels: &[u32],
    current_label: &mut TLabel,
) -> TLabel {
    let n = meta.xy_to_i(x, y);
    // if we already have a label, that's the one
    if labels[n] != 0 {
        labels[n]
    } else {
        // otherwise, we can take a label from a neighbouring lower or equal cell, since we'll flow into that
        // ...except in the roi case, where we only want upslope cells
        for dir in 0..8 {
            let Some(nn) = meta.try_shift(x, y, dir) else {
                continue;
            };
            // that should work here, if we change it to strict
            if labels[nn] != 0 && dem[nn] < dem[n] {
                return labels[nn];
            }
        }
        *current_label += 1;
        *current_label
    }
}

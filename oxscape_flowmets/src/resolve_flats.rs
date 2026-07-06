//! Flat resolution for multi- and single flow directions!
//!
//! If your DEM has flats and no depressions, these will fix them
//!
//! ```
//! let ugly_dem = [
//!  1.5,1.0,1.5,
//!  1.6,0.5,1.6,
//!  1.7,0.6,1.7,
//!  1.8,1.9,1.8
//! ];
//! // this gets filled to
//! let filled_dem = [
//!  1.5,1.0,1.5,
//!  1.6,1.0,1.6,
//!  1.7,1.0,1.7,
//!  1.8,1.9,1.8
//! ];
//! // at which point there's no sensible direction for the middle two cells.
//! // The intuitive thing would be to route them northwards, because we do a BFS starting at the edge
//! ```
//!
//! For the single flow direction case, I think we can get away with a normal
//! queue that adds all strictly higher cells without adding a flow direction,
//! and then add flow directions on perfect equality. That's rare enough on
//! floats that it's safe to assume it's a depression.
//!
//! Even though when traversing the flat, it's very well possible that we find
//! cells that also have a drain? is it?
//!

use std::collections::VecDeque;
use std::fmt::Debug;

use num_traits::Float;
use oxscape_core::GridMeta;

/// A level in this sense is a depression cell's distance-to-drain.
///
/// let's say Earth is 40000km = 4e8 m, so u32 (4e9) would allow for .1m-scale
/// cells. Maybe better approximation would be size of the caspian sea, which is ~1e3 km = 1e6m, so u32 would allow millimeter-precision pixels?
pub type TLevel = u32;
/// This signals that a cell is not processed
const UNPROCESSED: TLevel = u32::MAX;

/// Resolve flats where the shortest path to _any_ outlet is where it flows.
///
/// This is a step away from mflow flat resolution, that's  why it's here. It seeds the
pub fn resolve_flats_shortest_distance<TElev: Float + Sync>(
    meta: &GridMeta,
    dem: &[TElev],
    receivers: &mut [u8],
) {
    // seed the simulation with all draining cells that are part of a flat
    // e.g. there is a neighbour such that dem[ni] == dem[i] and there is a neighbour such that dem[ni] < dem[i]
    // Since these are draining cells, their flow can be determined by normal flow direction algorithms, any unvisited cells they go to
    todo!()
}

pub mod sflow {
    use super::*;
    /// Resolve flats, where the drainage cells are already seeded.
    ///
    /// For D8-based flow routing, these can be obtained as a by-product from
    /// depression filling.
    pub fn resolve_flats_seeded<TElev: Float + Sync>(
        meta: &GridMeta,
        dem: &[TElev],
        receivers: &mut [u8],
        front: &mut VecDeque<usize>,
        levels: &mut [TLevel],
    ) {
        levels.fill(UNPROCESSED);
        let mut current_level = 0;

        for &seed in front.iter() {
            levels[seed] = current_level;
        }

        // level-based thing
        while !front.is_empty() {
            let level_size = front.len();
            current_level += 1;
            for _ in 0..level_size {
                let current_cell = front.pop_front().unwrap();
                println!("processing {current_cell}");
                let (x, y) = meta.i_to_xy(current_cell);
                for dir in 0..8 {
                    let Some(ni) = meta.try_shift(x, y, dir) else {
                        continue;
                    };
                    // other cell flows here iff elevation is the same and higher level
                    // [`UNPROCESSED`] is conveniently the highest possible level
                    if dem[ni] == dem[current_cell] && levels[ni] > current_level {
                        println!("adding {ni}");
                        receivers[ni] = GridMeta::rev(dir as usize) as u8;
                        levels[ni] = current_level;
                        front.push_back(ni);
                    } else {
                        println!("ignoring {ni}");
                    }
                }
            }
            println!("finished level {current_level} with queue: {front:?}");
        }
    }
}

pub mod mflow {
    use std::cmp::Ordering;

    use oxscape_core::Flow;

    use super::*;
    /// Resolve flats, where the drainage cells are already seeded.
    ///
    /// For D8-based flow routing, these can be obtained as a by-product from
    /// depression filling.
    pub fn resolve_flats_seeded<TElev: Float + Sync, TFlow: Flow + Debug>(
        meta: &GridMeta,
        dem: &[TElev],
        receivers: &mut [[TFlow; 8]],
        front: &mut VecDeque<usize>,
        levels: &mut [TLevel],
    ) {
        levels.fill(UNPROCESSED);
        let mut current_level = 0;

        for &seed in front.iter() {
            levels[seed] = current_level;
        }

        // level-based thing
        while !front.is_empty() {
            let level_size = front.len();
            current_level += 1;
            for _ in 0..level_size {
                let current_cell = front.pop_front().unwrap();
                let (x, y) = meta.i_to_xy(current_cell);
                for dir in 0..8 {
                    let Some(ni) = meta.try_shift(x, y, dir) else {
                        continue;
                    };
                    // other cell flows here iff elevation is the same and higher level
                    // [`UNPROCESSED`] is conveniently the highest possible level
                    if dem[ni] == dem[current_cell] {
                        match levels[ni].cmp(&current_level) {
                            Ordering::Greater => {
                                receivers[ni][GridMeta::rev(dir as usize)] = TFlow::one();
                                levels[ni] = current_level;
                                front.push_back(ni);
                            }
                            Ordering::Equal => {
                                // visiting an already visited cell. Add self and normalize
                                let recs = &mut receivers[ni];
                                recs[GridMeta::rev(dir as usize)] = TFlow::one();
                                let nrec = recs.iter().filter(|r| **r != TFlow::no_flow()).count();
                                let c = TFlow::one() / TFlow::from(nrec).unwrap();
                                recs.iter_mut()
                                    .filter(|w| **w != TFlow::no_flow())
                                    .for_each(|w| *w = c);
                            }
                            Ordering::Less => {}
                        }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod test {
    use oxscape_core::{Flow, NO_FLOW};

    use super::*;

    #[test]
    #[rustfmt::skip]
    fn test_sresolve_flats_seeded() {
        let dem = [
           1.5,1.0,1.5,
           1.6,1.0,1.6,
           1.7,1.0,1.7,
           1.8,1.9,1.8
        ];
        let mut receivers = [NO_FLOW; 12];
        let mut front = VecDeque::from([1]);
        let mut levels = [UNPROCESSED; 12];
        sflow::resolve_flats_seeded(&GridMeta::new(3,4), &dem, &mut receivers, &mut front, &mut levels);
        assert_eq!(receivers, [
            NO_FLOW,NO_FLOW,NO_FLOW,
            NO_FLOW,      2,NO_FLOW,
            NO_FLOW,      2,NO_FLOW,
            NO_FLOW,NO_FLOW,NO_FLOW,
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_sresolve_flats_seeded_tworow() {
        let dem = [
           1.5,1.0,1.0,1.5,
           1.6,1.0,1.0,1.6,
           1.7,1.0,1.0,1.7,
           1.8,1.9,1.9,1.8,
        ];
        let mut receivers = [NO_FLOW; 16];
        let mut front = VecDeque::from([1]);
        let mut levels = [UNPROCESSED; 16];
        sflow::resolve_flats_seeded(&GridMeta::new(4,4), &dem, &mut receivers, &mut front, &mut levels);
        assert_eq!(receivers, [
            NO_FLOW,NO_FLOW,      0,NO_FLOW,
            NO_FLOW,      2,      1,NO_FLOW,
            NO_FLOW,      3,      2,NO_FLOW, // 3 is kinda arbitrary and decided by visiting order
            NO_FLOW,NO_FLOW,NO_FLOW,NO_FLOW,
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_mresolve_flats() {
        let dem = [
           1.5,1.0,1.0,1.5,
           1.6,1.0,1.0,1.6,
           1.7,1.0,1.0,1.7,
           1.8,1.9,1.9,1.8,
        ];
        let mut flows = [[<f64 as Flow>::no_flow();8]; 16];
        let mut front = VecDeque::from([1]);
        let mut levels = [UNPROCESSED; 16];
        mflow::resolve_flats_seeded(&GridMeta::new(4,4), &dem, &mut flows, &mut front, &mut levels);
        assert_eq!(flows, [
            [0.0;8],[0.0;8],[1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0;8],
            [0.0;8],[0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0],[0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0;8],
            [0.0;8],[0.0,0.0,0.5,0.5,0.0,0.0,0.0,0.0],[0.0,0.5,0.5,0.0,0.0,0.0,0.0,0.0],[0.0;8], // 3 is kinda arbitrary
            [0.0;8],[0.0;8],[0.0;8],[0.0;8],
        ]);
    }
}

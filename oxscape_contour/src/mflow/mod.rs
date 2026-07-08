//! Multiflow graph traversal.
//!
//! These are slgihtly less efficient than single flow, since eight floats are
//! needed for each cell's receivers.

mod flow_order;

pub use flow_order::{ContourAccessor, FlowMetric, FlowOrder};

#[cfg(feature = "metrics")]
pub mod metrics;

use exn::OptionExt;
use rayon::prelude::*;

use crate::{ContourError, NOT_A_DONOR};
use oxscape_core::{Flow, GridMeta, Result};

/// Compute donors array from flows.
///
/// Donors are the opposite of receivers. A cell receives flow from its donor. A cell donates flow to its receiver.
///
/// Fills the donors array with [`NOT_A_DONOR`] and puts the array index of donating cells in `donors[idx][dir]`
#[allow(clippy::cast_possible_truncation)] // cast 0..8 to u8
pub fn compute_donors<TFlow: Flow>(
    meta: &GridMeta,
    flows: &[[TFlow; 8]],
    donor: &mut [[usize; 8]],
) {
    assert!(meta.check(flows).is_ok());
    assert!(meta.check(donor).is_ok());
    donor.fill([NOT_A_DONOR; 8]);
    donor.par_iter_mut().enumerate().for_each(|(i, don)| {
        let (x, y) = meta.i_to_xy(i);
        for (dir, the_don) in don.iter_mut().enumerate().take(8) {
            let Some(i_rec) = meta.try_shift(x, y, dir as u8) else {
                continue;
            };
            // SAFETY: this is an invariant on which ContourAccessors access data
            // - `&arr[donors[dir]]` when `donors[dir]!=NOT_A_DONOR` is sound
            if flows[i_rec][GridMeta::rev(dir)] != TFlow::no_flow() {
                *the_don = i_rec;
            }
        }
    });
}

///Cells must be ordered so that they can be traversed such that higher cells
///are processed before their lower neighbouring cells. This method creates
///such an order. It also produces a list of "levels": cells which are,
///topologically, neither higher nor lower than each other. Cells in the same
///level can all be processed simultaneously without having to worry about
///race conditions.
pub fn generate_order(
    nrec: &mut [u8],
    donor: &[[usize; 8]],
    stack: &mut Vec<usize>,
    levels: &mut Vec<usize>,
) -> Result<(), ContourError> {
    stack.clear();
    levels.clear();

    // The first level starts at zero
    levels.push(0);

    // Add cells that don't give flow as the first level
    for (idx, n_receivers) in nrec.iter().enumerate() {
        if *n_receivers == 0 {
            stack.push(idx);
        }
    }
    let mut level_bottom = 0; // first cell of current level
    let mut level_top = stack.len(); // last cell of current level

    levels.push(level_top);

    // full BFS search, but we fill an array, so later it can be done in parallel
    while level_bottom < level_top {
        for si in level_bottom..level_top {
            let c = stack[si];
            // load donating cells of focal cell into the stack
            for k in 0..8 {
                let n = donor[c][k];
                if n == NOT_A_DONOR {
                    continue;
                }
                // counter so we only add on the last visit
                nrec[n] = nrec[n].checked_sub(1).ok_or_raise(|| {
                    ContourError::invalid_metric("number of receivers exhausted")
                })?;
                if nrec[n] == 0 {
                    stack.push(n);
                }
            }
        }
        level_bottom = level_top; // start at the previous level
        level_top = stack.len(); // and process all cells that were added

        levels.push(level_top);
    }
    // we've added the last level twice, so pop it
    levels.pop();
    Ok(())
}

#[cfg(test)]
pub(crate) mod test {
    use super::*;

    #[rustfmt::skip]
    pub(crate) mod consts {
    pub const _H_2:[f64;4] = [
        0.0,1.0,
        2.0,3.0
    ];
    pub const H_3:[f64;9] = [
        0.0,1.0,2.0,
        3.0,4.0,5.0,
        6.0,7.0,8.0,
    ];
    pub const H_4: [f64;16] = [
        0.0,1.0,2.0,3.0,
        3.0,4.0,5.0,6.0,
        6.0,7.0,8.0,9.0,
        9.0,10.,11.,12.,
    ];
    } // mod consts

    #[test]
    #[rustfmt::skip]
    fn test_multiflow() {
        let _h = [
            0.0,1.0,
            2.0,3.0
        ];
        let mut nrec = [
            0,1,
            2,2,
        ];
        const N: usize = NOT_A_DONOR;
        let donor = [
        //  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]
            [1,2,N,N,N,N,N,N], [2,3,N,N,N,N,N,N],
            [3,N,N,N,N,N,N,N], [N,N,N,N,N,N,N,N],
        ];
        let stack = [
            0,1,2,3
        ];
        let levels = [
            0,1,2,3,4,
        ];
        let mut s = vec![0;stack.len()];
        let mut contours = Vec::with_capacity(5);
        generate_order(&mut nrec, &donor, &mut s, &mut contours).unwrap();
        assert_eq!(contours, levels);
        assert_eq!(s, stack);
        for l in 0..contours.len()-1 {
            assert_eq!(s[contours[l]..contours[l+1]], stack[levels[l]..levels[l+1]]);
        }
    }

    #[test]
    #[rustfmt::skip]
    fn test_multiflow_3() {
        let _h = [
            0.0,1.0,2.0,
            3.0,4.0,5.0,
            6.0,7.0,8.0,
        ];
        let mut nrec = [
            0,1,1,
            2,4,3,
            2,4,3,
        ];
        const N: usize = NOT_A_DONOR;
        let donor = [
        //  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]
            [1,3,4,N,N,N,N,N], [2,3,4,5,N,N,N,N], [4,5,N,N,N,N,N,N],
            [4,6,7,N,N,N,N,N], [5,6,7,8,N,N,N,N], [7,8,N,N,N,N,N,N],
            [7,N,N,N,N,N,N,N], [8,N,N,N,N,N,N,N], [N,N,N,N,N,N,N,N],
        ];
        let stack = [
            0,1,2,3,4,5,6,7,8
        ];
        let levels = [
            0,1,2,4,5,7,8,9,
        ];
        let mut s = vec![0;stack.len()];
        let mut contours = Vec::with_capacity(8);
        generate_order(&mut nrec, &donor, &mut s, &mut contours).unwrap();
        assert_eq!(contours, levels);
        assert_eq!(s, stack);
        for l in 0..contours.len()-1 {
            println!("{:?}",&s[contours[l]..contours[l+1]]);
            assert_eq!(s[contours[l]..contours[l+1]], stack[levels[l]..levels[l+1]]);
        }
    }
}

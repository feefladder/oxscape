use anyhow::{Result, anyhow};
use num_traits::{Float, Zero};
use rayon::prelude::*;
use std::ops::Range;
use std::{cell::UnsafeCell, f64::consts::FRAC_PI_4};

use crate::{Bazooka, GridMeta, Params, XSHIFT, YSHIFT};

//Table 1 of Tarboton (1997)
// 3 2 1
// 4   0
// 5 6 7
//             Column #  =   0    1    2    3    4    5   6    7
// const int    dy_e1[8] = { 0 , -1 , -1 ,  0 ,  0 ,  1 , 1 ,  0 };
// const int    dx_e1[8] = { 1 ,  0 ,  0 , -1 , -1 ,  0 , 0 ,  1 };
// 3 2 1                     0    2    2    4    4    6   6    0
// 4   0
// 5 6 7                     1    1    3    3    5    5   7    7
// const int    dy_e2[8] = {-1 , -1 , -1 , -1 ,  1 ,  1 , 1 ,  1 };
// const int    dx_e2[8] = { 1 ,  1 , -1 , -1 , -1 , -1 , 1 ,  1 };
// const double ac[8]    = { 0.,  1.,  1.,  2.,  2.,  3., 3.,  4.};
// const double AF[8]    = { 1., -1.,  1., -1.,  1., -1., 1., -1.};

//I remapped the foregoing table for ease of use with RichDEM. The facets
//are renumbered as follows:
//    3->1    2->2    1->3    0->4    7->5    6->6    5->7    4->8
//This gives the following table
//  Remapped Facet #  =  -   1    2     3    4    5   6    7    8
//  Tarboton Facet #  =  -   3    2     1    0    7   6    5    4
const DY_E1: [isize; 8] = [0, -1, -1, 0, 0, 1, 1, 0];
const DX_E1: [isize; 8] = [-1, 0, 0, 1, 1, 0, 0, -1];
// 1 2 3                    0  2    2   4  4  6   6  0
// 0   4
// 7 6 5                    1   1   3   3  5   5  7  7
const DY_E2: [isize; 8] = [-1, -1, -1, -1, 1, 1, 1, 1];
const DX_E2: [isize; 8] = [-1, -1, 1, 1, 1, 1, -1, -1];
const AC: [f64; 8] = [2.0, 1.0, 1.0, 0.0, 4.0, 3.0, 3.0, 2.0];
const AF: [f64; 8] = [-1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0];
pub const NO_FLOW_GEN: f64 = 0.0;

const fn nwrap(n: usize) -> usize {
    if n == 8 { 0 } else { n }
}

pub fn fm_dinf(meta: &GridMeta, h: &[f64], flows: &mut [[f64; 8]], nrec: &mut [u8]) {
    flows.fill([NO_FLOW_GEN; 8]);
    nrec.fill(0);
    //TODO: Assumes that the width and height of grid cells are equal and scaled
    //to 1.
    let d1 = 1.0;
    let d2 = 1.0;
    let dang = d2.atan2(d1);

    flows
        .par_iter_mut()
        .zip(nrec)
        .enumerate()
        .for_each(|(n, (ps, recs))| {
            if meta.is_edge(n) {
                return;
            }

            let mut imax = 9;
            let mut smax = 0.0;
            let mut rmax = 0.0;

            for i in 0..8 {
                //Is is assumed that cells with a value of NoData have very negative
                //elevations with the result that they draw flow off of the grid.

                //Choose elevations based on Table 1 of Tarboton (1997), Barnes TODO
                let e0: f64 = h[n];
                let e1: f64 = h[(n as isize + DX_E1[i] + DY_E1[i] * meta.width as isize) as usize];
                let e2: f64 = h[(n as isize + DX_E2[i] + DY_E2[i] * meta.width as isize) as usize];

                let s1 = (e0 - e1) / d1;
                let s2 = (e1 - e2) / d2;

                let mut r = s2.atan2(s1);
                let s;

                if r < 1e-7 {
                    r = 0.0;
                    s = s1;
                } else if r > dang - 1e-7 {
                    r = dang;
                    s = (e0 - e2) / (d1 * d1 + d2 * d2).sqrt();
                } else {
                    s = (s1 * s1 + s2 * s2).sqrt();
                }

                if s > smax {
                    smax = s;
                    imax = i;
                    rmax = r;
                }
            }

            if AF[imax] == 1.0 && rmax == 0.0 {
                rmax = dang;
            } else if AF[imax] == 1.0 && rmax == dang {
                rmax = 0.0;
            } else if AF[imax] == 1.0 {
                rmax = FRAC_PI_4 - rmax;
            }

            //Code used by Tarboton to calculate the angle Rg. This should give the same
            //result despite the rearranged table
            // double rg = NO_FLOW;
            // if(nmax!=-1)
            //   rg = (AF[nmax]*rmax+ac[nmax]*M_PI/2);

            if rmax == 0.0 {
                ps[imax] = 1.0;
                *recs = 1;
            } else if rmax == dang {
                ps[nwrap(imax + 1)] = 1.0;
                *recs = 1;
            } else {
                ps[imax] = rmax / FRAC_PI_4;
                ps[nwrap(imax + 1)] = 1.0 - rmax / FRAC_PI_4;
                *recs = 2;
            }
        });
}

pub fn compute_donors_mflow(meta: &GridMeta, flows: &[[f64; 8]], donor: &mut [[usize; 8]]) {
    donor.par_iter_mut().enumerate().for_each(|(i, don)| {
        let (x, y) = meta.i_to_xy(i);
        for n in 0..8 {
            if !meta.in_grid(x as isize + XSHIFT[n], y as isize + YSHIFT[n]) {
                continue;
            }
            let i_rec = (i as isize + meta.nshift[n]) as usize;
            // 1 2 3  0->4 1->5 2->6 3->7
            // 0 x 4  4->0 5->1 6->2 7->3
            // 7 6 5  so +4%7
            if flows[i_rec][(n + 4) % 8] != NO_FLOW_GEN {
                don[n] = i_rec;
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
pub fn generate_order_mflow(
    meta: &GridMeta,
    nrec: &mut [u8],
    donor: &[[usize; 8]],
    stack: &mut [usize],
) -> Vec<usize> {
    let mut nstack = 0;
    let mut levels = Vec::with_capacity(meta.width * 2 + meta.height * 2);

    // The first level starts at zero
    levels.push(0);

    // Add cells that don't give flow as the first level
    for c in 0..meta.size {
        if nrec[c] == 0 {
            stack[nstack] = c;
            nstack += 1
        }
    }
    levels.push(nstack);

    let mut level_bottom = 0; // first cell of current level
    let mut level_top = nstack; // last cell of current level

    // full BFS search, but we fill an array, so later it can be done in parallel
    while level_bottom < level_top {
        for si in level_bottom..level_top {
            let c = stack[si];
            // load donating cells of focal cell into the stack
            for k in 0..8 {
                let n = donor[c][k as usize];
                if n == 0 {
                    continue;
                }
                nrec[n] -= 1;
                if nrec[n] == 0 {
                    stack[nstack] = n;
                    nstack += 1;
                }
            }
        }
        level_bottom = level_top; // start at the previous level
        level_top = nstack; // and process all cells that were added

        levels.push(nstack);
    }
    levels.pop();
    levels
}

pub unsafe fn accum_mflow(
    params: &Params,
    levels: &[usize],
    stack: &[usize],
    donor: &[[usize; 8]],
    flows: &[[f64; 8]],
    accum: &mut [f64],
) {
    accum.fill(params.cell_area);

    let acc = Bazooka(accum.as_mut_ptr());
    let acc_ref = &acc;

    for level in levels
        .windows(2)
        .take(levels.len() - 2)
        .rev()
        .map(|w| &stack[w[0]..w[1]])
    {
        // SAFETY: do NOT use `accum` inside this closure, only acc_ptr Also
        // ∀c∈level:don[c]∉level∧rec[c]∉level That is: we can safely mutate the
        // current cell, while reading its donors and receivers. Those are on
        // other levels.
        level.par_iter().for_each(|c| unsafe {
            let mut sum = acc_ref.0.add(*c).read();
            for k in 0..8 {
                let n = donor[*c][k as usize];
                if n == 0 {
                    continue;
                }
                sum += acc_ref.0.add(n).read() * flows[n][(k as usize + 4) % 8];
            }
            *acc_ref.0.add(*c) = sum;
        });
    }
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
    /// ```
    /// # let arr = [
    /// 1,2,3
    /// 0,x,4
    /// 7,6,5
    /// # ];
    /// ```
    pub const DINF_3: [f64;8] = [0.0,0.590334470601733,0.40966552939826695,0.0,0.0,0.0,0.0,0.0];
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
        let donor = [
        //  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]
            [1,2,0,0,0,0,0,0], [2,3,0,0,0,0,0,0],
            [3,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0],
        ];
        let stack = [
            0,1,2,3
        ];
        let levels = [
            0,1,2,3,4,
        ];
        let mut s = vec![0;stack.len()];
        let lvls = generate_order_mflow(&GridMeta::new(2, 2), &mut nrec, &donor, &mut s);
        assert_eq!(lvls, levels);
        assert_eq!(s, stack);
        for l in 0..lvls.len()-1 {
            assert_eq!(s[lvls[l]..lvls[l+1]], stack[levels[l]..levels[l+1]]);
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
        let donor = [
        //  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]  [0 1 2 3 4 5 6 7]
            [1,3,4,0,0,0,0,0], [2,3,4,5,0,0,0,0], [4,5,0,0,0,0,0,0],
            [4,6,7,0,0,0,0,0], [5,6,7,8,0,0,0,0], [7,8,0,0,0,0,0,0],
            [7,0,0,0,0,0,0,0], [8,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0],
        ];
        let stack = [
            0,1,2,3,4,5,6,7,8
        ];
        let levels = [
            0,1,2,4,5,7,8,9,
        ];
        let mut s = vec![0;stack.len()];
        let lvls = generate_order_mflow(&GridMeta::new(3, 3), &mut nrec, &donor, &mut s);
        assert_eq!(lvls, levels);
        assert_eq!(s, stack);
        for l in 0..lvls.len()-1 {
            assert_eq!(s[lvls[l]..lvls[l+1]], stack[levels[l]..levels[l+1]]);
        }
    }

    #[test]
    fn test_dinf_3() {
        let meta = &GridMeta::new(3, 3);
        let mut props = vec![[0.0; 8]; meta.size];
        let mut recs = vec![2; meta.size];

        fm_dinf(&meta, &consts::H_3, &mut props, &mut recs);
        for x in 1..2 {
            for y in 1..2 {
                println!("({x},{y})");
                let i = meta.xy_to_i(x, y);
                assert_eq!(props[i], consts::DINF_3);
            }
        }
        assert_eq!(recs, &[0, 0, 0, 0, 2, 0, 0, 0, 0,])
    }

    #[test]
    fn test_dinf_4() {
        let meta = &GridMeta::new(4, 4);
        let mut props = vec![[0.0; 8]; meta.size];
        let mut nrec = vec![2; meta.size];
        fm_dinf(&meta, &consts::H_4, &mut props, &mut nrec);
        for x in 1..meta.width - 1 {
            for y in 1..meta.height - 1 {
                println!("({x},{y})");
                let i = meta.xy_to_i(x, y);
                assert_eq!(props[i], consts::DINF_3);
            }
        }
        assert_eq!(nrec, &[0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0,])
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_donors_3() {
        let meta = &GridMeta::new(3, 3);
        let h = consts::H_3;
        let mut flows = vec![[0.0;8];meta.size];
        let mut nrec = vec![0;meta.size];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        let mut donor = vec![[0;8];meta.size];
        compute_donors_mflow(&meta, &flows, &mut donor);
        assert_eq!(donor, &[
        //   0 1 2 3 4 5 6 7
            [0,0,0,0,0,4,0,0], [0,0,0,0,0,0,4,0], [0;8], // 0
            [0;8], [0;8], [0;8], // 1
            [0;8], [0;8], [0;8], // 2
        ]);
        assert_eq!(flows, vec![
            [0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0,0.590334470601733,0.40966552939826695,0.0,0.0, 0.0, 0.0, 0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],
        ]);
        let mut stack = [0;9];
        let levels = generate_order_mflow(&meta, &mut nrec, &donor, &mut stack);
        assert_eq!(&stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&levels, &[0,8,9]);
        let mut acc = [0.0;9];
        unsafe {accum_mflow(&Params::default(), &levels, &stack, &donor, &flows, &mut acc);}
        assert_eq!(&acc, &[
            1.590334470601733, 1.40966552939826695, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_donors_4() {
        let meta = &GridMeta::new(4, 4);
        let h = consts::H_4;
        let mut flows = vec![[0.0;8];meta.size];
        let mut nrec = vec![0;meta.size];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        let mut donor = vec![[0;8];meta.size];
        compute_donors_mflow(&meta, &flows, &mut donor);
        assert_eq!(donor, &[
        //   0 1 2 3 4 5 6 7
            [0,0,0,0,0,5,0,0], [0,0,0,0,0, 6,5,0], [0,0,0,0,0,0, 6,0], [0;8], // 0
            [0,0,0,0,0,9,0,0], [0,0,0,0,0,10,9,0],[0,0,0,0,0,0,10,0], [0;8], // 1
            [0,0,0,0,0,0,0,0], [0,0,0,0,0, 0,0,0],[0;8], [0;8], // 2
            [0;8],[0;8],[0;8],[0;8], // 3
        ]);

        
        let mut stack = vec![0;meta.size];
        let levels = generate_order_mflow(&meta, &mut nrec, &donor, &mut stack);
        assert_eq!(stack, &[
            0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15, 5, 6, 9, 10
        ]);
        assert_eq!(levels, &[0,12,14,16]);
        let mut lvls = Vec::with_capacity(levels.len()-1);
        for w in levels.windows(2).take(levels.len()-1) {
            lvls.push(&stack[w[0]..w[1]])
        }
        assert_eq!(lvls, vec![
            vec![0,1,2,3,4,7,8,11,12,13,14,15],
            vec![5,6],
            vec![9,10],
        ]);
        let mut acc = vec![0.0;meta.size];
        unsafe{accum_mflow(&Params::default(), &levels, &stack, &donor, &flows, &mut acc);}
        assert_eq!(&acc, &[
            2.180668941203466, 2.6515052128193717, 1.5774913753754292, 1.0,
            1.590334470601733, 2.0, 1.409665529398267, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ]);
    }
}

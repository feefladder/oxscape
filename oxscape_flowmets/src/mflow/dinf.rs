use num_traits::Float;
use oxscape_core::{Flow, GridMeta};
use rayon::prelude::*;
use std::f64::consts::FRAC_PI_4;
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
// const DY_E1: [isize; 8] = [0, -1, -1, 0, 0, 1, 1, 0];
// const DX_E1: [isize; 8] = [-1, 0, 0, 1, 1, 0, 0, -1];
// 1 2 3                    0  2    2   4  4  6   6  0
// 0   4
// 7 6 5                    1   1   3   3  5   5  7  7
// const DY_E2: [isize; 8] = [-1, -1, -1, -1, 1, 1, 1, 1];
// const DX_E2: [isize; 8] = [-1, -1, 1, 1, 1, 1, -1, -1];
///```raw
///   0  1   2
/// 2           2
/// |\ 2-1 1-2 /| 3
/// 1-0 \| |/ 0-1
///      0 0  0-1
///        0   \| 4
///        |\   2
///      0 1-2    5
///     /|
///    2-1        6
/// 1-0
/// |/
/// 2             7
/// ```
const DIR_E1: [u8; 8] = [0, 2, 2, 4, 4, 6, 6, 0];
const DIR_E2: [u8; 8] = [1, 1, 3, 3, 5, 5, 7, 7];

// const AC: [f64; 8] = [2.0, 1.0, 1.0, 0.0, 4.0, 3.0, 3.0, 2.0];
const AF: [f32; 8] = [-1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0];

const fn nwrap(n: usize) -> usize {
    if n == 8 { 0 } else { n }
}

#[allow(clippy::float_cmp)] // float comparisons are explicitly set
pub fn fm_dinf<TElev: Float + Sync, TFlow: Flow>(
    meta: &GridMeta,
    h: &[TElev],
    flows: &mut [[TFlow; 8]],
    nrec: &mut [u8],
) {
    flows.fill([TFlow::no_flow(); 8]);
    nrec.fill(0);
    //TODO: Assumes that the width and height of grid cells are equal and scaled
    //to 1.
    let d1: TElev = TElev::one();
    let d2: TElev = TElev::one();
    let dang = d2.atan2(d1);

    flows
        .par_chunks_exact_mut(meta.width())
        .zip(nrec.par_chunks_exact_mut(meta.width()))
        .enumerate()
        // we ignore the edge of the grid to prevent accessing out-of-bounds..
        // that's actually bad for real dems... TODO: fix
        .take(meta.height() - 1)
        .skip(1)
        .for_each(|(y, (row, recs))| {
            for x in 1..meta.width() - 1 {
                let n = meta.xy_to_i(x, y);
                let ps = &mut row[x];

                let mut dir_max = 8;
                let mut smax = TElev::zero();
                let mut rmax = TElev::zero();

                for dir in 0..8 {
                    //Is is assumed that cells with a value of NoData have very negative
                    //elevations with the result that they draw flow off of the grid.
                    // TODO: process nodata cells

                    //Choose elevations based on Table 1 of Tarboton (1997),
                    // this is a triangle like
                    // 2   1   2 3 2
                    // |\ 2-1 1-2 /|
                    // 1-0 \| |/ 0-1
                    //      0 0  0-1 4
                    //        0   \|
                    //        |\   2
                    //      0 |-\
                    //     /|  6
                    //    /-|
                    // |-/ 7
                    // |/
                    // 0
                    // TODO: make this use try_shift
                    let e0: TElev = h[n]; // always the central cell
                    let Some(e1_idx) = meta.try_shift(x, y, DIR_E1[dir]) else {
                        continue;
                    };
                    let e1 = h[e1_idx];
                    let Some(e2_idx) = meta.try_shift(x, y, DIR_E2[dir]) else {
                        continue;
                    };
                    let e2: TElev = h[e2_idx];

                    let s1 = (e0 - e1) / d1;
                    let s2 = (e1 - e2) / d2;

                    let mut r = s2.atan2(s1);
                    let s;

                    let margin = TElev::from(1e-7).unwrap();
                    if r < margin {
                        r = TElev::zero();
                        s = s1;
                    } else if r > dang - margin {
                        r = dang;
                        s = (e0 - e2) / (d1 * d1 + d2 * d2).sqrt();
                    } else {
                        s = (s1 * s1 + s2 * s2).sqrt();
                    }

                    if s > smax {
                        smax = s;
                        dir_max = dir;
                        rmax = r;
                    }
                }

                // Some problem; probably a NaN
                if dir_max == 8 {
                    continue;
                }

                if AF[dir_max] == 1.0 && rmax == TElev::zero() {
                    rmax = dang;
                } else if AF[dir_max] == 1.0 && rmax == dang {
                    rmax = TElev::zero();
                } else if AF[dir_max] == 1.0 {
                    rmax = TElev::from(FRAC_PI_4).unwrap() - rmax;
                }

                //Code used by Tarboton to calculate the angle Rg. This should give the same
                //result despite the rearranged table
                // double rg = NO_FLOW;
                // if(nmax!=-1)
                //   rg = (AF[nmax]*rmax+ac[nmax]*M_PI/2);

                if rmax == TElev::zero() {
                    ps[dir_max] = TFlow::one();
                    recs[x] = 1;
                } else if rmax == dang {
                    ps[nwrap(dir_max + 1)] = TFlow::one();
                    recs[x] = 1;
                } else {
                    ps[dir_max] = TFlow::from(rmax / TElev::from(FRAC_PI_4).unwrap()).unwrap();
                    ps[nwrap(dir_max + 1)] =
                        TFlow::from(TElev::one() - rmax / TElev::from(FRAC_PI_4).unwrap()).unwrap();
                    recs[x] = 2;
                }
            }
        });
}

#[cfg(test)]
mod test {
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
    fn test_dinf_3() {
        let meta = &GridMeta::new(3, 3);
        let mut flows = vec![[<f64 as Flow>::no_flow(); 8]; meta.size()];
        let mut recs = vec![2; meta.size()];

        fm_dinf(&meta, &consts::H_3, &mut flows, &mut recs);
        for x in 1..2 {
            for y in 1..2 {
                println!("({x},{y})");
                let i = meta.xy_to_i(x, y);
                assert_eq!(flows[i], consts::DINF_3);
            }
        }
        // also check that the edge is 0.0
        assert_eq!(flows, &[
            [0.0;8], [0.0;8], [0.0;8],
            [0.0;8], [0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0;8],
            [0.0;8], [0.0;8], [0.0;8]
        ]);
        // now check all rotated versions
        fm_dinf(&meta, &[
            6.0,3.0,0.0,
            7.0,4.0,1.0,
            8.0,5.0,2.0,
        ], &mut flows, &mut recs);
        assert_eq!(flows[4], [0.0, 0.0, 0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0]);
        fm_dinf(&meta, &[
            8.0,7.0,6.0,
            5.0,4.0,3.0,
            2.0,1.0,0.0,
        ], &mut flows, &mut recs);
        assert_eq!(flows[4], [0.0, 0.0, 0.0, 0.0, 0.0, 0.590334470601733, 0.40966552939826695, 0.0]);
        fm_dinf(&meta, &[
            2.0,5.0,8.0,
            1.0,4.0,7.0,
            0.0,3.0,6.0,
        ], &mut flows, &mut recs);
        assert_eq!(flows[4], [0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.590334470601733]);
        assert_eq!(recs, &[
            0, 0, 0,
            0, 2, 0,
            0, 0, 0,
        ])
    }

    #[test]
    #[rustfmt::skip]
    fn test_depression() {
        const META: &GridMeta = &GridMeta::new(4, 3);
        let flows = &mut [[<f64 as Flow>::no_flow(); 8]; META.size()];
        let nrec = &mut [2; META.size()];
        // check that in a depression, only the pit cell is affected
        // it also pulls flow towards it
        fm_dinf(META, &[
            1.0,1.0,1.0,1.0,
            1.0,0.125,0.5,0.25,
            1.0,1.0,1.0,1.0,
        ], flows, nrec);
        debug_assert_eq!(flows, &[
            [0.0;8],[0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0;8],[1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],[0.0;8],
        ])
    }

    #[test]
    #[rustfmt::skip]
    /// Check all directions single-flow
    fn test_dinf_dirs() {
        const META: &GridMeta = &GridMeta::new(3, 3);
        let flows = &mut [[<f64 as Flow>::no_flow(); 8]; META.size()];
        let nrec = &mut [2; META.size()];
        fm_dinf(META, &[
            1.0,1.0,1.0,
            0.0,0.5,1.0,
            1.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]);
        fm_dinf(META, &[
            0.0,1.0,1.0,
            1.0,0.5,1.0,
            1.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0]);
        fm_dinf(META, &[
            1.0,0.0,1.0,
            1.0,0.5,1.0,
            1.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0]);
        fm_dinf(META, &[
            1.0,1.0,0.0,
            1.0,0.5,1.0,
            1.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0]);
        fm_dinf(META, &[
            1.0,1.0,1.0,
            1.0,0.5,0.0,
            1.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0]);
        fm_dinf(META, &[
            1.0,1.0,1.0,
            1.0,0.5,1.0,
            1.0,1.0,0.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0]);
        fm_dinf(META, &[
            1.0,1.0,1.0,
            1.0,0.5,1.0,
            1.0,0.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
        fm_dinf(META, &[
            1.0,1.0,1.0,
            1.0,0.5,1.0,
            0.0,1.0,1.0,
        ], flows, nrec);
        assert_eq!(flows[4], [0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_3_random() {
        let dem = [
            0.0, 0.0, 0.0,
            0.0, 0.5265574090027738, 0.0,
            0.0, 0.0, 0.0
        ];
        let mut flows = vec![[<f64 as Flow>::no_flow();8];9];
        let mut nrec= [0;9];
        fm_dinf(&GridMeta::new(3, 3), &dem, &mut flows, &mut nrec);
        assert_eq!(flows, [
            [0.0; 8], [0.0; 8], [0.0; 8],
            [0.0; 8], [1.0, 0.0,0.0,0.0,0.0,0.0,0.0,0.0], [0.0; 8],
            [0.0; 8], [0.0; 8], [0.0; 8]
        ]);
        assert_eq!(nrec, [
            0,0,0,
            0,1,0,
            0,0,0
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_4() {
        const META: &GridMeta = &GridMeta::new(4, 4);
        let mut flows = vec![[0.0; 8]; META.size()];
        let mut nrec = vec![2; META.size()];
        fm_dinf(&META, &consts::H_4, &mut flows, &mut nrec);
        assert_eq!(flows, &[
            [0.0;8], [0.0;8], [0.0;8], [0.0;8],
            [0.0;8], [0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0;8],
            [0.0;8], [0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0, 0.590334470601733, 0.40966552939826695, 0.0, 0.0, 0.0, 0.0, 0.0], [0.0;8],
            [0.0;8], [0.0;8], [0.0;8], [0.0;8]
        ]);
        assert_eq!(nrec, &[
            0, 0, 0, 0,
            0, 2, 2, 0,
            0, 2, 2, 0,
            0, 0, 0, 0,
        ])
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_quad_nan() {
        let meta = &GridMeta::new(3, 3);
        let h = [
            f64::NAN, 0.0, f64::NAN,
            0.0, 1.0, 0.0,
            f64::NAN, 0.0, f64::NAN,
        ];
        let mut flows = vec![[0.0;8];meta.size()];
        let mut nrec = vec![0;meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        assert_eq!(flows, &[[0.0;8];9]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_single_nan() {
        let meta = &GridMeta::new(3, 3);
        let h = [
            f64::NAN, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 0.0,
        ];
        let mut flows = vec![[0.0;8];meta.size()];
        let mut nrec = vec![0;meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        assert_eq!(&flows[4], &[0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_double_nan() {
        let meta = &GridMeta::new(3, 3);
        let h = [
            f64::NAN, 0.0, f64::NAN,
            0.0, 1.0, 0.0,
            0.0, 0.0, 0.0,
        ];
        let mut flows = vec![[0.0;8];meta.size()];
        let mut nrec = vec![0;meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        assert_eq!(&flows[4], &[0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_triple_nan() {
        let meta = &GridMeta::new(3, 3);
        let h = [
            f64::NAN, 0.0, f64::NAN,
            0.0, 1.0, 0.0,
            0.0, 0.0, f64::NAN
        ];
        let mut flows = vec![[0.0; 8]; meta.size()];
        let mut nrec = vec![0; meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        assert_eq!(&flows[4], &[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
    }
}

use crate::GridMeta;
use crate::mflow::NO_FLOW_GEN;
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
const DY_E1: [isize; 8] = [0, -1, -1, 0, 0, 1, 1, 0];
const DX_E1: [isize; 8] = [-1, 0, 0, 1, 1, 0, 0, -1];
// 1 2 3                    0  2    2   4  4  6   6  0
// 0   4
// 7 6 5                    1   1   3   3  5   5  7  7
const DY_E2: [isize; 8] = [-1, -1, -1, -1, 1, 1, 1, 1];
const DX_E2: [isize; 8] = [-1, -1, 1, 1, 1, 1, -1, -1];
// const AC: [f64; 8] = [2.0, 1.0, 1.0, 0.0, 4.0, 3.0, 3.0, 2.0];
const AF: [f64; 8] = [-1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0];

const fn nwrap(n: usize) -> usize {
    if n == 8 { 0 } else { n }
}

pub fn fm_dinf(meta: &GridMeta, h: &[f64], flows: &mut [[f64; 8]], nrec: &mut [u8]) {
    flows.fill([NO_FLOW_GEN; 8]);
    nrec.fill(0);
    //TODO: Assumes that the width and height of grid cells are equal and scaled
    //to 1.
    let d1: f64 = 1.0;
    let d2: f64 = 1.0;
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

                let mut imax = 8;
                let mut smax = 0.0;
                let mut rmax = 0.0;

                for i in 0..8 {
                    //Is is assumed that cells with a value of NoData have very negative
                    //elevations with the result that they draw flow off of the grid.
                    // TODO: process nodata cells

                    //Choose elevations based on Table 1 of Tarboton (1997),
                    // this is a triangle like
                    // 0   1   2  3
                    // |\ \-| |-/ /|
                    // 1-0 \| |/ 0-|
                    //      0 0  0-| 4
                    //        0   \|
                    //        |\   5
                    //      0 |-\
                    //     /|  6
                    //    /-|
                    // |-/ 7
                    // |/
                    // 0
                    let e0: f64 = h[n];
                    let e1: f64 =
                        h[(n as isize + DX_E1[i] + DY_E1[i] * meta.width() as isize) as usize];
                    let e2: f64 =
                        h[(n as isize + DX_E2[i] + DY_E2[i] * meta.width() as isize) as usize];

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

                // Some problem; probably a NaN
                if imax == 8 {
                    continue;
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
                    recs[x] = 1;
                } else if rmax == dang {
                    ps[nwrap(imax + 1)] = 1.0;
                    recs[x] = 1;
                } else {
                    ps[imax] = rmax / FRAC_PI_4;
                    ps[nwrap(imax + 1)] = 1.0 - rmax / FRAC_PI_4;
                    recs[x] = 2;
                }
            }
        });
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::NOT_A_DONOR;
    use crate::mflow::test::consts;
    use crate::mflow::{Order, compute_donors_mflow, generate_order_mflow};

    #[test]
    #[rustfmt::skip]
    fn test_dinf_3() {
        let meta = &GridMeta::new(3, 3);
        let mut flows = vec![[NO_FLOW_GEN; 8]; meta.size];
        let mut recs = vec![2; meta.size];

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
    /// Check all directions single-flow
    fn test_dinf_dirs() {
        const META: &GridMeta = &GridMeta::new(3, 3);
        let flows = &mut [[NO_FLOW_GEN; 8]; META.size];
        let nrec = &mut [2; META.size];
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
        let mut flows = vec![[NO_FLOW_GEN;8];9];
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
        let mut flows = vec![[0.0; 8]; META.size];
        let mut nrec = vec![2; META.size];
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
        let mut flows = vec![[0.0;8];meta.size];
        let mut nrec = vec![0;meta.size];
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
        let mut flows = vec![[0.0;8];meta.size];
        let mut nrec = vec![0;meta.size];
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
        let mut flows = vec![[0.0;8];meta.size];
        let mut nrec = vec![0;meta.size];
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
        let mut flows = vec![[0.0; 8]; meta.size];
        let mut nrec = vec![0; meta.size];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        assert_eq!(&flows[4], &[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
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
        const N: usize = NOT_A_DONOR;
        assert_eq!(donor, &[
        //   0 1 2 3 4 5 6 7
            [N,N,N,N,N,4,N,N], [N,N,N,N,N,N,4,N], [N;8], // N
            [N;8], [N;8], [N;8], // 1
            [N;8], [N;8], [N;8], // 2
        ]);
        assert_eq!(flows, vec![
            [0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0,0.590334470601733,0.40966552939826695,0.0,0.0, 0.0, 0.0, 0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],
        ]);
        let mut stack = Vec::with_capacity(9);
        let mut levels = Vec::with_capacity(3);
        generate_order_mflow(&meta, &mut nrec, &donor, &mut stack, &mut levels);
        assert_eq!(&stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&levels, &[0,8,9]);
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
        const N: usize = NOT_A_DONOR;
        assert_eq!(donor, &[
        //   0 1 2 3 4 5 6 7
            [N,N,N,N,N,5,N,N], [N,N,N,N,N, 6,5,N], [N,N,N,N,N,N, 6,N], [N;8], // N
            [N,N,N,N,N,9,N,N], [N,N,N,N,N,10,9,N],[N,N,N,N,N,N,10,N], [N;8], // 1
            [N,N,N,N,N,N,N,N], [N,N,N,N,N, N,N,N],[N;8], [N;8], // 2
            [N;8],[N;8],[N;8],[N;8], // 3
        ]);

        
        let mut stack = vec![0;meta.size];
        let mut levels = Vec::with_capacity(4);
        generate_order_mflow(&meta, &mut nrec, &donor, &mut stack, &mut levels);
        assert_eq!(stack, &[
        //  0  1  2  3  4  5  6  7   8   9   10  11
            0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15,
        //  12 13
            5, 6,
        //  14 15
            9, 10
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
        let mut acc = vec![1.0;meta.size];
        let order = Order::from_dem_metric(*meta, &consts::H_4, super::super::Dinf).unwrap();
        order.for_lvls_top_down(&mut acc, |c| {
            *c.cell() += c.donors().iter().map(|(a,b)| a*b).sum::<f64>()
        });
        assert_eq!(&acc, &[
            2.180668941203466, 2.6515052128193717, 1.5774913753754292, 1.0,
            1.590334470601733, 2.0, 1.409665529398267, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ]);
    }
}

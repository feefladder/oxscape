use std::{fmt::Debug, marker::PhantomData};

use crate::mflow::FlowMetric;

use num_traits::Float;
use oxscape_core::{Flow, GridMeta, Result, error::GridError};

use oxscape_flowmets::mflow::dinf::fm_dinf;

/// Dinf flow routing, based on Tarboton(1997)
///
/// Normally, you don't create this struct directly, but use the provided [`dinf()`] function:
///
/// ```
/// use oxscape_core::{GridMeta,Flow};
/// use oxscape_contour::mflow::FlowMetric;
/// use oxscape_contour::mflow::metrics::dinf;
/// type TFlow = f32;
/// let meta = GridMeta::new(3,3);
/// let dem = [
///  0,1,2,
///  3,4,5,
///  6,7,8,
/// ].map(|v| v as f32);
/// let mut nrec = [0;9];
/// let mut flows = [[TFlow::no_flow();8];9];
/// dinf().metric(&meta, &dem, &mut flows, &mut nrec);
/// assert_eq!(nrec, [
///   0,0,0,
///   0,2,0,
///   0,0,0,
/// ])
/// ```
///
/// ## References
///
/// Tarboton, D. G. (1997). A new method for the determination of flow directions and upslope areas in grid digital elevation models. Water Resources Research, 33(2), 309–319. https://doi.org/10.1029/96WR03137

#[derive(Debug)]
pub struct Dinf<TFlow: Flow + Debug>(PhantomData<TFlow>);

// SAFETY: fm_dinf makes flow only point downstream (no cycles) and skips the edges of the grid (no x-wrapping or y-out-of-bounds-ness)
unsafe impl<TFLow: Flow + Debug, TElev: Float + Sync> FlowMetric<TElev> for Dinf<TFLow> {
    type Error = GridError;
    type TFlow = TFLow;
    fn metric(
        &mut self,
        meta: &GridMeta,
        dem: &[TElev],
        flows: &mut [[Self::TFlow; 8]],
        nrec: &mut [u8],
    ) -> Result<(), Self::Error> {
        fm_dinf(meta, dem, flows, nrec);
        Ok(())
    }
}

pub fn dinf<TFlow: Flow + Debug>() -> Dinf<TFlow> {
    Dinf(PhantomData)
}

#[cfg(test)]
mod test {
    use crate::NOT_A_DONOR;
    use crate::mflow::test::consts;
    use crate::mflow::{Contours, compute_donors, generate_order};

    use super::*;

    #[test]
    #[rustfmt::skip]
    fn test_dinf_donors_3() {
        let meta = &GridMeta::new(3, 3);
        let h = consts::H_3;
        let mut flows = vec![[0.0;8];meta.size()];
        let mut nrec = vec![0;meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        let mut donor = vec![[0;8];meta.size()];
        compute_donors(&meta, &flows, &mut donor);
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
        generate_order(&mut nrec, &donor, &mut stack, &mut levels);
        assert_eq!(&stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&levels, &[0,8,9]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_dinf_donors_4() {
        let meta = GridMeta::new(4, 4);
        let h = consts::H_4;
        let mut flows = vec![[0.0;8];meta.size()];
        let mut nrec = vec![0;meta.size()];
        fm_dinf(&meta, &h, &mut flows, &mut nrec);
        let mut donor = vec![[0;8];meta.size()];
        compute_donors(&meta, &flows, &mut donor);
        const N: usize = NOT_A_DONOR;
        assert_eq!(donor, &[
        //   0 1 2 3 4 5 6 7
            [N,N,N,N,N,5,N,N], [N,N,N,N,N, 6,5,N], [N,N,N,N,N,N, 6,N], [N;8], // N
            [N,N,N,N,N,9,N,N], [N,N,N,N,N,10,9,N],[N,N,N,N,N,N,10,N], [N;8], // 1
            [N,N,N,N,N,N,N,N], [N,N,N,N,N, N,N,N],[N;8], [N;8], // 2
            [N;8],[N;8],[N;8],[N;8], // 3
        ]);


        let mut stack = vec![0;meta.size()];
        let mut levels = Vec::with_capacity(4);
        generate_order(&mut nrec, &donor, &mut stack, &mut levels);
        assert_eq!(stack, &[
        //  0  1  2  3  4  5  6  7   8   9   10  11
            0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15,
        //  12 13
            5, 6,
        //  14 15
            9, 10
        ]);
        assert_eq!(levels, &[0,12,14,16]);
        let mut contours = Vec::with_capacity(levels.len()-1);
        for w in levels.windows(2).take(levels.len()-1) {
            contours.push(&stack[w[0]..w[1]])
        }
        assert_eq!(contours, vec![
            vec![0,1,2,3,4,7,8,11,12,13,14,15],
            vec![5,6],
            vec![9,10],
        ]);
        let mut acc = vec![1.0f64;meta.size()];
        let order: Contours<f64> = Contours::from_dem_metric(meta, &consts::H_4, &mut Dinf(PhantomData)).unwrap();
        order.for_contours_top_down(&mut acc, |c| {
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

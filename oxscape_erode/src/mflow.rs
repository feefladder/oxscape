use std::ops::{AddAssign, SubAssign};

use crate::Params;
use num_traits::Float;
use oxscape_contour::mflow::FlowOrder;
use oxscape_core::{DR, Flow};

pub fn accum<TFlow: Flow + AddAssign>(
    order: &FlowOrder<TFlow>,
    cell_area: TFlow,
    accum: &mut [TFlow],
) {
    // initialize to cell area
    accum.fill(cell_area);

    order.for_contours_top_down(accum, |v| {
        let mut sum = *v.cell();
        for (val, factor) in v.donors() {
            sum += val * factor;
        }
        *v.cell() = sum;
    });
}

pub fn erode<T: Flow + Float + AddAssign + SubAssign + Send + Sync>(
    order: &FlowOrder<T>,
    params: &Params<T>,
    accum: &[T],
    dem: &mut [T],
) {
    order.for_contours_bottom_up(dem, |a| {
        let acc = accum[a.idx()];
        if acc.is_zero() {
            return;
        }

        let mut hnew = *a.cell();
        let h0 = hnew;

        let fact_base = params.keq * params.dt * acc.powf(params.meq);

        let recs = a.receivers(); // [(w, h_i); 8]

        let mut hp = hnew;
        let mut diff = T::from(2.0).unwrap() * params.tol;

        // TODO: explain what is happening here
        while Float::abs(diff) > params.tol {
            let mut f = hnew - h0;
            let mut df = T::one();

            for (n, (w, hn)) in recs.iter().enumerate() {
                if *w == T::no_flow() {
                    continue;
                }

                let dh = hnew - *hn;
                if dh <= T::zero() {
                    continue;
                }

                let len = T::from(DR[n]).unwrap();
                let term = fact_base * (*w) / len;

                f += term * dh.powf(params.neq);
                df += term * params.neq * dh.powf(params.neq - T::one());
            }

            hnew -= f / (T::one() + df);
            diff = hnew - hp;
            hp = hnew;
        }

        *a.cell() = hnew;
    });
}

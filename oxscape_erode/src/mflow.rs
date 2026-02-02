use crate::Params;
use oxscape::DR;
use oxscape::mflow::{NO_FLOW_GEN, Order};

pub fn accum(order: &Order, params: &Params, accum: &mut [f64]) {
    // initialize to cell area
    accum.fill(params.cell_area);

    order.for_lvls_top_down(accum, |v| {
        let mut sum = *v.cell();
        for (val, factor) in v.donors() {
            sum += val * factor;
        }
        *v.cell() = sum;
    });
}

pub fn erode(order: &Order, params: &Params, accum: &[f64], dem: &mut [f64]) {
    order.for_lvls_bottom_up(dem, |a| {
        let acc = accum[a.idx()];
        if acc == 0.0 {
            return;
        }

        let mut hnew = *a.cell();
        let h0 = hnew;

        let fact_base = params.keq * params.dt * acc.powf(params.meq);

        let recs = a.receivers(); // [(w, h_i); 8]

        let mut hp = hnew;
        let mut diff = 2.0 * params.tol;

        while diff.abs() > params.tol {
            let mut f = hnew - h0;
            let mut df = 1.0;

            for (n, (w, hn)) in recs.iter().enumerate() {
                if *w == NO_FLOW_GEN {
                    continue;
                }

                let dh = hnew - *hn;
                if dh <= 0.0 {
                    continue;
                }

                let len = DR[n];
                let term = fact_base * w / len;

                f += term * dh.powf(params.neq);
                df += term * params.neq * dh.powf(params.neq - 1.0);
            }

            hnew -= f / (1.0 + df);
            diff = hnew - hp;
            hp = hnew;
        }

        *a.cell() = hnew;
    });
}

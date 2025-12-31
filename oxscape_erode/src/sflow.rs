use oxscape::sflow::Order;
use oxscape::sflow::metrics::D8;
use oxscape::{GridMeta, Result, DR};
use rayon::prelude::*;
use crate::Params;

pub fn add_uplift(params: &Params, dem: &mut [f64]) {
    dem.par_iter_mut()
        .for_each(|h| *h += params.ueq * params.dt);
}

pub fn accum(order: &Order, params: &Params, accum: &mut [f64]) {
    accum.fill(params.cell_area);
    order.for_lvls_top_down(accum, |a| {
        *a.cell() += a.donors().iter().sum::<f64>();
    });
}

pub fn erode(order: &Order, params: &Params, accum: &[f64], dem: &mut [f64]) {
    order.for_lvls_bottom_up(dem, |a| {
        let length = DR[a.recv_dir() as usize];
        let fact =
            params.keq * params.dt * accum[a.idx()].powf(params.meq) / length.powf(params.neq);

        let h0 = *a.cell();
        let hn = a.receiver();
        let mut hnew = h0;
        let mut hp = h0;
        let mut diff = 2.0 * params.tol;
        while diff.abs() > params.tol {
            hnew = hnew
                - (hnew - h0 + fact * (hnew - hn).powf(params.neq))
                    / (1.0 + fact * params.neq * (hnew - hn).powf(params.neq - 1.0));
            diff = hnew - hp;
            hp = hnew;
        }
        *a.cell() = hnew;
    });
}

pub fn run(nstep: usize, meta: &GridMeta, params: &Params, dem: &mut [f64]) -> Result<()> {
    let mut order = Order::empty(*meta);
    let mut acc = vec![0.0; meta.size()];
    for _ in 0..nstep {
        order.reorder(dem, D8)?;
        accum(&order, params, &mut acc);
        add_uplift(params, dem);
        erode(&order, params, &acc, dem);
    }
    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;
    use oxscape::GridMeta;
    use oxscape::sflow::Order;

    const META: GridMeta = GridMeta::new(6, 6);
    #[rustfmt::skip]
    mod consts {  
    pub const H_INIT: [f64;36] = [
        //     0    1    2    3    4    5
        /*0*/ 0.5, 1.0, 1.5, 2.0, 2.5, 3.0,
        /*1*/ 3.5, 4.0, 4.5, 5.0, 5.5, 6.0,
        /*2*/ 6.5, 7.0, 7.5, 8.0, 8.5, 9.0,
        /*3*/ 9.5,10.0,10.5,11.0,11.5,12.0,
        /*4*/12.5,13.0,13.5,14.0,14.5,15.0,
        /*5*/15.5,16.0,16.5,17.0,17.5,18.0,
    ];

    pub const ACCUM: [f64;64] = [
    //   0    1    2    3    4    5    6    7
        1.0, 1.0, 6.0, 6.0, 6.0, 6.0, 2.0, 1.0,
        2.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0,
        2.0, 1.0, 4.0, 4.0, 4.0, 4.0, 1.0, 2.0,
        2.0, 1.0, 3.0, 3.0, 3.0, 3.0, 1.0, 2.0,
        2.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 2.0,
        2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0,
        2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0,
        1.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0
    ];
    pub const H_LIFT: [f64;64] = [
    //   0    1    2    3    4    5    6    7
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 0.0,
        0.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 0.0,
        0.0, 8.5, 9.0, 9.5,10.0,10.5,11.0, 0.0,
        0.0,11.5,12.0,12.5,13.0,13.5,14.0, 0.0,
        0.0,14.5,15.0,15.5,16.0,16.5,17.0, 0.0,
        0.0,17.5,18.0,18.5,19.0,19.5,20.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    ];
    pub const H_ONE: [f64;64] = [
    //   0    1    2    3    4    5    6    7    8    9
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 2.487623459051949, 2.937461098743398, 3.415452179414055, 3.890308235153265, 4.362090154126089, 4.950975679639285, 0.0,
        0.0, 5.44079548889611, 5.945153998662335, 6.444376929803646, 6.943482721884593, 7.442471000991258, 7.87593916455426, 0.0,
        0.0, 8.36021365527903, 8.956328427812103, 9.456306520591438, 9.956281304365826, 10.456252765808319, 10.7680962081263, 0.0,
        0.0, 11.24700955229129, 11.968407305108173, 12.468406854993649, 12.9684063368871, 13.468405750513059, 13.628526529410895, 0.0,
        0.0, 14.10225292505446, 14.981838465285742, 15.481838459924806, 15.98183845375407, 16.481838446770258, 16.45825189005138, 0.0,
        0.0, 16.92695630148848, 17.394839143291662, 17.8619047206506, 18.328157301286385, 18.79360111590655, 19.258240356725203, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    ];
    }

    #[test]
    fn test_compute_acc() {
        let meta = GridMeta::new(8, 8);
        let mut acc = vec![0.0; meta.size()];
        let order = Order::from_dem_metric(meta, &consts::H_LIFT, D8).unwrap();
        accum(&order, &Params::default(), &mut acc);
        assert_eq!(acc, consts::ACCUM);
    }

    #[test]
    fn test_erode() {
        let mut h = consts::H_LIFT.to_vec();
        let order = Order::from_dem_metric(GridMeta::new(8, 8), &consts::H_LIFT, D8).unwrap();
        erode(&order, &Params::default(), &consts::ACCUM, &mut h);
        assert_eq!(h, consts::H_ONE);
    }

    #[test]
    #[rustfmt::skip]
    fn test_run() {
        let mut dem = consts::H_INIT.to_vec();
        run(1, &META, &Params::default(), &mut dem).unwrap();
        assert_eq!(
            dem,
            vec![
                //   0    1    2    3    4    5    6    7    8    9
                    2.5, 3.0, 3.5, 4.0, 4.5, 5.0,
                    5.5, 5.9473332550995375, 6.4473332550995375, 6.9473332550995375, 7.4473332550995375, 8.0,
                    8.5, 8.9563898371972, 9.4563898371972, 9.9563898371972, 10.4563898371972, 11.0,
                    11.5, 11.968408566833231, 12.468408566833231, 12.968408566833231, 13.468408566833231, 14.0,
                    14.5, 14.98183848031309, 15.48183848031309, 15.98183848031309, 16.48183848031309, 17.0,
                    17.5, 18.0, 18.5, 19.0, 19.5, 20.0
            ]
        );
        run(2, &META, &Params::default(), &mut dem).unwrap();
        assert_eq!(
            dem,
            vec![
                //   0    1    2    3    4    5    6    7    8    9
                    6.5, 7.0, 7.5, 8.0, 8.5, 9.0,
                    9.5, 9.847315741288288, 10.347315741288288, 10.847315741288288, 11.347315741288288, 12.0,
                    12.5, 12.868609498354077, 13.368609498354077, 13.868609498354077, 14.368609498354077, 15.0,
                    15.5, 15.904471925369153, 16.404471925369155, 16.904471925369155, 17.404471925369155, 18.0,
                    18.5, 18.945023739503167, 19.445023739503167, 19.945023739503167, 20.445023739503167, 21.0,
                    21.5, 22.0, 22.5, 23.0, 23.5, 24.0
            ]
        );
    }
}

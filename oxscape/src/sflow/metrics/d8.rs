use crate::sflow::NO_FLOW;
use crate::{DR, GridMeta};
use num_traits::Float;
use rayon::prelude::*;

///The receiver of a focal cell is the cell which receives the focal cells'
///flow. Here, we model the receiving cell as being the one connected to the
///focal cell by the steepest gradient. If there is no local gradient, then
///the special value NO_FLOW is assigned.
pub fn compute_receivers<T: Float + From<f64> + Sync>(meta: &GridMeta, h: &[T], rec: &mut [u8]) {
    rec.fill(NO_FLOW);
    rec.par_chunks_exact_mut(meta.width)
        .enumerate()
        .take(meta.height - 1)
        .skip(1)
        .for_each(|(y, row)| {
            #[allow(clippy::needless_range_loop)]
            for x in 1..meta.width - 1 {
                let c: usize = y * meta.width + x;

                let mut max_slope = T::zero();
                let mut max_n = NO_FLOW;

                for n in 0..8 {
                    let slope = (h[c] - h[meta.shift(c, n)]) / DR[usize::from(n)].into();
                    if slope > max_slope {
                        max_slope = slope;
                        max_n = n;
                    }
                }
                row[x] = max_n;
            }
        });
}

#[cfg(test)]
mod test {
    use super::*;
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
    //1 2 3
    //0 8 4
    //7 6 5
    pub const REC: [u8;36] = [
    //  0   1   2   3   4   5
        8,  8,  8,  8,  8,  8,// 0
        8,  2,  2,  2,  2,  8,// 1
        8,  2,  2,  2,  2,  8,// 2
        8,  2,  2,  2,  2,  8,// 3
        8,  2,  2,  2,  2,  8,// 4
        8,  8,  8,  8,  8,  8,// 5
    ];
    }
    #[test]
    fn test_compute_receivers() {
        let mut rec = vec![NO_FLOW; META.size];
        compute_receivers(&META, &consts::H_INIT, &mut rec);
        assert_eq!(rec, consts::REC);
    }
}

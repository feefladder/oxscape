use crate::mflow::{NO_FLOW_GEN, compute_donors_mflow, fm_dinf, generate_order_mflow};
use crate::{Bazooka, GridMeta, Params, XSHIFT, YSHIFT};

use anyhow::{Result, anyhow};
use num_traits::Zero;
use rayon::prelude::*;

pub fn accum(params: &Params, order: &Order, accum: &mut [f64]) {
    // initialize to cell area
    accum.fill(params.cell_area);

    order.for_lvls_top_down(accum, |v| {
        let mut sum = *v.cell();
        for (val, factor) in v.donors() {
            sum += val * factor;
        }
        *v.cell() = sum;
    })
}

pub struct LevelAccessor<'a, T: Send + Sync> {
    arr: &'a Bazooka<T>,
    idx: usize,
    meta: &'a GridMeta,
    flows: &'a [[f64; 8]],
}

impl<'a, T: Zero + Copy + Send + Sync> LevelAccessor<'a, T> {
    pub fn cell(&mut self) -> &mut T {
        unsafe { self.arr.0.add(self.idx).as_mut().unwrap() }
    }

    pub fn receivers(&self) -> [(f64, T); 8] {
        let mut res = [(NO_FLOW_GEN, T::zero()); 8];
        for (n, flow) in self.flows[self.idx].iter().enumerate() {
            if *flow != NO_FLOW_GEN {
                unsafe {
                    res[n] = (
                        *flow,
                        self.arr
                            .0
                            .offset(self.idx as isize + self.meta.nshift[n])
                            .read(),
                    )
                }
            }
        }
        res
    }

    pub fn donors(&self) -> [(f64, T); 8] {
        let mut res = [(NO_FLOW_GEN, T::zero()); 8];
        let (x, y) = self.meta.i_to_xy(self.idx);
        for n in 0..8 {
            // bounds check
            if !self
                .meta
                .in_grid(x as isize + XSHIFT[n], y as isize + YSHIFT[n])
            {
                continue;
            }
            let offset = self.idx as isize + self.meta.nshift[n];
            let flow = self.flows[offset as usize][(n + 4) % 8];
            if flow != NO_FLOW_GEN {
                unsafe { res[n] = (flow, self.arr.0.offset(offset).read()) }
            }
        }
        res
    }
}

pub struct Order {
    meta: GridMeta,
    flows: Vec<[f64; 8]>,
    stack: Vec<usize>,
    levels: Vec<usize>,
}

pub enum Metrics {
    Dinf,
}

impl Order {
    pub fn n_levels(&self) -> usize {
        self.levels.len() - 1
    }

    pub fn from_dem_metric(meta: GridMeta, dem: &[f64], metric: Metrics) -> Result<Self> {
        let fm = match metric {
            Metrics::Dinf => fm_dinf,
        };
        unsafe { Self::from_dem_fn(meta, dem, fm) }
    }

    pub unsafe fn from_dem_fn<F: Fn(&GridMeta, &[f64], &mut [[f64; 8]], &mut [u8])>(
        meta: GridMeta,
        dem: &[f64],
        metric: F,
    ) -> Result<Self> {
        if meta.size != dem.len() {
            return Err(anyhow!("meta dem mismatch"));
        }
        let mut flows = vec![[0.0; 8]; meta.size];
        let mut nrec = vec![0; meta.size];
        metric(&meta, dem, &mut flows, &mut nrec);
        let mut donor = vec![[0; 8]; meta.size];
        compute_donors_mflow(&meta, &flows, &mut donor);
        let mut stack = vec![0; meta.size];
        let levels = generate_order_mflow(&meta, &mut nrec, &donor, &mut stack);
        Ok(Self {
            meta,
            flows,
            stack,
            levels,
        })
    }

    pub fn for_lvls_bottom_up<T: Zero + Copy + Send + Sync, F: Fn(&mut LevelAccessor<T>) + Sync>(
        &self,
        data: &mut [T],
        f: F,
    ) {
        let b = Bazooka(data.as_mut_ptr());
        for level in self.levels.windows(2).map(|w| &self.stack[w[0]..w[1]]) {
            level.into_par_iter().for_each(|v| {
                f(&mut LevelAccessor {
                    arr: &b,
                    idx: *v,
                    meta: &self.meta,
                    flows: &self.flows,
                })
            });
        }
    }

    pub fn for_lvls_top_down<T: Zero + Copy + Send + Sync, F: Fn(&mut LevelAccessor<T>) + Sync>(
        &self,
        data: &mut [T],
        f: F,
    ) {
        let b = Bazooka(data.as_mut_ptr());
        for level in self
            .levels
            .windows(2)
            .rev()
            .map(|w| &self.stack[w[0]..w[1]])
        {
            level.into_par_iter().for_each(|v| {
                f(&mut LevelAccessor {
                    arr: &b,
                    idx: *v,
                    meta: &self.meta,
                    flows: &self.flows,
                })
            });
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_order_single_level() {
        let o = Order {
            meta: GridMeta::new(2, 2),
            // nothing flows anywhere, single level
            flows: vec![[NO_FLOW_GEN; 8]; 4],
            stack: vec![0, 1, 2, 3],
            levels: vec![0, 4],
        };
        assert_eq!(o.n_levels(), 1);
        let mut data = [0, 1, 2, 3];
        o.for_lvls_bottom_up(&mut data, |a| {
            assert_eq!(a.donors(), [(0.0, 0); 8]);
            assert_eq!(a.receivers(), [(0.0, 0); 8]);
            *a.cell() += 1;
        });
        assert_eq!(data, [1, 2, 3, 4]);
        o.for_lvls_top_down(&mut data, |a| {
            assert_eq!(a.donors(), [(0.0, 0); 8]);
            assert_eq!(a.receivers(), [(0.0, 0); 8]);
            *a.cell() += 1;
        });
        assert_eq!(data, [2, 3, 4, 5]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_order_two_levels() {
        let mut data = [
            0, 1,
            2, 3
        ];
        let o = Order {
            meta: GridMeta::new(2, 2),
            // 
            // 1 2 3
            // 0 x 4
            // 7 6 5
            flows: vec![
                // this would be a cycle and very dangerous, but levels are accordingly
                // We also rely on NO_FLOW_GEN==0.0
                //0   1   2   3   4   5   6   7
                [0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0],[1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],
                [0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0],[1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],
            ],
            stack: vec![
                0, 2,
                1, 3
            ],
            levels: vec![0, 2, 4],
        };
        assert_eq!(o.n_levels(), 2);

        // in this context, this is unsafe, because we have "unsound" order
        o.for_lvls_bottom_up(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != 0.0 {
                    *a.cell() += val
                }
            }
        });
        assert_eq!(data, [1, 2, 5, 8]);
        o.for_lvls_top_down(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != 0.0 {
                    *a.cell() += val
                }
            }
        });
        assert_eq!(data, [4, 3, 18, 13]);
    }

    use crate::mflow::test::consts;

    #[test]
    #[rustfmt::skip]
    fn test_order_3() {
        let meta = GridMeta::new(3, 3);
        let order = Order::from_dem_metric(meta, &consts::H_3, Metrics::Dinf).unwrap();
        assert_eq!(order.flows, vec![
            [0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0,0.590334470601733,0.40966552939826695,0.0,0.0, 0.0, 0.0, 0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],
        ]);
        assert_eq!(&order.stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&order.levels, &[0,8,9]);
        let mut acc = [0.0;9];
        accum(&Params::default(), &order, &mut acc);
        assert_eq!(&acc, &[
            1.590334470601733, 1.40966552939826695, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]);
    }
}

use crate::mflow::{compute_donors_mflow, generate_order_mflow};
use crate::{Bazooka, GridMeta, NOT_A_DONOR};

use anyhow::{Result, anyhow};
use num_traits::Zero;
use rayon::prelude::*;

pub const NO_FLOW_GEN: f64 = 0.0;

pub struct LevelAccessor<'a, T: Send + Sync> {
    arr: &'a Bazooka<T>,
    idx: usize,
    meta: &'a GridMeta,
    flows: &'a [[f64; 8]],
    donors: &'a [[usize; 8]],
}

impl<'a, T: Zero + Copy + Send + Sync> LevelAccessor<'a, T> {
    /// SAFETY: It is your responsibility to ensure:
    ///
    /// For the lifetime of Self:
    /// - nothing reads arr[idx]
    /// - nothing writes donors or receivers of this cell
    ///   - donors are defined as neighbouring cells that have flow pointing to this cell
    ///   - receivers are neighbouring cells that this cell flows into
    unsafe fn new(
        arr: &'a Bazooka<T>,
        idx: usize,
        meta: &'a GridMeta,
        flows: &'a [[f64; 8]],
        donors: &'a [[usize; 8]],
    ) -> Self {
        Self {
            arr,
            idx,
            meta,
            flows,
            donors,
        }
    }

    /// Get mutable access to the current cell
    pub fn cell(&mut self) -> &mut T {
        // SAFETY: nothing reads arr[idx]
        unsafe { self.arr.0.add(self.idx).as_mut().unwrap() }
    }

    pub fn idx(&self) -> usize {
        self.idx
    }

    pub fn receivers(&self) -> [(f64, T); 8] {
        let mut res = [(NO_FLOW_GEN, T::zero()); 8];
        for (n, flow) in self.flows[self.idx].iter().enumerate() {
            if *flow != NO_FLOW_GEN {
                // SAFETY: topological sorting is based on this flow metric.
                // Therefore, any direction that is NOT NO_FLOW_GEN is in a
                // different level and can be safely accessed.
                unsafe {
                    res[n] = (
                        *flow,
                        self.arr.0.add(self.meta.shift(self.idx, n as u8)).read(),
                    )
                }
            }
        }
        res
    }

    pub fn donors(&self) -> [(f64, T); 8] {
        let mut res = [(NO_FLOW_GEN, T::zero()); 8];
        self.donors[self.idx]
            .iter()
            .enumerate()
            .for_each(|(n, donor)| {
                if *donor == NOT_A_DONOR {
                    return;
                }
                let flow = self.flows[*donor][GridMeta::rev(n)];
                // SAFETY: topological sorting is based on this flow metric.
                // Therefore, any direction that is NOT NO_FLOW_GEN is in a
                // different level and can be safely accessed.
                unsafe { res[n] = (flow, self.arr.0.add(*donor).read()) }
            });
        res
    }
}

#[derive(Debug)]
pub struct Order {
    meta: GridMeta,
    flows: Vec<[f64; 8]>,
    donors: Vec<[usize; 8]>,
    nrec: Vec<u8>,
    stack: Vec<usize>,
    levels: Vec<usize>,
}

/// Flowmetric to implement
///
/// A flowmetric should write to flows and nrec, where nrec is the number of
/// receivers of a current cell
///
/// SAFETY: Cycles are omitted and out-of-bounds will panic. However, if `nrec`
/// is not sound _and_ the flow graph contains a cycle, it is uncertain if the
/// flowgraph could be unsound. It is your responsibility that nrec contains the
/// number of receivers and flows only point downstream (no cycles).
///
pub unsafe trait FlowMetric {
    fn metric(
        &mut self,
        meta: &GridMeta,
        dem: &[f64],
        flows: &mut [[f64; 8]],
        nrec: &mut [u8],
    ) -> Result<()>;
}

impl Order {
    pub fn n_levels(&self) -> usize {
        self.levels.len() - 1
    }

    pub fn empty(meta: GridMeta) -> Self {
        Self {
            meta,
            flows: vec![[0.0; 8]; meta.size],
            donors: vec![[0; 8]; meta.size],
            nrec: vec![0; meta.size],
            stack: vec![0; meta.size],
            levels: Vec::with_capacity(2 * meta.width + 2 * meta.height),
        }
    }

    pub fn reorder<M: FlowMetric>(&mut self, dem: &[f64], metric: &mut M) -> Result<()> {
        metric.metric(&self.meta, dem, &mut self.flows, &mut self.nrec)?;
        compute_donors_mflow(&self.meta, &self.flows, &mut self.donors);
        generate_order_mflow(
            &self.meta,
            &mut self.nrec,
            &self.donors,
            &mut self.stack,
            &mut self.levels,
        );
        Ok(())
    }

    pub fn from_dem_metric<M: FlowMetric>(meta: GridMeta, dem: &[f64], metric: &mut M) -> Result<Self> {
        if meta.size != dem.len() {
            return Err(anyhow!("meta dem mismatch"));
        }
        let mut res = Self::empty(meta);
        res.reorder(dem, metric)?;
        Ok(res)
    }

    pub fn for_lvls_bottom_up<T: Zero + Copy + Send + Sync, F: Fn(&mut LevelAccessor<T>) + Sync>(
        &self,
        data: &mut [T],
        f: F,
    ) {
        // SAFETY: if data.len < self.meta.size, the LevelAccessor would access
        // out-of-bounds data.
        assert!(data.len() == self.meta.size);
        let b = Bazooka(data.as_mut_ptr());
        for level in self.levels.windows(2).map(|w| &self.stack[w[0]..w[1]]) {
            level.par_iter().for_each(|v| {
                // SAFETY: we have a sound topological sorting. The LevelAccessor
                // only accesses donors and receivers, and those are on
                // different levels
                unsafe {
                    f(&mut LevelAccessor::new(
                        &b,
                        *v,
                        &self.meta,
                        &self.flows,
                        &self.donors,
                    ))
                }
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
                // SAFETY: we have a sound topological sorting. The LevelAccessor
                // only accesses donors and receivers, and those are on
                // different levels
                unsafe {
                    f(&mut LevelAccessor::new(
                        &b,
                        *v,
                        &self.meta,
                        &self.flows,
                        &self.donors,
                    ))
                }
            });
        }
    }

    pub fn levels(&self) -> &[usize] {
        &self.levels
    }

    pub fn stack(&self) -> &[usize] {
        &self.stack
    }

    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }

    pub fn flows(&self) -> &[[f64; 8]] {
        &self.flows
    }

    pub fn donors(&self) -> &[[usize; 8]] {
        &self.donors
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::mflow::metrics::Dinf;

    #[test]
    fn test_order_single_level() {
        let o = Order {
            meta: GridMeta::new(2, 2),
            // nothing flows anywhere, single level
            flows: vec![[NO_FLOW_GEN; 8]; 4],
            donors: vec![[NOT_A_DONOR; 8]; 4],
            nrec: vec![0; 4],
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
        const N: usize = NOT_A_DONOR;
        const F: f64 = NO_FLOW_GEN;
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
                [F,F,F,F,1.0,F,F,F],[1.0,F,F,F,F,F,F,F],
                [F,F,F,F,1.0,F,F,F],[1.0,F,F,F,F,F,F,F],
            ],
            donors: vec![
            //   0 1 2 3 4 5 6 7   0 1 2 3 4 5 6 7
                [N,N,N,N,1,N,N,N],[0,N,N,N,N,N,N,N],
                [N,N,N,N,3,N,N,N],[2,N,N,N,N,N,N,N],
            ],
            nrec: vec![0;4],
            stack: vec![
                0, 2,
                1, 3
            ],
            levels: vec![0, 2, 4],
        };
        assert_eq!(o.n_levels(), 2);

        println!("going up");
        // in this context, this is unsafe, because we have "unsound" order
        o.for_lvls_bottom_up(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != NO_FLOW_GEN {
                    *a.cell() += val
                }
            }
        });
        assert_eq!(data, [1, 2, 5, 8]);
        o.for_lvls_top_down(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != NO_FLOW_GEN {
                    *a.cell() += val
                }
            }
        });
        assert_eq!(data, [4, 3, 18, 13]);
    }

    use crate::{NOT_A_DONOR, mflow::test::consts};

    #[test]
    #[rustfmt::skip]
    fn test_order_3() {
        let meta = GridMeta::new(3, 3);
        let order = Order::from_dem_metric(meta, &consts::H_3, &mut Dinf).unwrap();
        assert_eq!(order.flows, vec![
            [0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0,0.590334470601733,0.40966552939826695,0.0,0.0, 0.0, 0.0, 0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],
        ]);
        assert_eq!(&order.stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&order.levels, &[0,8,9]);
        let mut acc = [1.0;9];
        order.for_lvls_top_down(&mut acc, |c| {
            *c.cell() += c.donors().iter().map(|(frac, val)| frac*val).sum::<f64>()
        });
        assert_eq!(&acc, &[
            1.590334470601733, 1.40966552939826695, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]);
    }
}

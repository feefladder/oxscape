use std::error::Error;
use std::fmt::Debug;

use exn::ResultExt;
use num_traits::Zero;
use num_traits::float::Float;
use rayon::prelude::*;

use oxscape_core::{Flow, GridMeta, Result};

use crate::mflow::{compute_donors, generate_order};
use crate::{Bazooka, ContourError, NOT_A_DONOR};

/// Struct that allows accessing cells on this "contour" mutably and its
/// receivers and donors immutably.
///
/// This is created by a [`FlowOrder`]
pub struct ContourAccessor<'a, TArr: Send + Sync, TFlow: Flow> {
    arr: &'a Bazooka<TArr>,
    idx: usize,
    meta: &'a GridMeta,
    flows: &'a [[TFlow; 8]],
    donors: &'a [[usize; 8]],
}

impl<'a, TArr: Send + Sync + Zero + Copy, TFlow: Flow> ContourAccessor<'a, TArr, TFlow> {
    /// SAFETY: It is your responsibility to ensure:
    ///
    /// For the lifetime of Self:
    /// - nothing reads arr[idx], e.g. `&mut arr[idx]` is sound
    /// - nothing writes donors or receivers of this cell
    ///   - donors are defined as neighbouring cells that have flow pointing to this cell
    ///     - `&arr[donors[dir]]` when `donors[dir]!=NOT_A_DONOR` is sound
    ///   - receivers are neighbouring cells that this cell flows into
    ///     - `&arr[meta.shift(idx, dir)]` when `flows[dir]!=TFlow::no_flow()`is sound
    unsafe fn new(
        arr: &'a Bazooka<TArr>,
        idx: usize,
        meta: &'a GridMeta,
        flows: &'a [[TFlow; 8]],
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
    pub fn cell(&mut self) -> &mut TArr {
        // SAFETY:
        // - `stack[n]` points within the array, so this cannot overflow isize
        // - therefore, it also points within the same allocatoin
        let addr = unsafe { self.arr.0.add(self.idx) };
        // SAFETY: nothing reads arr[idx] from within this level, so we can give mutable access
        unsafe { addr.as_mut().unwrap() }
    }

    /// The current cell's index
    pub fn idx(&self) -> usize {
        self.idx
    }

    /// Get immutable access to the receivers of a cell
    ///
    /// If a direction is not a receiver (flow is 0.0), the corresponding value will be 0
    pub fn receivers(&self) -> [(TFlow, TArr); 8] {
        let mut res = [(TFlow::no_flow(), TArr::zero()); 8];
        self.flows[self.idx]
            .iter()
            .enumerate()
            .for_each(|(dir, flow)| {
                if *flow == TFlow::no_flow() {
                    return;
                }
                let n_shift = self.meta.shift(self.idx, dir as u8);
                // SAFETY:
                // - meta.shift function casts to isize and back, so we are within `isize`
                // - meta.shift is also guaranteed to output a value within the allocation
                #[allow(clippy::cast_possible_truncation)] // n in 0..8 range due to type
                let addr = unsafe { self.arr.0.add(n_shift) };
                // SAFETY: topological sorting is based on this flow metric.
                // Therefore, any direction that is NOT TFlow::no_flow() is in a
                // different (lower) level and can be safely accessed.
                res[dir] = unsafe { (*flow, addr.read()) };
            });
        res
    }

    /// Get immutable access to the donors of this cell
    ///
    /// If a direction is not a donor (flow == 0.0), the corresponding value
    /// will be 0.
    pub fn donors(&self) -> [(TFlow, TArr); 8] {
        let mut res = [(TFlow::no_flow(), TArr::zero()); 8];
        self.donors[self.idx]
            .iter()
            .enumerate()
            .for_each(|(n, donor)| {
                if *donor == NOT_A_DONOR {
                    return;
                }
                let flow = self.flows[*donor][GridMeta::rev(n)];
                // SAFETY:
                // - [`compute_donors`] gives a donors array with the array index of the donor in the given direction
                // - therefore, it will not overflow isize
                // - and it will still point to the current allocation
                let addr = unsafe { self.arr.0.add(*donor) };
                // SAFETY: topological sorting is based on this flow metric.
                // Therefore, any direction that is NOT `NOT_A_DONOR` is in a
                // different (higher) level and can be safely accessed.
                res[n] = unsafe { (flow, addr.read()) }
            });
        res
    }
}

/// Flow order for graph traversal
///
/// Internally uses "contours": the hydrological meaning is that on a contour, no water flows sideways, only
/// up or down. Therefore it is safe to process an entire contour in parallel.
/// This naming diverges from the topologial "levels" and overloads GIS "contours", but is easier to explain
/// imo.
#[derive(Debug, Clone)]
pub struct FlowOrder<T: Float> {
    /// The structure of the grid
    meta: GridMeta,
    /// Flow partitioning for each cell
    flows: Vec<[T; 8]>,
    /// All donors of a cell
    ///
    /// A cell has at most 8 donors. I didn't really want to keep a separate
    /// ndon array around, so each direction just encodes whether it's a donor
    /// by not being [`NOT_A_DONOR`]. In that case, it's the donor's grid index.
    donors: Vec<[usize; 8]>,
    /// The number of receivers for each cell
    ///
    /// This is relied upon for order generation and is only non-zero in between
    /// `metric` and [`generate_order`]
    nrec: Vec<u8>,
    /// The stack of a topological sort
    ///
    /// This is partitioned by [`self.contours`] to provide independent levels
    /// that can be internally parallelized
    ///
    /// e.g.
    /// ```
    /// # use oxscape_core::GridMeta;
    /// # use oxscape_contour::mflow::FlowOrder;
    /// # let order: FlowOrder<f32> = FlowOrder::empty(GridMeta::new(42,42));
    /// for contour in order.contours().windows(2).map(|w| &order.stack()[w[0]..w[1]]) {
    ///  // do parallel stuff on everything on the same contour
    ///  // The logic is that within a contour, no water flows,
    /// }
    /// ```
    stack: Vec<usize>,
    /// Partitioning of the stack
    contours: Vec<usize>,
}

/// Flowmetric to implement
///
/// A flowmetric should write to flows and nrec, where nrec is the number of
/// receivers of a current cell
///
/// # SAFETY
///
/// This function is certainly safe for "normal" flow metrics:
/// - it assigns flows only to lower cells
/// - The edges do not flow out of the grid
/// - If a cell `c` assigns flow to `n` neighbours ensure `nrec[c] == n`
///
/// TODO: mark this function as safe once the below is figured out:
///
/// Cycles are omitted and out-of-bounds will panic. However, if `nrec`
/// is not sound _and_ the flow graph contains a cycle, it is uncertain if the
/// flowgraph could be unsound. It is your responsibility that nrec contains the
/// number of receivers and flows only point downstream (no cycles).
///
pub unsafe trait FlowMetric<TElev>: Debug {
    /// The error type of this flow metric
    type Error: Error + Send + Sync + 'static;
    /// The type for assigning flow partitioning
    ///
    /// Normally [`f32`] or [`f64`]
    type TFlow: Flow;
    /// Apply the metric
    ///
    /// This should assign non-[`Flow::no_flow()`] values to receiving
    /// directions. Receiving directions MUST have lower elevation.
    #[allow(clippy::missing_errors_doc)] // user-provided implementation
    fn metric(
        &mut self,
        meta: &GridMeta,
        dem: &[TElev],
        flows: &mut [[Self::TFlow; 8]],
        nrec: &mut [u8],
    ) -> Result<(), Self::Error>;
}

impl<TFlow: Flow> FlowOrder<TFlow> {
    /// The [`GridMeta`] of this grid
    ///
    /// any arrays passed in to [`Self::for_contours_bottom_up`] or
    /// [`Self::for_contours_top_down`] should match this.
    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }

    /// Create an empty [`FlowOrder`]
    ///
    /// This will initialize properly sized arrays for the grid
    #[must_use]
    pub fn empty(meta: GridMeta) -> Self {
        // SAFETY: we can create bogus flows, donors and nrec
        // as long as stack and levels are empty: no memory will be accessed
        let flows = vec![[TFlow::no_flow(); 8]; meta.size()];
        let donors = vec![[0; 8]; meta.size()];
        let nrec = vec![0; meta.size()];
        // SAFETY: stack and contours need to be empty
        // If there are no cycles, the stack contains all cells
        let stack = Vec::with_capacity(meta.size());
        // From Barnes' code: https://github.com/r-barnes/Barnes2019-Landscape/blob/2274e4639ab2299701d306fe42f24380a7845795/fastscape_RB.cpp#L358
        //
        // It's difficult to know how much memory should be allocated for levels. For
        // a square DEM with isotropic dispersion this is approximately sqrt(E/2). A
        // diagonally tilted surface with isotropic dispersion may have sqrt(E)
        // levels. A tortorously sinuous river may have up to E*E levels. We
        // compromise and choose a number of levels equal to the perimiter because
        // why not?
        let contours = Vec::with_capacity(2 * meta.width() + 2 * meta.height());
        Self {
            flows,
            donors,
            nrec,
            stack,
            contours,
            meta,
        }
    }

    /// re-calculate order with the given flow metric
    ///
    /// # Errors
    ///
    /// - if the supplied dem doesn't match the grid
    /// - if the supplied metric gives an error
    pub fn reorder<M: FlowMetric<TElev, TFlow = TFlow>, TElev>(
        &mut self,
        dem: &[TElev],
        metric: &mut M,
    ) -> Result<(), ContourError> {
        metric
            .metric(&self.meta, dem, &mut self.flows, &mut self.nrec)
            .or_raise(|| ContourError::metric_failed(&metric))?;
        compute_donors(&self.meta, &self.flows, &mut self.donors);
        generate_order(
            &mut self.nrec,
            &self.donors,
            &mut self.stack,
            &mut self.contours,
        )
        .or_raise(|| ContourError::invalid_metric("failed to generate order from metric"))
    }

    /// Create an order from a supplied dem and a metric
    ///
    /// # Errors
    ///
    /// - if the supplied dem doesn't match the grid
    /// - if the supplied metric gives an error
    pub fn from_dem_metric<TElev: Float + Sync, M: FlowMetric<TElev, TFlow = TFlow>>(
        meta: GridMeta,
        dem: &[TElev],
        metric: &mut M,
    ) -> Result<Self, ContourError> {
        meta.check(dem)
            .or_raise(|| ContourError::invalid_array(dem.len()))?;
        let mut res = Self::empty(meta);
        res.reorder(dem, metric)?;
        Ok(res)
    }

    /// iterate over levels bottom-to-top
    ///
    /// In this case, all receivers are already processed
    ///
    /// # Panics
    ///
    /// if data doesn't match the grid size
    pub fn for_contours_bottom_up<
        TArr: Send + Sync + Zero + Copy,
        F: Fn(&mut ContourAccessor<TArr, TFlow>) + Sync,
    >(
        &self,
        data: &mut [TArr],
        f: F,
    ) {
        // SAFETY: if data.len < self.meta.size, the ContourAccessor would access
        // out-of-bounds data.
        assert!(data.len() == self.meta.size());
        let b = Bazooka(data.as_mut_ptr());
        for level in self.contours.windows(2).map(|w| &self.stack[w[0]..w[1]]) {
            level.par_iter().for_each(|v| {
                // SAFETY: we have a sound topological sorting. The ContourAccessor
                // only accesses donors and receivers, and those are on
                // different levels
                unsafe {
                    f(&mut ContourAccessor::new(
                        &b,
                        *v,
                        &self.meta,
                        &self.flows,
                        &self.donors,
                    ));
                }
            });
        }
    }

    /// iterate over levels top-to-bottom
    ///
    /// In this case, all donors are already processed
    ///
    /// # Panics
    ///
    /// if data doesn't match the grid size
    pub fn for_contours_top_down<
        TArr: Send + Sync + Zero + Copy,
        F: Fn(&mut ContourAccessor<TArr, TFlow>) + Sync,
    >(
        &self,
        data: &mut [TArr],
        f: F,
    ) {
        let b = Bazooka(data.as_mut_ptr());
        for level in self
            .contours
            .windows(2)
            .rev()
            .map(|w| &self.stack[w[0]..w[1]])
        {
            level.into_par_iter().for_each(|v| {
                // SAFETY: we have a sound topological sorting. The ContourAccessor
                // only accesses donors and receivers, and those are on
                // different levels
                unsafe {
                    f(&mut ContourAccessor::new(
                        &b,
                        *v,
                        &self.meta,
                        &self.flows,
                        &self.donors,
                    ));
                }
            });
        }
    }

    /// Get immutable access to the "contours" for debugging purposes
    #[must_use]
    pub fn contours(&self) -> &[usize] {
        &self.contours
    }

    /// The number of "contours"
    ///
    /// This is the number of parallel chunks of the graph.
    #[must_use]
    pub fn n_contours(&self) -> usize {
        self.contours.len() - 1
    }

    /// Get immutable access to the stack for debugging purposes
    #[must_use]
    pub fn stack(&self) -> &[usize] {
        &self.stack
    }

    /// The flows assigned to each cell in the grid
    ///
    /// ```
    /// use oxscape_core::{Flow, Dir};
    /// let mut flows = [<f32 as Flow>::no_flow(); 8];
    /// flows[Dir::Left as usize] = 1.0;
    /// ```
    #[must_use]
    pub fn flows(&self) -> &[[TFlow; 8]] {
        &self.flows
    }

    /// Get immutable access to the donors array for debugging purposes
    ///
    /// This is a direction->index map for each cell
    #[must_use]
    pub fn donors(&self) -> &[[usize; 8]] {
        &self.donors
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::mflow::metrics::dinf;

    type TFlow = f64;

    #[test]
    fn test_order_single_level() {
        let o = FlowOrder {
            meta: GridMeta::new(2, 2),
            // nothing flows anywhere, single level
            flows: vec![[TFlow::no_flow(); 8]; 4],
            donors: vec![[NOT_A_DONOR; 8]; 4],
            nrec: vec![0; 4],
            stack: vec![0, 1, 2, 3],
            contours: vec![0, 4],
        };
        assert_eq!(o.n_contours(), 1);
        let mut data = [0, 1, 2, 3];
        o.for_contours_bottom_up(&mut data, |a| {
            assert_eq!(a.donors(), [(0.0, 0); 8]);
            assert_eq!(a.receivers(), [(0.0, 0); 8]);
            *a.cell() += 1;
        });
        assert_eq!(data, [1, 2, 3, 4]);
        o.for_contours_top_down(&mut data, |a| {
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
        let nf: f64 = TFlow::no_flow();
        let o = FlowOrder {
            meta: GridMeta::new(2, 2),
            //
            // 1 2 3
            // 0 x 4
            // 7 6 5
            flows: vec![
                // this would be a cycle and very dangerous, but levels are accordingly
                //0   1   2   3   4   5   6   7
                [nf,nf,nf,nf,1.0,nf,nf,nf],[1.0,nf,nf,nf,nf,nf,nf,nf],
                [nf,nf,nf,nf,1.0,nf,nf,nf],[1.0,nf,nf,nf,nf,nf,nf,nf],
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
            contours: vec![0, 2, 4],
        };
        assert_eq!(o.n_contours(), 2);

        println!("going up");
        // in this context, this is unsafe, because we have "unsound" order
        o.for_contours_bottom_up(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != TFlow::no_flow() {
                    *a.cell() += val
                }
            }
        });
        assert_eq!(data, [1, 2, 5, 8]);
        o.for_contours_top_down(&mut data, |a| {
            println!("recv: {:?}, don: {:?}", a.receivers(), a.donors());
            assert_eq!(a.receivers(), a.donors());
            for (fact, val) in a.receivers() {
                if fact != TFlow::no_flow() {
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
        let order = FlowOrder::from_dem_metric(meta, &consts::H_3, &mut dinf()).unwrap();
        assert_eq!(order.flows, vec![
            [0.0;8],[0.0;8],[0.0;8],
            [0.0;8],[0.0,0.590334470601733,0.40966552939826695,0.0,0.0, 0.0, 0.0, 0.0],[0.0;8],
            [0.0;8],[0.0;8],[0.0;8],
        ]);
        assert_eq!(&order.stack, &[
            0,1,2,3,5,6,7,8,4
        ]);
        assert_eq!(&order.contours, &[0,8,9]);
        let mut acc = [1.0;9];
        order.for_contours_top_down(&mut acc, |c| {
            *c.cell() += c.donors().iter().map(|(frac, val)| frac*val).sum::<f64>()
        });
        assert_eq!(&acc, &[
            1.590334470601733, 1.40966552939826695, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]);
    }
}

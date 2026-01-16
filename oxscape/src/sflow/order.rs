use crate::{Bazooka, GridMeta, NOT_A_DONOR};
use anyhow::{Result, anyhow};
use num_traits::{Float, Zero};
use rayon::prelude::*;

pub const NO_FLOW: u8 = 9;

pub fn generate_boring_terrain(dem: &mut [f64], start: f64, delta: f64) {
    dem.into_par_iter().enumerate().for_each(|(v, a)| {
        *a = start + v as f64 * delta;
    })
}

/// Flow metric.
///
/// To implement this, receivers should contain a flow direction as shown below
/// or `oxscape::sflow::NO_FLOW` Anything else will give unpredictable results.
/// Edge cells should also give `oxscape::sflow::NO_FLOW` For an example
/// implementation, see the D8 `compute_receivers` function.
///
/// ```
/// # let x = 4;
/// let arr = [
/// 1,2,3,
/// 0,x,4,
/// 7,6,5,
/// ];
///
/// ```
pub trait FlowMetric {
    fn metric<T: Float + From<f64> + Sync>(
        &self,
        meta: &GridMeta,
        dem: &[T],
        receivers: &mut [u8],
    ) -> Result<()>;
}

#[cfg(test)]
fn compute_donors(meta: &GridMeta, rec: &[u8], donor: &mut [[usize; 8]]) {
    donor.fill([NOT_A_DONOR; 8]);
    for c in 0..meta.size {
        let receiver = rec[c];
        if receiver == NO_FLOW {
            continue;
        }
        //If this cell passes flow to a downhill cell, make a note of it in that
        //downhill cell's donor array and increment its donor counter
        let n = meta.shift(c, receiver);
        donor[n][receiver as usize] = c;
    }
}

/// parallelly compute donors.
fn compute_donors_par(meta: &GridMeta, rec: &[u8], donors: &mut [[usize; 8]]) {
    // In the single-flow case, it's more efficient to iterate receivers
    // because we don't have to check all neighbours of a donor
    assert_eq!(donors.len(), meta.size);
    donors.fill([NOT_A_DONOR; 8]);
    // cast &mut [[usize;8]] to &mut [usize] so we can access cell's directions
    // in parallel without aliasing problems
    let d_usize: &mut [usize] = bytemuck::cast_slice_mut(donors);
    let b = Bazooka(d_usize.as_mut_ptr());
    let r = &b;
    rec.par_iter().enumerate().for_each(|(idx, dir)| {
        if *dir == NO_FLOW {
            return;
        }
        //If this cell passes flow to a downhill cell, make a note of it in that
        //downhill cell's donor array at the direction's index
        let n: usize = meta.shift(idx, *dir);
        // bounds check
        assert!(n < meta.size);
        // SAFETY: we are the only cell from this direction.
        //
        unsafe {
            *r.0.add(n * 8 + GridMeta::rev(usize::from(*dir))) = idx;
        }
    });
}

///Cells must be ordered so that they can be traversed such that higher cells
///are processed before their lower neighbouring cells. This method creates
///such an order. It also produces a list of "levels": cells which are,
///topologically, neither higher nor lower than each other. Cells in the same
///level can all be processed simultaneously without having to worry about
///race conditions.
pub fn generate_order(
    rec: &[u8],
    donor: &[[usize; 8]],
    stack: &mut Vec<usize>,
    levels: &mut Vec<usize>,
) {
    levels.clear();
    stack.clear();

    //Since each value of the `levels` array is later used as the starting value
    //of a for-loop, we include a zero at the beginning of the array.
    levels.push(0);

    // outer edge can be added immediately and is a single level
    for (idx, c) in rec.iter().enumerate() {
        if *c == NO_FLOW {
            stack.push(idx);
        }
    }
    levels.push(stack.len());

    let mut level_bottom = 0; // first cell of current level
    let mut level_top = stack.len(); // last cell of current level

    // full BFS search, but we fill an array, so later it can be done in parallel
    while level_bottom < level_top {
        for si in level_bottom..level_top {
            let c = stack[si];
            // load donating cells of focal cell into the stack
            for k in donor[c] {
                if k != NOT_A_DONOR {
                    stack.push(k);
                }
            }
        }
        level_bottom = level_top; // start at the previous level
        level_top = stack.len(); // and process all cells that were added

        levels.push(stack.len());
    }
    levels.pop();
}

pub struct LevelAccessor<'a, T: Send + Sync> {
    arr: &'a Bazooka<T>,
    idx: usize,
    meta: &'a GridMeta,
    donors: &'a [[usize; 8]],
    receivers: &'a [u8],
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
        donors: &'a [[usize; 8]],
        receivers: &'a [u8],
    ) -> Self {
        Self {
            arr,
            idx,
            meta,
            donors,
            receivers,
        }
    }

    /// Get mutable access to the current cell
    #[inline]
    pub fn cell(&mut self) -> &mut T {
        // SAFETY: nothing reads arr[idx]
        unsafe { self.arr.0.add(self.idx).as_mut().unwrap() }
    }

    #[inline]
    pub fn idx(&self) -> usize {
        self.idx
    }

    #[inline]
    pub fn recv_dir(&self) -> u8 {
        self.receivers[self.idx]
    }

    #[inline]
    pub fn receiver(&self) -> T {
        let n = self.meta.shift(self.idx, self.receivers[self.idx]);
        assert!(n < self.meta.size);
        // SAFETY: topological sorting is based on this flow metric.
        // Therefore, any direction that is NOT NO_FLOW_GEN is in a
        // different level and can be safely accessed.
        unsafe { self.arr.0.add(n).read() }
    }

    #[inline]
    pub fn donors(&self) -> [T; 8] {
        let mut res = [T::zero(); 8];
        for n in 0..8 {
            let don_idx = self.donors[self.idx][n];
            if don_idx == NOT_A_DONOR {
                continue;
            }
            // SAFETY: topological sorting is based on this flow metric.
            // Therefore, any direction that is NOT NO_FLOW_GEN is in a
            // different level and can be safely accessed.
            unsafe { res[n] = self.arr.0.add(self.donors[self.idx][n]).read() }
        }
        res
    }
}

#[derive(Debug)]
pub struct Order {
    meta: GridMeta,
    donors: Vec<[usize; 8]>,
    receivers: Vec<u8>,
    stack: Vec<usize>,
    levels: Vec<usize>,
}

impl Order {
    pub fn levels(&self) -> &[usize] {
        &self.levels
    }

    pub fn stack(&self) -> &[usize] {
        &self.stack
    }

    pub fn n_levels(&self) -> usize {
        self.levels.len() - 1
    }

    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }

    /// Create an uninitialized order
    pub fn empty(meta: GridMeta) -> Self {
        let receivers = vec![0; meta.size];
        let donors = vec![[0; 8]; meta.size];
        // SAFETY: stack and levels need to be empty so that no traversal is done
        let stack = Vec::with_capacity(meta.size);
        let levels = Vec::with_capacity(2 * meta.width + 2 * meta.height);
        Self {
            meta,
            donors,
            receivers,
            stack,
            levels,
        }
    }

    pub fn from_dem_metric<M: FlowMetric>(meta: GridMeta, dem: &[f64], metric: M) -> Result<Self> {
        if meta.size != dem.len() {
            return Err(anyhow!("meta dem mismatch"));
        }
        let mut s = Self::empty(meta);
        s.reorder(dem, metric)?;
        Ok(s)
    }

    /// re-calculate order with the given flow metric
    pub fn reorder<M: FlowMetric>(&mut self, dem: &[f64], metric: M) -> Result<()> {
        metric.metric(&self.meta, dem, &mut self.receivers)?;
        compute_donors_par(&self.meta, &self.receivers, &mut self.donors);
        generate_order(
            &self.receivers,
            &self.donors,
            &mut self.stack,
            &mut self.levels,
        );
        Ok(())
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
            level.into_par_iter().for_each(|v| {
                if self.receivers[*v] == NO_FLOW {
                    return;
                }
                // SAFETY: we have a sound topological sorting. The LevelAccessor
                // only accesses donors and receivers, and those are on
                // different levels
                unsafe {
                    f(&mut LevelAccessor::new(
                        &b,
                        *v,
                        &self.meta,
                        &self.donors,
                        &self.receivers,
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
                        &self.donors,
                        &self.receivers,
                    ))
                }
            });
        }
    }
}

#[cfg(test)]
mod test {
    use std::panic;
    use std::{
        collections::HashSet,
        panic::{AssertUnwindSafe, catch_unwind},
    };

    use super::*;

    const META: GridMeta = GridMeta::new(6, 6);
    #[rustfmt::skip]
    mod consts {
        use crate::NOT_A_DONOR;

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
    //0   4
    //7 6 5
    pub const REC: [u8;36] = [
    //  0   1   2   3   4   5
        9,  9,  9,  9,  9,  9,// 0
        9,  2,  2,  2,  2,  9,// 1
        9,  2,  2,  2,  2,  9,// 2
        9,  2,  2,  2,  2,  9,// 3
        9,  2,  2,  2,  2,  9,// 4
        9,  9,  9,  9,  9,  9,// 5
    ];
    const ND: usize = NOT_A_DONOR;
    pub const DONOR: [[usize;8];36] = [
        //     0     1                        2                         3                         4                         5                         6                         7                         8                         9
        //    [1   ] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8]
        /* 0*/[ND;8],[ND,ND,ND,ND,ND,ND, 7,ND], [ND,ND,ND,ND,ND,ND, 8,ND],[ND,ND,ND,ND,ND,ND, 9,ND],[ND,ND,ND,ND,ND,ND,10,ND], [ND;8],
              [ND;8],[ND,ND,ND,ND,ND,ND,13,ND], [ND,ND,ND,ND,ND,ND,14,ND],[ND,ND,ND,ND,ND,ND,15,ND],[ND,ND,ND,ND,ND,ND,16,ND], [ND;8],
              [ND;8],[ND,ND,ND,ND,ND,ND,19,ND], [ND,ND,ND,ND,ND,ND,20,ND],[ND,ND,ND,ND,ND,ND,21,ND],[ND,ND,ND,ND,ND,ND,22,ND], [ND;8],
              [ND;8],[ND,ND,ND,ND,ND,ND,25,ND], [ND,ND,ND,ND,ND,ND,26,ND],[ND,ND,ND,ND,ND,ND,27,ND],[ND,ND,ND,ND,ND,ND,28,ND], [ND;8],
              [ND;8],[ND;8], [ND;8], [ND;8], [ND;8], [ND;8],
              [ND;8],[ND;8], [ND;8], [ND;8], [ND;8], [ND;8]
    ];
    pub const LEVELS: [usize;6] = [0, 20, 24, 28, 32, 36];
    pub const STACK: [usize;36] = [
    //  0  1  2  3  4  5  6   7   8   9  10  11  12  13  14  15  16  17  18  19
        0, 1, 2, 3, 4, 5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 31, 32, 33, 34, 35,
    // 20 21 22  23
        7, 8, 9, 10,
    //  24  25  26  27
        13, 14, 15, 16,
    //  28  29  30  31
        19, 20, 21, 22,
    //  32  33  34  35
        25, 26, 27, 28,
    ];
    }

    #[test]
    fn test_compute_donors() {
        let mut donor = vec![[0; 8]; META.size];
        compute_donors_par(&META, &consts::REC, &mut donor);
        assert_eq!(donor, consts::DONOR);
    }

    #[test]
    fn test_generate_order() {
        let mut levels = Vec::with_capacity(META.width * 2 + META.height * 2);
        let mut stack = Vec::with_capacity(META.size);
        generate_order(&consts::REC, &consts::DONOR, &mut stack, &mut levels);
        assert_eq!(stack, consts::STACK);
        assert_eq!(levels, consts::LEVELS);
    }

    #[test]
    #[ignore = "Hour long test"]
    fn test_generate_order_exhausive() {
        // cargo test --release -- order_d8::test::test_generate_order_exhausive --ignored --nocapture
        // silence panic output
        let default_hook = panic::take_hook();
        panic::set_hook(Box::new(|_| {}));

        let meta = GridMeta::new(3, 3);
        let mut donors = vec![[NOT_A_DONOR; 8]; meta.size];
        let mut stack = Vec::with_capacity(meta.size);
        let mut levels = Vec::with_capacity(meta.size);
        let mut receivers: Vec<u8> = vec![9; meta.size];
        let mut set = HashSet::with_capacity(meta.size);

        let total = meta.size.pow(9);

        for mut n in 68555889..total {
            // TODO: reset to 0 when done
            if (n % 9usize.pow(6)) == 0 {
                println!("{n} out of {} iterations", 9usize.pow(9));
            }
            // decode n into base-9 digits
            for i in 0..9 {
                receivers[i] = (n % 9) as u8;
                n /= 9;
            }
            if catch_unwind(AssertUnwindSafe(|| {
                compute_donors(&meta, &receivers, &mut donors);
                generate_order(&receivers, &donors, &mut stack, &mut levels);
            }))
            .is_err()
            {
                continue;
            }
            for level in levels.windows(2).map(|w| &stack[w[0]..w[1]]) {
                // create a set to check duplicates
                set.clear();
                // level indices don't overlap
                for idx in level {
                    assert!(set.insert(*idx));
                }
                // allowed_indices point OUTSIDE the level
                for idx in level {
                    assert!(!set.contains(&meta.shift(*idx, receivers[*idx])));
                    for n in 0..8 {
                        let don_idx = donors[*idx][n];
                        if don_idx != NOT_A_DONOR {
                            assert!(!set.contains(&don_idx))
                        }
                    }
                }
            }
        }

        // restore hook so other tests behave normally
        panic::set_hook(default_hook);
    }

    #[test]
    fn test_compute_donors_loop() {
        let meta = &GridMeta::new(2, 1);
        let rec = [4, 0];
        let mut donors = vec![[0; 8]; 2];
        compute_donors_par(&meta, &rec, &mut donors);
        const N: usize = NOT_A_DONOR;
        assert_eq!(donors, [[N, N, N, N, 1, N, N, N], [0, N, N, N, N, N, N, N]]);
    }

    #[test]
    fn test_generate_order_loop() {
        let mut levels = Vec::with_capacity(100);
        let mut stack = Vec::with_capacity(100);
        let rec = [4, 0];
        const N: usize = NOT_A_DONOR;
        let donors = vec![[N, N, N, N, 1, N, N, N], [0, N, N, N, N, N, N, N]];
        generate_order(&rec, &donors, &mut stack, &mut levels);
        assert_eq!(stack, &[]);
        assert_eq!(levels, &[0]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_compute_donors_xwrap() {
        let meta = &GridMeta::new(2, 2);
        let rec = [
            NO_FLOW,0,
            0,0,
        ];
        let mut donors = vec![[0;8];4];
        compute_donors(&meta, &rec, &mut donors);
        const N: usize = NOT_A_DONOR;
        assert_eq!(donors, [
            [1,N,N,N,N,N,N,N],[2,N,N,N,N,N,N,N],
            [3,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N]
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_generate_order_xwrap() {
        let rec = [
            NO_FLOW,0,
            0,0,
        ];
        const N: usize = NOT_A_DONOR;
        let donors = [
            [1,N,N,N,N,N,N,N],[2,N,N,N,N,N,N,N],
            [3,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N]
        ];
        let mut levels = Vec::with_capacity(4);
        let mut stack = Vec::with_capacity(4);
        generate_order(&rec, &donors, &mut stack, &mut levels);
        assert_eq!(stack, &[0,1,2,3]);
        assert_eq!(levels, &[0,1,2,3,4]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_compute_donors_xwrap_double() {
        let meta = &GridMeta::new(2, 2);
        let rec = [
            NO_FLOW,0,
            0,2,
        ];
        let mut donors = vec![[0;8];4];
        compute_donors(&meta, &rec, &mut donors);
        const N: usize = NOT_A_DONOR;
        assert_eq!(donors, [
            [1,N,N,N,N,N,N,N],[2,N,3,N,N,N,N,N],
            [N,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N]
        ]);
        let mut stack = Vec::new();
        let mut levels = Vec::new();
        generate_order(&rec, &donors, &mut stack, &mut levels);
        assert_eq!(stack, &[0,1,2,3]);
        assert_eq!(levels, &[0,1,2,4]);
    }

    #[test]
    #[should_panic(expected = "n < meta.size")]
    fn test_par_donors_oob() {
        let meta = &GridMeta::new(3, 1);
        // these say that there are out-of-bounds receivers
        let rec = [6, 6, 6];
        let mut donors = [[NOT_A_DONOR; 8]; 3];
        // this will access out-of-bounds memory addresses, which we catch
        compute_donors_par(meta, &rec, &mut donors);
    }

    #[test]
    fn test_order_empty_run() {
        let order = Order::empty(GridMeta::new(2, 2));
        order.for_lvls_bottom_up(&mut [0.0; 4], |_| panic!("I shouldn't run!"));
        order.for_lvls_top_down(&mut [0.0; 4], |_| panic!("I shouldn't run!"));
    }
}

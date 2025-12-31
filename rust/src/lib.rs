pub mod order_mflow;
pub mod order_sflow;

use anyhow::Result;
use rayon::prelude::*;
use std::env;
use std::f64::consts::SQRT_2;
use std::fs::File;
use std::io::{BufWriter, Write};

pub mod mflow;

pub const GIT_HASH: &str = env!("GIT_HASH");
pub const NOT_A_DONOR: usize = usize::MAX;

///This is a quick-and-dirty, zero-dependency function for saving the outputs of
///the model in ArcGIS ASCII DEM format (aka Arc/Info ASCII Grid, AAIGrid).
///Production code for experimentation should probably use GeoTIFF or a similar
///format as it will have a smaller file size and, thus, save quicker.
pub fn print_dem(filename: &str, h: &[f64], width: &usize, height: &usize) -> std::io::Result<()> {
    let f = File::create(filename)?;
    let mut w = BufWriter::new(f);
    let mut buf = ryu::Buffer::new();
    writeln!(&mut w, "ncols {}", width - 2)?;
    writeln!(&mut w, "nrows {}", height - 2)?;
    writeln!(&mut w, "xllcorner 637500.000")?;
    writeln!(&mut w, "yllcorner 206000.000")?;
    writeln!(&mut w, "NODATA_value -9999")?;
    for y in 1..height - 1 {
        for x in 1..width - 1 {
            w.write_all(buf.format(h[y * width + x]).as_bytes())?;
            w.write_all(b" ")?;
        }
        w.write_all(b"\n")?;
    }
    w.flush()
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Params {
    pub keq: f64,
    pub neq: f64,
    pub meq: f64,
    pub ueq: f64,
    pub dt: f64,
    pub tol: f64,
    pub cell_area: f64,
}

impl Default for Params {
    fn default() -> Self {
        Self {
            keq: 2e-6,
            neq: 2.0,
            meq: 0.8,
            ueq: 2e-3,
            dt: 1000.0,
            tol: 1e-3,
            cell_area: 1.0,
        }
    }
}

pub const XSHIFT: [isize; 8] = [-1, -1, 0, 1, 1, 1, 0, -1];
pub const YSHIFT: [isize; 8] = [0, -1, -1, -1, 0, 1, 1, 1];

#[derive(Debug, Clone, Copy)]
pub struct GridMeta {
    width: usize,
    height: usize,
    size: usize,
    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// ```
    /// # use oxscape::GridMeta;
    /// # let x = 4;
    /// # let meta = GridMeta::new(3,3);
    /// let arr = [
    ///  1,2,3,
    ///  0,x,4,
    ///  7,6,5
    /// ];
    /// for i in 0..8 {
    ///     assert!(arr[(4 + meta.nshift()[i]) as usize] == i)
    /// }
    /// ```
    nshift: [isize; 8],
}

impl GridMeta {
    pub const fn new(width: usize, height: usize) -> Self {
        let iwidth = width as isize;
        Self {
            width,
            height,
            size: width * height,
            nshift: [
                -1,
                -iwidth - 1,
                -iwidth,
                -iwidth + 1,
                1,
                iwidth + 1,
                iwidth,
                iwidth - 1,
            ],
        }
    }

    pub fn check_dem<T>(&self, dem: &[T]) -> Result<()> {
        if dem.len() != self.size {
            Err(anyhow::anyhow!("size mismatch"))
        } else {
            Ok(())
        }
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn size(&self) -> usize {
        self.size
    }

    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// ```
    /// # use oxscape::GridMeta;
    /// # let x = 4;
    /// # let meta = GridMeta::new(3,3);
    /// let arr = [
    ///  1,2,3,
    ///  0,x,4,
    ///  7,6,5
    /// ];
    /// for i in 0..8 {
    ///     assert!(arr[(4 + meta.nshift()[i]) as usize] == i)
    /// }
    /// ```
    pub fn nshift(&self) -> &[isize; 8] {
        &self.nshift
    }

    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// ```
    /// # use oxscape::GridMeta;
    /// # let x = 4;
    /// # let meta = GridMeta::new(3,3);
    /// let arr = [
    ///  1,2,3,
    ///  0,x,4,
    ///  7,6,5
    /// ];
    /// for i in 0..8 {
    ///     assert!(arr[meta.shift(4,i)] == i)
    /// }
    #[inline]
    pub fn shift(&self, idx: usize, dir: u8) -> usize {
        (isize::try_from(idx).unwrap() + self.nshift[usize::from(dir)])
            .try_into()
            .unwrap()
    }

    /// Reverse the direction of nshift:
    /// ```
    /// # use oxscape::GridMeta;
    /// # let x=4;
    /// # let meta = GridMeta::new(3,3);
    /// let arr = [
    /// 1,2,3,
    /// 0,x,4,
    /// 7,6,5,
    /// ];
    /// for n in 0..8 {
    ///   let rec_idx = (4+meta.nshift()[n]) as usize;
    ///   let rec = arr[rec_idx];
    ///   assert_eq!(rec, n);
    ///   let _x = arr[(rec_idx as isize+meta.nshift()[GridMeta::rev(rec)]) as usize];
    ///   assert_eq!(_x, x);
    /// }
    /// ```
    #[inline]
    pub const fn rev(n: usize) -> usize {
        (n + 4) % 8
    }

    #[inline]
    pub fn is_edge_cell(&self, x: usize, y: usize) -> bool {
        x == 0 || y == 0 || x == self.width - 1 || y == self.height - 1
    }

    #[inline]
    pub fn is_edge(&self, i: usize) -> bool {
        let (x, y) = self.i_to_xy(i);
        self.is_edge_cell(x, y)
    }

    #[inline]
    pub fn in_grid(&self, x: isize, y: isize) -> bool {
        x >= 0 && x < self.width as isize && y >= 0 && y < self.height as isize
    }

    #[inline]
    pub fn i_to_xy(&self, i: usize) -> (usize, usize) {
        (i % self.width, i / self.width)
    }

    #[inline]
    pub fn xy_to_i(&self, x: usize, y: usize) -> usize {
        x + y * self.width
    }
}

const NO_FLOW: i8 = -1;
const DR: [f64; 8] = [1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2];

pub fn generate_boring_terrain(meta: &GridMeta, mut start: f64, delta: f64, h: &mut [f64]) {
    for y in 2..meta.height - 2 {
        for x in 2..meta.width - 2 {
            let c = y * meta.width + x;
            h[c] = start;
            start += delta;
        }
    }
}

///The receiver of a focal cell is the cell which receives the focal cells'
///flow. Here, we model the receiving cell as being the one connected to the
///focal cell by the steepest gradient. If there is no local gradient, then
///the special value NO_FLOW is assigned.
pub fn compute_receivers(meta: &GridMeta, h: &[f64], rec: &mut [i8]) {
    rec.fill(NO_FLOW);
    rec.par_chunks_exact_mut(meta.width)
        .enumerate()
        .take(meta.height - 2)
        .skip(2)
        .for_each(|(y, row)| {
            for x in 2..meta.width - 2 {
                let c: usize = y * meta.width + x;

                let mut max_slope = 0.0;
                let mut max_n = NO_FLOW;

                for n in 0..8 {
                    let slope = (h[c] - h[(c as isize + meta.nshift[n]) as usize]) / DR[n];
                    if slope > max_slope {
                        max_slope = slope;
                        max_n = n as i8;
                    }
                }
                row[x] = max_n;
            }
        });
}

pub fn compute_donors(meta: &GridMeta, rec: &[i8], ndon: &mut [u8], donor: &mut [[usize; 8]]) {
    ndon.fill(0);
    for c in 0..meta.size {
        if rec[c] == NO_FLOW {
            continue;
        }
        //If this cell passes flow to a downhill cell, make a note of it in that
        //downhill cell's donor array and increment its donor counter
        let n = (c as isize + meta.nshift[rec[c] as usize]) as usize;
        donor[n][ndon[n] as usize] = c;
        ndon[n] += 1;
    }
}

///Cells must be ordered so that they can be traversed such that higher cells
///are processed before their lower neighbouring cells. This method creates
///such an order. It also produces a list of "levels": cells which are,
///topologically, neither higher nor lower than each other. Cells in the same
///level can all be processed simultaneously without having to worry about
///race conditions.
pub fn generate_order(
    meta: &GridMeta,
    rec: &[i8],
    donor: &[[usize; 8]],
    ndon: &[u8],
    levels: &mut [usize],
    nlevels: &mut usize,
    stack: &mut [usize],
) {
    let mut nstack = 0;

    //Since each value of the `levels` array is later used as the starting value
    //of a for-loop, we include a zero at the beginning of the array.
    levels[0] = 0;
    *nlevels = 1;

    // outer edge can be added immediately and is a single level
    for c in 0..meta.size {
        if rec[c] == NO_FLOW {
            stack[nstack] = c;
            nstack += 1;
        }
    }
    levels[*nlevels] = nstack;
    *nlevels += 1;

    let mut level_bottom = 0; // first cell of current level
    let mut level_top = nstack; // last cell of current level

    // full BFS search, but we fill an array, so later it can be done in parallel
    while level_bottom < level_top {
        for si in level_bottom..level_top {
            let c = stack[si];
            // load donating cells of focal cell into the stack
            for k in 0..ndon[c] {
                let n = donor[c][k as usize];
                stack[nstack] = n;
                nstack += 1;
            }
        }
        level_bottom = level_top; // start at the previous level
        level_top = nstack; // and process all cells that were added

        levels[*nlevels] = nstack;
        *nlevels += 1;
    }
    *nlevels -= 1;
}

pub fn add_uplift(meta: &GridMeta, params: &Params, h: &mut [f64]) {
    for y in 2..meta.height - 2 {
        for x in 2..meta.width - 2 {
            let c = y * meta.width + x;
            h[c] += params.ueq * params.dt;
        }
    }
}

/// (*mut T) cannot be shared between threads.
/// This struct allows us to shoot it between threads
/// Ensuring safe landing is our responsibility
struct Bazooka<T: Send + Sync>(*mut T);

/// here we say references can be shared between threads
/// This is under the very strict guarantee that we won't misuse it
///
/// SAFETY: We will only ever read from and write to disjoint indices within a parallel region
unsafe impl<T: Send + Sync> Sync for Bazooka<T> {}

pub unsafe fn compute_flow_acc(
    params: &Params,
    levels: &[usize],
    nlevels: usize,
    stack: &[usize],
    donor: &[[usize; 8]],
    ndon: &[u8],
    accum: &mut [f64],
) {
    accum.fill(params.cell_area);

    let b = Bazooka(accum.as_mut_ptr());
    let acc = &b;

    for level in levels
        .windows(2)
        .take(nlevels - 2)
        .rev()
        .map(|w| &stack[w[0]..w[1]])
    {
        // SAFETY: do NOT use `accum` inside this closure, only acc_ptr
        // Also ∀c∈level:don[c]∉level
        level.par_iter().for_each(|c| unsafe {
            let mut sum = acc.0.add(*c).read();
            for k in 0..ndon[*c] {
                let n = donor[*c][k as usize];
                sum += acc.0.add(n).read();
            }
            *acc.0.add(*c) = sum;
        });
    }
}

pub unsafe fn erode(
    meta: &GridMeta,
    params: &Params,
    levels: &[usize],
    nlevels: usize,
    stack: &[usize],
    rec: &[i8],
    accum: &[f64],
    h: &mut [f64],
) {
    let h_b = Bazooka(h.as_mut_ptr());
    let h_ref = &h_b;
    for level in levels
        .windows(2)
        .take(nlevels - 1)
        .map(|w| &stack[w[0]..w[1]])
    {
        // SAFETY: do not use h inside this closure
        //
        // Also ∀c∈level:rec[c]∉level
        //
        // For everything to make sense, also all receivers have been processed,
        // but that is not a memory safety issue
        level.par_iter().for_each(|c| {
            if rec[*c] == NO_FLOW {
                return;
            }
            let n = *c as isize + meta.nshift[rec[*c] as usize];

            let length = DR[rec[*c] as usize];

            let fact =
                params.keq * params.dt * accum[*c].powf(params.meq) / length.powf(params.neq);

            unsafe {
                let h0 = h_ref.0.add(*c).read();
                let hn = h_ref.0.add(n as usize).read();
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
                *h_ref.0.add(*c) = hnew;
            }
        });
    }
}

pub fn run(nstep: usize, meta: &GridMeta, params: &Params, h: &mut [f64]) {
    let mut accum = vec![0.0; meta.size];
    let mut rec = vec![NO_FLOW; meta.size];
    let mut ndon = vec![0; meta.size];
    let mut donor = vec![[0; 8]; meta.size];
    let mut stack = vec![0; meta.size];
    let mut levels = vec![0; 2 * meta.width + 2 * meta.height];
    let mut nlevels = 0;

    for step in 0..nstep {
        compute_receivers(meta, h, &mut rec);
        compute_donors(meta, &rec, &mut ndon, &mut donor);
        generate_order(
            meta,
            &rec,
            &donor,
            &ndon,
            &mut levels,
            &mut nlevels,
            &mut stack,
        );
        unsafe {
            compute_flow_acc(params, &levels, nlevels, &stack, &donor, &ndon, &mut accum);
        }
        add_uplift(meta, params, h);
        unsafe {
            erode(meta, params, &levels, nlevels, &stack, &rec, &accum, h);
        }

        if step % 20 == 0 {
            println!("step {step}.");
        }
    }
}

#[cfg(test)]
mod test {
    use crate::test::consts::{
        ACCUM, DONOR, H_INIT, H_LIFT, H_ONE, LEVELS, N_LEVELS, NDON, REC, STACK,
    };

    use super::*;

    const META: GridMeta = GridMeta::new(10, 10);
    #[rustfmt::skip]
    mod consts {
    pub const H_INIT: [f64;100] = [
        //1   2    3    4    5    6    7    8    9    10
    /*0*/0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 0
    /*1*/0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 1
    /*2*/0.0, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 0.0, 0.0, // 2
    /*3*/0.0, 0.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 0.0, 0.0, // 3
    /*4*/0.0, 0.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 0.0, 0.0, // 4
    /*5*/0.0, 0.0, 9.5,10.0,10.5,11.0,11.5,12.0, 0.0, 0.0, // 5
    /*6*/0.0, 0.0,12.5,13.0,13.5,14.0,14.5,15.0, 0.0, 0.0, // 6
    /*7*/0.0, 0.0,15.5,16.0,16.5,17.0,17.5,18.0, 0.0, 0.0, // 7
    /*8*/0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 8
    /*9*/0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 9
    ];
    //1 2 3
    //0   4
    //7 6 5
    pub const REC: [i8;100] = [
        //0  1   2   3   4   5   6   7   8   9
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 0
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 1
        -1, -1,  0,  2,  2,  2,  2,  2, -1, -1, // 2
        -1, -1,  0,  2,  2,  2,  2,  4, -1, -1, // 3
        -1, -1,  0,  2,  2,  2,  2,  4, -1, -1, // 4
        -1, -1,  0,  2,  2,  2,  2,  4, -1, -1, // 5
        -1, -1,  0,  2,  2,  2,  2,  4, -1, -1, // 6
        -1, -1,  0,  6,  6,  6,  6,  4, -1, -1, // 7
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 8
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 9
    ];
    pub const DONOR: [[usize;8];100] = [
        //     0                        1                        2                         3                         4                         5                         6                         7                         8                         9
        //    [1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8] [ 1  2  3  4  5  6  7  8]
        /* 0*/[0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 1*/[0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[23, 0, 0, 0, 0, 0, 0, 0],[24, 0, 0, 0, 0, 0, 0, 0],[25, 0, 0, 0, 0, 0, 0, 0],[26, 0, 0, 0, 0, 0, 0, 0],[27, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 2*/[0, 0, 0, 0, 0, 0, 0, 0],[22, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[33, 0, 0, 0, 0, 0, 0, 0],[34, 0, 0, 0, 0, 0, 0, 0],[35, 0, 0, 0, 0, 0, 0, 0],[36, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 3*/[0, 0, 0, 0, 0, 0, 0, 0],[32, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[43, 0, 0, 0, 0, 0, 0, 0],[44, 0, 0, 0, 0, 0, 0, 0],[45, 0, 0, 0, 0, 0, 0, 0],[46, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[37, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 4*/[0, 0, 0, 0, 0, 0, 0, 0],[42, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[53, 0, 0, 0, 0, 0, 0, 0],[54, 0, 0, 0, 0, 0, 0, 0],[55, 0, 0, 0, 0, 0, 0, 0],[56, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[47, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 5*/[0, 0, 0, 0, 0, 0, 0, 0],[52, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[63, 0, 0, 0, 0, 0, 0, 0],[64, 0, 0, 0, 0, 0, 0, 0],[65, 0, 0, 0, 0, 0, 0, 0],[66, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[57, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 6*/[0, 0, 0, 0, 0, 0, 0, 0],[62, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[67, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 7*/[0, 0, 0, 0, 0, 0, 0, 0],[72, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[77, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 8*/[0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[73, 0, 0, 0, 0, 0, 0, 0],[74, 0, 0, 0, 0, 0, 0, 0],[75, 0, 0, 0, 0, 0, 0, 0],[76, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
        /* 9*/[0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],[ 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    pub const NDON: [u8;100] = [
    //  0  1  2  3  4  5  6  7  8  9
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 1, 1, 1, 1, 1, 0, 0,
        0, 1, 0, 1, 1, 1, 1, 0, 0, 0,
        0, 1, 0, 1, 1, 1, 1, 0, 1, 0,
        0, 1, 0, 1, 1, 1, 1, 0, 1, 0,
        0, 1, 0, 1, 1, 1, 1, 0, 1, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    pub const STACK: [usize;100] = [
    //     0   1   2   3   4   5   6   7   8   9
    /* 0*/ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
    /* 1*/10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    /* 2*/20, 21, 28, 29, 30, 31, 38, 39, 40, 41,
    /* 3*/48, 49, 50, 51, 58, 59, 60, 61, 68, 69,
    /* 4*/70, 71, 78, 79, 80, 81, 82, 83, 84, 85,
    /* 5*/86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    /* 6*/96, 97, 98, 99, 23, 24, 25, 26, 27, 22,
    /* 7*/32, 37, 42, 47, 52, 57, 62, 67, 72, 77,
    /* 8*/73, 74, 75, 76, 33, 34, 35, 36, 43, 44,
    /* 9*/45, 46, 53, 54, 55, 56, 63, 64, 65, 66,
    ];
    pub const LEVELS: [usize;40] = [
        //   0  1  2  3  4  5  6   7   8   9
        /*0*/0,64,84,88,92,96,100,100,  0,  0,
        /*1*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
        /*2*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
        /*3*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
    ];
    pub const N_LEVELS: usize = 7;
    pub const ACCUM: [f64;100] = [
        //    0    1    2    3    4    5    6    7    8    9
        /*0*/ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        /*1*/ 1.0, 1.0, 1.0, 6.0, 6.0, 6.0, 6.0, 2.0, 1.0, 1.0,
        /*2*/ 1.0, 2.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0,
        /*3*/ 1.0, 2.0, 1.0, 4.0, 4.0, 4.0, 4.0, 1.0, 2.0, 1.0,
        /*4*/ 1.0, 2.0, 1.0, 3.0, 3.0, 3.0, 3.0, 1.0, 2.0, 1.0,
        /*5*/ 1.0, 2.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 2.0, 1.0,
        /*6*/ 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0,
        /*7*/ 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0,
        /*8*/ 1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0,
        /*9*/ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ];
    pub const H_LIFT: [f64;100] = [
    //   0    1    2    3    4    5    6    7    8    9
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 0.0, 0.0,
        0.0, 0.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 0.0, 0.0,
        0.0, 0.0, 8.5, 9.0, 9.5,10.0,10.5,11.0, 0.0, 0.0,
        0.0, 0.0,11.5,12.0,12.5,13.0,13.5,14.0, 0.0, 0.0,
        0.0, 0.0,14.5,15.0,15.5,16.0,16.5,17.0, 0.0, 0.0,
        0.0, 0.0,17.5,18.0,18.5,19.0,19.5,20.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ];
    pub const H_ONE: [f64;100] = [
    //   0    1    2    3    4    5    6    7    8    9
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 2.487623459051949, 2.937461098743398, 3.415452179414055, 3.890308235153265, 4.362090154126089, 4.950975679639285, 0.0, 0.0,
        0.0, 0.0, 5.44079548889611, 5.945153998662335, 6.444376929803646, 6.943482721884593, 7.442471000991258, 7.87593916455426, 0.0, 0.0,
        0.0, 0.0, 8.36021365527903, 8.956328427812103, 9.456306520591438, 9.956281304365826, 10.456252765808319, 10.7680962081263, 0.0, 0.0,
        0.0, 0.0, 11.24700955229129, 11.968407305108173, 12.468406854993649, 12.9684063368871, 13.468405750513059, 13.628526529410895, 0.0, 0.0,
        0.0, 0.0, 14.10225292505446, 14.981838465285742, 15.481838459924806, 15.98183845375407, 16.481838446770258, 16.45825189005138, 0.0, 0.0,
        0.0, 0.0, 16.92695630148848, 17.394839143291662, 17.8619047206506, 18.328157301286385, 18.79360111590655, 19.258240356725203, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ];
    }

    #[test]
    fn test_meta_nshift() {
        let x = 4;
        let meta = GridMeta::new(3, 3);
        let arr = [1, 2, 3, 0, x, 4, 7, 6, 5];
        for i in 0..8 {
            let rec_idx = (4 + meta.nshift()[i]) as usize;
            let rec = arr[rec_idx];
            assert_eq!(rec, i);
        }
    }

    #[test]
    fn test_meta_rev() {
        let x = 4;
        let meta = GridMeta::new(3, 3);
        let arr = [1, 2, 3, 0, x, 4, 7, 6, 5];
        for n in 0..8 {
            let rec_idx = (4 as isize + meta.nshift()[n]) as usize;
            let rec = arr[rec_idx];
            assert_eq!(rec, n);
            let _x = arr[(rec_idx as isize + meta.nshift()[GridMeta::rev(rec)]) as usize];
            assert_eq!(_x, x);
        }
    }

    #[test]
    fn test_new() {
        let m = META;
        let mut h = vec![0.0; m.size];
        generate_boring_terrain(&m, 0.5, 0.5, &mut h);
        assert_eq!(m.width, 10);
        assert_eq!(m.height, 10);
        assert_eq!(m.size, 100);
        assert_eq!(m.nshift, [-1, -11, -10, -9, 1, 11, 10, 9]);
        assert_eq!(h, consts::H_INIT);
    }

    #[test]
    fn test_compute_receivers() {
        let mut rec = vec![NO_FLOW; META.size];
        compute_receivers(&META, &consts::H_INIT, &mut rec);
        assert_eq!(rec, consts::REC);
    }

    #[test]
    fn test_compute_donors() {
        let mut donor = vec![[0; 8]; META.size];
        let mut ndon = vec![0; META.size];
        compute_donors(&META, &REC, &mut ndon, &mut donor);
        assert_eq!(donor, consts::DONOR);
        assert_eq!(ndon, NDON);
    }

    #[test]
    fn test_generate_order() {
        let mut levels = vec![0; 40];
        let mut nlevels = 0;
        let mut stack = vec![0; META.size];
        generate_order(
            &META,
            &REC,
            &DONOR,
            &NDON,
            &mut levels,
            &mut nlevels,
            &mut stack,
        );
        assert_eq!(stack, STACK);
        assert_eq!(nlevels, 7);
        assert_eq!(levels, LEVELS);
        assert_eq!(levels, LEVELS);
    }

    #[test]
    fn test_compute_acc() {
        let mut accum = vec![0.0; META.size];
        unsafe {
            compute_flow_acc(
                &Params::default(),
                &LEVELS,
                N_LEVELS,
                &STACK,
                &DONOR,
                &NDON,
                &mut accum,
            );
        }
        assert_eq!(accum, ACCUM);
    }

    #[test]
    fn test_erode() {
        let mut h = H_LIFT.to_vec();
        unsafe {
            erode(
                &META,
                &Params::default(),
                &LEVELS,
                N_LEVELS,
                &STACK,
                &REC,
                &ACCUM,
                &mut h,
            );
        }
        assert_eq!(h, H_ONE);
    }

    #[test]
    #[rustfmt::skip]
    fn test_run() {
        let mut h = H_INIT.to_vec();
        run(1, &META, &Params::default(), &mut h);
        assert_eq!(
            h,
            vec![
                //   0    1    2    3    4    5    6    7    8    9
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 2.487623459051949, 2.937461098743398, 3.415452179414055, 3.890308235153265, 4.362090154126089, 4.950975679639285, 0.0, 0.0,
                0.0, 0.0, 5.44079548889611, 5.945153998662335, 6.444376929803646, 6.943482721884593, 7.442471000991258, 7.87593916455426, 0.0, 0.0,
                0.0, 0.0, 8.36021365527903, 8.956328427812103, 9.456306520591438, 9.956281304365826, 10.456252765808319, 10.7680962081263, 0.0, 0.0,
                0.0, 0.0, 11.24700955229129, 11.968407305108173, 12.468406854993649, 12.9684063368871, 13.468405750513059, 13.628526529410895, 0.0, 0.0,
                0.0, 0.0, 14.10225292505446, 14.981838465285742, 15.481838459924806, 15.98183845375407, 16.481838446770258, 16.45825189005138, 0.0, 0.0,
                0.0, 0.0, 16.92695630148848, 17.394839143291662, 17.8619047206506, 18.328157301286385, 18.79360111590655, 19.258240356725203, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ]
        );
        run(2, &META, &Params::default(), &mut h);
        assert_eq!(
            h,
            vec![
                //   0    1    2    3    4    5    6    7    8    9
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 6.366976330982888, 6.469075034386358, 6.8754847584176595, 7.27470060809636, 7.666973309701912, 8.705373365059101, 0.0, 0.0,
                0.0, 0.0, 9.165239369585679, 9.818352168414016, 10.312022710519171, 10.804971520586065, 11.29718342674234, 11.427060670960504, 0.0, 0.0,
                0.0, 0.0, 11.87211189857408, 12.867451106960154, 13.3671742495032, 13.866863470191484, 14.36651803038882, 14.062215460338523, 0.0, 0.0,
                0.0, 0.0, 14.493376998520368, 15.904439748517552, 16.404431584077887, 16.9044223827622, 17.404412125176933, 16.616173336198493, 0.0, 0.0,
                0.0, 0.0, 17.034286373879, 18.94502323937346, 19.445023106709886, 19.945022956769332, 20.445022789268517, 19.093791900047925, 0.0, 0.0,
                0.0, 0.0, 19.49962358131455, 19.9034782376357, 20.305375055555377, 20.70533294401423, 21.103370545546145, 21.4995062288133, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]
        );
    }
}

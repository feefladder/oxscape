use anyhow::Error;
use rand::rand_core::le;
use rayon::iter::{
    IndexedParallelIterator, IntoParallelIterator, IntoParallelRefMutIterator, ParallelIterator,
    WhileSome,
};
use rayon::max_num_threads;
use rayon::slice::ParallelSliceMut;
use std::f64::consts::SQRT_2;
use std::fs::File;
use std::io::Write;
use std::ops::IndexMut;
use std::thread::available_parallelism;
use std::{clone, env};

use crate::random::{seed_rand, uniform_rand_real};

mod random;

const GIT_HASH: &str = env!("GIT_HASH");

///This is a quick-and-dirty, zero-dependency function for saving the outputs of
///the model in ArcGIS ASCII DEM format (aka Arc/Info ASCII Grid, AAIGrid).
///Production code for experimentation should probably use GeoTIFF or a similar
///format as it will have a smaller file size and, thus, save quicker.
fn print_dem(filename: &str, h: &[f64], width: &usize, height: &usize) -> std::io::Result<()> {
    let mut f = File::create(filename)?;
    writeln!(&mut f, "ncols {}", width - 2)?;
    writeln!(&mut f, "nrows {}", height - 2)?;
    writeln!(&mut f, "xllcorner 637500.000")?;
    writeln!(&mut f, "yllcorner 206000.000")?;
    writeln!(&mut f, "NODATA_value -9999")?;
    for y in 1..height - 1 {
        for x in 1..width - 1 {
            write!(&mut f, "{} ", h[y * width + x])?;
        }
        writeln!(&mut f, "")?;
    }
    Ok(())
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

#[derive(Debug, Default, PartialEq)]
pub struct FastScapeRBPF {
    params: Params,
    width: usize,
    height: usize,
    size: usize,
    h: Vec<f64>,
    accum: Vec<f64>,
    ///Direction of receiving cell
    ///
    /// ```
    /// # let x = 4;
    /// # let iwidth = 3;
    /// # let nshift: [isize;8] = [-1,-iwidth - 1,-iwidth,-iwidth + 1,1,iwidth + 1,iwidth,iwidth - 1,];
    /// let arr = [
    /// 1,2,3,
    /// 0,x,4,
    /// 7,6,5,
    /// ];
    /// for n in 0..8 {
    ///   assert!(arr[(4+nshift[n]) as usize] == n)
    /// }
    /// ```
    rec: Vec<i32>,
    /// indices of donor cells. is 8 times as large
    donor: Vec<usize>,
    /// number of donor cells
    ndon: Vec<usize>,
    /// stack/queue
    stack: Vec<usize>,
    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    nshift: [isize; 8],

    levels: Vec<usize>,
    nlevels: usize,
    ///number of cells allowed in the stack (queue)
    stack_width: usize,
    ///Number of cells allowed in a level
    level_width: usize,
}

impl FastScapeRBPF {
    const NO_FLOW: i32 = -1;
    const DR: [f64; 8] = [1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2];

    fn generate_random_terrain(mut self) -> Self {
        for y in 0..self.height {
            for x in 0..self.width {
                let c = y * self.width + x;
                self.h[c] = uniform_rand_real(0.0, 1.0);

                //Outer edge is set to 0 and never touched again. It is used only as a
                //convenience so we don't have to worry when a focal cell looks at its
                //neighbours.
                if x == 0 || y == 0 || x == self.width - 1 || y == self.height - 1 {
                    self.h[c] = 0.0;
                }

                //Second outer-most edge is set to 0 and never touched again. This is the
                //baseline to which all cells would erode where it not for uplift. You can
                //think of this as being "sea level".
                if x == 1 || y == 1 || x == self.width - 2 || y == self.height - 2 {
                    self.h[c] = 0.0;
                }
            }
        }
        self
    }

    fn generate_boring_terrain(mut self, mut start: f64, delta: f64) -> Self {
        for y in 2..self.height-2 {
        for x in 2..self.width-2 {
            let c = y*self.width+x;
            self.h[c] = start;
            start += delta;
        }
    }
    self
    }

    pub fn new(width: usize, height: usize) -> Self {
        let size = width * height;
        let h = vec![0.0; size];
        let iwidth = width as isize;
        let ncpu = available_parallelism().unwrap().get();
        let stack_width = 3.max(5 * size / ncpu);
        let level_width = 1.max(size / ncpu);

        Self {
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
            h,
            size,
            width,
            height,
            rec: vec![Self::NO_FLOW; size],
            ndon: vec![0; size],
            donor: vec![0; 8 * size],
            levels: vec![0; 2 * width + 2 * height],
            level_width,
            stack: vec![0; stack_width],
            stack_width,
            accum: vec![0.0; size],
            ..Default::default()
        }
        // .generate_random_terrain()
    }

    ///The receiver of a focal cell is the cell which receives the focal cells'
    ///flow. Here, we model the receiving cell as being the one connected to the
    ///focal cell by the steppest gradient. If there is no local gradient, then
    ///the special value NO_FLOW is assigned.
    fn compute_receivers(&mut self) {
        self.rec
            .par_chunks_exact_mut(self.width)
            .enumerate()
            // to iterate from 2..self.height -2
            .skip(2)
            .take(self.height - 4)
            .for_each(|(y, v)| {
                for x in 2..self.width - 2 {
                    let c: usize = y * self.width + x;

                    let mut max_slope = 0.0;
                    let mut max_n = Self::NO_FLOW;

                    for n in 0..8 {
                        let slope = (self.h[c] - self.h[(c as isize + self.nshift[n]) as usize])
                            / Self::DR[n];
                        if slope > max_slope {
                            max_slope = slope;
                            max_n = n as i32;
                        }
                    }
                    v[x] = max_n;
                }
            });
    }

    fn compute_donors(&mut self) {
        self.donor
            // donors is 8* cells (for a maximum of 8 donor cells)
            .par_chunks_exact_mut(self.width * 8)
            .enumerate()
            .zip(self.ndon.par_chunks_exact_mut(self.width))
            .skip(1)
            .take(self.height - 2)
            .for_each(|((y, don), ndon)| {
                for x in 1..self.width - 1 {
                    let c = y * self.width + x;
                    for ni in 0..8 {
                        let n = (c as isize + self.nshift[ni]) as usize;
                        if self.rec[n] != Self::NO_FLOW
                            && n as isize + self.nshift[self.rec[n] as usize] == c as isize
                        {
                            // don is array of 8*cells
                            don[8 * x + ndon[x]] = n;
                            ndon[x] += 1;
                        }
                    }
                }
            });
    }

    ///Cells must be ordered so that they can be traversed such that higher cells
    ///are processed before their lower neighbouring cells. This method creates
    ///such an order. It also produces a list of "levels": cells which are,
    ///topologically, neither higher nor lower than each other. Cells in the same
    ///level can all be processed simultaneously without having to worry about
    ///race conditions.
    fn generate_order(&mut self) {
        let mut nstack = 0;

        //Since each value of the `levels` array is later used as the starting value
        //of a for-loop, we include a zero at the beginning of the array.
        self.levels[0] = 0;
        self.nlevels = 1;

        // outer edge can be added immediately and is a single level
        for c in 0..self.size {
            if self.rec[c]==Self::NO_FLOW {
                self.stack[nstack] = c;
                nstack +=1;
            }
        }
        self.levels[self.nlevels] = nstack;
        self.nlevels += 1;

        let mut level_bottom = 0; // first cell of current level
        let mut level_top = 1;    // last cell of current level

        // full BFS search, but we fill an array, so later it can be done in parallel
        while level_bottom < level_top {
            level_bottom = level_top;   // start at the previous level
            level_top = nstack;         // and process all cells that were added
            println!("bot: {level_bottom}; top: {level_top}");
            println!("stack: {:?}", &self.stack[level_bottom..level_top]);
            for si in level_bottom..level_top {
                let c = self.stack[si];
                // load donating cells of focal cell into the stack
                for k in 0..self.ndon[c] {
                    let n = self.donor[8 * c + k];
                    self.stack[nstack] = n;
                    nstack += 1;
                }
            }
            self.levels[self.nlevels] = nstack;
            self.nlevels += 1;
        }
        self.nlevels -= 1;
    }

    fn compute_flow_acc(&mut self) {
        // this is really confusing, but in PQ version, it's like
        // for i in self.levels[0]..self.levels[self.nlevels - 1] {
        //     let c = self.stack[i];
        //     self.accum[c] = self.params.cell_area;
        // }
        // However, the more logical thing to me is in all other versions:
        for i in &mut self.accum {
            *i = self.params.cell_area;
        }

        for li in (0..=self.nlevels - 3).rev() {
            let lvlstart = self.levels[li];
            let lvlend = self.levels[li + 1];
            //TODO: parallelize
            for si in lvlstart..lvlend {
                let c = self.stack[si];
                for k in 0..self.ndon[c] {
                    let n = self.donor[8 * c + k];
                    *self.accum.get_mut(c).unwrap() += self.accum[n];
                }
            }
        }
    }

    fn add_uplift(&mut self){
        for y in 2..self.height-2 {
            for x in 2..self.width-2 {
                let c = y*self.width+x;
                self.h[c] += self.params.ueq*self.params.dt;
            }
        }
    }

    fn erode(&mut self){
        for li in 1..self.nlevels-1 {
            let lvlstart = self.levels[li];
            let lvlend = self.levels[li+1];
            let lvlsize = lvlend-lvlstart;
            for si in lvlstart..lvlend {
                let c = self.stack[si];
                if self.rec[c] == Self::NO_FLOW {
                    continue;
                }
                let n = c as isize +self.nshift[self.rec[c] as usize];

                let length = Self::DR[self.rec[c] as usize];

                let fact = self.params.keq*self.params.dt*self.accum[c].powf(self.params.meq)/length.powf(self.params.neq);
                let h0 = self.h[c];
                let hn  = self.h[n as usize];
                let mut hnew = h0;
                let mut hp = h0;
                let mut diff = 2.0*self.params.tol;
                while diff.abs()>self.params.tol {
                    hnew =  hnew - (hnew-h0+fact*(hnew-hn).powf(self.params.neq))/(1.0+fact*self.params.neq*(hnew-hn).powf(self.params.neq-1.0));
                    diff = hnew - hp;
                    hp = hnew;
                }
                self.h[c] = hnew;
            }
        }
    }

    fn run(&mut self, nstep: usize) {
        self.stack_width = self.size;
        self.level_width = self.size;

        // self.accum.resize(self.size, 0.0);
        // self.rec.resize(self.size, Self::NO_FLOW);
        // self.ndon.resize(self.size,0 );
        // self.donor.resize(8*self.size,0 );
        // self.stack.resize(self.stack_width,0);

        self.levels.resize(2*self.width+2*self.height, 0);

        for step in 0..nstep {
            self.compute_receivers();
            self.compute_donors();
            self.generate_order();
            self.compute_flow_acc();
            self.add_uplift();
            self.erode();

            // if step%20 == 0 {
                println!("step {step}.");
            // }
        }
    }
}

fn main() -> Result<(), Error> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 5 {
        eprintln!(
            "Syntax: {} <Dimension> <Steps> <Output Name> <Seed>",
            args[0]
        );
        return Err(anyhow::format_err!(
            "Syntax: {} <Dimension> <Steps> <Output Name> <Seed>",
            args[0]
        ));
    }

    let width = usize::from_str_radix(&args[1], 10)?;
    let height = usize::from_str_radix(&args[1], 10)?;
    let nstep = usize::from_str_radix(&args[2], 10)?;
    let out_name = &args[3];
    let rand_seed = u64::from_str_radix(&args[4], 10)?;

    seed_rand(rand_seed);

    println!("A FastScape RB+PI");
    println!("C Richard Barnes + Fee TODO");
    println!("h git_hash {GIT_HASH}");
    println!("m Random seed = {rand_seed}");
    let mut tm = FastScapeRBPF::new(width, height).generate_random_terrain();
    tm.run(nstep);

    print_dem(&out_name, &tm.h, &width, &height)?;
    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    #[rustfmt::skip]
    fn test_new() {
        seed_rand(123);
        let n = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5, 0.5);
        dbg!(n.accum.clone());
        assert_eq!(n.params, Params {
                    keq: 2e-6,
                    neq: 2.0,
                    meq: 0.8,
                    ueq: 0.002,
                    dt: 1000.0,
                    tol: 0.001,
                    cell_area: 1.0
                });
        assert_eq!(n.width,10);
        assert_eq!(n.height, 10);
        assert_eq!(n.size, 100);
        assert_eq!(n.h, vec![
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
                ]);
        assert_eq!(n.rec, vec![FastScapeRBPF::NO_FLOW; 100]);
        assert_eq!(n.donor, vec![0;100*8]);
        assert_eq!(n.ndon, vec![0; 100]);
        assert_eq!(n.nshift, [-1, -11, -10, -9, 1, 11, 10, 9]);
        assert_eq!(n.accum, vec![0.0;100]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_compute_receivers() {
        seed_rand(123);
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5, 0.5);
        model.compute_receivers();
        assert_eq!(
            model.rec,
            vec![
                //1 2 3
                //0   4
                //7 6 5
                //
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
            ]
        );
    }

    #[test]
    #[rustfmt::skip]
    fn test_compute_donors() {
        seed_rand(123);
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5, 0.5);
        model.compute_receivers();
        model.compute_donors();
        assert_eq!(
            model.donor,
            vec![
                //    0                       1                       2                       3                       4                       5                       6                       7                       8                       9
                //    1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8
                /* 0*/0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 1*/0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,23, 0, 0, 0, 0, 0, 0, 0,24, 0, 0, 0, 0, 0, 0, 0,25, 0, 0, 0, 0, 0, 0, 0,26, 0, 0, 0, 0, 0, 0, 0,27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 2*/0, 0, 0, 0, 0, 0, 0, 0,22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,33, 0, 0, 0, 0, 0, 0, 0,34, 0, 0, 0, 0, 0, 0, 0,35, 0, 0, 0, 0, 0, 0, 0,36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 3*/0, 0, 0, 0, 0, 0, 0, 0,32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,43, 0, 0, 0, 0, 0, 0, 0,44, 0, 0, 0, 0, 0, 0, 0,45, 0, 0, 0, 0, 0, 0, 0,46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 4*/0, 0, 0, 0, 0, 0, 0, 0,42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,53, 0, 0, 0, 0, 0, 0, 0,54, 0, 0, 0, 0, 0, 0, 0,55, 0, 0, 0, 0, 0, 0, 0,56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 5*/0, 0, 0, 0, 0, 0, 0, 0,52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,63, 0, 0, 0, 0, 0, 0, 0,64, 0, 0, 0, 0, 0, 0, 0,65, 0, 0, 0, 0, 0, 0, 0,66, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 6*/0, 0, 0, 0, 0, 0, 0, 0,62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 7*/0, 0, 0, 0, 0, 0, 0, 0,72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 8*/0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,73, 0, 0, 0, 0, 0, 0, 0,74, 0, 0, 0, 0, 0, 0, 0,75, 0, 0, 0, 0, 0, 0, 0,76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                /* 9*/0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ]
        )
    }

    #[test]
    #[rustfmt::skip]
    fn test_generate_order() {
        seed_rand(123);
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5,0.5);
        model.compute_receivers();
        model.compute_donors();
        model.generate_order();
        assert_eq!(
            model.stack,
            vec![
            //     0   1   2   3   4   5   6   7   8   9
            /* 0*/ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
                  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                  20, 21, 28, 29, 30, 31, 38, 39, 40, 41,
                  48, 49, 50, 51, 58, 59, 60, 61, 68, 69,
                  70, 71, 78, 79, 80, 81, 82, 83, 84, 85,
                  86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
                  96, 97, 98, 99, 23, 24, 25, 26, 27, 22,
                  32, 37, 42, 47, 52, 57, 62, 67, 72, 77,
                  73, 74, 75, 76, 33, 34, 35, 36, 43, 44,
                  45, 46, 53, 54, 55, 56, 63, 64, 65, 66,
                   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
                   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
                   0,  0,  0,  0,  0
            ]
        );
        assert_eq!(model.nlevels, 8);
        assert_eq!(
            model.levels,
            vec![
            //   0  1  2  3  4  5  6   7   8   9
            /*0*/0,64,84,88,92,96,100,100,100,  0,
            /*1*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
            /*2*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
            /*3*/0, 0, 0, 0, 0, 0,  0,  0,  0,  0,
            ]
        );
    }

    #[test]
    fn test_compute_acc() {
        seed_rand(123);
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5,0.5);
        model.compute_receivers();
        model.compute_donors();
        model.generate_order();
        model.compute_flow_acc();
        assert_eq!(
            model.accum,
            vec![
            //    0    1    2    3    4    5    6    7    8    9
            /*0*/1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            /*1*/1.0, 1.0, 1.0, 6.0, 6.0, 6.0, 6.0, 2.0, 1.0, 1.0,
            /*2*/1.0, 2.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0,
            /*3*/1.0, 2.0, 1.0, 4.0, 4.0, 4.0, 4.0, 1.0, 2.0, 1.0,
            /*4*/1.0, 2.0, 1.0, 3.0, 3.0, 3.0, 3.0, 1.0, 2.0, 1.0,
            /*5*/1.0, 2.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 2.0, 1.0,
            /*6*/1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0,
            /*7*/1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0,
            /*8*/1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0,
            /*9*/1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
            ]
        );
    }

    #[test]
    fn test_erode() {
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5,0.5);
        model.compute_receivers();
        model.compute_donors();
        model.generate_order();
        model.compute_flow_acc();
        model.add_uplift();
        assert_eq!(model.h, vec![
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
        ]);
        model.erode();
        assert_eq!(model.h, vec![
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
        ]);
    }

    #[test]
    fn test_run() {
        let mut model = FastScapeRBPF::new(10, 10).generate_boring_terrain(0.5,0.5);
        model.run(3);
        assert_eq!(model.h, vec![
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
        ]);
    }
}

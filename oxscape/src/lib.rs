#![warn(
    clippy::pedantic,
    clippy::undocumented_unsafe_blocks,
    clippy::multiple_unsafe_ops_per_block,
    clippy::unnecessary_safety_doc,
    clippy::non_send_fields_in_send_ty
)]
pub mod mflow;
pub mod sflow;

use std::env;
use std::f64::consts::SQRT_2;

pub type Result<T> = anyhow::Result<T>;

pub const GIT_HASH: &str = env!("GIT_HASH");
pub const NOT_A_DONOR: usize = usize::MAX;

pub const XSHIFT: [isize; 8] = [-1, -1, 0, 1, 1, 1, 0, -1];
pub const YSHIFT: [isize; 8] = [0, -1, -1, -1, 0, 1, 1, 1];

pub const DR: [f64; 8] = [1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2];

#[derive(Debug, Clone)]
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
    /// Create a new `GridMeta`
    ///
    /// # Panics
    ///
    /// if either `width` or `height` doesn't fit in `isize`
    #[must_use]
    #[allow(clippy::cast_possible_wrap)]
    pub const fn new(width: usize, height: usize) -> Self {
        assert!(width <= isize::MAX as usize);
        assert!(height <= isize::MAX as usize);
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

    #[must_use]
    pub const fn width(&self) -> usize {
        self.width
    }

    #[must_use]
    pub const fn height(&self) -> usize {
        self.height
    }

    #[must_use]
    pub const fn size(&self) -> usize {
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
    #[must_use]
    pub fn nshift(&self) -> &[isize; 8] {
        &self.nshift
    }

    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// This function will x-wrap on edge cells
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
    /// ```
    /// # Panics
    ///
    /// if `idx>isize::MAX` or `shift()<0`
    ///
    ///
    ///
    #[inline]
    #[must_use]
    pub fn shift(&self, idx: usize, dir: u8) -> usize {
        (isize::try_from(idx).unwrap() + self.nshift[usize::from(dir)])
            .try_into()
            .expect("shifted value should fit in grid")
    }

    /// Try to offset in the given direction, returning `None` if it would be off the grid
    ///
    /// # Panics
    ///
    /// if either `x` or `y` doesn't fit in `isize`
    #[inline]
    #[must_use]
    #[allow(clippy::cast_sign_loss)] // input is usize and shifted value is grid-checked
    pub fn try_shift(&self, x: usize, y: usize, dir: u8) -> Option<usize> {
        let nx = isize::try_from(x).unwrap() + XSHIFT[usize::from(dir)];
        let ny = isize::try_from(y).unwrap() + YSHIFT[usize::from(dir)];
        if self.in_grid(nx, ny) {
            Some(self.xy_to_i(nx as usize, ny as usize))
        } else {
            None
        }
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
    #[must_use]
    pub const fn rev(n: usize) -> usize {
        (n + 4) % 8
    }

    #[inline]
    #[must_use]
    pub const fn is_edge_cell(&self, x: usize, y: usize) -> bool {
        x == 0 || y == 0 || x == self.width - 1 || y == self.height - 1
    }

    #[inline]
    #[must_use]
    pub const fn is_edge(&self, i: usize) -> bool {
        let (x, y) = self.i_to_xy(i);
        self.is_edge_cell(x, y)
    }

    /// Checks whether the given values fit in the grid
    ///
    /// # Panics
    ///
    /// if either provided value doesn't fit in `isize`
    #[inline]
    #[must_use]
    #[allow(clippy::cast_possible_wrap)] // checked by assert
    pub const fn in_grid(&self, x: isize, y: isize) -> bool {
        assert!(self.height < isize::MAX as usize);
        assert!(self.width < isize::MAX as usize);
        x >= 0 && x < self.width as isize && y >= 0 && y < self.height as isize
    }

    // #[inline]
    // pub fn inside(&self, i: isize) -> bool {
    //     if i < 0 {
    //         false
    //     } else {
    //         let (x, y) = self.i_to_xy(i.try_into().unwrap());
    //         self.in_grid(x.try_into().unwrap(), y.try_into().unwrap())
    //     }
    // }

    #[inline]
    #[must_use]
    pub const fn i_to_xy(&self, i: usize) -> (usize, usize) {
        (i % self.width, i / self.width)
    }

    #[inline]
    #[must_use]
    pub const fn xy_to_i(&self, x: usize, y: usize) -> usize {
        x + y * self.width
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

#[cfg(test)]
mod test {
    use super::*;

    const META: GridMeta = GridMeta::new(10, 10);

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
    #[rustfmt::skip]
    fn test_meta_rev() {
        let x = 4;
        let meta = GridMeta::new(3, 3);
        let arr = [
            1, 2, 3,
            0, x, 4,
            7, 6, 5
        ];
        for n in 0..8 {
            let rec_idx = (4 as isize + meta.nshift()[n]) as usize;
            let rec = arr[rec_idx];
            assert_eq!(rec, n);
            let _x = arr[(rec_idx as isize + meta.nshift()[GridMeta::rev(rec)]) as usize];
            assert_eq!(_x, x);
        }
    }

    #[test]
    fn test_gridmeta_new() {
        let m = META;
        assert_eq!(m.width, 10);
        assert_eq!(m.height, 10);
        assert_eq!(m.size, 100);
        assert_eq!(m.nshift, [-1, -11, -10, -9, 1, 11, 10, 9]);
    }
}

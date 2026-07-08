use exn::Exn;
use num_traits::float::Float;
use std::f64::consts::SQRT_2;
use std::fmt::{Debug, Display};
use std::ops::Range;

use crate::Dir::*;
use crate::error::GridError;
use std::env;

pub use exn::Result;

pub mod array_2d;
pub mod error;

pub const GIT_HASH: &str = env!("GIT_HASH");

pub const XSHIFT: [isize; 8] = [-1, -1, 0, 1, 1, 1, 0, -1];
pub const YSHIFT: [isize; 8] = [0, -1, -1, -1, 0, 1, 1, 1];

pub const DR: [f64; 8] = [1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2, 1.0, SQRT_2];

pub const NO_FLOW: u8 = 8;

pub trait Flow: Float + Send + Sync {
    #[inline]
    fn no_flow() -> Self {
        Self::zero()
    }
}

impl<TFlow: Float + Send + Sync> Flow for TFlow {}

/// Provides the `next_up()` function on floats
///
/// Float trait doesn't provide the next_up() function needed for epsilon depression filling, so
/// there's this trait..
pub trait NextUp {
    fn next_up(&self) -> Self;
}

impl NextUp for f32 {
    fn next_up(&self) -> Self {
        f32::next_up(*self)
    }
}

impl NextUp for f64 {
    fn next_up(&self) -> Self {
        f64::next_up(*self)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Dir {
    Left = 0,
    TopLeft = 1,
    Top = 2,
    TopRight = 3,
    Right = 4,
    BotRight = 5,
    Bot = 6,
    BotLeft = 7,
}

impl Display for Dir {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Left => write!(f, "Left"),
            TopLeft => write!(f, "TopLeft"),
            Top => write!(f, "Top"),
            TopRight => write!(f, "TopRight"),
            Right => write!(f, "Right"),
            BotRight => write!(f, "BotRight"),
            Bot => write!(f, "Bot"),
            BotLeft => write!(f, "BotLeft"),
        }
    }
}

impl TryFrom<u8> for Dir {
    type Error = Exn<GridError>;
    fn try_from(value: u8) -> std::result::Result<Self, Self::Error> {
        match value {
            0 => Ok(Left),
            1 => Ok(TopLeft),
            2 => Ok(Top),
            3 => Ok(TopRight),
            4 => Ok(Right),
            5 => Ok(BotRight),
            6 => Ok(Bot),
            7 => Ok(BotLeft),
            dir => Err(GridError::invalid_direction(dir.into()).into()),
        }
    }
}

impl TryFrom<usize> for Dir {
    type Error = Exn<GridError>;
    fn try_from(value: usize) -> std::result::Result<Self, Self::Error> {
        match value {
            0 => Ok(Left),
            1 => Ok(TopLeft),
            2 => Ok(Top),
            3 => Ok(TopRight),
            4 => Ok(Right),
            5 => Ok(BotRight),
            6 => Ok(Bot),
            7 => Ok(BotLeft),
            dir => Err(GridError::invalid_direction(dir).into()),
        }
    }
}

impl Dir {
    pub fn iter() -> impl Iterator<Item = Self> {
        (0..8u8).into_iter().map(|v| Self::try_from(v).unwrap())
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Hash)]
pub struct GridMeta {
    width: usize,
    height: usize,
    size: usize,
    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// ```
    /// # use oxscape_core::GridMeta;
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

    pub fn check<T>(&self, arr: &[T]) -> Result<(), GridError> {
        if self.size() != arr.len() {
            Err(GridError::size_mismatch(arr.len(), self.size()).into())
        } else {
            Ok(())
        }
    }

    ///Offset from a focal cell's index to its neighbours in terms of flat indexing
    ///
    /// ```
    /// # use oxscape_core::GridMeta;
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
    /// # use oxscape_core::GridMeta;
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
    /// # use oxscape_core::GridMeta;
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

    /// Get an iterator returning the edge:
    /// ```
    /// # use oxscape_core::GridMeta;
    /// # use oxscape_core::Dir::*;
    /// let arr = [
    ///    0, 1, 2, 3,
    ///    4, 5, 6, 7,
    ///    8, 9,10,11,
    ///   12,13,14,15,
    /// ];
    /// let meta = GridMeta::new(4,4);
    /// // 012 2 2 234
    /// //  0       4
    /// //  0       4
    /// // 067 6 6 456
    /// assert_eq!(meta.edge(&arr, Left).map(|v|*v).collect::<Vec<_>>(), &[0,4,8,12]);
    /// assert_eq!(meta.edge(&arr, TopLeft).map(|v|*v).collect::<Vec<_>>(), &[0]);
    /// assert_eq!(meta.edge(&arr, Top).map(|v|*v).collect::<Vec<_>>(), &[0,1,2,3]);
    /// assert_eq!(meta.edge(&arr, TopRight).map(|v|*v).collect::<Vec<_>>(), &[3]);
    /// assert_eq!(meta.edge(&arr, Right).map(|v|*v).collect::<Vec<_>>(), &[3,7,11,15]);
    /// assert_eq!(meta.edge(&arr, BotRight).map(|v|*v).collect::<Vec<_>>(), &[15]);
    /// assert_eq!(meta.edge(&arr, Bot).map(|v|*v).collect::<Vec<_>>(), &[12,13,14,15]);
    /// assert_eq!(meta.edge(&arr, BotLeft).map(|v|*v).collect::<Vec<_>>(), &[12]);
    /// ```
    #[rustfmt::skip]
    pub fn edge<'a, T>(&'a self, data: &'a [T], dir: Dir) -> EdgeIterator<'a, T> {
        let width = self.width();
        let end = self.size();
        //
        match dir {
            //                                   0..13=15-2
            Left => EdgeIterator::new(&data[0..end - width + 2], width),
            TopLeft => EdgeIterator::new(&data[0..1], 1),
            //                                   0..4
            Top => EdgeIterator::new(&data[0..width], 1),
            //                                    3..4
            TopRight => EdgeIterator::new(&data[width - 1..width], 1),
            //                                     3..16
            Right => EdgeIterator::new(&data[width - 1..end], width),
            BotRight => EdgeIterator::new(&data[end - 1..end], 1),
            //                                    12=15-3..16
            Bot => EdgeIterator::new(&data[end - width..end], 1),
            //                                      12=15-3..12=15-3
            BotLeft => EdgeIterator::new(&data[(end - width)..=(end - width)], 1),
        }
    }

    /// Starting positions of the edges if they are collected into a single array
    ///
    /// This can always be used as `let edge = edges[skirt_range(dir)]`
    /// in
    /// ```
    /// # use oxscape_core::{GridMeta,Dir};
    /// let arr = [
    ///    0, 1, 2, 3,
    ///    4, 5, 6, 7,
    ///    8, 9,10,11,
    ///   12,13,14,15,
    /// ];
    /// //  0  1  2  3
    /// //  4        7
    /// //  8       11
    /// // 12 13 14 15
    /// let edges = [
    ///     0,4,8,12,
    ///     0,
    ///     0,1,2,3,
    ///     3,
    ///     3,7,11,15,
    ///     15,
    ///     12,13,14,15,
    ///     12,
    /// ];
    /// let meta = GridMeta::new(4,4);
    /// for dir in Dir::iter() {
    ///     println!("{dir}");
    ///     for (edge_cell, skirt_cell) in meta.edge(&arr,dir).zip(&edges[meta.skirt_range(dir)]) {
    ///         println!("{edge_cell:?}?={skirt_cell:?}");
    ///         assert_eq!(edge_cell, skirt_cell)
    ///     }
    /// }
    /// ```
    /// -order
    /// Note that internal edge order is still left-to-right, top-to-bottom, so:
    /// ```raw
    /// index     total index (+skirt_start)
    /// 0 0 1 0     2 3 4 5
    /// 0     0     0     6
    /// 1     1     1     7
    /// 0 0 1 0     B 9 A 8
    /// ```
    ///
    #[must_use]
    pub fn skirt_range(&self, dir: Dir) -> Range<usize> {
        self.skirt_idx(dir as u8)..self.skirt_idx(dir as u8 + 1)
    }

    /// Gives the size of the outer perimeter or skirt
    ///
    /// If all edges and corners are collected into a single vec, this gives the size
    ///
    /// ```
    /// use oxscape_core::GridMeta;
    /// let meta = GridMeta::new(3,4);
    /// //  perimeter + 4 corners
    /// assert_eq!(meta.skirt_size(),2*3+2*4+4);
    /// ```
    ///
    pub fn skirt_size(&self) -> usize {
        self.width * 2 + self.height * 2 + 4
    }

    fn skirt_idx(&self, dir: u8) -> usize {
        match dir {
            0 => 0,
            1 => self.height(),
            2 => self.height() + 1,
            3 => self.height() + 1 + self.width(),
            4 => self.height() + 1 + self.width() + 1,
            5 => self.height() + 1 + self.width() + 1 + self.height(),
            6 => self.height() + 1 + self.width() + 1 + self.height() + 1,
            7 => self.height() + 1 + self.width() + 1 + self.height() + 1 + self.width(),
            8 => self.height() + 1 + self.width() + 1 + self.height() + 1 + self.width() + 1,
            d => panic!("Direction {d} out-of-bounds"),
        }
    }

    /// Extract the edges of this tile into a new vec
    ///
    /// ```
    /// # use oxscape_core::{GridMeta,Dir};
    /// let arr = [
    ///    0, 1, 2, 3,
    ///    4, 5, 6, 7,
    ///    8, 9,10,11,
    ///   12,13,14,15,
    /// ];
    /// let meta = GridMeta::new(4,4);
    /// let edges = meta.edges(&arr);
    /// assert_eq!(edges, &[
    ///     0,4,8,12,
    ///     0,
    ///     0,1,2,3,
    ///     3,
    ///     3,7,11,15,
    ///     15,
    ///     12,13,14,15,
    ///     12,
    /// ]);
    /// for dir in Dir::iter() {
    ///     for (edge_cell, skirt_cell) in meta.edge(&arr,dir).zip(&edges[meta.skirt_range(dir)]) {
    ///         assert_eq!(edge_cell, skirt_cell);
    ///     }
    /// }
    /// ```
    pub fn edges<T: Clone>(&self, data: &[T]) -> Vec<T> {
        let mut skirt = Vec::with_capacity(self.skirt_idx(8));
        for dir in Dir::iter() {
            for cell in self.edge(data, dir) {
                skirt.push(cell.clone());
            }
        }
        skirt
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

    /// Quick-and-dirty printing of arrays
    pub fn print<T: Debug>(&self, data: &[T]) {
        println!("[");
        for row in data.chunks(self.width()) {
            print!("  ");
            for c in row {
                print!("{:?},", *c);
            }
            println!();
        }
        println!("]");
    }
}

pub struct EdgeIterator<'a, T> {
    data: &'a [T],
    cursor: usize,
    step: usize,
}

impl<'a, T> EdgeIterator<'a, T> {
    pub fn new(data: &'a [T], step: usize) -> Self {
        Self {
            data,
            cursor: 0,
            step,
        }
    }
}

impl<'a, T> Iterator for EdgeIterator<'a, T> {
    type Item = &'a T;
    fn next(&mut self) -> Option<Self::Item> {
        if self.cursor < self.data.len() {
            let res = Some(&self.data[self.cursor]);
            self.cursor += self.step;
            res
        } else {
            None
        }
    }
}

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

    #[test]
    #[rustfmt::skip]
    fn test_edge() {
        let arr = vec![
             0, 1, 2, 3,
             4, 5, 6, 7,
             8, 9,10,11,
            12,13,14,15
        ];
        let meta = GridMeta::new(4, 4);
        assert_eq!(meta.edge(&arr, Left).map(|v|*v).collect::<Vec<_>>(), &[0,4,8,12]);
        assert_eq!(meta.edge(&arr, TopLeft).map(|v|*v).collect::<Vec<_>>(), &[0]);
        assert_eq!(meta.edge(&arr, Top).map(|v|*v).collect::<Vec<_>>(), &[0,1,2,3]);
        assert_eq!(meta.edge(&arr, TopRight).map(|v|*v).collect::<Vec<_>>(), &[3]);
        assert_eq!(meta.edge(&arr, Right).map(|v|*v).collect::<Vec<_>>(), &[3,7,11,15]);
        assert_eq!(meta.edge(&arr, BotRight).map(|v|*v).collect::<Vec<_>>(), &[15]);
        assert_eq!(meta.edge(&arr, Bot).map(|v|*v).collect::<Vec<_>>(), &[12,13,14,15]);
        assert_eq!(meta.edge(&arr, BotLeft).map(|v|*v).collect::<Vec<_>>(), &[12]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_skirt() {
        let arr = vec![
             0, 1, 2, 3,
             4, 5, 6, 7,
             8, 9,10,11,
            12,13,14,15
        ];
        let meta = GridMeta::new(4, 4);
        let mut edges = Vec::with_capacity(meta.skirt_size());
        for dir in Dir::iter() {
            for edge_cell in meta.edge(&arr, dir) {
                edges.push(*edge_cell);
            }
        }
        assert_eq!(edges, &[
            0,4,8,12,
            0,
            0,1,2,3,
            3,
            3,7,11,15,
            15,
            12,13,14,15,
            12
        ]);
        assert_eq!(&edges[meta.skirt_range(Left)], &[0,4,8,12]);
        assert_eq!(&edges[meta.skirt_range(TopLeft)], &[0]);
        assert_eq!(&edges[meta.skirt_range(Top)], &[0,1,2,3]);
        assert_eq!(&edges[meta.skirt_range(TopRight)], &[3]);
        assert_eq!(&edges[meta.skirt_range(Right)], &[3,7,11,15]);
        assert_eq!(&edges[meta.skirt_range(BotRight)], &[15]);
        assert_eq!(&edges[meta.skirt_range(Bot)], &[12,13,14,15]);
        assert_eq!(&edges[meta.skirt_range(BotLeft)], &[12]);
    }
}

use std::{
    fmt::Debug,
    ops::{Index, IndexMut},
};

use num_traits::Bounded;

use oxscape_core::{EdgeIterator, GridMeta};

#[allow(unused)]
enum Dir {
    Left = 0,
    TopLeft = 1,
    Top = 2,
    TopRight = 3,
    Right = 4,
    BotRight = 5,
    Bot = 6,
    BotLeft = 7,
}

/// A unified way to work with different underlying data structures as if they are normal arrays
///
/// - `index[(x,y)]`
///
/// not sure if these should be trait members:
/// - `try_shift((x,y), dir)`
/// - `xy_to_i(x,y)->i`
/// or we should just add a meta function:
/// - `.meta().try_shift((x,y),dir)`
pub trait Array2D<T>: Index<(usize, usize), Output = T> + IndexMut<(usize, usize)> {
    /// Get a neighbour index `(x,y)` or `None` if out-of-bounds
    ///
    fn meta(&self) -> &GridMeta;

    fn edge<'a>(&'a self, dir: u8) -> impl Iterator<Item = &'a T>
    where
        T: 'a;
}

/// The simplest wrapper for some raw data and its corresponding GridMeta
///
/// Mainly to allow `some_fn(meta: &GridMeta, dem: &mut [T])`-type wrappers:
/// ```
/// # use oxscape::GridMeta;
/// # use oxscape_tile::array_2d::{Array2D, BorrowedArray2D};
/// fn some_fn(meta: &GridMeta, dem: &mut [f64]) {
///     let mut arr2d = BorrowedArray2D::new(meta, dem);
///     some_arr2d_fn(&mut arr2d);
/// }
///
/// fn some_arr2d_fn(dem: &mut impl Array2D<f64>) {
///    // the actual implementation on dem
/// }
/// ```
#[derive(Debug)]
pub struct BorrowedArray2D<'a, T> {
    data: &'a mut [T],
    meta: &'a GridMeta,
}

impl<'a, T> BorrowedArray2D<'a, T> {
    pub fn new(meta: &'a GridMeta, data: &'a mut [T]) -> Self {
        Self { data, meta }
    }
}

impl<T> Index<(usize, usize)> for BorrowedArray2D<'_, T> {
    type Output = T;
    fn index(&self, index: (usize, usize)) -> &Self::Output {
        &self.data[self.meta.xy_to_i(index.0, index.1)]
    }
}

impl<T> IndexMut<(usize, usize)> for BorrowedArray2D<'_, T> {
    fn index_mut(&mut self, index: (usize, usize)) -> &mut Self::Output {
        &mut self.data[self.meta.xy_to_i(index.0, index.1)]
    }
}

impl<T> Array2D<T> for BorrowedArray2D<'_, T> {
    fn meta(&self) -> &GridMeta {
        self.meta
    }

    /// Get an iterator returning the edge:
    /// ```raw
    /// 1 2 3
    /// 0   4
    /// 7 6 5
    /// ```
    #[rustfmt::skip]
    fn edge<'a>(&'a self, dir: u8) -> impl Iterator<Item = &'a T> where T: 'a {
        self.meta.edge(self.data, dir)
    }
}

/// A tile and its edges:
///
/// This allows operations such as Dinf flow routing on tiles and their edges
/// ```raw
/// .....
/// .xxx.
/// .xxx.
/// .xxx.
/// .....
/// ```
pub struct SkirtedTile<T> {
    /// skirt data. On a 2-by-2 tile, it's indexed like:
    /// ```raw
    /// 1 2 2 3
    /// 0     4
    /// 0     4
    /// 7 6 6 5
    ///
    /// [001223445667]
    /// ```
    skirt: Vec<T>,
    /// bitmask to say which edges/corners are loaded
    /// ```raw
    /// 1 2 3
    /// 0   4
    /// 7 6 5
    /// ```
    has_edges: u8,
    center: Vec<T>,
    meta: GridMeta,
    skirted_meta: GridMeta,
}

impl<T: Bounded + Clone + Debug> SkirtedTile<T> {
    /// Create a new SkirtedTile with edges initialized as Max value
    pub fn new(meta: GridMeta, data: Vec<T>) -> Self {
        assert!(meta.size() == data.len());
        Self {
            skirt: vec![T::max_value(); meta.skirt_size()],
            has_edges: 0,
            center: data,
            skirted_meta: GridMeta::new(meta.width() + 1, meta.height() + 1),
            meta,
        }
    }

    pub fn add_edge<'a>(&mut self, edge: EdgeIterator<'a, T>, dir: u8) {
        self.has_edges |= 1 << dir;
        for (new, old) in edge.zip(&mut self.skirt[self.meta.skirt_range(dir)]) {
            println!("adding value: {new:?}");
            *old = new.clone()
        }
    }

    pub fn inner_edge<'a>(&'a self, dir: u8) -> EdgeIterator<'a, T> {
        self.meta.edge(&self.center, dir)
    }
}

impl<T> SkirtedTile<T> {
    pub const fn which_edge(&self, x: usize, y: usize) -> Option<u8> {
        let height = self.meta.height() + 1;
        let width = self.meta.width() + 1;
        if x == 0 && y > 0 && y < height {
            Some(0)
        } else if x == 0 && y == 0 {
            Some(1)
        } else if y == 0 && x > 0 && x < width {
            Some(2)
        } else if y == 0 && x == width {
            Some(3)
        } else if x == width && y > 0 && y < height {
            Some(4)
        } else if x == width && y == height {
            Some(5)
        } else if y == height && x > 0 && x < width {
            Some(6)
        } else if x == 0 && y == height {
            Some(7)
        } else {
            None
        }
    }
}

impl<T> Index<(usize, usize)> for SkirtedTile<T> {
    type Output = T;
    fn index(&self, index: (usize, usize)) -> &Self::Output {
        let (x, y) = index;
        if let Some(dir) = self.which_edge(x, y) {
            if dir % 2 == 1 {
                // corner
                &self.skirt[self.meta.skirt_range(dir).start]
            } else if dir == 0 || dir == 4 {
                // left or right
                &self.skirt[y - 1 + self.meta.skirt_range(dir).start]
            } else if dir == 2 || dir == 6 {
                // top or bottom
                &self.skirt[x - 1 + self.meta.skirt_range(dir).start]
            } else {
                unreachable!()
            }
        } else {
            &self.center[self.meta.xy_to_i(x - 1, y - 1)]
        }
    }
}

impl<T> IndexMut<(usize, usize)> for SkirtedTile<T> {
    fn index_mut(&mut self, index: (usize, usize)) -> &mut Self::Output {
        let (x, y) = index;
        if let Some(dir) = self.which_edge(x, y) {
            if dir % 2 == 1 {
                // corner
                &mut self.skirt[self.meta.skirt_range(dir).start]
            } else if dir == 0 || dir == 4 {
                // left or right
                &mut self.skirt[y - 1 + self.meta.skirt_range(dir).start]
            } else if dir == 2 || dir == 6 {
                // top or bottom
                &mut self.skirt[x - 1 + self.meta.skirt_range(dir).start]
            } else {
                unreachable!()
            }
        } else {
            &mut self.center[self.meta.xy_to_i(x - 1, y - 1)]
        }
    }
}

impl<T> Array2D<T> for SkirtedTile<T> {
    fn meta(&self) -> &GridMeta {
        &self.skirted_meta
    }

    fn edge<'a>(&'a self, dir: u8) -> impl Iterator<Item = &'a T>
    where
        T: 'a,
    {
        EdgeIterator::new(&self.skirt[self.meta.skirt_range(dir)], 1)
    }
}

#[cfg(test)]
mod test {
    use super::*;

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
        let arr2d = SkirtedTile::new(meta, arr);
        assert_eq!(arr2d.inner_edge(0).map(|v|*v).collect::<Vec<_>>(), &[0,4,8,12]);
        assert_eq!(arr2d.inner_edge(1).map(|v|*v).collect::<Vec<_>>(), &[0]);
        assert_eq!(arr2d.inner_edge(2).map(|v|*v).collect::<Vec<_>>(), &[0,1,2,3]);
        assert_eq!(arr2d.inner_edge(3).map(|v|*v).collect::<Vec<_>>(), &[3]);
        assert_eq!(arr2d.inner_edge(4).map(|v|*v).collect::<Vec<_>>(), &[3,7,11,15]);
        assert_eq!(arr2d.inner_edge(5).map(|v|*v).collect::<Vec<_>>(), &[15]);
        assert_eq!(arr2d.inner_edge(6).map(|v|*v).collect::<Vec<_>>(), &[12,13,14,15]);
        assert_eq!(arr2d.inner_edge(7).map(|v|*v).collect::<Vec<_>>(), &[12]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_skirt() {
        let mut top_left = SkirtedTile::new(
            GridMeta::new(2, 2),
            vec![
                0, 1,
                4, 5,
        ]);
        let top_right = SkirtedTile::new(
            GridMeta::new(2, 2),
            vec![
                2, 3,
                6, 7,
        ]);
        let bot_left = SkirtedTile::new(
            GridMeta::new(2, 2),
            vec![
                 8, 9,
                12,13,
        ]);
        let bot_right = SkirtedTile::new(
            GridMeta::new(2, 2),
            vec![
                10,11,
                14,15,
        ]);
        const M: i32 = i32::max_value();
        assert_eq!(top_left.edge(0).map(|v|*v).collect::<Vec<_>>(), &[M,M]);
        assert_eq!(top_left.edge(1).map(|v|*v).collect::<Vec<_>>(), &[M]);
        assert_eq!(top_left.edge(2).map(|v|*v).collect::<Vec<_>>(), &[M,M]);
        assert_eq!(top_left.edge(3).map(|v|*v).collect::<Vec<_>>(), &[M]);
        assert_eq!(top_left.edge(4).map(|v|*v).collect::<Vec<_>>(), &[M,M]);
        assert_eq!(top_left.edge(5).map(|v|*v).collect::<Vec<_>>(), &[M]);
        assert_eq!(top_left.edge(6).map(|v|*v).collect::<Vec<_>>(), &[M,M]);
        assert_eq!(top_left.edge(7).map(|v|*v).collect::<Vec<_>>(), &[M]);

        assert_eq!(top_right.inner_edge(Dir::Left as u8).map(|v|*v).collect::<Vec<_>>(), &[2,6]);
        top_left.add_edge(top_right.inner_edge(Dir::Left as u8), Dir::Right as u8);
        assert_eq!(bot_right.inner_edge(Dir::TopLeft as u8).map(|v|*v).collect::<Vec<_>>(), &[10]);
        top_left.add_edge(bot_right.inner_edge(Dir::TopLeft as u8), Dir::BotRight as u8);
        assert_eq!(bot_left.inner_edge(Dir::Top as u8).map(|v|*v).collect::<Vec<_>>(), &[8,9]);
        top_left.add_edge(bot_left.inner_edge(Dir::Top as u8), Dir::Bot as u8);

        assert_eq!(top_left.skirt, &[M,M, M, M,M, M, 2,6, 10, 8,9, M]);
        let expected = [
            M,M,M,M,
            M,0,1,2,
            M,4,5,6,
            M,8,9,10,
        ];
        let meta = GridMeta::new(4, 4);
        for y in 0..4 {
            for x in 0..4 {
                println!("({x},{y})");
                let res = top_left[(x,y)];
                assert_eq!(res,expected[meta.xy_to_i(x, y)]);
            }
        }
    }
}

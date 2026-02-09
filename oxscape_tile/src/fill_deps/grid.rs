use std::collections::HashMap;

use oxscape_core::{Dir, GridMeta, XSHIFT, YSHIFT};

use crate::{
    TLabel,
    fill_deps::fill::FillData,
    tile::{TileCoord, TileInfo},
};

// Ideally there'd be some logic to this
pub type TileGrid = HashMap<TileCoord, TileInfo>;
pub type RaiseGrid<T> = HashMap<TileInfo, Vec<T>>;

pub trait FillGrid<T> {
    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a;
    fn n_tiles(&self) -> usize;
    fn tile(&self, coord: &TileCoord) -> &FillData<T>;
    fn edge(&self, coord: &TileCoord, dir: Dir) -> (&[TLabel], &[T]);
    fn neighbour(&self, coord: &TileCoord, dir: Dir) -> Option<TileCoord>;
}

pub struct VecFillGrid<T> {
    meta: GridMeta,
    data: Vec<FillData<T>>,
}

impl<T> VecFillGrid<T> {
    pub fn new(meta: GridMeta, data: Vec<FillData<T>>) -> Self {
        Self { meta, data }
    }

    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
    pub fn data(&self) -> &Vec<FillData<T>> {
        &self.data
    }
}

impl<T> FillGrid<T> for VecFillGrid<T> {
    fn n_tiles(&self) -> usize {
        self.meta.size()
    }
    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a,
    {
        self.data.iter()
    }
    fn edge(&self, coord: &TileCoord, dir: Dir) -> (&[TLabel], &[T]) {
        let fd = self.tile(coord);
        let range = fd.tile_info.meta.skirt_range(dir);
        (&fd.label_edges[range.clone()], &fd.dem_edges[range])
    }
    fn tile(&self, coord: &TileCoord) -> &FillData<T> {
        &self.data[self.meta.xy_to_i(coord.x, coord.y)]
    }
    fn neighbour(&self, coord: &TileCoord, dir: Dir) -> Option<TileCoord> {
        self.meta
            .try_shift(coord.x, coord.y, dir as u8)
            .map(|i| self.meta.i_to_xy(i).into())
    }
}

pub struct HashMapFillGrid<T> {
    pub grid: HashMap<TileCoord, FillData<T>>,
}

impl<T> FillGrid<T> for HashMapFillGrid<T> {
    fn n_tiles(&self) -> usize {
        self.grid.len()
    }

    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a,
    {
        self.grid.values()
    }

    fn tile(&self, coord: &TileCoord) -> &FillData<T> {
        &self.grid[coord]
    }

    fn edge(&self, coord: &TileCoord, dir: Dir) -> (&[TLabel], &[T]) {
        let fill_data = &self.grid[coord];
        let range = fill_data.tile_info.meta().skirt_range(dir);
        (
            &fill_data.label_edges[range.clone()],
            &fill_data.dem_edges[range],
        )
    }

    fn neighbour(&self, my_coord: &TileCoord, dir: Dir) -> Option<TileCoord> {
        let Ok(x) = usize::try_from(my_coord.x as isize + XSHIFT[dir as usize]) else {
            return None;
        };
        let Ok(y) = usize::try_from(my_coord.y as isize + YSHIFT[dir as usize]) else {
            return None;
        };
        let n_coord = TileCoord { x, y };
        if self.grid.contains_key(&n_coord) {
            Some(n_coord)
        } else {
            None
        }
    }
}

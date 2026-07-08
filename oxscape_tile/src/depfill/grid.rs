use std::collections::HashMap;

use oxscape_core::{Dir, GridMeta, XSHIFT, YSHIFT};

use crate::{
    TLabel,
    depfill::fill::FillData,
    tile::{TileCoord, TileInfo},
};

// Ideally there'd be some logic to this, I don't like arbitrary iteration order
/// A mapping from coordinate to info
///
/// Currently only used by [`Producer`]
pub type TileGrid = HashMap<TileCoord, TileInfo>;

/// For each tile, the label-indexed elevations to raise watersheds to
///
/// These will contain the spill elevation of each watershed. If it wasn't a
/// global depression, that will be the same as the outputted elevation.
pub type RaiseGrid<T> = HashMap<TileInfo, RaiseData<T>>;

/// Data needed for raising catchments.
///
/// This is per-label-indexed elevations.
pub type RaiseData<T> = Vec<T>;

/// All necessary methods to solve a global filling problem
///
/// That is: the connectivity info, which tiles are neighbours and a [`FillData`]
pub trait FillGrid<T> {
    /// Iterate over all tiles' fill data
    fn iter<'a>(&'a self) -> impl Iterator<Item = &'a FillData<T>>
    where
        T: 'a;
    /// The number of tiles in the grid
    fn n_tiles(&self) -> usize;
    /// Get fill data for a specific coordinate
    fn tile(&self, coord: &TileCoord) -> &FillData<T>;
    /// Get the edge in a specific direction
    fn edge(&self, coord: &TileCoord, dir: Dir) -> (&[TLabel], &[T]);
    /// Which tile is the neighbour in the given direction?
    fn neighbour(&self, coord: &TileCoord, dir: Dir) -> Option<TileCoord>;
}

/// row-major, dense fill grid
pub struct VecFillGrid<T> {
    meta: GridMeta,
    data: Vec<FillData<T>>,
}

impl<T> VecFillGrid<T> {
    /// Create a new grid with the given data
    ///
    /// Meta is a GridMeta for the grid-of-tiles
    pub fn new(meta: GridMeta, data: Vec<FillData<T>>) -> Self {
        Self { meta, data }
    }

    /// Get immutable access to metadata (shape)
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }

    /// Get immutable access to the data
    ///
    /// Access is normally done through the [`FillGrid`] trait.
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

/// Sparse grid
pub struct HashMapFillGrid<T> {
    /// grid
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

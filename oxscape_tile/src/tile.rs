use oxscape::GridMeta;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct TileCoord {
    pub x: usize,
    pub y: usize,
}

impl TileCoord {
    pub fn new(x: usize, y: usize) -> Self {
        Self { x, y }
    }
}

impl From<(usize, usize)> for TileCoord {
    fn from(value: (usize, usize)) -> Self {
        Self::new(value.0, value.1)
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Hash)]
pub struct TileInfo {
    // filename: String,
    /// coordinates of the tile in the grid
    pub(crate) tile_coord: TileCoord,
    // /// Tile's x-offset within the larger grid
    // x_offset: usize,
    // /// Tile's y offset within the larger grid
    // y_offset: usize,
    /// Tile metadata (width and height)
    pub(crate) meta: GridMeta,
    // retention: RetentionStrategy,
    // /// bitmask representing which neighbouring tiles are nonexistent
    // edge: u8,
}

impl TileInfo {
    pub fn new(tile_coord: TileCoord, meta: GridMeta) -> Self {
        Self { tile_coord, meta }
    }

    pub fn xy(&self) -> TileCoord {
        self.tile_coord
    }

    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum RetentionStrategy {
    /// Don't store any intermediate results: re-calculate them every step
    Evict,
    /// Store intermediate results in a cache
    #[default]
    Cache,
    /// Keep intermediate results in memory
    Retain,
}

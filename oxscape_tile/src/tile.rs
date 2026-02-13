//! Base Tile struct for this crate
//!
//! Are we re-inventing the wheel? No, just making a lightweight wheel for a racing bike.
//!
//!
use oxscape_core::GridMeta;

/// A very simple struct to hold a tile coordinate
///
/// Currently a simple (x,y)-coordinate. An extra z or overview value may be added later
///
/// ```
/// use oxscape_tile::TileCoord;
/// assert_eq!(TileCoord::from((42,43)),TileCoord{x:42,y:43})
/// ```
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct TileCoord {
    pub x: usize,
    pub y: usize,
}

impl TileCoord {
    /// Create a new tile coordinate
    ///
    /// ```
    /// use oxscape_tile::TileCoord;
    /// assert_eq!(TileCoord::new(42,43),TileCoord {x:42,y:43});
    /// ```
    pub fn new(x: usize, y: usize) -> Self {
        Self { x, y }
    }
}

impl From<(usize, usize)> for TileCoord {
    fn from(value: (usize, usize)) -> Self {
        Self::new(value.0, value.1)
    }
}

impl From<TileCoord> for (usize, usize) {
    fn from(value: TileCoord) -> Self {
        (value.x, value.y)
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

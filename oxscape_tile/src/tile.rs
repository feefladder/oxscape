use oxscape::GridMeta;

#[derive(Debug, Clone)]
pub struct TileInfo {
    filename: String,
    /// x-coordinate of the tile in the grid
    // TODO: is u32 ok here? should it be usize?
    // COGs don't really have a limit on the number of tiles as I currently understand, just that ImageWidth = u64 and n_tiles
    tile_x: u64,
    /// y-coordinate of the tile in the grid
    tile_y: u64,
    /// Tile's x-offset within the larger grid
    x_offset: usize,
    /// Tile's y offset within the larger grid
    y_offset: usize,
    /// Tile metadata (width and height)
    meta: GridMeta,
    retention: RetentionStrategy,
    /// bitmask representing which neighbouring tiles are nonexistent
    edge: u8,
}

impl TileInfo {
    pub fn xy(&self) -> (u64, u64) {
        (self.tile_x, self.tile_y)
    }
}

#[derive(Debug, Clone, Copy)]
pub enum RetentionStrategy {
    /// Don't store any intermediate results: re-calculate them every step
    Evict,
    /// Store intermediate results in a cache
    Cache,
    /// Keep intermediate results in memory
    Retain,
}

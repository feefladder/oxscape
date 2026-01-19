use oxscape::{GridMeta, Result};
use oxscape_erode::fill_deps::priority_flood_wei2018;
use rand::prelude::*;

/// Arrows that point in the direction
/// ```
/// # use oxscape_tui::DIRS;
/// let x = 8;
/// let idx = [
/// 1,2,3,
/// 0,x,4,
/// 7,6,5,
/// ];
/// let arr = [
/// '🡼','🡹','🡽',
/// '🡸','❀','🡺',
/// '🡿','🡻','🡾',
/// ];
/// for i in 0..9 {
///     assert_eq!(DIRS[idx[i]], arr[i]);
/// }
/// ```
pub const DIRS: [char; 9] = ['🡸', '🡼', '🡹', '🡽', '🡺', '🡾', '🡻', '🡿', '❀'];

pub fn random_dem(dem: &mut [f64], meta: &GridMeta, seed: u64) -> Result<()> {
    let mut rng = rand::rngs::StdRng::seed_from_u64(seed);
    dem.fill(0.0);
    dem.chunks_exact_mut(meta.width())
        .take(meta.height() - 1)
        .skip(1)
        .for_each(|row| {
            for i in 1..row.len() - 1 {
                row[i] = rng.random_range(0.0..1.0);
            }
        });
    priority_flood_wei2018(dem, &meta)
}

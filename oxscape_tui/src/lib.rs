use color_eyre::Result;
use colorous::Gradient;
use oxscape::GridMeta;
use oxscape_tile::fill::fill_zhou2016;
use rand::prelude::*;
use ratatui::widgets::WidgetRef;

pub mod sim;
pub mod tile;

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
    fill_zhou2016(meta, dem);
    Ok(())
}

/// why is this a trait?
pub trait Simulation: Sized + WidgetRef {
    /// Initialize the simulation to the given size
    fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self>;
    /// Resize the simulation, maybe also restarts it
    fn resize(&mut self, width: usize, height: usize) -> Result<()>;
    /// Restart the simulation
    fn restart(&mut self) -> Result<()>;
    /// Do a single simulation step
    fn step(&mut self) -> Result<()>;
}

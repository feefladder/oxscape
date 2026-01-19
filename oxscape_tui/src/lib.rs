use color_eyre::{Result, eyre::Report};
use colorous::Gradient;
use oxscape::{
    GridMeta,
    mflow::{Order, metrics::Dinf},
};
use oxscape_erode::{
    Params, add_uplift,
    fill_deps::priority_flood_wei2018,
    mflow::{accum, erode},
};
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
    priority_flood_wei2018(dem, meta).map_err(|e| Report::msg(e.to_string()))
}

pub trait Simulation: Sized {
    /// Initialize the simulation to the given size
    fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self>;
    /// Resize the simulation, maybe also restarts it
    fn resize(&mut self, width: usize, height: usize) -> Result<()>;
    /// Restart the simulation
    fn restart(&mut self) -> Result<()>;
    /// Do a single simulation step
    fn step(&mut self) -> Result<()>;
    /// Give access to the underlying dem
    fn dem(&self) -> &[f64];
    /// Give access to the order
    ///
    /// For metadata (width/height) and flow directions
    fn order(&self) -> &Order;
    /// Give access to the color gradient
    fn gradient(&self) -> &Gradient;
}

pub struct DefaultSim {
    gradient: Gradient,
    dem: Vec<f64>,
    accum: Vec<f64>,
    order: Order,
    params: Params,
    seed: u64,
}

impl Simulation for DefaultSim {
    fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self> {
        let meta = GridMeta::new(width, height);
        let params = Params {
            cell_area: 10000.0,
            ..Default::default()
        };

        let mut dem = vec![0.0; meta.size()];
        random_dem(&mut dem, &meta, 42).map_err(|e| Report::msg(e.to_string()))?;
        let order = Order::from_dem_metric(meta, &dem, &mut Dinf)
            .map_err(|e| Report::msg(e.to_string()))?;

        Ok(Self {
            gradient,
            dem,
            accum: vec![0.0; order.meta().size()],
            order,
            params,
            seed: 42,
        })
    }

    fn resize(&mut self, width: usize, height: usize) -> Result<()> {
        let meta = GridMeta::new(width, height);
        self.dem.resize(meta.size(), 0.0);
        random_dem(&mut self.dem, &meta, self.seed).map_err(|e| Report::msg(e.to_string()))?;
        self.accum.resize(meta.size(), 0.0);
        self.order = Order::from_dem_metric(meta, &self.dem, &mut Dinf)
            .map_err(|e| Report::msg(e.to_string()))?;
        Ok(())
    }

    fn restart(&mut self) -> Result<()> {
        self.seed += 1;
        random_dem(&mut self.dem, self.order.meta(), self.seed)
            .map_err(|e| Report::msg(e.to_string()))?;
        self.order
            .reorder(&self.dem, &mut Dinf)
            .map_err(|e| Report::msg(e.to_string()))
    }

    fn step(&mut self) -> Result<()> {
        add_uplift(self.order.meta(), &self.params, &mut self.dem);
        accum(&self.order, &self.params, &mut self.accum);
        erode(&self.order, &self.params, &self.accum, &mut self.dem);
        priority_flood_wei2018(&mut self.dem, self.order.meta())
            .map_err(|e| Report::msg(e.to_string()))?;
        self.order
            .reorder(&self.dem, &mut Dinf)
            .map_err(|e| Report::msg(e.to_string()))
    }

    fn dem(&self) -> &[f64] {
        &self.dem
    }

    fn gradient(&self) -> &Gradient {
        &self.gradient
    }

    fn order(&self) -> &Order {
        &self.order
    }
}

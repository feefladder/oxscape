use color_eyre::{Report, Result};
use colorous::Gradient;
use oxscape_contour::mflow::Contours;
use oxscape_contour::mflow::metrics::dinf;
use oxscape_core::{Flow, GridMeta};
use oxscape_erode::mflow::{accum, erode};
use oxscape_erode::{Params, add_uplift};
use ratatui::prelude::*;
use rayon::prelude::*;

use crate::{DIRS, random_dem};

type TFlow = f64;

#[derive(Debug, Clone)]
pub struct DefaultSim {
    gradient: Gradient,
    dem: Vec<f64>,
    accum: Vec<f64>,
    order: Contours<f64>,
    params: Params<f64>,
    seed: u64,
}

impl DefaultSim {
    #[must_use]
    pub fn dem(&self) -> &[f64] {
        &self.dem
    }

    #[must_use]
    pub fn accum(&self) -> &[f64] {
        &self.accum
    }

    #[must_use]
    pub fn order(&self) -> &Contours<f64> {
        &self.order
    }

    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        self.order.meta()
    }

    pub fn from_dem(
        dem: Vec<f64>,
        meta: GridMeta,
        params: Params<f64>,
        gradient: Gradient,
    ) -> Result<Self> {
        let order = Contours::from_dem_metric(meta, &dem, &mut dinf::<f64>())
            .map_err(|e| Report::msg(e.to_string()))?;
        let mut acc = vec![0.0; order.meta().size()];
        accum(&order, params.cell_area, &mut acc);
        Ok(Self {
            gradient,
            dem,
            accum: acc,
            order,
            params,
            seed: 42,
        })
    }

    pub fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self> {
        let meta = GridMeta::new(width, height);
        let params = Params {
            cell_area: 10000.0,
            ..Default::default()
        };

        let mut dem = vec![0.0; meta.size()];
        random_dem(&mut dem, &meta, 42).map_err(|e| Report::msg(e.to_string()))?;
        // fill_zhou2016(&meta, &mut dem, &mut vec![NOT_FILLED; meta.size()]);
        let order = Contours::from_dem_metric(meta, &dem, &mut dinf::<f64>())
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

    pub fn resize(&mut self, width: usize, height: usize) -> Result<()> {
        let meta = GridMeta::new(width, height);
        self.dem.resize(meta.size(), 0.0);
        random_dem(&mut self.dem, &meta, self.seed).map_err(|e| Report::msg(e.to_string()))?;
        self.accum.resize(meta.size(), 0.0);
        self.order = Contours::from_dem_metric(meta, &self.dem, &mut dinf::<f64>())
            .map_err(|e| Report::msg(e.to_string()))?;
        Ok(())
    }

    pub fn restart(&mut self) -> Result<()> {
        self.seed += 1;
        random_dem(&mut self.dem, self.order.meta(), self.seed)
            .map_err(|e| Report::msg(e.to_string()))?;
        // fill_zhou2016(
        //     self.order.meta(),
        //     &mut self.dem,
        //     &mut vec![NOT_FILLED; self.order.meta().size()],
        // );
        self.order
            .reorder(&self.dem, &mut dinf::<f64>())
            .map_err(|e| Report::msg(e.to_string()))
    }

    pub fn step(&mut self) -> Result<bool> {
        add_uplift(self.order.meta(), &self.params, &mut self.dem);
        accum(&self.order, self.params.cell_area, &mut self.accum);
        erode(&self.order, &self.params, &self.accum, &mut self.dem);
        // fill_zhou2016(self.order.meta(), &mut self.dem);
        self.order
            .reorder(&self.dem, &mut dinf())
            .map_err(|e| Report::msg(e.to_string()))?;
        Ok(true)
    }
}

impl Widget for &DefaultSim {
    fn render(self, area: Rect, buf: &mut Buffer) {
        assert!(usize::from(area.width / 2) >= self.order.meta().width());
        assert!(usize::from(area.height) >= self.order.meta().height());
        let max = self
            .dem
            .par_iter()
            .max_by(|a, b| a.total_cmp(b))
            .unwrap_or(&1.0);
        self.order
            .levels()
            .windows(2)
            .map(|w| &self.order.stack()[w[0]..w[1]])
            .enumerate()
            .for_each(|(i, lvl)| {
                for c in lvl {
                    let (x, y) = self.order.meta().i_to_xy(*c);
                    let tx = u16::try_from(x * 2).unwrap() + area.left();
                    let ty = u16::try_from(y).unwrap() + area.top();
                    let color = self
                        .gradient
                        .eval_rational(self.order.n_levels() - i, self.order.n_levels());
                    buf[(tx, ty)].set_fg(Color::Rgb(color.r, color.g, color.b));
                    buf[(tx + 1, ty)].set_fg(Color::Rgb(color.r, color.g, color.b));
                }
            });
        for y in 0..self.order.meta().height() {
            for x in 0..self.order.meta().width() {
                let tx = u16::try_from(x * 2).unwrap() + area.left();
                let ty = u16::try_from(y).unwrap() + area.top();
                let n = self.order.meta().xy_to_i(x, y);
                let mut n_dirs = 0;
                for (dir, val) in self.order.flows()[n].iter().enumerate() {
                    if *val != TFlow::no_flow() {
                        buf[(tx + n_dirs, ty)].set_char(DIRS[dir]);
                        n_dirs += 1;
                    }
                }
                let bg = self.gradient.eval_continuous(self.dem[n] / max);
                buf[(tx, ty)].set_bg(Color::Rgb(bg.r, bg.g, bg.b));
                buf[(tx + 1, ty)].set_bg(Color::Rgb(bg.r, bg.g, bg.b));
            }
        }
    }
}

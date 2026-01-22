use color_eyre::{Result, eyre::Ok};
use colorous::Gradient;
use ordered_float::OrderedFloat;
use oxscape::GridMeta;
use oxscape_tile::fill::ZhouFillState;
use ratatui::prelude::*;
use ratatui::widgets::WidgetRef;
use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};

use crate::Simulation;

pub struct TiledSim<'a> {
    pub meta: GridMeta,
    pub state: Vec<ZhouFillState<'a, f64>>,
    pub gradients: Vec<Gradient>,
}

impl Simulation for TiledSim<'_> {
    fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self> {
        todo!()
    }

    fn resize(&mut self, width: usize, height: usize) -> Result<()> {
        todo!()
    }

    fn restart(&mut self) -> Result<()> {
        todo!()
    }

    fn step(&mut self) -> Result<()> {
        self.state.par_iter_mut().map(|s| s.step()).max();
        Ok(())
    }
}

impl WidgetRef for TiledSim<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        let tile_size = u16::try_from(self.state[0].meta.width()).unwrap();
        let col_constraint = (0..self.meta.width()).map(|_| Constraint::Length(tile_size * 2));
        let row_constraint = (0..self.meta.height()).map(|_| Constraint::Length(tile_size));
        let horizontal = Layout::horizontal(col_constraint).spacing(0);
        let vertical = Layout::vertical(row_constraint).spacing(0);

        let rows = vertical.split(area);
        let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

        for (i, (rect, state)) in rects.zip(&self.state).enumerate() {
            let (tile_ix, tile_iy) = self.meta.i_to_xy(i);
            Tile {
                fillstate: state,
                gradient: self.gradients[(tile_ix + tile_iy) % self.gradients.len()],
            }
            .render_ref(rect, buf);
        }
    }
}

pub struct Tile<'a> {
    pub fillstate: &'a ZhouFillState<'a, f64>,
    pub gradient: Gradient,
}

impl WidgetRef for Tile<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        // RatatuiLogo::tiny().render(area, buf);
        let sim = self.fillstate;
        let max = sim.dem.iter().map(|v| OrderedFloat(*v)).max().unwrap().0;
        for y in 0..area.height {
            for x in (0..area.width).step_by(2) {
                let n = sim.meta.xy_to_i(usize::from(x / 2), usize::from(y));
                let bg = if sim.labels[n] == 0 {
                    self.gradient.eval_continuous((max - sim.dem[n]) / max)
                } else {
                    colorous::PAIRED[sim.labels[n] as usize % colorous::PAIRED.len()]
                };
                let tx = area.left() + x;
                let ty = area.top() + y;
                buf[(tx, ty)].set_bg(Color::Rgb(bg.r, bg.g, bg.b));
                buf[(tx + 1, ty)].set_bg(Color::Rgb(bg.r, bg.g, bg.b));
            }
        }
        // mark all items in the priority queue with an O for Open
        sim.priority_queue.iter().enumerate().for_each(|(i, c)| {
            let (x, y) = (c.x, c.y);
            let color = self
                .gradient
                .eval_rational(sim.priority_queue.len() - i, sim.priority_queue.len());
            buf[(
                area.left() + u16::try_from(x * 2).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_char('O');
            buf[(
                area.left() + u16::try_from(x * 2 + 1).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_fg(Color::Rgb(color.r, color.g, color.b));
        });
        // mark all depression_queue cells in the plain queue with a P
        sim.depression_queue.iter().for_each(|c| {
            let (x, y) = sim.meta.i_to_xy(*c);
            buf[(
                area.left() + 1 + 2 * u16::try_from(x).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_char('P');
        });
        // mark all slope_queue cells with an R
        sim.slope_queue.iter().for_each(|c| {
            let (x, y) = sim.meta.i_to_xy(*c);
            buf[(
                area.left() + 1 + 2 * u16::try_from(x).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_char('R');
        });
    }
}

// struct Grid<'a> {
//     ncols: usize,
//     nrows: usize,
//     tile_width: u16,
//     tile_height: u16,
//     tiles: Vec<Tile<'a>>,
// }

// impl WidgetRef for Grid<'_> {
//     fn render_ref(&self, area: Rect, buf: &mut Buffer) {
//         let col_constraints = (0..self.ncols).map(|_| Constraint::Length(self.tile_width * 2));
//         let row_constraints = (0..self.nrows).map(|_| Constraint::Length(self.tile_height));
//         let horizontal = Layout::horizontal(col_constraints).spacing(2);
//         let vertical = Layout::vertical(row_constraints).spacing(1);

//         let rows = vertical.split(area);
//         let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

//         for (rect, tile) in rects.zip(&self.tiles) {
//             tile.render_ref(rect, buf);
//         }
//     }
// }

//! 
use std::time::Duration;

use color_eyre::Result;
use crossterm::event::{self, Event, KeyCode};
use ordered_float::OrderedFloat;
use oxscape::{
    GridMeta,
    mflow::{NO_FLOW_GEN, Order, metrics::Dinf},
};
use oxscape_erode::{
    Params, add_uplift,
    mflow::{accum, erode},
};
use oxscape_tui::{DIRS, random_dem};
use ratatui::style::Color::Rgb;
use rayon::prelude::*;

fn main() -> Result<()> {
    let mut params = Params::default();
    let mut play: bool = true;
    let mut seed = 42;
    params.cell_area = 10000.0;
    ratatui::run(|terminal| {
        let s = terminal.size()?;
        let mut meta = GridMeta::new(usize::from(s.width / 2), usize::from(s.height));
        let mut dem = vec![0.0; meta.size()];
        let mut prev_dem = vec![0.0; meta.size()];
        let mut acc = vec![0.0; meta.size()];
        random_dem(&mut dem, &meta, seed).unwrap();
        let mut order = Order::from_dem_metric(meta, &dem, &mut Dinf).unwrap();
        loop {
            terminal.draw(|frame| {
                let buf = frame.buffer_mut();
                let area = buf.area;
                let max = dem.par_iter().map(|v| OrderedFloat(*v)).max().unwrap().0;
                order
                    .levels()
                    .windows(2)
                    .map(|w| &order.stack()[w[0]..w[1]])
                    .enumerate()
                    .for_each(|(i, lvl)| {
                        for c in lvl {
                            let (x, y) = order.meta().i_to_xy(*c);
                            let color = colorous::MAGMA.eval_rational(i, order.n_levels());
                            buf[(u16::try_from(x * 2).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                            buf[(u16::try_from(x * 2 + 1).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                        }
                    });
                for y in 0..area.height {
                    for x in 0..area.width / 2 {
                        let n = meta.xy_to_i(x.into(), y.into());
                        let mut n_dirs = 0;
                        for (idx, f) in order.flows()[n].iter().enumerate() {
                            if *f != NO_FLOW_GEN {
                                if n_dirs >= 2 {
                                    panic!();
                                }
                                buf[(x * 2 + n_dirs, y)].set_char(DIRS[idx]);
                                n_dirs += 1;
                            }
                        }

                        let bg = colorous::VIRIDIS.eval_continuous(dem[n] / max);
                        buf[(x * 2, y)].set_bg(Rgb(bg.r, bg.g, bg.b));
                        buf[(x * 2 + 1, y)].set_bg(Rgb(bg.r, bg.g, bg.b));
                    }
                }
            })?;
            if event::poll(Duration::from_millis(0))? {
                match event::read()? {
                    Event::Key(k) => {
                        match k.code {
                            KeyCode::Enter => {
                                // dem[order.meta().xy_to_i(2, 2)] = 20.0;
                                random_dem(&mut dem, &order.meta(), seed).unwrap();
                                seed += 1;
                                // continue;
                            }
                            KeyCode::Right => {
                                order.reorder(&dem, &mut Dinf).unwrap();
                                accum(&order, &params, &mut acc);
                                add_uplift(&meta, &params, &mut dem);
                                erode(&order, &params, &acc, &mut dem);
                                prev_dem.copy_from_slice(&dem);
                            }
                            KeyCode::Char(' ') => play = !play,
                            _ => break Ok(()),
                        }
                    }
                    Event::Resize(width, height) => {
                        meta = GridMeta::new(usize::from(width / 2), usize::from(height));
                        dem = vec![0.0; meta.size()];
                        prev_dem = vec![0.0; meta.size()];
                        acc = vec![0.0; meta.size()];
                        random_dem(&mut dem, &meta, seed).unwrap();
                        order = Order::from_dem_metric(meta, &dem, &mut Dinf).unwrap();
                    }
                    _ => {}
                }
            }
            if play {
                order.reorder(&dem, &mut Dinf).unwrap();
                accum(&order, &params, &mut acc);
                add_uplift(&meta, &params, &mut dem);
                erode(&order, &params, &acc, &mut dem);
                if dem
                    .par_iter()
                    .zip(prev_dem.par_iter())
                    .map(|(a, b)| OrderedFloat((a - b).abs()))
                    .max()
                    .unwrap()
                    .0
                    < 0.1
                {
                    random_dem(&mut dem, &order.meta(), seed).unwrap();
                    seed += 1;
                }
                prev_dem.copy_from_slice(&dem);
            }
        }
    })
}

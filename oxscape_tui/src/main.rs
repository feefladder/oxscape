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
    Params, add_uplift, fill_deps::priority_flood_wei2018, mflow::{accum, erode}
};
use oxscape_tui::{DIRS, random_dem};
use ratatui::style::Color::Rgb;
use rayon::prelude::*;

fn main() -> Result<()> {
    let mut params = Params::default();
    let mut play: bool = false;
    let mut seed = 42;
    params.cell_area = 10000.0;
    ratatui::run(|terminal| {
        let s = terminal.size()?;
        let meta = GridMeta::new(usize::from(s.width / 2), usize::from(s.height));
        let mut dem = vec![0.0; meta.size()];
        let mut prev_dem = vec![0.0;meta.size()];
        let mut acc = vec![0.0; meta.size()];
        random_dem(&mut dem, &meta, seed).unwrap();
        let mut order = Order::from_dem_metric(meta, &dem, &mut Dinf).unwrap();
        loop {
            if event::poll(Duration::from_millis(0))? {
                match event::read()? {
                    Event::Resize(width, height) => {
                        let meta = GridMeta::new(usize::from(width/2), usize::from(height));
                        dem = vec![0.0;meta.size()];
                        random_dem(&mut dem, &meta, seed).unwrap();
                        prev_dem = vec![0.0;meta.size()];
                        acc = vec![0.0;meta.size()];
                        order = Order::from_dem_metric(meta, &mut dem, &mut Dinf).unwrap();
                    }
                    Event::Key(k) => {
                        match k.code {
                            KeyCode::Enter => {
                                // dem[order.meta().xy_to_i(2, 2)] = 20.0;
                                random_dem(&mut dem, &order.meta(), seed).unwrap();
                                order.reorder(&dem, &mut Dinf).unwrap();
                                seed += 1;
                                // continue;
                            }
                            KeyCode::Right => {
                                accum(&order, &params, &mut acc);
                                add_uplift(&order.meta(), &params, &mut dem);
                                erode(&order, &params, &acc, &mut dem);
                                priority_flood_wei2018(&mut dem, order.meta()).unwrap();
                                order.reorder(&dem, &mut Dinf).unwrap();
                            }
                            KeyCode::Char(' ') => play = !play,
                            _ => break Ok(()),
                        }
                    }
                    _ => {}
                }
            }
            terminal.draw(|frame| {
                assert_eq!(usize::from(frame.area().width/2), order.meta().width());
                assert_eq!(usize::from(frame.area().height), order.meta().height());
                let buf = frame.buffer_mut();
                let max = dem.par_iter().map(|v| OrderedFloat(*v)).max().unwrap().0;
                order
                    .levels()
                    .windows(2)
                    .map(|w| &order.stack()[w[0]..w[1]])
                    .enumerate()
                    .for_each(|(i, lvl)| {
                        for c in lvl {
                            let (x, y) = order.meta().i_to_xy(*c);
                            let color = colorous::VIRIDIS.eval_rational(order.n_levels()-i, order.n_levels());
                            buf[(u16::try_from(x * 2).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                            buf[(u16::try_from(x * 2 + 1).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                        }
                    });
                for y in 0..order.meta().height() {
                    for x in 0..order.meta().width() {
                        let n = order.meta().xy_to_i(x, y);
                        let mut n_dirs = 0;
                        for (idx, f) in order.flows()[n].iter().enumerate() {
                            if *f != NO_FLOW_GEN {
                                if n_dirs >= 2 {
                                    // prevent overflow in multiflow
                                    continue;
                                }
                                buf[(u16::try_from(x * 2 + n_dirs).unwrap(), u16::try_from(y).unwrap())].set_char(DIRS[idx]);
                                n_dirs += 1;
                            }
                        }
                        let bg = colorous::VIRIDIS.eval_continuous(dem[n] / max);
                        buf[(u16::try_from(x * 2).unwrap(), u16::try_from(y).unwrap())].set_bg(Rgb(bg.r, bg.g, bg.b));
                        buf[(u16::try_from(x * 2 + 1).unwrap(), u16::try_from(y).unwrap())].set_bg(Rgb(bg.r, bg.g, bg.b));
                    }
                }
            })?;
            if play {
                accum(&order, &params, &mut acc);
                add_uplift(order.meta(), &params, &mut dem);
                erode(&order, &params, &acc, &mut dem);
                priority_flood_wei2018(&mut dem, order.meta()).unwrap();
                order.reorder(&dem, &mut Dinf).unwrap();

                // restart on steady state
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
                    order.reorder(&dem, &mut Dinf).unwrap();
                    seed += 1;
                }
                prev_dem.copy_from_slice(&dem);
            }
        }
    })
}

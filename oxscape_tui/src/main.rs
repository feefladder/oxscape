//! Terminal User Interface (TUI) for debugging purposes
//!
//! runs the model in full-size terminal.
//!
//! Arrows (max 2) indicate flow directions and their colors the levels. All
//! arrows of the same color are run in parallel.
//!  
use std::time::Duration;

use color_eyre::Result;
use crossterm::event::{self, Event, KeyCode};
use ordered_float::OrderedFloat;
use oxscape::mflow::NO_FLOW_GEN;
use oxscape_tui::{DIRS, DefaultSim, Simulation};
use ratatui::style::Color::Rgb;
use rayon::prelude::*;

fn main() -> Result<()> {
    let mut play: bool = false;
    ratatui::run(|terminal| {
        let s = terminal.size()?;
        let mut start_frame = terminal.get_frame().count();
        let mut sim = DefaultSim::init(
            usize::from(s.width / 2),
            usize::from(s.height),
            colorous::CUBEHELIX,
        )?;
        loop {
            if event::poll(Duration::from_millis(0))? {
                match event::read()? {
                    Event::Resize(width, height) => {
                        sim.resize(usize::from(width / 2), usize::from(height))?;
                    }
                    Event::Key(k) => match k.code {
                        KeyCode::Enter => {
                            sim.restart()?;
                        }
                        KeyCode::Right => {
                            sim.step()?;
                        }
                        KeyCode::Char(' ') => play = !play,
                        _ => break Ok(()),
                    },
                    _ => {}
                }
            }
            terminal.draw(|frame| {
                assert_eq!(
                    usize::from(frame.area().width / 2),
                    sim.order().meta().width()
                );
                assert_eq!(
                    usize::from(frame.area().height),
                    sim.order().meta().height()
                );
                let buf = frame.buffer_mut();
                let max = sim
                    .dem()
                    .par_iter()
                    .map(|v| OrderedFloat(*v))
                    .max()
                    .unwrap()
                    .0;
                sim.order()
                    .levels()
                    .windows(2)
                    .map(|w| &sim.order().stack()[w[0]..w[1]])
                    .enumerate()
                    .for_each(|(i, lvl)| {
                        for c in lvl {
                            let (x, y) = sim.order().meta().i_to_xy(*c);
                            let color = sim
                                .gradient()
                                .eval_rational(sim.order().n_levels() - i, sim.order().n_levels());
                            buf[(u16::try_from(x * 2).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                            buf[(u16::try_from(x * 2 + 1).unwrap(), u16::try_from(y).unwrap())]
                                .set_fg(Rgb(color.r, color.g, color.b));
                        }
                    });
                for y in 0..sim.order().meta().height() {
                    for x in 0..sim.order().meta().width() {
                        let n = sim.order().meta().xy_to_i(x, y);
                        let mut n_dirs = 0;
                        for (idx, f) in sim.order().flows()[n].iter().enumerate() {
                            if *f != NO_FLOW_GEN {
                                if n_dirs >= 2 {
                                    // prevent overflow in multiflow
                                    continue;
                                }
                                buf[(
                                    u16::try_from(x * 2 + n_dirs).unwrap(),
                                    u16::try_from(y).unwrap(),
                                )]
                                    .set_char(DIRS[idx]);
                                n_dirs += 1;
                            }
                        }
                        let bg = sim.gradient().eval_continuous(sim.dem()[n] / max);
                        buf[(u16::try_from(x * 2).unwrap(), u16::try_from(y).unwrap())]
                            .set_bg(Rgb(bg.r, bg.g, bg.b));
                        buf[(u16::try_from(x * 2 + 1).unwrap(), u16::try_from(y).unwrap())]
                            .set_bg(Rgb(bg.r, bg.g, bg.b));
                    }
                }
            })?;
            if play {
                sim.step()?;
                if terminal.get_frame().count() - start_frame >= 128 {
                    sim.restart()?;
                    start_frame = terminal.get_frame().count();
                }
            }
        }
    })
}

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
use oxscape_core::GridMeta;
use oxscape_erode::Params;
use oxscape_tile::TileCoord;
use oxscape_tile::depfill::NOT_FILLED;
use oxscape_tui::sim::DefaultSim;
use oxscape_tui::tile::Tile;
use oxscape_tui::tile_grid::TiledSim;
use ratatui::prelude::*;
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};

enum Mode {
    Full(DefaultSim),
    Fill {
        sim: Tile,
        unseeded_sim: Tile,
        flow_accumulation: Vec<f64>,
    },
    Tiled {
        tiled_sim: TiledSim,
        #[allow(dead_code)]
        flow_accumulation: Vec<f64>,
    },
}

impl Mode {
    fn step(&mut self) -> Result<bool> {
        match self {
            Mode::Full(sim) => Ok(!sim.step()?),
            Mode::Fill {
                sim, unseeded_sim, ..
            } => Ok(!(sim.step() && unseeded_sim.step())),
            Mode::Tiled { tiled_sim, .. } => {
                if !tiled_sim.step()? {
                    tiled_sim.complete_step();
                    Ok(true)
                } else {
                    Ok(false)
                }
            }
        }
    }

    fn next_mode(mut self, tile_size: usize) -> Result<Self> {
        match self {
            Mode::Full(sim) => {
                // move to depression filling
                let min = *sim.dem().par_iter().max_by(|a, b| b.total_cmp(a)).unwrap();
                let max = *sim.dem().par_iter().max_by(|a, b| a.total_cmp(b)).unwrap();
                // move to tiled.
                let mut fill_sim = Tile::new(
                    sim.dem().to_vec(),
                    vec![NOT_FILLED; sim.meta().size()],
                    TileCoord { x: 0, y: 0 },
                    sim.meta().clone(),
                    min,
                    max,
                    colorous::CUBEHELIX,
                );
                // seed with max accumulation
                let max_idx = sim
                    .accum()
                    .par_iter()
                    .enumerate()
                    .max_by(|(_, a), (_, b)| a.total_cmp(b))
                    .map(|(idx, _)| idx)
                    .unwrap();
                // first get tile index
                fill_sim.add_edges();
                let unseeded_sim = fill_sim.clone();
                fill_sim.seed_slope(&[max_idx]);
                self = Mode::Fill {
                    sim: fill_sim,
                    unseeded_sim,
                    flow_accumulation: sim.accum().to_vec(),
                };
            }
            Mode::Fill {
                sim,
                unseeded_sim: _,
                flow_accumulation,
            } => {
                // move to tiled.
                let mut tsim = TiledSim::tile_dem(
                    sim.dem(),
                    sim.meta(),
                    usize::from(tile_size),
                    &[colorous::CUBEHELIX], // colorous::INFERNO, colorous::VIRIDIS],
                );
                tsim.start_all();
                // // seed with max accumulation
                // let max_idx = flow_accumulation
                //     .par_iter()
                //     .enumerate()
                //     .max_by(|(_, a), (_, b)| a.total_cmp(b))
                //     .map(|(idx, _)| idx)
                //     .unwrap();
                // let (max_x, max_y) = sim.meta().i_to_xy(max_idx);
                // // first get tile index
                // tsim.seed_slope(max_x, max_y);
                self = Mode::Tiled {
                    tiled_sim: tsim,
                    flow_accumulation,
                };
            }
            Mode::Tiled {
                tiled_sim: ref t, ..
            } => {
                // move from tiled to erosion
                let ts = usize::from(tile_size);
                let meta_full = GridMeta::new(t.meta().width() * ts, t.meta().height() * ts);
                let mut dem = vec![0.0; meta_full.size()];
                for (tile_idx, tile) in t.tiles().iter().enumerate() {
                    let (tile_x, tile_y) = t.meta().i_to_xy(tile_idx);
                    for (y_in_tile, row) in tile.dem().chunks_exact(ts).enumerate() {
                        let x = tile_x * ts;
                        let y = tile_y * ts + y_in_tile;
                        let idx = meta_full.xy_to_i(x, y);
                        dem[idx..idx + ts].copy_from_slice(row);
                    }
                }
                let params = Params {
                    cell_area: 10000.0,
                    ..Default::default()
                };
                self = Mode::Full(DefaultSim::from_dem(
                    dem,
                    meta_full,
                    params,
                    colorous::CUBEHELIX,
                )?);
            }
        }
        Ok(self)
    }
}

impl Widget for &Mode {
    fn render(self, area: Rect, buf: &mut Buffer) {
        match self {
            Mode::Full(sim) => sim.render(area, buf),
            Mode::Fill {
                sim,
                #[allow(unused_variables)]
                unseeded_sim,
                #[allow(unused_variables)]
                flow_accumulation,
            } => {
                sim.render(area, buf);
                // assert_eq!(sim.meta().size(), unseeded_sim.meta().size());
                // // let min_acc = flow_accumulation.par_iter().min_by(|a,b| a.total_cmp(*b)).unwrap();
                // let max_acc = flow_accumulation
                //     .par_iter()
                //     .max_by(|a, b| a.total_cmp(b))
                //     .unwrap();
                // for (i, acc) in flow_accumulation.iter().enumerate() {
                //     let (x, y) = sim.meta().i_to_xy(i);
                //     let tx = u16::try_from(x * 2).unwrap() + area.left();
                //     let ty = u16::try_from(y).unwrap() + area.top();
                //     if sim.labels()[i] != unseeded_sim.labels()[i] {
                //         let c = colorous::PAIRED[unseeded_sim.labels()[i] as usize % 12];
                //         buf[(tx, ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                //         let c = colorous::MAGMA.eval_continuous(acc.sqrt() / max_acc.sqrt());
                //         buf[(tx + 1, ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                //     } else {
                //         let c = colorous::MAGMA.eval_continuous(acc.sqrt() / max_acc.sqrt());
                //         buf[(tx, ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                //         buf[(tx + 1, ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                //     }
                // }
            }
            Mode::Tiled { tiled_sim, .. } => tiled_sim.render(area, buf),
        }
    }
}

fn main() -> Result<()> {
    let mut play: bool = false;
    let mut terminal = ratatui::init();
    let s = terminal.size()?;
    // let mut start_frame = terminal.get_frame().count();
    let tile_size = 16;
    let mut mode = Mode::Full(DefaultSim::init(
        usize::from(s.width / 2 / tile_size * tile_size),
        usize::from(s.height / tile_size * tile_size),
        colorous::CUBEHELIX,
    )?);
    loop {
        if event::poll(Duration::from_millis(0))? {
            match event::read()? {
                Event::Resize(width, height) => {
                    let x_diff = (width / 2) % tile_size;
                    let y_diff = height % tile_size;
                    match &mut mode {
                        Mode::Full(sim) => sim.resize(
                            usize::from((width - x_diff) / 2),
                            usize::from(height - y_diff),
                        )?,
                        _ => {
                            mode = Mode::Full(DefaultSim::init(
                                usize::from((s.width - x_diff) / 2),
                                usize::from(s.height - y_diff),
                                colorous::CUBEHELIX,
                            )?)
                        }
                    }
                }
                Event::Key(k) => match k.code {
                    KeyCode::Enter => match &mut mode {
                        Mode::Full(sim) => {
                            sim.restart()?;
                            // start_frame = terminal.get_frame().count();
                        }
                        Mode::Fill {
                            sim, unseeded_sim, ..
                        } => {
                            while sim.step() {}
                            while unseeded_sim.step() {}
                        }
                        Mode::Tiled {
                            tiled_sim,
                            flow_accumulation: _,
                        } => {
                            while tiled_sim.step()? {}
                            tiled_sim.complete_step();
                        }
                    },
                    KeyCode::Right => {
                        mode.step()?;
                    }
                    KeyCode::Char(' ') => play = !play,
                    KeyCode::Tab => {
                        mode = mode.next_mode(usize::from(tile_size))?;
                    }
                    _ => break,
                },
                _ => {}
            }
        }
        terminal.draw(|frame| {
            mode.render(frame.area(), frame.buffer_mut());
        })?;
        if play {
            if !mode.step()? {
                mode = mode.next_mode(usize::from(tile_size))?;
            }
        }
    }
    ratatui::restore();
    Ok(())
}

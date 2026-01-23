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
use oxscape::GridMeta;
use oxscape_erode::Params;
use oxscape_tui::{
    Simulation,
    sim::DefaultSim,
    tile::{Tile, TiledSim},
};
use ratatui::prelude::*;
use ratatui::widgets::WidgetRef;
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};

enum Mode {
    Full(DefaultSim),
    Fill {
        sim: Tile,
        unseeded_sim: Tile,
        flow_accumulation: Vec<f64>,
    },
    Tiled{
        tiled_sim: TiledSim,
        flow_accumulation: Vec<f64>,
    },
}

impl Mode {
    fn step(&mut self) -> Result<()> {
        match self {
            Mode::Full(sim) => sim.step(),
            Mode::Fill { sim, unseeded_sim,.. } => {
                sim.step();
                unseeded_sim.step();
                Ok(())
            }
            Mode::Tiled{
                tiled_sim,..} => tiled_sim.step(),
        }
    }
}

impl WidgetRef for Mode {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        match self {
            Mode::Full(sim) => sim.render_ref(area, buf),
            Mode::Fill { sim, unseeded_sim,flow_accumulation } => {
                assert_eq!(sim.meta().size(), unseeded_sim.meta().size());
                // let min_acc = flow_accumulation.par_iter().min_by(|a,b| a.total_cmp(*b)).unwrap();
                let max_acc = flow_accumulation.par_iter().max_by(|a,b| a.total_cmp(*b)).unwrap();
                for i in 0..sim.meta().size() {
                    let (x,y) = sim.meta().i_to_xy(i);
                    let tx = u16::try_from(x*2).unwrap() + area.left();
                    let ty = u16::try_from(y).unwrap() + area.top();
                    if sim.labels()[i] != unseeded_sim.labels()[i] {
                        let c = colorous::PAIRED[unseeded_sim.labels()[i] as usize%12];
                        buf[(tx,ty)].set_bg(Color::Rgb(c.r,c.g,c.b));
                        let c = colorous::MAGMA.eval_continuous(flow_accumulation[i].sqrt()/max_acc.sqrt());
                        buf[(tx+1,ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                    } else {
                        let c = colorous::MAGMA.eval_continuous(flow_accumulation[i].sqrt()/max_acc.sqrt());
                        buf[(tx,ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                        buf[(tx+1,ty)].set_bg(Color::Rgb(c.r, c.g, c.b));
                    }
                }
            },
            Mode::Tiled{tiled_sim,..} => tiled_sim.render_ref(area, buf),
        }
    }
}

fn main() -> Result<()> {
    let mut play: bool = false;
    let mut terminal = ratatui::init();
    let s = terminal.size()?;
    let mut start_frame = terminal.get_frame().count();
    let tile_size = 8;
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
                            start_frame = terminal.get_frame().count();
                        }
                        Mode::Fill { sim, unseeded_sim,.. } => {
                            while sim.step() {}
                            while unseeded_sim.step() {}
                        },
                        _ => todo!(),
                    },
                    KeyCode::Right => mode.step()?,
                    KeyCode::Char(' ') => play = !play,
                    KeyCode::Tab => {
                        // switch to tiled version (and back?)
                        match mode {
                            Mode::Full(sim) => {
                                let min =
                                    *sim.dem().par_iter().max_by(|a, b| b.total_cmp(a)).unwrap();
                                let max =
                                    *sim.dem().par_iter().max_by(|a, b| a.total_cmp(b)).unwrap();
                                // move to tiled.
                                let mut fill_sim = Tile::new(
                                    sim.dem().to_vec(),
                                    1,
                                    vec![0; sim.meta().size()],
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
                                fill_sim.add_edge();
                                let unseeded_sim = fill_sim.clone();
                                fill_sim.seed_slope(&[max_idx]);
                                mode = Mode::Fill {
                                    sim: fill_sim,
                                    unseeded_sim,
                                    flow_accumulation: sim.accum().to_vec(),
                                };
                                // fill animation is slow, so we want to play it
                                play = false;
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
                                    2,
                                    &[colorous::CUBEHELIX],// colorous::INFERNO, colorous::VIRIDIS],
                                );
                                // seed with max accumulation
                                let max_idx = flow_accumulation
                                    .par_iter()
                                    .enumerate()
                                    .max_by(|(_, a), (_, b)| a.total_cmp(b))
                                    .map(|(idx, _)| idx)
                                    .unwrap();
                                let (max_x, max_y) = sim.meta().i_to_xy(max_idx);
                                // first get tile index
                                tsim.seed_slope(max_x, max_y);
                                mode = Mode::Tiled{tiled_sim: tsim, flow_accumulation};
                                // tiled animation is slow, so we want to play it
                                play = false;
                            }
                            Mode::Tiled{tiled_sim: ref t, ..} => {
                                // move from tiled to normal
                                let ts = usize::from(tile_size);
                                let meta_full =
                                    GridMeta::new(t.meta().width() * ts, t.meta().height() * ts);
                                let mut dem = vec![0.0; meta_full.size()];
                                for (tile_idx, tile) in t.tiles().iter().enumerate() {
                                    let (tile_x, tile_y) = t.meta().i_to_xy(tile_idx);
                                    for (y_in_tile, row) in tile.dem().chunks_exact(ts).enumerate()
                                    {
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
                                // re-assign mode at this point, so references to dems are dropped
                                mode = Mode::Full(DefaultSim::from_dem(
                                    dem,
                                    meta_full,
                                    params,
                                    colorous::CUBEHELIX,
                                )?);
                                // erosion is fast, so pause
                                play = false
                            }
                        }
                    }
                    _ => break,
                },
                _ => {}
            }
        }
        terminal.draw(|frame| {
            mode.render_ref(frame.area(), frame.buffer_mut());
        })?;
        if play {
            mode.step()?;
            if terminal.get_frame().count() - start_frame >= 128 {
                if let Mode::Full(sim) = &mut mode {
                    sim.restart()?;
                }
                start_frame = terminal.get_frame().count();
            }
        }
    }
    ratatui::restore();
    Ok(())
}

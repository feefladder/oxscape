//! Terminal User Interface (TUI) for debugging purposes
//!
//! runs the model in full-size terminal.
//!
//! Arrows (max 2) indicate flow directions and their colors the levels. All
//! arrows of the same color are run in parallel.
//!  
use std::collections::{BinaryHeap, VecDeque};
use std::time::Duration;

use color_eyre::Result;
use crossterm::event::{self, Event, KeyCode};
use oxscape::GridMeta;
use oxscape::mflow::Order;
use oxscape::mflow::metrics::Dinf;
use oxscape_erode::mflow;
use oxscape_erode::Params;
use oxscape_tile::fill::ZhouFillState;
use oxscape_tui::{Simulation, sim::DefaultSim, tile::TiledSim};
use ratatui::prelude::*;
use ratatui::widgets::WidgetRef;

enum Mode<'a> {
    Full(DefaultSim),
    Tiled(TiledSim<'a>),
}

impl Mode<'_> {
    fn step(&mut self) -> Result<()> {
        match self {
            Mode::Full(sim) => sim.step(),
            Mode::Tiled(tsim) => tsim.step(),
        }
    }
}

impl WidgetRef for Mode<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        match self {
            Mode::Full(sim) => sim.render_ref(area, buf),
            Mode::Tiled(tiled_sim) => tiled_sim.render_ref(area, buf),
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

    let mut dems;
    let mut labels;
    let mut single_tile_global_meta;

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
                        },
                        _ => {
                            todo!()
                        }
                    },
                    KeyCode::Right => match &mut mode {
                        Mode::Full(sim) => sim.step()?,
                        Mode::Tiled(tiled_sim) => tiled_sim.step()?,
                    },
                    KeyCode::Char(' ') => play = !play,
                    KeyCode::Tab => {
                        // switch to tiled version (and back?)
                        match mode {
                            Mode::Full(sim) => {
                                // move to tiled.
                                // First, we need a container for all the tiles to take &mut[T]'s out
                                // reorder dem
                                let ts = usize::from(tile_size);
                                (dems, single_tile_global_meta) =
                                    reorder(sim.dem(), sim.order().meta(), ts);
                                // build tile fill states
                                labels = vec![0; sim.dem().len()];
                                let mut state = dems
                                    .chunks_exact_mut(ts * ts)
                                    .zip(labels.chunks_exact_mut(ts * ts))
                                    .map(|(tz, tl)| ZhouFillState {
                                        priority_queue: BinaryHeap::new(),
                                        slope_queue: VecDeque::new(),
                                        depression_queue: VecDeque::new(),
                                        labels: tl,
                                        current_label: 3,
                                        dem: tz,
                                        meta: &single_tile_global_meta,
                                    })
                                    .collect::<Vec<_>>();
                                state.iter_mut().for_each(|v| v.add_edge());
                                // put them in a simulation struct
                                let t_across = sim.order().meta().width() / ts;
                                let t_down = sim.order().meta().height() / ts;
                                let mut tsim = TiledSim {
                                    meta: GridMeta::new(t_across, t_down),
                                    state,
                                    gradients: vec![colorous::INFERNO, colorous::VIRIDIS],
                                };
                                // insert the pixel with most accumulation (the largest catchment)
                                // as seed cell
                                let max_idx = sim
                                    .accum()
                                    .iter()
                                    .enumerate()
                                    .max_by(|(_, a), (_, b)| a.total_cmp(b))
                                    .map(|(idx, _)| idx)
                                    .unwrap();
                                // we want to index (x,y) as if it is just a large grid
                                let (max_x, max_y) = sim.order().meta().i_to_xy(max_idx);
                                // firts find the tile
                                let tile_sim =
                                    &mut tsim.state[tsim.meta.xy_to_i(max_x / ts, max_y / ts)];
                                // and then the index inside the tile
                                let index_in_tile = tile_sim.meta.xy_to_i(max_x % ts, max_y % ts);
                                tile_sim.labels[index_in_tile] = 2;
                                tile_sim.slope_queue.push_back(index_in_tile);
                                // swap mode
                                mode = Mode::Tiled(tsim);
                                // tiled animation is slow, so we want to play it
                                play = true;
                            }
                            Mode::Tiled(ref t) => {
                                // move from tiled to normal
                                let ts = usize::from(tile_size);
                                let meta_full =
                                    GridMeta::new(t.meta.width() * ts, t.meta.height() * ts);
                                let mut dem = vec![0.0; meta_full.size()];
                                for (tile_idx, tile) in t.state.iter().enumerate() {
                                    let (tile_x, tile_y) = t.meta.i_to_xy(tile_idx);
                                    for (y_in_tile, row) in tile.dem.chunks_exact(ts).enumerate() {
                                        let x = tile_x * ts;
                                        let y = tile_y * ts + y_in_tile;
                                        let idx = meta_full.xy_to_i(x, y);
                                        dem[idx..idx + ts].copy_from_slice(row);
                                    }
                                }
                                let order =
                                    Order::from_dem_metric(meta_full, &dem, &mut Dinf).unwrap();
                                let params = Params {
                                    cell_area: 10000.0,
                                    ..Default::default()
                                };
                                let mut accum = vec![0.0; order.meta().size()];
                                mflow::accum(&order, &params, &mut accum);
                                // re-assign mode at this point, so references to dems are dropped
                                mode = Mode::Full(DefaultSim {
                                    gradient: colorous::CUBEHELIX,
                                    dem,
                                    accum,
                                    order,
                                    params,
                                    seed: 42,
                                });
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

/// reorder from flat-indexed dem to tiled
///
/// somehow this is bidirectional??
fn reorder<T: Copy>(dem: &[T], meta_full: &GridMeta, ts: usize) -> (Vec<T>, GridMeta) {
    let mut dems = dem.to_vec();
    // make tile-sized rows
    let rows = dem.chunks_exact(ts).collect::<Vec<_>>();
    let tmeta = GridMeta::new(ts, ts);

    let mut iout = 0;
    let t_across = meta_full.width() / ts;
    let t_down = meta_full.height() / ts;
    for tile_y in 0..t_down {
        for tile_x in 0..t_across {
            for y in 0..ts {
                let idx = (tile_y * ts + y) * t_across + tile_x;
                dems[iout..iout + ts].copy_from_slice(rows[idx]);
                iout += ts;
            }
        }
    }
    (dems, tmeta)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    #[rustfmt::skip]
    fn test_reorder() {
        let og = [
            1,2,3,4,
            5,6,7,8,
        ];
        let res = [
            1,2,5,6,
            3,4,7,8,
        ];
        assert_eq!(reorder(&og, &GridMeta::new(4, 2), 2).0,&res);
        assert_eq!(reorder(&res, &GridMeta::new(4, 2),2).0, &og);
        let og = [
             0, 1, 2, 3,
             4, 5, 6, 7,
             8, 9,10,11,
            12,13,14,15,
        ];
        let res = [
             0, 1, 4, 5,
             2, 3, 6, 7,
             8, 9,12,13,
            10,11,14,15
        ];
        assert_eq!(reorder(&og, &GridMeta::new(4, 4), 2).0,&res);
        assert_eq!(reorder(&res, &GridMeta::new(4, 4),2).0, &og);
        let og = [
             0, 1, 2, 3, 4, 5,
             6, 7, 8, 9,10,11,
            12,13,14,15,16,17,
            18,19,20,21,22,23,
        ];
        let res = [
            0,1,6,7,
            2,3,8,9,
            4,5,10,11,
            12,13,18,19,
            14,15,20,21,
            16,17,22,23,
        ];
        assert_eq!(reorder(&og, &GridMeta::new(6, 4), 2).0,&res);
        assert_eq!(reorder(&res, &GridMeta::new(6, 4),2).0, &og);
        let og = [
             1, 2, 3, 4, 5, 6,
             7, 8, 9,10,11,12,
            13,14,15,16,17,18,
        ];
        let res = [
             1, 2, 3, 7, 8, 9,
            13,14,15, 4, 5, 6,
            10,11,12,16,17,18,
        ];
        assert_eq!(reorder(&og, &GridMeta::new(6, 3), 3).0,&res);
        assert_eq!(reorder(&res, &GridMeta::new(6, 3), 3).0,&og);
    }
}

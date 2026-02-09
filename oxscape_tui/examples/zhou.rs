//! visualization of the worked example in the Zhou paper.
//!
use std::time::Duration;

use color_eyre::eyre::Result;
use oxscape_core::GridMeta;
use oxscape_tile::fill_deps::fill::NOT_FILLED;
use oxscape_tui::tile::Tile;
use ratatui::crossterm::event::{self, Event, KeyCode};
use ratatui::prelude::*;

#[rustfmt::skip]
fn dem() -> (GridMeta, [f64; 35]) {
    (GridMeta::new(7, 5),[
        15,15,14,15,12,6,12,
        14,13,10,12,15,17,15,
        15,15, 9,11, 8,15,15,
        16,17, 8,16,15, 7, 5,
        19,18,19,18,17,15,14,
    ].map(|v| v as f64))
}

fn main() -> Result<()> {
    let mut t = ratatui::init();

    let (meta, dem) = dem();
    let labels = vec![NOT_FILLED; dem.len()];
    let min = *dem.iter().min_by(|a, b| a.total_cmp(b)).unwrap();
    let max = *dem.iter().max_by(|a, b| a.total_cmp(b)).unwrap();
    let mut tile = Tile::new(
        dem.to_vec(),
        labels,
        (0, 0).into(),
        meta,
        min,
        max,
        colorous::VIRIDIS,
    );
    tile.add_edges();
    // let roi_idx = tile.meta.xy_to_i(2, 2);
    // tile.fillstate.seed_slope(&mut tile.labels, &[roi_idx]);
    loop {
        if event::poll(Duration::from_millis(0))? {
            match event::read()? {
                // Event::Resize(width, height) => {
                //     // sim.resize(usize::from(width / 2), usize::from(height))?;
                // }
                Event::Key(k) => match k.code {
                    KeyCode::Enter => {}
                    KeyCode::Right => {
                        tile.step();
                    }
                    // KeyCode::Char(' ') => play = !play,
                    _ => break,
                },
                _ => {}
            }
        }
        t.draw(|f| {
            tile.render(f.area(), f.buffer_mut());
        })?;
    }
    ratatui::restore();
    Ok(())
}

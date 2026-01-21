//! visualization of the worked example in the Zhou paper.
//!
use std::collections::{BinaryHeap, VecDeque};
use std::time::Duration;

use color_eyre::eyre::Result;
use colorous::Gradient;
use ordered_float::OrderedFloat;
use oxscape::GridMeta;
use oxscape_tile::fill::ROI_FLAG;
use oxscape_tile::{fill::ZhouFillState};
use ratatui::crossterm::event::{self, Event, KeyCode};
use ratatui::prelude::*;
use ratatui::widgets::WidgetRef;

struct Tile<'a> {
    fillstate: ZhouFillState<'a, f64>,
    min: f64,
    max: f64,
    gradient: Gradient,
}

impl WidgetRef for Tile<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        // give bg color based on height
        for (idx, z) in self.fillstate.dem.iter().enumerate() {
            let (dem_x, dem_y) = self.fillstate.meta.i_to_xy(idx);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            let color = self.gradient.eval_continuous((*z - self.min) / self.max);
            buf[(x, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            buf[(x + 1, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            if (self.fillstate.labels[idx] & ROI_FLAG) == ROI_FLAG {
                buf[(x + 1, y)].set_bg(Color::Black);
            }
        }
        // set 'D' with color of depression queue
        for (idx, n) in self.fillstate.depression_queue.iter().enumerate() {
            let (dem_x, dem_y) = self.fillstate.meta.i_to_xy(*n);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.depression_queue.len());
            buf[(x, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x, y)].set_char('D');
        }
        // set 'S' with color of slope queue
        for (idx, n) in self.fillstate.slope_queue.iter().enumerate() {
            let (dem_x, dem_y) = self.fillstate.meta.i_to_xy(*n);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.slope_queue.len());
            buf[(x + 1, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x + 1, y)].set_char('S');
        }
        // set 'P' with color of priority queue
        for (idx, n) in self.fillstate.priority_queue.iter().enumerate() {
            let x = u16::try_from(n.x * 2).unwrap() + area.left();
            let y = u16::try_from(n.y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.priority_queue.len());
            buf[(x, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x, y)].set_char('P');
        }
    }
}

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

    let (meta, mut dem) = dem();
    let mut labels = vec![0; dem.len()];
    let min = dem.map(|v| OrderedFloat(v)).iter().min().unwrap().0;
    let max = dem.map(|v| OrderedFloat(v)).iter().max().unwrap().0;
    let mut tile = Tile {
        fillstate: ZhouFillState {
            priority_queue: BinaryHeap::new(),
            slope_queue: VecDeque::new(),
            depression_queue: VecDeque::new(),
            labels: &mut labels,
            dem: &mut dem,
            meta: &meta,
        },
        min,
        max,
        gradient: colorous::VIRIDIS,
    };
    tile.fillstate.add_edge();
    let roi_idx = tile.fillstate.meta.xy_to_i(2, 2);
    tile.fillstate.slope_queue.push_back(roi_idx);
    tile.fillstate.labels[roi_idx] = ROI_FLAG;
    loop {
        if event::poll(Duration::from_millis(0))? {
            match event::read()? {
                // Event::Resize(width, height) => {
                //     // sim.resize(usize::from(width / 2), usize::from(height))?;
                // }
                Event::Key(k) => match k.code {
                    KeyCode::Enter => {}
                    KeyCode::Right => {
                        tile.fillstate.step();
                    }
                    // KeyCode::Char(' ') => play = !play,
                    _ => break,
                },
                _ => {}
            }
        }
        t.draw(|f| {
            tile.render_ref(f.area(), f.buffer_mut());
        })?;
    }
    ratatui::restore();
    Ok(())
}

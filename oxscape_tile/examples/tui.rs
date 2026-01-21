use std::{
    collections::{BinaryHeap, VecDeque},
    time::Duration,
};

use color_eyre::Result;
use colorous::Gradient;
use ordered_float::OrderedFloat;
use oxscape::GridMeta;
use oxscape_tile::{Cell, TLabel, TileFillState};
use ratatui::buffer::Buffer;
use ratatui::crossterm::event::{self, Event, KeyCode};
use ratatui::layout::{Constraint, Layout, Rect};
use ratatui::style::Color::Rgb;
use ratatui::widgets::{Block, WidgetRef};
use rayon::prelude::*;

struct Tile<'a> {
    dem: Vec<f64>,
    labels: Vec<TLabel>,
    fillstate: TileFillState<'a, f64>,
    gradient: Gradient,
}

impl WidgetRef for Tile<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        let sim = &self.fillstate;
        let max = sim.dem.iter().map(|v| OrderedFloat(*v)).max().unwrap().0;
        // mark all items in the priority queue with an O for Open
        sim.open.iter().enumerate().for_each(|(i, c)| {
            let (x, y) = (c.x, c.y);
            let color = self
                .gradient
                .eval_rational(sim.open.len() - i, sim.open.len());
            buf[(
                area.left() + u16::try_from(x * 2).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_char('O');
            buf[(
                area.left() + u16::try_from(x * 2 + 1).unwrap(),
                area.top() + u16::try_from(y).unwrap(),
            )]
                .set_fg(Rgb(color.r, color.g, color.b));
        });
        // mark all pit cells in the plain queue with a P
        sim.pit.iter().for_each(|c| {
            buf[(
                area.left() + 1 + 2 * u16::try_from(c.x).unwrap(),
                area.top() + u16::try_from(c.y).unwrap(),
            )]
                .set_char('P');
        });
        // mark all roi cells with an R
        sim.roi.iter().for_each(|c| {
            buf[(
                area.left() + 1 + 2 * u16::try_from(c.x).unwrap(),
                area.top() + u16::try_from(c.y).unwrap(),
            )]
                .set_char('R');
        });
        for y in 0..sim.meta.height() {
            for x in 0..sim.meta.width() {
                let n = sim.meta.xy_to_i(x, y);
                let bg;
                if sim.labels[n] == 0 {
                    bg = self.gradient.eval_continuous((max - sim.dem[n]) / max);
                } else {
                    bg = colorous::PAIRED[sim.labels[n] as usize % colorous::PAIRED.len()];
                };
                buf[(
                    area.left() + u16::try_from(x * 2).unwrap(),
                    area.top() + u16::try_from(y).unwrap(),
                )]
                    .set_bg(Rgb(bg.r, bg.g, bg.b));
                buf[(
                    area.left() + u16::try_from(x * 2 + 1).unwrap(),
                    area.top() + u16::try_from(y).unwrap(),
                )]
                    .set_bg(Rgb(bg.r, bg.g, bg.b));
            }
        }
    }
}

struct Grid<'a> {
    ncols: usize,
    nrows: usize,
    tile_width: u16,
    tile_height: u16,
    tiles: Vec<Tile<'a>>,
}

impl WidgetRef for Grid<'_> {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        let col_constraints = (0..self.ncols).map(|_| Constraint::Length(self.tile_width * 2));
        let row_constraints = (0..self.nrows).map(|_| Constraint::Length(self.tile_height));
        let horizontal = Layout::horizontal(col_constraints).spacing(2);
        let vertical = Layout::vertical(row_constraints).spacing(1);

        let rows = vertical.split(area);
        let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

        for (rect, tile) in rects.zip(&self.tiles) {
            tile.render_ref(rect, buf);
        }
    }
}

/// The dem from Barnes' paper
const TILED: [[u32; 49]; 9] = [
    [
        9, 9, 7, 6, 7, 6, 4, 6, 7, 6, 5, 5, 4, 4, 3, 5, 5, 4, 3, 3, 3, 1, 3, 4, 4, 3, 2, 2, 5, 4,
        4, 4, 4, 4, 4, 6, 4, 3, 3, 4, 5, 6, 7, 4, 3, 2, 4, 5, 7,
    ],
    [
        3, 2, 3, 4, 2, 1, 2, 4, 4, 4, 5, 3, 3, 5, 4, 4, 4, 5, 4, 5, 6, 3, 4, 4, 5, 6, 6, 6, 5, 6,
        6, 7, 4, 4, 6, 7, 8, 8, 6, 3, 4, 6, 9, 9, 8, 5, 3, 4, 6,
    ],
    [
        3, 4, 4, 5, 5, 6, 7, 6, 6, 5, 3, 4, 6, 8, 6, 6, 5, 3, 4, 5, 6, 6, 5, 4, 4, 4, 4, 3, 6, 5,
        4, 3, 3, 4, 4, 7, 6, 4, 2, 3, 4, 4, 8, 7, 4, 2, 3, 4, 4,
    ],
    [
        8, 6, 5, 5, 7, 6, 6, 6, 7, 8, 7, 8, 7, 6, 5, 7, 8, 8, 7, 7, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4,
        4, 4, 6, 7, 8, 4, 4, 4, 5, 6, 7, 7, 7, 5, 5, 7, 7, 5, 4,
    ],
    [
        8, 7, 5, 5, 4, 4, 6, 5, 4, 3, 4, 3, 4, 7, 4, 3, 3, 4, 2, 4, 7, 5, 4, 4, 5, 3, 4, 7, 7, 6,
        5, 5, 4, 5, 7, 8, 7, 5, 5, 4, 5, 7, 7, 7, 6, 6, 5, 5, 6,
    ],
    [
        8, 8, 6, 3, 3, 4, 6, 7, 7, 6, 3, 4, 5, 6, 7, 7, 6, 3, 5, 6, 7, 6, 6, 6, 6, 5, 6, 8, 6, 7,
        8, 7, 7, 6, 6, 6, 7, 7, 7, 6, 5, 4, 6, 5, 5, 5, 4, 4, 3,
    ],
    [
        8, 8, 8, 7, 5, 3, 3, 8, 8, 7, 7, 5, 4, 4, 8, 7, 6, 6, 6, 5, 5, 9, 7, 5, 4, 6, 7, 7, 8, 6,
        5, 4, 6, 7, 7, 4, 4, 4, 5, 5, 6, 6, 0, 2, 3, 5, 5, 6, 6,
    ],
    [
        7, 8, 8, 8, 7, 5, 4, 7, 8, 8, 8, 7, 5, 4, 7, 7, 7, 7, 6, 6, 6, 6, 5, 4, 4, 5, 6, 6, 6, 5,
        5, 6, 4, 5, 6, 6, 6, 5, 6, 4, 4, 6, 4, 6, 6, 3, 3, 4, 5,
    ],
    [
        4, 4, 3, 2, 1, 2, 4, 5, 4, 2, 1, 2, 3, 4, 5, 4, 3, 2, 3, 5, 5, 6, 5, 5, 3, 5, 7, 8, 6, 5,
        5, 6, 6, 6, 6, 5, 5, 5, 8, 7, 5, 3, 3, 3, 5, 9, 7, 4, 1,
    ],
];
fn main() -> Result<()> {
    let mut terminal = ratatui::init();
    let gradients = [colorous::RED_BLUE, colorous::BROWN_GREEN];
    let mut play: bool = false;
    let mut dems = TILED.map(|t| t.map(|v| v as f64).into_iter().collect::<Vec<_>>());
    let mut labels = (0..9).map(|_| vec![0; 49]).collect::<Vec<_>>();
    let mut tiles = Vec::with_capacity(9);
    let meta = GridMeta::new(7, 7);
    let mut lref = &mut labels[..];
    let mut dref = &mut dems[..];
    // let (mut dem, mut drest) = dems.split_first_mut().unwrap();
    // let (mut label, mut lrest) = labels.split_first_mut().unwrap();
    for idx in 0..9 {
        tiles.push(Tile {
            gradient: gradients[idx % gradients.len()],
            dem: TILED[idx].map(|v| v as f64).into_iter().collect(),
            labels: vec![0; 49],
            fillstate: TileFillState {
                meta: &meta,
                labels: lref.split_off_first_mut().unwrap(),
                current_label: 2,
                dem: dref.split_off_first_mut().unwrap(),
                open: BinaryHeap::new(),
                pit: VecDeque::new(),
                roi: VecDeque::new(),
            },
        });
    }
    let mut grid = Grid {
        ncols: 3,
        nrows: 3,
        tile_width: 7,
        tile_height: 7,
        tiles,
    };
    for tile in &mut grid.tiles {
        let sim = &mut tile.fillstate;
        for x in 0..6 {
            sim.open.push(Cell {
                x,
                y: 0,
                z: sim.dem[x],
                roi: false,
            });
            sim.open.push(Cell {
                x,
                y: 6,
                z: sim.dem[sim.meta.xy_to_i(x, 6)],
                roi: false,
            });
        }
        for y in 0..6 {
            sim.open.push(Cell {
                x: 0,
                y,
                z: sim.dem[sim.meta.xy_to_i(0, y)],
                roi: false,
            });
            sim.open.push(Cell {
                x: 6,
                y,
                z: sim.dem[sim.meta.xy_to_i(6, y)],
                roi: false,
            });
        }
    }

    loop {
        if event::poll(Duration::from_millis(0))? {
            match event::read()? {
                Event::Resize(width, height) => {
                    // sim.resize(usize::from(width / 2), usize::from(height))?;
                }
                Event::Key(k) => match k.code {
                    KeyCode::Enter => {}
                    KeyCode::Right => {
                        grid.tiles.iter_mut().for_each(|s| {
                            s.fillstate.step();
                        });
                    }
                    KeyCode::Char(' ') => play = !play,
                    _ => break,
                },
                _ => {}
            }
        }
        terminal.draw(|f| {
            grid.render_ref(f.area(), f.buffer_mut());
        })?;
        if play {
            if !grid.tiles.iter_mut().map(|t| t.fillstate.step()).all(|v| v) {
                play = false;
            }
        }
    }
    ratatui::restore();
    Ok(())
}

use std::time::Duration;

use color_eyre::Result;
use oxscape::GridMeta;
use oxscape_tile::fill_deps::fill::NOT_FILLED;
use oxscape_tile::fill_deps::graph::SuperGraph;
use oxscape_tile::fill_deps::grid::VecFillGrid;
use oxscape_tui::tile::Tile;
use oxscape_tui::tile_grid::{TiledSim, TiledSimStep};
use ratatui::crossterm::event::{self, Event, KeyCode};
use ratatui::layout::{Constraint, Layout};
use ratatui::text::{Line, Text};

/// The tiled dem from Barnes' paper
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
    let gradients = [colorous::RED_BLUE]; //, colorous::BROWN_GREEN];
    let mut play: bool = false;
    let mut tiles = Vec::with_capacity(9);
    let meta = GridMeta::new(7, 7);
    let supermeta = GridMeta::new(3, 3);
    for idx in 0..9 {
        tiles.push(Tile::new(
            TILED[idx].map(|v| v as f64).into_iter().collect(),
            vec![NOT_FILLED; 49],
            meta.i_to_xy(idx).into(),
            meta.clone(),
            0.0,
            8.0,
            gradients[idx % gradients.len()],
        ));
    }
    let mut grid = TiledSim::new(supermeta, tiles).with_spacing(1);
    grid.start_all();
    let mut debug_text = Text::from("hello world");

    loop {
        if event::poll(Duration::from_millis(0))? {
            match event::read()? {
                Event::Resize(_width, _height) => {
                    // sim.resize(usize::from(width / 2), usize::from(height))?;
                }
                Event::Key(k) => match k.code {
                    KeyCode::Enter => {}
                    KeyCode::Right => {
                        if !grid.step()? {
                            match grid.current_step() {
                                TiledSimStep::InitialFill => {
                                    let fill_grid = VecFillGrid::new(
                                        grid.meta().clone(),
                                        grid.tiles.iter_mut().map(Tile::complete_fill).collect(),
                                    );
                                    let supergraph = SuperGraph::from_grid(&fill_grid);
                                    println!("{:#?}", supergraph.spill_graph());
                                }
                                _ => todo!(),
                            }
                        };
                    }
                    KeyCode::Char(' ') => play = !play,
                    _ => break,
                },
                _ => {}
            }
        }
        terminal.draw(|f| {
            let layout = Layout::horizontal(&[
                Constraint::Fill(1),
                Constraint::Length(7 * 3 * 2 + 2 * 2),
                Constraint::Fill(2),
            ])
            .split(f.area());
            f.render_widget(&grid, layout[1]);
            debug_text = Text::from(
                grid.tiles()
                    .iter()
                    .map(|t| Line::from(format!("{:?}", t.spill_graph())))
                    .collect::<Vec<_>>(),
            );
            f.render_widget(debug_text.clone(), layout[2]);
        })?;
        if play {
            if !grid.step()? {
                play = false;
            }
        }
    }
    ratatui::restore();
    Ok(())
}

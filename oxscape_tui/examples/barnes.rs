use std::time::Duration;

use color_eyre::Result;
use itertools::Itertools;
use oxscape::GridMeta;
use oxscape_tile::fill_deps::fill::NOT_FILLED;
use oxscape_tile::fill_deps::graph::SuperGraph;
use oxscape_tile::fill_deps::grid::VecFillGrid;
use oxscape_tile::tile::TileCoord;
use oxscape_tui::tile::Tile;
use oxscape_tui::tile_grid::{TiledSim, TiledSimStep};
use ratatui::crossterm::event::{self, Event, KeyCode};
use ratatui::layout::{Constraint, Layout};
use ratatui::symbols::line;
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
    let gradients = [colorous::MAGMA]; //, colorous::BROWN_GREEN];
    let mut play: bool = false;
    let mut tiles = Vec::with_capacity(9);
    let meta = GridMeta::new(7, 7);
    let supermeta = GridMeta::new(3, 3);
    for idx in 0..9 {
        tiles.push(Tile::new(
            TILED[idx].map(|v| v as f64).into_iter().collect(),
            vec![NOT_FILLED; 49],
            supermeta.i_to_xy(idx).into(),
            meta.clone(),
            0.0,
            8.0,
            gradients[idx % gradients.len()],
        ));
    }
    let mut grid = TiledSim::new(supermeta, tiles).with_spacing(0);
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
                                TiledSimStep::RaiseCatchment(_) => {}
                                _ => grid.complete_step(),
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
            let layout =
                Layout::horizontal(&[Constraint::Length(7 * 3 * 2 + 2 * 2), Constraint::Fill(2)])
                    .split(f.area());
            f.render_widget(&grid, layout[0]);

            debug_text = Text::from(match grid.current_step() {
                TiledSimStep::InitialFill => grid
                    .tiles()
                    .iter()
                    .map(|t| Line::from(format!("{:?}", t.spill_graph())))
                    .collect::<Vec<_>>(),
                TiledSimStep::FillGraph {
                    supergraph,
                    fill_state,
                    graph_elevs,
                    node_locations: _,
                } => {
                    let mut lines = vec![Line::from("DEFAULT"); supergraph.offsets().len() + 1];

                    for (tc, (start, len)) in supergraph.offsets() {
                        if tc == &TileCoord::from((0, 0)) {
                            lines[0] = Line::from(format!(
                                "{:?}",
                                &supergraph.spill_graph()[0..*start as usize]
                            ))
                        }
                        lines[grid.meta().xy_to_i(tc.x, tc.y) + 1] = Line::from(format!(
                            "{:?}",
                            &supergraph.spill_graph()[*start as usize..*start as usize + len]
                        ));
                    }
                    lines.push(Line::from(format!("{graph_elevs:?}")));
                    lines.push(Line::from(format!(
                        "{:?}",
                        fill_state
                            .priority_queue()
                            .iter()
                            .sorted_by(|a, b| { b.cmp(a) })
                    )));
                    lines
                }
                TiledSimStep::RaiseCatchment(graph_elevs) => {
                    let mut lines = vec![Line::from("DEFAULT"); graph_elevs.len() + 1];
                    for (tc, raise_elev) in graph_elevs {
                        lines.push(Line::from(format!(
                            "{:?}:{tc:?}",
                            grid.meta().xy_to_i(tc.xy().x, tc.xy().y)
                        )));
                        lines[grid.meta().xy_to_i(tc.xy().x, tc.xy().y)] =
                            Line::from(format!("{raise_elev:?}"))
                    }
                    lines
                }
                TiledSimStep::Done => {
                    vec![]
                }
            });
            f.render_widget(debug_text.clone(), layout[1]);
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

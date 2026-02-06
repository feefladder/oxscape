use std::collections::HashMap;

use color_eyre::Result;
use colorous::Gradient;
use oxscape::GridMeta;
use oxscape_tile::TLabel;
use oxscape_tile::fill_deps::fill::{NOT_FILLED, raise_catchments};
use oxscape_tile::fill_deps::fill_graph::GraphFillState;
use oxscape_tile::fill_deps::graph::SuperGraph;
use oxscape_tile::fill_deps::grid::{RaiseGrid, VecFillGrid};
use oxscape_tile::tile::{TileCoord, TileInfo};
use ratatui::prelude::*;
use ratatui::widgets::canvas::{Canvas, Circle, Line};
use rayon::prelude::*;

use crate::tile::Tile;

#[derive(Debug, Clone)]
pub struct TiledSim {
    meta: GridMeta,
    tile_size: usize,
    pub tiles: Vec<Tile>,
    /// queue for currently processing tiles
    tile_queue: Vec<usize>,
    /// tiles that are finished and should not be added to the queue
    finished: Vec<bool>,
    current_step: TiledSimStep,
    spacing: u16,
}

#[derive(Debug, Clone)]
pub enum TiledSimStep {
    InitialFill,
    FillGraph {
        supergraph: SuperGraph<f64>,
        fill_state: GraphFillState<f64>,
        graph_elevs: Vec<f64>,
        node_locations: HashMap<TLabel, (f64, f64)>,
    },
    RaiseCatchment(RaiseGrid<f64>),
    Done,
}

impl TiledSim {
    pub fn new(meta: GridMeta, tiles: Vec<Tile>) -> Self {
        tiles
            .windows(2)
            .for_each(|w| assert_eq!(w[0].meta(), w[1].meta()));
        assert_eq!(tiles[0].meta().width(), tiles[0].meta().height());
        Self {
            tile_size: tiles[0].meta().width(),
            tiles,
            tile_queue: Vec::with_capacity(meta.size()),
            finished: vec![false; meta.size()],
            current_step: TiledSimStep::InitialFill,
            meta,
            spacing: 0,
        }
    }

    pub fn with_spacing(mut self, spacing: u16) -> Self {
        self.spacing = spacing;
        self
    }

    pub fn current_step(&self) -> &TiledSimStep {
        &self.current_step
    }

    #[must_use]
    pub fn tiles(&self) -> &[Tile] {
        &self.tiles
    }

    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }

    pub fn complete_step(&mut self) {
        match self.current_step {
            TiledSimStep::InitialFill => {
                // collect information from tiles
                let mut node_locations = HashMap::new();
                let fill_grid = VecFillGrid::new(
                    self.meta.clone(),
                    self.tiles.iter_mut().map(Tile::complete_fill).collect(),
                );
                let supergraph = SuperGraph::from_grid(&fill_grid).connect_edges(&fill_grid);

                // we need to visualize the graph, so nodes (labels) are placed at the center-of-mass of their respective catchments
                for (tile_coords, (label_offset, n_labels)) in supergraph.offsets() {
                    let tile = &self.tiles[self.meta.xy_to_i(tile_coords.x, tile_coords.y)];
                    for label in 0..*n_labels as TLabel {
                        // if only iterators had a .mean() function...
                        // https://stackoverflow.com/a/43926007
                        let (mut x_sum, mut y_sum) = (0, 0);
                        let mut count = 0.0;
                        for (x, y) in tile
                            .labels()
                            .iter()
                            .enumerate()
                            .filter(|(_, l)| **l == label)
                            .map(|(idx, _)| tile.meta().i_to_xy(idx))
                        {
                            x_sum += x;
                            y_sum += y;
                            count += 1.0;
                        }
                        // add tile offset to the label
                        let label_x =
                            x_sum as f64 / count + (tile_coords.x * tile.meta().width()) as f64;
                        let label_y =
                            y_sum as f64 / count + (tile_coords.y * tile.meta().width()) as f64;
                        // already convert to terminal index (u16*2,)
                        node_locations.insert(label + *label_offset, (label_x, label_y));
                    }
                }
                let mut fill_state = GraphFillState::new(supergraph.spill_graph().len());
                fill_state.seed(0, f64::MIN);
                self.current_step = TiledSimStep::FillGraph {
                    fill_state,
                    graph_elevs: vec![0.0; supergraph.spill_graph().len()],
                    supergraph,
                    node_locations,
                }
            }
            TiledSimStep::FillGraph {
                ref supergraph,
                ref mut fill_state,
                ref mut graph_elevs,
                node_locations: _,
            } => {
                let mut ge = graph_elevs.clone();
                while fill_state.step(&supergraph.spill_graph(), &mut ge) {}

                let mut hm = HashMap::with_capacity(supergraph.offsets().len());
                for (tc, (start, count)) in supergraph.offsets().iter().skip(1) {
                    let s = usize::try_from(*start).unwrap();
                    let ti = TileInfo::new(
                        *tc,
                        self.tiles()[self.meta.xy_to_i(tc.x, tc.y)].meta().clone(),
                    );
                    hm.insert(ti, ge[s..s + count].to_vec());
                }
                self.current_step = TiledSimStep::RaiseCatchment(hm)
            }
            TiledSimStep::RaiseCatchment(ref raise_grid) => {
                for (ti, elevs) in raise_grid {
                    let tile = &mut self.tiles[self.meta.xy_to_i(ti.xy().x, ti.xy().y)];
                    raise_catchments(&mut tile.dem, &tile.labels, elevs);
                }
                self.current_step = TiledSimStep::Done
            }
            TiledSimStep::Done => {}
        }
    }

    /// perform a single step within the current one
    ///
    /// returns whether the step is still doing something
    ///
    /// - InitialFill: single fill step
    /// - FillGraph: single fill step
    /// - RaiseCatchment: raise all catchments to their respective values
    pub fn step(&mut self) -> Result<bool> {
        Ok(match &mut self.current_step {
            TiledSimStep::InitialFill => {
                let mut filling = false;
                for tile_idx in &self.tile_queue {
                    if self.tiles[*tile_idx].step() {
                        filling = true
                    }
                }
                filling
            }
            TiledSimStep::FillGraph {
                supergraph,
                fill_state,
                graph_elevs,
                node_locations: _,
            } => fill_state.step(supergraph.spill_graph(), graph_elevs),
            TiledSimStep::RaiseCatchment(graph_elevs) => {
                for (tc, graph_elev) in graph_elevs {
                    let tile = &mut self.tiles[self.meta.xy_to_i(tc.xy().x, tc.xy().y)];
                    raise_catchments(&mut tile.dem, &tile.labels, &graph_elev);
                }
                false
            }
            TiledSimStep::Done => false,
        })
    }

    pub fn start_all(&mut self) {
        for (idx, tile) in self.tiles.iter_mut().enumerate() {
            self.tile_queue.push(idx);
            tile.add_edges();
        }
    }

    pub fn seed_slope(&mut self, x: usize, y: usize) {
        let tile_idx = self.meta.xy_to_i(x / self.tile_size, y / self.tile_size);
        let tile = &mut self.tiles[tile_idx];
        self.tile_queue.push(tile_idx);
        tile.add_edges();
        tile.seed_slope(&[tile.meta().xy_to_i(x % self.tile_size, y % self.tile_size)]);
    }

    #[must_use]
    pub fn tile_dem(
        dem: &[f64],
        meta: &GridMeta,
        tile_size: usize,
        gradients: &[Gradient],
    ) -> Self {
        let tiles_across = meta.width().div_ceil(tile_size);
        let tiles_down = meta.height().div_ceil(tile_size);
        let max = *dem.par_iter().max_by(|a, b| a.total_cmp(b)).unwrap();
        let min = *dem.par_iter().max_by(|a, b| b.total_cmp(a)).unwrap();
        let super_meta = GridMeta::new(tiles_across, tiles_down);
        let mut res = Self {
            tiles: Vec::with_capacity(super_meta.size()),
            tile_size,
            tile_queue: Vec::new(),
            finished: vec![false; super_meta.size()],
            meta: super_meta,
            current_step: TiledSimStep::InitialFill,
            spacing: 0,
        };
        for tile_idx in 0..res.meta.size() {
            let (tile_x, tile_y) = res.meta.i_to_xy(tile_idx);
            // TODO: handle edge tiles that are not tile_size*tile_size
            let tile_meta = GridMeta::new(tile_size, tile_size);
            let mut tdem = vec![0.0; tile_meta.size()];
            for (row_in_tile, row) in tdem.chunks_exact_mut(tile_meta.width()).enumerate() {
                // TODO: here also we use tile_size, because it ?will? be different on edge tiles?
                let row_idx = meta.xy_to_i(tile_x * tile_size, tile_y * tile_size + row_in_tile);
                row.copy_from_slice(&dem[row_idx..row_idx + tile_meta.width()]);
            }
            res.tiles.push(Tile::new(
                tdem,
                vec![NOT_FILLED; tile_meta.size()],
                TileCoord {
                    x: tile_x,
                    y: tile_y,
                },
                tile_meta,
                min,
                max,
                gradients[(tile_x + tile_y) % gradients.len()],
            ));
        }
        res
    }
}

impl Widget for &TiledSim {
    fn render(self, area: Rect, buf: &mut Buffer) {
        if let TiledSimStep::FillGraph {
            supergraph,
            fill_state,
            graph_elevs,
            node_locations,
        } = &self.current_step
        {
            let rect = Rect {
                x: 0,
                y: 0,
                width: (self.meta.width() * self.tile_size * 2) as u16,
                height: (self.meta.height() * self.tile_size) as u16,
            };
            // let max_spill_elev = *supergraph
            //     .spill_graph()
            //     .iter()
            //     .map(|v| v.values().max_by(|a, b| a.total_cmp(b)).unwrap_or(&0.0))
            //     .max_by(|a, b| a.total_cmp(b))
            //     .unwrap_or(&1.0);
            let max_elev = self
                .tiles
                .iter()
                .map(|t| t.dem().iter().max_by(|a, b| a.total_cmp(*b)).unwrap())
                .max_by(|a, b| a.total_cmp(b))
                .unwrap();
            Canvas::default()
                .x_bounds([0.0, f64::from(rect.width)])
                .y_bounds([0.0, f64::from(rect.height)])
                .paint(|ctx| {
                    for i in 0..self.meta().size() {
                        let tc = self.meta().i_to_xy(i).into();
                        let (offset, len) = supergraph.offsets()[&tc];
                        for my_label in offset..offset + len as u32 {
                            let edges = &supergraph.spill_graph()[my_label as usize];
                            let (my_x, my_y) = node_locations
                                .get(&(my_label as u32))
                                .unwrap_or(&(1.0, 1.0));
                            let cf = colorous::PURPLES
                                .eval_rational(my_label as usize, supergraph.spill_graph().len());
                            // let cb = colorous::MAGMA
                            //     .eval_continuous(graph_elevs[my_label as usize] / max_elev);
                            let cf = colorous::PAIRED[(my_label - offset) as usize % 12];
                            ctx.print(
                                *my_x * 2.0,
                                *my_y,
                                format!("{my_label}").fg(Color::Rgb(cf.r, cf.g, cf.b)), // .bg(Color::Rgb(cb.r, cb.g, cb.b)),
                            );
                            for (n_label, spill_elev) in edges {
                                if *n_label == 0 {
                                    continue;
                                }
                                let (n_x, n_y) = node_locations.get(n_label).unwrap_or(&(2.0, 2.0));

                                let c = colorous::CUBEHELIX.eval_continuous(spill_elev / max_elev);
                                ctx.draw(&Line::new(
                                    *my_x * 2.0,
                                    *my_y,
                                    *n_x * 2.0,
                                    *n_y,
                                    Color::Rgb(c.r, c.g, c.b),
                                ));
                            }
                        }
                    }
                    for (my_label, edges) in supergraph.spill_graph().iter().enumerate().skip(1) {}
                    for cell in fill_state.priority_queue() {
                        let Some((x, y)) = node_locations.get(&cell.label()) else {
                            continue;
                        };
                        ctx.draw(&Circle::new(*x * 2.0, *y, 2.0, Color::LightBlue));
                    }
                })
                .render(rect, buf);
        }
        let tile_size = u16::try_from(self.tiles[0].meta().width()).unwrap();
        let col_constraint = (0..self.meta.width()).map(|_| Constraint::Length(tile_size * 2));
        let row_constraint = (0..self.meta.height()).map(|_| Constraint::Length(tile_size));
        let horizontal = Layout::horizontal(col_constraint).spacing(2 * self.spacing);
        let vertical = Layout::vertical(row_constraint).spacing(self.spacing);

        let rows = vertical.split(area);
        let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

        for (idx, (rect, tile)) in rects.zip(&self.tiles).enumerate() {
            // if self.tile_queue.contains(&idx) {
            //     Paragraph::new(format!("Area {:02}", idx + 1))
            //         .block(ratatui::widgets::Block::bordered())
            //         .render(rect, buf);
            // }
            tile.render(rect, buf);
        }
    }
}

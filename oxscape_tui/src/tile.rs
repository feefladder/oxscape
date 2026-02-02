use std::{collections::HashMap, f64};

use color_eyre::{Result, eyre::Ok};
use colorous::Gradient;
use oxscape::GridMeta;
use oxscape_tile::{
    TLabel,
    fill::{NOT_FILLED, ROI_FLAG, ZhouFillState, watersheds_meet},
    producer::{
        FillData, GraphFillState, RaiseGrid, SpillGraph, SuperGraph, TileCoord, VecFillGrid,
        build_supergraph,
    },
};
use ratatui::widgets::{
    WidgetRef,
    canvas::{Canvas, Circle, Line},
};
use ratatui::{prelude::*, widgets::Paragraph};
use rayon::prelude::*;

pub struct TiledSim {
    meta: GridMeta,
    tile_size: usize,
    tiles: Vec<Tile>,
    /// queue for currently processing tiles
    tile_queue: Vec<usize>,
    /// tiles that are finished and should not be added to the queue
    finished: Vec<bool>,
    current_step: TiledSimStep,
}

enum TiledSimStep {
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

impl WidgetRef for TiledSim {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        let tile_size = u16::try_from(self.tiles[0].meta.width()).unwrap();
        let col_constraint = (0..self.meta.width()).map(|_| Constraint::Length(tile_size * 2));
        let row_constraint = (0..self.meta.height()).map(|_| Constraint::Length(tile_size));
        let horizontal = Layout::horizontal(col_constraint).spacing(0);
        let vertical = Layout::vertical(row_constraint).spacing(0);

        let rows = vertical.split(area);
        let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

        for (idx, (rect, tile)) in rects.zip(&self.tiles).enumerate() {
            if self.tile_queue.contains(&idx) {
                Paragraph::new(format!("Area {:02}", idx + 1))
                    .block(ratatui::widgets::Block::bordered())
                    .render(rect, buf);
            }
            tile.render_ref(rect, buf);
        }
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
            let max_spill_elev = *supergraph
                .spill_graph()
                .iter()
                .map(|v| v.values().max_by(|a, b| a.total_cmp(b)).unwrap_or(&0.0))
                .max_by(|a, b| a.total_cmp(b))
                .unwrap_or(&1.0);
            Canvas::default()
                .x_bounds([0.0, f64::from(rect.width)])
                .y_bounds([0.0, f64::from(rect.height)])
                .paint(|ctx| {
                    for (my_label, edges) in supergraph.spill_graph().iter().enumerate().skip(1) {
                        let (my_x, my_y) = node_locations
                            .get(&(my_label as u32))
                            .unwrap_or(&(1.0, 1.0));
                        let cf = colorous::PURPLES
                            .eval_rational(my_label, supergraph.spill_graph().len());
                        let cb =
                            colorous::MAGMA.eval_continuous(graph_elevs[my_label] / max_spill_elev);
                        ctx.print(
                            *my_x * 2.0,
                            *my_y,
                            format!("{my_label}")
                                .fg(Color::Rgb(cf.r, cf.g, cf.b))
                                .bg(Color::Rgb(cb.r, cb.g, cb.b)),
                        );
                        for (n_label, spill_elev) in edges {
                            if *n_label == 0 {
                                continue;
                            }
                            let (n_x, n_y) = node_locations.get(n_label).unwrap_or(&(2.0, 2.0));

                            let c =
                                colorous::CUBEHELIX.eval_continuous(spill_elev / max_spill_elev);
                            ctx.draw(&Line::new(
                                *my_x * 2.0,
                                *my_y,
                                *n_x * 2.0,
                                *n_y,
                                Color::Rgb(c.r, c.g, c.b),
                            ));
                        }
                    }
                    for cell in fill_state.priority_queue() {
                        let Some((x, y)) = node_locations.get(&cell.label()) else {
                            continue;
                        };
                        ctx.draw(&Circle::new(*x * 2.0, *y, 2.0, Color::LightBlue));
                    }
                })
                .render(rect, buf);
        }
    }
}

impl TiledSim {
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
                let mut node_locations = HashMap::new();
                let fill_grid = VecFillGrid::new(
                    self.meta.clone(),
                    self.tiles.iter_mut().map(Tile::complete_fill).collect(),
                );
                let supergraph = build_supergraph(&fill_grid);

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
            _ => todo!(),
        }
    }

    pub fn step(&mut self) -> Result<()> {
        // So the better thing here would be to have a tile return its edge information and then
        // tell the other tile to check whether it should be further added to the tile queue
        // also I should be really doing this graph thing right now...
        // and ideally we should be both doing the normal depression filling, as well as this roi-searching depression filling...
        // but the roi part messes things up a bit...
        // ah! we can just initialize the tile queue as a full queue for the non-searching version
        // let level_finished = self.tile_queue.iter().all(|idx| !self.tiles[*idx].step());
        // if level_finished {}
        // for tile_idx in self
        //     .finished
        //     .iter()
        //     .enumerate()
        //     // .filter(|(idx, finished)| **finished && self.playing[*idx])
        //     .map(|(idx, _)| idx)
        //     .collect::<Vec<_>>()
        // {
        //     let tile = &self.tiles[tile_idx];
        // }
        match &mut self.current_step {
            TiledSimStep::InitialFill => {
                for tile_idx in &self.tile_queue {
                    self.tiles[*tile_idx].step();
                }
            }
            TiledSimStep::FillGraph {
                supergraph,
                fill_state,
                graph_elevs,
                node_locations: _,
            } => {
                fill_state.step(supergraph.spill_graph(), graph_elevs);
            }
            _ => todo!(),
        }

        Ok(())
    }

    pub fn start_all(&mut self) {
        for (idx, tile) in self.tiles.iter_mut().enumerate() {
            self.tile_queue.push(idx);
            tile.add_edge();
        }
    }

    pub fn seed_slope(&mut self, x: usize, y: usize) {
        let tile_idx = self.meta.xy_to_i(x / self.tile_size, y / self.tile_size);
        let tile = &mut self.tiles[tile_idx];
        self.tile_queue.push(tile_idx);
        tile.add_edge();
        tile.seed_slope(&[tile.meta.xy_to_i(x % self.tile_size, y % self.tile_size)]);
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

#[derive(Debug, Clone)]
pub struct Tile {
    dem: Vec<f64>,
    labels: Vec<TLabel>,
    coords: TileCoord,
    meta: GridMeta,
    fillstate: ZhouFillState<f64>,
    spill_graph: SpillGraph<f64>,
    pub min: f64,
    pub max: f64,
    pub gradient: Gradient,
}

impl Tile {
    #[must_use]
    pub fn new(
        dem: Vec<f64>,
        labels: Vec<TLabel>,
        coords: TileCoord,
        meta: GridMeta,
        min: f64,
        max: f64,
        gradient: Gradient,
    ) -> Self {
        let fillstate = ZhouFillState::new(0);
        let spill_graph = vec![HashMap::new(); 2 * meta.width() + 2 * meta.height()];
        Self {
            dem,
            labels,
            coords,
            meta,
            fillstate,
            spill_graph,
            min,
            max,
            gradient,
        }
    }

    pub fn add_edge(&mut self) {
        self.fillstate.add_edges(&self.meta, &self.dem);
    }

    pub fn seed_slope(&mut self, idxs: &[usize]) {
        self.fillstate.seed_slope(&mut self.labels, idxs);
    }

    pub fn step(&mut self) -> bool {
        self.fillstate.step(
            &self.meta,
            &mut self.dem,
            &mut self.labels,
            |(my_label, n_label), (my_elev, n_elev)| {
                watersheds_meet(my_label, n_label, my_elev, n_elev, &mut self.spill_graph);
            },
        )
    }

    pub fn complete_fill(&mut self) -> FillData<f64> {
        while self.step() {}
        let edges_size = self.meta.width() * 2 + self.meta.height() * 2 + 4;
        let mut dem_edges = Vec::with_capacity(edges_size);
        let mut label_edges = Vec::with_capacity(edges_size);
        for dir in 0..8 {
            for label in self.meta.edge(self.labels(), dir) {
                label_edges.push(*label);
            }
            for z in self.meta.edge(self.dem(), dir) {
                dem_edges.push(*z);
            }
        }
        let mut spill_graph = self.spill_graph.clone();
        spill_graph.truncate(*self.fillstate.current_label() as usize);
        FillData::new(
            self.coords,
            self.meta.clone(),
            spill_graph,
            dem_edges,
            label_edges,
        )
    }

    #[must_use]
    pub fn dem(&self) -> &[f64] {
        &self.dem
    }
    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
    #[must_use] 
    pub fn labels(&self) -> &[TLabel] {
        &self.labels
    }
}

impl WidgetRef for Tile {
    fn render_ref(&self, area: Rect, buf: &mut Buffer) {
        // give bg color based on height
        for (idx, (l, z)) in self.labels.iter().zip(&self.dem).enumerate() {
            let (dem_x, dem_y) = self.meta.i_to_xy(idx);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            // let color =
            let color = if *l != 0 {
                colorous::PAIRED[*l as usize % 12]
            } else {
                self.gradient.eval_continuous((z - self.min) / self.max)
            };
            buf[(x, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            buf[(x + 1, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            Span::raw(format!("{l}")).render(
                Rect {
                    x,
                    y,
                    width: 2,
                    height: 1,
                },
                buf,
            );
            if (self.labels[idx] & ROI_FLAG) == ROI_FLAG {
                buf[(x + 1, y)].set_bg(Color::Black);
            }
        }
        // set 'S' with color of slope queue
        for (idx, n) in self.fillstate.slope_queue().iter().enumerate() {
            let (dem_x, dem_y) = self.meta.i_to_xy(*n);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.slope_queue().len());
            buf[(x + 1, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x + 1, y)].set_char('S');
        }
        // set 'P' with color of priority queue
        for (idx, n) in self.fillstate.priority_queue().iter().enumerate() {
            let x = u16::try_from(n.x * 2).unwrap() + area.left();
            let y = u16::try_from(n.y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.priority_queue().len());
            buf[(x, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x, y)].set_char('P');
        }
        // set 'D' with color of depression queue
        for (idx, n) in self.fillstate.depression_queue().iter().enumerate() {
            let (dem_x, dem_y) = self.meta.i_to_xy(*n);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            let color = self
                .gradient
                .eval_rational(idx, self.fillstate.depression_queue().len());
            buf[(x, y)].set_fg(Color::Rgb(color.r, color.g, color.b));
            buf[(x, y)].set_char('D');
        }
    }
}

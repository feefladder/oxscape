use std::{collections::HashMap, f64};

use colorous::Gradient;
use oxscape_core::GridMeta;
use oxscape_tile::TLabel;
use oxscape_tile::fill_deps::fill::{FillData, ROI_FLAG, ZhouFillState, watersheds_meet};
use oxscape_tile::fill_deps::graph::SpillGraph;
use oxscape_tile::tile::TileCoord;
use ratatui::prelude::*;

#[derive(Debug, Clone)]
pub struct Tile {
    pub dem: Vec<f64>,
    pub labels: Vec<TLabel>,
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

    pub fn add_edges(&mut self) {
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
        // first finish the simulation
        while self.step() {}
        let dem_edges = self.meta.edges(&self.dem);
        let label_edges = self.meta.edges(&self.labels);
        self.spill_graph
            .truncate(*self.fillstate.current_label() as usize);
        FillData::new(
            self.coords,
            self.meta.clone(),
            self.spill_graph.clone(),
            dem_edges,
            label_edges,
        )
    }

    #[must_use]
    pub fn dem(&self) -> &[f64] {
        &self.dem
    }
    pub fn dem_mut(&mut self) -> &mut [f64] {
        &mut self.dem
    }
    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
    #[must_use]
    pub fn labels(&self) -> &[TLabel] {
        &self.labels
    }
    pub fn labels_mut(&mut self) -> &mut [TLabel] {
        &mut self.labels
    }
    pub fn spill_graph(&self) -> &SpillGraph<f64> {
        &self.spill_graph
    }
}

impl Widget for &Tile {
    fn render(self, area: Rect, buf: &mut Buffer) {
        // give bg color based on height
        for (idx, (l, z)) in self.labels.iter().zip(&self.dem).enumerate() {
            let (dem_x, dem_y) = self.meta.i_to_xy(idx);
            let x = u16::try_from(dem_x * 2).unwrap() + area.left();
            let y = u16::try_from(dem_y).unwrap() + area.top();
            // let color =
            let color = /*if *l != NOT_FILLED {
                colorous::PAIRED[*l as usize % 12]
            } else {*/
                self.gradient.eval_continuous((z - self.min) / self.max)
            /* }*/;
            buf[(x, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            buf[(x + 1, y)].set_bg(Color::Rgb(color.r, color.g, color.b));
            // Span::raw(format!("{l}")).render(
            //     Rect {
            //         x,
            //         y,
            //         width: 2,
            //         height: 1,
            //     },
            //     buf,
            // );
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

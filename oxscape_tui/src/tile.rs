use color_eyre::{Result, eyre::Ok};
use colorous::Gradient;
use oxscape::GridMeta;
use oxscape_tile::{
    TLabel,
    fill::{ROI_FLAG, ZhouFillState},
};
use ratatui::widgets::WidgetRef;
use ratatui::{prelude::*, widgets::Paragraph};
use rayon::prelude::*;

use crate::Simulation;

const NOT_INTERESTING: f64 = f64::MAX;

pub struct TiledSim {
    meta: GridMeta,
    tile_size: usize,
    tiles: Vec<Tile>,
    /// queue for currently processing tiles
    tile_queue: Vec<usize>,
    /// tiles that are finished and should not be added to the queue
    finished: Vec<bool>,
}

impl Simulation for TiledSim {
    fn init(width: usize, height: usize, gradient: Gradient) -> Result<Self> {
        todo!()
    }

    fn resize(&mut self, width: usize, height: usize) -> Result<()> {
        todo!()
    }

    fn restart(&mut self) -> Result<()> {
        todo!()
    }

    fn step(&mut self) -> Result<()> {
        // So the better thing here would be to have a tile return its edge information and then
        // tell the other tile to check whether it should be further added to the tile queue
        // also I should be really doing this graph thing right now...
        // and ideally we should be both doing the normal depression filling, as well as this roi-searching depression filling...
        // but the roi part messes things up a bit...
        // ah! we can just initialize the tile queue as a full queue for the non-searching version
        let level_finished = self.tile_queue.iter().all(|idx| !self.tiles[*idx].step());
        if level_finished {}
        for tile_idx in self
            .finished
            .iter()
            .enumerate()
            // .filter(|(idx, finished)| **finished && self.playing[*idx])
            .map(|(idx, _)| idx)
            .collect::<Vec<_>>()
        {
            // self.finished[tile_idx] = false;

            // self.playing[tile_idx] = false;

            // so now we have to initialize neighbouring tiles....
            // I always wanted a u8 bitmask
            //  2  4  8
            //  1    16
            //128 64 32
            // so 1,4,16 and 64 are edges and 2,8,32,128 are corners
            // we need label and elevation data from the current tile
            // let mut edge_mask = 0u8;
            // maybe we can put all that data in a single vec and do some smart index stuff
            // but for now, let's ignore any performance
            // also let's not store that data, but just have a bunch of for loops
            // we want to both mutate neighbouring tiles and look at the current tile...
            let tile_labels = self.tiles()[tile_idx].labels.clone();
            let tile_dem = self.tiles()[tile_idx].dem().to_vec();
            let tile_meta = self.tiles()[tile_idx].meta().clone();
            let (tile_x, tile_y) = self.meta.i_to_xy(tile_idx);
            // left edge
            if let Some(left_tile_idx) = self.meta.try_shift(tile_x, tile_y, 0)
                && !self.finished[left_tile_idx]
            {
                let idxs;
                {
                    let left_tile = &self.tiles()[left_tile_idx];
                    idxs = (0..tile_meta.height())
                        .filter(|y| {
                            if tile_labels[tile_meta.xy_to_i(0, *y)] & ROI_FLAG == ROI_FLAG {
                                left_tile.dem()
                                    [left_tile.meta().xy_to_i(left_tile.meta().width() - 1, *y)]
                                    > tile_dem[tile_meta.xy_to_i(0, *y)]
                            } else {
                                false
                            }
                        })
                        .map(|y| left_tile.meta().xy_to_i(left_tile.meta().width() - 1, y))
                        .collect::<Vec<_>>();
                }
                if !idxs.is_empty() {
                    // self.playing[left_tile_idx] = true;
                    self.tiles[left_tile_idx].add_edge();
                    self.tiles[left_tile_idx].seed_slope(&idxs);
                }
            }
            // top edge
            if let Some(top_tile_idx) = self.meta.try_shift(tile_x, tile_y, 2)
                && !self.finished[top_tile_idx]
            {
                let idxs;
                {
                    let top_tile = &self.tiles()[top_tile_idx];
                    idxs = (0..tile_meta.width())
                        .filter(|x| {
                            if tile_labels[tile_meta.xy_to_i(*x, 0)] & ROI_FLAG == ROI_FLAG {
                                top_tile.dem()
                                    [top_tile.meta().xy_to_i(*x, top_tile.meta().height() - 1)]
                                    > tile_dem[tile_meta.xy_to_i(*x, 0)]
                            } else {
                                false
                            }
                        })
                        .map(|x| top_tile.meta().xy_to_i(x, top_tile.meta().height() - 1))
                        .collect::<Vec<_>>();
                }
                if !idxs.is_empty() {
                    // self.playing[top_tile_idx] = true;
                    self.tiles[top_tile_idx].add_edge();
                    self.tiles[top_tile_idx].seed_slope(&idxs);
                }
            }
            // right edge
            if let Some(right_tile_idx) = self.meta.try_shift(tile_x, tile_y, 4)
                && !self.finished[right_tile_idx]
            {
                let idxs;
                {
                    let right_tile = &self.tiles()[right_tile_idx];
                    idxs = (0..tile_meta.height())
                        .filter(|y| {
                            if tile_labels[tile_meta.xy_to_i(tile_meta.width() - 1, *y)] & ROI_FLAG
                                == ROI_FLAG
                            {
                                right_tile.dem()[right_tile.meta().xy_to_i(0, *y)]
                                    > tile_dem[tile_meta.xy_to_i(tile_meta.width() - 1, *y)]
                            } else {
                                false
                            }
                        })
                        .map(|y| right_tile.meta().xy_to_i(0, y))
                        .collect::<Vec<_>>();
                }
                if !idxs.is_empty() {
                    // self.playing[right_tile_idx] = true;
                    self.tiles[right_tile_idx].add_edge();
                    self.tiles[right_tile_idx].seed_slope(&idxs);
                }
            }
            // bottom edge
            if let Some(bot_tile_idx) = self.meta.try_shift(tile_x, tile_y, 6)
                && !self.finished[bot_tile_idx]
            {
                let idxs;
                {
                    let bot_tile = &self.tiles()[bot_tile_idx];
                    idxs = (0..tile_meta.width())
                        .filter(|x| {
                            if tile_labels[tile_meta.xy_to_i(*x, tile_meta.height() - 1)] & ROI_FLAG
                                == ROI_FLAG
                            {
                                bot_tile.dem()[bot_tile.meta().xy_to_i(*x, 0)]
                                    > tile_dem[tile_meta.xy_to_i(*x, tile_meta.height() - 1)]
                            } else {
                                false
                            }
                        })
                        .map(|x| bot_tile.meta().xy_to_i(x, 0))
                        .collect::<Vec<_>>();
                }
                if !idxs.is_empty() {
                    // self.playing[bot_tile_idx] = true;
                    self.tiles[bot_tile_idx].add_edge();
                    self.tiles[bot_tile_idx].seed_slope(&idxs);
                }
            }
        }
        //     // top-left corner
        //     if let Some(tl_tile_idx) = self.meta.try_shift(tile_x, tile_y, 1) {
        //         if !self.finished[tl_tile_idx] {
        //             if tile_labels[0] & ROI_FLAG == ROI_FLAG {
        //                 if *self.tiles[tl_tile_idx].dem().last().unwrap() > tile_dem[0] {
        //                     self.playing[tl_tile_idx] = true;
        //                     self.tiles[tl_tile_idx].add_edge();
        //                     self.tiles[tl_tile_idx].seed_slope(&[tile_meta.size() - 1]);
        //                 }
        //             }
        //         }
        //     }
        //     // top-right corner
        //     if let Some(tr_tile_idx) = self.meta.try_shift(tile_x, tile_y, 3) {
        //         if !self.finished[tr_tile_idx] {
        //             let tr_idx = tile_meta.xy_to_i(tile_meta.width() - 1, 0);
        //             if tile_labels[tr_idx] & ROI_FLAG == ROI_FLAG {
        //                 if let Some(idx) = {
        //                     let tr_tile = &self.tiles()[tr_tile_idx];
        //                     let tr_bl_idx = tr_tile.meta().xy_to_i(0, tr_tile.meta().height() - 1);
        //                     if tr_tile.dem()[tr_bl_idx] > tile_dem[tr_idx] {
        //                         Some(tr_bl_idx)
        //                     } else {
        //                         None
        //                     }
        //                 } {
        //                     self.playing[tr_tile_idx] = true;
        //                     self.tiles[tr_tile_idx].add_edge();
        //                     self.tiles[tr_tile_idx].seed_slope(&[idx]);
        //                 }
        //             }
        //         }
        //     }
        //     // bottom-right corner
        //     if let Some(br_tile_idx) = self.meta.try_shift(tile_x, tile_y, 5) {
        //         if !self.finished[br_tile_idx] {
        //             let br_idx = tile_meta.xy_to_i(tile_meta.width() - 1, tile_meta.height() - 1);
        //             if tile_labels[br_idx] & ROI_FLAG == ROI_FLAG {
        //                 if let Some(idx) = {
        //                     let br_tile = &self.tiles()[br_tile_idx];
        //                     let br_tl_idx = br_tile.meta().xy_to_i(0, 0);
        //                     if br_tile.dem()[br_tl_idx] > tile_dem[br_idx] {
        //                         Some(br_tl_idx)
        //                     } else {
        //                         None
        //                     }
        //                 } {
        //                     self.playing[br_tile_idx] = true;
        //                     self.tiles[br_tile_idx].add_edge();
        //                     self.tiles[br_tile_idx].seed_slope(&[idx]);
        //                 }
        //             }
        //         }
        //     }
        //     // bottom-left corner
        //     if let Some(bl_tile_idx) = self.meta.try_shift(tile_x, tile_y, 7) {
        //         if !self.finished[bl_tile_idx] {
        //             let bl_idx = tile_meta.xy_to_i(0, tile_meta.height() - 1);
        //             if tile_labels[bl_idx] & ROI_FLAG == ROI_FLAG {
        //                 if let Some(idx) = {
        //                     let bl_tile = &self.tiles()[bl_tile_idx];
        //                     let bl_tr_idx = bl_tile.meta().xy_to_i(bl_tile.meta().width() - 1, 0);
        //                     if bl_tile.dem()[bl_tr_idx] > tile_dem[bl_idx] {
        //                         Some(bl_tr_idx)
        //                     } else {
        //                         None
        //                     }
        //                 } {
        //                     self.playing[bl_tile_idx] = true;
        //                     self.tiles[bl_tile_idx].add_edge();
        //                     self.tiles[bl_tile_idx].seed_slope(&[idx]);
        //                 }
        //             }
        //         }
        //     }
        // }
        Ok(())
    }
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
        start_label: TLabel,
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
                start_label,
                vec![0; tile_meta.size()],
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
    meta: GridMeta,
    fillstate: ZhouFillState<f64>,
    pub min: f64,
    pub max: f64,
    pub gradient: Gradient,
}

impl Tile {
    #[must_use]
    pub fn new(
        dem: Vec<f64>,
        start_label: TLabel,
        labels: Vec<TLabel>,
        meta: GridMeta,
        min: f64,
        max: f64,
        gradient: Gradient,
    ) -> Self {
        let fillstate = ZhouFillState::new(start_label);
        Self {
            dem,
            labels,
            meta,
            fillstate,
            min,
            max,
            gradient,
        }
    }

    pub fn add_edge(&mut self) {
        self.fillstate.add_edge(&self.meta, &self.dem);
    }

    pub fn seed_slope(&mut self, idxs: &[usize]) {
        self.fillstate.seed_slope(&mut self.labels, idxs);
    }

    pub fn step(&mut self) -> bool {
        self.fillstate
            .step(&self.meta, &mut self.dem, &mut self.labels)
    }
    #[must_use]
    pub fn dem(&self) -> &[f64] {
        &self.dem
    }
    #[must_use]
    pub fn meta(&self) -> &GridMeta {
        &self.meta
    }
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
// struct Grid<'a> {
//     ncols: usize,
//     nrows: usize,
//     tile_width: u16,
//     tile_height: u16,
//     tiles: Vec<Tile<'a>>,
// }

// impl WidgetRef for Grid<'_> {
//     fn render_ref(&self, area: Rect, buf: &mut Buffer) {
//         let col_constraints = (0..self.ncols).map(|_| Constraint::Length(self.tile_width * 2));
//         let row_constraints = (0..self.nrows).map(|_| Constraint::Length(self.tile_height));
//         let horizontal = Layout::horizontal(col_constraints).spacing(2);
//         let vertical = Layout::vertical(row_constraints).spacing(1);

//         let rows = vertical.split(area);
//         let rects = rows.iter().flat_map(|&row| horizontal.split(row).to_vec());

//         for (rect, tile) in rects.zip(&self.tiles) {
//             tile.render_ref(rect, buf);
//         }
//     }
// }

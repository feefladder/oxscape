//! The consumer implementation from Barnes
//!

// use std::collections::HashMap;

// use crate::TLabel;

// // Mock Job1 structure
// #[derive(Clone)]
// struct Job1<T> {
//     /// The graph of watershed connections and their minimal heights
//     graph: Vec<HashMap<TLabel, T>>,
//     top_elev: Vec<T>,
//     bot_elev: Vec<T>,
//     left_elev: Vec<T>,
//     right_elev: Vec<T>,
//     top_label: Vec<TLabel>,
//     bot_label: Vec<TLabel>,
//     left_label: Vec<TLabel>,
//     right_label: Vec<TLabel>,
// }

use std::{fmt::DebugMap, mem, sync::Arc};

use async_channel::{Receiver, Sender};
use async_trait::async_trait;
use ordered_float::FloatCore;
use oxscape::GridMeta;

use crate::{fill::{NextUp, ZhouFillState, fill_zhou2016}, producer::{ConsumerMessage, ProducerMessage, SpillGraph}, tile::TileInfo};

#[async_trait]
pub trait TileServer<T> {
    async fn get_tile(&self, x: usize, y: usize) -> Vec<T>;
    async fn save_to_cache(&self, x: usize, y: usize, name: &str, data: &[T], meta: &GridMeta);
    async fn load_from_cache(&self, x: usize, y: usize, name: &str) -> Vec<T>;
}

// ConsumerSpecifics struct
struct ConsumerSpecifics<ElevT> {
    tile_server: Arc<dyn TileServer<ElevT>>,
    spillover_graph: SpillGraph<ElevT>,
    rx: Receiver<ProducerMessage<ElevT>>,
    tx: Sender<ConsumerMessage<ElevT>>,
}

impl<ElevT> ConsumerSpecifics<ElevT>
where
    ElevT: FloatCore + NextUp,
{
    async fn start(tile_server: Arc<dyn TileServer<ElevT>>, rx: Receiver<ProducerMessage<ElevT>>, tx: Sender<ConsumerMessage<ElevT>>) {
        let mut cs = Self {
            tile_server,
            spillover_graph: Vec::new(),
            rx,
            tx,
        };
        loop {
        match cs.rx.recv().await.unwrap() {
            ProducerMessage::InitialFill(info) => {
                let (x,y) = info.xy();
                let mut dem = cs.tile_server.get_tile(x, y).await;
                let mut labels = vec![0;info.meta().size()];
                let mut fill_state = ZhouFillState::new(2);
                while fill_state.step(&info.meta(), &mut dem, &mut labels, |(mut my_label,mut n_label),(my_elev, n_elev)| {
                    if n_label == 0 {
                        return;
                    }
                    if my_label == n_label {
                        return;
                    }
                    let elev_over = my_elev.max(n_elev);
                    if my_label > n_label {
                        std::mem::swap(&mut my_label, &mut n_label);
                    }
                    if cs.spillover_graph[my_label as usize].is_empty() {
                        cs.spillover_graph[my_label as usize].insert(n_label, elev_over);
                    } else if elev_over<cs.spillover_graph[my_label as usize][&n_label] {
                        *cs.spillover_graph[my_label as usize].get_mut(&n_label).unwrap() = elev_over;
                    }
                }) {}
                cs.tile_server.save_to_cache(x, y, "dem", &dem, info.meta());
                // cs.tile_server.save_to_cache(x, y, "labels", &labels, info.meta());
                cs.tx.send(ConsumerMessage::InitialFillComplete(info, cs.spillover_graph.clone())).await;
                cs.spillover_graph.iter_mut().for_each(|v| v.clear());
            }
            ProducerMessage::CatchmentFill(info, elevations) => {
                let (x,y) = info.xy();
                let dem = cs.tile_server.load_from_cache(x, y, "dem").await;
                let label = cs.tile_server.load_from_cache(x, y, "labels").await;

            }
            ProducerMessage::Quit => break,
        };
        }
    }

    // async fn load_from_evict(&mut self, tile: &TileInfo) {
    //     // The upper limit on unique watersheds is the number of edge cells. Resize
    //     // the graph to this number. The Priority-Flood routines will shrink it to
    //     // the actual number needed.
    //     self.spillover_graph.resize(2 * tile.width + 2 * tile.height, HashMap::new());

    //     // Read in the data associated with the job
    //     // This would be replaced with async file loading logic
    //     // self.dem = Array2D::<ElevT>::load_from_file_async(&tile.filename, false, tile.x, tile.y, tile.width, tile.height, tile.many).await;

    //     // TODO: Figure out a clever way to allow tiles of different widths/heights
    //     if self.dem.width() != tile.width {
    //         eprintln!("Tile '{}' had unexpected width. Found {} expected {}",
    //                  tile.filename, self.dem.width(), tile.width);
    //         panic!("Unexpected width.");
    //     }

    //     if self.dem.height() != tile.height {
    //         eprintln!("Tile '{}' had unexpected height. Found {} expected {}",
    //                  tile.filename, self.dem.height(), tile.height);
    //         panic!("Unexpected height.");
    //     }

    //     // These variables are needed by Priority-Flood. The internal
    //     // interconnections of labeled regions (named "graph") are also needed to
    //     // solve the problem, but that can be passed directly from the job object.
    //     self.labels = Array2D::new(self.dem.width(), self.dem.height());
    //     // Initialize labels with zeros
    //     for y in 0..self.dem.height() {
    //         for x in 0..self.dem.width() {
    //             self.labels.set(x, y, 0);
    //         }
    //     }

    //     // Perform the watershed Priority-Flood algorithm on the tile. The variant
    //     // by Zhou, Sun, and Fu (2015) is used for this; however, I have modified
    //     // their algorithm to label watersheds similarly to what is described in
    //     // Barnes, Lehman, and Mulla (2014). Note that the Priority-Flood needs to
    //     // know whether the tile is being flipped since it uses this information to
    //     // determine which edges connect to Special Watershed 1 (which is the
    //     // outside of the DEM as a whole).
    //     zhou_2015_labels(
    //         &self.dem,
    //         &mut self.labels,
    //         &mut self.spillover_graph,
    //         tile.edge,
    //         tile.flip & FLIP_HORZ != 0,
    //         tile.flip & FLIP_VERT != 0,
    //     );
    // }

    // fn verify_input_sanity(&self) {
    //     // Nothing to verify
    // }

    // async fn save_to_cache(&mut self, tile: &TileInfo) {
    //     // This would save to cache files asynchronously
    //     // self.dem.set_cache_filename(&format!("{}dem.dat", tile.retention));
    //     // self.labels.set_cache_filename(&format!("{}labels.dat", tile.retention));
    //     // self.dem.dump_data_async().await;
    //     // self.labels.dump_data_async().await;
    // }

    // async fn load_from_cache(&mut self, tile: &TileInfo) {
    //     // This would load from cache files asynchronously
    //     // self.dem = Array2D::<ElevT>::load_from_file_async(&format!("{}dem.dat", tile.retention), true).await;
    //     // self.labels = Array2D::<TLabel>::load_from_file_async(&format!("{}labels.dat", tile.retention), true).await;
    // }

    // async fn save_to_retain(&mut self, tile: &TileInfo, storage: &mut Vec<(TLabel, TLabel, Array2D<ElevT>, Array2D<TLabel>)>) {
    //     // This would store data in storage asynchronously
    //     // storage.push((tile.gridy, tile.gridx, self.dem.clone(), self.labels.clone()));
    // }

    // async fn load_from_retain(&mut self, tile: &TileInfo, storage: &Vec<(TLabel, TLabel, Array2D<ElevT>, Array2D<TLabel>)>) {
    //     // This would load data from storage asynchronously
    //     // self.dem = storage[(tile.gridy, tile.gridx)].0.clone();
    //     // self.labels = storage[(tile.gridy, tile.gridx)].1.clone();
    // }

    // fn first_round(&mut self, tile: &TileInfo, job1: &mut Job1<ElevT>) {
    //     job1.graph = std::mem::take(&mut self.spillover_graph);

    //     // The tile's edge info is needed to solve the global problem. Collect it.
    //     job1.top_elev = Vec::new();
    //     job1.bot_elev = Vec::new();
    //     job1.left_elev = Vec::new();
    //     job1.right_elev = Vec::new();
    //     job1.top_label = Vec::new();
    //     job1.bot_label = Vec::new();
    //     job1.left_label = Vec::new();
    //     job1.right_label = Vec::new();

    //     // Flip the tile if necessary. We could flip the entire tile, but this
    //     // requires expensive memory shuffling. Instead, we flip just the perimeter
    //     // of the tile and send the flipped perimeter to the Producer. Notice,
    //     // though, that tiles adjacent to the edge of the DEM need to be treated
    //     // specially, which is why the Priority-Flood performed on each tile
    //     // (above) needs to have knowledge of whether the tile is being flipped.
    //     if tile.flip & FLIP_VERT != 0 {
    //         // Swap vectors (this is a simplified version)
    //         job1.top_elev.swap_with_slice(&mut job1.bot_elev);
    //         job1.top_label.swap_with_slice(&mut job1.bot_label);
    //         job1.left_elev.reverse();
    //         job1.right_elev.reverse();
    //         job1.left_label.reverse();
    //         job1.right_label.reverse();
    //     }

    //     if tile.flip & FLIP_HORZ != 0 {
    //         // Swap vectors (this is a simplified version)
    //         job1.left_elev.swap_with_slice(&mut job1.right_elev);
    //         job1.left_label.swap_with_slice(&mut job1.right_label);
    //         job1.top_elev.reverse();
    //         job1.bot_elev.reverse();
    //         job1.top_label.reverse();
    //         job1.bot_label.reverse();
    //     }
    // }

    // fn second_round(&mut self, tile: &TileInfo, job2: &Job2<ElevT>) {
    //     for y in 0..self.dem.height() {
    //         for x in 0..self.dem.width() {
    //             let label = self.labels.get(x, y).cloned().unwrap_or(0);
    //             if label > 1 {
    //                 let dem_value = self.dem.get(x, y).cloned().unwrap_or_default();
    //                 let threshold = job2.at(label);
    //                 if dem_value < threshold {
    //                     // This would update the DEM value
    //                     // self.dem.set(x, y, threshold);
    //                 }
    //             }
    //         }
    //     }

    //     // At this point we're done with the calculation! Boo-yeah!
    //     // self.dem.print_stamp(5, "Unorientated output stamp");

    //     // This would save to GDAL file
    //     // self.dem.save_gdal(&tile.outputname, &tile.analysis, tile.x, tile.y);
    // }
}

//! The consumer implementation from Barnes
//!

// use std::collections::HashMap;
use std::ops::{Index,IndexMut};

use oxscape::GridMeta;

// use crate::TLabel;

/// A unified way to work with different underlying data structures as if they are normal arrays
///
/// - `index[(x,y)]`
/// 
/// not sure if these should be trait members:
/// - `try_shift((x,y), dir)`
/// - `xy_to_i(x,y)->i`
/// or we should just add a meta function:
/// - `.meta().try_shift((x,y),dir)`
pub trait Array2D<T>: Index<(usize,usize), Output = T> + IndexMut<(usize,usize)> {
    /// Get a neighbour index `(x,y)` or `None` if out-of-bounds
    ///
    fn try_shift(&self, x: usize, y: usize, dir: u8) -> Option<(usize,usize)>;

    fn xy_to_i(&self, x: usize, y: usize) -> usize;
    fn i_to_xy(&self, i: usize) -> (usize,usize);
}

/// The simplest wrapper for some raw data and its corresponding GridMeta
#[derive(Debug)]
pub struct BorrowedArray2D<'a, T> {
    data: &'a mut [T],
    meta: &'a GridMeta
}

impl<'a, T> BorrowedArray2D<'a, T> {
    pub fn new(meta: &'a GridMeta, data: &'a mut[T]) -> Self {
        Self { data, meta }
    }
}

impl<T> Index<(usize, usize)> for BorrowedArray2D<'_, T> {
    type Output = T;
     fn index(&self, index: (usize, usize)) -> &Self::Output {
         &self.data[self.meta.xy_to_i(index.0, index.1)]
     }
}

impl<T> IndexMut<(usize,usize)> for BorrowedArray2D<'_, T> {
    fn index_mut(&mut self, index: (usize,usize)) -> &mut Self::Output {
        &mut self.data[self.meta.xy_to_i(index.0, index.1)]
    }
}

impl<T> Array2D<T> for BorrowedArray2D<'_, T> {
    fn try_shift(&self, x: usize, y: usize, dir: u8) -> Option<(usize,usize)> {
        self.meta.try_shift(x, y, dir).map(|idx| self.meta.i_to_xy(idx))
    }

    fn i_to_xy(&self, i: usize) -> (usize,usize) {
        self.meta.i_to_xy(i)
    }

    fn xy_to_i(&self, x: usize, y: usize) -> usize {
        self.meta.xy_to_i(x, y)
    }
}

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

// pub trait TileServer<T> {
//     async fn get_tile(&self, x: usize, y: usize) -> Vec<T>;
// }

// // ConsumerSpecifics struct
// struct ConsumerSpecifics<ElevT> {
//     tile_info: TileInfo,
// }

// impl<ElevT> ConsumerSpecifics<ElevT>
// where
//     ElevT: Clone + Default + std::cmp::PartialOrd + Copy + Send + Sync,
// {
//     fn new() -> Self {
//         ConsumerSpecifics {
//             dem: Array2D::new(0, 0),
//             labels: Array2D::new(0, 0),
//             spillover_graph: Vec::new(),
//         }
//     }

//     async fn load_from_evict(&mut self, tile: &TileInfo) {
//         // The upper limit on unique watersheds is the number of edge cells. Resize
//         // the graph to this number. The Priority-Flood routines will shrink it to
//         // the actual number needed.
//         self.spillover_graph.resize(2 * tile.width + 2 * tile.height, HashMap::new());

//         // Read in the data associated with the job
//         // This would be replaced with async file loading logic
//         // self.dem = Array2D::<ElevT>::load_from_file_async(&tile.filename, false, tile.x, tile.y, tile.width, tile.height, tile.many).await;

//         // TODO: Figure out a clever way to allow tiles of different widths/heights
//         if self.dem.width() != tile.width {
//             eprintln!("Tile '{}' had unexpected width. Found {} expected {}",
//                      tile.filename, self.dem.width(), tile.width);
//             panic!("Unexpected width.");
//         }

//         if self.dem.height() != tile.height {
//             eprintln!("Tile '{}' had unexpected height. Found {} expected {}",
//                      tile.filename, self.dem.height(), tile.height);
//             panic!("Unexpected height.");
//         }

//         // These variables are needed by Priority-Flood. The internal
//         // interconnections of labeled regions (named "graph") are also needed to
//         // solve the problem, but that can be passed directly from the job object.
//         self.labels = Array2D::new(self.dem.width(), self.dem.height());
//         // Initialize labels with zeros
//         for y in 0..self.dem.height() {
//             for x in 0..self.dem.width() {
//                 self.labels.set(x, y, 0);
//             }
//         }

//         // Perform the watershed Priority-Flood algorithm on the tile. The variant
//         // by Zhou, Sun, and Fu (2015) is used for this; however, I have modified
//         // their algorithm to label watersheds similarly to what is described in
//         // Barnes, Lehman, and Mulla (2014). Note that the Priority-Flood needs to
//         // know whether the tile is being flipped since it uses this information to
//         // determine which edges connect to Special Watershed 1 (which is the
//         // outside of the DEM as a whole).
//         zhou_2015_labels(
//             &self.dem,
//             &mut self.labels,
//             &mut self.spillover_graph,
//             tile.edge,
//             tile.flip & FLIP_HORZ != 0,
//             tile.flip & FLIP_VERT != 0,
//         );
//     }

//     fn verify_input_sanity(&self) {
//         // Nothing to verify
//     }

//     async fn save_to_cache(&mut self, tile: &TileInfo) {
//         // This would save to cache files asynchronously
//         // self.dem.set_cache_filename(&format!("{}dem.dat", tile.retention));
//         // self.labels.set_cache_filename(&format!("{}labels.dat", tile.retention));
//         // self.dem.dump_data_async().await;
//         // self.labels.dump_data_async().await;
//     }

//     async fn load_from_cache(&mut self, tile: &TileInfo) {
//         // This would load from cache files asynchronously
//         // self.dem = Array2D::<ElevT>::load_from_file_async(&format!("{}dem.dat", tile.retention), true).await;
//         // self.labels = Array2D::<TLabel>::load_from_file_async(&format!("{}labels.dat", tile.retention), true).await;
//     }

//     async fn save_to_retain(&mut self, tile: &TileInfo, storage: &mut Vec<(TLabel, TLabel, Array2D<ElevT>, Array2D<TLabel>)>) {
//         // This would store data in storage asynchronously
//         // storage.push((tile.gridy, tile.gridx, self.dem.clone(), self.labels.clone()));
//     }

//     async fn load_from_retain(&mut self, tile: &TileInfo, storage: &Vec<(TLabel, TLabel, Array2D<ElevT>, Array2D<TLabel>)>) {
//         // This would load data from storage asynchronously
//         // self.dem = storage[(tile.gridy, tile.gridx)].0.clone();
//         // self.labels = storage[(tile.gridy, tile.gridx)].1.clone();
//     }

//     fn first_round(&mut self, tile: &TileInfo, job1: &mut Job1<ElevT>) {
//         job1.graph = std::mem::take(&mut self.spillover_graph);

//         // The tile's edge info is needed to solve the global problem. Collect it.
//         job1.top_elev = Vec::new();
//         job1.bot_elev = Vec::new();
//         job1.left_elev = Vec::new();
//         job1.right_elev = Vec::new();
//         job1.top_label = Vec::new();
//         job1.bot_label = Vec::new();
//         job1.left_label = Vec::new();
//         job1.right_label = Vec::new();

//         // Flip the tile if necessary. We could flip the entire tile, but this
//         // requires expensive memory shuffling. Instead, we flip just the perimeter
//         // of the tile and send the flipped perimeter to the Producer. Notice,
//         // though, that tiles adjacent to the edge of the DEM need to be treated
//         // specially, which is why the Priority-Flood performed on each tile
//         // (above) needs to have knowledge of whether the tile is being flipped.
//         if tile.flip & FLIP_VERT != 0 {
//             // Swap vectors (this is a simplified version)
//             job1.top_elev.swap_with_slice(&mut job1.bot_elev);
//             job1.top_label.swap_with_slice(&mut job1.bot_label);
//             job1.left_elev.reverse();
//             job1.right_elev.reverse();
//             job1.left_label.reverse();
//             job1.right_label.reverse();
//         }

//         if tile.flip & FLIP_HORZ != 0 {
//             // Swap vectors (this is a simplified version)
//             job1.left_elev.swap_with_slice(&mut job1.right_elev);
//             job1.left_label.swap_with_slice(&mut job1.right_label);
//             job1.top_elev.reverse();
//             job1.bot_elev.reverse();
//             job1.top_label.reverse();
//             job1.bot_label.reverse();
//         }
//     }

//     fn second_round(&mut self, tile: &TileInfo, job2: &Job2<ElevT>) {
//         for y in 0..self.dem.height() {
//             for x in 0..self.dem.width() {
//                 let label = self.labels.get(x, y).cloned().unwrap_or(0);
//                 if label > 1 {
//                     let dem_value = self.dem.get(x, y).cloned().unwrap_or_default();
//                     let threshold = job2.at(label);
//                     if dem_value < threshold {
//                         // This would update the DEM value
//                         // self.dem.set(x, y, threshold);
//                     }
//                 }
//             }
//         }

//         // At this point we're done with the calculation! Boo-yeah!
//         // self.dem.print_stamp(5, "Unorientated output stamp");

//         // This would save to GDAL file
//         // self.dem.save_gdal(&tile.outputname, &tile.analysis, tile.x, tile.y);
//     }
// }

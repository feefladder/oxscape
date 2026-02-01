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

use std::{collections::HashMap, fmt::DebugMap, mem, sync::Arc};

use async_channel::{Receiver, Sender};
use async_trait::async_trait;
use bytemuck::{AnyBitPattern, NoUninit, Pod, cast_slice, cast_slice_mut};
use ordered_float::FloatCore;
use oxscape::GridMeta;

use crate::{
    array_2d::{Array2D, BorrowedArray2D},
    fill::{NextUp, ZhouFillState, fill_zhou2016},
    producer::{ConsumerMessage, FillData, ProducerMessage, SpillGraph},
    tile::TileInfo,
};

#[async_trait]
pub trait TileServer<T> {
    async fn get_tile(&self, x: usize, y: usize) -> Vec<T>;
    async fn save_to_cache(&self, x: usize, y: usize, name: &str, data: &[T], meta: &GridMeta);
    async fn load_from_cache(&self, x: usize, y: usize, name: &str) -> Vec<T>;
}

// ConsumerSpecifics struct
struct ConsumerSpecifics<ElevT> {
    tile_server: Arc<dyn TileServer<ElevT>>,
    spill_graph: SpillGraph<ElevT>,
    rx: Receiver<ProducerMessage<ElevT>>,
    tx: Sender<ConsumerMessage<ElevT>>,
}

impl<ElevT> ConsumerSpecifics<ElevT>
where
    ElevT: FloatCore + NextUp + AnyBitPattern + NoUninit,
{
    async fn start(
        tile_server: Arc<dyn TileServer<ElevT>>,
        rx: Receiver<ProducerMessage<ElevT>>,
        tx: Sender<ConsumerMessage<ElevT>>,
    ) {
        loop {
            match rx.recv().await.unwrap() {
                ProducerMessage::InitialFill(info) => {
                    let mut spill_graph = vec![
                        HashMap::new();
                        2 * info.meta().width() + 2 * info.meta().height()
                            - 4
                    ];
                    let (tile_x, tile_y) = info.xy();
                    // load the tile from whatever backing store
                    let dem_buf = &mut tile_server.get_tile(tile_x, tile_y).await[..];
                    let dem: &mut [ElevT] = cast_slice_mut(dem_buf);
                    let mut labels = vec![0; info.meta().size()];
                    // Do the depression filling. This is the Zhou algorithm, with a
                    // special closure that lets us determine what to do when
                    // watersheds meet. In that case, we note the spillover
                    // elevation LabelA->LabelB and decrease it when necessary
                    let mut fill_state = ZhouFillState::new(2);
                    while fill_state.step(
                        &info.meta(),
                        dem,
                        &mut labels,
                        |(mut my_label, mut n_label), (my_elev, n_elev)| {
                            if n_label == 0 {
                                return;
                            }
                            if my_label == n_label {
                                return;
                            }
                            let elev_over = my_elev.max(n_elev);

                            //Ensure that my_label is always smaller. Doing so means that we only need to
                            //keep track of one half of what is otherwise a bidirectional weighted graph
                            if my_label > n_label {
                                std::mem::swap(&mut my_label, &mut n_label);
                            }
                            if spill_graph[my_label as usize].is_empty() {
                                spill_graph[my_label as usize].insert(n_label, elev_over);
                            } else if elev_over < spill_graph[my_label as usize][&n_label] {
                                *spill_graph[my_label as usize].get_mut(&n_label).unwrap() =
                                    elev_over;
                            }
                        },
                    ) {}

                    let mut label_edges =
                        Vec::with_capacity(2 * info.meta().width() + 2 * info.meta().height() + 4);
                    let mut dem_edges = Vec::with_capacity(label_edges.capacity());

                    for dir in 0..8 {
                        for l in info.meta().edge(&labels, dir) {
                            label_edges.push(*l);
                        }
                        for z in info.meta().edge(dem, dir) {
                            dem_edges.push(*z);
                        }
                    }
                    let res = FillData {
                        spill_graph,
                        dem_edges,
                        label_edges,
                        label_offset: None,
                    };

                    tile_server
                        .save_to_cache(tile_x, tile_y, "dem", cast_slice(&dem), info.meta())
                        .await;
                    tile_server
                        .save_to_cache(tile_x, tile_y, "labels", cast_slice(&labels), info.meta())
                        .await;
                    // TODO: apparently we may also need like edge info, but idk why... ah yes for edge tiles that connect to watershed 1 I guess?
                    tx.send(ConsumerMessage::InitialFillComplete(info, res))
                        .await
                        .unwrap();
                }
                ProducerMessage::CatchmentRaise(info, elevations) => {
                    let (x, y) = info.xy();
                    let dem_buf = &mut tile_server.load_from_cache(x, y, "dem").await;
                    let dem = cast_slice_mut(dem_buf);
                    let labels_buf = &tile_server.load_from_cache(x, y, "labels").await;
                    let labels: &[u32] = cast_slice(labels_buf);
                    for (z, label) in dem.iter_mut().zip(labels) {
                        if elevations[*label as usize] > *z {
                            *z = elevations[*label as usize]
                        }
                    }
                    tile_server
                        .save_to_cache(x, y, "dem", cast_slice(dem), info.meta())
                        .await;
                }
                ProducerMessage::Quit => break,
            };
        }
    }
}

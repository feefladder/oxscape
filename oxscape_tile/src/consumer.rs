//! The consumer implementation from Barnes
//!

use std::{collections::HashMap, fmt::Debug, sync::Arc};

use async_channel::{Receiver, Sender};
use async_trait::async_trait;
use bytemuck::{AnyBitPattern, NoUninit, cast_slice, cast_slice_mut};
use num_traits::float::{Float, TotalOrder};
use oxscape_core::{Dir, GridMeta, NextUp};

use crate::{
    depfill::{FillData, RidgePoint, SpillGraph, ZhouFillState, watersheds_meet},
    producer::{ConsumerMessage, ProducerMessage},
    tile::TileCoord,
};

#[async_trait]
pub trait TileServer<T> {
    async fn get_tile(&self, tile_xy: TileCoord) -> Vec<T>;
    async fn save_to_cache(&self, tile_xy: TileCoord, name: &str, data: &[T], meta: &GridMeta);
    async fn load_from_cache(&self, tile_xy: TileCoord, name: &str) -> Vec<T>;
}

// ConsumerSpecifics struct
#[allow(unused)]
struct ConsumerSpecifics<ElevT> {
    tile_server: Arc<dyn TileServer<ElevT>>,
    spill_graph: SpillGraph<ElevT>,
    rx: Receiver<ProducerMessage<ElevT>>,
    tx: Sender<ConsumerMessage<ElevT>>,
}

impl<ElevT> ConsumerSpecifics<ElevT>
where
    ElevT: Float + NextUp + AnyBitPattern + NoUninit + Debug + TotalOrder,
{
    pub async fn start(
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
                    let tc = info.xy();
                    // load the tile from whatever backing store
                    let dem_buf = &mut tile_server.get_tile(tc).await[..];
                    let dem: &mut [ElevT] = cast_slice_mut(dem_buf);
                    let mut labels = vec![0; info.meta().size()];
                    // Do the depression filling. This is the Zhou algorithm, with a
                    // special closure that lets us determine what to do when
                    // watersheds meet. In that case, we note the spillover
                    // elevation LabelA->LabelB and decrease it when necessary
                    let mut fill_state = ZhouFillState::new(0);
                    while fill_state.step(
                        info.meta(),
                        dem,
                        &mut labels,
                        |RidgePoint {
                             my_label,
                             n_label,
                             my_elev,
                             n_elev,
                             ..
                         }| {
                            watersheds_meet(my_label, n_label, my_elev, n_elev, &mut spill_graph)
                        },
                    ) {}
                    // truncate the spill graph to the number of labels
                    spill_graph.truncate(usize::try_from(*fill_state.current_label()).unwrap());

                    let mut label_edges =
                        Vec::with_capacity(2 * info.meta().width() + 2 * info.meta().height() + 4);
                    let mut dem_edges = Vec::with_capacity(label_edges.capacity());

                    for dir in Dir::iter() {
                        for l in info.meta().edge(&labels, dir) {
                            label_edges.push(*l);
                        }
                        for z in info.meta().edge(dem, dir) {
                            dem_edges.push(*z);
                        }
                    }

                    tile_server
                        .save_to_cache(tc, "dem", cast_slice(dem), info.meta())
                        .await;
                    tile_server
                        .save_to_cache(tc, "labels", cast_slice(&labels), info.meta())
                        .await;
                    let res = FillData {
                        tile_info: info,
                        spill_graph,
                        dem_edges,
                        label_edges,
                    };
                    tx.send(ConsumerMessage::InitialFillComplete(res))
                        .await
                        .unwrap();
                }
                ProducerMessage::CatchmentRaise(info, elevations) => {
                    let tc = info.xy();
                    let dem_buf = &mut tile_server.load_from_cache(tc, "dem").await;
                    let dem = cast_slice_mut(dem_buf);
                    let labels_buf = &tile_server.load_from_cache(tc, "labels").await;
                    let labels: &[u32] = cast_slice(labels_buf);
                    for (z, label) in dem.iter_mut().zip(labels) {
                        if elevations[*label as usize] > *z {
                            *z = elevations[*label as usize]
                        }
                    }
                    tile_server
                        .save_to_cache(tc, "dem", cast_slice(dem), info.meta())
                        .await;
                }
                ProducerMessage::Quit => break,
            };
        }
    }
}

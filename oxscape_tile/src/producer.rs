//! The consumer implementation from Barnes
//!

use std::collections::HashMap;
use std::fmt::Debug;

use async_channel::{Receiver, Sender};
use num_traits::float::TotalOrder;
use ordered_float::FloatCore;
use oxscape::GridMeta;

use crate::fill_deps::fill::{FillData, NextUp};
use crate::fill_deps::fill_graph::fill_supergraph;
use crate::fill_deps::grid::{HashMapFillGrid, TileGrid};
use crate::tile::TileInfo;

pub struct Producer<T: FloatCore + NextUp> {
    producer: ProducerSpecifics<T>,
    meta: GridMeta,
}

pub struct ProducerSpecifics<T: FloatCore + NextUp> {
    graph_elevations: Vec<T>,
}

/// Enum with different messages that can be passed producer-consumer
pub enum ProducerMessage<T> {
    /// Fill the tile DEM and note its catchments
    InitialFill(TileInfo),
    /// Fill the tile DEM's catchments to the given levels
    CatchmentRaise(TileInfo, Vec<T>),
    /// Everything done, quit
    Quit,
}

/// Different messages that can be passed consumer-producer
#[derive(Debug)]
pub enum ConsumerMessage<T> {
    /// Tile filled, these are it's catchments and spillover elevations
    InitialFillComplete(FillData<T>),
    /// Completed filling the catchments
    CatchmentFillComplete,
}

///Producer takes a collection of Jobs and delegates them to Consumers. Once all
///of the jobs have received their initial processing, it uses that information
///to compute the global properties necessary to the solution. Each Job, suitably
///modified, is then redelegated to a Consumer which ultimately finishes the
///processing.
pub async fn producer<T: Debug + TotalOrder + Default + FloatCore>(
    tiles: TileGrid,
    sender: Sender<ProducerMessage<T>>,
    receiver: Receiver<ConsumerMessage<T>>,
) {
    let n_tiles = tiles.len();
    // send all tiles to consumers
    // they will fill their tile and give catchment information
    for (_coords, tile) in tiles {
        sender
            .send(ProducerMessage::InitialFill(tile))
            .await
            .expect("Channel should be open");
    }

    // get catchment connectivity information from consumers
    let mut job1_grid = HashMapFillGrid {
        grid: HashMap::with_capacity(n_tiles),
    };
    for _ in 0..n_tiles {
        if let ConsumerMessage::InitialFillComplete(fill_data) =
            receiver.recv().await.expect("channel receive error")
        {
            job1_grid.grid.insert(fill_data.tile_info.xy(), fill_data);
        } else {
            unreachable!(
                "At this point no other messages have been sent that way, so none should be returned this way"
            );
        };
    }

    // fill the supergraph DEM
    let jobs_2 = fill_supergraph(job1_grid);

    // tell all consumers to fill their tiles to the amount given in jobs2
    for (tile, job2) in jobs_2 {
        sender
            .send(ProducerMessage::CatchmentRaise(tile, job2))
            .await
            .expect("Channel should be open");
    }

    // await their completion
    // This currently doesn't return anything, but results are saved to cache
    for _ in 0..n_tiles {
        match receiver.recv().await.expect("channel should be open") {
            ConsumerMessage::CatchmentFillComplete => {}
            other_message => unreachable!(
                "Received message {other_message:?}, whereas only `CatchmentFillComplete` was expected"
            ),
        }
    }

    // tell consumers to quit
    for _ in 0..n_tiles {
        sender
            .send(ProducerMessage::Quit)
            .await
            .expect("channel should be open");
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[tokio::test]
    async fn test_channel() {
        let (s, r1) = async_channel::unbounded();
        let r2 = r1.clone();
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r2.recv().await.unwrap(), 42);
        assert_eq!(r1.recv().await.unwrap(), 43);
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r1.recv().await.unwrap(), 42);
        assert_eq!(r2.recv().await.unwrap(), 43);
    }
}

//! The consumer implementation from Barnes
//!

use std::collections::HashMap;

use async_channel::{Receiver, Sender};
use ordered_float::{Float, FloatCore};
use oxscape::GridMeta;

use crate::{TLabel, fill::NextUp, tile::TileInfo};

pub type SpillGraph<T> = Vec<HashMap<TLabel, T>>;
pub type TileGrid = HashMap<(u64, u64), TileInfo>;
pub type Job1Grid<T> = HashMap<(u64, u64), SpillGraph<T>>;
pub type Job2Grid<T> = HashMap<TileInfo, Vec<T>>;

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
    CatchmentFill(TileInfo, Vec<T>),
    /// Everything done, quit
    Quit,
}

/// Different messages that can be passed consumer-producer
pub enum ConsumerMessage<T> {
    /// Tile filled, these are it's catchments and spillover elevations
    InitialFillComplete(TileInfo, SpillGraph<T>),
    /// Completed filling the catchments
    CatchmentFillComplete,
}

///Producer takes a collection of Jobs and delegates them to Consumers. Once all
///of the jobs have received their initial processing, it uses that information
///to compute the global properties necessary to the solution. Each Job, suitably
///modified, is then redelegated to a Consumer which ultimately finishes the
///processing.
pub async fn producer<T>(
    tiles: TileGrid,
    sender: Sender<ProducerMessage<T>>,
    receiver: Receiver<ConsumerMessage<T>>,
) {
    let n_tiles = tiles.len();
    // send all tiles to consumers
    // they will fill their tile and giva catchment information
    for (_coords, tile) in tiles {
        sender
            .send(ProducerMessage::InitialFill(tile))
            .await
            .expect("Channel should work");
    }

    // get catchment connectivity information from consumers
    let mut job1_grid = Job1Grid::with_capacity(n_tiles);
    for _ in 0..n_tiles {
        let ConsumerMessage::InitialFillComplete(tile, graph) =
            receiver.recv().await.expect("channel receive error")
        else {
            todo!("proper error handling, this is bad")
        };
        job1_grid.insert(tile.xy(), graph);
    }

    // fill the supergraph DEM
    let jobs_2 = fill_supergraph(job1_grid);

    // tell all consumers to fill their tiles to the amount given in jobs2
    for (tile, job2) in jobs_2 {
        sender
            .send(ProducerMessage::CatchmentFill(tile, job2))
            .await;
    }

    // await their completion
    for _ in 0..n_tiles {
        receiver.recv().await;
    }

    // tell consumers to quit
    for _ in 0..n_tiles {
        sender.send(ProducerMessage::Quit).await;
    }
}

fn fill_supergraph<T>(supergraph: Job1Grid<T>) -> Job2Grid<T> {
    todo!("Zhou on graph");
}

#[cfg(test)]
mod test {
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

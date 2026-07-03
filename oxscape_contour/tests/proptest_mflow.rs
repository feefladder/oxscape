#![allow(missing_docs)]
use std::{collections::HashSet, fmt::Debug};

use oxscape_contour::{
    NOT_A_DONOR,
    mflow::{Contours, FlowMetric},
};
use oxscape_core::{Flow, GridMeta, error::GridError};
use proptest::prelude::*;

type TFlow = f64;

/// A flow metric that just assigns pre-determined flows to a grid, regardless of anything else
#[derive(Debug)]
struct DBroken {
    flows: Vec<[TFlow; 8]>,
    nrec: Vec<u8>,
}

unsafe impl<TElev> FlowMetric<TElev> for DBroken {
    type Error = GridError;
    type TFlow = TFlow;
    fn metric(
        &mut self,
        _meta: &GridMeta,
        _dem: &[TElev],
        flows: &mut [[Self::TFlow; 8]],
        nrec: &mut [u8],
    ) -> oxscape_core::Result<(), Self::Error> {
        flows.copy_from_slice(&self.flows);
        nrec.copy_from_slice(&self.nrec);
        Ok(())
    }
}

fn check_invariant(arr: &[u8], meta: &GridMeta, metric: &mut DBroken) {
    let Ok(order) = Contours::from_dem_metric(
        meta.clone(),
        &arr.iter().map(|v| *v as f64).collect::<Vec<_>>(),
        metric,
    ) else {
        return;
    };

    println!("successfully made order {order:?}");

    for level in order
        .levels()
        .windows(2)
        .map(|w| &order.stack()[w[0]..w[1]])
    {
        let mut set = HashSet::new();

        for idx in level {
            assert!(set.insert(idx));
        }

        for idx in level {
            for dir in 0..8 {
                if order.flows()[*idx][dir] != TFlow::no_flow() {
                    assert!(!set.contains(&meta.shift(*idx, dir as u8)));
                }

                let don_idx = order.donors()[*idx][dir];
                if don_idx != NOT_A_DONOR {
                    assert!(!set.contains(&don_idx))
                }
            }
        }
    }
}

proptest! {
    #[test]
    fn test_prop_order_invariant_mflow(arr in proptest::collection::vec(0u8..9, 16)) {
        let meta = GridMeta::new(4, 4);

        let mut metric = DBroken {
            flows: vec![[1.0; 8]; 16],
            nrec: arr.clone(),
        };

        check_invariant(&arr, &meta, &mut metric);
    }
}

// proptest! {
#[test]
fn test_order_invariant_mflow() {
    // arr in uniform16(0..9u8)
    let arr = [0u8; 16];
    let meta = GridMeta::new(4, 4);
    let mut metric = DBroken {
        flows: vec![[1.0; 8]; 16],
        nrec: arr.to_vec(),
    };
    let mut set = HashSet::new();
    let Ok(order) = Contours::from_dem_metric(meta.clone(), &arr.map(|v| v as f64), &mut metric)
    else {
        return; // Ok(());
    };
    for level in order
        .levels()
        .windows(2)
        .map(|w| &order.stack()[w[0]..w[1]])
    {
        set.clear();
        for idx in level {
            assert!(set.insert(idx));
        }
        // allowed_indices point OUTSIDE the level
        for idx in level {
            for dir in 0..8 {
                if order.flows()[*idx][dir] != TFlow::no_flow() {
                    assert!(!set.contains(&meta.shift(*idx, dir as u8)));
                }

                let don_idx = order.donors()[*idx][dir];
                if don_idx != NOT_A_DONOR {
                    assert!(!set.contains(&don_idx))
                }
            }
        }
    }
}
// }

// previously failed cases
#[test]
#[rustfmt::skip]
fn test_33f13c4676537ead5ae05891139ff4575c14d5f5f64631bb2cc8c5b1d2e85f1b() {
    let arr = vec![
        0,2,1,1,
        2,2,1,1,
        1,1,1,1,
        1,1,1,1
    ];
    let meta = GridMeta::new(4, 4);

    let mut metric = DBroken {
        flows: vec![[1.0; 8]; 16],
        nrec: arr.clone(),
    };

    check_invariant(&arr, &meta, &mut metric);
}

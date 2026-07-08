#![allow(missing_docs)]
use std::collections::HashSet;

use oxscape_contour::{
    NOT_A_DONOR,
    sflow::{FlowMetric, FlowOrder},
};
use oxscape_core::{GridMeta, NO_FLOW, error::GridError};
use proptest::{array::uniform16, prelude::*};

#[derive(Debug)]
struct DBroken(Vec<u8>);

impl<TElev> FlowMetric<TElev> for DBroken {
    type Error = GridError;
    fn metric(
        &self,
        meta: &GridMeta,
        _dem: &[TElev],
        receivers: &mut [u8],
    ) -> oxscape_core::Result<(), Self::Error> {
        meta.check(&self.0)?;
        // we don't care about
        Ok(receivers.copy_from_slice(&self.0))
    }
}

proptest! {
#[test]
fn test_order_invariant_sflow(arr in uniform16(0..9u8)) {
    let meta = GridMeta::new(4, 4);
    let mut metric = DBroken(arr.to_vec());
    let mut set = HashSet::new();
    let Ok(order) = FlowOrder::from_dem_metric(meta.clone(), &arr.map(|v| v as f64), &mut metric) else {return Ok(());};
    for level in order
        .contours()
        .windows(2)
        .map(|w| &order.stack()[w[0]..w[1]])
    {
        set.clear();
        for idx in level {
            prop_assert!(set.insert(idx))
        }
        // allowed_indices point OUTSIDE the level
        for idx in level {
            for n in 0..8 {
                let don_idx = order.donors()[*idx][n];
                if don_idx != NOT_A_DONOR {
                    assert!(!set.contains(&don_idx))
                }
            }
            if order.receivers()[*idx] == NO_FLOW {
                continue;
            }
            prop_assert!(!set.contains(&meta.shift(*idx, order.receivers()[*idx])));
        }
    }
}
}

use std::collections::HashSet;

use oxscape_contour::{
    NOT_A_DONOR,
    sflow::{FlowMetric, Order},
};
use oxscape_core::{GridMeta, NO_FLOW, error::GridError};
use proptest::{array::uniform16, prelude::*};

#[derive(Debug)]
struct DBroken(Vec<u8>);

impl FlowMetric for DBroken {
    type Error = GridError;
    fn metric<T: num_traits::Float + From<f64> + Sync>(
        &self,
        meta: &oxscape_core::GridMeta,
        _dem: &[T],
        receivers: &mut [u8],
    ) -> oxscape_core::Result<(), Self::Error> {
        meta.check(&self.0)?;
        // we don't care about
        Ok(receivers.copy_from_slice(&self.0))
    }
}

proptest! {
#[test]
fn test_invariant(arr in uniform16(0..9u8)) {
    let meta = GridMeta::new(4, 4);
    let mut metric = DBroken(arr.to_vec());
    let mut set = HashSet::new();
    let order = Order::from_dem_metric(meta.clone(), &arr.map(|v| v as f64), &mut metric).prop_assume_ok()?;
    for level in order
        .levels()
        .windows(2)
        .map(|w| &order.stack()[w[0]..w[1]])
    {
        set.clear();
        for idx in level {
            prop_assert!(set.insert(idx))
        }
        // allowed_indices point OUTSIDE the level
        for idx in level {
            if order.receivers()[*idx] == NO_FLOW {
                continue;
            }
            prop_assert!(!set.contains(&meta.shift(*idx, order.receivers()[*idx])));
            for n in 0..8 {
                let don_idx = order.donors()[*idx][n];
                if don_idx != NOT_A_DONOR {
                    assert!(!set.contains(&don_idx))
                }
            }
        }
    }
}
}

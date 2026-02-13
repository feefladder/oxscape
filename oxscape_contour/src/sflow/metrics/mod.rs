use crate::sflow::FlowMetric;
use oxscape_core::{GridMeta, Result, error::GridError};
use oxscape_flowmets::sflow::d8::compute_receivers;

use num_traits::Float;

/// D8 flow routing
///
/// Passes all flow to the lowest neighbour
#[derive(Debug)]
pub struct D8;

impl<TElev: Float + Sync> FlowMetric<TElev> for D8 {
    type Error = GridError;
    fn metric(
        &self,
        meta: &GridMeta,
        dem: &[TElev],
        receivers: &mut [u8],
    ) -> Result<(), Self::Error> {
        compute_receivers(meta, dem, receivers)
    }
}

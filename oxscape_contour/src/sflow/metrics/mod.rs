use crate::sflow::FlowMetric;
use oxscape_core::{GridMeta, Result, error::GridError};
use oxscape_flowmets::sflow::d8::compute_receivers;

use num_traits::Float;

#[derive(Debug)]
pub struct D8;

impl FlowMetric for D8 {
    type Error = GridError;
    fn metric<T: Float + From<f64> + Sync>(
        &self,
        meta: &GridMeta,
        dem: &[T],
        receivers: &mut [u8],
    ) -> Result<(), Self::Error> {
        compute_receivers(meta, dem, receivers)
    }
}

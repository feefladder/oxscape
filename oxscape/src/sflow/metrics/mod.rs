mod d8;
use crate::GridMeta;
use crate::sflow::FlowMetric;
use anyhow::Result;
use d8::compute_receivers;

use num_traits::Float;

pub struct D8;

impl FlowMetric for D8 {
    fn metric<T: Float + From<f64> + Sync>(&self, meta: &GridMeta, dem: &[T], receivers: &mut [u8]) -> Result<()> {
        compute_receivers(meta, dem, receivers);
        Ok(())
    }
}

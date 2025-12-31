mod d8;
use crate::GridMeta;
use crate::sflow::FlowMetric;
use anyhow::Result;
use d8::compute_receivers;

pub struct D8;

impl FlowMetric for D8 {
    fn metric(&self, meta: &GridMeta, dem: &[f64], receivers: &mut [u8]) -> Result<()> {
        compute_receivers(meta, dem, receivers);
        Ok(())
    }
}

mod d8;
use d8::compute_receivers;
use anyhow::Result;
use crate::GridMeta;
use crate::sflow::FlowMetric;

pub struct D8;

unsafe impl FlowMetric for D8 {
    fn metric(&self, meta: &GridMeta, dem: &[f64], receivers: &mut [u8]) -> Result<()> {
        compute_receivers(meta, dem, receivers);
        Ok(())
    }
}

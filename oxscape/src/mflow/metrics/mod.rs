mod dinf;
use dinf::fm_dinf;

use anyhow::Result;
use crate::GridMeta;
use crate::mflow::FlowMetric;

pub struct Dinf;

unsafe impl FlowMetric for Dinf {
    fn metric(
            &self,
            meta: &GridMeta,
            dem: &[f64],
            flows: &mut [[f64; 8]],
            nrec: &mut [u8],
        ) -> Result<()> {
        Ok(fm_dinf(meta, dem, flows, nrec))
    }
}

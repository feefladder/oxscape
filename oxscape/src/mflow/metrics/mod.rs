mod dinf;
use dinf::fm_dinf;

use crate::GridMeta;
use crate::mflow::FlowMetric;
use anyhow::Result;

pub struct Dinf;

unsafe impl FlowMetric for Dinf {
    fn metric(
        &mut self,
        meta: &GridMeta,
        dem: &[f64],
        flows: &mut [[f64; 8]],
        nrec: &mut [u8],
    ) -> Result<()> {
        fm_dinf(meta, dem, flows, nrec);
        Ok(())
    }
}

mod dinf;
use dinf::fm_dinf;

use crate::GridMeta;
use crate::mflow::FlowMetric;
use anyhow::Result;

pub struct Dinf;

// SAFETY: fm_dinf makes flow only point downstream (no cycles) and skips the edges of the grid (no x-wrapping or y-out-of-bounds-ness)
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

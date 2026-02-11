use js_sys::Float32Array;
use oxscape_contour::mflow;
use oxscape_contour::mflow::metrics::Dinf;
use oxscape_contour::mflow::metrics::dinf;
use oxscape_contour::sflow;
use oxscape_contour::sflow::metrics::D8;
use oxscape_core::Flow;
use oxscape_core::GridMeta;
use oxscape_erode::Params;
use oxscape_erode::add_uplift;
use oxscape_erode::fill_deps::priority_flood_wei2018;
use oxscape_erode::{mflow as emflow, sflow as esflow};
use wasm_bindgen::convert::WasmAbi;
use wasm_bindgen::prelude::*;

use js_sys::{Float64Array, Uint32Array};
use ordered_float::OrderedFloat;
use rayon::prelude::*;

use rand::Rng;
use rand::SeedableRng;
use std::fmt::Debug;

pub use wasm_bindgen_rayon::init_thread_pool;

type TFlow = f32;

// #[cfg(not(target_pointer_width = "32"))]
// compile_error!("oxscape_wasm only supports 32-bit targets (wasm32).");

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct WasmParams {
    pub keq: f32,
    pub neq: f32,
    pub meq: f32,
    pub ueq: f32,
    pub dt: f32,
    pub tol: f32,
    pub cell_area: f32,
}

impl From<Params<f32>> for WasmParams {
    fn from(p: Params<f32>) -> Self {
        Self {
            keq: p.keq,
            neq: p.neq,
            meq: p.meq,
            ueq: p.ueq,
            dt: p.dt,
            tol: p.tol,
            cell_area: p.cell_area,
        }
    }
}

impl From<WasmParams> for Params<f32> {
    fn from(p: WasmParams) -> Self {
        Self {
            keq: p.keq,
            neq: p.neq,
            meq: p.meq,
            ueq: p.ueq,
            dt: p.dt,
            tol: p.tol,
            cell_area: p.cell_area,
        }
    }
}

#[wasm_bindgen]
pub struct Simulation {
    dem: Vec<f32>,
    prev_dem: Vec<f32>,
    acc: Vec<f32>,
    params: WasmParams,
    order: Orders,
}

#[derive(Debug)]
pub enum Metrics<S: sflow::FlowMetric<f32>, M: mflow::FlowMetric<f32>> {
    SFlow(S),
    MFlow(M),
}

#[derive(Debug)]
pub enum Orders {
    SFlow(sflow::Order),
    MFlow(mflow::Order<f32>),
}

impl Orders {
    pub fn meta(&self) -> &GridMeta {
        match self {
            Orders::SFlow(o) => o.meta(),
            Orders::MFlow(o) => o.meta(),
        }
    }

    fn stack(&self) -> &[usize] {
        match self {
            Orders::SFlow(o) => o.stack(),
            Orders::MFlow(o) => o.stack(),
        }
    }

    fn levels(&self) -> &[usize] {
        match self {
            Orders::SFlow(o) => o.levels(),
            Orders::MFlow(o) => o.levels(),
        }
    }

    // fn reorder_metric<S: sflow::FlowMetric + Debug, M: mflow::FlowMetric + Debug>(&mut self, dem: &[f32], metric: Metrics<S, M>) -> Result<(), JsValue> {
    //     match (self, metric) {
    //         (Orders::SFlow(o), Metrics::SFlow(m)) => o.reorder(dem, m).map_err(|e| e.to_string().into()),
    //         (Orders::MFlow(o), Metrics::MFlow(m)) => o.reorder(dem, m).map_err(|e| e.to_string().into()),
    //         (o,m) => Err(format!("order {o:?} does not match metric {m:?}").into())
    //     }
    // }

    fn reorder(&mut self, dem: &[f32]) -> Result<(), JsValue> {
        match self {
            Orders::MFlow(o) => o
                .reorder(dem, &mut dinf())
                .map_err(|e| e.to_string().into()),
            Orders::SFlow(o) => o.reorder(dem, &mut D8).map_err(|e| e.to_string().into()),
        }
    }
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize, seed: u32) -> Result<Self, JsValue> {
        let meta = GridMeta::new(width, height);
        let dem = vec![0.0; meta.size()];
        let prev_dem = vec![0.0; meta.size()];
        let acc = vec![TFlow::no_flow(); meta.size()];

        let order = Orders::MFlow(mflow::Order::empty(meta));
        let mut res = Self {
            dem,
            prev_dem,
            acc,
            params: Params::default().into(),
            order,
        };

        res.random_dem(seed)?;
        res.order.reorder(&res.dem)?;

        Ok(res)
    }

    #[wasm_bindgen]
    pub fn random_dem(&mut self, seed: u32) -> Result<(), JsValue> {
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed as u64);
        self.dem
            .chunks_exact_mut(self.order.meta().width())
            .take(self.order.meta().height() - 1)
            .skip(1)
            .for_each(|row| {
                for i in 1..row.len() - 1 {
                    row[i] = rng.random_range(0.0..1.0);
                }
            });
        priority_flood_wei2018(&mut self.dem, self.order.meta()).map_err(|e| e.to_string())?;
        Ok(())
    }

    #[wasm_bindgen(setter)]
    pub fn set_params(&mut self, params: WasmParams) {
        self.params = params
    }

    #[wasm_bindgen(getter)]
    pub fn params(&self) -> WasmParams {
        self.params
    }

    #[wasm_bindgen]
    pub fn switch(&mut self) {
        self.order = match &self.order {
            Orders::MFlow(o) => Orders::SFlow(sflow::Order::empty(o.meta().clone())),
            Orders::SFlow(o) => Orders::MFlow(mflow::Order::empty(o.meta().clone())),
        }
    }

    #[wasm_bindgen]
    pub fn step(&mut self) -> Result<f32, JsValue> {
        match &mut self.order {
            Orders::MFlow(o) => {
                o.reorder(&self.dem, &mut dinf())
                    .map_err(|e| e.to_string())?;
                emflow::accum(o, self.params.cell_area, &mut self.acc);
                add_uplift(o.meta(), &self.params.into(), &mut self.dem);
                emflow::erode(o, &self.params.into(), &self.acc, &mut self.dem);
            }
            Orders::SFlow(o) => {
                o.reorder(&self.dem, &mut D8).map_err(|e| e.to_string())?;
                esflow::accum(o, &self.params.into(), &mut self.acc);
                add_uplift(o.meta(), &self.params.into(), &mut self.dem);
                esflow::erode(o, &self.params.into(), &self.acc, &mut self.dem);
            }
        }
        let res = self
            .dem
            .par_iter()
            .zip(self.prev_dem.par_iter())
            .map(|(cur, prev)| OrderedFloat((cur - prev).abs()))
            .max()
            .map(|v| v.into())
            .ok_or("Should not step with empty array!".into());
        self.prev_dem.copy_from_slice(&self.dem);
        res
    }

    /// Get direct access to the dem
    ///
    /// # SAFETY
    ///
    /// This gives a direct, ?immutable? view to Javascript.
    /// Be sure to get rid of it before calling step
    #[wasm_bindgen]
    pub unsafe fn dem(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.dem) }
    }

    /// Get direct access to the accumulation
    ///
    /// # SAFETY
    ///
    /// This gives a direct, ?immutable? view to Javascript.
    /// Be sure to get rid of it before calling step
    #[wasm_bindgen]
    pub unsafe fn acc(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.acc) }
    }

    /// Get direct access to the levels array as u32
    ///
    ///
    /// # SAFETY
    ///
    /// This gives a direct, ?immutable? view to Javascript.
    /// Be sure to get rid of it before calling step
    ///
    /// # Panics
    ///
    /// on non-32 bit pointer targets
    #[wasm_bindgen]
    pub unsafe fn levels(&self) -> Uint32Array {
        let lvls = self.order.levels();
        assert_eq!(std::mem::size_of::<usize>(), std::mem::size_of::<u32>());
        unsafe {
            let u32_slice = std::slice::from_raw_parts(lvls.as_ptr() as *const u32, lvls.len());
            Uint32Array::view(u32_slice)
        }
    }

    /// Get direct access to the stack array as u32
    ///
    ///
    /// # SAFETY
    ///
    /// This gives a direct, ?immutable? view to Javascript.
    /// Be sure to get rid of it before calling step
    ///
    /// # Panics
    ///
    /// on non-32 bit pointer targets
    #[wasm_bindgen]
    pub unsafe fn stack(&self) -> Uint32Array {
        let stack = self.order.stack();
        assert_eq!(std::mem::size_of::<usize>(), std::mem::size_of::<u32>());
        unsafe {
            let u32_slice = std::slice::from_raw_parts(stack.as_ptr() as *const u32, stack.len());
            Uint32Array::view(u32_slice)
        }
    }

    #[wasm_bindgen]
    pub fn width(&self) -> u32 {
        self.order.meta().width().try_into().unwrap()
    }

    #[wasm_bindgen]
    pub fn height(&self) -> u32 {
        self.order.meta().height().try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use oxscape_contour::NOT_A_DONOR;
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::*;

    #[wasm_bindgen_test]
    fn test_dem_slice() {
        let sim = Simulation::new(2, 2, 42).unwrap();
        // safe Rust slice for internal testing
        let slice: &[f32] = &sim.dem;
        assert_eq!(slice.len(), 4);
    }

    #[test]
    fn test_dinf() {
        let sim = Simulation::new(3, 3, 42).unwrap();
        assert_eq!(
            sim.dem,
            [0.0, 0.0, 0.0, 0.0, 0.5265574090027738, 0.0, 0.0, 0.0, 0.0]
        );
        match sim.order {
            Orders::MFlow(o) => {
                assert_eq!(
                    o.flows(),
                    [
                        [0.0; 8],
                        [0.0; 8],
                        [0.0; 8],
                        [0.0; 8],
                        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                        [0.0; 8],
                        [0.0; 8],
                        [0.0; 8],
                        [0.0; 8]
                    ]
                );
                const N: usize = NOT_A_DONOR;
                assert_eq!(
                    o.donors(),
                    [
                        [N; 8],
                        [N; 8],
                        [N; 8],
                        [N, N, N, N, 4, N, N, N],
                        [N; 8],
                        [N; 8],
                        [N; 8],
                        [N; 8],
                        [N; 8]
                    ]
                )
            }
            _ => unreachable!(),
        }
    }
}

use oxscape::GridMeta;
use oxscape::sflow::Order;
use oxscape::sflow::metrics::D8;
use wasm_bindgen::prelude::*;
use oxscape_erode::Params;
use oxscape_erode::fill_deps::priority_flood_wei2018;
use oxscape_erode::sflow::{add_uplift, erode, accum};

use js_sys::{Float64Array,Uint32Array};

use rand::SeedableRng;
use rand::Rng;

pub use wasm_bindgen_rayon::init_thread_pool;

#[cfg(not(target_pointer_width = "32"))]
compile_error!("oxscape_wasm only supports 32-bit targets (wasm32).");

#[wasm_bindgen]
pub struct Simulation {
    dem: Vec<f64>,
    acc: Vec<f64>,
    params: Params,
    order: Order,
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize, seed: u32) -> Result<Self, JsValue> {
        let meta = GridMeta::new(width, height);
        let dem = vec![0.0f64; meta.size()];
        let acc = vec![0.0; meta.size()];

        let order = Order::empty(meta);
        let mut res = Self { dem, acc, params: Params::default(), order };

        res.random_dem(seed);

        Ok(res)
    }

    #[wasm_bindgen]
    pub fn random_dem(&mut self, seed: u32) -> Result<(), JsValue> {
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed as u64);
        self.dem.chunks_exact_mut(self.order.meta().width())
        .take(self.order.meta().height()-1)
        .skip(1)
        .for_each(|row| {
            for i in 1..row.len()-1 {
                row[i] = rng.random_range(0.0..1.0);
            }
        });
        priority_flood_wei2018(&mut self.dem, &self.order.meta()).map_err(|e| e.to_string())?;
        Ok(())
    }

    #[wasm_bindgen(setter)]
    pub fn set_params(&mut self, params: Params) {
        self.params = params
    }

    #[wasm_bindgen(getter)]
    pub fn params(&self) -> Params {
        self.params
    }

    #[wasm_bindgen]
    pub fn step(&mut self) -> Result<(), JsValue>{
        self.order.reorder(&self.dem, D8).map_err(|e| e.to_string())?;
        accum(&self.order, &self.params, &mut self.acc);
        add_uplift(&self.order.meta(), &self.params, &mut self.dem);
        erode(&self.order, &self.params, &self.acc, &mut self.dem);
        Ok(())
    }

    #[wasm_bindgen]
    pub unsafe fn dem(&self) -> Float64Array {
        unsafe { Float64Array::view(&self.dem) }
    }

    #[wasm_bindgen]
    pub unsafe fn acc(&self) -> Float64Array {
        unsafe {Float64Array::view(&self.acc)}
    }

    #[wasm_bindgen]
    pub unsafe fn levels(&self) -> Uint32Array {
        let lvls = self.order.levels();
        unsafe {
            let u32_slice = std::slice::from_raw_parts(lvls.as_ptr() as *const u32, lvls.len());
            Uint32Array::view(u32_slice)
        }
    }

    #[wasm_bindgen]
    pub unsafe fn stack(&self) -> Uint32Array {
        let stack = self.order.stack();
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
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::*;

    #[wasm_bindgen_test]
    fn test_dem_slice() {
        let sim = Simulation::new(2, 2, 42).unwrap();
        // safe Rust slice for internal testing
        let slice: &[f64] = &sim.dem;
        assert_eq!(slice.len(), 4);
    }
}


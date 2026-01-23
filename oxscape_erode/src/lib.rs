#![warn(clippy::pedantic)]
pub mod mflow;
pub mod sflow;
use rayon::prelude::*;

#[cfg(feature = "fill")]
pub mod fill_deps;

use oxscape::GridMeta;
#[cfg(feature = "wasm_js")]
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
#[cfg_attr(feature = "wasm_js", wasm_bindgen)]
pub struct Params {
    pub keq: f64,
    pub neq: f64,
    pub meq: f64,
    pub ueq: f64,
    pub dt: f64,
    pub tol: f64,
    pub cell_area: f64,
}

impl Default for Params {
    fn default() -> Self {
        Self {
            keq: 2e-6,
            neq: 2.0,
            meq: 0.8,
            ueq: 2e-3,
            dt: 1000.0,
            tol: 1e-3,
            cell_area: 1.0,
        }
    }
}

pub fn add_uplift(meta: &GridMeta, params: &Params, dem: &mut [f64]) {
    dem.par_chunks_exact_mut(meta.width())
        .take(meta.height() - 1)
        .skip(1)
        .for_each(|row| {
            for h in row.iter_mut().take(meta.width() - 1).skip(1) {
                *h += params.ueq * params.dt
            }
        });
}

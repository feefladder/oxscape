#![warn(clippy::pedantic)]
pub mod mflow;
pub mod sflow;
use std::{error::Error, fmt::Display, ops::AddAssign};

use num_traits::float::Float;
use rayon::prelude::*;

#[cfg(feature = "fill")]
pub mod fill_deps;

use oxscape_core::GridMeta;

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Params<T> {
    pub keq: T,
    pub neq: T,
    pub meq: T,
    pub ueq: T,
    pub dt: T,
    pub tol: T,
    pub cell_area: T,
}

impl<T: Float> Default for Params<T> {
    fn default() -> Self {
        Self {
            keq: T::from(2e-6).unwrap(),
            neq: T::from(2.0).unwrap(),
            meq: T::from(0.8).unwrap(),
            ueq: T::from(2e-3).unwrap(),
            dt: T::from(1000.0).unwrap(),
            tol: T::from(1e-3).unwrap(),
            cell_area: T::from(1.0).unwrap(),
        }
    }
}

pub fn add_uplift<T: Float + Send + AddAssign + Sync>(
    meta: &GridMeta,
    params: &Params<T>,
    dem: &mut [T],
) {
    dem.par_chunks_exact_mut(meta.width())
        .take(meta.height() - 1)
        .skip(1)
        .for_each(|row| {
            for h in row.iter_mut().take(meta.width() - 1).skip(1) {
                *h += params.ueq * params.dt;
            }
        });
}

#[derive(Debug, PartialEq, Eq)]
pub struct ErodeError(String);
impl Display for ErodeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl Error for ErodeError {}

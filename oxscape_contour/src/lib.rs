//! Rust port of Barnes (2019) that accepts a closure for entering your own functions.
//!
//! Adapted for single- and multiflow topologies. The single-flow topology,
//! which is a special case of multiflow is more efficient and therefore
//! separately kept.
//!
//! ```
//! use oxscape_contour::mflow::Contours;
//!
//!
//!
//! ```
//!
//!
//! ## References
//!
//! Barnes, R. (2019). Accelerating a fluvial incision and landscape evolution model with parallelism. Geomorphology, 330, 28–39. https://doi.org/10.1016/j.geomorph.2019.01.002
//!
use oxscape_core::error::ErrorStatus;
use std::{
    error::Error,
    fmt::{Debug, Display},
};
pub mod mflow;
pub mod sflow;

pub const NOT_A_DONOR: usize = usize::MAX;

/// (*mut T) cannot be shared between threads.
/// This struct allows us to shoot it between threads
/// Ensuring safe landing is our responsibility
struct Bazooka<T: Send + Sync>(*mut T);

/// here we say references can be shared between threads
/// This is under the very strict guarantee that we won't misuse it
///
/// SAFETY: We will only ever read from and write to disjoint indices within a parallel region
unsafe impl<T: Send + Sync> Sync for Bazooka<T> {}

#[derive(Debug, PartialEq, Eq)]
pub struct ContourError {
    status: ErrorStatus,
    kind: ContourErrorKind,
    message: String,
}

#[derive(Debug, PartialEq, Eq)]
#[non_exhaustive]
pub enum ContourErrorKind {
    MetricFailed,
    InvalidMetric,
    InvalidArraySize,
    Other,
}

impl ContourError {
    fn metric_failed(metric: &impl Debug) -> Self {
        Self {
            status: ErrorStatus::Permanent,
            kind: ContourErrorKind::MetricFailed,
            message: format!("failed to run metric {metric:?}"),
        }
    }

    /// The metric succeeded, but gave invalid results, so we cannot continue safely
    ///
    /// This can generally happen for two reasons:
    /// 1. The metric pointed flow outside the grid (sflow)
    /// 2. There were more receivers than noted in the nrec array (mflow)
    fn invalid_metric(msg: &str) -> Self {
        Self {
            status: ErrorStatus::Permanent,
            kind: ContourErrorKind::InvalidMetric,
            message: format!("metric was invalid: {msg}"),
        }
    }

    fn invalid_array(array_size: usize) -> Self {
        Self {
            status: ErrorStatus::Permanent,
            kind: ContourErrorKind::InvalidArraySize,
            message: format!("array of length {array_size} invalid for this `Contours`"),
        }
    }
}
impl Error for ContourError {}
impl Display for ContourError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}: {} ({:?}", self.kind, self.message, self.status)
    }
}

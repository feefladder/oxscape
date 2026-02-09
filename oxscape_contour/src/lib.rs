#![warn(
    clippy::pedantic,
    clippy::undocumented_unsafe_blocks,
    clippy::multiple_unsafe_ops_per_block,
    clippy::unnecessary_safety_doc,
    clippy::non_send_fields_in_send_ty
)]
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
pub enum ContourErrorKind {
    MetricFailed,
    InvalidArray,
    OutOfBoundsIndex,
}

impl ContourError {
    fn metric_failed(metric: &impl Debug) -> Self {
        Self {
            status: ErrorStatus::Permanent,
            kind: ContourErrorKind::MetricFailed,
            message: format!("failed to run metric {metric:?}"),
        }
    }

    fn invalid_array(array_size: usize) -> Self {
        Self {
            status: ErrorStatus::Permanent,
            kind: ContourErrorKind::InvalidArray,
            message: format!("array of length {array_size} invalid for this `Order`"),
        }
    }
}
impl Error for ContourError {}
impl Display for ContourError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}: {} ({:?}", self.kind, self.message, self.status)
    }
}

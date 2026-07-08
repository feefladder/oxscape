//! Single-receiver graphs
//!
//! These are more efficient, since a single [`u8`] can be used for receivers,
//! in stead of eight floats for partitioning among receivers.

mod flow_order;
pub use flow_order::{ContourAccessor, FlowMetric, FlowOrder};

#[cfg(feature = "metrics")]
pub mod metrics;

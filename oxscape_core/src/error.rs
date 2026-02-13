use std::error::Error;
use std::fmt::{Debug, Display};

#[derive(Debug, PartialEq, Eq)]
pub struct OxError {
    status: ErrorStatus,
    message: String,
}

impl Display for OxError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} ({:?})", self.message, self.status)
    }
}
impl Error for OxError {}

#[derive(Debug, PartialEq, Eq)]
pub enum ErrorStatus {
    /// This error is permanent and you cannot retry it
    Permanent,
    /// This is a temporary error, retry based on other error data
    Temporary,
    /// You retried, but the error repeated itself
    Persistent,
}

#[derive(Debug, PartialEq, Eq)]
pub enum GridErrorKind {
    // ... categorized by what the caller CAN DO
    InvalidDirection { dir: usize },
    SizeMismatch { found: usize, expected: usize },
    OutOfBounds { x: usize, y: usize, dir: u8 },
}

/// Errors related to grid indexing.
///
/// See [this blog
/// post](https://fast.github.io/blog/stop-forwarding-errors-start-designing-them/#putting-it-together)
/// for details and inspiration
#[derive(Debug, PartialEq)]
pub struct GridError {
    kind: GridErrorKind,
    status: ErrorStatus,
}

impl GridError {
    pub fn invalid_direction(dir: usize) -> Self {
        Self {
            kind: GridErrorKind::InvalidDirection { dir },
            status: ErrorStatus::Permanent,
        }
    }

    pub fn size_mismatch(found: usize, expected: usize) -> Self {
        Self {
            kind: GridErrorKind::SizeMismatch { found, expected },
            status: ErrorStatus::Permanent,
        }
    }

    pub fn out_of_bounds(x: usize, y: usize, dir: u8) -> Self {
        Self {
            kind: GridErrorKind::OutOfBounds { x, y, dir },
            status: ErrorStatus::Permanent,
        }
    }
}

impl std::fmt::Display for GridError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.kind {
            GridErrorKind::OutOfBounds { x, y, dir } => write!(
                f,
                "OutOfBounds: shift in direction {dir} at ({x},{y}) out-of-bounds"
            )?,
            GridErrorKind::SizeMismatch { found, expected } => write!(
                f,
                "SizeMismatch: Array size {found} does not match GridMeta {expected}, consider slicing your array"
            )?,
            GridErrorKind::InvalidDirection { dir } => write!(
                f,
                "InvalidDirection: Direction {dir:?} is not a valid direction. Directions should be in the range `0..8`"
            )?,
        }
        write!(f, " ({:?})", self.status)
    }
}

impl Error for GridError {}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_griderror_invalid_direction() {
        let err = GridError::invalid_direction(8);
        assert_eq!(
            err.to_string(),
            "InvalidDirection: Direction 8 is not a valid direction. Directions should be in the range `0..8` (Permanent)"
        );
        assert_eq!(err.status, ErrorStatus::Permanent);
        assert_eq!(err.kind, GridErrorKind::InvalidDirection { dir: 8 });
    }
}

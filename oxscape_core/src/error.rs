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
    InvalidDirection,
    SizeMismatch { found: usize, expected: usize },
}

/// The main error type for this crate. All errors should become this one. See [this blog
/// post](https://fast.github.io/blog/stop-forwarding-errors-start-designing-them/#putting-it-together) for details and
/// inspiration
#[derive(Debug)]
pub struct GridError {
    kind: GridErrorKind,
    status: ErrorStatus,
    message: String,
}

impl GridError {
    pub fn invalid_direction<T: Debug>(dir: T) -> Self {
        Self {
            kind: GridErrorKind::InvalidDirection,
            status: ErrorStatus::Permanent,
            message: format!(
                "Direction {dir:?} is not a valid direction. Directions should be in the range `0..8`"
            ),
        }
    }

    pub fn size_mismatch(found: usize, expected: usize) -> Self {
        Self {
            kind: GridErrorKind::SizeMismatch { found, expected },
            status: ErrorStatus::Permanent,
            message: format!(
                "Array size {found} does not match GridMeta {expected}, consider slicing your array"
            ),
        }
    }
}

impl std::fmt::Display for GridError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}: {} ({:?})", self.kind, self.message, self.status)
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
        assert_eq!(
            err.message,
            "Direction 8 is not a valid direction. Directions should be in the range `0..8`"
        );
        assert_eq!(err.status, ErrorStatus::Permanent);
        assert_eq!(err.kind, GridErrorKind::InvalidDirection);
    }
}

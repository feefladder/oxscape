use ordered_float::{FloatCore, OrderedFloat};
use oxscape::GridMeta;
use std::{
    cmp::Ordering,
};

pub mod consumer;
pub mod fill;
pub mod producer;
pub mod tile;
pub type TLabel = u32;

/// A struct that implements Ord in reverse order
#[derive(Debug, Clone)]
pub struct Cell<T> {
    pub x: usize,
    pub y: usize,
    pub z: T,
    /// Whether we are in the Region of Interest
    pub roi: bool,
}

impl<T: FloatCore> PartialEq for Cell<T> {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x
            && self.y == other.y
            && OrderedFloat::from(self.z) == OrderedFloat::from(other.z)
    }
}
impl<T: FloatCore> Eq for Cell<T> {}
/// reverse ordering for Cell based on z elevation.
/// BinaryHeap is a max-heap, so based on z-value, we should insert lowest z first
/// However, the roi should grow first on equality.
impl<T: FloatCore> PartialOrd for Cell<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}
impl<T: FloatCore> Ord for Cell<T> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // reverse ordering on z-value
        match OrderedFloat::from(other.z).cmp(&OrderedFloat::from(self.z)) {
            // but roi takes precedence
            Ordering::Equal => self.roi.cmp(&other.roi),
            other => other,
        }
    }
}

/// Gets a new label
fn get_new_label<T: FloatCore>(
    meta: &GridMeta,
    x: usize,
    y: usize,
    dem: &[T],
    labels: &[u32],
    current_label: &mut TLabel,
) -> TLabel {
    let n = meta.xy_to_i(x, y);
    // if we already have a label, that's the one
    if labels[n] != 0 {
        labels[n]
    } else {
        // otherwise, we can take a label from a neighbouring lower or equal cell, since we'll flow into that
        // ...except in the roi case, where we only want upslope cells
        for dir in 0..8 {
            let Some(nn) = meta.try_shift(x, y, dir) else {
                continue;
            };
            // that should work here, if we change it to strict
            if labels[nn] != 0 && dem[nn] < dem[n] {
                return labels[nn];
            }
        }
        *current_label += 1;
        *current_label
    }
}

#[cfg(test)]
#[rustfmt::skip]
mod test {
    use super::*;

    #[test]
    fn test_cell() {
        let a = Cell{x:0,y:0,z:0.0,roi:true};
        let b = Cell{x:0,y:0,z:1.0,roi:true};
        assert_eq!(a,a);
        assert_ne!(a,b);
        assert!(a>b);
        let a = Cell{x:0,y:1,z:0.0,roi:true};
        let b = Cell{x:1,y:0,z:1.0,roi:true};
        assert_ne!(a,b);
        assert!(a>b);
    }

    #[test]
    fn sanity_check() {
        let f = 42.0f64;
        let o = OrderedFloat::from(f);
        println!("{o:?}");
    }
}

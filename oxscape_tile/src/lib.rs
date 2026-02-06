use ordered_float::FloatCore;
use oxscape::GridMeta;

pub mod array_2d;
pub mod consumer;
pub mod fill_deps;
pub mod producer;
pub mod tile;
pub type TLabel = u32;

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

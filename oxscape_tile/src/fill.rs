use std::collections::{BinaryHeap, HashMap, VecDeque};

use ordered_float::FloatCore;
use oxscape::GridMeta;

use crate::{Cell, TLabel};

/// flag bit for the region of interest.
///
/// This is the highest bit and should divide `TLabel` in half
///
/// As such, most operations on a u32 should work,
/// unless there are more than 2147483647 different labels
pub const ROI_FLAG: TLabel = 1 << (std::mem::size_of::<TLabel>() * 8 - 1);

pub type Graph<T> = Vec<HashMap<TLabel, T>>;

/// Provides the `next_up()` function on floats
/// 
/// Float trait doesn't provide the next_up() function needed for epsilon depression filling, so
/// there's this trait..
pub trait NextUp {
    fn next_up(&self) -> Self;
}

impl NextUp for f32 {
    fn next_up(&self) -> Self {
        f32::next_up(*self)
    }
}

impl NextUp for f64 {
    fn next_up(&self) -> Self {
        f64::next_up(*self)
    }
}

#[derive(Debug, Clone)]
pub struct ZhouFillState<T: FloatCore> {
    /// The priority queue that holds boundary cells
    priority_queue: BinaryHeap<Cell<T>>,
    /// The slope queue that holds slope cells
    slope_queue: VecDeque<usize>,
    /// depression cells
    depression_queue: VecDeque<usize>,
    current_label: TLabel,
}

impl<T: FloatCore + NextUp> ZhouFillState<T> {
    pub fn new(start_label: TLabel) -> Self {
        Self {
            priority_queue: BinaryHeap::new(),
            slope_queue: VecDeque::new(),
            depression_queue: VecDeque::new(),
            current_label: start_label,
        }
    }

    pub fn priority_queue(&self) -> &BinaryHeap<Cell<T>> {
        &self.priority_queue
    }
    pub fn slope_queue(&self) -> &VecDeque<usize> {
        &self.slope_queue
    }
    pub fn depression_queue(&self) -> &VecDeque<usize> {
        &self.depression_queue
    }
    pub fn current_label(&self) -> &TLabel {
        &self.current_label
    }
    pub fn seed_slope(&mut self, labels: &mut [TLabel], idxs: &[usize]) {
        for idx in idxs {
            self.slope_queue.push_back(*idx);
            labels[*idx] = self.current_label | ROI_FLAG;
        }
        self.current_label += 1;
    }

    /// add all edge cells to the priority queue
    pub fn add_edge(&mut self, meta: &GridMeta, dem: &[T]) {
        // add the edges
        for x in 0..meta.width() {
            self.priority_queue.push(Cell {
                x,
                y: 0,
                z: dem[meta.xy_to_i(x, 0)],
                roi: false,
            });
            self.priority_queue.push(Cell {
                x,
                y: meta.height() - 1,
                z: dem[meta.xy_to_i(x, meta.height() - 1)],
                roi: false,
            });
        }
        // skip the corners
        for y in 1..meta.height() - 1 {
            self.priority_queue.push(Cell {
                x: 0,
                y,
                z: dem[meta.xy_to_i(0, y)],
                roi: false,
            });
            self.priority_queue.push(Cell {
                x: meta.width() - 1,
                y,
                z: dem[meta.xy_to_i(meta.width() - 1, y)],
                roi: false,
            });
        }
    }

    /// perform a single step, returns false when done
    ///
    /// This increments the slope, depression or priority queue
    pub fn step(&mut self, meta: &GridMeta, dem: &mut [T], labels: &mut [TLabel]) -> bool {
        // first priority is depression filling: it can add to the slope queue
        if let Some(di) = self.depression_queue.pop_front() {
            // Fill depression
            let (dep_x, dep_y) = meta.i_to_xy(di);
            for dep_dir in 0..8 {
                let Some(ndi) = meta.try_shift(dep_x, dep_y, dep_dir) else {
                    continue;
                };
                if labels[ndi] != 0 {
                    continue;
                }

                labels[ndi] = labels[di];

                if dem[ndi] > dem[di] {
                    self.slope_queue.push_back(ndi); // slope cell
                } else {
                    // depression cell
                    dem[ndi] = dem[di].next_up(); // fill
                    self.depression_queue.push_back(ndi); // add
                }
            }
            true
        } else if let Some(si) = self.slope_queue.pop_front() {
            // The depression has also added slope cells, process those
            let (slope_x, slope_y) = meta.i_to_xy(si);
            // flag so we only add the cell to the priority queue once
            let mut b_in_pq = false;
            for slope_dir in 0..8 {
                // neighbour slope index
                let Some(nsi) = meta.try_shift(slope_x, slope_y, slope_dir) else {
                    continue;
                };
                // check if already processed
                if labels[nsi] != 0 {
                    continue;
                }
                // the neighbour is a slope cell
                if dem[nsi] > dem[si] {
                    self.slope_queue.push_back(nsi);
                    labels[nsi] = labels[si];
                }
                // at this point, we're not in the priority queue, so from the neighbours we'll have
                // to figure out if we're an edge cell and add ourselves to the priority queue in that case
                if !b_in_pq {
                    let mut is_boundary = true;
                    let (nsx, nsy) = meta.i_to_xy(nsi);
                    for slope_n_dir in 0..8 {
                        let Some(nnsi) = meta.try_shift(nsx, nsy, slope_n_dir) else {
                            continue;
                        };
                        if labels[nnsi] != 0 && dem[nnsi] < dem[nsi] {
                            is_boundary = false;
                            break;
                        }
                    }
                    if is_boundary {
                        self.priority_queue.push(Cell {
                            x: slope_x,
                            y: slope_y,
                            z: dem[si],
                            roi: false,
                        });
                        b_in_pq = true;
                    }
                }
            }
            true
        } else if let Some(c) = self.priority_queue.pop() {
            let n = meta.xy_to_i(c.x, c.y);
            // assign a label if we don't already have one
            if labels[n] == 0 {
                let mut neighbour = false;
                // otherwise, we can take a label from a neighbouring lower cell
                for dir in 0..8 {
                    let Some(nn) = meta.try_shift(c.x, c.y, dir) else {
                        continue;
                    };
                    if labels[nn] != 0 && dem[nn] < dem[n] {
                        labels[n] = labels[nn];
                        neighbour = true;
                    }
                }
                if !neighbour {
                    self.current_label += 1;
                    labels[n] = self.current_label
                }
            }
            //get_new_label(meta, c.x, c.y, &dem, &labels, &mut 10);
            for dir in 0..8 {
                let Some(ni) = meta.try_shift(c.x, c.y, dir) else {
                    continue;
                };
                if labels[ni] != 0 {
                    continue;
                }
                labels[ni] = labels[n];
                if dem[ni] < dem[n] {
                    // depression cell
                    dem[ni] = dem[n].next_up();
                    self.depression_queue.push_back(ni);
                } else {
                    self.slope_queue.push_back(ni);
                }
            }
            true
        } else {
            false
        }
    }
}

/// Fill a dem using the Zhou filling algorithm
pub fn fill_zhou2016<T: FloatCore + NextUp>(meta: &GridMeta, dem: &mut [T], labels: &mut [TLabel]) {
    let mut state = ZhouFillState::new(2);
    state.add_edge(meta, dem);
    while state.step(meta, dem, labels) {}
}

#[cfg(test)]
mod test {
    use oxscape::GridMeta;

    use crate::{
        TLabel,
        fill::{ROI_FLAG, fill_zhou2016},
    };

    #[test]
    #[rustfmt::skip]
    fn test_zhou() {
        let mut dem = [
            15,15,14,15,12,6,12,
            14,13,10,12,15,17,15,
            15,15, 9,11, 8,15,15,
            16,17, 8,16,15, 7, 5,
            19,18,19,18,17,15,14,
        ].map(|v| v as f64);
        let mut labels = vec![0;dem.len()];
        let expected = [
            15.0,15.0,14.0,15.0,12.0, 6.0,12.0,
            14.0,13.0,11.0f64.next_up(),12.0,15.0,17.0,15.0,
            15.0,15.0,11.0f64.next_up(),11.0, 8.0,15.0,15.0,
            16.0,17.0,11.0f64.next_up(),16.0,15.0, 7.0, 5.0,
            19.0,18.0,19.0,18.0,17.0,15.0,14.0,
        ];
        fill_zhou2016(&GridMeta::new(7, 5), &mut dem, &mut labels);
        assert_eq!(dem, expected);
    }

    #[test]
    fn test_flag() {
        assert_eq!(ROI_FLAG, TLabel::MAX / 2 + 1);
        let ten = 10;
        let ten_flag = ten | ROI_FLAG;
        assert_eq!(ten, ten_flag & !ROI_FLAG);
    }
}

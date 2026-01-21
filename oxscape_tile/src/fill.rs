use std::collections::{BinaryHeap, VecDeque};

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

// impl NextUp for f16 {
//     fn next_up(&self) -> Self {
//         f16::next_up(*self)
//     }
// }

pub struct ZhouFillState<'a, T: FloatCore> {
    pub priority_queue: BinaryHeap<Cell<T>>,
    pub slope_queue: VecDeque<usize>,
    pub depression_queue: VecDeque<usize>,
    pub labels: &'a mut [TLabel],
    pub dem: &'a mut [T],
    pub meta: &'a GridMeta,
}

impl<T: FloatCore + NextUp> ZhouFillState<'_, T> {
    pub fn add_edge(&mut self) {
        // add the edges
        for x in 0..self.meta.width() {
            self.priority_queue.push(Cell {
                x,
                y: 0,
                z: self.dem[self.meta.xy_to_i(x, 0)],
                roi: false,
            });
            self.priority_queue.push(Cell {
                x,
                y: self.meta.height() - 1,
                z: self.dem[self.meta.xy_to_i(x, self.meta.height() - 1)],
                roi: false,
            });
        }
        // skip the corners
        for y in 1..self.meta.height() - 1 {
            self.priority_queue.push(Cell {
                x: 0,
                y,
                z: self.dem[self.meta.xy_to_i(0, y)],
                roi: false,
            });
            self.priority_queue.push(Cell {
                x: self.meta.width() - 1,
                y,
                z: self.dem[self.meta.xy_to_i(self.meta.width() - 1, y)],
                roi: false,
            });
        }
    }

    pub fn step(&mut self) -> bool {
        // first priority is depression filling: it can add to the slope queue
        if let Some(di) = self.depression_queue.pop_front() {
            // Fill depression
            let (dep_x, dep_y) = self.meta.i_to_xy(di);
            for dep_dir in 0..8 {
                let Some(ndi) = self.meta.try_shift(dep_x, dep_y, dep_dir) else {
                    continue;
                };
                if self.labels[ndi] != 0 {
                    continue;
                }

                self.labels[ndi] = self.labels[di];

                if self.dem[ndi] > self.dem[di] {
                    self.slope_queue.push_back(ndi); // slope cell
                } else {
                    // depression cell
                    self.dem[ndi] = self.dem[di].next_up(); // fill
                    self.depression_queue.push_back(ndi); // add
                }
            }
            true
        } else if let Some(si) = self.slope_queue.pop_front() {
            // The depression has also added slope cells, process those
            let (slope_x, slope_y) = self.meta.i_to_xy(si);
            // flag so we only add the cell to the priority queue once
            //
            // at this point, we're not in the priority queue, so from the neighbours we'll have
            // to figure out if we're an edge cell
            let mut b_in_pq = false;
            for slope_dir in 0..8 {
                let Some(nsi) = self.meta.try_shift(slope_x, slope_y, slope_dir) else {
                    continue;
                };
                // check if already processed
                if self.labels[nsi] != 0 {
                    continue;
                }
                // the neighbour is a slope cell
                if self.dem[nsi] > self.dem[si] {
                    self.slope_queue.push_back(nsi);
                    self.labels[nsi] = self.labels[si]
                }
                if !b_in_pq {
                    let mut is_boundary = true;
                    let (nsx, nsy) = self.meta.i_to_xy(nsi);
                    for slope_n_dir in 0..8 {
                        let Some(nnsi) = self.meta.try_shift(nsx, nsy, slope_n_dir) else {
                            continue;
                        };
                        if self.labels[nnsi] != 0 && self.dem[nnsi] < self.dem[nsi] {
                            is_boundary = false;
                            break;
                        }
                    }
                    if is_boundary {
                        self.priority_queue.push(Cell {
                            x: slope_x,
                            y: slope_y,
                            z: self.dem[si],
                            roi: false,
                        });
                        b_in_pq = true;
                    }
                }
            }
            true
        } else if let Some(c) = self.priority_queue.pop() {
            let n = self.meta.xy_to_i(c.x, c.y);
            // assign a label if we don't already have one
            if self.labels[n] == 0 {
                self.labels[n] = 10;
            }
            //get_new_label(self.meta, c.x, c.y, &self.dem, &self.labels, &mut 10);
            for dir in 0..8 {
                let Some(ni) = self.meta.try_shift(c.x, c.y, dir) else {
                    continue;
                };
                if self.labels[ni] != 0 {
                    continue;
                }
                self.labels[ni] = self.labels[n];
                if self.dem[ni] <= self.dem[n] {
                    // depression cell
                    self.dem[ni] = self.dem[n].next_up();
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

pub fn fill_zhou2016<T: FloatCore + NextUp>(meta: &GridMeta, dem: &mut [T]) {
    let slope_queue = VecDeque::new();
    let depression_queue = VecDeque::new();
    let mut labels = vec![0; dem.len()];
    let mut priority_queue = BinaryHeap::new();
    // add the edges
    for x in 0..meta.width() {
        priority_queue.push(Cell {
            x,
            y: 0,
            z: dem[meta.xy_to_i(x, 0)],
            roi: false,
        });
        priority_queue.push(Cell {
            x,
            y: meta.height() - 1,
            z: dem[meta.xy_to_i(x, meta.height() - 1)],
            roi: false,
        });
    }
    // skip the corners
    for y in 1..meta.height() - 1 {
        priority_queue.push(Cell {
            x: 0,
            y,
            z: dem[meta.xy_to_i(0, y)],
            roi: false,
        });
        priority_queue.push(Cell {
            x: meta.width() - 1,
            y,
            z: dem[meta.xy_to_i(meta.width() - 1, y)],
            roi: false,
        });
    }
    let mut state = ZhouFillState {
        priority_queue,
        slope_queue,
        depression_queue,
        labels: &mut labels,
        dem,
        meta,
    };
    while state.step() {}
    // while let Some(c) = priority_queue.pop() {
    //     println!("Processing pq ({:?},{:?})", c.x, c.y);
    //     let n = meta.xy_to_i(c.x, c.y);
    //     labels[n] = 10;
    //     for dir in 0..8 {
    //         let Some(ni) = meta.try_shift(c.x, c.y, dir) else {continue;};
    //         if labels[ni] != 0 {continue;}
    //         labels[ni] = labels[n];
    //         if dem[ni]<=c.z { // depression cell
    //             println!("Depression at {ni}");
    //             depression_queue.push_back(ni);
    //             // Fill depression
    //             while let Some(di) = depression_queue.pop_front() {
    //                 let (dep_x,dep_y) = meta.i_to_xy(di);
    //                 for dep_dir in 0..8 {
    //                     let Some(ndi) = meta.try_shift(dep_x, dep_y, dep_dir) else {continue;};
    //                     if labels[ndi] != 0 {continue;}

    //                     if dem[ndi] > dem[di] {
    //                         trace_queue.push_back(ndi); // slope cell
    //                     } else { // depression cell
    //                         dem[ndi] = dem[ni]; // fill
    //                         depression_queue.push_back(ndi); // add
    //                     }
    //                 }
    //             }
    //         } else { // slope cell
    //             trace_queue.push_back(ni);
    //         }
    //         // The depression has also added slope cells, process those
    //         while let Some(si) = trace_queue.pop_front() {
    //             let (slope_x,slope_y) = meta.i_to_xy(si);
    //             println!("processing slope ({slope_x},{slope_y})");
    //             // flag so we only add the cell to the priority queue once
    //             //
    //             // at this point, we're not in the priority queue, so from the neighbours we'll have
    //             // to figure out if we're an edge cell
    //             let mut b_in_pq = false;
    //             for slope_dir in 0..8 {
    //                 let Some(nsi) = meta.try_shift(slope_x, slope_y, slope_dir) else {continue;};
    //                 // check if already processed
    //                 if labels[nsi] != 0 {continue;}
    //                 // the neighbour is a slope cell
    //                 if dem[nsi]<dem[si] {
    //                     trace_queue.push_back(nsi);
    //                     labels[nsi] = labels[si]
    //                 }
    //                 if !b_in_pq {
    //                     let mut is_boundary = true;
    //                     let (nsx,nsy) = meta.i_to_xy(nsi);
    //                     for slope_n_dir in 0..8 {
    //                         let Some(nnsi) = meta.try_shift(nsx, nsy, slope_n_dir) else {continue;};
    //                         if labels[nnsi]!=0 && dem[nnsi]<dem[nsi]{
    //                             is_boundary = false;
    //                             break;
    //                         }
    //                     }
    //                     if is_boundary {
    //                         priority_queue.push(Cell { x: nsx, y: nsy, z: dem[nsi], roi: false });
    //                         b_in_pq = true;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
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
        let expected = [
            15,15,14,15,12,6,12,
            14,13,11,12,15,17,15,
            15,15,11,11, 8,15,15,
            16,17,11,16,15, 7, 5,
            19,18,19,18,17,15,14,
        ].map(|v| v as f64);
        fill_zhou2016(&GridMeta::new(7, 5), &mut dem);
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

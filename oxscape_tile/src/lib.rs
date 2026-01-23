use ordered_float::{FloatCore, OrderedFloat};
use oxscape::{GridMeta, XSHIFT, YSHIFT};
use std::{
    cmp::Ordering,
    collections::{BinaryHeap, VecDeque},
};

pub mod fill;
pub mod consumer;
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
        // otherwise, we can take a label from a neighbouring lower cell
        for dir in 0..8 {
            let Some(nn) = meta.try_shift(x, y, dir) else {
                continue;
            };
            if labels[nn] != 0 && dem[nn] <= dem[n] {
                return labels[nn];
            }
        }
        *current_label += 1;
        *current_label
    }
}

/// Mainly for debugging and TUI visualization
pub struct TileFillState<'a, T: FloatCore> {
    pub meta: &'a GridMeta,
    pub labels: &'a mut [TLabel],
    pub current_label: TLabel,
    pub dem: &'a mut [T],
    pub open: BinaryHeap<Cell<T>>,
    pub pit: VecDeque<Cell<T>>,
    pub roi: VecDeque<Cell<T>>,
}

impl<T: FloatCore> TileFillState<'_, T> {
    pub fn dem(&mut self) -> &mut [T] {
        self.dem
    }

    pub fn step(&mut self) -> bool {
        // the region of interest has prioirity, basically this is a simple BFS,
        // except that the fallback is depression-filling priority queue in
        // stead of stopping the search
        //
        // Without this modification, only D8-flowing cells would be added. E.g.
        // if the roi is the lowest neighbour of a cell. However, I think we
        // want to get all cells that would also flow into the roi in a
        // multiflow metric.
        //
        // The idea is that in the case of a depression, we need to be the
        // lowest neighbour that enters the depression, so in case of e.g. a
        // lake, it should spill to the roi and not to the edge.
        //
        // This seems very similar to the trace queue in the Zhou implementations
        //
        // Lemme think. It feels like in case there is a lower neighbour, we
        // shouldn't be adding them to the priority queue, but rather add the
        // current cell to the PQ.
        if let Some(r) = self.roi.pop_front() {
            // we need some way to skip already processed cells
            // if self.labels[self.meta.xy_to_i(r.x, r.y)] != 0 {
            //     return true
            // }
            // check all neighbours
            for dir in 0..8 {
                let Some(n) = self.meta.try_shift(r.x, r.y, dir) else {
                    continue;
                };
                let n_label = self.labels[n];
                if n_label != 0 {
                    // when two catchments collide...
                } else {
                    // add
                    if self.dem[n] >= r.z {
                        self.labels[n] = self.labels[self.meta.xy_to_i(r.x, r.y)];
                        let (nx, ny) = self.meta.i_to_xy(n);
                        self.roi.push_front(Cell {
                            x: nx,
                            y: ny,
                            z: self.dem[n],
                            roi: true,
                        });
                    } else {
                        // this is a potential depression, add self to the priority queue
                        self.open.push(r.clone());
                    }
                }
            }
            true
        } else if let Some(c) = if !self.pit.is_empty() {
            self.pit.pop_front()
        } else {
            self.open.pop()
        } {
            let my_label = get_new_label(
                self.meta,
                c.x,
                c.y,
                self.dem,
                self.labels,
                &mut self.current_label,
            );
            self.labels[self.meta.xy_to_i(c.x, c.y)] = my_label;

            // check all neighbours
            for i in 0..8 {
                let nx = isize::try_from(c.x).unwrap() + XSHIFT[i];
                let ny = isize::try_from(c.y).unwrap() + YSHIFT[i];
                if !self.meta.in_grid(nx, ny) {
                    continue;
                }
                // neighbour's flat index
                let n = self.meta.xy_to_i(nx as usize, ny as usize);
                let n_label = self.labels[n];
                //Does the neighbour have a label? If so, it is part of the edge, has
                //already been assigned a label by a parent cell which must be of lower or
                //equal elevation to the current cell, or has already been processed, in
                //which case its elevation is lower or equal to this cell.
                if n_label != 0 {
                    //If the neighbour's label were the same as the current cell's, then the
                    //current cell's flow and the neighbour's flow eventually comingle. If
                    //the neighbour's label is different it has been added by a cell whose
                    //flow drains the opposite side of a watershed from this cell. Here, we
                    //make a note of the height of that watershed.
                    if n_label != my_label {
                        // TODO: is this always the neighbour?
                        let elev_over = self.dem[n].max(self.dem[self.meta.xy_to_i(c.x, c.y)]);

                        // TODO: I thought of initially not including the graph, since we're only doing single tiles

                        //If count()==0, then we haven't seen this watershed before.
                        //Otherwise, only make a note of the spill-over elevation if it is
                        //lower than what we've seen before.
                        // if(my_graph[my_label].count(n_label)==0 || elev_over<my_graph[my_label][n_label]){
                        //     my_graph[my_label][n_label] = elev_over;
                        //     my_graph[n_label][my_label] = elev_over;
                        // }
                    }
                } else {
                    //The neighbour is not one we've seen before, so mark it as being part of
                    //our watershed and add it as an unprocessed item to the queue.
                    // This is the same as my_label above
                    self.labels[n] = self.labels[self.meta.xy_to_i(c.x, c.y)];

                    //If the neighbour is lower than this cell, elevate it to the level of
                    //this cell so that a depression is not formed. The flow directions will
                    //be fixed later, after all the depressions have been filled.
                    if self.dem[n] <= c.z {
                        self.dem[n] = c.z;
                        self.pit.push_front(Cell {
                            x: nx as usize,
                            y: ny as usize,
                            z: c.z,
                            roi: c.roi,
                        });
                    } else {
                        self.open.push(Cell {
                            x: nx as usize,
                            y: ny as usize,
                            z: self.dem[n],
                            roi: c.roi,
                        });
                    }
                }
            }
            true
        } else {
            false
        }
    }
}

/// Fill depressions of a single tile
/// See Barnes, R. (2016). Parallel Priority-Flood depression filling for trillion cell digital elevation models on desktops or clusters. Computers & Geosciences, 96, 56–68. https://doi.org/10.1016/j.cageo.2016.07.001
/// Algorithm 1, without the edge things
pub fn fill_deps<T: FloatCore>(meta: &GridMeta, dem: &mut [T], labels: &mut [TLabel]) {
    let mut s = TileFillState {
        meta,
        labels,
        current_label: 2,
        dem,
        open: BinaryHeap::new(),
        pit: VecDeque::new(),
        roi: VecDeque::new(),
    };
    let y_max = s.meta.height() - 1;
    let x_max = s.meta.width() - 1;
    for x in 0..s.meta.width() {
        s.open.push(Cell {
            x,
            y: 0,
            z: s.dem[s.meta.xy_to_i(x, 0)],
            roi: false,
        });
        s.open.push(Cell {
            x,
            y: y_max,
            z: s.dem[s.meta.xy_to_i(x, y_max)],
            roi: false,
        });
    }
    for y in 1..meta.height() - 1 {
        s.open.push(Cell {
            x: 0,
            y,
            z: s.dem[s.meta.xy_to_i(0, y)],
            roi: false,
        });
        s.open.push(Cell {
            x: x_max,
            y,
            z: s.dem[s.meta.xy_to_i(x_max, y)],
            roi: false,
        });
    }

    while s.step() {}
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

    #[test]
    fn tiled_dem() {
        // the sample tiled dem from Barnes
        let tiled = [
            [
                9,9,7,6,7,6,4,
                6,7,6,5,5,4,4,
                3,5,5,4,3,3,3,
                1,3,4,4,3,2,2,
                5,4,4,4,4,4,4,
                6,4,3,3,4,5,6,
                7,4,3,2,4,5,7,
            ],[
                3,2,3,4,2,1,2,
                4,4,4,5,3,3,5,
                4,4,4,5,4,5,6,
                3,4,4,5,6,6,6,
                5,6,6,7,4,4,6,
                7,8,8,6,3,4,6,
                9,9,8,5,3,4,6,
            ],[
                3,4,4,5,5,6,7,
                6,6,5,3,4,6,8,
                6,6,5,3,4,5,6,
                6,5,4,4,4,4,3,
                6,5,4,3,3,4,4,
                7,6,4,2,3,4,4,
                8,7,4,2,3,4,4,
            ],
            [
                8,6,5,5,7,6,6,
                6,7,8,7,8,7,6,
                5,7,8,8,7,7,6,
                6,6,6,6,6,5,5,
                4,4,4,4,6,7,8,
                4,4,4,5,6,7,7,
                7,5,5,7,7,5,4,
            ],[
                8,7,5,5,4,4,6,
                5,4,3,4,3,4,7,
                4,3,3,4,2,4,7,
                5,4,4,5,3,4,7,
                7,6,5,5,4,5,7,
                8,7,5,5,4,5,7,
                7,7,6,6,5,5,6,
            ],[
                8,8,6,3,3,4,6,
                7,7,6,3,4,5,6,
                7,7,6,3,5,6,7,
                6,6,6,6,5,6,8,
                6,7,8,7,7,6,6,
                6,7,7,7,6,5,4,
                6,5,5,5,4,4,3,
            ],
            [
                8,8,8,7,5,3,3,
                8,8,7,7,5,4,4,
                8,7,6,6,6,5,5,
                9,7,5,4,6,7,7,
                8,6,5,4,6,7,7,
                4,4,4,5,5,6,6,
                0,2,3,5,5,6,6,
            ],[
                7,8,8,8,7,5,4,
                7,8,8,8,7,5,4,
                7,7,7,7,6,6,6,
                6,5,4,4,5,6,6,
                6,5,5,6,4,5,6,
                6,6,5,6,4,4,6,
                4,6,6,3,3,4,5,
            ],[
                4,4,3,2,1,2,4,
                5,4,2,1,2,3,4,
                5,4,3,2,3,5,5,
                6,5,5,3,5,7,8,
                6,5,5,6,6,6,6,
                5,5,5,8,7,5,3,
                3,3,5,9,7,4,1,
            ]
            ];
            let filled = [
                tiled[0],tiled[1],[
                    3,4,4,5,5,6,7,
                    6,6,5,4,4,6,8,
                    6,6,5,4,4,5,6,
                    6,5,4,4,4,4,3,
                    6,5,4,3,3,4,4,
                    7,6,4,2,3,4,4,
                    8,7,4,2,3,4,4,
                ],
                tiled[3],[
                //  0 1 2 3 4 5 6
                    8,7,5,5,4,4,6,
                    5,4,4,4,4,4,7,
                    4,4,4,4,4,4,7,
                    5,4,4,5,4,4,7,
                    7,6,5,5,4,5,7,
                    8,7,5,5,4,5,7,
                    7,7,6,6,5,5,6,
                ],tiled[5],
                tiled[6],tiled[7],tiled[8],
            ];
            let sheds = [
                [// 0 1 2 3 4 5 6
                    3,3,5,5,5,5,5,
                    3,3,5,5,5,5,5,
                    3,3,3,5,5,5,5,
                    3,3,3,5,5,5,5,
                    3,3,4,4,5,5,5,
                    4,4,4,4,4,4,5,
                    4,4,4,4,4,4,4
                ],[
                    4,4,4,3,3,3,3,
                    4,4,4,3,3,3,3,
                    6,6,4,3,3,3,3,
                    6,6,4,4,3,3,5,
                    6,6,4,5,5,5,5,
                    6,6,5,5,5,5,5,
                    6,6,5,5,5,5,5,
                ],[
                    4,4,4,4,4,4,4,
                    4,4,4,4,4,4,5,
                    3,3,4,4,4,5,5,
                    3,3,3,3,3,3,5,
                    3,3,3,3,3,3,5,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                ],
                [
                    7,5,5,5,5,8,8,
                    7,5,5,5,5,8,8,
                    7,7,4,4,6,6,6,
                    4,4,4,4,4,6,6,
                    4,4,4,4,4,6,6,
                    4,4,4,4,4,3,3,
                    4,4,4,4,4,3,3,
                ],[
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                ],[
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,4,
                    3,3,3,3,3,4,4,
                    4,4,4,4,4,4,4,
                    4,4,4,4,4,4,4,
                ],
                [
                    3,3,4,4,4,4,4,
                    3,3,3,4,4,4,4,
                    3,3,3,3,3,4,4,
                    3,3,3,3,3,4,4,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                ],[
                    3,3,3,4,4,4,4,
                    3,3,3,3,4,4,4,
                    3,3,3,3,3,4,4,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    5,5,3,3,3,3,3,
                    5,5,3,3,3,3,3,
                ],[
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,3,3,
                    3,3,3,3,3,4,4,
                    5,5,5,5,4,4,4,
                    5,5,5,5,4,4,4,
                ]
            ];
            let meta = GridMeta::new(7, 7);
            let mut labels = [0;49];
            for (idx,tile) in tiled.iter().enumerate() {
                let mut dem = tile.map(|v| v as f32);
                fill_deps(&meta, &mut dem, &mut labels);
                println!("{idx}: labels:\n{labels:?}\ndem:{dem:?}");
                assert_eq!(dem,filled[idx].map(|v| v as f32));
                assert_eq!(labels, sheds[idx]);
            }
    }
}

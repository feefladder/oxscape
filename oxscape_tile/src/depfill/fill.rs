use std::collections::{BinaryHeap, HashMap, VecDeque};
use std::fmt::Debug;
use std::mem::size_of;

use num_traits::float::{Float, TotalOrder};
use oxscape_core::{GridMeta, NextUp};

use crate::TLabel;
use crate::depfill::Cell;
use crate::depfill::graph::SpillGraph;
use crate::tile::{TileCoord, TileInfo};

/// flag bit for the region of interest.
///
/// This is the highest bit and should divide `TLabel` in half
///
/// As such, most operations on a u32 should work,
/// unless there are more than 2147483647 different labels
pub const ROI_FLAG: TLabel = 1 << (size_of::<TLabel>() * 8 - 1);
/// The label value for a cell that is not processed yet
pub const NOT_FILLED: TLabel = ROI_FLAG - 1;

/// All data that is needed to solve the global problem
#[derive(Debug, PartialEq)]
pub struct FillData<T> {
    pub(crate) tile_info: TileInfo,
    pub(crate) spill_graph: SpillGraph<T>,
    pub(crate) dem_edges: Vec<T>,
    pub(crate) label_edges: Vec<TLabel>,
}

/// A point where two watersheds meet
///
/// This does not say anything about it being a saddle point, only that it is on
/// a ridge. (a saddle point is where the ridge is horizontal). A ridge is
/// always approached from one side, and a ridgepoint therefore has a degree of
/// subjectivity.
#[derive(Debug, PartialEq)]
#[non_exhaustive]
pub struct RidgePoint<T> {
    /// The label of the approaching side
    pub my_label: TLabel,
    /// The label of the other side
    pub n_label: TLabel,
    /// Elevation of the approaching side
    pub my_elev: T,
    /// Elevation of the other side
    pub n_elev: T,
    /// Approacher's cell index
    pub my_cell: usize,
    /// Other's cell index
    pub n_cell: usize,
}

impl<T> FillData<T> {
    /// Create a new [`FillData`] for a single tile coordinate, spill graph and edge data
    pub fn new(
        tile_coord: TileCoord,
        meta: GridMeta,
        spill_graph: SpillGraph<T>,
        dem_edges: Vec<T>,
        label_edges: Vec<TLabel>,
    ) -> Self {
        Self {
            tile_info: TileInfo { tile_coord, meta },
            spill_graph,
            dem_edges,
            label_edges,
        }
    }

    /// Get the spill graph for this [`FillData`]
    pub fn spill_graph(&self) -> &SpillGraph<T> {
        &self.spill_graph
    }
}

#[derive(Debug, Clone)]
/// Fill state of a Zhou depression filling pass
///
/// This is separate from the labels or dem arrays and just tracks the front of
/// the BFS/priority queue.
///
/// Mainly useful if you want fine-grained control over the depression filling
/// process. For just filling a DEM, consider [`fill_zhou2016`] or
/// [`fill_zhou_watersheds`] convenience functions.
/// ```
/// use oxscape_core::GridMeta;
/// use oxscape_tile::depfill::ZhouFillState;
/// use oxscape_tile::depfill::NOT_FILLED;
/// let meta = GridMeta::new(3,3);
/// let mut dem = [
///  2.0,1.0,2.0,
///  2.0,0.0,2.0,
///  2.0,2.0,2.0,
/// ];
/// let mut labels = [NOT_FILLED;9];
/// let mut fill_state = ZhouFillState::new(0);
/// fill_state.add_edges(&meta, &dem);
/// while fill_state.step(&meta, &mut dem, &mut labels, |_| {}) {}
///
/// assert_eq!(dem, [
///  2.0,1.0,2.0,
///  2.0,1.0,2.0,
///  2.0,2.0,2.0,
/// ])
/// ```
pub struct ZhouFillState<T: Float> {
    /// The priority queue that holds boundary cells
    priority_queue: BinaryHeap<Cell<T>>,
    /// The slope queue that holds slope cells
    slope_queue: VecDeque<usize>,
    /// depression cells
    depression_queue: VecDeque<usize>,
    /// The current watershed's label
    current_label: TLabel,
}

impl<T: Float + NextUp + TotalOrder> ZhouFillState<T> {
    /// Create a new, empty ZhouFillState starting at the given label
    pub fn new(start_label: TLabel) -> Self {
        Self {
            priority_queue: BinaryHeap::new(),
            slope_queue: VecDeque::new(),
            depression_queue: VecDeque::new(),
            current_label: start_label,
        }
    }

    /// Get immutable access to the underlying priority queue
    ///
    /// This is the `O(Log(n))` queue that runs in-order to determine the lowest
    /// cell that borders a depression
    pub fn priority_queue(&self) -> &BinaryHeap<Cell<T>> {
        &self.priority_queue
    }

    /// Get immutable access to the underlying slope queue
    ///
    /// This is a normal amortized `O(1)` queue that adds all slope cells. All
    /// cells lower than the current are added to the priority queue
    pub fn slope_queue(&self) -> &VecDeque<usize> {
        &self.slope_queue
    }

    /// Get immutable access to the underlying depression queue
    ///
    /// This a normal amortized `O(1)` queue that fills all lower cells to the
    /// level of the current cell and adds them to the slope queue otherwise
    pub fn depression_queue(&self) -> &VecDeque<usize> {
        &self.depression_queue
    }

    /// Get immutable access to the current label
    ///
    /// This is the label that the
    pub fn current_label(&self) -> &TLabel {
        &self.current_label
    }

    /// Seed the slope queue for growing (a) region(s) of interest
    pub fn seed_slope(&mut self, labels: &mut [TLabel], idxs: &[usize]) {
        for idx in idxs {
            self.slope_queue.push_back(*idx);
            labels[*idx] = self.current_label | ROI_FLAG;
        }
        self.current_label += 1;
    }

    /// add all edge cells to the priority queue
    ///
    /// The priority queue keeps track of heights, so we also need dem
    pub fn add_edges(&mut self, meta: &GridMeta, dem: &[T]) {
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
    ///
    /// You can pass a function to define what happens when two watersheds meet
    pub fn step<WM: FnMut(RidgePoint<T>)>(
        &mut self,
        meta: &GridMeta,
        dem: &mut [T],
        labels: &mut [TLabel],
        mut watersheds_meet: WM,
    ) -> bool {
        // first priority is depression filling: it can add to the slope queue
        if let Some(di) = self.depression_queue.pop_front() {
            // Fill depression
            let (dep_x, dep_y) = meta.i_to_xy(di);
            // check all neighbours
            for dep_dir in 0..8 {
                // if we're on the edge, some directions don't have neighbours
                let Some(ndi) = meta.try_shift(dep_x, dep_y, dep_dir) else {
                    continue;
                };

                // skip if already processed
                if labels[ndi] != NOT_FILLED {
                    // user-supplied function

                    watersheds_meet(RidgePoint {
                        my_label: labels[di],
                        n_label: labels[ndi],
                        my_elev: dem[di],
                        n_elev: dem[ndi],
                        my_cell: di,
                        n_cell: ndi,
                    });
                    continue;
                }

                labels[ndi] = labels[di];

                if dem[ndi] > dem[di] {
                    self.slope_queue.push_back(ndi); // slope cell
                } else {
                    // depression cell
                    dem[ndi] = dem[di]; //.next_up(); // fill
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
                if labels[nsi] != NOT_FILLED {
                    // user-supplied function
                    watersheds_meet(RidgePoint {
                        my_label: labels[si],
                        n_label: labels[nsi],
                        my_elev: dem[si],
                        n_elev: dem[nsi],
                        my_cell: si,
                        n_cell: nsi,
                    });
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
                        if labels[nnsi] != NOT_FILLED && dem[nnsi] < dem[nsi] {
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
            if labels[n] == NOT_FILLED {
                let mut neighbour = false;
                // otherwise, we can take a label from a neighbouring lower cell
                for dir in 0..8 {
                    let Some(nn) = meta.try_shift(c.x, c.y, dir) else {
                        continue;
                    };
                    if labels[nn] != NOT_FILLED && dem[nn] <= dem[n] {
                        labels[n] = labels[nn];
                        neighbour = true;
                    }
                }
                if !neighbour {
                    labels[n] = self.current_label;
                    self.current_label += 1;
                }
            }
            for dir in 0..8 {
                let Some(ni) = meta.try_shift(c.x, c.y, dir) else {
                    continue;
                };

                watersheds_meet(RidgePoint {
                    my_label: labels[n],
                    n_label: labels[ni],
                    my_elev: dem[n],
                    n_elev: dem[ni],
                    my_cell: n,
                    n_cell: ni,
                });

                if labels[ni] != NOT_FILLED {
                    continue;
                }
                labels[ni] = labels[n];
                if dem[ni] < dem[n] {
                    // depression cell
                    dem[ni] = dem[n]; //.next_up();
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
pub fn fill_zhou2016<T: Float + NextUp + TotalOrder>(
    meta: &GridMeta,
    dem: &mut [T],
    labels: &mut [TLabel],
) {
    let mut state = ZhouFillState::<T>::new(0);
    state.add_edges(meta, dem);
    while state.step(meta, dem, labels, |_| {}) {}
}

/// Depression-fill the dem while marking spill elevations between watersheds
///
/// ```
/// let dem = [
///     0,1,0,
///     1,2,1,
///     0,1,0,
/// ];
/// ```
///
pub fn fill_zhou_watersheds<T: Float + NextUp + TotalOrder + Debug>(
    meta: &GridMeta,
    dem: &mut [T],
    labels: &mut [TLabel],
) -> SpillGraph<T> {
    let mut spill_graph = vec![HashMap::new(); 2 * meta.width() + 2 * meta.height()];
    let mut fillstate = ZhouFillState::new(0);
    fillstate.add_edges(meta, dem);
    while fillstate.step(
        meta,
        dem,
        labels,
        |RidgePoint {
             my_label,
             n_label,
             my_elev,
             n_elev,
             ..
         }| { watersheds_meet(my_label, n_label, my_elev, n_elev, &mut spill_graph) },
    ) {}
    spill_graph.truncate(usize::try_from(*fillstate.current_label()).unwrap());
    spill_graph
}

/// Function for what to do when watersheds meet
///
/// This is an almost-direct port of Barnes. It notes the ridgepoint in the
/// spill graph if it is new or lower. That way, the lowest saddle point will
/// become noted.
pub fn watersheds_meet<T: Float + Debug>(
    mut my_label: TLabel,
    mut n_label: TLabel,
    my_elev: T,
    n_elev: T,
    spill_graph: &mut SpillGraph<T>,
) {
    if n_label == NOT_FILLED {
        return;
    }
    if my_label == n_label {
        return;
    }
    let elev_over = my_elev.max(n_elev);

    //Ensure that my_label is always smaller. Doing so means that we only need to
    //keep track of one half of what is otherwise a bidirectional weighted graph
    if my_label > n_label {
        std::mem::swap(&mut my_label, &mut n_label);
    }

    // insert if new or lower than existing
    spill_graph[my_label as usize]
        .entry(n_label)
        .and_modify(|elev| {
            if *elev > elev_over {
                *elev = elev_over
            }
        })
        .or_insert(elev_over);
}

/// Raise catchments to their label's elevation
///
/// This is the second step in depression filling
pub fn raise_catchments<T: PartialOrd + Clone>(
    dem: &mut [T],
    labels: &[TLabel],
    graph_elevs: &[T],
) {
    for (elev, label) in dem.iter_mut().zip(labels) {
        // raise if current elev is lower than the catchment's required elevation to spill
        if *elev < graph_elevs[usize::try_from(*label).unwrap()] {
            *elev = graph_elevs[usize::try_from(*label).unwrap()].clone()
        }
    }
}

#[cfg(test)]
mod test {
    use crate::depfill::{fill_graph::fill_graph, graph::SuperGraph, grid::VecFillGrid};

    use super::*;
    use core::f64;

    use itertools::Itertools;

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
        let mut labels = vec![NOT_FILLED;dem.len()];
        let expected = [
            15.0,15.0,14.0,15.0,12.0, 6.0,12.0,
            14.0,13.0,11.0,12.0,15.0,17.0,15.0,
            15.0,15.0,11.0,11.0, 8.0,15.0,15.0,
            16.0,17.0,11.0,16.0,15.0, 7.0, 5.0,
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

    #[test]
    #[rustfmt::skip]
    fn test_raise_catchments() {
        let mut dem = [
            0,1,
            2,3
        ].map(|v| v as f32);
        let labels = [
            0,0,
            1,1,
        ];
        let spill_elevs = [1,2].map(|v| v as f32);
        raise_catchments(&mut dem, &labels, &spill_elevs);
        assert_eq!(&dem, &[
            1,1,
            2,3
        ].map(|v| v as f32));
    }

    #[test]
    #[rustfmt::skip]
    fn test_tiled_third() {
        let meta = GridMeta::new(7, 7);
        let mut dem = [
            3,4,4,5,5,6,7,
            6,6,5,3,4,6,8,
            6,6,5,3,4,5,6,
            6,5,4,4,4,4,3,
            6,5,4,3,3,4,4,
            7,6,4,2,3,4,4,
            8,7,4,2,3,4,4,
        ].map(|v| v as f32);
        let mut labels = vec![NOT_FILLED;meta.size()];
        fill_zhou2016(&meta, &mut dem, &mut labels);
        assert_eq!(&dem, &[
        //  0 1 2 3 4 5 6
            3,4,4,5,5,6,7,
            6,6,5,4,4,6,8,//6,6,5,3,...
            6,6,5,4,4,5,6,//6,6,5,3,...
            6,5,4,4,4,4,3,
            6,5,4,3,3,4,4,
            7,6,4,2,3,4,4,
            8,7,4,2,3,4,4,
        ].map(|v| v as f32));
        assert_eq!(&labels, &[
            1,1,1,1,0,0,0,
            1,0,1,0,0,0,0,
            0,0,0,0,0,0,0,
            0,0,0,0,0,0,2,
            0,0,0,0,0,0,2,
            0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,
        ])
    }

    #[test]
    #[rustfmt::skip]
    fn test_tiled_fifth() {
        let meta = GridMeta::new(7, 7);
        let mut dem = [
            8,7,5,5,4,4,6,
            5,4,3,4,3,4,7,
            4,3,3,4,2,4,7,
            5,4,4,5,3,4,7,
            7,6,5,5,4,5,7,
            8,7,5,5,4,5,7,
            7,7,6,6,5,5,6,
        ].map(|v| v as f32);
        let mut labels = vec![NOT_FILLED;meta.size()];
        fill_zhou2016(&meta, &mut dem, &mut labels);
        assert_eq!(&dem, &[
        //  0 1 2 3 4 5 6
            8,7,5,5,4,4,6,
            5,4,4,4,4,4,7,
            4,4,4,4,4,4,7,
            5,4,4,5,4,4,7,
            7,6,5,5,4,5,7,
            8,7,5,5,4,5,7,
            7,7,6,6,5,5,6,
        ].map(|v| v as f32));
    }

    #[test]
    #[rustfmt::skip]
    fn test_tiled_third_fifth() {
        let meta = GridMeta::new(7, 7);
        let dems = [
        [
            3,4,4,5,5,6,7,
            6,6,5,3,4,6,8,
            6,6,5,3,4,5,6,
            6,5,4,4,4,4,3,
            6,5,4,3,3,4,4,
            7,6,4,2,3,4,4,
            8,7,4,2,3,4,4,
        ],[
            8,7,5,5,4,4,6,
            5,4,3,4,3,4,7,
            4,3,3,4,2,4,7,
            5,4,4,5,3,4,7,
            7,6,5,5,4,5,7,
            8,7,5,5,4,5,7,
            7,7,6,6,5,5,6,
        ]
        ];
        let filled = [
        [
        //  0 1 2 3 4 5 6
            3,4,4,5,5,6,7,
            6,6,5,4,4,6,8,//6,6,5,4,...
            6,6,5,4,4,5,6,//6,6,5,4,...
            6,5,4,4,4,4,3,
            6,5,4,3,3,4,4,
            7,6,4,2,3,4,4,
            8,7,4,2,3,4,4,
        ],[
            8,7,5,5,4,4,6,
            5,4,4,4,4,4,7,
            4,4,4,4,4,4,7,
            5,4,4,5,4,4,7,
            7,6,5,5,4,5,7,
            8,7,5,5,4,5,7,
            7,7,6,6,5,5,6,
        ]
        ];
        for (idx, tile) in dems.iter().enumerate() {
            let mut dem = tile.map(|v| v as f64);
            let mut labels = [NOT_FILLED; 49];
            fill_zhou2016(&meta, &mut dem, &mut labels);
            meta.print(&dem.map(|v| v as u32));
            assert_eq!(dem, filled[idx].map(|v| v as f64));
        }
    }

    #[test]
    #[rustfmt::skip]
    fn barnes() {
        // the sample tiled dem from Barnes
        let tiled = [
            [
            //  0 1 2 3 4 5 6
                9,9,7,6,7,6,4,
                6,7,6,5,5,4,4,
                3,5,5,4,3,3,3,
                1,3,4,4,3,2,2,
                5,4,4,4,4,4,4,
                6,4,3,3,4,5,6,
                7,4,3,2,4,5,7,
            ],
            [
                3,2,3,4,2,1,2,
                4,4,4,5,3,3,5,
                4,4,4,5,4,5,6,
                3,4,4,5,6,6,6,
                5,6,6,7,4,4,6,
                7,8,8,6,3,4,6,
                9,9,8,5,3,4,6,
            ],
            [
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
            ],
            [
                8,7,5,5,4,4,6,
                5,4,3,4,3,4,7,
                4,3,3,4,2,4,7,
                5,4,4,5,3,4,7,
                7,6,5,5,4,5,7,
                8,7,5,5,4,5,7,
                7,7,6,6,5,5,6,
            ],
            [
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
            ],
            [
                7,8,8,8,7,5,4,
                7,8,8,8,7,5,4,
                7,7,7,7,6,6,6,
                6,5,4,4,5,6,6,
                6,5,5,6,4,5,6,
                6,6,5,6,4,4,6,
                4,6,6,3,3,4,5,
            ],
            [
                4,4,3,2,1,2,4,
                5,4,2,1,2,3,4,
                5,4,3,2,3,5,5,
                6,5,5,3,5,7,8,
                6,5,5,6,6,6,6,
                5,5,5,8,7,5,3,
                3,3,5,9,7,4,1,
            ],
        ];
        let filled = [
            tiled[0],
            tiled[1],
            [
            //  0 1 2 3 4 5 6
                3,4,4,5,5,6,7,
                6,6,5,4,4,6,8,//6,6,5,4,...
                6,6,5,4,4,5,6,//6,6,5,4,...
                6,5,4,4,4,4,3,
                6,5,4,3,3,4,4,
                7,6,4,2,3,4,4,
                8,7,4,2,3,4,4,
            ],
            tiled[3],
            [
            //  0 1 2 3 4 5 6
                8,7,5,5,4,4,6,
                5,4,4,4,4,4,7,
                4,4,4,4,4,4,7,
                5,4,4,5,4,4,7,
                7,6,5,5,4,5,7,
                8,7,5,5,4,5,7,
                7,7,6,6,5,5,6,
            ],
            tiled[5],
            tiled[6],
            tiled[7],
            tiled[8],
        ];
        let sheds = [
            [
            //  0 1 2 3 4 5 6
                0,0,0,2,2,2,2,
                0,0,0,2,2,2,2,
                0,0,0,2,2,2,2,
                0,0,0,2,2,2,2,
                0,0,0,1,1,2,2,
                0,1,1,1,1,1,1,
                0,1,1,1,1,1,1
            ],
            [
                1,1,1,0,0,0,0,
                1,1,1,0,0,0,0,
                3,3,1,0,0,0,0,
                3,3,1,0,0,0,0,
                3,3,0,0,2,2,2,
                3,0,0,2,2,2,2,
                0,0,2,2,2,2,2,
            ],
            [
                1,1,1,1,0,0,0,
                1,0,1,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,2,
                0,0,0,0,0,0,2,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
            ],
            [
                2,2,2,2,2,5,5,
                4,2,1,2,1,3,5,
                4,1,1,1,1,1,3,
                1,1,1,1,1,3,3,
                1,1,1,1,1,0,0,
                1,1,1,1,0,0,0,
                1,1,1,0,0,0,0,
            ],
            [
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
            ],
            [
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                1,0,0,0,0,0,0,
                1,0,0,0,0,1,1,
                1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,
            ],
            [
                0,1,1,1,1,1,1,
                0,1,1,1,1,1,1,
                0,0,0,1,1,1,1,
                0,0,0,0,1,0,1,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
            ],
            [
                0,0,0,0,1,1,1,
                0,0,0,0,0,1,1,
                0,0,0,0,0,0,1,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                2,0,0,0,0,0,0,
                2,0,0,0,0,0,0,
            ],
            [
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,
                0,0,0,0,0,0,1,
                2,2,2,0,0,1,1,
                2,2,2,0,1,1,1,
            ],
        ];
        let graphs = [
            vec![
                HashMap::from([(1,4.0),(2,4.0)]), // 0-4->2
                HashMap::from([(2,4.0)]),
                HashMap::new(),
            ],vec![
                HashMap::from([(1,4.0),(2,5.0),(3,6.0)]),
                HashMap::from([(3,4.0)]),
                HashMap::from([]),
                HashMap::from([]),
            ],
            vec![
                HashMap::from([(1,4.0),(2,4.0)]),
                HashMap::from([]),
                HashMap::from([]),
            ],vec![
                HashMap::from([(1,6.0),(3,7.0)]),
                HashMap::from([(2,7.0),(3,6.0),(4,6.0),(5,7.0)]),
                HashMap::from([(3,7.0),(4,6.0),(5,7.0)]),
                HashMap::from([(5,6.0)]),
                HashMap::from([]),
                HashMap::from([]),
            ],vec![
                HashMap::from([]),
            ],vec![
                HashMap::from([(1,6.0)]),
                HashMap::from([]),
            ],vec![
                HashMap::from([(1,6.0)]),
                HashMap::from([]),
            ],vec![
                HashMap::from([(1,6.0),(2,6.0)]),
                HashMap::from([]),
                HashMap::from([]),
            ],vec![
                HashMap::from([(1,6.0),(2,5.0)]),
                HashMap::from([]),
                HashMap::from([]),
            ]
        ];
        let meta = GridMeta::new(7, 7);
        let supermeta = GridMeta::new(3, 3);
        let mut dems = tiled.map(|tile| tile.map(|v| v as f64));
        let mut labels_grid = vec![vec![NOT_FILLED;meta.size()];supermeta.size()];
        let mut spillgraphs = Vec::with_capacity(supermeta.size());
        for (idx, (dem,labels)) in dems.iter_mut().zip(&mut labels_grid).enumerate() {
            let graph =  fill_zhou_watersheds(&meta, dem,labels);

            meta.print(&dem.map(|v| v as u32));
            assert_eq!(dem, &filled[idx].map(|v| v as f64));
            meta.print(&labels);
            assert_eq!(labels, &sheds[idx]);

            assert_eq!(graph, graphs[idx]);
            spillgraphs.push(graph);
        }

        let grid = VecFillGrid::new(supermeta.clone(), dems
            .iter()
            .zip(&labels_grid)
            .enumerate()
            .map(|(i,(dem,labels))| {
                FillData::new(
                    supermeta.i_to_xy(i).into(),
                    meta.clone(),
                    spillgraphs[i].clone(), meta.edges(dem), meta.edges(labels))
            })
            .collect()
        );

        let mut supergraph = SuperGraph::from_grid(&grid);
        assert_eq!(supergraph.offsets(),&HashMap::from([
            ((0,0).into(),(1,3)),
            ((1,0).into(),(4,4)),
            ((2,0).into(),(8,3)),
            ((0,1).into(),(11,6)),
            ((1,1).into(),(17,1)),
            ((2,1).into(),(18,2)),
            ((0,2).into(),(20,2)),
            ((1,2).into(),(22,3)),
            ((2,2).into(),(25,3)),
        ]));
        println!("{:#?}",supergraph.spill_graph());
        assert_eq!(supergraph.spill_graph(), &vec![
            HashMap::from([]),//0

            HashMap::from([(2,4.0),(3,4.0)]),//1
            HashMap::from([(1,4.0),/* |  */(3,4.0)]),//2
            HashMap::from([        (1,4.0),(2,4.0)]),//3

            HashMap::from([(5,4.0),(6,5.0),(7,6.0)]),//4
            HashMap::from([(4,4.0),/* |        | */(7,4.0)]),//5
            HashMap::from([        (4,5.0)]),/*|       | */  //6
            HashMap::from([                (4,6.0),(5,4.0)]),//7

            HashMap::from([(9,4.0),(10,4.0)]),//8
            HashMap::from([(8,4.0)]),/*| */   //9
            HashMap::from([        (8,4.0)]), //10

            HashMap::from([(12,6.0),         (14,7.0)]),                                    //11
            HashMap::from([(11,6.0),(13,7.0),         (14,6.0),         (15,6.0),        (16,7.0)]),//12
            HashMap::from([         (12,7.0),/* |        |   */(14,7.0),/*     */(15,6.0),/* |  */(16,7.0)]),//13
            HashMap::from([                  (11,7.0),(12,6.0),(13,7.0),/*  |         |                 */(16,6.0)]),//14
            HashMap::from([                                             (12,6.0),(13,6.0)/*   | */]),//15
            HashMap::from([                                                              (12,7.0),(13,7.0),(14,6.0)]),//16

            HashMap::from([]),

            HashMap::from([(19,6.0)]),
            HashMap::from([(18,6.0)]),

            HashMap::from([(21,6.0)]),
            HashMap::from([(20,6.0)]),

            HashMap::from([(23,6.0),(24,6.0)]),
            HashMap::from([(22,6.0)]),
            HashMap::from([         (22,6.0)]),

            HashMap::from([(26,6.0),(27,5.0)]),
            HashMap::from([(25,6.0)]),
            HashMap::from([         (25,5.0)]),
        ]);
        supergraph = supergraph.connect_edges(&grid);
        for ((idx,graph), expected) in supergraph.spill_graph().iter().enumerate().zip(vec![
            HashMap::from([(1,1.0),(3,4.0),        (4,1.0),(5,2.0),(8,4.0),(9,3.0),(10,3.0),(12,4.0),(13,8.0),(15,5.0),(18,6.0),(19,3.0),(20,0.0),(22,3.0),(24,4.0),(25,4.0),(26,1.0),(27,3.0)]),//0
            //
            HashMap::from([(0,1.0),(2,4.0),(3,4.0),  (13,7.0)]),//1
            HashMap::from([        (1,4.0),        (3,4.0),(4,9.0),(7,6.0),(13,5.0),(16,6.0),(17,8.0)]),//2    ||
            HashMap::from([        (0,4.0),(1,4.0),(2,4.0),        (5,4.0),(7,3.0)]),//3    ||
            //                                               |      ||
            HashMap::from([(5,4.0),(6,5.0),(7,6.0),(0,1.0),(2,9.0),(8,6.0),(9,3.0),(17,9.0),                        (16,9.0)]),//4
            HashMap::from([(4,4.0),/* |        | */(7,4.0),(0,2.0),(3,4.0)]),//5
            HashMap::from([        (4,5.0),(8,6.0),(17,4.0),(18,8.0)]),/*|       | */  //6
            HashMap::from([                (4,6.0),(5,4.0),        (2,6.0),(3,3.0)]),//7
            //
            HashMap::from([(9,4.0),(10,4.0),(6,6.0),               (4,6.0),(0,4.0),(10,4.0),        (17,8.0),(18,3.0)]),//8
            HashMap::from([(8,4.0),                                         (4,3.0),(0,3.0)]),/*| */   //9
            HashMap::from([        (8,4.0),                                         (8,4.0),(0,3.0)]), //10
            //
            HashMap::from([(12,6.0),         (14,7.0),      (17,7.0),(21,4.0),(22,7.0)]),//11
            HashMap::from([(11,6.0),(13,7.0),         (14,6.0),         (15,6.0),        (16,7.0), (0,4.0),(20,8.0),(21,7.0)]),//12
            HashMap::from([         (12,7.0),/*   */(1,7.0),(14,7.0),   (2,5.0),(15,6.0),/*  */(16,7.0),(0,8.0)]),//13
            HashMap::from([                  (11,7.0),(12,6.0),(13,7.0),/*                 */(16,6.0),(17,5.0)]),//14
            HashMap::from([                                             (12,6.0),(13,6.0),/* */                    (0,5.0)]),//15
            HashMap::from([                                                       (2,6.0),(12,7.0),(13,7.0),(14,6.0),(4,9.0),(17,6.0)]),//16
            //
            HashMap::from([                         (6,4.0),(11,7.0),                (4,9.0),(2,8.0),(8,8.0),      (14,5.0),(16,6.0),(18,7.0),(19,6.0),(21,7.0),(22,7.0),(23,5.0),(25,6.0)]),//17
            //
            HashMap::from([(19,6.0),                        (6,8.0),                                         (8,3.0),     (0,6.0),     (17,7.0)]),//18
            HashMap::from([(18,6.0),(23,6.0),(25,3.0),                                                                      (0,3.0),       (17,6.0)]),//19

            HashMap::from([(21,6.0),                                                                     (12,8.0),                   (0,0.0),          (22,6.0),(24,6.0)]),//20
            HashMap::from([(20,6.0),         (22,6.0),                (11,4.0),                                    (12,7.0),                            (17,7.0)]),//21

            HashMap::from([(23,6.0),(24,6.0),(21,6.0),(25,6.0),(27,5.0),           (11,7.0),                                                     (0,3.0),(20,6.0),(17,7.0)]),//22
            HashMap::from([(22,6.0),(19,6.0),                  (25,4.0),                                                                                                    (17,5.0)]),
            HashMap::from([         (22,6.0),                                                                                                            (0,4.0),  (20,6.0)]),

            HashMap::from([(26,6.0),(27,5.0),(19,3.0),(22,6.0),(23,4.0),                                                                                          (0,4.0),        (17,6.0)]),//25
            HashMap::from([(25,6.0),                                                                                                                                      (0,1.0)]),
            HashMap::from([         (25,5.0),                  (22,5.0),                                                                                                          (0,3.0)]),
        ]){
            if *graph != expected {
                println!("mismatch at {idx:?}");
                println!("expected: {:?}", expected.iter().sorted_by(|a,b| a.0.cmp(b.0)));
                println!("graph:    {:?}", graph.iter().sorted_by(|a,b| a.0.cmp(b.0)));
                panic!()
            }
        }
        let mut graph_elevs = vec![f64::MIN; supergraph.spill_graph().len()];
        fill_graph(&supergraph.spill_graph(), &mut graph_elevs);
        assert_eq!(&graph_elevs, &[
            f64::MIN,
            1.0,4.0,4.0,
            1.0,2.0,5.0,4.0,
            4.0,3.0,3.0,
            6.0,4.0,5.0,5.0,5.0,6.0,
            5.0,
            4.0,3.0,
            0.0,6.0,
            3.0,4.0,4.0,
            3.0,1.0,3.0
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_zhou_fill_state_doctest() {
        let meta = GridMeta::new(3, 3);
        let mut dem = [
            2.0,1.0,2.0,
            2.0,0.0,2.0,
            2.0,2.0,2.0
        ];
        let mut labels = [NOT_FILLED; 9];
        let mut fill_state = ZhouFillState::new(0);
        fill_state.add_edges(&meta, &dem);
        while fill_state.step(&meta, &mut dem, &mut labels, |_| {}) {
            println!("{fill_state:?}");
        }
        assert_eq!(dem, [
            2.0,1.0,2.0,
            2.0,1.0,2.0,
            2.0,2.0,2.0,
        ])
    }
}

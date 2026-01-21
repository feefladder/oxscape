use ordered_float::OrderedFloat;
use oxscape::{GridMeta, Result};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, VecDeque};

#[derive(Debug, Clone, Copy)]
struct CellZ {
    i: usize,
    z: OrderedFloat<f64>,
}

impl PartialEq for CellZ {
    fn eq(&self, other: &Self) -> bool {
        self.z == other.z
    }
}
impl Eq for CellZ {}

impl PartialOrd for CellZ {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
impl Ord for CellZ {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        other.z.cmp(&self.z)
    }
}

fn init_priority_queue(
    dem: &[f64],
    flag: &mut [bool],
    meta: &GridMeta,
    pq: &mut BinaryHeap<CellZ>,
) {
    for i in 0..meta.size() {
        if flag[i] {
            continue;
        }
        if meta.is_edge(i) {
            pq.push(CellZ {
                i,
                z: dem[i].into(),
            });
            flag[i] = true;
        }
    }
}

fn process_pit(
    dem: &mut [f64],
    flag: &mut [bool],
    meta: &GridMeta,
    depression_q: &mut VecDeque<CellZ>,
    trace_q: &mut VecDeque<CellZ>,
) {
    while let Some(node) = depression_q.pop_front() {
        for d in 0..8 {
            let ni = meta.shift(node.i, d as u8);
            if flag[ni] {
                continue;
            }

            let spill = dem[ni];
            if spill > *node.z {
                flag[ni] = true;
                trace_q.push_back(CellZ {
                    i: ni,
                    z: spill.next_up().into(),
                });
            } else {
                flag[ni] = true;
                dem[ni] = node.z.next_up();
                depression_q.push_back(CellZ {
                    i: ni,
                    z: node.z.next_up().into(),
                });
            }
        }
    }
}

fn process_trace_queue(
    dem: &[f64],
    flag: &mut [bool],
    meta: &GridMeta,
    trace_q: &mut VecDeque<CellZ>,
    pq: &mut BinaryHeap<CellZ>,
) {
    let mut potential_q = VecDeque::new();
    let index_threshold = 2;

    while let Some(node) = trace_q.pop_front() {
        for d in 0..8 {
            let ni = meta.shift(node.i, d as u8);
            if flag[ni] {
                continue;
            }

            if dem[ni] > *node.z {
                flag[ni] = true;
                trace_q.push_back(CellZ {
                    i: ni,
                    z: dem[ni].into(),
                });
            } else {
                if d < index_threshold {
                    potential_q.push_back(node);
                } else {
                    pq.push(node);
                }
                break;
            }
        }
    }

    while let Some(node) = potential_q.pop_front() {
        for d in 0..8 {
            let ni = meta.shift(node.i, d as u8);
            if !flag[ni] {
                pq.push(node);
                break;
            }
        }
    }
}

pub fn priority_flood_wei2018(dem: &mut [f64], meta: &GridMeta) -> Result<()> {
    meta.check_dem(dem)?;

    let mut flag = vec![false; meta.size()];
    let mut pq = BinaryHeap::<CellZ>::new();
    let mut trace_q = VecDeque::new();
    let mut depression_q = VecDeque::new();

    init_priority_queue(dem, &mut flag, meta, &mut pq);

    while let Some(node) = pq.pop() {
        for dir in 0..8 {
            // TODO: this is x-wrapping
            let (x, y) = meta.i_to_xy(node.i);
            let Some(ni) = meta.try_shift(x, y, dir) else {
                continue;
            };
            if flag[ni] {
                continue;
            }

            let spill = dem[ni];
            if spill <= *node.z {
                dem[ni] = node.z.next_up();
                flag[ni] = true;
                depression_q.push_back(CellZ {
                    i: ni,
                    z: node.z.next_up().into(),
                });
                process_pit(dem, &mut flag, meta, &mut depression_q, &mut trace_q);
            } else {
                flag[ni] = true;
                trace_q.push_back(CellZ {
                    i: ni,
                    z: spill.into(),
                });
            }

            process_trace_queue(dem, &mut flag, meta, &mut trace_q, &mut pq);
        }
    }

    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;

    #[rustfmt::skip]
    mod consts {
        pub const DEM: [f64;9] = [
            1.0,1.0,1.0,
            1.0,0.0,1.0,
            1.0,1.0,1.0,
        ];
    }

    #[test]
    #[rustfmt::skip]
    fn test_fill() {
        let mut dem = consts::DEM.clone();
        priority_flood_wei2018(&mut dem, &GridMeta::new(3,3)).unwrap();
        assert_eq!(dem, [
            1.0, 1.0, 1.0,
            1.0, 1.0000000000000002, 1.0,
            1.0, 1.0, 1.0
        ]);
    }

    #[test]
    #[rustfmt::skip]
    fn test_fill_two() {
        let mut dem = [
            1.0,0.5,1.0,
            1.0,0.4,1.0,
            1.0,0.4,1.0,
            1.0,1.0,1.0,
        ];
        priority_flood_wei2018(&mut dem, &GridMeta::new(3,4)).unwrap();
        assert_eq!(dem, [
            1.0, 0.5, 1.0,
            1.0, 0.5000000000000001, 1.0,
            1.0, 0.5000000000000002, 1.0,
            1.0, 1.0, 1.0
        ]);
    }
}

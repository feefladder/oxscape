use rayon::prelude::*;
use std::cell::UnsafeCell; // 1.11.0

struct Bazooka(UnsafeCell<*mut i32>);

unsafe impl Sync for Bazooka {}

/// SAFETY: It is your responsibility to ensure:
/// - level indices don't overlap
/// - allowed_indices point OUTSIDE the level
/// In code:
/// ```
/// # use std::collections::HashSet;
/// let mut arr = vec![0,1,2,3];
/// let stack = vec![0,2,1,3];
/// let levels = vec![0,2,4];
/// let allowed_indices = [1,0,3,2];
/// for level in levels.windows(2).map(|w| &stack[w[0]..w[1]]) {
///     // level inidces don't overlap, and allowed_indices point OUTSIDE the level
///     let mut set = HashSet::with_capacity(level.len());
///     for idx in level {
///         assert!(set.insert(*idx));
///     }
///     for idx in level {
///         assert!(!set.contains(&allowed_indices[*idx]));
///     }
/// }
/// ```
pub unsafe fn do_stuff(arr: &mut [i32], levels: &[usize], stack: &[isize], allowed_indices: &[isize]) {
    let ptr = Bazooka(UnsafeCell::new(arr.as_mut_ptr()));
    let r = &ptr;
    for level in levels.windows(2).map(|w| &stack[w[0]..w[1]]) {
        level.into_iter().for_each(|idx| unsafe {
            let p = *r.0.get();
            let val = p.offset(allowed_indices[*idx as usize]).read();
            *p.offset(*idx) += val;
        });
    }
}

pub fn do_slow_stuff(arr: &mut [i32], levels: &[usize], stack: &[usize], allowed_indices: &[usize]) {
    for level in levels.windows(2).map(|w| &stack[w[0]..w[1]]) {
        let mut v= vec![0;level.len()];
        v.iter_mut().zip(level).for_each(|(out,idx)| {
            // expensive operation
            *out = arr[*idx] + arr[allowed_indices[*idx]];
        });
        println!("{arr:?}: {v:?}");
        for i in 0..level.len() {
            arr[level[i] as usize] = v[i]
        }
    }
}

#[test]
fn test_stuff() {
    let mut arr = [0,1,2,3];
    let stack = [0,2,1,3];
    let levels = [0,2,4];
    let allowed_indices = [1,0,3,2];
    unsafe {
        do_stuff(&mut arr, &levels, &stack, &allowed_indices);
    }
    assert_eq!(arr, [1,2,5,8]);
}

#[test]
fn test_rayon() {
    let mut arr = [0,1,2,3];
    arr.par_iter_mut().for_each(|v| *v+=1);
    assert_eq!(&arr, &[1,2,3,4]);
}

#[test]
fn test_datarace() {
    let mut arr = [0,1,2,3];
    let stack = [0,2,1,3];
    let levels = [0,2,4];

    // this here is a datarace: 0 -> 2 but 2 is in level 0
    let allowed_indices = [2,0,3,2];
    unsafe {
        do_stuff(&mut arr, &levels, &stack, &allowed_indices);
    }
    assert_eq!(arr, [2,3,5,8]);
}

#[test]
fn test_slow_stuff() {
    let mut arr = [0,1,2,3];
    let stack = [0,2,1,3];
    let levels = [0,2,4];
    let allowed_indices = [1,0,3,2];
    // 1st iteration:
    // level: [0,2]
    // allowed_indices: [1,3]
    // arr[allowed_indices[level]]: [1,3]
    // [0,2] += [1,3] = [1,5]
    // arr: [1,1,5,3]
    // 
    // 2nd iteration:
    // level: [1,3]
    // allowed_indices: [0,2]
    // arr[allowed_indices[level]]: [1,5]
    // [1,3] + [1,5] = [2,8]
    // arr: [1,2,5,8]
    do_slow_stuff(&mut arr, &levels, &stack, &allowed_indices);
    assert_eq!(arr, [1,2,5,8]);
}

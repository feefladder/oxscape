use rand::SeedableRng;
use rand::distr::{Distribution, Uniform};
use rand_distr::StandardNormal;
use rand_mt::Mt;
use std::thread_local;

pub type RandomEngineState = String;

// --------------------------
// Thread-local Mt
// --------------------------
thread_local! {
    static RNG: std::cell::RefCell<Mt> =
        std::cell::RefCell::new(Mt::from_os_rng());
}

fn rng_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut Mt) -> R,
{
    RNG.with(|cell| f(&mut *cell.borrow_mut()))
}

/// --------------------------
/// Seeding
/// --------------------------
pub fn seed_rand(seed: u64) {
    if seed == 0 {
        rng_mut(|r| *r = Mt::from_os_rng());
    } else {
        // Matches C++: seed * thread_num
        // Since minimal version ignores real thread numbering,
        // thread_num = 0 just like C++ on single thread.
        rng_mut(|r| *r = Mt::seed_from_u64(seed * 0));
    }
}

/// --------------------------
/// Uniform integer [from, thru]
/// --------------------------
pub fn uniform_rand_int(from: i32, thru: i32) -> i32 {
    rng_mut(|r| {
        let dist = Uniform::new_inclusive(from, thru).expect("Wrong bounds");
        dist.sample(r)
    })
}

/// --------------------------
/// Uniform real [from, thru)
/// --------------------------
pub fn uniform_rand_real(from: f64, thru: f64) -> f64 {
    rng_mut(|r| {
        let dist = Uniform::new(from, thru).expect("Wrong bounds");
        dist.sample(r)
    })
}

/// --------------------------
/// Normal(mean, stddev)
/// --------------------------
pub fn normal_rand(mean: f64, stddev: f64) -> f64 {
    rng_mut(|r| {
        let z: f64 = StandardNormal.sample(r);
        mean + z * stddev
    })
}

/// --------------------------
/// Save state (text form)
/// --------------------------
pub fn save_random_state() -> RandomEngineState {
    rng_mut(|r| format!("{:?}", *r))
}

// --------------------------
// Restore state
// --------------------------
// pub fn set_random_state(s: &RandomEngineState) {
//     rng_mut(|r| *r = s.parse().expect("failed to parse Mt state"));
// }

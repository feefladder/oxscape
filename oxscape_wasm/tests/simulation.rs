use oxscape_erode::Params;
use oxscape_wasm::Simulation;
use wasm_bindgen_test::*;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_create_sim_2() {
    let sim = Simulation::new(2, 2, 42).expect("could not make sim");
    let res: Vec<f64>;
    unsafe {
        let dem = sim.dem();
        res = (0..dem.length()).map(|i| dem.get_index(i)).collect();
    }
    assert_eq!(res, &[0.0; 4]);
    let res: Vec<f64>;
    unsafe {
        let acc = sim.acc();
        res = (0..acc.length()).map(|i| acc.get_index(i)).collect();
    }
    assert_eq!(res, &[0.0; 4]);
    let res: Vec<u32>;
    unsafe {
        let lvls = sim.levels();
        res = (0..lvls.length()).map(|i| lvls.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 4]);
    let res: Vec<u32>;
    unsafe {
        let stack = sim.stack();
        res = (0..stack.length()).map(|i| stack.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 1, 2, 3]);
}

#[wasm_bindgen_test]
fn test_create_sim_3() {
    let sim = Simulation::new(3, 3, 44).expect("could not make sim");
    let res: Vec<f64>;
    unsafe {
        let dem = sim.dem();
        res = (0..dem.length()).map(|i| dem.get_index(i)).collect();
    }
    assert_eq!(
        res,
        &[0.0, 0.0, 0.0, 0.0, 0.4453615693979407, 0.0, 0.0, 0.0, 0.0]
    );
    let res: Vec<f64>;
    unsafe {
        let acc = sim.acc();
        res = (0..acc.length()).map(|i| acc.get_index(i)).collect();
    }
    assert_eq!(res, &[0.0; 9]);
    let res: Vec<u32>;
    unsafe {
        let lvls = sim.levels();
        res = (0..lvls.length()).map(|i| lvls.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 8, 9]);
    let res: Vec<u32>;
    unsafe {
        let stack = sim.stack();
        res = (0..stack.length()).map(|i| stack.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 1, 2, 3, 5, 6, 7, 8, 4]);
}

#[wasm_bindgen_test]
fn test_step_sim_3() {
    let mut sim = Simulation::new(3, 3, 44).expect("could not make sim");
    let mut params = Params::default();
    params.cell_area = 10000.0;
    sim.set_params(params);
    sim.step().unwrap();
    let res: Vec<f64>;
    unsafe {
        let dem = sim.dem();
        res = (0..dem.length()).map(|i| dem.get_index(i)).collect();
    }
    assert_eq!(
        res,
        &[0.0, 0.0, 0.0, 0.0, 0.7346401345055633, 0.0, 0.0, 0.0, 0.0]
    );
    let res: Vec<f64>;
    unsafe {
        let acc = sim.acc();
        res = (0..acc.length()).map(|i| acc.get_index(i)).collect();
    }
    assert_eq!(
        res,
        &[
            10000.0, 10000.0, 10000.0, 20000.0, 10000.0, 10000.0, 10000.0, 10000.0, 10000.0
        ]
    );
    let res: Vec<u32>;
    unsafe {
        let lvls = sim.levels();
        res = (0..lvls.length()).map(|i| lvls.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 8, 9]);
    let res: Vec<u32>;
    unsafe {
        let stack = sim.stack();
        res = (0..stack.length()).map(|i| stack.get_index(i)).collect();
    }
    assert_eq!(res, &[0, 1, 2, 3, 5, 6, 7, 8, 4]);
}

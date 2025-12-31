pub mod mflow;
pub mod sflow;

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Params {
    pub keq: f64,
    pub neq: f64,
    pub meq: f64,
    pub ueq: f64,
    pub dt: f64,
    pub tol: f64,
    pub cell_area: f64,
}

impl Default for Params {
    fn default() -> Self {
        Self {
            keq: 2e-6,
            neq: 2.0,
            meq: 0.8,
            ueq: 2e-3,
            dt: 1000.0,
            tol: 1e-3,
            cell_area: 1.0,
        }
    }
}


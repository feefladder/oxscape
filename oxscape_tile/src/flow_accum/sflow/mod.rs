//! almost-direct port of Barnes (2017)' parallel flow accumulation algorithm
//!
//! For each tile into which cell flows, a path is followed and accumulation is
//! added for all those cells. Since it's single-flow, each input has at most one output
//!
//! Barnes, R. (2017). Parallel non-divergent flow accumulation for trillion cell digital elevation models on desktops or clusters. Environmental Modelling & Software, 92, 202–212. https://doi.org/10.1016/j.envsoft.2017.02.022

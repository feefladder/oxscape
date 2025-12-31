
# Oxscape
![An Ox pulling the word "oxscape" left over soil that is (left-to-right) tilled, mulched and grows grass.](../img/oxscape.svg)

Oxscape (oxidized FastScape) is rust port and abstraction of Barnes' parallel flow graph traversal algorithm (2019) [![DOI](https://zenodo.org/badge/110618450.svg)](https://zenodo.org/badge/latestdoi/110618450). Oxscape is the ox that pulls your landscape evolution models.

```rust
use oxscape::GridMeta;
use oxscape::order_sflow::{Order, D8};

let dem: Vec<f64> = (0..1000*1000).iter().map(|v| f64::from(v)).collect()
let order = Order::from_dem_metric(GridMeta::new(1000,1000), &dem, D8);

// write your own algorithms
pub fn accum(order: &Order, cell_area: f64, accum: &mut [f64]) {
    accum.fill(cell_area);
    order.for_lvls_top_down(accum, |a| {
        *a.cell() += a.donors().iter().sum::<f64>();
    });
}

let mut flow_accumulation = vec![0.0;order.meta().size();]
// compute flow accumulation
accum(&order, 10_000.0, &mut flow_accumulation);
```


# references

Barnes, R. (2019). Accelerating a fluvial incision and landscape evolution model with parallelism. Geomorphology, 330, 28–39. https://doi.org/10.1016/j.geomorph.2019.01.002



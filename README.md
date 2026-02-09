# Oxscape

Oxscape is a collection of tools for running hydrological models in parallel, in-browser or on clusters.

## Organization

- `oxscape` is the main crate that gathers all exportable modules.

- Core types that define a grid are located in `oxscape_core`. These are used by all other crates.
- `oxscape_tile` implements tile-based parallelization, for three distinct "types":
  - depression-filling: this is sort of like the additive identity in that `res = F(global)`
  - flow accumulation: This is a linear process, in that `res = F(tile) + F(global)`
  - non-linear, where `res ≠ F(tile) + F(global)` TODO
- `oxscape_contours` implements the Barnes (2019) algorithm for parallelization along "contours", both for single-(D8, Rho8) and multiflow (Dinf, Holmgren) flow metrics
- `oxcsape_erode` implements an implicit stream incision model, with more to be added. This should be 

- `oxscape_tui` is a tui interface, mainly for debugging the different models
- `oxscape_wasm` defines wasm interfaces to the models via wasm-pack, that are used in `web/oxscape-exhibit`
- `oxscape_python` exposes a python api. Note that it is not possible to define your own erosion models here.

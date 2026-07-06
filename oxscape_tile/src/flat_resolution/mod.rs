//! Flat resolution
//!
//! Basically something ported-ish from barnes, but he just uses some A2Array2D
//! and that feels like it avoids the entire
//! solve-globally-so-only-need-load-from-cache-once optimization.
//!
//! Another way would be to have the flat resolution keep around information
//! about at which cell watersheds meet.
//!
//! then pass that into a `raise_catchments_and_resolve_flats` function. We
//! merge them so it saves io. Kind of sad about mixing state though, but... I
//! mean the alternative, and arguably kinda-easier approach is to re-run a bfs on the full dem?
//!
//! Oh well, anyways, I think we need to first solve this problem without tiles eh?
//!
//! The main problem is that a dem-with-flats needs a flat-resistant flow metric
//! or have a two-pass flow metric that doesn't re-assign flow to already-determined cells
//!

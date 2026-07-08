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
//! and if it is two-pass, which is easier implementation-wise and maybe not
//! that much more compute, then the global graph is not solving two problems at
//! the same time (i like).
//!
//! So is that a flowmets thing?
//! I think it is!
//!
//! So solved it for non-tiled case. Now when tiled, the minimum required
//! information for the global problem is actually exactly-sort-of what is
//! already there for depression filling:
//! main components needed are:
//! 1. edge elevations
//! 2. connectivity+spill elevations
//!
//! then we can basically say:
//!
//! 1. for each watershed, add all raised neighbours of the raised downstream watershed
//!
//! There is a small problem wrt. large depressions that flow parallel to a tile
//! edge, where directions would suddendly become perpendicular in the
//! neighbouring tile. Not sure how to solve that though...
//!
//! And there was a thing with skirted tiles or passing a double-edge to the
//! producer, since otherwise flow directions cannot be determined And afaik
//! edge flow is handled by the producer and it's just [`NO_FLOW`] at the
//! consumer's side. In other words: Edges flow directly off the grid and that's
//! fixed later.
//!
//! I think the double edge is more elegant compared to skirted tiles, since it
//! preserves the edges-are-handled-by-producer dynamic.

#[cfg(test)]
mod test {
    #[test]
    #[rustfmt::skip]
    fn test_bad() {
        // example of a hostile dem:
        // the two
        let dem = [
            [
                1.0,0.5,1.0,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
            ],
            [
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,0.2,0.2,1.0,
                1.0,1.0,1.0,1.0,
            ]
        ];
        let raised = [
            [
                1.0,0.5,1.0,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
            ],
            [
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,0.5,0.5,1.0,
                1.0,1.0,1.0,1.0,
            ]
        ];
        // and now the top edge of tile 1 will be rather arbitrarily flowing to
        // either the left or right.
        //
        // That's kind of fine because people ignore lake dynamics?
        // but actually not fine...
        //
        // The answer is that both top cells have to be added to the queue
        // that's doable
    }

    #[test]
    #[rustfmt::skip]
    fn test_ugly() {
        // example of a hostile dem:
        // the two
        let dem = [
            [
                1.0,1.0,1.0,1.0,1.0,
                1.0,0.2,0.2,0.2,1.0,
                0.5,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
            ],
            [
                1.0,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
                1.0,0.2,0.2,0.2,1.0,
                1.0,1.0,1.0,1.0,1.0,
            ]
        ];
        let raised = [
            [
                1.0,1.0,1.0,1.0,1.0,
                1.0,0.5,0.5,0.5,1.0,
                0.5,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
            ],
            [
                1.0,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
                1.0,0.5,0.5,0.5,1.0,
                1.0,1.0,1.0,1.0,1.0,
            ]
        ];
        // and now the top edge of tile 1 will have seeds that should be on
        // different levels. That's kinda bad, but maybe we can accept that?
        //
    }

    #[test]
    #[rustfmt::skip]
    fn test_re_entrant() {
        let dem = [[
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
            1.0,0.2,0.2,1.0,0.2,0.2,1.0,
        ],[
            0.5,1.0,1.0,0.2,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
        ]];
        let filled = [[
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,0.5,0.5,1.0,0.5,0.5,1.0,
            1.0,0.5,0.5,1.0,0.5,0.5,1.0,
        ],[
            0.5,1.0,1.0,0.5,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
            1.0,1.0,1.0,1.0,1.0,1.0,1.0,
        ]];
        // re-entrant case should be fine, because we have access to labels and
        // only seed edge cells that hug a neighbouring downstream label

    }
}

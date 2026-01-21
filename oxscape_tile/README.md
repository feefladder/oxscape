# Tiled interface for models


## ramble

So there's a lot of cool things wrt hydrology and stuff, but by far the coolest is the development of tile-based hydrology algorithms, running hydrology client-side in wasm (rust) and Cloud-Optimized Geotiffs. 

One small problem is that given an area of interest, say a farm or city, you don't know -without something like hydrosheds- what catchment you're in or from where the water flows into your area. This is made more complex if the dem is not depression-filled. So a major question I have:

"Given an initial area, can you find all upslope cells in a non-depression-filled dem?"

I realized it may be possible with like a priority-flood if the area of interest _and_ the borders of tiles are added to the priority queue (BinaryHeap). The main problem of only adding the area of interest is that the priority flood algorithm assumes all water flows to the initial cells.

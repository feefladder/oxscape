[![DOI](https://zenodo.org/badge/110618450.svg)](https://zenodo.org/badge/latestdoi/110618450)

Barnes2019-Landscape
============================


**Title of Manuscript**:
Accelerating a fluvial incision and landscape evolution model with parallelism

**Authors**: Richard Barnes

**Corresponding Author**: Richard Barnes (richard.barnes@berkeley.edu)

**DOI Number of Manuscript**: https://arxiv.org/abs/1803.02977

**Code Repositories**
 * [Author's GitHub Repository](https://github.com/r-barnes/Barnes2018-Landscape)

This repository contains a reference implementation of the algorithms presented
in the manuscript above, along with information on acquiring the various
datasets used, and code to perform correctness tests.



Abstract
--------

Solving inverse problems and achieving statistical rigour in landscape evolution
models requires running many model realizations. Parallel computation is
necessary to achieve this in a reasonable time. However, no previous algorithm
is well-suited to leveraging modern parallelism. Here, I describe an algorithm
that can utilize the parallel potential of GPUs, many-core processors, and SIMD
instructions, in addition to working well in serial. The new algorithm runs 43 x
faster (70 s vs. 3,000 s on a 10,000 x 10,000 input) than the previous state of
the art and exhibits sublinear scaling with input size. I also identify methods
for using multidirectional flow routing and quickly eliminating landscape
depressions and local minima. Tips for parallelization and a step-by-step guide
to achieving it are given to help others achieve good performance with their own
code. Complete, well-commented, easily adaptable source code for all versions of
the algorithm is available as a supplement and on Github.



Compilation
-----------

Run

    make

to compile all non-GPU code using your default compiler.

Run

    make -f Makefile.summitdev

to compile all GPU code using the PGI compiler.



Correctness
-----------

Run

    ./compare.sh

to ensure that all algorithms are producing the same output



Empirical Comparisons
---------------------

Run

    ./tests/tests.sh

To run all tests.

Explanation
-----------

For testing, I have developed the following implementations:  
- B&W: The B&W serial algorithm described by [5] adapted from code provided by Braun.
- B&W+P: The B&W algorithm with only erosion parallelized.
- B&W+PI: The B&W algorithm parallelized using the additional techniques described here, but still using the stack structure.
- RB: A serial version of the new algorithm.  • RB+P: The new algorithm with only erosion parallelized, for comparison against B&W+P.
- RB+PI: The new algorithm using all the parallel techniques described here.
- RB+PQ: The new algorithm using all the parallel techniques described here separated by threads.
- RB+GPU: The new algorithm using all the parallel techniques described here implemented for use on a GPU.

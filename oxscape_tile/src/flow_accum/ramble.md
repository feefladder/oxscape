# flow accumulation ramble

and some other things

### multiple flow

So the flow accumulation for single flow has the nice property that single in->single out. This means that a map of the shape 

```cpp
template<class elev_t>
class Job1 {
 private:
  friend class cereal::access;
  template<class Archive>
  void serialize(Archive & ar){
    ar(links,
       accum,
       flowdirs,
       time_info,
       gridy,
       gridx);
  }
 public:
  std::vector<link_t   >      links;
  std::vector<accum_t  >      accum;
  std::vector<pd8_flowdir_t>  flowdirs;
  std::vector<accum_t  >      accum_in;     //Used by produce, here for convenience, not communicated, so not serialized.
  std::vector<p_dependency_t> dependencies; //Used by produce, here for convenience, not communicated, so not serialized.
  TimeInfo time_info;
  int gridy, gridx;
  Job1(){}
};
```
with typenames:
```cpp
//Links need to be able to hold values up to the length of the perimeter of a
//tile of the DEM. uint16_t is therefore acceptable. It allows a perimeter of
//length 65,535 (minus the constants defined below). This allows for sides of
//~16,383.
typedef uint16_t link_t;


//Using int32_t here would allow a single cell to represent flow accumulations
//stemming from a ~46,340^2 cell area. Using uint32_t bumps that to ~65,535^2
//cells. This is easily exceeded in a rather large DEM. Therefore, we would like
//to use int64_t, which allows 3,037,000,499^2 cells. However, GDAL is silly and
//does not allow for 64-bit integers. Therefore, we use double. The IEEE754
//double-precision floating-point type has a 53-bit significand. This is
//sufficient to capture a 94,906,265^2 area.
typedef double accum_t;


//Valid flowdirs are in the range 0-8, inclusive. 0 is the center and 1-8,
//inclusive, are the 8 cells around the central cell. An extra value is needed
//to indicate NoData. Therefore, uint8_t is appropriate.
typedef uint8_t pd8_flowdir_t;


//In a perimeter representation, any number of cells on the perimeter may
//ultimately flow into a single outlet cell. Therefore, we need this to uint16_t
//for the same reasons discussed for link_t. We will assume that the top value
//(65,535) is not usable in order to raise an assertion error if the dependency
//count goes negative.
typedef uint16_t p_dependency_t;
//Links need to be able to hold values up to the length of the perimeter of a
//tile of the DEM. uint16_t is therefore acceptable. It allows a perimeter of
//length 65,535 (minus the constants defined below). This allows for sides of
//~16,383.
typedef uint16_t link_t;


//Using int32_t here would allow a single cell to represent flow accumulations
//stemming from a ~46,340^2 cell area. Using uint32_t bumps that to ~65,535^2
//cells. This is easily exceeded in a rather large DEM. Therefore, we would like
//to use int64_t, which allows 3,037,000,499^2 cells. However, GDAL is silly and
//does not allow for 64-bit integers. Therefore, we use double. The IEEE754
//double-precision floating-point type has a 53-bit significand. This is
//sufficient to capture a 94,906,265^2 area.
typedef double accum_t;


//Valid flowdirs are in the range 0-8, inclusive. 0 is the center and 1-8,
//inclusive, are the 8 cells around the central cell. An extra value is needed
//to indicate NoData. Therefore, uint8_t is appropriate.
typedef uint8_t pd8_flowdir_t;


//In a perimeter representation, any number of cells on the perimeter may
//ultimately flow into a single outlet cell. Therefore, we need this to uint16_t
//for the same reasons discussed for link_t. We will assume that the top value
//(65,535) is not usable in order to raise an assertion error if the dependency
//count goes negative.
typedef uint16_t p_dependency_t;
```

or
```
template<class T> using Job2        = std::vector<accum_t>;
```
is possible, as opposed to a more complex one-to-many map
### runtime for nonlinear relationships

basically, there are three "types" of operations that determine how they can be run in parallel on a chunked dem. Barnes did some smartness for depression filling and flow accumulation, which was possible because of their linearity. That is: flow accumulation for n cells is exactly the same as n times flow accumulation for a single cell:

1. constant (depression filling) `out=in`
2. linear (flow accumulation) `out=in+n*intermediate`
3. nonlinear (erosion) no closed-form expression

So -after solving the linear case for multiple flow-, there is a need to make some runtime-type thing that works in-browser, but allows for lots of communication between neighbouring tiles. Since flow directions are already calculated and the execution DAG is determined by them, a minimal-io/minimal-ram schedule can be made that still allows for minimal-communication solution of nonlinear problems. The number of communications cannot be further limited for these cases [(mathematical proof pending)](https://theproofistrivial.com).

The main benefit of constant or linear is that the global solution can be calculated separate from any of the rasters. The solution can then be dispatched to each tile independently in a next step.

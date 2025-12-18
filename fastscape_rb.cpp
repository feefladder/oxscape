#include "fastscape_rb.hpp"
#include <iostream>

int main(int argc, char **argv){
  //Enable this to stop the program if a floating-point exception happens
  //feenableexcept(FE_ALL_EXCEPT);

  if(argc!=5){
    std::cerr<<"Syntax: "<<argv[0]<<" <Dimension> <Steps> <Output Name> <Seed>"<<std::endl;
    return -1;
  }

  const int         width       = std::stoi (argv[1]);
  const int         height      = std::stoi (argv[1]);
  const int         nstep       = std::stoi (argv[2]);
  const std::string output_name =            argv[3] ;
  const auto        rand_seed   = std::stoul(argv[4]);

  seed_rand(rand_seed);

  //Uses the RichDEM machine-readable line prefixes
  //Name of algorithm
  std::cout<<"A FastScape RB"<<std::endl;
  //Citation for algorithm
  std::cout<<"C Richard Barnes TODO"<<std::endl;
  //Git hash of code used to produce outputs of algorithm
  std::cout<<"h git_hash    = "<<GIT_HASH<<std::endl;
  //Random seed used to produce outputs
  std::cout<<"m Random seed = "<<rand_seed<<std::endl;

  CumulativeTimer tmr(true);
  FastScape_RB tm(width,height);
  tm.GenerateRandomTerrain();
  tm.run(nstep);
  std::cout<<"t Total calculation time    = "<<std::setw(15)<<tmr.elapsed()<<" microseconds"<<std::endl;

  PrintDEM(output_name, tm.getH(), width, height);

  return 0;
}

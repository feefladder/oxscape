# GoogleTest requires at least C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# from https://google.github.io/googletest/quickstart-cmake.html

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/52eb8108c5bdec04579160ae17225d66034bd723.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# here we add the executable
add_executable(
    rb_test # the name of the resulting file
    test_rb.cpp # any files needed to make it
    ../CumulativeTimer.cpp
    ../random.cpp
)
# we also need to include googletest's code and OpenMP
target_link_libraries(
    rb_test
    PRIVATE
    build_info
    GTest::gtest_main
    GTest::gmock
    OpenMP::OpenMP_CXX
)
# add the top-level directory to be able to include headers
target_include_directories(rb_test PRIVATE ..)

include(GoogleTest)
gtest_discover_tests(rb_test)

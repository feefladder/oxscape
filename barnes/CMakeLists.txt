cmake_minimum_required(VERSION 3.16)
project(fastscape LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

execute_process(
    COMMAND git rev-parse HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_HASH
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

string(TIMESTAMP COMPILE_TIME "%Y-%m-%d %H:%M:%S UTC" UTC)

add_library(build_info INTERFACE)
target_compile_definitions(build_info INTERFACE
    GIT_HASH="${GIT_HASH}"
    COMPILE_TIME="${COMPILE_TIME}"
)

# OpenMP
find_package(OpenMP REQUIRED)

# Main executable
add_executable(fastscape_RB
    fastscape_rb.cpp
    CumulativeTimer.cpp
    random.cpp
)

target_link_libraries(fastscape_RB PRIVATE OpenMP::OpenMP_CXX build_info)

if(TESTS)
    add_subdirectory(tests)
endif()


// src/simulation/wasm.ts
import init, { Simulation, Params } from "./pkg/oxscape_wasm.js";

let initialized = false;

export async function initWasm() {
  if (!initialized) {
    await init(); // initializes wasm-bindgen
    initialized = true;
  }
}

// Global-ish simulation state
export interface Simulation {
  width: number;
  height: number;
  demF64: Float64Array; // original high-precision DEM
  demF32: Float32Array; // converted for WebGL
}

export function createSimulation(
  width: number,
  height: number,
  seed = 1234,
): Simulation {
  const demF64 = random_dem(width, height, seed);
  const demF32 = new Float32Array(demF64);

  return { width, height, demF64, demF32 };
}

import { ref, shallowRef } from "vue";
import type { Simulation } from "../simulation/pkg/oxscape_wasm.js";

const isPlaying = ref(false);
const isInitialized = ref(false);
const simulation = shallowRef<Simulation | null>(null);

// Event emitters for actions
const stepRequested = ref(0);
const resetRequested = ref(0);

export function useSimulation() {
  function play() {
    isPlaying.value = true;
  }

  function pause() {
    isPlaying.value = false;
  }

  function toggle() {
    isPlaying.value = !isPlaying.value;
  }

  function step() {
    stepRequested.value++;
  }

  function reset() {
    resetRequested.value++;
  }

  function setSimulation(sim: Simulation) {
    simulation.value = sim;
    isInitialized.value = true;
  }

  function clearSimulation() {
    simulation.value = null;
    isInitialized.value = false;
    isPlaying.value = false;
  }

  return {
    // State
    isPlaying,
    isInitialized,
    simulation,
    stepRequested,
    resetRequested,

    // Actions
    play,
    pause,
    toggle,
    step,
    reset,
    setSimulation,
    clearSimulation,
  };
}
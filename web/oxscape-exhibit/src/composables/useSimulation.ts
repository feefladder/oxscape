import { ref } from "vue";

const isPlaying = ref(true);
const isInitialized = ref(false);
const mFlow = ref(true);

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

  function switchMetric() {
    mFlow.value = !mFlow.value
  }

  return {
    // State
    isPlaying,
    isInitialized,
    mFlow,
    stepRequested,
    resetRequested,

    // Actions
    play,
    pause,
    toggle,
    step,
    reset,
    switchMetric,
  };
}
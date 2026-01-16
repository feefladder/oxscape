<script setup lang="ts">
import { useSimulation } from "../composables/useSimulation";

const { isPlaying, isInitialized, mFlow, toggle, step, reset, switchMetric } = useSimulation();
</script>

<template>
  <div class="controls">
    <button @click="toggle" :disabled="!isInitialized">
      {{ isPlaying ? "Pause" : "Play" }}
    </button>
    <button @click="step" :disabled="!isInitialized || isPlaying">
      Step
    </button>
    <button @click="reset" :disabled="!isInitialized">
      Reset
    </button>
    <button @click="switchMetric" :disabled="!isInitialized">
    {{ mFlow ? "Dinf" :"D8" }}
  </button>
  </div>
</template>

<style scoped>
.controls {
  padding: 8px;
  display: flex;
  gap: 8px;
  background: fixed;
}

button {
  padding: 6px 12px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
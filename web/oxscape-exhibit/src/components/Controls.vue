<script setup lang="ts">
import { ref } from "vue";

const playing = ref(false);

function toggle() {
  playing.value = !playing.value;
}
</script>

<template>
  <div class="controls">
    <button @click="toggle">
      {{ playing ? "Pause" : "Play" }}
    </button>
    <button>Step</button>
    <button>Reset</button>
  </div>
</template>

<style scoped>
.controls {
  padding: 8px;
  display: flex;
  gap: 8px;
  background: #181818;
}

button {
  padding: 6px 12px;
}
</style>

<script setup lang="ts">
import CanvasView from "./components/CanvasView.vue";
import Controls from "./components/Controls.vue";
</script>

<template>
  <div class="app">
    <CanvasView class="canvas" />
    <Controls class="controls" />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 1fr 80px; /* slimmer */
  grid-template-rows: 1fr auto;
  height: 100vh;
  min-height: 0;
}

.controls {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  border-top: 1px solid #333;
  z-index: 10;
}
</style>

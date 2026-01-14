<script setup lang="ts">
import { ref, computed } from "vue";

export type Stop = { t: number; color: string };

const stops = ref<Stop[]>([
  { t: 0.0, color: "#08306b" },
  { t: 0.2, color: "#2171b5" },
  { t: 0.4, color: "#41ab5d" },
  { t: 0.6, color: "#fee391" },
  { t: 0.75, color: "#a6611a" },
  { t: 1.0, color: "#ffffff" },
]);

const gradient = computed(
  () =>
    `linear-gradient(to top, ${stops.value
      .map((s) => `${s.color} ${s.t * 100}%`)
      .join(", ")})`,
);

function onDrag(e: MouseEvent, stop: Stop, index: number) {
  const ramp = (e.currentTarget as HTMLElement).parentElement!.querySelector(
    ".bar",
  ) as HTMLElement;
  const rect = ramp.getBoundingClientRect();

  const move = (ev: MouseEvent) => {
    const y = ev.clientY - rect.top;
    let t = 1 - y / rect.height;
    t = Math.max(0, Math.min(1, t));

    // Prevent crossing neighbors
    if (index > 0) t = Math.max(t, stops.value[index - 1].t + 0.01);
    if (index < stops.value.length - 1)
      t = Math.min(t, stops.value[index + 1].t - 0.01);

    stop.t = t;
  };

  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}
</script>

<template>
  <div class="ramp">
    <div class="bar" :style="{ background: gradient }" />

    <div
      v-for="(stop, index) in stops"
      :key="stop.t"
      class="handle"
      :style="{ bottom: `${stop.t * 100}%` }"
      @mousedown.prevent="(e) => onDrag(e, stop, index)"
    >
      <div class="square" :style="{ background: stop.color }">
        <input type="color" v-model="stop.color" class="picker" />
      </div>
      <div class="triangle" :style="{ borderLeftColor: stop.color }" />
    </div>
  </div>
</template>

<style scoped>
.ramp {
  position: relative;
  height: 100%;
  padding-left: 28px; /* space for handles */
}

.bar {
  position: absolute;
  left: 28px;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  border: 1px solid #444;
}

.handle {
  position: absolute;
  left: 0;
  transform: translateY(50%);
  display: flex;
  align-items: center;
  cursor: ns-resize;
}

.square {
  width: 14px;
  height: 14px;
  border: 1px solid #000;
  position: relative;
}

.triangle {
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 8px solid;
}

/* invisible but clickable color picker */
.picker {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
</style>

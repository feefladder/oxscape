<template>
  <div class="canvas-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as THREE from "three";
import init, { Simulation, Params } from "../simulation/pkg/oxscape_wasm.js";

const canvas = ref<HTMLCanvasElement | null>(null);
let sim: Simulation;

onMounted(async () => {
  await init();

  const width = canvas.value!.width; // small for demo, use canvas.width later
  const height = canvas.value!.height;

  sim = Simulation.random_dem(width, height, 42);
  sim.params.cell_area = 10000;

  // THREE.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(width / 2, height / 2, Math.max(width, height));
  camera.lookAt(width / 2, height / 2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value! });
  renderer.setSize(width, height);

  // Plane geometry matching the DEM
  const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);

  // Initial vertex heights from sim.dem
  const vertices = geometry.attributes.position!.array as Float32Array;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3 + 2; // z-axis
      vertices[idx] = sim.dem()[y * width + x]!; // initial height
    }
  }

  geometry.computeVertexNormals();

  // Simple color material
  const material = new THREE.MeshStandardMaterial({
    vertexColors: false,
    color: 0x88aa88,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // flip to horizontal plane
  scene.add(mesh);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 1, 1).normalize();
  scene.add(light);

  // Render loop
  function renderLoop() {
    sim.step(); // update the simulation

    // Update geometry vertices from sim.dem
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3 + 2;
        vertices[idx] = sim.dem()[y * width + x]!;
      }
    }
    geometry.attributes.position!.needsUpdate = true;
    geometry.computeVertexNormals();

    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
});
</script>


<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

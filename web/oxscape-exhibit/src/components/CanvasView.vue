<template>
  <div class="canvas-container" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import init, { Simulation, initThreadPool } from "../simulation/pkg/oxscape_wasm.js";
import { useSimulation } from "../composables/useSimulation.js";

const container = ref<HTMLDivElement | null>(null);

const {
  isPlaying,
  stepRequested,
  resetRequested,
  isInitialized,
} = useSimulation();

let sim: Simulation;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let terrain: THREE.Mesh;
let animationId: number;

function getTerrainColor(value: number): { r: number; g: number; b: number } {
  if (value < 0.2) {
    return { r: 0.0, g: value * 2.5, b: 0.5 - value };
  } else if (value < 0.5) {
    return { r: 0.2, g: 0.6, b: 0.1 };
  } else if (value < 0.8) {
    return { r: 0.5, g: 0.35, b: 0.2 };
  } else {
    const snow = (value - 0.8) * 5;
    return {
      r: 0.5 + snow * 0.5,
      g: 0.35 + snow * 0.65,
      b: 0.2 + snow * 0.8,
    };
  }
}

// Watch for step requests (manual stepping)
watch(stepRequested, () => {
  for (let i = 0; i < 10; i++) {
    console.log(i)
    sim.step();
  }
});

// Watch for reset requests
watch(resetRequested, () => {
  sim.random_dem(Math.floor(Math.random()*42))
});

function createTerrain(
  data: Float32Array,
  width: number,
  height: number,
  elevationScale: number = 50
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    width - 1,
    height - 1
  );
  const vertices = geometry.attributes.position!.array as Float32Array;

  // Find min/max for normalization
  let minElev = Infinity;
  let maxElev = -Infinity;
  for (let i = 0; i < data.length; i++) {
    minElev = Math.min(minElev, data[i]!);
    maxElev = Math.max(maxElev, data[i]!);
  }

  const colors = new Float32Array(data.length * 3);

  for (let i = 0; i < data.length; i++) {
    // Set elevation (Z) with scaling
    vertices[i * 3 + 2] = data[i]! * elevationScale;

    // Normalize elevation for color (0-1)
    const normalized = (data[i]! - minElev) / (maxElev - minElev);

    // Apply color gradient
    const color = getTerrainColor(normalized);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  return mesh;
}

function updateTerrain(data: Float32Array, elevationScale: number = 1): void {
  if (!terrain) return;

  const geometry = terrain.geometry as THREE.PlaneGeometry;
  const vertices = geometry.attributes.position!.array as Float32Array;
  const colors = geometry.attributes.color!.array as Float32Array;

  let minElev = Infinity;
  let maxElev = -Infinity;
  for (let i = 0; i < data.length; i++) {
    minElev = Math.min(minElev, data[i]!);
    maxElev = Math.max(maxElev, data[i]!);
  }

  for (let i = 0; i < data.length; i++) {
    vertices[i * 3 + 2] = data[i]! * elevationScale;

    const normalized = (data[i]! - minElev) / (maxElev - minElev);
    const color = getTerrainColor(normalized);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.attributes.position!.needsUpdate = true;
  geometry.attributes.color!.needsUpdate = true;
  geometry.computeVertexNormals();
}

onMounted(async () => {
  await init();

  // Thread pool initialization with the given number of threads
  // (pass `navigator.hardwareConcurrency` if you want to use all cores).
  await initThreadPool(navigator.hardwareConcurrency);

  const width = 250;
  const height = 250;

  sim = new Simulation(width, height, Math.floor(Math.random()*42));
  let params = sim.params;
  params.cell_area = 10000;
  params.ueq = 2e-5;
  sim.params = params;
  console.log(sim.width(), sim.height());

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 200, 0);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(100, 200, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Create initial terrain
  const data = new Float32Array(sim.dem());
  terrain = createTerrain(data, width, height, 50);
  scene.add(terrain);

  isInitialized.value = true

  // Handle window resize
  window.addEventListener("resize", onWindowResize);

  // Render loop
  function renderLoop() {
    if (isPlaying.value) {
      sim.step();
    }

    // Update terrain if DEM changes during simulation
    const newData = new Float32Array(sim.dem());
    updateTerrain(newData, 25);

    controls.update();
    renderer.render(scene, camera);

    animationId = requestAnimationFrame(renderLoop);
  }

  renderLoop();
});

function onWindowResize() {
  if (!container.value || !camera || !renderer) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  cancelAnimationFrame(animationId);

  // Cleanup Three.js resources
  if (terrain) {
    terrain.geometry.dispose();
    (terrain.material as THREE.Material).dispose();
  }
  if (renderer) {
    renderer.dispose();
  }
  if (controls) {
    controls.dispose();
  }
});
</script>

<style scoped>
.canvas-container {
  left: 0;
  top: 0;
  position: fixed;
  width: 100%;
  height: 80%;
  overflow: hidden;
}
</style>
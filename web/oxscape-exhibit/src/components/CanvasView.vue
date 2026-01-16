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
  mFlow,
} = useSimulation();

let sim: Simulation;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let terrain: THREE.Mesh;
let dem: Float32Array;
let animationId: number;
let threadsAreInitialized= false;

// Create the 1D gradient texture once (e.g., outside onMounted or in setup)
function createColorRampTexture() {
  const width = 256;
  const data = new Uint8Array(width * 4);

  // Define your color stops (from low to high)
  const colors = [
    { pos: 0.00, color: [5,  30,  90] },   // Deep ocean
    { pos: 0.05, color: [18,  60, 120] },  // Shallow water
    { pos: 0.12, color: [194, 178, 128] }, // Beach sand
    { pos: 0.20, color: [120, 180,  80] }, // Grass
    { pos: 0.45, color: [70,  120,  60] },  // Forest
    { pos: 0.60, color: [130, 110,  90] },  // Rock
    { pos: 0.80, color: [160, 160, 160] }, // Mountain
    { pos: 1.00, color: [255, 255, 255] }, // Snow
  ];

  // Fill the texture with interpolated colors
  for (let i = 0; i < width; i++) {
    const t = i / (width - 1);
    let r = 0, g = 0, b = 0;

    for (let j = 0; j < colors.length - 1; j++) {
      const c0 = colors[j];
      const c1 = colors[j + 1];
      if (t >= c0!.pos && t <= c1!.pos) {
        const localT = (t - c0!.pos) / (c1!.pos - c0!.pos);
        r = Math.round(c0!.color[0]! + localT * (c1!.color[0]! - c0!.color[0]!));
        g = Math.round(c0!.color[1]! + localT * (c1!.color[1]! - c0!.color[1]!));
        b = Math.round(c0!.color[2]! + localT * (c1!.color[2]! - c0!.color[2]!));
        break;
      }
    }

    const idx = i * 4;
    data[idx]     = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

// Create it once
const colorRampTexture = createColorRampTexture();

// Watch for step requests (manual stepping)
watch(stepRequested, () => {
    sim.step();

    // Update terrain if DEM changes during simulation
    updateTerrain()

    controls.update();
    renderer.render(scene, camera);

});

// Watch for reset requests
watch(resetRequested, () => {
  sim.random_dem(Math.floor(Math.random()*42))
  isPlaying.value = true
});

watch(mFlow, () => {
  sim.switch()
})

function updateTerrain(): void {
  dem.set(sim.dem())
  terrain.geometry.attributes.displacement!.needsUpdate = true;
}

onMounted(async () => {
  if (!threadsAreInitialized) {
    console.log("initializing")
    await init();
    // Thread pool initialization with the given number of threads
    // (pass `navigator.hardwareConcurrency` if you want to use all cores).
    await initThreadPool(Math.min(navigator.hardwareConcurrency, 8));
    threadsAreInitialized = true;
  }
  

  const width = 500;
  const height = width;

  sim = new Simulation(width, height, Math.floor(Math.random()*42));
  let params = sim.params;
  params.cell_area = 10000;
  params.ueq = 2e-6;
  sim.params = params;
  dem = new Float32Array(sim.dem());
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    width - 1,
    height - 1
  );
  geometry.setAttribute("displacement", new THREE.BufferAttribute(dem, 1));
  
  const material = new THREE.MeshPhysicalMaterial({
    reflectivity: 0.5,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.amplitude = {value:100.0};
    shader.uniforms.minHeight = {value:0.0};
    shader.uniforms.maxHeight = {value:1.0};
    shader.uniforms.colorRamp = { value: colorRampTexture };

    shader.vertexShader = `
      uniform float amplitude;
      uniform float minHeight;
      uniform float maxHeight;

      attribute float displacement;
      varying vec3 vWorldPosition;
      varying float vDisplacement;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        #include <begin_vertex>
        // Add displacement to vertex position

        transformed += position + amplitude * normal * vec3( displacement );
        vDisplacement = (displacement - minHeight) / (maxHeight - minHeight);
      `
    );
    // Compute world position for fragment shader normal calculation
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
        #include <project_vertex>
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    // === FRAGMENT SHADER ===
    shader.fragmentShader = `
      uniform sampler2D colorRamp;
      varying vec3 vWorldPosition;
      varying float vDisplacement;
    ` + shader.fragmentShader;

    // Recompute normals from screen-space derivatives
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      `
        #include <normal_fragment_begin>
        vec3 fdx = dFdx(vWorldPosition);
        vec3 fdy = dFdy(vWorldPosition);
        normal = normalize(cross(fdx, fdy));
      `
    );

    // Color ramp based on height
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
        #include <color_fragment>
        
        
        diffuseColor.rgb = texture2D(colorRamp, vec2(vDisplacement,0.5)).rgb;
      `
    );
  }

  terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  // terrain.castShadow = true;
  terrain.receiveShadow = true;

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
  scene.add(terrain);

  isInitialized.value = true

  // Handle window resize
  window.addEventListener("resize", onWindowResize);

  // Render loop
  function renderLoop() {
    if (isPlaying.value) {
      if (sim.step() < 0.01) {isPlaying.value = false};
      updateTerrain();
    }
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
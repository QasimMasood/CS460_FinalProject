// Solar System Final Project - Enhanced
// CS Graphics Project by Student A & Student B
// We improved the camera arc transition to smoothly end near each planet
// (while filling the screen appropriately for the planet's size).
// We also added more colorful lighting/textures to liven up the scene.

import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

// These are post-processing classes for bloom/glow effects
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Scene setup with perspective camera and WebGL renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(1400, 800, 1400);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// Basic lighting, plus some colored lights for more "spacey" vibes
// AmbientLight for a subtle overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// A slight purple directional light for cosmic atmosphere
const purpleLight = new THREE.DirectionalLight(0xcc99ff, 0.3);
purpleLight.position.set(-500, 300, 400);
scene.add(purpleLight);

// A bluish point light to add color from another angle
const bluePointLight = new THREE.PointLight(0x66ccff, 0.6, 3000);
bluePointLight.position.set(1000, 500, -600);
scene.add(bluePointLight);

// The main “Sunlight” near the origin
const sunPointLight = new THREE.PointLight(0xffffff, 2, 0);
sunPointLight.position.set(0, 0, 0);
scene.add(sunPointLight);

// Directional light that casts shadows
const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
mainDirectionalLight.position.set(200, 500, 300);
mainDirectionalLight.castShadow = true;
scene.add(mainDirectionalLight);

// Starry background using a huge sphere
const starTexture = new THREE.TextureLoader().load('./stars_background.jpg');
const starGeometry = new THREE.SphereGeometry(5000, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide,
});
const starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

// A swirling colorful galaxy overlay for extra color
const galaxyTexture = new THREE.TextureLoader().load('./galaxy_swirl.png');
const galaxyGeometry = new THREE.SphereGeometry(4900, 64, 64);
const galaxyMaterial = new THREE.MeshBasicMaterial({
  map: galaxyTexture,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.4, // made it a bit brighter
});
const galaxySwirl = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
scene.add(galaxySwirl);

// Nebula-like particle field for depth
const particleCount = 3000;
const positions = [];
for (let i = 0; i < particleCount; i++) {
  positions.push(THREE.MathUtils.randFloatSpread(6000));
  positions.push(THREE.MathUtils.randFloatSpread(6000));
  positions.push(THREE.MathUtils.randFloatSpread(6000));
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 3, // slightly bigger
  transparent: true,
  opacity: 0.75,
});
const nebulaParticles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(nebulaParticles);

// Twinkling stars for a cosmic sparkle
const twinkleCount = 800;
const twinklePositions = new Float32Array(twinkleCount * 3);
const twinklePhases = new Float32Array(twinkleCount);
for (let i = 0; i < twinkleCount; i++) {
  twinklePositions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(6000);
  twinklePositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(6000);
  twinklePositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(6000);
  twinklePhases[i] = Math.random() * Math.PI * 2;
}
const twinkleGeometry = new THREE.BufferGeometry();
twinkleGeometry.setAttribute('position', new THREE.BufferAttribute(twinklePositions, 3));
const twinkleMaterial = new THREE.PointsMaterial({
  color: 0xfffacd,
  size: 1.5,
  transparent: true,
  opacity: 1.0,
});
const twinkleStars = new THREE.Points(twinkleGeometry, twinkleMaterial);
scene.add(twinkleStars);

// Shooting stars that appear randomly
let shootingStars = [];
function createShootingStar() {
  const shootGeo = new THREE.SphereGeometry(2, 8, 8);
  const shootMat = new THREE.MeshBasicMaterial({ color: 0xffddcc });
  const shootingStarMesh = new THREE.Mesh(shootGeo, shootMat);
  shootingStarMesh.position.set(
    THREE.MathUtils.randFloatSpread(3000),
    1200 + Math.random() * 600,
    THREE.MathUtils.randFloatSpread(3000)
  );
  const velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.2,
    -0.5 - Math.random() * 0.5,
    (Math.random() - 0.5) * 0.2
  );
  scene.add(shootingStarMesh);
  shootingStars.push({ mesh: shootingStarMesh, velocity });
}

// Creating the sun with emissive material and a glow sprite
const sunTexture = new THREE.TextureLoader().load('./sun_texture.jpeg');
const sunGeometry = new THREE.SphereGeometry(120, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  emissive: 0xffd700,
  emissiveIntensity: 1.0,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.castShadow = false;
sun.userData.name = 'Sun';
scene.add(sun);

const sunGlowTexture = new THREE.TextureLoader().load('./glow_texture.png');
const sunGlowMaterial = new THREE.SpriteMaterial({
  map: sunGlowTexture,
  blending: THREE.AdditiveBlending,
  color: 0xffaa33,
  opacity: 0.6,
});
const sunGlow = new THREE.Sprite(sunGlowMaterial);
sunGlow.scale.set(600, 600, 1);
scene.add(sunGlow);

// Planet data, including size and orbit speeds
const planetsData = [
  { name: 'Mercury', texture: './mercury.webp',  size: 10, distance: 250,  baseOrbitSpeed: 0.01, rotationSpeed: 0.01 },
  { name: 'Venus',   texture: './venus.jpeg',    size: 16, distance: 350,  baseOrbitSpeed: 0.008, rotationSpeed: 0.005 },
  { name: 'Earth',   texture: './earth.jpeg',    size: 18, distance: 450,  baseOrbitSpeed: 0.007, rotationSpeed: 0.02 },
  { name: 'Mars',    texture: './mars.webp',     size: 12, distance: 550,  baseOrbitSpeed: 0.006, rotationSpeed: 0.015 },
  { name: 'Jupiter', texture: './jupiter.jpeg',  size: 40, distance: 750,  baseOrbitSpeed: 0.004, rotationSpeed: 0.03 },
  { name: 'Saturn',  texture: './saturn.jpeg',   size: 35, distance: 950,  baseOrbitSpeed: 0.003, rotationSpeed: 0.02, hasRings: true },
  { name: 'Uranus',  texture: './uranus.webp',   size: 24, distance: 1150, baseOrbitSpeed: 0.002, rotationSpeed: 0.01 },
  { name: 'Neptune', texture: './neptune.jpeg',  size: 22, distance: 1350, baseOrbitSpeed: 0.001, rotationSpeed: 0.01 },
];

const planetMeshes = [];
const orbitLines = [];
let speedScalingFactor = 1.0;

// Creating each planet and its orbit line
planetsData.forEach((pd) => {
  const tex = new THREE.TextureLoader().load(pd.texture);
  const geo = new THREE.SphereGeometry(pd.size, 64, 64);
  const mat = new THREE.MeshStandardMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    angle: Math.random() * Math.PI * 2,
    distance: pd.distance,
    orbitSpeed: pd.baseOrbitSpeed * speedScalingFactor,
    rotationSpeed: pd.rotationSpeed,
    isFocused: false,
    name: pd.name,
    planetSize: pd.size // store planet size for camera offset
  };

  mesh.position.set(
    pd.distance * Math.cos(mesh.userData.angle),
    0,
    pd.distance * Math.sin(mesh.userData.angle)
  );

  scene.add(mesh);
  planetMeshes.push(mesh);

  if (pd.hasRings) {
    const ringGeo = new THREE.RingGeometry(pd.size + 10, pd.size + 20, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringTex = new THREE.TextureLoader().load('./saturn_ring.png');
    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.castShadow = true;
    ringMesh.receiveShadow = true;
    mesh.add(ringMesh);
  }

  const orbitCurve = new THREE.EllipseCurve(0, 0, pd.distance, pd.distance);
  const orbitPts = orbitCurve.getPoints(128);
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const orbitMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
  const orbitLine = new THREE.Line(orbitGeo, orbitMat);
  orbitLine.rotation.x = Math.PI / 2;
  orbitLine.visible = false;
  scene.add(orbitLine);
  orbitLines.push(orbitLine);
});

// OrbitControls let us drag the scene around with the mouse
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
function enableOrbitControls(target) {
  if (controls) controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();
}

// Post-processing for bloom effect
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,
  0.4,
  0.85
);
composer.addPass(bloomPass);

// Switch View button to toggle between bird's-eye and angled
let isBirdsEyeView = false;
const switchViewBtn = document.createElement('button');
switchViewBtn.textContent = 'Switch View';
switchViewBtn.style.position = 'absolute';
switchViewBtn.style.top = '10px';
switchViewBtn.style.left = '10px';
document.body.appendChild(switchViewBtn);

switchViewBtn.addEventListener('click', () => {
  if (!isBirdsEyeView) {
    cameraFlyTo(new THREE.Vector3(0, 2000, 0), 2000);
    isBirdsEyeView = true;
  } else {
    cameraFlyTo(new THREE.Vector3(1400, 800, 1400), 1200);
    isBirdsEyeView = false;
  }
});

// Toggle Orbits button to show/hide orbit lines
const toggleOrbitsBtn = document.createElement('button');
toggleOrbitsBtn.textContent = 'Toggle Orbits';
toggleOrbitsBtn.style.position = 'absolute';
toggleOrbitsBtn.style.top = '50px';
toggleOrbitsBtn.style.left = '10px';
document.body.appendChild(toggleOrbitsBtn);

toggleOrbitsBtn.addEventListener('click', () => {
  orbitLines.forEach((line) => {
    line.visible = !line.visible;
  });
});

// Orbit Speed slider to change how fast planets move
const sliderContainer = document.createElement('div');
sliderContainer.style.position = 'absolute';
sliderContainer.style.top = '90px';
sliderContainer.style.left = '10px';
sliderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
sliderContainer.style.color = 'white';
sliderContainer.style.padding = '10px';
sliderContainer.style.borderRadius = '5px';
document.body.appendChild(sliderContainer);

const sliderLabel = document.createElement('label');
sliderLabel.textContent = 'Orbit Speed: ';
sliderLabel.style.marginRight = '10px';
sliderContainer.appendChild(sliderLabel);

const speedSlider = document.createElement('input');
speedSlider.type = 'range';
speedSlider.min = '0.1';
speedSlider.max = '5';
speedSlider.step = '0.1';
speedSlider.value = '1';
speedSlider.style.width = '150px';
sliderContainer.appendChild(speedSlider);

speedSlider.addEventListener('input', () => {
  speedScalingFactor = parseFloat(speedSlider.value);
  planetMeshes.forEach((m, i) => {
    m.userData.orbitSpeed = planetsData[i].baseOrbitSpeed * speedScalingFactor;
  });
});

// Back button to unlock from any focused planet
const backButton = document.createElement('button');
backButton.textContent = 'Back';
backButton.style.position = 'absolute';
backButton.style.top = '130px';
backButton.style.left = '10px';
document.body.appendChild(backButton);

backButton.addEventListener('click', () => {
  planetMeshes.forEach((m) => (m.userData.isFocused = false));
  cameraFlyTo(new THREE.Vector3(0, 2000, 0), 1500);
  isBirdsEyeView = true;
});

// Raycasting for clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    // focus on the clicked planet
    const targetPlanet = intersects[0].object;
    planetMeshes.forEach((m) => (m.userData.isFocused = false));
    targetPlanet.userData.isFocused = true;

    // we'll do the arc transition, but also factor in planet size
    const planetSize = targetPlanet.userData.planetSize || 10;
    // multiply the offset so bigger planets fill the screen better
    const finalOffset = new THREE.Vector3(0, planetSize * 5, planetSize * 8);
    arcCameraTransition(camera.position.clone(), targetPlanet.position.clone().add(finalOffset), targetPlanet.position);
  }
});

// Arc-based camera movement with a smoother finish
function arcCameraTransition(startPos, endPos, lookTarget) {
  const duration = 2500; // extended duration for smoother motion
  const arcHeight = 700; // a bit bigger arc
  const startTime = performance.now();

  // midpoint above the start & end
  const midPos = new THREE.Vector3(
    (startPos.x + endPos.x) / 2,
    Math.max(startPos.y, endPos.y) + arcHeight,
    (startPos.z + endPos.z) / 2
  );

  function updateArc() {
    const now = performance.now();
    const elapsed = now - startTime;
    let t = elapsed / duration;
    if (t > 1) t = 1;
    
    // Using a Quadratic Bezier approach
    const oneMinusT = 1 - t;
    const cameraPos = new THREE.Vector3()
      .addScaledVector(startPos, oneMinusT * oneMinusT)
      .addScaledVector(midPos, 2 * oneMinusT * t)
      .addScaledVector(endPos, t * t);

    camera.position.copy(cameraPos);

    // For an even smoother finish, let's ease the lookAt during the final portion
    // We'll interpolate the lookAt position as well
    const lookInterp = new THREE.Vector3().copy(lookTarget).multiplyScalar(t).addScaledVector(new THREE.Vector3(0,0,0), 1 - t);
    camera.lookAt(lookInterp);

    if (t < 1) {
      requestAnimationFrame(updateArc);
    } else {
      enableOrbitControls(lookTarget);
    }
  }

  updateArc();
}

// Camera fly function for toggling views
function cameraFlyTo(targetVec3, duration = 1500) {
  const startPos = camera.position.clone();
  const startTime = performance.now();

  function update() {
    const elapsed = performance.now() - startTime;
    let t = elapsed / duration;
    if (t > 1) t = 1;

    camera.position.lerpVectors(startPos, targetVec3, t);
    camera.lookAt(0, 0, 0);

    if (t < 1) {
      requestAnimationFrame(update);
    } else {
      enableOrbitControls(new THREE.Vector3(0, 0, 0));
    }
  }
  update();
}

// Simple tooltip for showing planet names on hover
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '6px 10px';
tooltip.style.borderRadius = '4px';
tooltip.style.backgroundColor = 'rgba(0,0,0,0.7)';
tooltip.style.color = '#fff';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const objectsToIntersect = [...planetMeshes, sun];
  const intersects = raycaster.intersectObjects(objectsToIntersect);

  if (intersects.length > 0) {
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
    tooltip.innerHTML = intersects[0].object.userData.name || 'Unknown';
  } else {
    tooltip.style.display = 'none';
  }
});

// Main animation loop
let lastShootingStarTime = 0;
function animate(time) {
  requestAnimationFrame(animate);

  // Rotate backgrounds slightly
  starField.rotation.y += 0.00005;
  galaxySwirl.rotation.y -= 0.00002;
  nebulaParticles.rotation.y += 0.00002;

  // Twinkle effect
  for (let i = 0; i < twinkleCount; i++) {
    const phase = time * 0.001 + twinklePhases[i];
    const alpha = (Math.sin(phase) + 1) / 2;
    const adjustedAlpha = 0.3 + alpha * 0.7;
    twinkleMaterial.opacity = adjustedAlpha;
  }

  // Shooting stars
  if (time - lastShootingStarTime > 10000 + Math.random() * 5000) {
    createShootingStar();
    lastShootingStarTime = time;
  }
  shootingStars.forEach((s, index) => {
    s.mesh.position.add(s.velocity);
    s.mesh.material.opacity -= 0.001;
    if (s.mesh.position.y < -1000 || s.mesh.material.opacity <= 0) {
      scene.remove(s.mesh);
      shootingStars.splice(index, 1);
    }
  });

  // Slow rotation of the sun
  sun.rotation.y += 0.001;

  // Planet orbits and rotations
  planetMeshes.forEach((m) => {
    m.rotation.y += m.userData.rotationSpeed;
    if (!m.userData.isFocused) {
      m.userData.angle += m.userData.orbitSpeed;
      m.position.x = m.userData.distance * Math.cos(m.userData.angle);
      m.position.z = m.userData.distance * Math.sin(m.userData.angle);
    }
  });

  controls.update();
  composer.render();
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});


import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
renderer.setSize(window.innerWidth, window.innerHeight);

// Append the WebGL canvas to the #container div
const container = document.getElementById('container');
container.appendChild(renderer.domElement);

// Load textures
const textureLoader = new THREE.TextureLoader();

const sunTexture = textureLoader.load('./sun_texture.jpeg');
const mercuryTexture = textureLoader.load('./mercury.webp');
const venusTexture = textureLoader.load('./venus.jpeg');
const earthTexture = textureLoader.load('./earth.jpeg');
const marsTexture = textureLoader.load('./mars.webp');
const jupiterTexture = textureLoader.load('./jupiter.jpeg');
const saturnTexture = textureLoader.load('./saturn.jpeg');
const uranusTexture = textureLoader.load('./uranus.webp');
const neptuneTexture = textureLoader.load('./neptune.jpeg');

// Add the Sun
const sunGeometry = new THREE.SphereGeometry(100, 32, 32); // Sun diameter scaled to 100 units
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Set initial camera position for bird's-eye view
camera.position.set(0, 1200, 0); // Set camera above the solar system to ensure visibility
camera.lookAt(0, 0, 0);
let isBirdsEyeView = true; // Start in bird's-eye view

// Add planets with realistic scaled sizes, distances, orbit speeds, and rotation speeds
let speedScalingFactor = 1; // Initial speed multiplier

const planets = [
  { name: 'Mercury', texture: mercuryTexture, size: 1.7, distance: 120, baseOrbitSpeed: 0.0019, rotationSpeed: 0.0007 },
  { name: 'Venus', texture: venusTexture, size: 4.3, distance: 160, baseOrbitSpeed: 0.0012, rotationSpeed: -0.00004 },
  { name: 'Earth', texture: earthTexture, size: 4.6, distance: 200, baseOrbitSpeed: 0.001, rotationSpeed: 0.0417 },
  { name: 'Mars', texture: marsTexture, size: 2.4, distance: 260, baseOrbitSpeed: 0.0008, rotationSpeed: 0.0409 },
  { name: 'Jupiter', texture: jupiterTexture, size: 50, distance: 400, baseOrbitSpeed: 0.0004, rotationSpeed: 0.4100 },
  { name: 'Saturn', texture: saturnTexture, size: 42, distance: 500, baseOrbitSpeed: 0.0003, rotationSpeed: 0.444 },
  { name: 'Uranus', texture: uranusTexture, size: 17, distance: 700, baseOrbitSpeed: 0.0002, rotationSpeed: -0.718 },
  { name: 'Neptune', texture: neptuneTexture, size: 16.5, distance: 900, baseOrbitSpeed: 0.0001, rotationSpeed: 0.671 },
];

// Store planet objects and orbit lines
const planetMeshes = [];
const orbitLines = [];

// Create planets and add to the scene
planets.forEach((planet) => {
  const planetGeometry = new THREE.SphereGeometry(planet.size, 32, 32); // Scaled size
  const planetMaterial = new THREE.MeshBasicMaterial({ map: planet.texture });
  const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  planetMesh.userData = {
    angle: Math.random() * Math.PI * 2, // Start at a random angle (0 to 2π)
    distance: planet.distance,
    orbitSpeed: planet.baseOrbitSpeed * speedScalingFactor,
    rotationSpeed: planet.rotationSpeed,
  };
  planetMesh.position.x = planet.distance * Math.cos(planetMesh.userData.angle); // Set initial position
  planetMesh.position.z = planet.distance * Math.sin(planetMesh.userData.angle); // Set initial position
  scene.add(planetMesh);
  planetMeshes.push(planetMesh);

  // Create orbit lines
  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(planet.distance * Math.cos(theta), 0, planet.distance * Math.sin(theta)));
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  orbitLine.visible = false; // Start with orbit lines hidden
  scene.add(orbitLine);
  orbitLines.push(orbitLine);
});

// Add a button to switch views
const button = document.createElement('button');
button.textContent = 'Switch View';
button.style.position = 'absolute';
button.style.top = '10px';
button.style.left = '10px';
document.body.appendChild(button);

// Add event listener for the button
button.addEventListener('click', () => {
  if (isBirdsEyeView) {
    // Normal view
    camera.position.set(0, 0, 200); // Reset to normal view
    camera.lookAt(0, 0, 0);
    isBirdsEyeView = false;
  } else {
    // Bird's-eye view
    camera.position.set(0, 1200, 0); // Move camera above the solar system
    camera.lookAt(0, 0, 0); // Point camera to the origin
    isBirdsEyeView = true;
  }
});

// Add a button to toggle orbit lines
const orbitButton = document.createElement('button');
orbitButton.textContent = 'Toggle Orbits';
orbitButton.style.position = 'absolute';
orbitButton.style.top = '50px'; // Positioned below the switch view button
orbitButton.style.left = '10px';
document.body.appendChild(orbitButton);

// Add event listener for the orbit button
orbitButton.addEventListener('click', () => {
  orbitLines.forEach((orbit) => {
    orbit.visible = !orbit.visible; // Toggle visibility
  });
});

// Add a slider below the "Toggle Orbits" button
const sliderContainer = document.createElement('div');
sliderContainer.style.position = 'absolute';
sliderContainer.style.top = '90px'; // Positioned below the orbit button
sliderContainer.style.left = '10px';
sliderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
sliderContainer.style.color = 'white';
sliderContainer.style.padding = '10px';
sliderContainer.style.borderRadius = '5px';
document.body.appendChild(sliderContainer);

const sliderLabel = document.createElement('label');
sliderLabel.textContent = 'Orbit Speed:';
sliderLabel.style.marginRight = '10px';
sliderContainer.appendChild(sliderLabel);

const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0.1';
slider.max = '5';
slider.step = '0.1';
slider.value = speedScalingFactor.toString();
slider.style.width = '150px';
sliderContainer.appendChild(slider);

// Event listener for slider to adjust speed scaling factor dynamically
slider.addEventListener('input', () => {
  speedScalingFactor = parseFloat(slider.value);
  planetMeshes.forEach((planet, index) => {
    planet.userData.orbitSpeed = planets[index].baseOrbitSpeed * speedScalingFactor;
  });
});

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add event listener for mouse click
window.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersected by the raycaster
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const targetPlanet = intersects[0].object;
    smoothCameraTransition(targetPlanet.position);
  }
});

// Function to smoothly transition the camera to a target position
function smoothCameraTransition(targetPosition) {
  const startPosition = new THREE.Vector3().copy(camera.position);
  const endPosition = new THREE.Vector3().copy(targetPosition).add(new THREE.Vector3(0, 50, 100)); // Offset to view the planet

  const duration = 2000; // Duration of the transition in milliseconds
  const startTime = performance.now();

  function update() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);

    // Interpolate between the start and end positions
    camera.position.lerpVectors(startPosition, endPosition, t);
    camera.lookAt(targetPosition);

    if (t < 1) {
      requestAnimationFrame(update);
    } else {
      enableOrbitControls(targetPosition);
    }
  }

  update();
}

// Enable OrbitControls to allow dragging around the planet
let controls;
function enableOrbitControls(targetPosition) {
  if (controls) {
    controls.dispose();
  }
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(targetPosition);
  controls.update();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the Sun
  sun.rotation.y += 0.005;

  // Update planet positions
  planetMeshes.forEach((planet) => {
    planet.userData.angle += planet.userData.orbitSpeed; // Adjust orbit speed
    planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
    planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);

    // Rotate planets on their axis
    planet.rotation.y += planet.userData.rotationSpeed;
  });

  renderer.render(scene, camera);
}

animate();


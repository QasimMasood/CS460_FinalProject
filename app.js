<<<<<<< HEAD
import * as THREE from './node_modules/three/build/three.module.js';
=======
// Importing Three.js
import * as THREE from 'three';
>>>>>>> 6b4e2f9e8802c18039e77a8265f9ad95d0524603

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
renderer.setSize(window.innerWidth, window.innerHeight);

<<<<<<< HEAD
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
=======
// Adding a cube for testing
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera
camera.position.z = 5;
>>>>>>> 6b4e2f9e8802c18039e77a8265f9ad95d0524603

// Animation loop
function animate() {
  requestAnimationFrame(animate);
<<<<<<< HEAD

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

=======
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
>>>>>>> 6b4e2f9e8802c18039e77a8265f9ad95d0524603
  renderer.render(scene, camera);
}

animate();
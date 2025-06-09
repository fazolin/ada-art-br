import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("background-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// Esfera central
const centerGeometry = new THREE.IcosahedronGeometry(2.5, 1);
const centerMaterial = new THREE.MeshBasicMaterial({
  color: 0xaaaaaa,
  wireframe: true,
});
const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
scene.add(centerSphere);

// Planetas e órbitas
const planetCount = 12;
const planets = [];
for (let i = 0; i < planetCount; i++) {
  const radius = 5 + i * 2.5;
  const speed = 0.001 + Math.random() * 0.001;
  const angle = Math.random() * Math.PI * 2;

  const geometry = new THREE.IcosahedronGeometry(0.5 + Math.random(), 1);
  const gray = Math.random() * 0.8 + 0.2;
  const color = new THREE.Color(gray, gray, gray);
  const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
  const planet = new THREE.Mesh(geometry, material);

  planet.userData = { radius, angle, speed };
  scene.add(planet);
  planets.push(planet);

  // Linha da órbita
  const orbitPoints = [];
  for (let j = 0; j <= 64; j++) {
    const theta = (j / 64) * Math.PI * 2;
    orbitPoints.push(
      new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    );
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
}

// Fundo de estrelas
const starCount = 1000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 200;
  const y = (Math.random() - 0.5) * 200;
  const z = (Math.random() - 0.5) * 200;
  starPositions.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0x888888,
  size: 0.5,
  sizeAttenuation: true,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Animação
function animate() {
  requestAnimationFrame(animate);

  // Suave interpolação da câmera em resposta ao mouse
  const targetX = mouseX * 5;
  const targetY = 15 + mouseY * 5;
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  centerSphere.rotation.y += 0.002;

  planets.forEach((planet) => {
    planet.userData.angle += planet.userData.speed;
    const a = planet.userData.angle;
    const r = planet.userData.radius;
    planet.position.x = Math.cos(a) * r;
    planet.position.z = Math.sin(a) * r;
    planet.rotation.x += 0.01;
    planet.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer;
let sun;
const planetsArray = []; // To store planet meshes and their orbital data
let clock; // To manage animation timing
let controls; // To manage camera controls

// Planet data: { name, radius, color, orbitalRadius, orbitalSpeed }
const planetsData = [
    { name: "Mercury", radius: 0.8, color: 0x8c8c8c, orbitalRadius: 18, orbitalSpeed: 1.0 },
    { name: "Venus",   radius: 1.8, color: 0xe6e6e6, orbitalRadius: 25, orbitalSpeed: 0.75 },
    { name: "Earth",   radius: 2,   color: 0x0077ff, orbitalRadius: 35, orbitalSpeed: 0.5 },
    { name: "Mars",    radius: 1.5, color: 0xff5733, orbitalRadius: 50, orbitalSpeed: 0.35 },
    { name: "Jupiter", radius: 5,   color: 0xffc87c, orbitalRadius: 80, orbitalSpeed: 0.2 },
    { name: "Saturn",  radius: 4.5, color: 0xf0e68c, orbitalRadius: 115, orbitalSpeed: 0.15 },
    { name: "Uranus",  radius: 3,   color: 0x7fdbff, orbitalRadius: 145, orbitalSpeed: 0.1 },
    { name: "Neptune", radius: 2.8, color: 0x0050ff, orbitalRadius: 175, orbitalSpeed: 0.07 }
];

function init() {
    // Clock
    clock = new THREE.Clock();

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;   // How far you can zoom in
    controls.maxDistance = 500; // How far you can zoom out
    // controls.maxPolarAngle = Math.PI / 2; // Prevents camera from going below the ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 1000); // Acts as sunlight
    pointLight.position.set(0, 0, 0); // Positioned at the center (where the sun will be)
    scene.add(pointLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(10, 32, 32); // Radius 10
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: false }); // Yellow, ensure wireframe is off if not intended
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    planetsData.forEach(data => {
        const planetGeometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ color: data.color, wireframe: false });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

        // Initial position (along the x-axis for simplicity)
        planetMesh.position.x = data.orbitalRadius;

        scene.add(planetMesh);
        planetsArray.push({ 
            mesh: planetMesh, 
            orbitalRadius: data.orbitalRadius, 
            orbitalSpeed: data.orbitalSpeed 
        });
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    // Animate planets
    planetsArray.forEach(planetData => {
        planetData.mesh.position.x = planetData.orbitalRadius * Math.cos(elapsedTime * planetData.orbitalSpeed);
        planetData.mesh.position.z = planetData.orbitalRadius * Math.sin(elapsedTime * planetData.orbitalSpeed);
        // Planets orbit on the XZ plane (y=0 relative to the sun)
    });

    renderer.render(scene, camera);
}

init(); 
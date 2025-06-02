import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const textureLoader = new THREE.TextureLoader(); // Instantiate TextureLoader

let scene, camera, renderer;
let sun;
const planetsArray = []; // To store planet meshes and their orbital data
let clock; // To manage animation timing
let controls; // To manage camera controls

// Planet data: { name, radius, color, orbitalRadius, orbitalSpeed, textureFile }
const planetsData = [
    { name: "Mercury", radius: 1.6, color: 0x8c8c8c, orbitalRadius: 18, orbitalSpeed: 1.0, textureFile: 'images/2k_mercury.jpg' },
    { name: "Venus",   radius: 3.6, color: 0xe6e6e6, orbitalRadius: 25, orbitalSpeed: 0.75, textureFile: 'images/2k_venus_surface.jpg' },
    { name: "Earth",   radius: 4,   color: 0x0077ff, orbitalRadius: 35, orbitalSpeed: 0.5, textureFile: 'images/2k_earth_daymap.jpg' },
    { name: "Mars",    radius: 3,   color: 0xff5733, orbitalRadius: 50, orbitalSpeed: 0.35, textureFile: 'images/2k_mars.jpg' },
    { name: "Jupiter", radius: 10,  color: 0xffc87c, orbitalRadius: 80, orbitalSpeed: 0.2, textureFile: 'images/2k_jupiter.jpg' },
    { name: "Saturn",  radius: 9,   color: 0xf0e68c, orbitalRadius: 115, orbitalSpeed: 0.15, textureFile: 'images/2k_saturn.jpg' },
    { name: "Uranus",  radius: 6,   color: 0x7fdbff, orbitalRadius: 145, orbitalSpeed: 0.1, textureFile: 'images/2k_uranus.jpg' },
    { name: "Neptune", radius: 5.6, color: 0x0050ff, orbitalRadius: 175, orbitalSpeed: 0.07, textureFile: 'images/2k_neptune.jpg' }
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
    const sunTexture = textureLoader.load('images/2k_sun.jpg');
    const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); // Use map for Sun with MeshBasicMaterial
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    planetsData.forEach(data => {
        const planetTexture = textureLoader.load(data.textureFile);
        const planetGeometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

        // Initial position (along the x-axis for simplicity)
        planetMesh.position.x = data.orbitalRadius;

        // Add visual orbit line
        const orbitGeometry = new THREE.RingGeometry(data.orbitalRadius - 0.2, data.orbitalRadius + 0.2, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitLine.rotation.x = Math.PI / 2; // Rotate to be in the XZ plane
        scene.add(orbitLine); // Add orbit line to the scene

        const planetEntry = {
            mesh: planetMesh,
            name: data.name, // Store name for identification
            orbitalRadius: data.orbitalRadius,
            orbitalSpeed: data.orbitalSpeed
        };

        // Add Moon to Earth
        if (data.name === "Earth") {
            const moonTexture = textureLoader.load('images/2k_moon.jpg');
            const moonGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Moon radius 0.5
            const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            
            const moonOrbitRadius = data.radius + 2; // Orbit 2 units above Earth's surface
            moonMesh.position.x = moonOrbitRadius; // Initial position relative to Earth
            planetMesh.add(moonMesh); // Add moon as a child of Earth

            planetEntry.moon = {
                mesh: moonMesh,
                orbitalRadius: moonOrbitRadius,
                orbitalSpeed: 2.0 // Moon orbits Earth faster
            };
        }

        // Add Rings to Saturn
        if (data.name === "Saturn") {
            const ringTexture = textureLoader.load('images/2k_saturn_ring_alpha.png');
            const innerRingRadius = data.radius + 0.5;
            const outerRingRadius = data.radius + 4;
            const ringGeometry = new THREE.RingGeometry(innerRingRadius, outerRingRadius, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                alphaTest: 0.1 // Adjust if necessary for better transparency rendering
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = Math.PI / 2.3; // Tilt the rings
            // ringMesh.rotation.y = 0.1; // Optional small rotation for aesthetics
            planetMesh.add(ringMesh); // Add rings as a child of Saturn
        }

        scene.add(planetMesh);
        planetsArray.push(planetEntry);
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
        
        // Animate Moon if it exists
        if (planetData.moon) {
            const moonObj = planetData.moon;
            moonObj.mesh.position.x = moonObj.orbitalRadius * Math.cos(elapsedTime * moonObj.orbitalSpeed);
            moonObj.mesh.position.z = moonObj.orbitalRadius * Math.sin(elapsedTime * moonObj.orbitalSpeed);
            // Moon orbits in Earth's local XZ plane
        }
    });

    renderer.render(scene, camera);
}

init(); 
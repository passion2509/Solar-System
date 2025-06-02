import * as THREE from 'three';

let scene, camera, renderer;
let sun;
const planetsArray = []; // To store planet meshes and their orbital data
let clock; // To manage animation timing

// Planet data: { name, radius, color, orbitalRadius, orbitalSpeed }
const planetsData = [
    { name: "Earth", radius: 2, color: 0x0077ff, orbitalRadius: 30, orbitalSpeed: 0.5 },
    { name: "Mars", radius: 1.5, color: 0xff5733, orbitalRadius: 45, orbitalSpeed: 0.35 },
    { name: "Jupiter", radius: 5, color: 0xffc87c, orbitalRadius: 70, orbitalSpeed: 0.2 }
];

function init() {
    // Clock
    clock = new THREE.Clock();

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

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

    // Animate planets
    planetsArray.forEach(planetData => {
        planetData.mesh.position.x = planetData.orbitalRadius * Math.cos(elapsedTime * planetData.orbitalSpeed);
        planetData.mesh.position.z = planetData.orbitalRadius * Math.sin(elapsedTime * planetData.orbitalSpeed);
        // Planets orbit on the XZ plane (y=0 relative to the sun)
    });

    renderer.render(scene, camera);
}

init(); 
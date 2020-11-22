import * as THREE from './lib/three/build/three.module.js';
import { FlyControls } from './lib/three/examples/jsm/controls/FlyControls.js';
import { Sky } from './lib/three/examples/jsm/objects/Sky.js';
import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from './lib/three/examples/jsm/postprocessing/BokehPass.js';

let camera, scene, renderer,
    geom, material, mesh, material2, mesh2,
    clock, controls,  composer,
    sun, sky;

const init = () => {
    // Create a clock to track a delta between requestAnimationFrame
    // Is used to keep the FlyControls animation is smooth
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);
    camera.position.set(0, 4.5, 0);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    // Add bloom and bokeh post processing to give it an etherial feel
    composer = new EffectComposer(renderer);
    composer.addPass( new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0;
    composer.addPass(bloomPass);

    const bokehPass = new BokehPass(scene, camera, {
        focus: 3.0,
        aperture: 0.0009,
        maxblur: 0.009,
        width: window.innerWidth,
        height: window.innerHeight
    });
    composer.addPass(bokehPass);

    controls = new FlyControls(camera, document.body);
    controls.movementSpeed = 2;
    controls.rollSpeed = Math.PI / 14;
    controls.autoForward = false;
    controls.dragToLook = true;

    initSky();

    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    loader.load('./data.bin', (d) => {
        const data = new Uint16Array(d);
        geom = new THREE.PlaneGeometry(60, 60, 199, 199);
        for (let i = 0, l = geom.vertices.length; i < l; i++) {
            geom.vertices[i].z = data[i] / 65535 * 5;
        }

        // Create a duplicate mesh that sits below that is all black so you can't see through the wire mesh.
        // This is really inefficient and clunky and would be much beter in a shder
        material = new THREE.MeshBasicMaterial({ color: 0xEA16D9, wireframe: true });
        material2 = new THREE.MeshBasicMaterial({ color: 0x000000 });
        mesh = new THREE.Mesh(geom, material);
        mesh2 = new THREE.Mesh(geom, material2);
        mesh.rotation.x = Math.PI / 2 * -1;
        mesh2.rotation.x = Math.PI / 2 * -1;
        mesh2.position.y = -0.01;
        scene.add(mesh);
        scene.add(mesh2);
    });

    document.body.append(renderer.domElement);
}

function initSky () {

    // The magic numbers below are set through trial and error
    // untill I achieved the effect I wanted
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    const inclination = 0.5074;
    const azimuth = 0.25;
    const uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = 10;
    uniforms[ "rayleigh" ].value = 2;
    uniforms[ "mieCoefficient" ].value = 0.1;
    uniforms[ "mieDirectionalG" ].value = 0.941;
    const theta = Math.PI * (inclination - 0.5);
    const phi = 2 * Math.PI * (azimuth - 0.5);

    sun.x = Math.cos( phi );
    sun.y = Math.sin( phi ) * Math.sin(theta);
    sun.z = Math.sin( phi ) * Math.cos(theta);

    uniforms[ "sunPosition" ].value.copy(sun);
    renderer.toneMappingExposure = 0.8
}


function animate () {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    controls.update(delta);
    composer.render(scene, camera);
}

init();
animate();

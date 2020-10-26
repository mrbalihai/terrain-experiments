'use strict';

import * as THREE from './node_modules/three/build/three.module.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { FlyControls } from './node_modules/three/examples/jsm/controls/FlyControls.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { BokehPass } from './node_modules/three/examples/jsm/postprocessing/BokehPass.js';

import { RGBShiftShader } from './node_modules/three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from './node_modules/three/examples/jsm/shaders/DotScreenShader.js';


let camera, scene, renderer, geom, material, mesh, clock, controls;
let material2, mesh2;
let composer;

let sun, sky;

const init = () => {
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);
    camera.position.set(0, 4.5, 0);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
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

    document.body.append(renderer.domElement);

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

}

function initSky() {

    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    sun = new THREE.Vector3();

    var effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.1,
        mieDirectionalG: 0.941,
        inclination: 0.5074, // elevation / inclination
        azimuth: 0.25, // Facing front,
        exposure: 0.8
    };

    function guiChanged() {
        var uniforms = sky.material.uniforms;
        uniforms[ "turbidity" ].value = effectController.turbidity;
        uniforms[ "rayleigh" ].value = effectController.rayleigh;
        uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
        uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sun.x = Math.cos( phi );
        sun.y = Math.sin( phi ) * Math.sin( theta );
        sun.z = Math.sin( phi ) * Math.cos( theta );

        uniforms[ "sunPosition" ].value.copy( sun );

        renderer.toneMappingExposure = effectController.exposure;
    }
    //var gui = new GUI();

    //gui.add( effectController, "turbidity", 0.0, 20.0, 0.1 ).onChange( guiChanged );
    //gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
    //gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
    //gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
    //gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
    //gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
    //gui.add( effectController, "exposure", 0, 1, 0.0001 ).onChange( guiChanged );

    guiChanged();
}


function animate() {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    controls.update(delta);
    composer.render(scene, camera);
}

init();
animate();

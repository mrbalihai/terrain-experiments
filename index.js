'use strict';

import * as THREE from './lib/three/build/three.module.js';
import { GUI } from './lib/three/examples/jsm/libs/dat.gui.module.js';
import { FlyControls } from './lib/three/examples/jsm/controls/FlyControls.js';
import { Sky } from './lib/three/examples/jsm/objects/Sky.js';
import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './lib/three/examples/jsm/postprocessing/ShaderPass.js';
import { BokehPass } from './lib/three/examples/jsm/postprocessing/BokehPass.js';

import { RGBShiftShader } from './lib/three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from './lib/three/examples/jsm/shaders/DotScreenShader.js';

let camera, scene, renderer, clock, controls, composer;

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

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    document.body.append(renderer.domElement); 
    controls = new FlyControls(camera, document.body);
    controls.movementSpeed = 2;
    controls.rollSpeed = Math.PI / 14;
    controls.autoForward = false;
    controls.dragToLook = true;

    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    loader.load('./data.bin', (d) => {
        const data = new Uint16Array(d);
        const geom = new THREE.PlaneGeometry(60, 60, 199, 199);
        for (let i = 0, l = geom.vertices.length; i < l; i++) {
            geom.vertices[i].z = data[i] / 65535 * 5;
        }
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xEA16D9, wireframe: true });
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const meshWire = new THREE.Mesh(geom, wireMat);
        const meshBlack = new THREE.Mesh(geom, blackMat);
        meshWire.rotation.x = Math.PI / 2 * -1;
        meshBlack.rotation.x = Math.PI / 2 * -1;
        meshBlack.position.y = -0.01;
        scene.add(meshWire);
        scene.add(meshBlack);
    });
}


function animate() {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    controls.update(delta);
    composer.render(scene, camera);
}

init();
animate();

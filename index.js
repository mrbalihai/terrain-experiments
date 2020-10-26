'use strict';
const THREE = require('three');
require('three-fly-controls')(THREE);
let camera, scene, renderer, geom, material, mesh, clock, controls;
let material2, mesh2;

const init = () => {
    clock = new THREE.Clock();

    Object.assign(document.body.style, { margin: 0, overflow: 'hidden' });
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.lookAt(0, 0.1, 0);
    camera.position.set(6, 6, 6);
    scene = new THREE.Scene();

    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(renderer.domElement);
    controls = new THREE.FlyControls(camera, document.body);
    controls.movementSpeed = 2;
    controls.rollSpeed = Math.PI / 14;
    controls.autoForward = false;
    controls.dragToLook = true;


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
        mesh2.position.z = -0.01;
        scene.add(mesh);
        scene.add(mesh2);
    });

}

function animate() {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    controls.update(delta);
    renderer.render(scene, camera);
}

init();
animate();

'use strict';
const THREE = require('three');
require('three-fly-controls')(THREE);
let camera, scene, renderer, geom, material, mesh;

const init = () => {

    Object.assign(document.body.style, { margin: 0, overflow: 'hidden' });
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    camera.lookAt(0, 0.1, 0);
    camera.position.set(6, 6, 6);
    scene = new THREE.Scene();

    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    loader.load('./data.bin', (d) => {
        const data = new Uint16Array(d);
        geom = new THREE.PlaneGeometry(60, 60, 199, 199);
        for (let i = 0, l = geom.vertices.length; i < l; i++) {
            geom.vertices[i].z = data[i] / 65535 * 5;
            console.log(geom.vertices[i].z)
        }
        material = new THREE.MeshBasicMaterial({color: 0xEA16D9, wireframe: true });
        mesh = new THREE.Mesh(geom, material);
        scene.add(mesh);
    });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    THREE.FlyControls(camera, renderer.domElement);

    document.body.append(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

init();
animate();

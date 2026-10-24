import * as THREE from 'three';

const canvas = document.querySelector('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xded8ca);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xded8ca);
scene.fog = new THREE.Fog(0xded8ca, 24, 48);
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
const cameraTarget = new THREE.Vector3();
let orbitAngle = Math.PI * .24;
let orbitDistance = 27;
let orbitHeight = 19;
let targetDistance = orbitDistance;

scene.add(new THREE.HemisphereLight(0xfff7df, 0x73877c, 2.3));
const sun = new THREE.DirectionalLight(0xfff5dc, 3.6);
sun.position.set(-12, 22, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
sun.shadow.camera.right = sun.shadow.camera.top = 22;
sun.shadow.bias = -.0005;
scene.add(sun);

const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: .88, ...options });
const M = {
  grass: material(0xaec9a9), grassDark: material(0x668d72), road: material(0x6f7975), path: material(0xeadfcf),
  white: material(0xf8f3e9), dark: material(0x2f403e), green: material(0x286a60), mint: material(0xaacfc2),
  orange: material(0xdc704d), yellow: material(0xe9c45f), blue: material(0x7899ad), wood: material(0xa87952),
  glass: material(0x9bcbd0, { roughness: .25, metalness: .05, transparent: true, opacity: .72 }), skin: material(0xc98765)
};

const world = new THREE.Group();
scene.add(world);
const clickable = [];
const anchors = {};

function box(w, h, d, mat, x = 0, y = h / 2, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function cylinder(rt, rb, h, mat, x = 0, y = h / 2, z = 0, sides = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function stopMesh(mesh, stop) { mesh.userData.stop = stop; clickable.push(mesh); return mesh; }

world.add(box(36, .8, 22, M.grass, 0, -.4, 0), box(38, .32, 2.8, M.road, 0, .16, 0), box(3, .34, 24, M.road, 0, .18, 0));
for (let x = -17; x <= 17; x += 2) world.add(box(.85, .025, .08, M.white, x, .34, 0));
for (let z = -10; z <= 10; z += 2) world.add(box(.08, .025, .85, M.white, 0, .36, z));

function tree(x, z, scale = 1) {
  const group = new THREE.Group();
  group.add(cylinder(.16, .22, 1.35 * scale, M.wood, 0, .68 * scale, 0, 8));
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.85 * scale, 1), M.grassDark);
  crown.position.y = 1.75 * scale; crown.castShadow = true; group.add(crown);
  group.position.set(x, .25, z); world.add(group);
}

function planter(x, z) {
  const group = new THREE.Group(); group.add(cylinder(.38, .5, .55, M.orange, 0, .28, 0, 8));
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.18, .8, 7), M.grassDark);
    leaf.position.set(Math.cos(i * 1.57) * .17, .95, Math.sin(i * 1.57) * .17); leaf.rotation.z = Math.cos(i * 1.57) * .35; leaf.castShadow = true; group.add(leaf);
  }
  group.position.set(x, .25, z); world.add(group);
}

function officeBuilding(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(box(5.1, .35, 4.2, M.path, 0, .18, 0), 'about'), stopMesh(box(5.1, 2.5, .28, M.mint, 0, 1.4, -1.95), 'about'), stopMesh(box(.28, 2.5, 4.2, M.mint, -2.41, 1.4, 0), 'about'));
  for (let i = -1; i <= 1; i++) group.add(box(1.02, 1.2, .05, M.glass, i * 1.38, 1.55, -2.12));
  group.add(box(2.45, .17, .9, M.wood, .35, 1.03, -.45), box(.12, .85, .12, M.dark, -.7, .58, -.45), box(.12, .85, .12, M.dark, 1.4, .58, -.45));
  group.add(box(.95, .65, .08, M.dark, .35, 1.55, -.43), box(.75, .45, .04, M.glass, .35, 1.56, -.37), box(.85, .68, .85, M.blue, .4, .6, .9), box(1.3, .08, 2.7, M.orange, 1.55, .43, .8));
  group.position.set(x, .22, z); world.add(group); anchors.about = new THREE.Vector3(x, 3.2, z);
}

function cafe(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(cylinder(2.65, 2.85, .45, M.path, 0, .22, 0, 16), 'skills'), stopMesh(cylinder(2.3, 2.3, 2.25, M.yellow, 0, 1.35, 0, 16), 'skills'));
  const roof = stopMesh(new THREE.Mesh(new THREE.ConeGeometry(2.65, .85, 16), M.orange), 'skills'); roof.position.y = 2.9; roof.castShadow = true; group.add(roof);
  group.add(box(.72, 1.25, .08, M.green, 0, .85, 2.32), box(.7, .7, .08, M.glass, -1.25, 1.55, 2.31), box(.7, .7, .08, M.glass, 1.25, 1.55, 2.31), cylinder(.28, .22, .46, M.white, 0, 3.35, 0, 16));
  group.position.set(x, .22, z); world.add(group); anchors.skills = new THREE.Vector3(x, 3.8, z);
}

function projectLab(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(box(5.5, .4, 4.4, M.path, 0, .2, 0), 'projects'), stopMesh(box(5.5, 1.1, .3, M.blue, 0, .75, -2.05), 'projects'), stopMesh(box(.3, 2.5, 4.4, M.blue, -2.6, 1.3, 0), 'projects'), stopMesh(box(3.6, 1.35, .22, M.green, .65, 1.82, -1.95), 'projects'));
  for (let i = 0; i < 3; i++) group.add(box(1.25, .12, .75, M.wood, -1 + i * 1.45, .92, .45), box(.55, .4, .04, i === 1 ? M.orange : M.dark, -1 + i * 1.45, 1.25, .45));
  group.add(box(3.3, .08, 1.2, M.mint, .2, .45, 1.2)); group.position.set(x, .22, z); world.add(group); anchors.projects = new THREE.Vector3(x, 3.3, z);
}

function signalTower(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(cylinder(1.85, 2.2, .5, M.path, 0, .25, 0, 12), 'contact'), stopMesh(cylinder(1.1, 1.55, 4.3, M.orange, 0, 2.55, 0, 10), 'contact'));
  for (let y = 1.2; y < 4.2; y += 1) for (let i = 0; i < 5; i++) { const win = box(.34, .45, .035, M.glass, Math.sin(i * 1.25) * 1.05, y, Math.cos(i * 1.25) * 1.05); win.lookAt(0, y, 0); group.add(win); }
  group.add(cylinder(.09, .09, 1.5, M.dark, 0, 5.55, 0, 8));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.48, .07, 8, 20), M.yellow); ring.position.y = 5.85; ring.rotation.x = Math.PI / 2; group.add(ring);
  group.position.set(x, .22, z); world.add(group); anchors.contact = new THREE.Vector3(x, 5.3, z);
}

function careerTower(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(box(4.2, .4, 4, M.path, 0, .2, 0), 'experience'));
  for (let floor = 0; floor < 5; floor++) {
    const width = 3.25 - floor * .18;
    group.add(stopMesh(box(width, .72, 2.7, floor % 2 ? M.green : M.mint, 0, .78 + floor * .73, 0), 'experience'));
    group.add(box(width * .72, .27, .04, M.glass, 0, .82 + floor * .73, 1.37));
  }
  group.add(box(.16, 1.25, .16, M.orange, 0, 4.6, 0));
  group.position.set(x, .22, z); world.add(group); anchors.experience = new THREE.Vector3(x, 4.8, z);
}

function academy(x, z) {
  const group = new THREE.Group();
  group.add(stopMesh(box(5, .42, 3.8, M.path, 0, .21, 0), 'education'), stopMesh(box(4.5, 1.8, 3.2, M.white, 0, 1.12, 0), 'education'));
  for (const px of [-1.55, -.52, .52, 1.55]) group.add(cylinder(.14, .18, 1.7, M.blue, px, 1.15, 1.72, 10));
  const roof = stopMesh(new THREE.Mesh(new THREE.ConeGeometry(3.15, 1.15, 4), M.blue), 'education'); roof.position.y = 2.62; roof.rotation.y = Math.PI / 4; group.add(roof);
  group.add(box(.65, 1.15, .06, M.wood, 0, .86, 1.63));
  group.position.set(x, .22, z); world.add(group); anchors.education = new THREE.Vector3(x, 3.7, z);
}

officeBuilding(-6.4, 4.6); cafe(6, 5.1); projectLab(-6.1, -4.5); signalTower(6.3, -4.5); careerTower(-12.3, -4.6); academy(12.3, 4.8); anchors.home = new THREE.Vector3(0, 1.6, 0);
for (const [x, z, scale] of [[-16,-8,1.05],[-15,8,.9],[15,8,1.1],[16,-8,.95],[-3,8,.75],[3,-8,.8]]) tree(x, z, scale);
for (const [x, z] of [[-2.2,-2.2],[2.2,2.2],[-2.2,2.2],[2.2,-2.2]]) planter(x, z);

function bench(x, z, rotation = 0) { const group = new THREE.Group(); group.add(box(1.5,.14,.5,M.wood,0,.65,0),box(.12,.58,.12,M.dark,-.55,.3,0),box(.12,.58,.12,M.dark,.55,.3,0)); group.position.set(x,.25,z); group.rotation.y=rotation; world.add(group); }
bench(-3,-1.8); bench(3,1.8,Math.PI);

function car(x, z, color) { const group = new THREE.Group(); group.add(box(1.55,.42,.9,color,0,.5,0),box(.82,.42,.72,M.glass,-.08,.84,0)); for(const dz of[-.42,.42])for(const dx of[-.52,.52]){const wheel=cylinder(.16,.16,.12,M.dark,dx,.33,dz,12);wheel.rotation.x=Math.PI/2;group.add(wheel)} group.position.set(x,.25,z);world.add(group); }
car(-6.8,0,M.yellow); car(5.5,0,M.mint);

const avatar = new THREE.Group();
avatar.add(cylinder(.26,.3,.75,M.green,0,1.25,0,12),cylinder(.29,.29,.48,M.skin,0,1.95,0,16));
const hair = new THREE.Mesh(new THREE.SphereGeometry(.31,14,8,0,Math.PI*2,0,Math.PI/2),M.dark); hair.position.y=2.18; hair.castShadow=true; avatar.add(hair);
const armL=box(.12,.65,.12,M.skin,-.34,1.33,0),armR=box(.12,.65,.12,M.skin,.34,1.33,0),legL=box(.15,.68,.16,M.dark,-.16,.62,0),legR=box(.15,.68,.16,M.dark,.16,.62,0); avatar.add(armL,armR,legL,legR); avatar.position.set(0,.25,0); world.add(avatar);

let avatarDestination = avatar.position.clone(), activeStop = 'home', moving = false, walkTime = 0;
const speech = document.querySelector('[data-speech]');
const speeches = {home:'Welcome to my engineering journey!',about:'Ownership turned curiosity into leadership.',skills:'These tools power production systems.',experience:'From intern to Senior Software Engineer II.',projects:'Systems built for real scale.',education:'Where the foundation was built.',contact:'Let’s create something reliable together!'};

function navigate(stop) {
  if (!anchors[stop]) return;
  activeStop = stop; avatarDestination.copy(anchors[stop]).setY(.25); moving = avatar.position.distanceTo(avatarDestination) > .2;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.stop === stop));
  document.querySelectorAll('.panel-view').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === stop));
  document.querySelector('.portfolio-panel').classList.add('open'); speech.replaceChildren(speeches[stop], Object.assign(document.createElement('span'), {}));
}

document.querySelectorAll('[data-stop]').forEach(control => control.addEventListener('click', () => navigate(control.dataset.stop)));
document.querySelector('.panel-close').addEventListener('click', () => document.querySelector('.portfolio-panel').classList.remove('open'));
const helpDialog = document.querySelector('.help-dialog');
document.querySelector('.help-toggle').addEventListener('click', () => helpDialog.showModal());
document.querySelector('.help-close').addEventListener('click', () => helpDialog.close());

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let dragging = false, pointerStart = {x:0,y:0}, lastPointer = {x:0,y:0};
canvas.addEventListener('pointerdown', event => { dragging=false; pointerStart=lastPointer={x:event.clientX,y:event.clientY}; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', event => { if(!canvas.hasPointerCapture(event.pointerId))return; const dx=event.clientX-lastPointer.x; if(Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6)dragging=true; if(dragging){orbitAngle-=dx*.006;canvas.classList.add('dragging')} lastPointer={x:event.clientX,y:event.clientY}; });
canvas.addEventListener('pointerup', event => { canvas.releasePointerCapture(event.pointerId);canvas.classList.remove('dragging');if(dragging)return;pointer.x=event.clientX/innerWidth*2-1;pointer.y=-(event.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,false)[0];if(hit?.object.userData.stop)navigate(hit.object.userData.stop); });
canvas.addEventListener('wheel',event=>{targetDistance=THREE.MathUtils.clamp(targetDistance+event.deltaY*.012,15,34)},{passive:true});

function projectToScreen(position, element) { const projected=position.clone().project(camera);element.style.opacity=projected.z<1?'1':'0';element.style.left=`${(projected.x*.5+.5)*innerWidth}px`;element.style.top=`${(-projected.y*.5+.5)*innerHeight}px`; }
const timer = new THREE.Timer();
timer.connect(document);
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function animate(timestamp){
  requestAnimationFrame(animate); timer.update(timestamp); const dt=Math.min(timer.getDelta(),.05);
  if(moving){const direction=avatarDestination.clone().sub(avatar.position),distance=direction.length();if(distance<.12){avatar.position.copy(avatarDestination);moving=false;legL.rotation.x=legR.rotation.x=armL.rotation.x=armR.rotation.x=0}else{direction.normalize();avatar.position.addScaledVector(direction,Math.min(dt*3.4,distance));avatar.rotation.y=Math.atan2(direction.x,direction.z);walkTime+=dt*10;const swing=Math.sin(walkTime)*.65;legL.rotation.x=swing;legR.rotation.x=-swing;armL.rotation.x=-swing;armR.rotation.x=swing}}
  cameraTarget.lerp(moving?avatar.position:anchors[activeStop],1-Math.pow(.001,dt));orbitDistance+=(targetDistance-orbitDistance)*(1-Math.pow(.002,dt));
  const desired=new THREE.Vector3(Math.sin(orbitAngle)*orbitDistance,orbitHeight,Math.cos(orbitAngle)*orbitDistance).add(cameraTarget);camera.position.lerp(desired,1-Math.pow(.0005,dt));camera.lookAt(cameraTarget);
  document.querySelectorAll('[data-label]').forEach(label=>projectToScreen(anchors[label.dataset.label],label));projectToScreen(avatar.position.clone().add(new THREE.Vector3(0,2.7,0)),speech);renderer.render(scene,camera);
}
addEventListener('resize',resize);addEventListener('pagehide',()=>timer.dispose(),{once:true});resize();navigate('home');requestAnimationFrame(animate);requestAnimationFrame(()=>setTimeout(()=>document.querySelector('.loading-screen').classList.add('hidden'),500));

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = matchMedia('(max-width: 700px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);

function rendererFor(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: !lowPower, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}
function resize(renderer, camera, canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}
function loopWhenVisible(canvas, renderer, camera, scene, update = () => {}) {
  let active = true;
  const observer = new IntersectionObserver(entries => active = entries[0]?.isIntersecting ?? true, { rootMargin: '200px' });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', () => active = !document.hidden);
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!active) return;
    resize(renderer, camera, canvas);
    const dt = Math.min(clock.getDelta(), .034);
    update(dt, clock.elapsedTime);
    renderer.render(scene, camera);
  }
  frame();
}
function roundedBox(w, h, d, radius = .12) {
  return new THREE.BoxGeometry(w, h, d, 4, 4, 4).translate(0, 0, 0);
}
function addPalm(scene, x, z, scale = 1) {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7e4b2e, roughness: .9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x0d6b4e, roughness: .75, side: THREE.DoubleSide });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.08 * scale, .16 * scale, 3.7 * scale, 9), trunkMat);
  trunk.rotation.z = -.12; trunk.position.y = 1.8 * scale; group.add(trunk);
  const crown = new THREE.Group(); crown.position.set(-.22 * scale, 3.6 * scale, 0);
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.CapsuleGeometry(.11 * scale, 1.55 * scale, 4, 8), leafMat);
    leaf.rotation.z = Math.PI / 2.25; leaf.rotation.y = i * Math.PI / 4; leaf.position.set(Math.cos(i * Math.PI / 4) * .65 * scale, 0, Math.sin(i * Math.PI / 4) * .65 * scale); crown.add(leaf);
  }
  group.add(crown); group.position.set(x, 0, z); scene.add(group); return group;
}

function initHero() {
  const canvas = document.querySelector('#hero-canvas');
  if (!canvas) return;
  const renderer = rendererFor(canvas, true);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x062d29, .045);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(8.5, 5.2, 10.7); camera.lookAt(0, 1.8, 0);
  scene.add(new THREE.HemisphereLight(0xffd7a0, 0x092722, 3.1));
  const sun = new THREE.DirectionalLight(0xffb36a, 4.2); sun.position.set(-4, 8, 7); scene.add(sun);
  const accent = new THREE.PointLight(0xff6b4a, 13, 14); accent.position.set(2, 3, 3); scene.add(accent);

  const oceanMat = new THREE.MeshPhysicalMaterial({ color: 0x075a5e, roughness: .18, metalness: .1, transmission: .08, transparent: true, opacity: .8 });
  const oceanGeo = new THREE.PlaneGeometry(45, 45, 50, 50); oceanGeo.rotateX(-Math.PI / 2);
  const ocean = new THREE.Mesh(oceanGeo, oceanMat); ocean.position.y = -.35; scene.add(ocean);
  const originalOcean = oceanGeo.attributes.position.array.slice();

  const deck = new THREE.Mesh(new THREE.BoxGeometry(12, .35, 8), new THREE.MeshStandardMaterial({ color: 0x6b3b24, roughness: .88 }));
  deck.position.y = 0; scene.add(deck);
  for (let i = -5; i <= 5; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(.03, .01, 7.8), new THREE.MeshBasicMaterial({ color: 0x2e1a12 })); seam.position.set(i + .5, .19, 0); scene.add(seam);
  }
  const building = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9d3a7, roughness: .8 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a1c14, roughness: .72 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.25, 2.6), wallMat); wall.position.set(0, 1.85, -1.55); building.add(wall);
  const opening = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.55, .12), new THREE.MeshStandardMaterial({ color: 0x071c19, roughness: .5 })); opening.position.set(0, 2, -.18); building.add(opening);
  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, .35, 1), woodMat); counter.position.set(0, 1.1, .15); building.add(counter);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.3, 1.25, 4), new THREE.MeshStandardMaterial({ color: 0x77402c, roughness: .86 })); roof.rotation.y = Math.PI / 4; roof.position.set(0, 4.05, -1.55); roof.scale.z = .7; building.add(roof);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(3.6, .72, .16), new THREE.MeshStandardMaterial({ color: 0x082f2a, emissive: 0x06352f, emissiveIntensity: .7 })); sign.position.set(0, 3.45, -.12); building.add(sign);
  scene.add(building);
  for (let i = -2; i <= 2; i++) {
    const stool = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, 1, 8), woodMat); post.position.y = .68; stool.add(post);
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .13, 16), new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: .6 })); seat.position.y = 1.18; stool.add(seat);
    stool.position.set(i * 1.05, .18, .88); scene.add(stool);
  }
  const palms = [addPalm(scene, -5, -2.8, .86), addPalm(scene, 4.7, -2.2, 1), addPalm(scene, 5.1, 2.3, .78)];
  const bulbs = [];
  for (let i = 0; i < 13; i++) {
    const x = -5.2 + i * .86; const y = 4.2 + Math.sin(i / 12 * Math.PI) * .7;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd889 })); bulb.position.set(x, y, 1.5); scene.add(bulb); bulbs.push(bulb);
  }
  const sunset = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffaa4e })); sunset.position.set(-7, 4.4, -8); scene.add(sunset);
  const pointer = new THREE.Vector2();
  canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) / r.width - .5; pointer.y = (e.clientY - r.top) / r.height - .5; });
  loopWhenVisible(canvas, renderer, camera, scene, (_, time) => {
    const arr = oceanGeo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) arr[i + 1] = originalOcean[i + 1] + Math.sin(originalOcean[i] * .45 + time) * .08 + Math.cos(originalOcean[i + 2] * .52 + time * .8) * .06;
    oceanGeo.attributes.position.needsUpdate = true;
    bulbs.forEach((bulb, i) => bulb.scale.setScalar(1 + Math.sin(time * 2 + i) * .12));
    if (!reduceMotion) { camera.position.x += ((8.5 + pointer.x * 1.2) - camera.position.x) * .025; camera.position.y += ((5.2 - pointer.y * .55) - camera.position.y) * .025; camera.lookAt(0, 1.8, 0); palms.forEach((p, i) => p.rotation.z = Math.sin(time * .38 + i) * .012); }
  });
}

function initCocktail() {
  const canvas = document.querySelector('#cocktail-canvas'); if (!canvas) return;
  const renderer = rendererFor(canvas, true); const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50); camera.position.set(5, 3.5, 7); camera.lookAt(0, 1.3, 0);
  scene.add(new THREE.HemisphereLight(0xffdfb1, 0x072621, 2.7)); const key = new THREE.PointLight(0xff7b50, 18, 15); key.position.set(3, 4, 3); scene.add(key);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(8, 1.1, 3.4), new THREE.MeshStandardMaterial({ color: 0x381d17, roughness: .68 })); bar.position.y = -.55; scene.add(bar);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x5f321e, roughness: .75 });
  for (let y = .6; y <= 2.8; y += 1.1) { const shelf = new THREE.Mesh(new THREE.BoxGeometry(6.5, .14, .55), shelfMat); shelf.position.set(0, y, -2.2); scene.add(shelf); }
  const bottleColors = [0x0d8a65,0xb85d27,0xd0a03e,0x5d4aa5,0x2f73a4,0x8e2d37];
  for (let i = 0; i < 18; i++) { const bottle = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.72,12), new THREE.MeshPhysicalMaterial({ color:bottleColors[i%bottleColors.length],roughness:.22,transmission:.12,transparent:true,opacity:.88 })); body.position.y=.35; bottle.add(body); const neck=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.28,10),body.material); neck.position.y=.83;bottle.add(neck); bottle.position.set(-2.7+(i%6)*1.08,.75+Math.floor(i/6)*1.1,-2.05); scene.add(bottle); }
  const glass = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.72,.48,1.65,32,1,true), new THREE.MeshPhysicalMaterial({ color:0xffffff,roughness:.05,transmission:.9,transparent:true,opacity:.32,side:THREE.DoubleSide })); bowl.position.y=1.25; glass.add(bowl);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.66,.44,1.25,32), new THREE.MeshPhysicalMaterial({ color:0xff7950,roughness:.14,transmission:.08,transparent:true,opacity:.84 })); liquid.position.y=1.08; glass.add(liquid);
  const iceMat = new THREE.MeshPhysicalMaterial({color:0xdff8ff,roughness:.08,transmission:.75,transparent:true,opacity:.55});
  for(let i=0;i<5;i++){const ice=new THREE.Mesh(new THREE.BoxGeometry(.35,.35,.35),iceMat);ice.position.set((Math.random()-.5)*.55,1.25+Math.random()*.5,(Math.random()-.5)*.4);ice.rotation.set(Math.random(),Math.random(),Math.random());glass.add(ice)}
  const garnish = new THREE.Mesh(new THREE.TorusGeometry(.3,.08,10,24,Math.PI*1.55),new THREE.MeshStandardMaterial({color:0xffc13c,roughness:.55})); garnish.position.set(.55,2.02,0); garnish.rotation.x=Math.PI/2;glass.add(garnish);
  glass.position.y=.1;scene.add(glass);
  const pointer=new THREE.Vector2(); canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5});
  loopWhenVisible(canvas,renderer,camera,scene,(_,time)=>{glass.rotation.y += reduceMotion?0:.005;glass.position.y=.1+Math.sin(time*1.2)*.04;camera.position.x+=(5+pointer.x*.8-camera.position.x)*.03;camera.position.y+=(3.5-pointer.y*.4-camera.position.y)*.03;camera.lookAt(0,1.25,0)});
}

function initBilliards() {
  const canvas = document.querySelector('#billiards-canvas'); if (!canvas) return;
  canvas.style.touchAction='none'; canvas.style.userSelect='none';
  const renderer=rendererFor(canvas,true);const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,1,.1,50);camera.position.set(0,7.4,8.6);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xffe8c4,0x061c19,2.5));const light=new THREE.DirectionalLight(0xffffff,3.8);light.position.set(1,8,5);scene.add(light);
  const wood=new THREE.MeshStandardMaterial({color:0x4b251b,roughness:.55});const felt=new THREE.MeshStandardMaterial({color:0x0b6c59,roughness:.76});
  const base=new THREE.Mesh(new THREE.BoxGeometry(8.6,.65,5.1),wood);base.position.y=-.5;scene.add(base);const surface=new THREE.Mesh(new THREE.BoxGeometry(7.6,.16,4.1),felt);surface.position.y=-.08;scene.add(surface);
  const rails=[[0,0,2.25,8.6,.42,.42],[0,0,-2.25,8.6,.42,.42],[-4.05,0,0,.42,.42,4.1],[4.05,0,0,.42,.42,4.1]];rails.forEach(([x,y,z,w,h,d])=>{const rail=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);rail.position.set(x,.18,z);scene.add(rail)});
  const pocketPositions=[[-3.78,-1.98],[0,-2.05],[3.78,-1.98],[-3.78,1.98],[0,2.05],[3.78,1.98]];pocketPositions.forEach(([x,z])=>{const pocket=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.22,24),new THREE.MeshStandardMaterial({color:0x050707,roughness:1}));pocket.position.set(x,.04,z);scene.add(pocket)});
  for(const x of [-3.5,3.5])for(const z of [-1.7,1.7]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.48,2,.48),wood);leg.position.set(x,-1.65,z);scene.add(leg)}
  const colors=[0xf3c43c,0x2e61b8,0xd94231,0x66369a,0xf28b27,0x1b8a4b,0x8d2c24,0x222222,0xf3c43c,0x2e61b8,0xd94231,0x66369a,0xf28b27,0x1b8a4b,0x8d2c24];
  const balls=[];const ballGeo=new THREE.SphereGeometry(.18,20,20);
  function addBall(x,z,color,cue=false){const ball=new THREE.Mesh(ballGeo,new THREE.MeshPhysicalMaterial({color,roughness:.18,clearcoat:1}));ball.position.set(x,.18,z);ball.userData={velocity:new THREE.Vector2(),cue,pocketed:false};scene.add(ball);balls.push(ball);return ball}
  const cue=addBall(2.55,0,0xffffff,true);let idx=0;for(let row=0;row<5;row++)for(let j=0;j<=row;j++){addBall(-1.8-row*.34,(j-row/2)*.39,colors[idx++%colors.length])}
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let dragStart=null;
  function pointFromEvent(e){const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(pointer,camera);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);const point=new THREE.Vector3();raycaster.ray.intersectPlane(plane,point);return point}
  canvas.addEventListener('pointerdown',e=>{dragStart=pointFromEvent(e);canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',e=>{if(!dragStart)return;const end=pointFromEvent(e);const force=new THREE.Vector2(dragStart.x-end.x,dragStart.z-end.z);if(force.length()>.08&&!cue.userData.pocketed)cue.userData.velocity.add(force.multiplyScalar(2.3).clampLength(0,6));dragStart=null});
  function resetCue(){cue.userData.pocketed=false;cue.visible=true;cue.position.set(2.55,.18,0);cue.userData.velocity.set(0,0)}
  function resetRack(){balls.filter(b=>!b.userData.cue).forEach((b,i)=>{let n=0,row=0;while(n+row+1<=i){n+=++row}const j=i-n;b.visible=true;b.userData.pocketed=false;b.userData.velocity.set(0,0);b.position.set(-1.8-row*.34,(j-row/2)*.39,.18)});resetCue()}
  document.querySelector('[data-billiards-reset]')?.addEventListener('click',resetRack);
  loopWhenVisible(canvas,renderer,camera,scene,(dt)=>{for(const ball of balls){if(ball.userData.pocketed)continue;ball.position.x+=ball.userData.velocity.x*dt;ball.position.z+=ball.userData.velocity.y*dt;ball.userData.velocity.multiplyScalar(Math.pow(.984,dt*60));if(Math.abs(ball.userData.velocity.x)<.006)ball.userData.velocity.x=0;if(Math.abs(ball.userData.velocity.y)<.006)ball.userData.velocity.y=0;if(Math.abs(ball.position.x)>3.62){ball.position.x=Math.sign(ball.position.x)*3.62;ball.userData.velocity.x*=-.82}if(Math.abs(ball.position.z)>1.84){ball.position.z=Math.sign(ball.position.z)*1.84;ball.userData.velocity.y*=-.82}for(const [x,z] of pocketPositions){if(Math.hypot(ball.position.x-x,ball.position.z-z)<.34){ball.userData.pocketed=true;ball.userData.velocity.set(0,0);ball.visible=false;if(ball.userData.cue)setTimeout(resetCue,900);break}}}for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];if(a.userData.pocketed||b.userData.pocketed)continue;const dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,dist=Math.hypot(dx,dz);if(dist>0&&dist<.36){const nx=dx/dist,nz=dz/dist,overlap=.36-dist;a.position.x-=nx*overlap/2;a.position.z-=nz*overlap/2;b.position.x+=nx*overlap/2;b.position.z+=nz*overlap/2;const rel=(b.userData.velocity.x-a.userData.velocity.x)*nx+(b.userData.velocity.y-a.userData.velocity.y)*nz;if(rel<0){const impulse=-rel*.95;a.userData.velocity.x-=impulse*nx;a.userData.velocity.y-=impulse*nz;b.userData.velocity.x+=impulse*nx;b.userData.velocity.y+=impulse*nz}}}});
}

function startScenes(){try{initHero();initCocktail();initBilliards()}catch(error){console.warn('Three.js enhancement unavailable',error)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startScenes,{once:true});else startScenes();

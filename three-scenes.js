import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const safeDpr = Math.min(window.devicePixelRatio || 1, 1.65);

function observeVisibility(element, callback) {
  let visible = true;
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
    callback(visible);
  }, { rootMargin: "150px" });
  observer.observe(element);
  return () => visible;
}

function createRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(safeDpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  return renderer;
}

function initHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const renderer = createRenderer(canvas, true);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x031f1c, 0.08);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0.3, 1.15, 7.4);

  const root = new THREE.Group();
  root.position.set(2.7, 0.25, -0.4);
  scene.add(root);

  const ambient = new THREE.HemisphereLight(0xffd28e, 0x06352f, 1.25);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xff8a62, 4.5);
  key.position.set(4, 4, 4);
  scene.add(key);
  const fill = new THREE.PointLight(0x21c5ae, 4.4, 18);
  fill.position.set(-3, 1, 2);
  scene.add(fill);

  const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffb13b, emissive: 0xff5d2f, emissiveIntensity: 2.8, roughness: 0.28, metalness: 0.05 });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.15, 64, 64), sunMaterial);
  sun.position.set(1.7, 1.05, -1.4);
  root.add(sun);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.53, 40, 40),
    new THREE.MeshBasicMaterial({ color: 0xff8b43, transparent: true, opacity: 0.1, side: THREE.BackSide })
  );
  glow.position.copy(sun.position);
  root.add(glow);

  const rings = new THREE.Group();
  const ringColors = [0xf7bb38, 0xff6948, 0x1cc2ad];
  [1.65, 2.25, 2.85].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.018 + index * 0.006, 10, 160),
      new THREE.MeshBasicMaterial({ color: ringColors[index], transparent: true, opacity: 0.34 - index * 0.06 })
    );
    ring.position.copy(sun.position);
    ring.rotation.set(Math.PI / 2.4 + index * 0.18, index * 0.35, index * 0.24);
    rings.add(ring);
  });
  root.add(rings);

  const waterGeometry = new THREE.PlaneGeometry(24, 20, 110, 90);
  const waterMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uCoral: { value: new THREE.Color(0xff6948) },
      uLagoon: { value: new THREE.Color(0x0a7166) },
      uDark: { value: new THREE.Color(0x021b18) },
    },
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 p = position;
        float wave = sin(p.x * 1.25 + uTime * 0.75) * 0.11;
        wave += cos(p.y * 1.8 + uTime * 0.54) * 0.08;
        wave += sin((p.x + p.y) * 2.3 - uTime * 0.42) * 0.035;
        p.z += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uCoral;
      uniform vec3 uLagoon;
      uniform vec3 uDark;
      varying float vWave;
      varying vec2 vUv;
      void main(){
        float horizon = smoothstep(0.08, 0.92, vUv.y);
        vec3 water = mix(uDark, uLagoon, horizon * 0.7 + vWave * 1.2);
        float glint = smoothstep(0.12, 0.22, vWave) * (1.0 - abs(vUv.x - 0.65));
        water += uCoral * glint * 0.5;
        float alpha = smoothstep(0.0, 0.2, vUv.y) * 0.72;
        gl_FragColor = vec4(water, alpha);
      }
    `,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2.05;
  water.position.set(0.6, -1.58, -3.6);
  scene.add(water);

  const particleCount = reducedMotion ? 240 : 850;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const colorA = new THREE.Color(0xffc86a);
  const colorB = new THREE.Color(0x38ddc7);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.2) * 13;
    positions[i * 3 + 1] = (Math.random() - 0.25) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const color = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ size: 0.025, transparent: true, opacity: 0.62, vertexColors: true, depthWrite: false }));
  scene.add(particles);

  const leafGroup = new THREE.Group();
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x0c5a4f, roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
  for (let i = 0; i < 11; i += 1) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.19, 2.2, 5, 1, true), leafMaterial);
    leaf.scale.set(1.8, 1, 0.12);
    leaf.rotation.z = -1.25 + i * 0.25;
    leaf.rotation.x = Math.PI / 2 + (i % 2 ? 0.2 : -0.1);
    leaf.position.set(-1.6 + i * 0.05, 2.45 - Math.abs(i - 5) * 0.1, -2.4 + Math.sin(i) * 0.22);
    leafGroup.add(leaf);
  }
  leafGroup.position.set(0.7, 0, 0);
  root.add(leafGroup);

  const pointer = new THREE.Vector2(0, 0);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  }, { passive: true });

  let visible = true;
  observeVisibility(canvas, (value) => { visible = value; });
  const clock = new THREE.Clock();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    camera.aspect = rect.width / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      waterMaterial.uniforms.uTime.value = t;
      rings.rotation.y = t * 0.09;
      rings.rotation.z = Math.sin(t * 0.18) * 0.12;
      sun.position.y = 1.05 + Math.sin(t * 0.45) * 0.055;
      glow.position.copy(sun.position);
      particles.rotation.y = t * 0.015;
      particles.position.y = Math.sin(t * 0.25) * 0.08;
      leafGroup.rotation.z = Math.sin(t * 0.3) * 0.045;
      root.rotation.y += (pointer.x * 0.22 - root.rotation.y) * 0.025;
      root.rotation.x += (-pointer.y * 0.12 - root.rotation.x) * 0.025;
      camera.position.x += (pointer.x * 0.36 - camera.position.x) * 0.018;
      camera.position.y += (1.15 - pointer.y * 0.16 - camera.position.y) * 0.018;
    }
    camera.lookAt(1.4, 0.25, -1.2);
    renderer.render(scene, camera);
  }
  animate();
}

function initBilliardsScene() {
  const canvas = document.getElementById("billiards-canvas");
  if (!canvas) return;

  const renderer = createRenderer(canvas, true);
  renderer.shadowMap.enabled = !reducedMotion;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x021b18, 9, 22);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 70);
  camera.position.set(6.8, 5.6, 8.5);

  scene.add(new THREE.HemisphereLight(0x9dded4, 0x031a17, 1.15));
  const spot = new THREE.SpotLight(0xffd06a, 65, 28, Math.PI / 5, 0.35, 1.2);
  spot.position.set(0, 8, 1.4);
  spot.castShadow = !reducedMotion;
  scene.add(spot);
  const coral = new THREE.PointLight(0xff5e43, 20, 16);
  coral.position.set(-5, 1.5, -2);
  scene.add(coral);
  const teal = new THREE.PointLight(0x1dd4bd, 16, 16);
  teal.position.set(5, 1, 3);
  scene.add(teal);

  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(45, 45), new THREE.MeshStandardMaterial({ color: 0x021714, roughness: 0.65, metalness: 0.15 }));
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.y = -2.25;
  roomFloor.receiveShadow = true;
  scene.add(roomFloor);

  const table = new THREE.Group();
  table.rotation.y = -0.22;
  table.position.set(2.1, -0.35, 0.2);
  scene.add(table);

  const wood = new THREE.MeshStandardMaterial({ color: 0x4c2418, roughness: 0.38, metalness: 0.08 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x0b7b68, roughness: 0.82, metalness: 0.02 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b09, roughness: 0.55 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc89b43, roughness: 0.3, metalness: 0.75 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 3.9), wood);
  base.castShadow = true; base.receiveShadow = true;
  table.add(base);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.13, 3.3), felt);
  bed.position.y = 0.34; bed.receiveShadow = true;
  table.add(bed);

  const railSize = [
    [6.7, 0.32, 0.26, 0, 0.45, 1.78],
    [6.7, 0.32, 0.26, 0, 0.45, -1.78],
    [0.26, 0.32, 3.45, 3.25, 0.45, 0],
    [0.26, 0.32, 3.45, -3.25, 0.45, 0],
  ];
  railSize.forEach(([x,y,z,px,py,pz]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(x,y,z), wood);
    rail.position.set(px,py,pz); rail.castShadow = true; table.add(rail);
  });

  [[-3.1,-1.6],[-3.1,1.6],[0,-1.66],[0,1.66],[3.1,-1.6],[3.1,1.6]].forEach(([x,z]) => {
    const pocket = new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.07,24), dark);
    pocket.position.set(x,0.45,z); table.add(pocket);
  });

  [[-2.7,-1.35],[-2.7,1.35],[2.7,-1.35],[2.7,1.35]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.45,2.1,0.45), wood);
    leg.position.set(x,-1.25,z); leg.castShadow = true; table.add(leg);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.12,20), gold);
    cap.position.set(x,-2.25,z); table.add(cap);
  });

  const ballColors = [0xffffff,0xf6c33a,0x274fca,0xdd332b,0x6d31a9,0xf27624,0x24843d,0x8b1f1f,0x111111,0xf6c33a,0x274fca,0xdd332b,0x6d31a9,0xf27624,0x24843d,0x8b1f1f];
  const balls = [];
  const ballGeometry = new THREE.SphereGeometry(0.17, 24, 24);
  const makeBall = (color, x, z, index) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.03 });
    const mesh = new THREE.Mesh(ballGeometry, material);
    mesh.position.set(x,0.55,z); mesh.castShadow = true;
    table.add(mesh);
    const ball = { mesh, velocity: new THREE.Vector2(), index };
    balls.push(ball);
    return ball;
  };
  makeBall(ballColors[0], -2.15, 0, 0);
  let idx = 1;
  const rackX = 1.25;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      makeBall(ballColors[idx], rackX + row * 0.31, (col - row / 2) * 0.36, idx);
      idx += 1;
    }
  }

  const neon = new THREE.Mesh(new THREE.TorusGeometry(3.9,0.025,10,180), new THREE.MeshBasicMaterial({ color: 0x25d8c0, transparent: true, opacity: 0.34 }));
  neon.rotation.x = Math.PI / 2;
  neon.position.set(2.2,-2.1,.2);
  scene.add(neon);

  const backdropParticles = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xf7bb38, size: 0.035, transparent: true, opacity: 0.35 })
  );
  const pCount = reducedMotion ? 100 : 350;
  const p = new Float32Array(pCount * 3);
  for (let i=0;i<pCount;i+=1){p[i*3]=(Math.random()-.5)*18;p[i*3+1]=Math.random()*9-2;p[i*3+2]=(Math.random()-.5)*15;}
  backdropParticles.geometry.setAttribute("position", new THREE.BufferAttribute(p,3));
  scene.add(backdropParticles);

  let targetOrbitX = 0;
  let targetOrbitY = 0;
  let dragging = false;
  let lastPointer = null;
  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    targetOrbitX = (event.clientX - rect.left) / rect.width - .5;
    targetOrbitY = (event.clientY - rect.top) / rect.height - .5;
  };
  canvas.addEventListener("pointermove", (event) => {
    updatePointer(event);
    if (dragging && lastPointer) {
      table.rotation.y += (event.clientX - lastPointer.x) * .006;
      table.rotation.x += (event.clientY - lastPointer.y) * .002;
      table.rotation.x = THREE.MathUtils.clamp(table.rotation.x,-.2,.2);
      lastPointer = { x:event.clientX,y:event.clientY };
    }
  }, { passive: true });
  canvas.addEventListener("pointerdown", (event) => { dragging = true; lastPointer = {x:event.clientX,y:event.clientY}; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", (event) => { dragging = false; lastPointer = null; canvas.releasePointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointercancel", () => { dragging = false; lastPointer = null; });

  function breakRack() {
    balls[0].velocity.set(0.19, (Math.random()-.5)*0.025);
    balls.slice(1).forEach((ball, index) => {
      ball.velocity.x += 0.006 + Math.random() * 0.015;
      ball.velocity.y += (index - 7) * 0.0016 + (Math.random()-.5)*0.01;
    });
  }
  canvas.addEventListener("click", () => { if (!dragging) breakRack(); });
  window.addEventListener("southernmost:break-rack", breakRack);

  function updateBalls() {
    const limitX = 2.92;
    const limitZ = 1.42;
    balls.forEach((ball) => {
      ball.mesh.position.x += ball.velocity.x;
      ball.mesh.position.z += ball.velocity.y;
      ball.velocity.multiplyScalar(0.986);
      if (Math.abs(ball.mesh.position.x) > limitX) {
        ball.mesh.position.x = Math.sign(ball.mesh.position.x) * limitX;
        ball.velocity.x *= -0.82;
      }
      if (Math.abs(ball.mesh.position.z) > limitZ) {
        ball.mesh.position.z = Math.sign(ball.mesh.position.z) * limitZ;
        ball.velocity.y *= -0.82;
      }
      ball.mesh.rotation.z -= ball.velocity.x * 4.5;
      ball.mesh.rotation.x += ball.velocity.y * 4.5;
    });
    for (let i=0;i<balls.length;i+=1){
      for (let j=i+1;j<balls.length;j+=1){
        const a=balls[i],b=balls[j];
        const dx=b.mesh.position.x-a.mesh.position.x,dz=b.mesh.position.z-a.mesh.position.z;
        const dist=Math.hypot(dx,dz),min=.34;
        if(dist>0&&dist<min){
          const nx=dx/dist,nz=dz/dist,overlap=(min-dist)/2;
          a.mesh.position.x-=nx*overlap;a.mesh.position.z-=nz*overlap;b.mesh.position.x+=nx*overlap;b.mesh.position.z+=nz*overlap;
          const av=a.velocity.x*nx+a.velocity.y*nz,bv=b.velocity.x*nx+b.velocity.y*nz;
          const impulse=bv-av;
          a.velocity.x+=impulse*nx*.9;a.velocity.y+=impulse*nz*.9;b.velocity.x-=impulse*nx*.9;b.velocity.y-=impulse*nz*.9;
        }
      }
    }
  }

  let visible = true;
  observeVisibility(canvas, (value) => { visible = value; });
  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    camera.aspect = rect.width / Math.max(1,rect.height);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      updateBalls();
      if (!dragging) {
        table.rotation.y += ((-.22 + targetOrbitX * .25) - table.rotation.y) * .018;
        table.rotation.x += ((targetOrbitY * .055) - table.rotation.x) * .018;
      }
      neon.material.opacity = .22 + Math.sin(t*1.6)*.08;
      backdropParticles.rotation.y = t*.015;
      spot.position.x = Math.sin(t*.17)*1.5;
    }
    camera.lookAt(1.8,-.3,0);
    renderer.render(scene,camera);
  }
  animate();
}


function initCocktailScene() {
  const canvas = document.getElementById("cocktail-canvas");
  if (!canvas) return;

  const renderer = createRenderer(canvas, true);
  renderer.shadowMap.enabled = !reducedMotion;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x021b18, 0.055);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(3.8, 2.2, 8.8);

  scene.add(new THREE.HemisphereLight(0xffd58f, 0x063b35, 1.5));
  const coral = new THREE.PointLight(0xff6848, 38, 20);
  coral.position.set(-2.8, 3.4, 3);
  scene.add(coral);
  const teal = new THREE.PointLight(0x1cc2ad, 35, 20);
  teal.position.set(4, 1.5, 2);
  scene.add(teal);
  const goldLight = new THREE.SpotLight(0xffc455, 65, 24, Math.PI / 4, .4, 1.4);
  goldLight.position.set(0, 7, 3);
  scene.add(goldLight);

  const root = new THREE.Group();
  root.position.set(2.4, -.15, -.2);
  root.rotation.set(-.06, -.28, .03);
  scene.add(root);

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: .2,
    transmission: .96,
    roughness: .06,
    metalness: 0,
    thickness: .16,
    ior: 1.45,
    side: THREE.DoubleSide
  });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.05, .72, 3.9, 64, 1, true), glassMaterial);
  glass.castShadow = true;
  root.add(glass);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(.74, .74, .13, 64), glassMaterial);
  bottom.position.y = -1.96;
  root.add(bottom);

  const liquidMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff5c3c,
    emissive: 0xff3e25,
    emissiveIntensity: .35,
    transparent: true,
    opacity: .84,
    roughness: .18,
    transmission: .08
  });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.94, .68, 2.95, 64), liquidMaterial);
  liquid.position.y = -.42;
  root.add(liquid);

  const foam = new THREE.Mesh(new THREE.CylinderGeometry(.94, .94, .08, 64), new THREE.MeshPhysicalMaterial({ color: 0xffd79c, roughness: .75, transparent: true, opacity: .86 }));
  foam.position.y = 1.08;
  root.add(foam);

  const iceMaterial = new THREE.MeshPhysicalMaterial({ color: 0xdffcf8, transmission: .8, transparent: true, opacity: .45, roughness: .18, thickness: .2 });
  const ice = [];
  for (let i = 0; i < (reducedMotion ? 5 : 9); i += 1) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(.52, .52, .52), iceMaterial);
    cube.position.set((Math.random()-.5)*1.1, -.7 + Math.random()*1.9, (Math.random()-.5)*.8);
    cube.rotation.set(Math.random(), Math.random(), Math.random());
    root.add(cube);
    ice.push(cube);
  }

  const straw = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, 4.6, 18), new THREE.MeshStandardMaterial({ color: 0x1cc2ad, roughness: .4 }));
  straw.position.set(.55, .75, .05);
  straw.rotation.z = -.22;
  root.add(straw);

  const citrus = new THREE.Group();
  const rind = new THREE.Mesh(new THREE.TorusGeometry(.65, .105, 16, 64), new THREE.MeshStandardMaterial({ color: 0xf7bb38, roughness: .65 }));
  citrus.add(rind);
  const flesh = new THREE.Mesh(new THREE.CircleGeometry(.58, 48), new THREE.MeshStandardMaterial({ color: 0xffdb68, transparent: true, opacity: .92, roughness: .75, side: THREE.DoubleSide }));
  flesh.position.z = -.02;
  citrus.add(flesh);
  citrus.position.set(-.65, 1.75, .15);
  citrus.rotation.set(.15, .6, -.25);
  root.add(citrus);

  const garnishMaterial = new THREE.MeshStandardMaterial({ color: 0x2b9b62, roughness: .75, side: THREE.DoubleSide });
  for (let i=0;i<4;i+=1){
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.22,20,10), garnishMaterial);
    leaf.scale.set(1.7,.35,.65);
    leaf.position.set(-.25+i*.13,1.65+i*.16,-.1+i*.08);
    leaf.rotation.z = -.7+i*.38;
    root.add(leaf);
  }

  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.4,.018,12,180), new THREE.MeshBasicMaterial({ color: 0xf7bb38, transparent: true, opacity: .35 }));
  halo.rotation.x = Math.PI/2.35;
  halo.position.y = -.2;
  root.add(halo);
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(3.25,.013,10,180), new THREE.MeshBasicMaterial({ color: 0x1cc2ad, transparent: true, opacity: .23 }));
  halo2.rotation.set(Math.PI/2.1,.4,.15);
  root.add(halo2);

  const particleCount = reducedMotion ? 100 : 420;
  const positions = new Float32Array(particleCount*3);
  const colors = new Float32Array(particleCount*3);
  const a = new THREE.Color(0xffb84a), b = new THREE.Color(0x24d9c1);
  for(let i=0;i<particleCount;i+=1){
    positions[i*3]=(Math.random()-.35)*14;
    positions[i*3+1]=(Math.random()-.45)*9;
    positions[i*3+2]=(Math.random()-.5)*12;
    const c=a.clone().lerp(b,Math.random()); colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(positions,3));
  pg.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const particles = new THREE.Points(pg,new THREE.PointsMaterial({size:.03,vertexColors:true,transparent:true,opacity:.55,depthWrite:false}));
  scene.add(particles);

  const pointer = new THREE.Vector2();
  canvas.addEventListener('pointermove',(event)=>{
    const rect=canvas.getBoundingClientRect();
    pointer.x=(event.clientX-rect.left)/rect.width-.5;
    pointer.y=(event.clientY-rect.top)/rect.height-.5;
  },{passive:true});

  let visible=true;
  observeVisibility(canvas,(value)=>{visible=value;});
  function resize(){
    const rect=canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();
  }
  resize();addEventListener('resize',resize,{passive:true});
  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    if(!visible)return;
    const t=clock.getElapsedTime();
    if(!reducedMotion){
      root.rotation.y+=((-.28+pointer.x*.5)-root.rotation.y)*.025;
      root.rotation.x+=((-.06-pointer.y*.18)-root.rotation.x)*.025;
      root.position.y=-.15+Math.sin(t*.7)*.09;
      citrus.rotation.z=-.25+Math.sin(t*.9)*.09;
      halo.rotation.z=t*.12;halo2.rotation.z=-t*.08;
      particles.rotation.y=t*.018;
      ice.forEach((cube,index)=>{cube.rotation.x+=.002+index*.00015;cube.rotation.y-=.003;});
      liquidMaterial.emissiveIntensity=.28+Math.sin(t*1.1)*.08;
    }
    camera.lookAt(1.9,0,0);
    renderer.render(scene,camera);
  }
  animate();
}

try { initHeroScene(); } catch (error) { console.warn("Hero WebGL scene unavailable", error); }
try { initCocktailScene(); } catch (error) { console.warn("Cocktail WebGL scene unavailable", error); }
try { initBilliardsScene(); } catch (error) { console.warn("Billiards WebGL scene unavailable", error); }

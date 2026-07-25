import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = matchMedia("(pointer: coarse)").matches;
const safeDpr = Math.min(devicePixelRatio || 1, coarsePointer ? 1.35 : 1.7);

function createRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(safeDpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

function visibilityTracker(element) {
  let visible = true;
  const observer = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; }, { rootMargin: "180px" });
  observer.observe(element);
  return () => visible;
}

function resizeRenderer(renderer, camera, canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function roundedRectTexture(lines, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  const bg = options.background || "#f5ead5";
  const ink = options.ink || "#072d29";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(255,255,255,.45)");
  gradient.addColorStop(.55, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(4,31,28,.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#e66b48";
  ctx.lineWidth = 28;
  ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(67, 67, canvas.width - 134, canvas.height - 134);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line) => {
    ctx.font = `${line.weight || 700} ${line.size || 70}px Georgia, serif`;
    ctx.fillStyle = line.color || ink;
    ctx.letterSpacing = `${line.spacing || 0}px`;
    ctx.fillText(line.text, canvas.width / 2, line.y);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function initHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const renderer = createRenderer(canvas, true);
  renderer.shadowMap.enabled = !reducedMotion;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x031f1c, .055);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 80);
  camera.position.set(1.1, 2.15, 10.8);

  scene.add(new THREE.HemisphereLight(0xffd99d, 0x052b27, 1.4));
  const sunsetLight = new THREE.DirectionalLight(0xff9d62, 4.2);
  sunsetLight.position.set(5, 7, 6);
  sunsetLight.castShadow = !reducedMotion;
  scene.add(sunsetLight);
  const tealLight = new THREE.PointLight(0x22d6bf, 25, 20);
  tealLight.position.set(3, 1, 3);
  scene.add(tealLight);
  const coralLight = new THREE.PointLight(0xff5e43, 20, 18);
  coralLight.position.set(-3, 2, 2);
  scene.add(coralLight);

  const root = new THREE.Group();
  root.position.set(3.45, -.35, -.2);
  scene.add(root);

  const wood = new THREE.MeshStandardMaterial({ color: 0x4b2618, roughness: .42, metalness: .06 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x24140e, roughness: .56 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc99b47, roughness: .28, metalness: .72 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf4ead5, roughness: .72 });

  /* An actual vintage roadside restaurant sign. */
  const sign = new THREE.Group();
  sign.position.set(.35, .8, -.8);
  sign.rotation.y = -.14;
  root.add(sign);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.18, .25), darkWood);
  frame.castShadow = true;
  sign.add(frame);
  const signTexture = roundedRectTexture([
    { text: "SOUTHERNMOST", y: 190, size: 104, weight: 800, spacing: 4 },
    { text: "COASTAL KITCHEN · BAR · ISLAND VIBES", y: 340, size: 34, weight: 700, color: "#e55f3f" },
    { text: "4449 OKEECHOBEE · WEST PALM BEACH", y: 465, size: 30, weight: 700, spacing: 2 },
  ]);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(4.82, 2.82), new THREE.MeshStandardMaterial({ map: signTexture, roughness: .72, metalness: 0 }));
  face.position.z = .131;
  sign.add(face);
  [-1.68, 1.68].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.12, .17, 5.4, 18), wood);
    post.position.set(x, -3.15, -.05);
    post.castShadow = true;
    sign.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 12), brass);
    cap.position.set(x, -5.8, -.05);
    sign.add(cap);
  });
  const lightRail = new THREE.Mesh(new THREE.BoxGeometry(4.9, .08, .08), brass);
  lightRail.position.set(0, -1.68, .22);
  sign.add(lightRail);
  for (let i = 0; i < 9; i += 1) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffd277, emissive: 0xffa13c, emissiveIntensity: 2.5 }));
    bulb.position.set(-2.15 + i * .54, -1.68, .3);
    sign.add(bulb);
  }

  /* Palm tree made of a curved segmented trunk and individual fronds. */
  const palm = new THREE.Group();
  palm.position.set(-3.1, -2.3, -1.8);
  palm.rotation.z = -.12;
  root.add(palm);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5631, roughness: .88 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x0b6b57, roughness: .8, side: THREE.DoubleSide });
  let trunkTop = new THREE.Vector3();
  for (let i = 0; i < 9; i += 1) {
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(.14 - i * .006, .19 - i * .006, .7, 10), trunkMaterial);
    segment.position.set(i * .07, i * .62, Math.sin(i * .35) * .06);
    segment.rotation.z = -.11;
    segment.castShadow = true;
    palm.add(segment);
    trunkTop.copy(segment.position).add(new THREE.Vector3(0, .39, 0));
  }
  const crown = new THREE.Group();
  crown.position.copy(trunkTop);
  palm.add(crown);
  for (let i = 0; i < 12; i += 1) {
    const frond = new THREE.Mesh(new THREE.ConeGeometry(.22, 2.45, 7, 1, true), leafMaterial);
    frond.scale.set(1.75, 1, .16);
    frond.rotation.z = -Math.PI / 2 + (Math.random() - .5) * .18;
    frond.rotation.y = (i / 12) * Math.PI * 2;
    frond.rotation.x = .25 + (i % 3) * .12;
    frond.position.set(Math.cos(i / 12 * Math.PI * 2) * .55, .1, Math.sin(i / 12 * Math.PI * 2) * .55);
    crown.add(frond);
  }

  /* A real lifebuoy and cocktail on a small bar ledge. */
  const propGroup = new THREE.Group();
  propGroup.position.set(3.05, -2.1, 1.25);
  root.add(propGroup);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(3.4, .3, 1.4), wood);
  ledge.castShadow = true;
  propGroup.add(ledge);
  const buoy = new THREE.Group();
  buoy.position.set(1.05, 1.5, -.15);
  buoy.rotation.x = .15;
  propGroup.add(buoy);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.76, .2, 22, 72), new THREE.MeshStandardMaterial({ color: 0xf6eee0, roughness: .42 }));
  buoy.add(ring);
  for (let i = 0; i < 4; i += 1) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(.76, .205, 20, 18, Math.PI / 5), new THREE.MeshStandardMaterial({ color: 0xff6448, roughness: .38 }));
    stripe.rotation.z = i * Math.PI / 2 - Math.PI / 10;
    buoy.add(stripe);
  }
  const miniGlass = new THREE.Group();
  miniGlass.position.set(-.7, 1.2, .1);
  propGroup.add(miniGlass);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.42, .31, 1.55, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .92, transparent: true, opacity: .25, roughness: .08, thickness: .12 }));
  miniGlass.add(glass);
  const drink = new THREE.Mesh(new THREE.CylinderGeometry(.37, .28, 1.02, 28), new THREE.MeshPhysicalMaterial({ color: 0xff6a42, emissive: 0xff4328, emissiveIntensity: .22, transparent: true, opacity: .85, roughness: .15 }));
  drink.position.y = -.19;
  miniGlass.add(drink);
  const garnish = new THREE.Mesh(new THREE.TorusGeometry(.28, .055, 12, 36, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0xffc64c, roughness: .64 }));
  garnish.position.set(-.34, .76, 0);
  garnish.rotation.y = .6;
  miniGlass.add(garnish);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.35, 36, 24), new THREE.MeshBasicMaterial({ color: 0xffb342, transparent: true, opacity: .86 }));
  sun.position.set(4.3, 3.3, -5);
  scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), new THREE.MeshStandardMaterial({ color: 0x031916, roughness: .8, transparent: true, opacity: .74 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.42;
  floor.receiveShadow = true;
  scene.add(floor);

  const pointer = new THREE.Vector2();
  addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / innerWidth - .5;
    pointer.y = event.clientY / innerHeight - .5;
  }, { passive: true });
  const isVisible = visibilityTracker(canvas);
  const clock = new THREE.Clock();

  const resize = () => {
    resizeRenderer(renderer, camera, canvas);
    const mobile = canvas.clientWidth < 720;
    root.scale.setScalar(mobile ? .72 : 1);
    root.position.set(mobile ? 2.85 : 3.45, mobile ? -.55 : -.35, mobile ? -1.3 : -.2);
    camera.position.set(mobile ? 1.5 : 1.1, mobile ? 2.35 : 2.15, mobile ? 11.8 : 10.8);
  };
  resize();
  addEventListener("resize", resize, { passive: true });

  const animate = () => {
    requestAnimationFrame(animate);
    if (!isVisible()) return;
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      sign.rotation.y = -.14 + Math.sin(t * .27) * .016;
      crown.rotation.y = Math.sin(t * .22) * .07;
      buoy.rotation.z = Math.sin(t * .48) * .035;
      miniGlass.rotation.y = Math.sin(t * .35) * .08;
      root.rotation.y += (pointer.x * .08 - root.rotation.y) * .018;
      root.rotation.x += (-pointer.y * .035 - root.rotation.x) * .018;
      camera.position.x += ((1.1 + pointer.x * .38) - camera.position.x) * .018;
    }
    camera.lookAt(2.2, .2, -.5);
    renderer.render(scene, camera);
  };
  animate();
}

function initCocktailScene() {
  const canvas = document.getElementById("cocktail-canvas");
  if (!canvas) return;
  const renderer = createRenderer(canvas, true);
  renderer.shadowMap.enabled = !reducedMotion;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x021b18, .045);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  camera.position.set(4.2, 2.5, 8.7);
  scene.add(new THREE.HemisphereLight(0xffdca8, 0x032d28, 1.35));
  const key = new THREE.SpotLight(0xffca70, 60, 24, Math.PI / 5, .38, 1.1);
  key.position.set(-2, 7, 5);
  key.castShadow = !reducedMotion;
  scene.add(key);
  const fill = new THREE.PointLight(0x1cc2ad, 30, 18);
  fill.position.set(4, 1, 2);
  scene.add(fill);
  const rim = new THREE.PointLight(0xff6046, 28, 18);
  rim.position.set(-4, 2, -1);
  scene.add(rim);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(12, .5, 5), new THREE.MeshStandardMaterial({ color: 0x3a2016, roughness: .36, metalness: .08 }));
  counter.position.set(0, -2.45, 0);
  counter.receiveShadow = true;
  scene.add(counter);
  const coaster = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, .1, 64), new THREE.MeshStandardMaterial({ color: 0x0d665c, roughness: .62 }));
  coaster.position.set(1.7, -2.12, .15);
  coaster.receiveShadow = true;
  scene.add(coaster);

  const root = new THREE.Group();
  root.position.set(1.7, -.08, .1);
  scene.add(root);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .97, transparent: true, opacity: .28, roughness: .035, metalness: 0, thickness: .17, ior: 1.47, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.05, .72, 3.75, 64, 1, true), glassMat);
  glass.castShadow = true;
  root.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .13, 64), glassMat);
  base.position.y = -1.92;
  root.add(base);

  const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0xff6240, emissive: 0xff3925, emissiveIntensity: .22, transparent: true, opacity: .88, roughness: .15, transmission: .06 });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.94, .68, 2.92, 64), liquidMat);
  liquid.position.y = -.43;
  root.add(liquid);
  const liquidTop = new THREE.Mesh(new THREE.CylinderGeometry(.94, .94, .06, 64), liquidMat);
  liquidTop.position.y = 1.03;
  root.add(liquidTop);

  const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xeafffb, transmission: .86, transparent: true, opacity: .48, roughness: .12, thickness: .22 });
  const ice = [];
  for (let i = 0; i < (reducedMotion ? 5 : 10); i += 1) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), iceMat);
    cube.position.set((Math.random() - .5) * 1.12, -.85 + Math.random() * 1.95, (Math.random() - .5) * .78);
    cube.rotation.set(Math.random(), Math.random(), Math.random());
    root.add(cube);
    ice.push(cube);
  }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, 4.55, 16), new THREE.MeshStandardMaterial({ color: 0x1cc2ad, roughness: .4 }));
  straw.position.set(.55, .65, .04);
  straw.rotation.z = -.22;
  root.add(straw);
  const citrus = new THREE.Group();
  const rind = new THREE.Mesh(new THREE.TorusGeometry(.64, .105, 16, 64), new THREE.MeshStandardMaterial({ color: 0xf7bb38, roughness: .62 }));
  const flesh = new THREE.Mesh(new THREE.CircleGeometry(.56, 48), new THREE.MeshStandardMaterial({ color: 0xffdc72, roughness: .76, side: THREE.DoubleSide }));
  flesh.position.z = -.02;
  citrus.add(rind, flesh);
  citrus.position.set(-.64, 1.76, .12);
  citrus.rotation.set(.15, .6, -.24);
  root.add(citrus);
  const mint = new THREE.Group();
  const mintMat = new THREE.MeshStandardMaterial({ color: 0x2a9b65, roughness: .75 });
  for (let i = 0; i < 5; i += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.22, 18, 10), mintMat);
    leaf.scale.set(1.65, .34, .72);
    leaf.position.set(-.18 + i * .13, 1.46 + i * .14, -.12 + i * .05);
    leaf.rotation.z = -.7 + i * .33;
    mint.add(leaf);
  }
  root.add(mint);

  const menuCardTexture = roundedRectTexture([
    { text: "SIGNATURE POUR", y: 150, size: 42, weight: 800, color: "#e55f3f" },
    { text: "SOUTHERNMOST", y: 285, size: 70, weight: 800 },
    { text: "TROPICAL COCKTAILS", y: 405, size: 34, weight: 700 },
  ], { background: "#f8efdd" });
  const menuCard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, .08), new THREE.MeshStandardMaterial({ map: menuCardTexture, roughness: .7 }));
  menuCard.position.set(-2.7, -.95, -1.35);
  menuCard.rotation.set(-.12, .28, -.08);
  menuCard.castShadow = true;
  scene.add(menuCard);

  const recipes = {
    "southernmost-sunset": { color: 0xff5e3c, emissive: 0xff3d24, straw: 0x1cc2ad, citrus: 0xffd45e, mint: true },
    "key-lime-margarita": { color: 0xc8e96b, emissive: 0x5c8e27, straw: 0xf7bb38, citrus: 0x9ddb5b, mint: false },
    "guava-breeze": { color: 0xf04f82, emissive: 0xa22355, straw: 0x1cc2ad, citrus: 0xffd45e, mint: true },
    "island-mojito": { color: 0x8edb9e, emissive: 0x2c8a55, straw: 0xf7bb38, citrus: 0xb9ef74, mint: true },
    "frozen-pina-colada": { color: 0xf3e2a2, emissive: 0x9b7c32, straw: 0xff6948, citrus: 0xffd45e, mint: false },
    "rum-runner": { color: 0xd63c4e, emissive: 0x8e1a2b, straw: 0x1cc2ad, citrus: 0xff9d45, mint: true },
  };
  const setRecipe = (id) => {
    const recipe = recipes[id] || recipes["southernmost-sunset"];
    liquidMat.color.setHex(recipe.color);
    liquidMat.emissive.setHex(recipe.emissive);
    straw.material.color.setHex(recipe.straw);
    rind.material.color.setHex(recipe.citrus);
    flesh.material.color.setHex(recipe.citrus);
    mint.visible = recipe.mint;
  };
  addEventListener("southernmost:cocktail", (event) => setRecipe(event.detail));
  setRecipe("southernmost-sunset");

  let dragging = false;
  let moved = false;
  let last = null;
  let targetX = -.08;
  let targetY = -.26;
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dragging = true;
    moved = false;
    last = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !last) return;
    event.preventDefault();
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    targetY += dx * .006;
    targetX = THREE.MathUtils.clamp(targetX + dy * .003, -.34, .22);
    last = { x: event.clientX, y: event.clientY };
  }, { passive: false });
  const endDrag = (event) => { dragging = false; last = null; try { canvas.releasePointerCapture?.(event.pointerId); } catch {} };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  const isVisible = visibilityTracker(canvas);
  const clock = new THREE.Clock();
  const resize = () => {
    resizeRenderer(renderer, camera, canvas);
    const mobile = canvas.clientWidth < 620;
    root.scale.setScalar(mobile ? .82 : 1);
    root.position.set(mobile ? .65 : 1.7, mobile ? -.1 : -.08, .1);
    menuCard.position.x = mobile ? -2.1 : -2.7;
    camera.position.set(mobile ? 3.1 : 4.2, mobile ? 2.45 : 2.5, mobile ? 9.5 : 8.7);
  };
  resize();
  addEventListener("resize", resize, { passive: true });
  const animate = () => {
    requestAnimationFrame(animate);
    if (!isVisible()) return;
    const t = clock.getElapsedTime();
    root.rotation.x += (targetX - root.rotation.x) * .06;
    root.rotation.y += (targetY - root.rotation.y) * .06;
    if (!dragging && !reducedMotion) targetY += .0012;
    if (!reducedMotion) {
      root.position.y += ((-.08 + Math.sin(t * .65) * .055) - root.position.y) * .04;
      ice.forEach((cube, i) => { cube.rotation.x += .0015 + i * .00012; cube.rotation.y -= .002; });
      liquidMat.emissiveIntensity = .2 + Math.sin(t * 1.1) * .035;
      citrus.rotation.z = -.24 + Math.sin(t * .72) * .04;
    }
    camera.lookAt(.8, -.1, 0);
    renderer.render(scene, camera);
  };
  animate();
}

function initBilliardsScene() {
  const canvas = document.getElementById("billiards-canvas");
  if (!canvas) return;
  const renderer = createRenderer(canvas, true);
  renderer.shadowMap.enabled = !reducedMotion;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x021b18, 9, 23);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 70);
  camera.position.set(6.8, 5.6, 8.5);
  scene.add(new THREE.HemisphereLight(0xa3e2d8, 0x031a17, 1.15));
  const spot = new THREE.SpotLight(0xffd06a, 66, 29, Math.PI / 5, .35, 1.2);
  spot.position.set(0, 8, 1.4);
  spot.castShadow = !reducedMotion;
  scene.add(spot);
  const coral = new THREE.PointLight(0xff5e43, 20, 16);
  coral.position.set(-5, 1.5, -2);
  scene.add(coral);
  const teal = new THREE.PointLight(0x1dd4bd, 16, 16);
  teal.position.set(5, 1, 3);
  scene.add(teal);

  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(45, 45), new THREE.MeshStandardMaterial({ color: 0x021714, roughness: .65, metalness: .15 }));
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.y = -2.25;
  roomFloor.receiveShadow = true;
  scene.add(roomFloor);

  const table = new THREE.Group();
  table.rotation.y = -.22;
  table.position.set(2.1, -.35, .2);
  scene.add(table);
  const wood = new THREE.MeshStandardMaterial({ color: 0x4c2418, roughness: .38, metalness: .08 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x0b7b68, roughness: .82, metalness: .02 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x050606, roughness: .5 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc89b43, roughness: .3, metalness: .75 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(6.8, .55, 3.9), wood);
  base.castShadow = true; base.receiveShadow = true; table.add(base);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(6.2, .13, 3.3), felt);
  bed.position.y = .34; bed.receiveShadow = true; table.add(bed);
  [
    [6.7,.32,.26,0,.45,1.78],[6.7,.32,.26,0,.45,-1.78],
    [.26,.32,3.45,3.25,.45,0],[.26,.32,3.45,-3.25,.45,0],
  ].forEach(([x,y,z,px,py,pz]) => { const rail = new THREE.Mesh(new THREE.BoxGeometry(x,y,z),wood); rail.position.set(px,py,pz); rail.castShadow=true; table.add(rail); });

  const pocketPositions = [
    new THREE.Vector2(-3.08,-1.59),new THREE.Vector2(-3.08,1.59),new THREE.Vector2(0,-1.67),
    new THREE.Vector2(0,1.67),new THREE.Vector2(3.08,-1.59),new THREE.Vector2(3.08,1.59),
  ];
  pocketPositions.forEach(({ x, y: z }) => {
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(.26,.055,14,36), dark);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(x,.46,z);
    table.add(rimMesh);
    const well = new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.25,28), dark);
    well.position.set(x,.31,z);
    table.add(well);
  });
  [[-2.7,-1.35],[-2.7,1.35],[2.7,-1.35],[2.7,1.35]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.45,2.1,.45),wood); leg.position.set(x,-1.25,z); leg.castShadow=true; table.add(leg);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.12,20),gold); cap.position.set(x,-2.25,z); table.add(cap);
  });

  /* Overhead lamp makes the scene read like a real billiards room. */
  const lamp = new THREE.Group();
  lamp.position.set(0,4.1,0); table.add(lamp);
  const lampBody = new THREE.Mesh(new THREE.BoxGeometry(3.4,.45,1.1),new THREE.MeshStandardMaterial({color:0x143b33,roughness:.34,metalness:.45})); lamp.add(lampBody);
  const lampGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.05,.8),new THREE.MeshBasicMaterial({color:0xffd47e,transparent:true,opacity:.35,side:THREE.DoubleSide})); lampGlow.rotation.x=Math.PI/2; lampGlow.position.y=-.26; lamp.add(lampGlow);

  const ballColors=[0xffffff,0xf6c33a,0x274fca,0xdd332b,0x6d31a9,0xf27624,0x24843d,0x8b1f1f,0x111111,0xf6c33a,0x274fca,0xdd332b,0x6d31a9,0xf27624,0x24843d,0x8b1f1f];
  const ballGeometry = new THREE.SphereGeometry(.17,24,24);
  const balls = [];
  const startPositions = [];
  const makeBall = (color,x,z,index) => {
    const mesh = new THREE.Mesh(ballGeometry,new THREE.MeshStandardMaterial({color,roughness:.18,metalness:.025}));
    mesh.position.set(x,.55,z); mesh.castShadow=true; table.add(mesh);
    const ball={mesh,velocity:new THREE.Vector2(),index,active:true,pocketing:false,pocketTime:0};
    balls.push(ball); startPositions[index]=new THREE.Vector2(x,z); return ball;
  };
  makeBall(ballColors[0],-2.15,0,0);
  let ballIndex=1;
  const rackX=1.25;
  for(let row=0;row<5;row+=1){ for(let col=0;col<=row;col+=1){ makeBall(ballColors[ballIndex],rackX+row*.31,(col-row/2)*.36,ballIndex); ballIndex+=1; } }

  const cueStick = new THREE.Mesh(new THREE.CylinderGeometry(.035,.065,5.3,16),new THREE.MeshStandardMaterial({color:0xc88d4f,roughness:.48}));
  cueStick.position.set(-3.5,1.35,1.95); cueStick.rotation.set(Math.PI/2.65,0,-.8); table.add(cueStick);

  const particles = new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xf7bb38,size:.035,transparent:true,opacity:.34}));
  const count=reducedMotion?100:330; const positions=new Float32Array(count*3);
  for(let i=0;i<count;i+=1){positions[i*3]=(Math.random()-.5)*18;positions[i*3+1]=Math.random()*9-2;positions[i*3+2]=(Math.random()-.5)*15;}
  particles.geometry.setAttribute("position",new THREE.BufferAttribute(positions,3)); scene.add(particles);

  let pocketedCount=0;
  const notifyPocketed=()=>dispatchEvent(new CustomEvent("southernmost:pocketed",{detail:{count:pocketedCount}}));
  const resetRack=()=>{
    pocketedCount=0;
    balls.forEach((ball,index)=>{
      ball.active=true; ball.pocketing=false; ball.pocketTime=0; ball.mesh.visible=true; ball.mesh.scale.setScalar(1); ball.mesh.position.set(startPositions[index].x,.55,startPositions[index].y); ball.velocity.set(0,0);
    });
    notifyPocketed();
  };
  const pocketBall=(ball)=>{
    if(!ball.active||ball.pocketing)return;
    ball.active=false; ball.pocketing=true; ball.pocketTime=0; ball.velocity.multiplyScalar(.25);
    if(ball.index!==0){ pocketedCount+=1; notifyPocketed(); }
  };
  const respawnCue=()=>{
    const cue=balls[0]; cue.active=true; cue.pocketing=false; cue.mesh.visible=true; cue.mesh.scale.setScalar(1); cue.mesh.position.set(-2.15,.55,0); cue.velocity.set(0,0);
  };
  const breakRack=()=>{
    const cue=balls[0];
    if(!cue.active) respawnCue();
    cue.velocity.set(.205,(Math.random()-.5)*.022);
    balls.slice(1).filter(ball=>ball.active).forEach((ball,index)=>{ball.velocity.x+=.004+Math.random()*.01;ball.velocity.y+=(index-7)*.0012+(Math.random()-.5)*.007;});
  };
  addEventListener("southernmost:break-rack",breakRack);
  addEventListener("southernmost:reset-rack",resetRack);

  let targetOrbitX=0,targetOrbitY=0,dragging=false,last=null,press=null,moved=false;
  const updatePointer=(event)=>{const rect=canvas.getBoundingClientRect();targetOrbitX=(event.clientX-rect.left)/rect.width-.5;targetOrbitY=(event.clientY-rect.top)/rect.height-.5;};
  canvas.addEventListener("pointerdown",event=>{event.preventDefault();dragging=true;moved=false;last={x:event.clientX,y:event.clientY};press={x:event.clientX,y:event.clientY};canvas.setPointerCapture?.(event.pointerId);});
  canvas.addEventListener("pointermove",event=>{updatePointer(event);if(!dragging||!last)return;event.preventDefault();const dx=event.clientX-last.x,dy=event.clientY-last.y;if(Math.abs(event.clientX-press.x)+Math.abs(event.clientY-press.y)>6)moved=true;table.rotation.y+=dx*.006;table.rotation.x=THREE.MathUtils.clamp(table.rotation.x+dy*.002,-.2,.2);last={x:event.clientX,y:event.clientY};},{passive:false});
  const endPointer=(event)=>{if(dragging&&!moved)breakRack();dragging=false;last=null;press=null;try{canvas.releasePointerCapture?.(event.pointerId);}catch{}};
  canvas.addEventListener("pointerup",endPointer); canvas.addEventListener("pointercancel",endPointer); canvas.addEventListener("contextmenu",event=>event.preventDefault());

  function updateBalls(){
    const limitX=2.92,limitZ=1.42;
    balls.forEach(ball=>{
      if(ball.pocketing){
        ball.pocketTime+=.045;
        ball.mesh.position.y-=.028;
        ball.mesh.scale.multiplyScalar(.94);
        if(ball.mesh.scale.x<.06){ball.mesh.visible=false;ball.pocketing=false;if(ball.index===0)setTimeout(respawnCue,650);}
        return;
      }
      if(!ball.active)return;
      ball.mesh.position.x+=ball.velocity.x;ball.mesh.position.z+=ball.velocity.y;ball.velocity.multiplyScalar(.986);
      const pocket=pocketPositions.find(pos=>Math.hypot(ball.mesh.position.x-pos.x,ball.mesh.position.z-pos.y)<.285);
      if(pocket){pocketBall(ball);return;}
      if(Math.abs(ball.mesh.position.x)>limitX){ball.mesh.position.x=Math.sign(ball.mesh.position.x)*limitX;ball.velocity.x*=-.82;}
      if(Math.abs(ball.mesh.position.z)>limitZ){ball.mesh.position.z=Math.sign(ball.mesh.position.z)*limitZ;ball.velocity.y*=-.82;}
      ball.mesh.rotation.z-=ball.velocity.x*4.5;ball.mesh.rotation.x+=ball.velocity.y*4.5;
    });
    const active=balls.filter(ball=>ball.active);
    for(let i=0;i<active.length;i+=1){for(let j=i+1;j<active.length;j+=1){const a=active[i],b=active[j];const dx=b.mesh.position.x-a.mesh.position.x,dz=b.mesh.position.z-a.mesh.position.z;const dist=Math.hypot(dx,dz),min=.34;if(dist>0&&dist<min){const nx=dx/dist,nz=dz/dist,overlap=(min-dist)/2;a.mesh.position.x-=nx*overlap;a.mesh.position.z-=nz*overlap;b.mesh.position.x+=nx*overlap;b.mesh.position.z+=nz*overlap;const av=a.velocity.x*nx+a.velocity.y*nz,bv=b.velocity.x*nx+b.velocity.y*nz,impulse=bv-av;a.velocity.x+=impulse*nx*.9;a.velocity.y+=impulse*nz*.9;b.velocity.x-=impulse*nx*.9;b.velocity.y-=impulse*nz*.9;}}}
  }

  resetRack();
  const isVisible=visibilityTracker(canvas); const clock=new THREE.Clock();
  const resize=()=>{resizeRenderer(renderer,camera,canvas);const mobile=canvas.clientWidth<720;camera.position.set(mobile?7.6:6.8,mobile?6.4:5.6,mobile?10.2:8.5);table.position.set(mobile?1.4:2.1,mobile?-.55:-.35,.2);table.scale.setScalar(mobile?.88:1);};
  resize();addEventListener("resize",resize,{passive:true});
  const animate=()=>{requestAnimationFrame(animate);if(!isVisible())return;const t=clock.getElapsedTime();if(!reducedMotion){updateBalls();if(!dragging){table.rotation.y+=((-.22+targetOrbitX*.25)-table.rotation.y)*.018;table.rotation.x+=((targetOrbitY*.055)-table.rotation.x)*.018;}particles.rotation.y=t*.015;spot.position.x=Math.sin(t*.17)*1.5;}camera.lookAt(1.8,-.3,0);renderer.render(scene,camera);};
  animate();
}

try { initHeroScene(); } catch (error) { console.warn("Hero scene unavailable", error); }
try { initCocktailScene(); } catch (error) { console.warn("Cocktail scene unavailable", error); }
try { initBilliardsScene(); } catch (error) { console.warn("Billiards scene unavailable", error); }

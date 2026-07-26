"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MenuItem } from "../menu-data";

type ThreeMenuBookProps = {
  categoryName: string;
  subtitle: string;
  pageNumber: number;
  pageCount: number;
  items: MenuItem[];
  direction: "next" | "previous";
  animationKey: number;
};

const serif = '"Times New Roman", Georgia, serif';
const sans = 'Inter, Arial, sans-serif';

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawPaperTexture(
  categoryName: string,
  subtitle: string,
  pageNumber: number,
  pageCount: number,
  items: MenuItem[],
  side: "left" | "right",
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1365;
  const context = canvas.getContext("2d");

  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fffaf0");
  gradient.addColorStop(0.58, "#f8efd9");
  gradient.addColorStop(1, "#eee0c5");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.07;
  for (let index = 0; index < 1300; index += 1) {
    const x = (index * 73) % canvas.width;
    const y = (index * 173) % canvas.height;
    context.fillStyle = index % 3 === 0 ? "#6e4b23" : "#ffffff";
    context.fillRect(x, y, index % 5 === 0 ? 2 : 1, 1);
  }
  context.globalAlpha = 1;

  context.strokeStyle = "rgba(109, 77, 36, 0.22)";
  context.lineWidth = 2;
  context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  context.strokeStyle = "rgba(109, 77, 36, 0.1)";
  context.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

  if (side === "left") {
    context.fillStyle = "#9d7332";
    context.font = `700 22px ${sans}`;
    context.letterSpacing = "6px";
    context.fillText(
      `CHAPTER ${String(pageNumber).padStart(2, "0")}`,
      90,
      140,
    );

    context.fillStyle = "#073c34";
    context.font = `italic 54px ${serif}`;
    context.fillText("Southernmost", 90, 260);

    context.strokeStyle = "#d5aa55";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(90, 308);
    context.lineTo(350, 308);
    context.stroke();

    const titleWords = categoryName.split(" ");
    context.font = `500 102px ${serif}`;
    context.fillStyle = "#073c34";
    let titleY = 485;
    for (const word of titleWords) {
      context.fillText(word, 90, titleY);
      titleY += 106;
    }

    context.font = `400 31px ${sans}`;
    context.fillStyle = "#6e7068";
    const subtitleWords = subtitle.split(" ");
    let line = "";
    let subtitleY = titleY + 46;
    for (const word of subtitleWords) {
      const testLine = line ? `${line} ${word}` : word;
      if (context.measureText(testLine).width > 760 && line) {
        context.fillText(line, 90, subtitleY);
        line = word;
        subtitleY += 48;
      } else {
        line = testLine;
      }
    }
    if (line) context.fillText(line, 90, subtitleY);

    context.fillStyle = "#d5aa55";
    context.beginPath();
    context.arc(820, 1090, 78, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#073c34";
    context.font = `700 39px ${serif}`;
    context.textAlign = "center";
    context.fillText("SM", 820, 1105);
    context.textAlign = "left";

    context.fillStyle = "#8a775b";
    context.font = `700 20px ${sans}`;
    context.letterSpacing = "4px";
    context.fillText("WEST PALM BEACH · FLORIDA", 90, 1240);
  } else {
    context.fillStyle = "#9d7332";
    context.font = `700 20px ${sans}`;
    context.letterSpacing = "5px";
    context.fillText("SOUTHERNMOST BAR & GRILLE", 72, 118);
    context.textAlign = "right";
    context.fillText(
      `${String(pageNumber).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`,
      952,
      118,
    );
    context.textAlign = "left";

    context.font = `500 68px ${serif}`;
    context.fillStyle = "#073c34";
    context.fillText(categoryName, 72, 220);

    context.strokeStyle = "rgba(81, 58, 30, 0.25)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(72, 258);
    context.lineTo(952, 258);
    context.stroke();

    let itemY = 330;
    for (const item of items.slice(0, 7)) {
      context.fillStyle = "#073c34";
      context.font = `600 31px ${serif}`;
      context.fillText(item.name, 72, itemY);

      context.textAlign = "right";
      context.fillStyle = "#9d7332";
      context.font = `700 25px ${serif}`;
      context.fillText(`$${item.price.toFixed(2)}`, 952, itemY);
      context.textAlign = "left";

      context.fillStyle = "#77756d";
      context.font = `400 20px ${sans}`;
      const words = item.description.split(" ");
      let description = "";
      for (const word of words) {
        const test = description ? `${description} ${word}` : word;
        if (context.measureText(test).width > 770) break;
        description = test;
      }
      if (description.length < item.description.length) description += "…";
      context.fillText(description, 72, itemY + 38);

      context.strokeStyle = "rgba(81, 58, 30, 0.14)";
      context.beginPath();
      context.moveTo(72, itemY + 76);
      context.lineTo(952, itemY + 76);
      context.stroke();
      itemY += 132;
    }

    context.fillStyle = "#8a775b";
    context.font = `600 17px ${sans}`;
    context.letterSpacing = "2px";
    context.fillText("PLEASE TELL YOUR SERVER ABOUT ALLERGIES", 72, 1260);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function drawLeatherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#0b4b42");
  gradient.addColorStop(0.46, "#063c35");
  gradient.addColorStop(1, "#032b27");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  context.globalAlpha = 0.12;
  for (let index = 0; index < 4200; index += 1) {
    const x = (index * 89) % 512;
    const y = (index * 233) % 512;
    const shade = 28 + (index % 37);
    context.fillStyle = `rgb(${shade / 2}, ${shade + 20}, ${shade + 11})`;
    context.fillRect(x, y, 1 + (index % 2), 1);
  }
  context.globalAlpha = 1;

  context.strokeStyle = "rgba(220, 174, 85, 0.48)";
  context.lineWidth = 3;
  roundedRect(context, 24, 24, 464, 464, 18);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function createTurningGeometry(width: number, height: number, fromLeft: boolean) {
  const segmentsX = 24;
  const segmentsZ = 8;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let zIndex = 0; zIndex <= segmentsZ; zIndex += 1) {
    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const u = xIndex / segmentsX;
      const v = zIndex / segmentsZ;
      const x = (fromLeft ? -1 : 1) * width * u;
      const z = -height / 2 + height * v;
      positions.push(x, 0, z);
      uvs.push(fromLeft ? 1 - u : u, 1 - v);
    }
  }

  for (let zIndex = 0; zIndex < segmentsZ; zIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = zIndex * (segmentsX + 1) + xIndex;
      const b = a + 1;
      const c = a + segmentsX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function ThreeMenuBook({
  categoryName,
  subtitle,
  pageNumber,
  pageCount,
  items,
  direction,
  animationKey,
}: ThreeMenuBookProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.remove("is-fallback");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      container.classList.add("is-fallback");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x031c19, 0.018);

    const camera = new THREE.PerspectiveCamera(
      33,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 8.7, 12.8);
    camera.lookAt(0, 0.2, -0.25);

    const root = new THREE.Group();
    root.position.y = -0.35;
    root.rotation.z = -0.018;
    scene.add(root);

    const leftTexture = drawPaperTexture(
      categoryName,
      subtitle,
      pageNumber,
      pageCount,
      items,
      "left",
    );
    const rightTexture = drawPaperTexture(
      categoryName,
      subtitle,
      pageNumber,
      pageCount,
      items,
      "right",
    );
    const leatherTexture = drawLeatherTexture();

    const leatherMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x063b34,
      map: leatherTexture,
      roughness: 0.72,
      metalness: 0.03,
      clearcoat: 0.22,
      clearcoatRoughness: 0.62,
    });
    const paperEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d6b5,
      roughness: 0.9,
      metalness: 0,
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd7ad5b,
      metalness: 0.72,
      roughness: 0.3,
    });

    const cover = new THREE.Mesh(
      new THREE.BoxGeometry(12.2, 0.28, 8.22, 2, 1, 2),
      leatherMaterial,
    );
    cover.position.y = 0.16;
    cover.castShadow = true;
    cover.receiveShadow = true;
    root.add(cover);

    const leftStack = new THREE.Mesh(
      new THREE.BoxGeometry(5.86, 0.3, 7.76),
      paperEdgeMaterial,
    );
    leftStack.position.set(-3.02, 0.42, 0);
    leftStack.castShadow = true;
    leftStack.receiveShadow = true;
    root.add(leftStack);

    const rightStack = leftStack.clone();
    rightStack.position.x = 3.02;
    root.add(rightStack);

    for (let lineIndex = 0; lineIndex < 7; lineIndex += 1) {
      const y = 0.34 + lineIndex * 0.045;
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: lineIndex % 2 === 0 ? 0xd4bd95 : 0xf5ead7,
      });
      for (const x of [-3.02, 3.02]) {
        const edge = new THREE.Mesh(
          new THREE.BoxGeometry(5.76, 0.012, 7.78),
          lineMaterial,
        );
        edge.position.set(x, y, 0);
        root.add(edge);
      }
    }

    const leftPage = new THREE.Mesh(
      new THREE.PlaneGeometry(5.68, 7.56),
      new THREE.MeshStandardMaterial({
        map: leftTexture,
        roughness: 0.84,
        metalness: 0,
      }),
    );
    leftPage.rotation.x = -Math.PI / 2;
    leftPage.position.set(-3, 0.6, 0);
    leftPage.receiveShadow = true;
    root.add(leftPage);

    const rightPage = new THREE.Mesh(
      new THREE.PlaneGeometry(5.68, 7.56),
      new THREE.MeshStandardMaterial({
        map: rightTexture,
        roughness: 0.84,
        metalness: 0,
      }),
    );
    rightPage.rotation.x = -Math.PI / 2;
    rightPage.position.set(3, 0.605, 0);
    rightPage.receiveShadow = true;
    root.add(rightPage);

    const spine = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.19, 7.48, 8, 18),
      leatherMaterial,
    );
    spine.rotation.x = Math.PI / 2;
    spine.position.y = 0.58;
    spine.castShadow = true;
    root.add(spine);

    const upperGoldBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.205, 0.025, 8, 22, Math.PI),
      goldMaterial,
    );
    upperGoldBand.rotation.x = Math.PI / 2;
    upperGoldBand.position.set(0, 0.58, -3.39);
    root.add(upperGoldBand);

    const lowerGoldBand = upperGoldBand.clone();
    lowerGoldBand.position.z = 3.39;
    root.add(lowerGoldBand);

    const fromLeft = direction === "previous";
    const turningGeometry = createTurningGeometry(5.72, 7.56, fromLeft);
    const turningMaterial = new THREE.MeshStandardMaterial({
      map: fromLeft ? leftTexture : rightTexture,
      roughness: 0.82,
      side: THREE.DoubleSide,
    });
    const turningPage = new THREE.Mesh(turningGeometry, turningMaterial);
    turningPage.position.y = 0.64;
    turningPage.castShadow = true;
    turningPage.receiveShadow = true;
    root.add(turningPage);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 18),
      new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: 0.42,
      }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const ambient = new THREE.HemisphereLight(0xffefd0, 0x04211d, 2.3);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffd397, 4.1);
    keyLight.position.set(-5, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff774d, 32, 30, 1.5);
    rimLight.position.set(7, 3.5, -5);
    scene.add(rimLight);

    const tealLight = new THREE.PointLight(0x4ce0c1, 20, 26, 1.7);
    tealLight.position.set(-8, 2.5, -3);
    scene.add(tealLight);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    const startTime = performance.now();
    let frame = 0;
    let animationFrame = 0;

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const turnProgress = prefersReducedMotion
        ? 1
        : Math.min(1, elapsed / 0.95);
      const eased =
        turnProgress < 0.5
          ? 4 * turnProgress * turnProgress * turnProgress
          : 1 - Math.pow(-2 * turnProgress + 2, 3) / 2;

      if (turnProgress < 1) {
        turningPage.visible = true;
        turningPage.rotation.z =
          (fromLeft ? -Math.PI : Math.PI) * eased;

        const position = turningGeometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;
        for (let index = 0; index < position.count; index += 1) {
          const rawX = Math.abs(position.getX(index));
          const u = rawX / 5.72;
          const lift =
            Math.sin(u * Math.PI) *
            Math.sin(turnProgress * Math.PI) *
            (0.34 + u * 0.38);
          position.setY(index, lift);
        }
        position.needsUpdate = true;
        turningGeometry.computeVertexNormals();
      } else {
        turningPage.visible = false;
      }

      pointer.x += (target.x - pointer.x) * 0.035;
      pointer.y += (target.y - pointer.y) * 0.035;
      root.rotation.z = -0.018 + pointer.x * 0.028;
      root.rotation.x = pointer.y * -0.025;
      root.position.y = -0.35 + (prefersReducedMotion ? 0 : Math.sin(time * 0.0006) * 0.025);
      camera.position.x = pointer.x * 0.34;
      camera.lookAt(0, 0.2, -0.25);

      renderer.render(scene, camera);
      frame += 1;
      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) {
            for (const value of Object.values(material)) {
              if (value instanceof THREE.Texture) value.dispose();
            }
            material.dispose();
          }
        }
      });

      leftTexture?.dispose();
      rightTexture?.dispose();
      leatherTexture?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      void frame;
    };
  }, [
    animationKey,
    categoryName,
    direction,
    items,
    pageCount,
    pageNumber,
    subtitle,
  ]);

  return (
    <div
      className="three-menu-book"
      ref={containerRef}
      aria-hidden="true"
    >
      <div className="three-menu-book-fallback">
        <span>Southernmost</span>
        <strong>{categoryName}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

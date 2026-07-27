"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type BookAtmosphereProps = {
  activeChapter: number;
};

export function BookAtmosphere({ activeChapter }: BookAtmosphereProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      mount.classList.add("is-static");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x031d19, 0.018);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const root = new THREE.Group();
    root.position.y = -0.45;
    scene.add(root);

    const table = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 18),
      new THREE.MeshPhysicalMaterial({
        color: 0x052f2a,
        roughness: 0.82,
        metalness: 0.02,
        clearcoat: 0.08,
      }),
    );
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.5;
    table.receiveShadow = true;
    scene.add(table);

    const leather = new THREE.Mesh(
      new THREE.BoxGeometry(13.6, 0.34, 8.55, 3, 1, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0x073b34,
        roughness: 0.74,
        metalness: 0.03,
        clearcoat: 0.24,
        clearcoatRoughness: 0.68,
      }),
    );
    leather.position.y = 0.03;
    leather.castShadow = true;
    leather.receiveShadow = true;
    root.add(leather);

    const goldEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(13.42, 0.36, 8.37)),
      new THREE.LineBasicMaterial({
        color: 0xd7aa52,
        transparent: true,
        opacity: 0.62,
      }),
    );
    goldEdge.position.y = 0.035;
    root.add(goldEdge);

    const spine = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 7.9, 8, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0x2a1710,
        roughness: 0.68,
        clearcoat: 0.15,
      }),
    );
    spine.rotation.x = Math.PI / 2;
    spine.position.y = 0.24;
    spine.castShadow = true;
    root.add(spine);

    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.035, 3.4),
      new THREE.MeshStandardMaterial({
        color: 0xc85845,
        roughness: 0.72,
      }),
    );
    ribbon.position.set(1.1, 0.25, 3.6);
    ribbon.rotation.y = -0.07;
    root.add(ribbon);

    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions: number[] = [];
    for (let index = 0; index < 92; index += 1) {
      dustPositions.push(
        Math.sin(index * 8.71) * 10.5,
        0.9 + ((index * 17) % 31) / 9,
        Math.cos(index * 5.43) * 6.3,
      );
    }
    dustGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dustPositions, 3),
    );
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xf6ca73,
        size: 0.035,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    );
    scene.add(dust);

    scene.add(new THREE.HemisphereLight(0xfff1d2, 0x011a17, 2.15));

    const keyLight = new THREE.DirectionalLight(0xffd394, 4.2);
    keyLight.position.set(-4.5, 11, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 36;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    const chapterLight = new THREE.PointLight(0xff7654, 34, 28, 1.7);
    chapterLight.position.set(-6 + (activeChapter % 6) * 2.25, 3.2, -3.5);
    scene.add(chapterLight);

    const tealLight = new THREE.PointLight(0x42d5b5, 24, 24, 1.8);
    tealLight.position.set(7, 2.5, 2.5);
    scene.add(tealLight);

    const fit = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov =
        2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const distanceForWidth = 16.4 / (2 * Math.tan(horizontalFov / 2));
      const distanceForHeight = 11.2 / (2 * Math.tan(verticalFov / 2));
      const distance = Math.max(distanceForWidth, distanceForHeight);
      camera.position.set(0, distance * 0.58, distance * 0.82);
      camera.lookAt(0, 0.1, 0);
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(mount);
    fit();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;

    const render = (time: number) => {
      if (!reduceMotion) {
        root.rotation.z = Math.sin(time * 0.00022) * 0.005;
        dust.rotation.y = time * 0.000035;
        chapterLight.intensity = 31 + Math.sin(time * 0.0011) * 3;
      }
      renderer.render(scene, camera);
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) material.dispose();
        }
        if (object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [activeChapter]);

  return (
    <div
      className="menu-book-atmosphere"
      ref={mountRef}
      aria-hidden="true"
    />
  );
}

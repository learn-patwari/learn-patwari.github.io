import * as THREE from "three";

/* ════════════════════════════════════════════════════════════════
   3D scene — a drag-to-spin cube (à la joanramosrefusta.com) that
   explodes into a particle field as the camera flies through
   floating section markers on scroll.
   ════════════════════════════════════════════════════════════════ */

const canvas = document.getElementById("webgl");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  canvas.remove(); // no WebGL — the CSS gradient background stands alone
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);

  const PALETTE = [0x6c8cff, 0xa06bff, 0x4fd1c5];
  // lighting color beat per section: hero→about→skills→experience→projects→contact
  const SECTION_COLORS = [0x6c8cff, 0x4fd1c5, 0xa06bff, 0x6c8cff, 0xff8c6b, 0x4fd1c5].map(
    (c) => new THREE.Color(c)
  );

  /* ─────────── lights ─────────── */
  scene.add(new THREE.AmbientLight(0x8090c0, 0.5));

  const keyLight = new THREE.PointLight(0x6c8cff, 220, 80);
  keyLight.position.set(8, 6, 8);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xa06bff, 160, 80);
  rimLight.position.set(-8, -4, 4);
  scene.add(rimLight);

  const mouseLight = new THREE.PointLight(0x4fd1c5, 90, 40);
  mouseLight.position.set(0, 0, 6);
  scene.add(mouseLight);

  /* ─────────── the cube: 3×3×3 cubelets ─────────── */
  const cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const cubelets = [];
  const boxGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x141c33,
    metalness: 0.85,
    roughness: 0.28,
  });

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubelet = new THREE.Mesh(boxGeo, bodyMat);
        const edgeColor = PALETTE[(x + y + z + 30) % PALETTE.length];
        const edges = new THREE.LineSegments(
          edgeGeo,
          new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.85 })
        );
        cubelet.add(edges);

        const base = new THREE.Vector3(x, y, z);
        cubelet.position.copy(base);
        cubelet.userData = {
          base,
          // explosion trajectory: outward from center + jitter
          dir: base
            .clone()
            .addScalar(0.0001)
            .normalize()
            .add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.9,
              (Math.random() - 0.5) * 0.9,
              (Math.random() - 0.5) * 0.9
            ))
            .normalize(),
          dist: 5 + Math.random() * 9,
          spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          spinSpeed: (Math.random() - 0.5) * 2.4,
        };
        cubeGroup.add(cubelet);
        cubelets.push(cubelet);
      }
    }
  }

  /* ─────────── particle field along the camera path ─────────── */
  const P_COUNT = 1300;
  const pPos = new Float32Array(P_COUNT * 3);
  for (let i = 0; i < P_COUNT; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 55;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 32;
    pPos[i * 3 + 2] = 16 - Math.random() * 95;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x8ca0ff,
    size: 0.07,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ─────────── floating section markers along the path ─────────── */
  const markerDefs = [
    { geo: new THREE.IcosahedronGeometry(1.6, 0), z: -14, x: -4.5, y: 1.2 },   // about
    { geo: new THREE.TorusKnotGeometry(1.1, 0.34, 110, 14), z: -28, x: 4.5, y: -0.8 }, // skills
    { geo: new THREE.OctahedronGeometry(1.7, 0), z: -42, x: -4.2, y: 0.8 },    // experience
    { geo: new THREE.DodecahedronGeometry(1.5, 0), z: -56, x: 4.2, y: 1.4 },   // projects
    { geo: new THREE.TorusGeometry(1.6, 0.32, 14, 40), z: -70, x: 0, y: 0 },   // contact
  ];

  const markers = markerDefs.map((d, i) => {
    const mesh = new THREE.Mesh(
      d.geo,
      new THREE.MeshStandardMaterial({
        color: 0x141c33,
        metalness: 0.9,
        roughness: 0.3,
        wireframe: false,
      })
    );
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(d.geo),
      new THREE.LineBasicMaterial({ color: PALETTE[i % PALETTE.length], transparent: true, opacity: 0.7 })
    );
    mesh.add(wire);
    mesh.position.set(d.x, d.y, d.z);
    mesh.userData.spin = 0.15 + Math.random() * 0.2;
    scene.add(mesh);
    return mesh;
  });

  /* ─────────── layout: cube sits right of the hero copy ─────────── */
  let cubeAnchorX = 3.4;
  function layout() {
    const w = window.innerWidth;
    camera.aspect = w / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(w, window.innerHeight);
    cubeAnchorX = w < 860 ? 0 : 3.4; // centered (behind copy) on small screens
  }
  layout();
  window.addEventListener("resize", layout);

  camera.position.set(0, 0.2, 10);

  /* ─────────── drag-to-spin with inertia ─────────── */
  const hero = document.getElementById("home");
  const dragHint = document.getElementById("dragHint");
  let dragging = false;
  let velX = 0, velY = 0;
  let lastPX = 0, lastPY = 0;

  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    dragging = true;
    lastPX = e.clientX;
    lastPY = e.clientY;
    hero.classList.add("dragging");
    if (dragHint) dragHint.classList.add("fade");
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    velY = (e.clientX - lastPX) * 0.006;
    velX = (e.clientY - lastPY) * 0.006;
    cubeGroup.rotation.y += velY;
    cubeGroup.rotation.x += velX;
    lastPX = e.clientX;
    lastPY = e.clientY;
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
    hero.classList.remove("dragging");
  });

  /* ─────────── mouse parallax ─────────── */
  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* ─────────── scroll state ─────────── */
  let scrollProgress = 0;
  let smooth = 0;

  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }
  readScroll();
  window.addEventListener("scroll", readScroll, { passive: true });

  const smoothstep = (a, b, t) => {
    const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };

  const tmpColor = new THREE.Color();

  /* ─────────── render loop ─────────── */
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    smooth += (scrollProgress - smooth) * 0.07;

    /* cube: idle spin + inertia + float */
    if (!dragging) {
      cubeGroup.rotation.y += velY;
      cubeGroup.rotation.x += velX;
      velX *= 0.95;
      velY *= 0.95;
      if (!reduceMotion) {
        cubeGroup.rotation.y += 0.0028;
        cubeGroup.rotation.x += 0.0009;
      }
    }
    cubeGroup.position.x = cubeAnchorX;
    cubeGroup.position.y = reduceMotion ? 0 : Math.sin(t * 0.8) * 0.25;

    /* explosion: cubelets disperse over the first quarter of scroll */
    const boom = smoothstep(0.04, 0.3, smooth);
    for (const c of cubelets) {
      const { base, dir, dist, spinAxis, spinSpeed } = c.userData;
      c.position.set(
        base.x + dir.x * dist * boom,
        base.y + dir.y * dist * boom,
        base.z + dir.z * dist * boom
      );
      if (boom > 0.001 && !reduceMotion) {
        c.rotateOnAxis(spinAxis, spinSpeed * 0.016 * boom);
      }
      const s = 1 - boom * 0.45;
      c.scale.set(s, s, s);
    }

    /* camera journey through the field */
    const travel = smoothstep(0.12, 1, smooth);
    const camZ = 10 - 82 * travel;
    const camX = Math.sin(travel * Math.PI * 2) * 2.2 + mouse.x * 0.7;
    const camY = 0.2 + Math.cos(travel * Math.PI * 1.5) * 1.1 + mouse.y * 0.5;
    camera.position.x += (camX - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 8);

    /* lights follow the journey; color shifts per section */
    const seg = smooth * (SECTION_COLORS.length - 1);
    const i0 = Math.min(Math.floor(seg), SECTION_COLORS.length - 2);
    tmpColor.lerpColors(SECTION_COLORS[i0], SECTION_COLORS[i0 + 1], seg - i0);
    keyLight.color.copy(tmpColor);
    keyLight.position.z = camera.position.z + 6;
    rimLight.position.z = camera.position.z - 4;
    mouseLight.position.set(mouse.x * 8, mouse.y * 5, camera.position.z - 2);

    /* markers idle-rotate */
    if (!reduceMotion) {
      for (const m of markers) {
        m.rotation.y += m.userData.spin * 0.016;
        m.rotation.x += m.userData.spin * 0.009;
      }
      particles.rotation.z = t * 0.008;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  frame();
}

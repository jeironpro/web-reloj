import * as THREE from "three";

export interface ClockController {
  start(): void;
  stop(): void;
}

const TAU = Math.PI * 2;

// Paleta alineada con tokens.css (latón, tinta, marfil)
const BRASS = 0xc19a52;
const BRASS_DARK = 0x8a6a2f;
const INK = 0x2a241c;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function makeDialTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = (font: string): void => {
    const cx = 512;
    const cy = 512;

    const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, 512);
    bg.addColorStop(0, "#f7f2e6");
    bg.addColorStop(1, "#efe7d4");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 1024);

    // Marcas de minuto (60) y hora (cada 5)
    for (let i = 0; i < 60; i += 1) {
      const a = (i / 60) * TAU - Math.PI / 2;
      const major = i % 5 === 0;
      const r1 = major ? 452 : 468;
      const r2 = 486;
      ctx.lineWidth = major ? 10 : 3;
      ctx.strokeStyle = "rgba(42, 36, 28, 0.85)";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }

    // Números romanos
    const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    ctx.font = font;
    ctx.fillStyle = "#2a241c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * TAU - Math.PI / 2;
      const r = 384;
      ctx.fillText(numerals[i], cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  };

  draw('600 72px Georgia, "Times New Roman", serif');
  document.fonts
    .load('600 72px "Fraunces"')
    .then(() => {
      draw('600 72px "Fraunces"');
      texture.needsUpdate = true;
    })
    .catch(() => {});

  return texture;
}

function makeTaperedHand(width: number, length: number, color: number): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(-width * 0.45, length * 0.72);
  shape.lineTo(0, length);
  shape.lineTo(width * 0.45, length * 0.72);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, -length * 0.14);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 1,
  });
  geometry.translate(0, 0, -0.035);

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function makeSecondHand(width: number, length: number, color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.8 });

  const rod = new THREE.Mesh(new THREE.BoxGeometry(width, length * 0.86, 0.05), material);
  rod.position.y = (length * 0.86) / 2;
  group.add(rod);

  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 2.2, width * 2.2, 0.05, 32),
    material,
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.y = -length * 0.1;
  group.add(tail);

  return group;
}

export function initClock(mount: HTMLElement): ClockController {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  scene.add(new THREE.AmbientLight(0xfff4e2, 1.0));

  const key = new THREE.DirectionalLight(0xfff1d6, 2.4);
  key.position.set(6, 9, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe8ecff, 0.8);
  fill.position.set(-7, -3, 6);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  // Caja trasera
  const caseBack = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.35, 0.3, 96),
    new THREE.MeshStandardMaterial({ color: BRASS_DARK, roughness: 0.5, metalness: 0.85 }),
  );
  caseBack.rotation.x = Math.PI / 2;
  group.add(caseBack);

  // Esfera
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(2.05, 96),
    new THREE.MeshStandardMaterial({ map: makeDialTexture(), roughness: 0.7, metalness: 0 }),
  );
  dial.position.z = 0.16;
  group.add(dial);

  // Bisel
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(2.18, 0.13, 32, 128),
    new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.3, metalness: 0.95 }),
  );
  bezel.position.z = 0.2;
  group.add(bezel);

  // Manecillas
  const hourHand = makeTaperedHand(0.2, 1.05, INK);
  hourHand.position.z = 0.3;
  group.add(hourHand);

  const minuteHand = makeTaperedHand(0.14, 1.65, INK);
  minuteHand.position.z = 0.32;
  group.add(minuteHand);

  const secondHand = makeSecondHand(0.05, 1.85, BRASS);
  secondHand.position.z = 0.34;
  group.add(secondHand);

  // Tapón central
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.16, 48),
    new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.3, metalness: 0.95 }),
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.4;
  group.add(cap);

  const BASE_TILT = -0.14;
  group.rotation.x = BASE_TILT;

  // Redimensionado
  const resize = (): void => {
    const size = mount.clientWidth || mount.clientHeight;
    if (size <= 0) return;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);

  // Paralaje suave con el puntero
  let targetX = BASE_TILT;
  let targetY = 0;
  let curX = BASE_TILT;
  let curY = 0;
  const onPointerMove = (event: PointerEvent): void => {
    const rect = mount.getBoundingClientRect();
    if (rect.width === 0) return;
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetX = BASE_TILT + ny * 0.12;
    targetY = nx * 0.35;
  };
  if (!reduceMotion) window.addEventListener("pointermove", onPointerMove);

  // Lecturas digitales
  const timeEl = document.getElementById("clockTime") as HTMLElement;
  const dateEl = document.getElementById("clockDate") as HTMLElement;
  const dateFormat = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  dateEl.textContent = dateFormat.format(new Date());

  let lastTime = "";
  let raf = 0;
  let running = false;

  const tick = (): void => {
    if (!running) return;
    raf = requestAnimationFrame(tick);

    const now = new Date();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    hourHand.rotation.z = -(hours / 12) * TAU;
    minuteHand.rotation.z = -(minutes / 60) * TAU;
    secondHand.rotation.z = -(seconds / 60) * TAU;

    if (!reduceMotion) {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      group.rotation.x = curX;
      group.rotation.y = curY;
    }

    const text = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (text !== lastTime) {
      lastTime = text;
      timeEl.textContent = text;
      timeEl.setAttribute("datetime", now.toTimeString().slice(0, 8));
    }

    renderer.render(scene, camera);
  };

  return {
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}

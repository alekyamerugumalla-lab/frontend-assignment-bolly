/* ==========================================================
   bolly — interactive 3D bottle
   Procedurally modeled pump bottle (no external 3D asset needed):
   body + pump head + nozzle + printed label texture.
   Drag with mouse (desktop) or one finger (touch) to rotate.
   ========================================================== */

(function () {
  const wrap = document.getElementById('bottle-canvas-wrap');
  const canvas = document.getElementById('bottle-canvas');
  const dragHint = document.getElementById('dragHint');
  if (!wrap || !canvas || typeof THREE === 'undefined') return;

  // ---------- renderer / scene / camera ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.4);

  // ---------- lights ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3, 5, 4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xc9b8ff, 0.7);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-2, -3, 3);
  scene.add(fill);

  // ---------- label texture (canvas-drawn, matches brand) ----------
  function makeLabelTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');

    ctx.clearRect(0, 0, c.width, c.height);

    // lime "HAIRCARE" pill — punchier than the old pink, pops against violet
    ctx.save();
    ctx.translate(56, 78);
    roundRect(ctx, 0, 0, 150, 34, 17);
    ctx.fillStyle = '#C8F14C';
    ctx.fill();
    ctx.fillStyle = '#1c1330';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('HAIRCARE', 20, 18);
    ctx.restore();

    // "NEW FORMULA" ribbon, top right — small diagonal tag for shelf appeal
    ctx.save();
    ctx.translate(420, 60);
    ctx.rotate(Math.PI / 10);
    roundRect(ctx, -10, -14, 108, 28, 14);
    ctx.fillStyle = '#F0568C';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "Space Grotesk", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEW FORMULA', 2, 1);
    ctx.restore();

    // "bolly" wordmark — soft gradient fill instead of flat white
    const wordGrad = ctx.createLinearGradient(56, 150, 420, 240);
    wordGrad.addColorStop(0, '#FFFFFF');
    wordGrad.addColorStop(1, '#F3D9FF');
    ctx.fillStyle = wordGrad;
    ctx.font = '900 92px "Archivo Black", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('bolly', 56, 240);

    // "Clarify shampoo"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 500 40px "Fraunces", serif';
    ctx.fillText('Clarify', 58, 300);
    ctx.font = '500 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('shampoo', 60, 332);

    // catchy tagline, small caps
    ctx.font = '700 14px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#C8F14C';
    ctx.fillText('KNOCK OUT FLAKES, FOR GOOD', 58, 356);

    // thin divider
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(56, 380);
    ctx.lineTo(320, 380);
    ctx.stroke();

    // star rating — quick trust signal
    ctx.font = '600 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#C8F14C';
    ctx.fillText('★★★★★', 56, 408);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '500 13px "Space Grotesk", sans-serif';
    ctx.fillText('4.9 (2.3k reviews)', 150, 407);

    ctx.font = '500 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('300ML  •  VEGAN  •  SULFATE-FREE', 56, 434);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // ---------- body texture: violet-to-magenta gradient with a soft gloss ----------
  function makeBodyTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#7A55C7');
    grad.addColorStop(0.55, '#5B3FA0');
    grad.addColorStop(1, '#3C2768');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 512);
    // vertical gloss streak
    const gloss = ctx.createLinearGradient(0, 0, 64, 0);
    gloss.addColorStop(0, 'rgba(255,255,255,0)');
    gloss.addColorStop(0.18, 'rgba(255,255,255,0.22)');
    gloss.addColorStop(0.32, 'rgba(255,255,255,0)');
    gloss.addColorStop(0.85, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, 64, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const labelTexture = makeLabelTexture();
  const bodyTexture = makeBodyTexture();
  bodyTexture.wrapS = THREE.ClampToEdgeWrapping;
  bodyTexture.wrapT = THREE.ClampToEdgeWrapping;

  // ---------- bottle group ----------
  const bottle = new THREE.Group();
  scene.add(bottle);

  const violetMat = new THREE.MeshStandardMaterial({
    map: bodyTexture, color: 0xffffff, roughness: 0.32, metalness: 0.08
  });
  const violetDeepMat = new THREE.MeshStandardMaterial({
    color: 0x3c2768, roughness: 0.4, metalness: 0.05
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf4f2f8, roughness: 0.45, metalness: 0.02
  });
  const clearMat = new THREE.MeshStandardMaterial({
    color: 0xd9d2ec, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85
  });

  // body — rounded squarish bottle via cylinder w/ many segments + slight taper
  const bodyGeo = new THREE.CylinderGeometry(1.05, 1.15, 3.0, 48, 1, false);
  const body = new THREE.Mesh(bodyGeo, violetMat);
  body.position.y = 0.1;
  bottle.add(body);

  // label plane wrapped on the front
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
  const labelGeo = new THREE.CylinderGeometry(1.061, 1.161, 3.0, 48, 1, true, Math.PI * 0.62, Math.PI * 0.78);
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = 0.1;
  bottle.add(label);

  // shoulder taper
  const shoulderGeo = new THREE.CylinderGeometry(0.46, 1.05, 0.5, 48);
  const shoulder = new THREE.Mesh(shoulderGeo, violetDeepMat);
  shoulder.position.y = 1.85;
  bottle.add(shoulder);

  // neck
  const neckGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.35, 32);
  const neck = new THREE.Mesh(neckGeo, whiteMat);
  neck.position.y = 2.18;
  bottle.add(neck);

  // pump collar
  const collarGeo = new THREE.CylinderGeometry(0.5, 0.48, 0.22, 32);
  const collar = new THREE.Mesh(collarGeo, whiteMat);
  collar.position.y = 2.34;
  bottle.add(collar);

  // pump stem
  const stemGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.55, 20);
  const stem = new THREE.Mesh(stemGeo, whiteMat);
  stem.position.y = 2.72;
  bottle.add(stem);

  // pump head (the horizontal press part) — r128 has no CapsuleGeometry,
  // so build an equivalent from a cylinder capped with two spheres.
  const headGroup = new THREE.Group();
  const headCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.55, 16), whiteMat);
  headCyl.rotation.z = Math.PI / 2;
  headGroup.add(headCyl);
  const headCapA = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), whiteMat);
  headCapA.position.x = 0.275;
  headGroup.add(headCapA);
  const headCapB = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), whiteMat);
  headCapB.position.x = -0.275;
  headGroup.add(headCapB);
  const head = headGroup;
  head.position.set(0.05, 3.02, 0.12);
  bottle.add(head);

  // nozzle spout
  const spoutGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.42, 16);
  const spout = new THREE.Mesh(spoutGeo, whiteMat);
  spout.rotation.x = Math.PI / 2.1;
  spout.position.set(0.05, 3.0, 0.48);
  bottle.add(spout);

  // soft ground shadow (fake, via gradient disc)
  const shadowGeo = new THREE.CircleGeometry(1.5, 48);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(60,39,104,0.35)');
  grad.addColorStop(1, 'rgba(60,39,104,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.55;
  scene.add(shadowMesh);

  bottle.position.y = -0.35;
  bottle.rotation.y = -0.5;

  // ---------- resize ----------
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- drag-to-rotate (mouse + touch) ----------
  let dragging = false;
  let lastX = 0, lastY = 0;
  let velocityY = 0.0025; // gentle idle spin until first interaction
  let hasInteracted = false;
  let targetRotX = 0.12;

  function pointerDown(x, y) {
    dragging = true;
    lastX = x; lastY = y;
    if (!hasInteracted) {
      hasInteracted = true;
      dragHint.classList.add('hidden');
    }
  }
  function pointerMove(x, y) {
    if (!dragging) return;
    const dx = x - lastX;
    const dy = y - lastY;
    bottle.rotation.y += dx * 0.01;
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.006, -0.5, 0.6);
    velocityY = dx * 0.0006;
    lastX = x; lastY = y;
  }
  function pointerUp() { dragging = false; }

  // mouse
  wrap.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);

  // touch
  wrap.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    pointerDown(t.clientX, t.clientY);
  }, { passive: true });
  wrap.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    pointerMove(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', pointerUp);

  // ---------- render loop ----------
  function animate() {
    requestAnimationFrame(animate);
    if (!dragging) {
      bottle.rotation.y += velocityY;
      velocityY *= 0.985; // friction back to gentle idle spin
      if (Math.abs(velocityY) < 0.0018) velocityY = 0.0022;
    }
    bottle.rotation.x += (targetRotX - bottle.rotation.x) * 0.08;
    renderer.render(scene, camera);
  }
  animate();
})();

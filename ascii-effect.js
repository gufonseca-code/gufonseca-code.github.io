/* ascii-effect.js: cria e gerencia o efeito visual de texto ASCII em canvas.
   - initAsciiEffect(canvas): inicializa estado, handlers e loop de animação.
   - cleanup via destroy() retornado. */

const charsStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+={}[]|:;<>,.?/~`!§±\\\"'";
const chars = charsStr.split('');
const charsLen = chars.length;

export function initAsciiEffect(canvas) {
  // Seção 1: estado e configurações iniciais

  const ctx = canvas.getContext('2d');

  let width, height;
  const fontSize = 16;
  let rows, cols;
  let grid = [];

  let mouse = { x: -1000, y: -1000, isHovering: false };
  const hoverRadius = 130;

  const hoverRadiusSq = hoverRadius * hoverRadius;

  let lastFrameTime = 0;
  const idleFps = 30;
  const idleInterval = 1000 / idleFps;
  const activeFps = 60;
  const activeInterval = 1000 / activeFps;

  let isDirty = true;

  let offscreen = null;
  let offCtx = null;
  let staticDirty = true;

  let frameCount = 0;
  const staticUpdateInterval = 90;

    // Seção 2: tratamento de resize e recálculo de grade
  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    offCtx = offscreen.getContext('2d');
    offCtx.scale(dpr, dpr);

    cols = Math.ceil(width / fontSize);
    rows = Math.ceil(height / fontSize);

    initGrid();
    staticDirty = true;
    isDirty = true;
  }

  function initGrid() {
    grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          char: chars[Math.floor(Math.random() * charsLen)],
          x: c * fontSize,
          y: r * fontSize,
          cycling: false,
          cycleTimer: 0,

          cycleDelay: (Math.random() * 3 | 0) + 2,
        });
      }
      grid.push(row);
    }
  }

  const COLOR_STEPS = 32;
  const activeColors = [];
  for (let i = 0; i < COLOR_STEPS; i++) {
    const alpha = 0.2 + (i / (COLOR_STEPS - 1)) * 0.8;
    activeColors.push(`rgba(139,92,246,${alpha.toFixed(3)})`);
  }
  const staticColor = 'rgba(220,221,222,0.05)';

  function getActiveColor(intensity) {
    const idx = Math.min(COLOR_STEPS - 1, Math.floor(intensity * COLOR_STEPS));
    return activeColors[idx];
  }

  function rebuildStaticLayer() {
    offCtx.clearRect(0, 0, width, height);
    offCtx.font = `${fontSize}px 'Fira Code', monospace`;
    offCtx.textBaseline = 'top';
    offCtx.fillStyle = staticColor;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        offCtx.fillText(cell.char, cell.x, cell.y);
      }
    }
    staticDirty = false;
  }

  let mouseRafPending = false;
  let pendingMouseX = -1000, pendingMouseY = -1000;

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    pendingMouseX = e.clientX - rect.left;
    pendingMouseY = e.clientY - rect.top;
    if (!mouseRafPending) {
      mouseRafPending = true;
      requestAnimationFrame(flushMouse);
    }
  }

  function flushMouse() {
    mouseRafPending = false;
    mouse.x = pendingMouseX;
    mouse.y = pendingMouseY;
    mouse.isHovering = mouse.x >= 0 && mouse.x <= width && mouse.y >= 0 && mouse.y <= height;
    isDirty = true;
  }

  function onMouseOut(e) {
    if (e.relatedTarget === null) {
      mouse.isHovering = false;
      isDirty = true;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      pendingMouseX = e.touches[0].clientX - rect.left;
      pendingMouseY = e.touches[0].clientY - rect.top;
      if (!mouseRafPending) {
        mouseRafPending = true;
        requestAnimationFrame(flushMouse);
      }
    }
  }

  function onTouchEnd() {
    mouse.isHovering = false;
    isDirty = true;
  }

  let resizeObserver;

  function mount() {

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
  }

    // Seção 4: loop de renderização com throttling de FPS
  function animate(timestamp) {
    frameCount++;

    const interval = mouse.isHovering ? activeInterval : idleInterval;

    if (timestamp - lastFrameTime < interval) {
      rafId = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = timestamp;

    if (frameCount % staticUpdateInterval === 0) {

      const totalCells = rows * cols;
      const toUpdate = Math.ceil(totalCells * 0.05);
      for (let i = 0; i < toUpdate; i++) {
        const r = Math.random() * rows | 0;
        const c = Math.random() * cols | 0;
        grid[r][c].char = chars[Math.random() * charsLen | 0];
      }
      staticDirty = true;
      isDirty = true;
    }

    if (!isDirty && !mouse.isHovering) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    if (staticDirty) rebuildStaticLayer();

    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(offscreen, 0, 0, width, height);

    if (!mouse.isHovering) {
      isDirty = false;
      rafId = requestAnimationFrame(animate);
      return;
    }

    const mx = mouse.x, my = mouse.y;
    const cMin = Math.max(0, Math.floor((mx - hoverRadius) / fontSize));
    const cMax = Math.min(cols - 1, Math.ceil((mx + hoverRadius) / fontSize));
    const rMin = Math.max(0, Math.floor((my - hoverRadius) / fontSize));
    const rMax = Math.min(rows - 1, Math.ceil((my + hoverRadius) / fontSize));

    ctx.font = `${fontSize}px 'Fira Code', monospace`;
    ctx.textBaseline = 'top';

    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const cell = grid[r][c];

        const dx = (cell.x + fontSize * 0.5) - mx;
        const dy = (cell.y + fontSize * 0.5) - my;

        const distSq = dx * dx + dy * dy;

        if (distSq >= hoverRadiusSq) continue;

        cell.cycleTimer++;
        if (cell.cycleTimer >= cell.cycleDelay) {
          cell.char = chars[Math.random() * charsLen | 0];
          cell.cycleTimer = 0;

          staticDirty = true;
        }

        const intensity = 1 - (distSq / hoverRadiusSq);
        ctx.fillStyle = getActiveColor(intensity);

        ctx.fillText(cell.char, cell.x, cell.y);
      }
    }

    isDirty = true;
    rafId = requestAnimationFrame(animate);
  }

  let rafId;

    // Seção 5: cleanup de listeners e animações
  function destroy() {
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseout', onMouseOut);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  mount();
  resize();
  rafId = requestAnimationFrame(animate);

  return { destroy };
}

/**
 * A regular dot grid with a smooth diagonal fade and local pointer repulsion.
 * The canvas is transparent; its parent supplies the page background.
 */
class DotField {
  constructor(canvas, { color = '#4b7fc9' } = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new TypeError('DotField requires a canvas element.');
    }
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: true });
    if (!this.context) throw new Error('A 2D canvas context is unavailable.');

    this._destroyed = false;
    this._frame = null;
    this._lastTime = 0;
    this._width = 0;
    this._height = 0;
    this._dpr = 1;
    this._dots = [];
    this._pointer = { x: 0, y: 0, active: false };
    this._rgb = [75, 127, 201];
    this._spacing = 25;
    this._radius = 122;
    this._maxShift = 22;
    this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._coarseQuery = window.matchMedia('(pointer: coarse)');

    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
    });
    canvas.setAttribute('aria-hidden', 'true');

    this._onResize = () => this._resize();
    this._onMove = (event) => this._move(event);
    this._onLeave = () => this._leave();
    this._onOut = (event) => {
      if (event.relatedTarget == null) this._leave();
    };
    this._onVisibility = () => this._visibility();
    this._onPreference = () => this._preferences();
    this._onFrame = (time) => this._tick(time);

    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('pointermove', this._onMove, { passive: true });
    window.addEventListener('pointerleave', this._onLeave, { passive: true });
    window.addEventListener('pointerout', this._onOut, { passive: true });
    window.addEventListener('blur', this._onLeave);
    document.addEventListener('visibilitychange', this._onVisibility);
    this._listenMedia(this._motionQuery, true);
    this._listenMedia(this._coarseQuery, true);

    this._observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(this._onResize)
      : null;
    this._observer?.observe(canvas);
    this.setColor(color);
    this._resize();
  }

  /** Accepts #RGB or #RRGGBB only; invalid values leave the color unchanged. */
  setColor(hex) {
    if (this._destroyed || typeof hex !== 'string') return false;
    const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
    if (!match) return false;
    let digits = match[1];
    if (digits.length === 3) digits = [...digits].map((c) => c + c).join('');
    this._rgb = [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16));
    if (!document.hidden) this._draw();
    return true;
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._stop();
    this._observer?.disconnect();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerleave', this._onLeave);
    window.removeEventListener('pointerout', this._onOut);
    window.removeEventListener('blur', this._onLeave);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._listenMedia(this._motionQuery, false);
    this._listenMedia(this._coarseQuery, false);
    this.context.clearRect(0, 0, this._width, this._height);
    this._dots = [];
  }

  _listenMedia(query, add) {
    if (typeof query.addEventListener === 'function') {
      query[add ? 'addEventListener' : 'removeEventListener']('change', this._onPreference);
    } else {
      query[add ? 'addListener' : 'removeListener'](this._onPreference);
    }
  }

  _resize() {
    if (this._destroyed) return;
    const bounds = this.canvas.getBoundingClientRect();
    const width = Math.max(0, bounds.width);
    const height = Math.max(0, bounds.height);
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    if (width === this._width && height === this._height && dpr === this._dpr) return;

    this._stop();
    this._width = width;
    this._height = height;
    this._dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._dots = [];
    this._pointer.active = false;

    // The fade depends on both coordinates. Smoothstep has no hard diagonal edge.
    const smooth = (t) => {
      const clamped = Math.min(1, Math.max(0, t));
      return clamped * clamped * (3 - 2 * clamped);
    };
    const step = this._spacing;
    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        const progress = (x / Math.max(width, 1) + 1 - y / Math.max(height, 1)) / 2;
        const edgeFade = 1 - smooth((y / Math.max(height, 1) - .58) / .42);
        const fade = Math.pow(1 - smooth(progress / 1.02), 1.35) * edgeFade;
        this._dots.push({
          x, y,
          ox: 0, oy: 0, vx: 0, vy: 0,
          size: (0.22 + 0.93 * fade) * edgeFade,
          alpha: 0.30 * fade,
        });
      }
    }
    if (!document.hidden) this._draw();
  }

  _move(event) {
    if (this._destroyed || this._motionQuery.matches || this._coarseQuery.matches
      || document.hidden || event.pointerType === 'touch') return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    const bounds = this.canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (x < 0 || y < 0 || x > this._width || y > this._height) {
      this._leave();
      return;
    }
    this._pointer.x = x;
    this._pointer.y = y;
    this._pointer.active = true;
    this._schedule();
  }

  _leave() {
    if (this._destroyed || !this._pointer.active) return;
    this._pointer.active = false;
    this._schedule();
  }

  _preferences() {
    if (this._destroyed) return;
    this._pointer.active = false;
    if (this._motionQuery.matches || this._coarseQuery.matches) {
      this._stop();
      for (const dot of this._dots) dot.ox = dot.oy = dot.vx = dot.vy = 0;
      if (!document.hidden) this._draw();
    } else {
      this._schedule();
    }
  }

  _visibility() {
    if (this._destroyed) return;
    this._pointer.active = false;
    if (document.hidden) {
      this._stop();
    } else {
      this._resize();
      this._draw();
      this._schedule();
    }
  }

  _schedule() {
    if (this._destroyed || this._frame !== null || document.hidden
      || this._motionQuery.matches || this._coarseQuery.matches) return;
    this._frame = requestAnimationFrame(this._onFrame);
  }

  _stop() {
    if (this._frame !== null) cancelAnimationFrame(this._frame);
    this._frame = null;
    this._lastTime = 0;
  }

  _tick(time) {
    this._frame = null;
    if (this._destroyed || document.hidden || this._motionQuery.matches
      || this._coarseQuery.matches) {
      this._lastTime = 0;
      return;
    }

    // Semi-implicit spring integration with bounded time and small substeps.
    const elapsed = this._lastTime ? (time - this._lastTime) / 1000 : 1 / 60;
    const delta = Math.min(0.05, Math.max(0.001, elapsed));
    this._lastTime = time;
    const steps = Math.ceil(delta / (1 / 120));
    const dt = delta / steps;
    const stiffness = 125;
    const damping = 22;
    let moving = false;

    for (const dot of this._dots) {
      let targetX = 0;
      let targetY = 0;
      if (this._pointer.active) {
        const dx = dot.x - this._pointer.x;
        const dy = dot.y - this._pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < this._radius) {
          const influence = Math.pow(1 - distance / this._radius, 2);
          const force = this._maxShift * influence / Math.max(distance, 6);
          targetX = dx * force;
          targetY = dy * force;
        }
      }

      for (let step = 0; step < steps; step += 1) {
        dot.vx += ((targetX - dot.ox) * stiffness - dot.vx * damping) * dt;
        dot.vy += ((targetY - dot.oy) * stiffness - dot.vy * damping) * dt;
        dot.ox += dot.vx * dt;
        dot.oy += dot.vy * dt;
      }

      if (!Number.isFinite(dot.ox + dot.oy + dot.vx + dot.vy)) {
        dot.ox = dot.oy = dot.vx = dot.vy = 0;
      }
      if (Math.abs(dot.ox - targetX) < 0.018 && Math.abs(dot.oy - targetY) < 0.018
        && Math.abs(dot.vx) < 0.06 && Math.abs(dot.vy) < 0.06) {
        dot.ox = targetX;
        dot.oy = targetY;
        dot.vx = dot.vy = 0;
      } else {
        moving = true;
      }
    }

    this._draw();
    if (moving) this._schedule();
    else this._lastTime = 0;
  }

  _draw() {
    if (this._destroyed || !this.context || !this._width || !this._height) return;
    const context = this.context;
    const [r, g, b] = this._rgb;
    context.clearRect(0, 0, this._width, this._height);
    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    for (const dot of this._dots) {
      context.globalAlpha = dot.alpha;
      context.beginPath();
      context.arc(dot.x + dot.ox, dot.y + dot.oy, dot.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }
}

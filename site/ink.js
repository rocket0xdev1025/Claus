// The original entrance's ink geometry and pointer strokes, shared by the current routes.
window.ClausInk = {
  mount() {
    const root = document.documentElement;
    const ink = document.createElement("canvas");
    const veil = document.createElement("canvas");
    ink.id = "claus-ink";
    veil.id = "claus-ink-transition";
    for (const canvas of [ink, veil])
      canvas.setAttribute("aria-hidden", "true");
    veil.hidden = true;
    document.body.append(ink, veil);
    const ctx = ink.getContext("2d");
    const cover = veil.getContext("2d");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const trailLife = 920;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    let width = innerWidth,
      height = innerHeight;
    let previous = null,
      pressed = null,
      points = [],
      blooms = [];
    let strokeId = 0,
      frame = 0,
      transition = null;

    function measure() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const [canvas, context] of [
        [ink, ctx],
        [veil, cover],
      ]) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    function clearTrail() {
      previous = null;
      points = [];
      blooms = [];
      root.classList.remove("ink-pointer");
      ctx?.clearRect(0, 0, width, height);
    }
    function requestFrame() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    }
    // A closed chain of quadratic curves keeps every ink edge soft and rounded.
    function roundedShape(context, vertices) {
      const last = vertices[vertices.length - 1];
      const first = vertices[0];
      context.beginPath();
      context.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
      vertices.forEach((p, i) => {
        const next = vertices[(i + 1) % vertices.length];
        context.quadraticCurveTo(
          p.x,
          p.y,
          (p.x + next.x) / 2,
          (p.y + next.y) / 2
        );
      });
      context.closePath();
      context.fill();
    }

    function blob(context, x, y, radius, rotation = 0) {
      const vertices = Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r =
          radius *
          (1 + 0.075 * Math.sin(3 * a + 0.4) + 0.045 * Math.cos(5 * a - 0.6));
        return {
          x: x + Math.cos(a + rotation) * r,
          y: y + Math.sin(a + rotation) * r,
        };
      });
      roundedShape(context, vertices);
    }

    function addPoint(x, y, now) {
      if (!previous || now - previous.time > 140) {
        strokeId++;
        previous = { x, y, time: now, radius: 3.6, stroke: strokeId };
        points.push(previous);
        return;
      }
      const dx = x - previous.x,
        dy = y - previous.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.4) return;
      const targetRadius = clamp(
        3.4 + (distance / Math.max(8, now - previous.time)) * 1.2,
        3.4,
        7.2
      );
      previous = {
        x,
        y,
        time: now,
        radius: previous.radius * 0.55 + targetRadius * 0.45,
        stroke: strokeId,
      };
      points.push(previous);
      if (points.length > 280) points.splice(0, points.length - 280);
    }

    // Interpolate the input path before giving it thickness, so fast gestures
    // stay curved instead of exposing straight segments between pointer events.
    function curveSamples(stroke) {
      const samples = [];
      const spline = (a, b, c, d, t) =>
        0.5 *
        (2 * b +
          (-a + c) * t +
          (2 * a - 5 * b + 4 * c - d) * t * t +
          (-a + 3 * b - 3 * c + d) * t * t * t);
      for (let i = 0; i < stroke.length - 1; i++) {
        const a = stroke[Math.max(0, i - 1)],
          b = stroke[i];
        const c = stroke[i + 1],
          d = stroke[Math.min(stroke.length - 1, i + 2)];
        const steps = Math.min(
          90,
          Math.max(2, Math.ceil(Math.hypot(c.x - b.x, c.y - b.y) / 3))
        );
        for (let n = 0; n < steps; n++) {
          const t = n / steps;
          samples.push({
            x: spline(a.x, b.x, c.x, d.x, t),
            y: spline(a.y, b.y, c.y, d.y, t),
            radius: b.radius + (c.radius - b.radius) * t,
            time: b.time + (c.time - b.time) * t,
          });
        }
      }
      samples.push(stroke[stroke.length - 1]);
      return samples;
    }

    function drawTrail(now) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      // Keep the spline's older neighbours until its visible tail has passed.
      // Removing every expired input point makes that tail jump between events.
      const firstVisible = points.findIndex((p) => now - p.time < trailLife);
      points =
        firstVisible < 0 ? [] : points.slice(Math.max(0, firstVisible - 3));
      blooms = blooms.filter((p) => now - p.time < 620);
      ctx.save();
      ctx.fillStyle = "#000000";
      const strokes = [];
      for (const point of points) {
        if (
          !strokes.length ||
          strokes[strokes.length - 1][0].stroke !== point.stroke
        )
          strokes.push([]);
        strokes[strokes.length - 1].push(point);
      }
      for (const stroke of strokes) {
        if (stroke.length < 2) continue;
        const samples = curveSamples(stroke);
        const left = [],
          right = [];
        for (let i = 0; i < samples.length; i++) {
          const p = samples[i];
          const a = samples[Math.max(0, i - 1)],
            b = samples[Math.min(samples.length - 1, i + 1)];
          const dx = b.x - a.x,
            dy = b.y - a.y;
          const length = Math.hypot(dx, dy) || 1;
          const age = clamp((now - p.time) / trailLife, 0, 1);
          const r = p.radius * (1 - ease(age));
          left.push({ x: p.x - (dy / length) * r, y: p.y + (dx / length) * r });
          right.push({
            x: p.x + (dy / length) * r,
            y: p.y - (dx / length) * r,
          });
        }
        roundedShape(ctx, [...left, ...right.reverse()]);
        const head = samples[samples.length - 1];
        const r =
          head.radius * (1 - ease(clamp((now - head.time) / trailLife, 0, 1)));
        ctx.beginPath();
        ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const p of blooms) {
        const age = (now - p.time) / 620;
        const size =
          age < 0.23 ? ease(age / 0.23) : Math.pow((1 - age) / 0.77, 0.7);
        blob(ctx, p.x, p.y, p.radius * size, p.rotation);
      }
      ctx.restore();
    }

    function cancel() {
      const pending = transition;
      transition = null;
      cover?.clearRect(0, 0, width, height);
      veil.hidden = true;
      veil.classList.remove("is-active");
      delete document.body.dataset.transition;
      pending?.resolve(false);
    }
    function play(origin, swap) {
      cancel();
      clearTrail();
      if (!cover || reduced.matches || document.hidden) {
        swap();
        return Promise.resolve(true);
      }
      const point = origin || { x: width / 2, y: height / 2 };
      return new Promise((resolve, reject) => {
        transition = {
          x: clamp(point.x / width, 0, 1),
          y: clamp(point.y / height, 0, 1),
          start: performance.now(),
          revealStart: null,
          swap,
          resolve,
          reject,
        };
        veil.hidden = false;
        veil.classList.add("is-active");
        document.body.dataset.transition = "cover";
        requestFrame();
      });
    }
    function drawTransition(now) {
      if (!transition || !cover) return;
      const pending = transition;
      const x = pending.x * width,
        y = pending.y * height;
      const farthest = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      );
      const radius = farthest * 1.34 + 24;
      cover.clearRect(0, 0, width, height);
      cover.fillStyle = "#000000";
      if (now - pending.start < 420) {
        blob(cover, x, y, radius * ease((now - pending.start) / 420));
        return;
      }
      if (pending.revealStart === null) {
        // Swap only beneath a completely opaque frame, including after a slow frame.
        cover.fillRect(0, 0, width, height);
        pending.revealStart = now;
        document.body.dataset.transition = "covered";
        try {
          pending.swap();
        } catch (error) {
          const reject = pending.reject;
          transition = null;
          cancel();
          reject(error);
        }
        return;
      }
      const progress = clamp((now - pending.revealStart) / 480, 0, 1);
      document.body.dataset.transition = "reveal";
      blob(cover, x, y, radius * (1 - ease(progress)));
      if (progress >= 1) {
        transition = null;
        cancel();
        pending.resolve(true);
      }
    }
    function render(now) {
      frame = 0;
      drawTrail(now);
      drawTransition(now);
      if (!points.length) root.classList.remove("ink-pointer");
      if (points.length || blooms.length || transition) requestFrame();
    }
    document.addEventListener(
      "pointermove",
      (event) => {
        if (
          pressed &&
          Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 12
        )
          pressed.dragged = true;
        if (
          transition ||
          document.hidden ||
          event.pointerType !== "mouse" ||
          !fine.matches ||
          reduced.matches ||
          !ctx
        )
          return;
        const events = event.getCoalescedEvents?.() || [];
        for (const sample of events.length ? events : [event])
          addPoint(sample.clientX, sample.clientY, performance.now());
        if (points.length > 1) root.classList.add("ink-pointer");
        requestFrame();
      },
      { passive: true }
    );
    document.addEventListener(
      "pointerdown",
      (event) => {
        pressed = { x: event.clientX, y: event.clientY, dragged: false };
        if (event.pointerType !== "mouse") clearTrail();
      },
      { passive: true }
    );
    document.addEventListener("click", (event) => {
      const dragged = pressed?.dragged;
      pressed = null;
      if (
        transition ||
        event.defaultPrevented ||
        !event.detail ||
        dragged ||
        reduced.matches ||
        !ctx
      )
        return;
      if (
        event.target.closest(
          'a, button, input, textarea, [contenteditable="true"]'
        )
      )
        return;
      blooms.push({
        x: event.clientX,
        y: event.clientY,
        radius: 19,
        rotation: 0.4,
        time: performance.now(),
      });
      if (blooms.length > 6) blooms.shift();
      requestFrame();
    });
    document.addEventListener("keydown", clearTrail);
    document.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) clearTrail();
    });
    addEventListener("blur", clearTrail);
    addEventListener("resize", measure, { passive: true });
    document.addEventListener("scroll", clearTrail, {
      passive: true,
      capture: true,
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearTrail();
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestFrame();
    });
    fine.addEventListener("change", clearTrail);
    reduced.addEventListener("change", clearTrail);
    measure();
    return { play, cancel };
  },
};

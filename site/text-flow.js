// Keep the newspaper column beside the original artwork, including while scrolling.
window.ClausTextFlow = {
  mount(stage, home, hookPages) {
    const main = home.querySelector(".home-main");
    const hooks = home.querySelector(".home-hooks");
    const image = stage.querySelector(".claus-traveler image");
    const wave = stage.querySelector(".claus-tide path");
    const headClip = stage.querySelector("#claus-head-outline ellipse");
    const headFill = headClip
      .closest("g")
      .querySelector("[clip-path] > ellipse");
    const gap = 14;
    let outline = [],
      frame = 0,
      geometryKey = "",
      headEdge = [],
      wavePoints = [];
    const waveOutline = [];
    const length = wave.getTotalLength();
    for (let d = 0; d <= length; d += 3) {
      const point = wave.getPointAtLength(d);
      waveOutline.push({ x: point.x, y: point.y });
    }
    const ellipse = (element) =>
      ["cx", "cy", "rx", "ry"].map((name) =>
        Number(element.getAttribute(name))
      );
    const within = (x, y, [cx, cy, rx, ry]) =>
      ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    const map = (point, m) => ({
      x: m.a * point.x + m.c * point.y + m.e,
      y: m.b * point.x + m.d * point.y + m.f,
    });

    async function readOutline() {
      const source = new Image();
      source.src = image.href.baseVal;
      await source.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(source, 0, 0, 1024, 1024);
      const pixels = context.getImageData(0, 0, 1024, 1024).data;
      const clip = ellipse(headClip),
        fill = ellipse(headFill),
        left = [],
        right = [];
      // Match the SVG ink filter and the head's existing clipping/fill ellipses.
      for (let y = 0; y < 1024; y += 2) {
        let first = Infinity,
          last = -Infinity;
        for (let x = 0; x < 1024; x++) {
          if (!within(x, y, clip)) continue;
          const i = (y * 1024 + x) * 4;
          const ink = ((pixels[i + 3] - pixels[i]) / 255) * 1.25 - 0.25;
          if (ink <= 0.08 && !within(x, y, fill)) continue;
          first = Math.min(first, x);
          last = x;
        }
        if (Number.isFinite(first)) {
          left.push({ x: first, y });
          right.push({ x: last + 1, y });
        }
      }
      outline = [...left, ...right.reverse()];
      // Match pointer hit testing to the same silhouette used for text flow.
      // The image's rectangular bounds must never block the orange area.
      const hitArea = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      hitArea.setAttribute("class", "claus-hit-area");
      hitArea.setAttribute("fill", "transparent");
      hitArea.setAttribute("aria-hidden", "true");
      hitArea.setAttribute(
        "d",
        outline.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") + "Z"
      );
      image.parentElement.append(hitArea);
      schedule();
    }
    function geometry() {
      const matrix = image.getScreenCTM(),
        waveMatrix = wave.getScreenCTM();
      if (!matrix || !waveMatrix) return false;
      const key = [
        innerWidth,
        innerHeight,
        ...["a", "b", "c", "d", "e", "f"].map((k) => matrix[k]),
      ].join(",");
      if (key === geometryKey) return true;
      geometryKey = key;
      const points = outline.map((point) => map(point, matrix));
      headEdge = Array(Math.ceil(innerHeight) + 1).fill(Infinity);
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        if (a.y === b.y) continue;
        const top = Math.max(0, Math.ceil(Math.min(a.y, b.y)));
        const bottom = Math.min(
          headEdge.length - 1,
          Math.floor(Math.max(a.y, b.y))
        );
        for (let y = top; y <= bottom; y++) {
          const x = a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x);
          headEdge[y] = Math.min(headEdge[y], x);
        }
      }
      wavePoints = waveOutline.map((point) => map(point, waveMatrix));
      return true;
    }
    function fitHooks() {
      if (innerWidth < 800) {
        const headTop = headEdge.findIndex(Number.isFinite);
        const bottom = headTop < 0 ? innerHeight - gap : headTop - gap;
        hookPages.fit(Math.max(220, bottom - home.getBoundingClientRect().top));
        return;
      }
      const bounds = hooks.getBoundingClientRect();
      let bottom = innerHeight - gap;
      for (
        let y = Math.max(0, Math.ceil(bounds.top));
        y < headEdge.length;
        y++
      ) {
        if (headEdge[y] < bounds.right + gap) {
          bottom = y - gap;
          break;
        }
      }
      for (const point of wavePoints) {
        if (point.x >= bounds.left && point.x <= bounds.right)
          bottom = Math.min(bottom, point.y - gap);
      }
      hookPages.fit(Math.max(180, Math.floor(bottom - bounds.top)));
    }
    function fitBlock(block, bottom) {
      let shape = block.querySelector(":scope > .claus-text-contour");
      if (!shape) {
        shape = document.createElement("span");
        shape.className = "claus-text-contour";
        shape.setAttribute("aria-hidden", "true");
        block.prepend(shape);
      }
      shape.style.cssText = "";
      let bounds = block.getBoundingClientRect(),
        height = bounds.height;
      if (bounds.top >= bottom || bounds.bottom < 0) return;
      for (let pass = 0; pass < 8; pass++) {
        const edge = [];
        let inset = 0;
        for (let y = 0; y <= Math.ceil(height); y += 2) {
          const screenY = Math.round(bounds.top + y);
          const boundary =
            screenY >= 0 && screenY < bottom ? headEdge[screenY] : Infinity;
          const cut = Math.max(
            0,
            Math.min(bounds.width, bounds.right - boundary + gap)
          );
          inset = Math.max(inset, cut);
          edge.push({ y, cut });
        }
        if (inset < 1) break;
        const points = [
          `${inset}px 0px`,
          ...edge.map(
            (p) => `${Math.max(0, inset - p.cut).toFixed(2)}px ${p.y}px`
          ),
          `${inset}px ${Math.ceil(height)}px`,
        ];
        shape.style.width = `${inset}px`;
        shape.style.height = `${height}px`;
        shape.style.shapeOutside = `polygon(${points.join(",")})`;
        const next = block.getBoundingClientRect().height;
        if (next <= height + 0.5) break;
        height = next;
      }
    }
    function layout() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (
        stage.dataset.page !== "home" ||
        stage.dataset.motion === "running" ||
        !outline.length ||
        !geometry()
      )
        return;
      fitHooks();
      const column = main.getBoundingClientRect();
      const tideTop = Math.min(
        innerHeight,
        ...wavePoints
          .filter((p) => p.x >= column.left && p.x <= column.right)
          .map((p) => p.y)
      );
      let bottom = Math.floor(tideTop - 12);
      if (innerWidth < 800) {
        // A phone has one reading column. End it above the head so entire
        // steps and links remain legible as they scroll past the character.
        const headTop = headEdge.findIndex(Number.isFinite);
        if (headTop >= 0) bottom = Math.min(bottom, headTop - gap);
      }
      main.style.maxHeight =
        innerWidth >= 800 ? `${Math.max(140, bottom - column.top)}px` : "";
      for (const header of home.querySelectorAll(
        ".home-hooks > header, .home-journal > header"
      )) {
        header.style.maxWidth = "";
        const bounds = header.getBoundingClientRect();
        let right = bounds.right;
        for (
          let y = Math.max(0, Math.floor(bounds.top));
          y < Math.min(bottom, Math.ceil(bounds.bottom));
          y++
        )
          right = Math.min(right, headEdge[y] - gap);
        const available = Math.max(160, right - bounds.left);
        if (available < bounds.width) header.style.maxWidth = `${available}px`;
        header.dataset.tight = String(available < 240);
      }
      for (const block of home.querySelectorAll(
        ".home-copy > :is(h1, p), .home-entries > li > a"
      ))
        fitBlock(block, bottom);
      // End the reading window between lines, never through a word at the tide.
      let safeBottom = bottom;
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        range.selectNodeContents(walker.currentNode);
        for (const line of range.getClientRects()) {
          if (line.top < bottom && line.bottom > bottom)
            safeBottom = Math.min(safeBottom, line.top - 2);
        }
      }
      if (innerWidth >= 800) {
        main.style.maxHeight = `${Math.max(
          140,
          Math.floor(safeBottom - column.top)
        )}px`;
        main.style.clipPath = "";
      } else
        main.style.clipPath = `inset(0 0 ${Math.max(
          0,
          main.getBoundingClientRect().bottom - safeBottom
        )}px 0)`;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(layout);
    }
    main.addEventListener("scroll", schedule, { passive: true });
    home.addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    stage.addEventListener("claus:travel", schedule);
    document.fonts.ready.then(schedule);
    readOutline().catch(() => {
      /* The readable column remains available if the artwork cannot load. */
    });
    return { layout, schedule };
  },
};

// The reading surface fills the available width, then continues on the next page.
window.ClausReader = {
  mount(page) {
    const windowEl = page.querySelector(".guide-window");
    const flow = page.querySelector(".page-content");
    const summary = page.querySelector(".page-summary");
    const footer = page.querySelector(".page-references");
    const controls = page.querySelector(".reader-controls");
    const previous = controls.querySelector('[data-reader-step="-1"]');
    const next = controls.querySelector('[data-reader-step="1"]');
    const position = controls.querySelector(".reader-position");
    const continuous = () => page.dataset.layout === "journal";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const segmenter =
      typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter("en", { granularity: "grapheme" })
        : null;
    let index = 0,
      count = 1,
      stride = 0,
      frame = 0,
      startX = null;
    let writingFrame = 0,
      writingBlocks = [];

    function stopWriting() {
      cancelAnimationFrame(writingFrame);
      writingFrame = 0;
      for (const { element } of writingBlocks)
        element.style.removeProperty("clip-path");
      writingBlocks = [];
      delete page.dataset.writing;
    }

    function startWriting() {
      stopWriting();
      if (!continuous() || reduced.matches || document.hidden) return;
      let total = 0;
      // Reveal existing glyphs instead of adding text: justification, line breaks
      // and the full accessible article are stable from the first frame.
      for (const element of page.querySelectorAll(
        ".page-heading h1, .journal-prose p"
      )) {
        const glyphs = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          let offset = 0;
          const segments = segmenter
            ? [...segmenter.segment(node.data)].map((part) => part.segment)
            : Array.from(node.data);
          for (const text of segments) {
            glyphs.push({ node, start: offset, end: offset + text.length });
            offset += text.length;
          }
        }
        if (!glyphs.length) continue;
        writingBlocks.push({
          element,
          glyphs,
          start: total,
          end: total + glyphs.length,
        });
        total += glyphs.length;
        element.style.clipPath = "inset(0 0 100% 0)";
      }
      if (!total) return;
      page.dataset.writing = "true";
      const duration = Math.min(6000, total * 4);
      const range = document.createRange();
      let started,
        active = 0,
        previous = -1;
      function write(now) {
        writingFrame = 0;
        if (page.hidden || document.hidden || !continuous()) {
          stopWriting();
          return;
        }
        started ??= now;
        const visible = Math.min(
          total,
          Math.floor(((now - started) / duration) * total)
        );
        if (visible === total) {
          stopWriting();
          return;
        }
        try {
          if (visible !== previous) {
            previous = visible;
            while (
              active < writingBlocks.length &&
              visible >= writingBlocks[active].end
            ) {
              writingBlocks[active++].element.style.removeProperty("clip-path");
            }
            const block = writingBlocks[active];
            const glyph = block?.glyphs[visible - block.start - 1];
            if (glyph) {
              range.setStart(glyph.node, glyph.start);
              range.setEnd(glyph.node, glyph.end);
              const letter = range.getBoundingClientRect();
              const box = block.element.getBoundingClientRect();
              const lineHeight =
                parseFloat(getComputedStyle(block.element).lineHeight) ||
                letter.height;
              const top = Math.max(
                0,
                letter.top - box.top - (lineHeight - letter.height) / 2
              );
              const bottom = top + lineHeight;
              const right = Math.min(box.width, letter.right - box.left + 1);
              block.element.style.clipPath = `polygon(0 0,100% 0,100% ${top}px,${right}px ${top}px,${right}px ${bottom}px,0 ${bottom}px)`;
            }
          }
          writingFrame = requestAnimationFrame(write);
        } catch {
          stopWriting();
        }
      }
      writingFrame = requestAnimationFrame(write);
    }

    page.addEventListener("keydown", (event) => {
      if (
        !continuous() ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (event.key === "Escape") {
        stopWriting();
        return;
      }
      const step =
        event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const link = step && page.querySelector(`a[data-entry-step="${step}"]`);
      if (link) {
        event.preventDefault();
        link.click();
      }
    });
    reduced.addEventListener("change", () => {
      if (reduced.matches) stopWriting();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopWriting();
    });
    addEventListener("pagehide", stopWriting);
    function show() {
      index = Math.max(0, Math.min(index, count - 1));
      flow.style.transform = `translate3d(${-index * stride}px,0,0)`;
      previous.disabled = index === 0;
      next.disabled = index === count - 1;
      position.textContent = `${index + 1} / ${count}`;
      windowEl.setAttribute("aria-label", `Page ${index + 1} of ${count}`);
    }
    function measure() {
      frame = 0;
      if (continuous()) return;
      if (page.hidden || !windowEl.clientWidth) return;
      flow.style.transform = "none";
      const gap = parseFloat(getComputedStyle(flow).columnGap) || 0;
      stride = windowEl.clientWidth + gap;
      count = Math.max(1, Math.ceil((flow.scrollWidth + gap - 2) / stride));
      controls.dataset.single = String(count === 1);
      show();
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reader-step]");
      if (!button || button.disabled) return;
      index += Number(button.dataset.readerStep);
      show();
    });
    windowEl.addEventListener("keydown", (event) => {
      if (continuous()) return;
      if (
        !["ArrowLeft", "ArrowRight"].includes(event.key) ||
        event.target.matches("input,textarea,select")
      )
        return;
      event.preventDefault();
      index += event.key === "ArrowRight" ? 1 : -1;
      show();
    });
    windowEl.addEventListener("focusin", (event) => {
      if (continuous()) return;
      const offset =
        event.target.getBoundingClientRect().left -
        windowEl.getBoundingClientRect().left +
        index * stride;
      const targetPage = Math.floor(Math.max(0, offset) / stride);
      if (targetPage !== index) {
        index = targetPage;
        show();
      }
      windowEl.scrollLeft = 0;
    });
    windowEl.addEventListener(
      "pointerdown",
      (event) => {
        startX = event.pointerType === "touch" ? event.clientX : null;
      },
      { passive: true }
    );
    windowEl.addEventListener(
      "pointerup",
      (event) => {
        if (continuous()) {
          startX = null;
          return;
        }
        if (startX !== null && Math.abs(event.clientX - startX) > 60) {
          index += event.clientX < startX ? 1 : -1;
          show();
        }
        startX = null;
      },
      { passive: true }
    );
    new ResizeObserver(schedule).observe(windowEl);
    flow.addEventListener("load", schedule, true);
    document.fonts.ready.then(schedule);
    return {
      reflow: schedule,
      stopWriting,
      refresh() {
        stopWriting();
        index = 0;
        summary.replaceChildren();
        footer.replaceChildren();
        const lead = flow.querySelector(":scope > .guide-lead");
        if (lead) summary.append(lead);
        const actions = flow.querySelector(":scope > .guide-actions");
        if (actions) summary.append(actions);
        const facts = flow.querySelector(":scope > .hook-facts");
        if (facts) summary.append(facts);
        for (const element of flow.querySelectorAll(
          ":scope > .source-links, :scope > .related-hooks, :scope > .journal-pagination"
        ))
          footer.append(element);
        if (continuous()) {
          flow.style.removeProperty("transform");
          controls.hidden = true;
          windowEl.removeAttribute("tabindex");
          windowEl.removeAttribute("aria-label");
          startWriting();
          return;
        }
        controls.hidden = false;
        windowEl.tabIndex = 0;
        schedule();
      },
    };
  },
};

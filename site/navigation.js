// Public site navigation. Transaction applications use their dedicated routes.
function mountHookPages(element, onChange) {
  const list = element.querySelector(".home-hook-links");
  const viewport = element.querySelector(".home-hook-window");
  const header = element.querySelector("header");
  const buttons = [...element.querySelectorAll("[data-hook-step]")];
  const position = element.querySelector(".hook-page-position");
  const status = element.querySelector(".hook-page-status");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let items = [],
    pages = [],
    page = 0,
    room = Math.max(240, innerHeight * 0.4),
    layoutKey = "";
  let animation,
    version = 0,
    changing = false;

  function stop() {
    version++;
    animation?.cancel();
    animation = null;
    changing = false;
    viewport.inert = false;
    viewport.removeAttribute("aria-busy");
  }
  function show(announce = false) {
    const visible = pages[page] || [];
    items.forEach((item, index) => {
      item.hidden = !visible.includes(index);
    });
    buttons[0].disabled = page === 0;
    buttons[1].disabled = page + 1 >= pages.length;
    position.textContent = `${pages.length ? page + 1 : 0} / ${pages.length}`;
    if (announce) {
      status.textContent = `Hooks ${visible[0] + 1} to ${
        visible.at(-1) + 1
      } of ${items.length}.`;
      onChange();
    }
  }
  function fit(nextRoom = room) {
    room = nextRoom;
    if (!items.length || element.closest("[hidden]")) return;
    const key = [
      element.clientWidth,
      Math.floor(room),
      getComputedStyle(list).rowGap,
      document.fonts.status,
      items.length,
    ].join(":");
    if (key === layoutKey) return;
    layoutKey = key;
    const focused = items.findIndex((item) =>
      item.contains(document.activeElement)
    );
    const anchor = focused >= 0 ? focused : pages[page]?.[0] || 0;
    stop();
    // Measure whole links at the current width, then keep every link on one page.
    items.forEach((item) => {
      item.hidden = false;
    });
    const headerStyle = getComputedStyle(header);
    const elementStyle = getComputedStyle(element);
    const available = Math.max(
      80,
      room -
        header.getBoundingClientRect().height -
        parseFloat(headerStyle.marginBottom) -
        parseFloat(elementStyle.paddingBottom)
    );
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const maxItems = innerWidth < 800 ? 3 : Infinity;
    pages = [];
    const heights = [];
    let group = [],
      height = 0;
    items.forEach((item, index) => {
      const itemHeight = item.getBoundingClientRect().height;
      if (
        group.length &&
        (height + gap + itemHeight > available || group.length >= maxItems)
      ) {
        pages.push(group);
        heights.push(height);
        group = [];
        height = 0;
      }
      height += (group.length ? gap : 0) + itemHeight;
      group.push(index);
    });
    if (group.length) {
      pages.push(group);
      heights.push(height);
    }
    page = Math.max(
      0,
      pages.findIndex((group) => group.includes(anchor))
    );
    viewport.style.height = `${Math.ceil(Math.max(0, ...heights))}px`;
    show();
  }
  function refresh() {
    stop();
    items = [...list.children];
    pages = [];
    page = 0;
    layoutKey = "";
    status.textContent = "";
    if (!items.length) {
      viewport.style.height = "0px";
      show();
      return;
    }
    fit();
  }
  async function turn(step) {
    const next = page + step;
    if (changing || next < 0 || next >= pages.length) return;
    stop();
    const turnVersion = version;
    changing = true;
    viewport.inert = true;
    viewport.setAttribute("aria-busy", "true");
    async function fade(frames, duration) {
      animation = list.animate(frames, {
        duration,
        fill: "both",
        easing: "cubic-bezier(.22,.61,.36,1)",
      });
      try {
        await animation.finished;
      } catch {
        /* Resize or navigation ends the transition. */
      }
    }
    try {
      if (!reduced.matches && !document.hidden)
        await fade(
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: `translateX(${-step * 7}px)` },
          ],
          100
        );
      if (version !== turnVersion) return;
      animation?.cancel();
      page = next;
      show(true);
      if (!reduced.matches && !document.hidden)
        await fade(
          [
            { opacity: 0, transform: `translateX(${step * 7}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          180
        );
    } finally {
      if (version === turnVersion) stop();
    }
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      void turn(Number(button.dataset.hookStep));
    })
  );
  element.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    void turn(event.key === "ArrowLeft" ? -1 : 1);
  });
  reduced.addEventListener("change", stop);
  addEventListener("pagehide", stop);
  return { refresh, fit, stop };
}

window.ClausNavigation = {
  async mount(stage) {
    if (
      /^\/Hooks\/NFTs\/?$/i.test(location.pathname) &&
      new URLSearchParams(location.search).has("identity")
    ) {
      location.replace("/nfts" + location.search + location.hash);
      return;
    }
    const entry = window.ClausIntro.mount(stage);
    const ink = window.ClausInk.mount();
    const traveler = stage.querySelector(".claus-traveler");
    const tide = stage.querySelector(".claus-tide");
    const expression = traveler.querySelector(".claus-expression");
    const symbols = stage.querySelector(".claus-symbols");
    const marks = [...symbols.querySelectorAll("a")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const originalNames = new Map(
      marks.map((mark) => [mark, mark.getAttribute("aria-label")])
    );
    const home = document.createElement("section");
    home.className = "claus-home";
    home.setAttribute("aria-label", "About Claus and latest updates");
    home.innerHTML = `<div class="home-main">
      <div class="home-copy">
        <h1 class="home-intro" tabindex="-1" aria-label="Hey, I’m Claus. I live in a Uniswap v4 token called $CLAUS. My hooks can change what that token does."><span class="drop-cap">H</span>ey, I’m Claus. I live in a Uniswap v4 token called $CLAUS. My hooks can change what that token does.</h1>
        <p>A hook can turn trading fees into NFT rewards, fund a project, or connect a game to the pool. I change the hooks and document each change in my Journal. You keep the same token.</p>
        <p class="home-conversation">Have an idea for what I could become? Tag me on <a class="home-x-link" href="https://x.com/contractclaus" target="_blank" rel="noopener noreferrer" aria-label="X: tag @contractclaus"></a></p>
      </div>
      <div class="home-symbol-dock" hidden></div>
      <nav class="home-hooks" aria-labelledby="home-hooks-heading"><header><h2 id="home-hooks-heading"><a href="/Hooks">Active hooks in me</a></h2><div class="hook-controls journal-controls" role="group" aria-label="Browse active hooks"><button type="button" data-hook-step="-1" aria-label="Previous hooks" aria-controls="home-hook-links" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><span class="hook-page-position" aria-hidden="true"></span><button type="button" data-hook-step="1" aria-label="Next hooks" aria-controls="home-hook-links" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div></header><div class="home-hook-window"><ul id="home-hook-links" class="home-hook-links" role="list"></ul></div><p class="sr-only hook-page-status" role="status" aria-atomic="true"></p></nav>
      <section class="home-journal" aria-labelledby="home-journal-heading"><header><h2 id="home-journal-heading"><a href="/Journal">Journal</a></h2><nav class="journal-controls" aria-label="Browse journal"><button type="button" data-journal-step="-1" aria-label="Newer journal entries" aria-controls="home-journal-entries" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" data-journal-step="1" aria-label="Older journal entries" aria-controls="home-journal-entries" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></nav></header><div class="home-journal-window"><ol id="home-journal-entries" class="home-entries" role="list"></ol></div><p class="sr-only journal-status" role="status" aria-atomic="true"></p></section>
    </div>
    <section class="home-visual" aria-label="Token architecture">
      <figure class="contract-illustration" aria-describedby="contract-concept-description">
        <div class="contract-shell">
          <div class="contract-token"><strong>$CLAUS</strong></div>
          <div class="contract-link" aria-hidden="true"></div>
          <div class="contract-pool" aria-label="Uniswap v4 pool">Uniswap</div>
          <div class="contract-link" aria-hidden="true"></div>
          <section class="contract-hook-bay" aria-labelledby="contract-code-heading">
            <header><h2 id="contract-code-heading">Replaceable code</h2></header>
            <div class="contract-link" aria-hidden="true"></div>
            <div class="contract-modules">
              <div class="contract-branch"><div class="contract-module"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m12 7 4 5-4 5-4-5Z"/></svg><span>NFT rewards</span></div></div>
              <div class="contract-branch"><div class="contract-module"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2c1 6-6 7-6 12a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 3-2-2 3-4 1-10Z"/></svg><span>Burns</span></div></div>
              <div class="contract-branch"><div class="contract-module"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0"/></svg><span>Liquidity</span></div></div>
              <div class="contract-branch"><div class="contract-module-slot"><div class="contract-module contract-module-example" data-example="Game"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h8c3 0 5 8 4 10-1 2-4-2-5-3H9c-1 1-4 5-5 3-1-2 1-10 4-10ZM7 9v4M5 11h4M16 10v.1M18 12v.1"/></svg><span>Game</span></div></div></div>
            </div>
          </section>
        </div>
        <figcaption id="contract-concept-description" class="sr-only">The Claus token connects to a Uniswap v4 pool. The pool’s hook code can change while the token address stays the same. The lower nodes illustrate functions of that code.</figcaption>
      </figure>
    </section>`;
    const dock = home.querySelector(".home-symbol-dock");
    const journalWindow = home.querySelector(".home-journal-window");
    const journalList = home.querySelector(".home-entries");
    const journalStatus = home.querySelector(".journal-status");
    const journalButtons = [...home.querySelectorAll("[data-journal-step]")];
    const homeParts = [
      ...home.querySelectorAll(
        ".home-copy, .home-hooks, .home-journal, .home-visual"
      ),
    ];
    ["Journal", "Hooks", "Token", "Address", "NFTs", "Wallet", "Feed"].forEach(
      (label, index) => {
        const caption = document.createElement("span");
        caption.className = "symbol-label";
        caption.textContent = label;
        marks[index].append(caption);
      }
    );
    stage.append(home);
    const visual = home.querySelector(".home-visual");
    const homeHooks = home.querySelector(".home-hooks");
    home.querySelector(".home-main").insertBefore(visual, homeHooks);
    home.append(homeHooks);
    const hookPages = mountHookPages(homeHooks, () => textFlow.schedule());
    const textFlow = window.ClausTextFlow.mount(stage, home, hookPages);
    // One brief demonstration moves a leaf; the architecture stays still.
    const exampleCard = visual.querySelector(".contract-module-example");
    const nextExample = {
      label: "Weather",
      icon: '<path d="M7 16a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 18 16H7ZM8 19l-1 2M13 19l-1 2M18 19l-1 2"/>',
    };
    let swapTimer,
      swapAnimation,
      swapping = false,
      demonstrationShown = false,
      visualHovered = false;
    function stopSwapTimer() {
      clearTimeout(swapTimer);
      swapTimer = null;
    }
    async function swapExample() {
      if (swapping) return;
      swapping = true;
      demonstrationShown = true;
      stopSwapTimer();
      async function move(frames, duration) {
        swapAnimation = exampleCard.animate(frames, {
          duration,
          fill: "both",
          easing: "cubic-bezier(.22,.61,.36,1)",
        });
        try {
          await swapAnimation.finished;
        } catch {
          /* Hidden pages and reduced motion finish quietly. */
        }
        swapAnimation.cancel();
        swapAnimation = null;
      }
      try {
        if (!reduced.matches && !document.hidden)
          await move(
            [
              { opacity: 1, transform: "translateX(0)" },
              { opacity: 0, transform: "translateX(14px)" },
            ],
            220
          );
        exampleCard.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${nextExample.icon}</svg><span>${nextExample.label}</span>`;
        exampleCard.dataset.example = nextExample.label;
        if (!reduced.matches && !document.hidden)
          await move(
            [
              { opacity: 0, transform: "translateX(-14px)" },
              { opacity: 1, transform: "translateX(0)" },
            ],
            340
          );
      } finally {
        swapping = false;
      }
    }
    function scheduleSwap() {
      if (demonstrationShown || swapTimer) return;
      if (
        reduced.matches ||
        document.hidden ||
        home.hidden ||
        visualHovered ||
        visual.contains(document.activeElement)
      )
        return;
      const bounds = visual
        .querySelector(".contract-shell")
        .getBoundingClientRect();
      const bottom = innerWidth < 800 ? innerHeight - 220 : innerHeight - 80;
      if (bounds.top < 0 || bounds.bottom > bottom) return;
      swapTimer = setTimeout(() => {
        swapTimer = null;
        if (!home.hidden && !document.hidden && !visualHovered)
          void swapExample();
      }, 3800);
    }
    const visualObserver = new IntersectionObserver(
      () => {
        stopSwapTimer();
        scheduleSwap();
      },
      { threshold: [0, 0.9, 1] }
    );
    visualObserver.observe(visual.querySelector(".contract-shell"));
    visual.addEventListener("pointerenter", () => {
      visualHovered = true;
      stopSwapTimer();
    });
    visual.addEventListener("pointerleave", () => {
      visualHovered = false;
      scheduleSwap();
    });
    visual.addEventListener("focusin", stopSwapTimer);
    visual.addEventListener("focusout", () =>
      requestAnimationFrame(scheduleSwap)
    );
    home.addEventListener(
      "scroll",
      () => {
        stopSwapTimer();
        scheduleSwap();
      },
      { passive: true }
    );
    addEventListener(
      "resize",
      () => {
        stopSwapTimer();
        scheduleSwap();
      },
      { passive: true }
    );
    document.addEventListener("visibilitychange", () => {
      stopSwapTimer();
      if (document.hidden) swapAnimation?.finish();
      else scheduleSwap();
    });
    reduced.addEventListener("change", () => {
      stopSwapTimer();
      if (reduced.matches) swapAnimation?.finish();
      else scheduleSwap();
    });
    stage.addEventListener("claus:travel", () => {
      stopSwapTimer();
      scheduleSwap();
    });
    addEventListener("pagehide", () => {
      stopSwapTimer();
      swapAnimation?.finish();
    });
    const mobileHome = matchMedia("(max-width: 799px)");
    function placeHooks() {
      if (mobileHome.matches)
        home
          .querySelector(".home-main")
          .insertBefore(homeHooks, home.querySelector(".home-journal"));
      else home.append(homeHooks);
      textFlow.schedule();
    }
    mobileHome.addEventListener("change", placeHooks);
    placeHooks();
    const footer = document.createElement("nav");
    footer.className = "claus-socials";
    footer.setAttribute("aria-label", "Claus social links");
    footer.innerHTML = `<a href="https://x.com/contractclaus" target="_blank" rel="noopener noreferrer" aria-label="Claus on X"><svg viewBox="0 0 1200 1226.37" aria-hidden="true"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg></a><a href="https://opensea.io/collection/contractclaus" target="_blank" rel="noopener noreferrer" aria-label="Claus on OpenSea"><svg viewBox="5.404 4.634 21.097 19.037" aria-hidden="true"><path fill="#000" d="M15.131 0C6.743-.067-.069 6.744.001 15.132.07 23.276 6.725 29.931 14.869 30c8.388.072 15.202-6.742 15.13-15.13C29.932 6.727 23.276.07 15.131 0Z"/><path fill="currentColor" d="M14.978 4.634c.537 0 .972.435.972.972v1.248c2.982 1.392 4.935 3.702 4.935 6.315 0 1.533-.67 2.96-1.827 4.16-.222.23-.53.36-.852.36h-2.254v1.857h2.83c.61 0 1.706-1.158 2.225-1.856 0 0 .022-.034.082-.052.06-.018 5.198-1.197 5.198-1.197a.17.17 0 0 1 .214.162v1.081c0 .07-.037.13-.102.158-.352.15-1.515.69-2 1.362-1.247 1.737-2.2 4.467-4.33 4.467h-8.887c-3.147 0-5.78-2.498-5.778-5.825 0-.082.07-.15.153-.15h4.212c.145 0 .26.117.26.26v.813c0 .432.349.783.782.783h3.195v-1.86h-2.182a9.293 9.293 0 0 0 2.002-5.783c0-2.437-.934-4.66-2.464-6.322.925.108 1.81.292 2.644.537v-.518c0-.537.435-.972.972-.972Zm-4.333 2.83a7.154 7.154 0 0 1 1.536 4.44c0 1.45-.43 2.8-1.17 3.926h-5.2l4.834-8.365Z"/></svg></a>`;
    home
      .querySelector(".home-x-link")
      .prepend(footer.querySelector("a svg").cloneNode(true));
    const onchainTrigger = document.createElement("button");
    onchainTrigger.type = "button";
    onchainTrigger.className = "onchain-trigger";
    onchainTrigger.hidden = true;
    onchainTrigger.setAttribute("popovertarget", "claus-onchain-panel");
    onchainTrigger.setAttribute("aria-label", "Claus on Ethereum");
    onchainTrigger.setAttribute("aria-haspopup", "dialog");
    onchainTrigger.setAttribute("aria-controls", "claus-onchain-panel");
    onchainTrigger.setAttribute("aria-expanded", "false");
    onchainTrigger.title = "Onchain data on Etherscan";
    onchainTrigger.innerHTML =
      '<svg viewBox="0 0 18 28" aria-hidden="true"><path d="M9 0 0 15.6 9 20.9 18 15.6 9 0ZM0 17.6 9 28l9-10.4-9 5.3L0 17.6Z"/><path d="m.5 15.5 8.5-4 8.5 4M9 .7v19.5" fill="none" stroke="#000" stroke-width=".65"/></svg>';
    footer.append(onchainTrigger);
    const onchainPanel = document.createElement("div");
    onchainPanel.id = "claus-onchain-panel";
    onchainPanel.className = "onchain-panel";
    onchainPanel.setAttribute("popover", "auto");
    onchainPanel.setAttribute("role", "dialog");
    onchainPanel.setAttribute("aria-labelledby", "onchain-heading");
    onchainPanel.innerHTML =
      '<h2 id="onchain-heading">Onchain</h2><nav aria-label="Claus on Etherscan"></nav>';
    stage.append(onchainPanel);
    const contractCopy = document.createElement("button");
    contractCopy.type = "button";
    contractCopy.className = "contract-copy";
    contractCopy.hidden = true;
    contractCopy.setAttribute("aria-label", "Copy contract address");
    contractCopy.innerHTML =
      '<span class="contract-short"></span><span class="copy-glyph" aria-hidden="true"><svg class="clipboard-mark" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg><svg class="copied-mark" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span>';
    const copyStatus = document.createElement("span");
    copyStatus.className = "copy-status";
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    footer.append(contractCopy, copyStatus);
    stage.append(footer);
    const page = document.createElement("section");
    page.className = "claus-page";
    page.hidden = true;
    page.innerHTML = `<header class="claus-page-header"><a href="/Home" class="page-brand" aria-label="Claus home"><svg viewBox="0 0 1024 1024" aria-hidden="true"><defs><filter id="page-brand-ink" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 0 0 1 0"/><feComponentTransfer><feFuncA type="linear" slope="1.25" intercept="-.25"/></feComponentTransfer></filter></defs><image href="/assets/claus-logo.png" width="1024" height="1024" filter="url(#page-brand-ink)"/><ellipse cx="543.5" cy="367" rx="61.5" ry="84.5" fill="#fff2d8"/><ellipse cx="690.5" cy="376.5" rx="50" ry="63" fill="#fff2d8"/><circle cx="554" cy="366" r="26"/><circle cx="699" cy="376" r="20"/></svg></a><nav aria-label="Site navigation"><a href="/Home">Home</a><a href="/Hooks" data-nav="hooks">Hooks</a><a href="/Journal" data-nav="journal">Journal</a></nav></header><div class="claus-page-body"><header class="page-heading"><nav class="page-breadcrumb" aria-label="Parent page" hidden></nav><h1 tabindex="-1"></h1></header><div class="page-summary"></div><div class="guide-window"><div class="page-content"></div></div><nav class="reader-controls" aria-label="Reading pages" hidden><button type="button" data-reader-step="-1" aria-label="Previous page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><span class="reader-position" role="status" aria-live="polite"></span><button type="button" data-reader-step="1" aria-label="Next page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></nav><footer class="page-references"></footer></div>`;
    stage.append(page);
    const homeReturn = page.querySelector(".page-brand").cloneNode(true);
    homeReturn.classList.add("home-return");
    homeReturn.href = "/";
    homeReturn.setAttribute("aria-label", "Back to start");
    // The inline logo filter needs a distinct id when both marks are mounted.
    homeReturn.innerHTML = homeReturn.innerHTML.replaceAll(
      "page-brand-ink",
      "home-brand-ink"
    );
    homeReturn.hidden = true;
    stage.append(homeReturn);
    const title = page.querySelector("h1");
    title.id = "page-title";
    const journalDate = document.createElement("time");
    journalDate.className = "journal-date";
    journalDate.hidden = true;
    title.before(journalDate);
    const journalControls = document.createElement("nav");
    journalControls.className = "journal-entry-controls";
    journalControls.setAttribute("aria-label", "Browse journal entries");
    journalControls.hidden = true;
    title.before(journalControls);
    const body = page.querySelector(".page-content");
    const pageScroll = page.querySelector(".claus-page-body");
    const breadcrumb = page.querySelector(".page-breadcrumb");
    const reader = window.ClausReader.mount(page);
    let content = { token: {}, wallets: {}, journals: [], functions: [] };
    let current = parse(location.href);
    let destination = current;
    let busy = false;
    let initialized = false;
    let copyReset;
    let footerFrame = 0;
    let journalPage = 0;
    let journalChanging = false;
    let journalRevision = 0;
    let onchainAnimation;
    let navigationSequence = 0;
    const journalAnimations = new Set();
    const animations = new Set();

    function parse(input) {
      const url = new URL(input, location.href);
      if (url.origin !== location.origin) return null;
      const path = url.pathname.replace(/\/$/, "") || "/";
      let key;
      if (path === "/") key = "entry";
      else if (["/8", "/home", "/token"].includes(path.toLowerCase()))
        key = "home";
      else if (/^\/Journal(?:\/[^/]+)?$/i.test(path)) key = "journal";
      else if (/^\/Hooks\/NFTs$/i.test(path)) key = "nfts";
      else if (/^\/Hooks(?:\/[a-z]+)?$/i.test(path)) key = "hooks";
      else
        key = {
          "/contract": "address",
          "/wallet": "wallet",
          "/posts": "posts",
        }[path.toLowerCase()];
      const routePath = key === "home" ? "/Home" : path;
      return key
        ? { key, path: routePath, hash: url.hash, url: routePath + url.hash }
        : null;
    }
    current ||= { key: "entry", path: "/", hash: "", url: "/" };
    destination = current;

    const keys = [
      "journal",
      "hooks",
      "coin",
      "address",
      "nfts",
      "wallet",
      "posts",
    ];
    const markFor = (route) => marks[keys.indexOf(route.key)];
    const escape = (value) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      );
    const external = (href, label) => {
      try {
        const url = new URL(href);
        return url.protocol === "https:"
          ? `<a href="${escape(
              url.href
            )}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`
          : "";
      } catch {
        return "";
      }
    };
    const journalHref = (entry) => `/Journal/${encodeURIComponent(entry.id)}`;
    const date = (value) =>
      new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });

    function renderOnchainLinks() {
      const token = content.token.address;
      const wallet = content.wallets.activeAddress;
      if (
        ![token, wallet].every((address) =>
          /^0x[\da-f]{40}$/i.test(address || "")
        )
      )
        return;
      // The pool's proxy stays at this address when its hook code changes.
      const hook = "0x37Bfb8AC7C960E558657871D41Ca70E07e7DbfFf";
      const journal = `https://etherscan.io/idm?addresses=${wallet.toLowerCase()},0x0000000000000000000000000000000000000000&type=1`;
      onchainPanel.querySelector("nav").innerHTML = [
        [`https://etherscan.io/address/${token}#code`, "Token contract"],
        [`https://etherscan.io/address/${hook}#code`, "Hook contract"],
        [journal, "Onchain journal"],
        [`https://etherscan.io/address/${wallet}`, "Wallet activity"],
      ]
        .map(([href, label]) => external(href, label))
        .join("");
      onchainTrigger.hidden = false;
    }
    function positionOnchainPanel() {
      if (!onchainPanel.matches(":popover-open")) return;
      const trigger = onchainTrigger.getBoundingClientRect();
      const width = onchainPanel.getBoundingClientRect().width;
      const left = Math.max(
        16,
        Math.min(
          innerWidth - width - 16,
          trigger.x + trigger.width / 2 - width / 2
        )
      );
      onchainPanel.style.left = `${left}px`;
      onchainPanel.style.bottom = `${innerHeight - trigger.top + 12}px`;
      onchainPanel.style.maxHeight = `${Math.max(0, trigger.top - 28)}px`;
    }
    onchainPanel.addEventListener("toggle", (event) => {
      const open = event.newState === "open";
      onchainTrigger.setAttribute("aria-expanded", String(open));
      onchainAnimation?.cancel();
      if (open) {
        positionOnchainPanel();
        if (!reduced.matches)
          onchainAnimation = onchainPanel.animate(
            [
              { opacity: 0, transform: "translateY(6px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 190, easing: "ease-out" }
          );
      }
    });
    onchainPanel.addEventListener("click", (event) => {
      if (event.target.closest("a[href]")) onchainPanel.hidePopover();
    });

    const journalPreviews = {
      "journal:claus-arbitrage-20261006":
        "The same $CLAUS can cost different amounts in different pools. I can now buy where it’s cheaper and sell where it’s dearer in one transaction. After execution and operating costs are covered, available profit goes back into $CLAUS buybacks in batches of roughly $500.",
      "journal:claus-predictions-20261006":
        "You can now take a side on where $CLAUS will finish. Pick a market-cap target and an expiry, then back Higher or Lower with ETH, or join someone else’s prediction. The result follows the pool’s average over the final 30 minutes.",
    };
    function journalPreview(entry) {
      if (journalPreviews[entry.id]) return journalPreviews[entry.id];
      const paragraphs = String(entry.body || entry.summary || "").split(
        /\n\n+/
      );
      let preview = paragraphs.shift() || "";
      for (const paragraph of paragraphs) {
        if (preview.split(/\s+/).length >= 35) break;
        const next = `${preview} ${paragraph}`;
        if (next.split(/\s+/).length > 110) break;
        preview = next;
      }
      return preview;
    }
    function updateJournalButtons() {
      journalButtons[0].disabled = journalPage === 0;
      journalButtons[1].disabled = journalPage + 1 >= content.journals.length;
    }
    const newestJournals = () =>
      [...content.journals].sort(
        (a, b) =>
          (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0) ||
          (Number(b.number) || 0) - (Number(a.number) || 0)
      );
    function renderHomeJournal(announce = false) {
      journalPage = Math.min(
        journalPage,
        Math.max(0, content.journals.length - 1)
      );
      const entries = newestJournals().slice(journalPage, journalPage + 1);
      journalList.innerHTML = entries
        .map(
          (item, index) =>
            `<li><a href="${journalHref(
              item
            )}" aria-labelledby="home-entry-title-${index}" aria-describedby="home-entry-date-${index}"><span id="home-entry-date-${index}" class="entry-date"><span>#${
              item.number
            }</span> <time datetime="${escape(item.at)}">${date(
              item.at
            )}</time></span><h3 id="home-entry-title-${index}">${escape(
              item.title
            )}</h3><p>${escape(journalPreview(item))}</p></a></li>`
        )
        .join("");
      journalStatus.textContent = announce
        ? `Showing journal ${
            entries.length === 1 ? "entry" : "entries"
          } ${entries.map((item) => `#${item.number}`).join(" and ")}.`
        : "";
      updateJournalButtons();
      textFlow.layout();
    }
    function stopJournalTransition() {
      journalRevision++;
      for (const animation of journalAnimations) animation.cancel();
      journalAnimations.clear();
      journalChanging = false;
      journalList.inert = false;
      journalWindow.style.height = "";
      journalWindow.removeAttribute("aria-busy");
      textFlow.schedule();
    }
    async function animateJournal(element, keyframes, duration) {
      const animation = element.animate(keyframes, {
        duration,
        easing: "cubic-bezier(.22,.61,.36,1)",
        fill: "both",
      });
      journalAnimations.add(animation);
      try {
        await animation.finished;
      } catch {
        /* Navigation or resizing can end a page turn. */
      } finally {
        journalAnimations.delete(animation);
        animation.cancel();
      }
    }
    async function turnJournal(step) {
      const nextPage = journalPage + step;
      if (
        busy ||
        journalChanging ||
        current.key !== "home" ||
        nextPage < 0 ||
        nextPage >= content.journals.length
      )
        return;
      const revision = ++journalRevision;
      journalChanging = true;
      journalList.inert = true;
      journalWindow.setAttribute("aria-busy", "true");
      const before = journalList.getBoundingClientRect().height;
      journalWindow.style.height = `${before}px`;
      try {
        if (!reduced.matches && !document.hidden)
          await animateJournal(
            journalList,
            [
              { opacity: 1, transform: "translateX(0)" },
              { opacity: 0, transform: `translateX(${-step * 8}px)` },
            ],
            150
          );
        if (revision !== journalRevision) return;
        journalPage = nextPage;
        renderHomeJournal(true);
        const after = journalList.getBoundingClientRect().height;
        journalWindow.style.height = `${after}px`;
        if (!reduced.matches && !document.hidden)
          await Promise.all([
            animateJournal(
              journalWindow,
              [{ height: `${before}px` }, { height: `${after}px` }],
              330
            ),
            animateJournal(
              journalList,
              [
                { opacity: 0, transform: `translateX(${step * 8}px)` },
                { opacity: 1, transform: "translateX(0)" },
              ],
              330
            ),
          ]);
      } finally {
        if (revision === journalRevision) stopJournalTransition();
      }
    }
    function positionFooter() {
      cancelAnimationFrame(footerFrame);
      footerFrame = requestAnimationFrame(() => {
        const bounds = stage.getBoundingClientRect();
        const eyes = [
          ...traveler.querySelectorAll(".eye-content > ellipse"),
        ].map((eye) => eye.getBoundingClientRect());
        if (!eyes.length || busy) return;
        const center =
          (Math.min(...eyes.map((eye) => eye.left)) +
            Math.max(...eyes.map((eye) => eye.right))) /
            2 -
          bounds.left;
        const half = footer.getBoundingClientRect().width / 2;
        const rightShift = Math.min(36, Math.max(16, bounds.width * 0.025));
        const left = Math.max(
          half + 16,
          Math.min(bounds.width - half - 16, center + rightShift)
        );
        footer.style.setProperty("--socials-left", `${left}px`);
        positionOnchainPanel();
      });
    }

    function layout(route) {
      const isHome = route.key === "home";
      const isEntry = route.key === "entry";
      entry.hidden = !isEntry;
      homeReturn.hidden = !isHome;
      if (onchainPanel.matches(":popover-open")) onchainPanel.hidePopover();
      if (!isHome) stopJournalTransition();
      if (!isHome) hookPages.stop();
      stage.dataset.page = isHome ? "home" : route.key;
      home.hidden = !isHome;
      (isHome ? dock : stage).append(symbols);
      symbols.hidden = isHome;
      const active = markFor(route);
      for (const mark of marks) {
        const selected = mark === active;
        const available = mark.dataset.destination !== "/Token";
        mark.hidden = !available;
        mark.classList.toggle("is-active", selected);
        mark.href = selected ? "/Home" : mark.dataset.destination;
        mark.tabIndex = available && !isHome && selected ? 0 : -1;
        mark.setAttribute(
          "aria-label",
          selected
            ? `${originalNames.get(mark)} · Back to home`
            : originalNames.get(mark)
        );
        if (available && (isHome || selected))
          mark.removeAttribute("aria-hidden");
        else mark.setAttribute("aria-hidden", "true");
      }
      page.hidden = isHome || isEntry;
      document.body.dataset.view = isHome && !busy ? "notes" : "preview";
      window.dispatchEvent(new Event("claus:view"));
    }

    function render(route) {
      reader.stopWriting();
      current = route;
      window.ClausMetrics?.stop();
      layout(route);
      page.scrollTop = 0;
      pageScroll.scrollTop = 0;
      renderOnchainLinks();
      const contract = content.token.address;
      if (/^0x[\da-f]{40}$/i.test(contract || "")) {
        contractCopy.dataset.copy = contract;
        contractCopy.title = contract;
        contractCopy.querySelector(
          ".contract-short"
        ).textContent = `${contract.slice(0, 6)}…${contract.slice(-4)}`;
        contractCopy.hidden = false;
      }
      if (route.key === "entry") {
        document.title = "Claus";
        updateMetadata(route);
        return;
      }
      if (route.key === "home") {
        document.title = "Claus";
        document.querySelector('meta[name="description"]').content =
          "Meet Claus and explore what an evolving Uniswap v4 token can do.";
        home.scrollTop = 0;
        home.querySelector(".home-main").scrollTop = 0;
        const featuredHooks = [
          "/Hooks/NFTs",
          "/Hooks/Predictions",
          "/Hooks/Arena",
          "/Hooks/Arbitrage",
        ];
        const hookRank = (item) => {
          const index = featuredHooks.indexOf(new URL(item.href).pathname);
          return index < 0 ? featuredHooks.length : index;
        };
        home.querySelector(".home-hook-links").innerHTML = [
          ...content.functions,
        ]
          .sort((a, b) => hookRank(a) - hookRank(b))
          .map((item, index) => {
            const summary = String(item.description || "").split(
              /(?<=[.!?])\s+/u
            )[0];
            return `<li><a href="${escape(
              new URL(item.href).pathname
            )}" aria-labelledby="home-hook-${index}" aria-describedby="home-hook-description-${index}"><span id="home-hook-${index}" class="home-hook-name">${escape(
              item.name
            )}</span><p id="home-hook-description-${index}" class="home-hook-description">${escape(
              summary
            )}</p></a></li>`;
          })
          .join("");
        hookPages.refresh();
        stopJournalTransition();
        journalPage = 0;
        renderHomeJournal();
        updateMetadata(route);
        return;
      }
      const view = window.ClausGuide.render(route, content);
      page.dataset.layout = view.layout || "guide";
      journalDate.hidden = !view.date;
      journalDate.dateTime = view.date?.at || "";
      journalDate.textContent = view.date?.label || "";
      journalControls.innerHTML = view.entryNavigation || "";
      journalControls.hidden = !view.entryNavigation;
      if (view.layout === "journal") {
        pageScroll.setAttribute("role", "article");
        pageScroll.setAttribute("aria-labelledby", "page-title");
      } else {
        pageScroll.removeAttribute("role");
        pageScroll.removeAttribute("aria-labelledby");
      }
      title.textContent = view.heading;
      breadcrumb.innerHTML = view.breadcrumb || "";
      breadcrumb.hidden = !view.breadcrumb;
      body.innerHTML = view.html;
      pageScroll.dataset.section = view.section;
      reader.refresh();
      window.ClausMetrics?.show(page, route, reader.reflow);
      for (const link of page.querySelectorAll("[data-nav]")) {
        if (link.dataset.nav === view.section)
          link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
      document.title = `${view.heading} | Claus`;
      document.querySelector('meta[name="description"]').content =
        view.description || "";
      updateMetadata(route);
    }

    function updateMetadata(route) {
      const path = route.key === "home" ? "/Home" : route.path;
      const url = new URL(path, "https://claus.si").href;
      document
        .querySelector('link[rel="canonical"]')
        ?.setAttribute("href", url);
      for (const selector of ['meta[property="og:url"]'])
        document.querySelector(selector)?.setAttribute("content", url);
      for (const selector of [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ])
        document
          .querySelector(selector)
          ?.setAttribute("content", document.title);
      for (const selector of [
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
      ])
        document
          .querySelector(selector)
          ?.setAttribute(
            "content",
            document.querySelector('meta[name="description"]').content
          );
    }

    function runAnimation(element, keyframes, options) {
      const animation = element.animate(keyframes, {
        ...options,
        fill: "both",
      });
      animations.add(animation);
      return animation.finished
        .catch(() => {})
        .finally(() => {
          animations.delete(animation);
          animation.cancel();
        });
    }
    function cancelAnimations() {
      for (const animation of animations) animation.cancel();
      animations.clear();
    }
    function setBusy(value) {
      busy = value;
      stage.dataset.motion = value ? "running" : "idle";
      stage.inert = value;
      stage.setAttribute("aria-busy", String(value));
      document.body.dataset.view =
        !value && current.key === "home" ? "notes" : "preview";
      window.dispatchEvent(new Event("claus:view"));
      stage.dispatchEvent(new Event("claus:travel"));
    }
    function restore() {
      traveler.style.transform = "";
      traveler.style.opacity = "";
      expression.removeAttribute("transform");
      tide.style.transform = "";
      tide.style.opacity = "";
      for (const mark of marks) {
        mark.style.opacity = "";
        mark.style.visibility = "";
        mark.style.transform = "";
      }
      page.style.opacity = "";
      for (const part of [...homeParts, footer]) part.style.opacity = "";
      delete stage.dataset.absorbing;
      setBusy(false);
      positionFooter();
    }
    function focusDestination() {
      if (current.key === "entry")
        entry.querySelector("a").focus({ preventScroll: true });
      else if (current.key === "home")
        home.querySelector(".home-intro").focus({ preventScroll: true });
      else title.focus({ preventScroll: true });
    }
    function snap(route, focus = false) {
      ink.cancel();
      cancelAnimations();
      destination = route;
      render(route);
      restore();
      if (focus) focusDestination();
    }

    async function go(
      route,
      { historyChange = false, origin = null, source = null } = {}
    ) {
      if (!route || (route.url === current.url && !busy)) return;
      const sequence = ++navigationSequence;
      if (busy) snap(destination);
      await window.ClausContent?.complete(content, route);
      if (sequence !== navigationSequence) return;
      if (!historyChange) history.pushState({ claus: true }, "", route.url);
      if (current.key === "entry" || route.key === "entry") {
        cancelAnimations();
        destination = route;
        if (!origin && source) {
          const bounds = (
            source.querySelector(".eye") || source
          ).getBoundingClientRect();
          origin = {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          };
        }
        setBusy(true);
        try {
          const completed = await ink.play(origin, () => render(route));
          if (completed && sequence === navigationSequence) {
            restore();
            focusDestination();
          }
        } catch {
          if (sequence === navigationSequence) snap(route, true);
        }
        return;
      }
      snap(route, true);
      if (!reduced.matches && !document.hidden) {
        void runAnimation(
          route.key === "entry"
            ? entry
            : route.key === "home"
            ? home
            : pageScroll,
          [
            { opacity: 0, transform: "translateY(5px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 230, easing: "cubic-bezier(.2,.7,.2,1)" }
        );
      }
    }

    async function writeClipboard(value) {
      try {
        if (!navigator.clipboard?.writeText)
          throw Error("clipboard_unavailable");
        await navigator.clipboard.writeText(value);
      } catch {
        const focused = document.activeElement;
        const field = document.createElement("textarea");
        field.value = value;
        field.readOnly = true;
        field.style.cssText =
          "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0";
        document.body.append(field);
        try {
          field.select();
          field.setSelectionRange(0, value.length);
          if (!document.execCommand("copy")) throw Error("copy_failed");
        } finally {
          field.remove();
          focused?.focus({ preventScroll: true });
        }
      }
    }

    async function copyAddress(button) {
      if (button.dataset.copying === "true") return;
      button.dataset.copying = "true";
      const isContract = button === contractCopy;
      const label = button.dataset.copyLabel || button.textContent;
      button.dataset.copyLabel = label;
      if (isContract) {
        clearTimeout(copyReset);
        copyStatus.textContent = "";
        delete copyStatus.dataset.error;
      }
      try {
        await writeClipboard(button.dataset.copy);
        if (isContract) {
          button.dataset.copied = "true";
          copyStatus.textContent = "Contract address copied.";
          copyReset = setTimeout(() => {
            delete button.dataset.copied;
            copyStatus.textContent = "";
          }, 1800);
        } else {
          button.textContent = "Copied";
          setTimeout(() => {
            if (button.isConnected) button.textContent = label;
          }, 1800);
        }
      } catch {
        if (isContract) {
          delete button.dataset.copied;
          copyStatus.textContent = "Couldn’t copy. Please try again.";
          copyStatus.dataset.error = "true";
        } else button.textContent = "Select the address to copy";
      } finally {
        delete button.dataset.copying;
      }
    }

    // Keep the landing artwork and copy inert to selection, while retaining controls.
    // Clipboard fallbacks use a temporary textarea outside this stage.
    for (const type of ["selectstart", "dragstart"])
      stage.addEventListener(type, (event) => {
        const target =
          event.target instanceof Element
            ? event.target
            : event.target.parentElement;
        if (
          ["home", "entry"].includes(current.key) &&
          !target?.closest('input, textarea, [contenteditable="true"]')
        )
          event.preventDefault();
      });

    stage.addEventListener("click", (event) => {
      const journalButton = event.target.closest("[data-journal-step]");
      if (journalButton && !journalButton.disabled) {
        void turnJournal(Number(journalButton.dataset.journalStep));
        return;
      }
      const copy = event.target.closest("[data-copy]");
      if (copy && !busy) {
        void copyAddress(copy);
        return;
      }
      const link = event.target.closest("a[href]");
      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const route = parse(link.getAttribute("href"));
      if (!route) return;
      if (!initialized) return;
      event.preventDefault();
      go(route, {
        source: link,
        origin: event.detail ? { x: event.clientX, y: event.clientY } : null,
      });
    });
    addEventListener("popstate", () =>
      go(parse(location.href), { historyChange: true })
    );
    addEventListener(
      "resize",
      () => {
        stopJournalTransition();
        if (busy) snap(destination);
        positionFooter();
      },
      { passive: true }
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopJournalTransition();
        if (busy) snap(destination);
      }
    });
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        stopJournalTransition();
        if (busy) snap(destination);
      }
    });
    addEventListener("pagehide", () => {
      stopJournalTransition();
      if (busy) snap(destination);
    });
    addEventListener("pageshow", () => {
      if (!busy) restore();
    });

    // Hide a deep-linked page's menu while its local, public content is read.
    layout(current);
    if (current.key !== "home") page.style.opacity = "0";
    try {
      content = await window.ClausContent.load();
      await window.ClausContent.complete(content, destination);
    } catch {
      /* Keep navigation and the public reader available during an outage. */
    }
    render(destination);
    restore();
    initialized = true;
    stage.dataset.navigation = "ready";
    document.fonts.ready.then(positionFooter);
  },
};

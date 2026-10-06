(async () => {
  const version = 8;
  document.body.dataset.variant = version;
  if (new URLSearchParams(location.search).has("overview"))
    document.body.dataset.overview = "true";
  const stage = document.getElementById("stage");
  let eyeSequence = 0;
  const eye = (cx, cy, rx, ry, r, backplate = true) => {
    const id = `claus-eyelid-${++eyeSequence}`;
    const aperture =
      version === 8
        ? `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><ellipse class="eyelid-aperture" data-cy="${cy}" data-ry="${ry}" cx="${cx}" cy="${cy}" rx="${
            rx + 1
          }" ry="${ry + 1}"/></clipPath></defs>`
        : "";
    const opening =
      version === 8
        ? `class="eye-content" clip-path="url(#${id})"`
        : 'class="blink"';
    return `${
      backplate
        ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 7}" ry="${
            ry + 9
          }" fill="#000"/>`
        : ""
    }${aperture}<g ${opening}><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff2d8"/><circle class="pupil" data-cx="${cx}" data-cy="${cy}" data-rx="${rx}" data-ry="${ry}" cx="${cx}" cy="${cy}" r="${r}" fill="#000"/></g>`;
  };
  if (version >= 6) {
    const defs = `<defs><filter id="ink" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 0 0 1 0"/><feComponentTransfer><feFuncA type="linear" slope="1.25" intercept="-.25"/></feComponentTransfer></filter></defs>`;
    const claus = (transform, headOnly = false) =>
      `<g transform="${transform}">${
        headOnly
          ? '<defs><clipPath id="claus-head-outline"><ellipse cx="545" cy="350" rx="360" ry="350"/></clipPath></defs><g clip-path="url(#claus-head-outline)"><ellipse cx="545" cy="520" rx="260" ry="210" fill="#000"/>'
          : ""
      }<image href="/assets/claus-logo.png" width="1024" height="1024" filter="url(#ink)"/>${
        headOnly
          ? '<ellipse cx="543.5" cy="367" rx="70" ry="95" fill="#000"/><ellipse cx="690.5" cy="376.5" rx="59" ry="74" fill="#000"/></g><g class="claus-expression">'
          : ""
      }${eye(543.5, 367, 61.5, 84.5, 26, !headOnly)}${eye(
        690.5,
        376.5,
        50,
        63,
        20,
        !headOnly
      )}${headOnly ? "</g>" : ""}</g>`;
    const scenes = {
      6: `<g class="hanging"><path d="M 689 -600 L 689 -60 C 691 24 733 78 720 144 C 713 169 692 184 683 218 C 680 235 695 257 715 263 C 752 242 772 210 782 176 C 803 111 754 65 750 -60 L 750 -600 Z" fill="#000"/>${claus(
        "translate(720 412) scale(.64) rotate(180) translate(-512 -512)"
      )}</g>`,
      7: `<path d="M 1392 -60 C 1454 116 1456 338 1404 540 C 1355 730 1230 829 1000 821 C 763 812 460 684 236 729 C 155 746 144 808 192 829 C 226 845 255 821 249 798 C 240 777 213 780 215 798 C 212 814 190 811 184 798 C 175 772 207 750 259 750 C 469 743 748 889 1022 899 C 1300 912 1472 745 1511 505 L 1560 -60 Z" fill="#000"/>${claus(
        "translate(1205 226) scale(.72) rotate(176) translate(-512 -512)"
      )}`,
      8: `<g data-claus-face="main" transform="translate(1440 0) scale(-1 1)">${claus(
        "translate(195 800) scale(.92) rotate(-8) translate(-512 -512)",
        true
      )}</g>`,
      9: `<g class="side-peek">${claus(
        "translate(-10 446) scale(1.4) rotate(90) translate(-512 -512)"
      )}</g>`,
      10: claus("translate(720 472) scale(2.7) translate(-617 -370)"),
    };
    const artwork = `<svg class="scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-label="Claus">${defs}${scenes[version]}</svg>`;
    stage.innerHTML =
      version === 8
        ? `<div class="claus-tide"><svg class="scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g transform="translate(1440 0) scale(-1 1)"><path d="M -40 754 C 200 707 422 798 628 797 C 954 797 1130 644 1480 719 L 1480 1000 L -40 1000 Z" fill="#000"/></g></svg></div><div class="claus-traveler">${artwork}</div>`
        : artwork;
    const portrait = {
      6: "360 -70 720 1220",
      7: "800 -40 660 1120",
      8: "630 100 740 1260",
      9: "-30 -70 740 1260",
      10: "260 -300 920 1640",
    };
    function fit() {
      const ratio = innerWidth / innerHeight;
      if (version === 8) {
        const width = ratio < 0.9 ? 960 : 1440,
          height = width / ratio;
        for (const scene of stage.querySelectorAll(".scene"))
          scene.setAttribute(
            "viewBox",
            `${1440 - width} ${900 - height} ${width} ${height}`
          );
      } else
        stage
          .querySelector(".scene")
          .setAttribute(
            "viewBox",
            ratio < 0.9 ? portrait[version] : "0 0 1440 900"
          );
    }
    addEventListener("resize", fit, { passive: true });
    fit();
  } else if ([2, 3].includes(version)) {
    stage.innerHTML = `<svg class="original ${
      version === 3 ? "peek" : ""
    }" viewBox="0 0 1024 1024" aria-label="Claus"><defs><filter id="ink" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 0 0 1 0"/><feComponentTransfer><feFuncA type="linear" slope="1.25" intercept="-.25"/></feComponentTransfer></filter></defs><g class="float"><image href="/assets/claus-logo.png" width="1024" height="1024" filter="url(#ink)"/>${eye(
      543.5,
      367,
      61.5,
      84.5,
      26
    )}${eye(690.5, 376.5, 50, 63, 20)}</g></svg>`;
  } else {
    const banner = await fetch("/assets/claus-banner-shape.json").then((r) =>
      r.json()
    );
    const transforms = {
      1: "translate(-20 -10) rotate(8 1220 280)",
      4: "translate(1500 150) scale(-1 1) rotate(28 1220 280)",
      5: "translate(1040 510) scale(3.05) rotate(-10) translate(-1220 -280)",
    };
    stage.innerHTML = `<svg class="scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-label="Claus"><g transform="${
      transforms[version]
    }"><rect x="670" y="-1800" width="830" height="1801" fill="#000"/><path d="${
      banner.path
    }" fill="#000"/>${eye(1188.5, 287.5, 28, 35, 13.2)}${eye(
      1259,
      277,
      27.5,
      34.5,
      13.4
    )}</g></svg>`;
    function fit() {
      const tall = innerWidth / innerHeight < 0.9;
      stage
        .querySelector(".scene")
        .setAttribute(
          "viewBox",
          tall
            ? version === 1
              ? "820 -30 680 1150"
              : version === 4
              ? "0 80 720 1150"
              : "650 60 700 1100"
            : "0 0 1440 900"
        );
    }
    addEventListener("resize", fit, { passive: true });
    fit();
  }
  if (version === 8) {
    // Preserve the eye proportions and asymmetry of the original character.
    const symbolEyes = (x, y, scale = 0.28) =>
      eye(x, y, 61.5 * scale, 84.5 * scale, 26 * scale, false) +
      eye(
        x + 147 * scale,
        y + 9.5 * scale,
        50 * scale,
        63 * scale,
        20 * scale,
        false
      );
    const marks = [
      [
        "Journal",
        `<path d="M46 34 C70 30 99 29 122 22 C136 17 145 21 150 34 C155 41 168 45 168 58 C168 68 158 72 157 84 L155 133 C154 142 153 149 156 155 C145 151 135 149 123 151 L64 161 C45 166 30 155 30 139 L32 51 C32 40 36 36 46 34Z"/><path d="M123 141 C131 149 126 158 128 166 C131 177 144 178 150 171 C155 165 150 159 145 163 C141 168 137 165 138 159 L144 143Z"/><path d="M45 132 C75 126 115 125 153 126 L152 138 C112 135 72 147 49 149 C36 150 34 136 45 132Z" fill="#ec673a"/><path d="M47 43 C44 66 43 99 43 116" fill="none" stroke="#ec673a" stroke-width="3.8" stroke-linecap="round"/><path d="M46 141 C78 138 114 132 149 132" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round"/>${symbolEyes(
          90,
          72
        )}`,
      ],
      [
        "Hooks",
        `<path d="M104 25 C120 22 133 13 145 23 C151 28 151 38 158 44 C170 53 170 61 162 70 C152 80 150 93 133 102 C134 127 125 151 104 166 C82 182 47 179 32 158 C18 139 27 114 51 99 L47 119 L56 116 C48 126 51 139 62 143 C79 150 98 133 98 116 L97 102 C78 98 66 86 64 70 C60 42 78 32 104 25Z"/>${symbolEyes(
          102,
          62,
          0.25
        )}`,
      ],
      [
        "Coin",
        `<path d="M97 23 C112 23 124 16 136 23 C147 28 151 39 156 45 C169 58 178 75 175 95 C171 132 147 157 113 165 C95 170 79 170 65 161 C42 148 28 128 26 100 C22 57 54 24 97 23Z"/><path d="M81 37 C52 43 38 65 39 92 C40 115 54 136 75 145 M156 105 C151 126 139 141 120 149" fill="none" stroke="#ec673a" stroke-width="3.8" stroke-linecap="round"/>${symbolEyes(
          88,
          78
        )}`,
      ],
      [
        "Address",
        `<path d="M43 47 C64 43 91 42 118 34 C135 28 146 32 151 44 C154 51 166 55 168 66 C171 80 159 86 157 103 L159 135 C161 144 154 154 143 154 C128 153 119 150 109 154 C84 161 49 158 36 146 C25 135 29 115 29 98 L29 67 C28 55 32 50 43 47Z"/>${symbolEyes(
          81,
          76,
          0.27
        )}<g fill="none" stroke="#ec673a" stroke-width="4" stroke-linecap="round"><ellipse cx="55" cy="128" rx="7.5" ry="10"/><path d="M75 120 L88 136 M88 120 L75 136"/></g><g fill="#ec673a"><circle cx="108" cy="132" r="2.5"/><circle cx="122" cy="132" r="2.5"/><circle cx="136" cy="132" r="2.5"/></g>`,
      ],
      [
        "NFTs",
        `<path fill-rule="evenodd" d="M45 24 C75 26 116 18 144 21 C158 22 169 35 168 51 L166 142 C166 157 153 168 137 167 L47 170 C30 170 20 155 23 140 L26 45 C27 31 31 26 45 24Z M46 41 C74 42 117 35 146 39 L146 146 L42 149 L44 43Z"/><path d="M90 59 C105 55 121 45 130 51 C139 54 140 66 148 70 C157 74 158 81 154 85 C151 89 148 93 148 99 C148 109 140 118 135 123 C136 132 145 129 151 135 C156 141 151 148 143 149 C129 151 124 139 119 136 C113 135 118 150 110 152 C100 155 94 151 96 141 C97 137 97 132 94 132 C90 132 91 147 79 150 C68 155 55 153 52 145 C48 136 53 129 60 129 C66 128 68 133 64 136 C61 139 63 143 69 140 C75 137 74 130 75 125 C58 116 55 104 60 87 C66 69 73 64 90 59Z"/>${symbolEyes(
          91,
          86,
          0.22
        )}`,
      ],
      [
        "Wallet",
        `<path d="M35 54 C44 40 72 39 97 31 L141 22 C153 19 161 28 160 41 L158 57Z"/><path d="M50 51 L144 33 L146 52Z" fill="#ec673a"/><path d="M42 48 C74 47 115 43 146 47 C163 49 168 59 167 77 L166 137 C166 152 155 160 138 160 L45 160 C29 158 22 146 24 128 L26 70 C25 55 29 50 42 48Z"/>${symbolEyes(
          78,
          82,
          0.26
        )}<path d="M145 108 L178 108 L178 141 L144 142 C134 142 129 136 129 126 C129 116 134 110 145 108Z" stroke="#ec673a" stroke-width="4" stroke-linejoin="round"/><circle cx="147" cy="126" r="4.5" fill="#ec673a"/>`,
      ],
      [
        "Posts and replies",
        `<path d="M50 35 C71 25 93 32 118 24 C134 17 146 20 151 33 C159 38 174 47 174 61 C175 72 167 77 167 87 C167 108 151 126 131 131 C110 137 92 139 78 131 C67 148 50 161 29 156 C43 149 49 136 47 120 C30 109 23 92 26 71 C28 53 36 43 50 35Z"/>${symbolEyes(
          89,
          74,
          0.3
        )}`,
      ],
    ];
    const symbols = document.createElement("section");
    symbols.className = "claus-symbols";
    symbols.setAttribute("aria-label", "Claus symbols");
    const destinations = [
      "/Journal",
      "/Hooks",
      "/Token",
      "/Contract",
      "/Hooks/NFTs",
      "/Wallet",
      "/Posts",
    ];
    symbols.innerHTML = marks
      .map(
        ([name, art], index) =>
          `<a class="claus-symbol" href="${
            destinations[index]
          }" data-destination="${destinations[index]}" style="--turn:${
            index % 2 ? 2 : -2
          }deg" aria-label="${name}"><svg data-claus-face="${name
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )}" viewBox="0 0 200 190" role="img" aria-label="${name}"><title>${name}</title><g fill="#000">${art}</g></svg></a>`
      )
      .join("");
    stage.append(symbols);
  }
  let eyes = window.ClausEyes.create();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (version === 8 && !document.body.dataset.overview) {
    const faces = [...stage.querySelectorAll("[data-claus-face]")].map(
      (el) => ({
        main: el.dataset.clausFace === "main",
        lids: [...el.querySelectorAll(".eyelid-aperture")],
        timer: 0,
        frame: 0,
      })
    );
    function setLids(face, amount) {
      for (const lid of face.lids) {
        const ry = Number(lid.dataset.ry),
          cy = Number(lid.dataset.cy);
        lid.setAttribute("ry", ((ry + 1) * (1 - amount)).toFixed(3));
        lid.setAttribute("cy", (cy + ry * 0.12 * amount).toFixed(3));
      }
    }
    function stopBlink() {
      for (const face of faces) {
        clearTimeout(face.timer);
        cancelAnimationFrame(face.frame);
        setLids(face, 0);
      }
    }
    const blinkDelay = (face) =>
      face.main ? 2500 + Math.random() * 1700 : 2900 + Math.random() * 2300;
    function nextBlink(face, delay = blinkDelay(face), allowDouble = true) {
      if (
        document.hidden ||
        reduced.matches ||
        stage.dataset.motion === "running"
      )
        return;
      face.timer = setTimeout(() => {
        const start = performance.now(),
          close = 92,
          hold = 26,
          open = 185;
        function animate(now) {
          const elapsed = now - start;
          let amount;
          if (elapsed < close) {
            const t = elapsed / close;
            amount = t * t * (3 - 2 * t);
          } else if (elapsed < close + hold) amount = 1;
          else {
            const t = Math.min(1, (elapsed - close - hold) / open);
            amount = (1 - t) ** 3;
          }
          setLids(face, amount);
          if (elapsed < close + hold + open)
            face.frame = requestAnimationFrame(animate);
          else {
            setLids(face, 0);
            const doubleBlink = allowDouble && Math.random() < 0.14;
            nextBlink(face, doubleBlink ? 240 : blinkDelay(face), !doubleBlink);
          }
        }
        face.frame = requestAnimationFrame(animate);
      }, delay);
    }
    function resumeBlink() {
      stopBlink();
      if (
        !document.hidden &&
        !reduced.matches &&
        stage.dataset.motion !== "running"
      )
        for (const face of faces)
          nextBlink(face, face.main ? 1000 : 1200 + Math.random() * 1900);
    }
    document.addEventListener("visibilitychange", resumeBlink);
    reduced.addEventListener("change", resumeBlink);
    addEventListener("pagehide", stopBlink);
    addEventListener("pageshow", resumeBlink);
    stage.addEventListener("claus:travel", resumeBlink);
    resumeBlink();
  }
  let pointer = { x: innerWidth * 0.46, y: innerHeight * 0.6 },
    frame = 0,
    last = 0;
  function update(t) {
    const moving = eyes.update(
      pointer,
      Math.min(32, last ? t - last : 16),
      reduced.matches
    );
    last = t;
    frame = moving ? requestAnimationFrame(update) : 0;
  }
  function schedule() {
    if (!frame && !document.hidden && stage.dataset.motion !== "running") {
      last = 0;
      frame = requestAnimationFrame(update);
    }
  }
  addEventListener(
    "pointermove",
    (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    },
    { passive: true }
  );
  addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else schedule();
  });
  stage.addEventListener("claus:travel", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (stage.dataset.motion !== "running") {
      eyes = window.ClausEyes.create();
      schedule();
    }
  });
  schedule();
  if (version === 8 && !document.body.dataset.overview)
    window.ClausNavigation.mount(stage);
})();

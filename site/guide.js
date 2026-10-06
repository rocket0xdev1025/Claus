// Explanations based on the published hook pages and Journal, 6 October 2026.
// Live applications remain the source for balances, availability and transactions.
window.ClausGuide = (() => {
  const hooks = {
    NFTs: {
      intro:
        "A Claus you can collect, with $CLAUS inside. Each NFT holds 50,000 tokens and earns a share of pool fees while you hold it.",
      facts: [
        ["300", "NFTs in the collection"],
        ["50,000", "$CLAUS backing each NFT"],
        ["0.35%", "of eligible ETH trading volume"],
      ],
      steps: [
        [
          "Deposit",
          "Deposit 50,000 $CLAUS to mint an available NFT. The tokens become its backing.",
        ],
        [
          "Hold",
          "Daily ETH rewards reflect how long you held the NFT during the reward period.",
        ],
        [
          "Redeem",
          "Burn the NFT to receive its 50,000 $CLAUS backing. The NFT is then gone.",
        ],
      ],
      notes: [
        [
          "What you own",
          "Selling an NFT passes its token backing to the buyer. Holding it gives you an NFT and its benefits; it does not create another 50,000 tokens.",
        ],
        [
          "Where rewards come from",
          "The holder allocation comes from the existing project fee on eligible pool trades. Rewards vary with trading activity and holding time.",
        ],
      ],
      action: "Explore the collection",
      related: ["Funding", "Burn"],
      journal: "journal:claus-nfts-20261005",
    },
    Predictions: {
      intro:
        "Take a side on where $CLAUS finishes. Choose a target market cap and an end time, then back Higher or Lower with ETH.",
      facts: [
        ["2h–7d", "time to the result"],
        ["30 min", "final price average"],
        ["2%", "entry or early-exit fee"],
      ],
      steps: [
        [
          "Choose a market",
          "Create a target and end time, or join a prediction already made by someone else.",
        ],
        [
          "Back your side",
          "Add ETH to Higher or Lower. Entries and early exits close 40 minutes before the end.",
        ],
        [
          "Collect the result",
          "The final average determines how the pot is split. Each side shares its payout in proportion to its stakes.",
        ],
      ],
      notes: [
        [
          "How the payout changes",
          "At the target, both sides receive their net stakes. At 5% above it, Higher receives half of Lower’s stakes. At 10% above, Higher receives all of them. Below the target, the rule works in reverse.",
        ],
        [
          "Know the game",
          "This uses the $CLAUS pool price. Other players can trade the token and affect the result. You can lose your entire stake. Ethereum gas is separate from the game fee.",
        ],
        [
          "If a result is unavailable",
          "If one side is empty, or usable price data is still missing after the one-hour grace period, remaining net stakes are refundable. Fees are not returned.",
        ],
      ],
      action: "View predictions",
      related: ["Arena", "Funding"],
      journal: "journal:claus-predictions-20261006",
    },
    Arena: {
      intro:
        "Climb before the water catches you. Rising Tide is a free singleplayer game connected to trades in the $CLAUS pool.",
      facts: [
        ["Free", "to play"],
        ["No wallet", "needed"],
        ["Live trades", "can make extra waves"],
      ],
      steps: [
        [
          "Start climbing",
          "Jump between ledges and keep moving up. Your highest climb is your score.",
        ],
        [
          "Watch the water",
          "The water keeps rising. A confirmed pool trade can send an extra wave into the game.",
        ],
        [
          "Beat your best",
          "Dodge shots, grab ledges and stay above the water. Your run ends when the water reaches you.",
        ],
      ],
      notes: [
        [
          "On a computer",
          "Use A and D to move, Space to jump and E to grab a ledge. Release before grabbing again.",
        ],
        [
          "On a phone",
          "Use the on-screen controls. You do not need to buy $CLAUS or connect a wallet to play.",
        ],
      ],
      action: "Play Rising Tide",
      related: ["Predictions", "Weather"],
    },
    Arbitrage: {
      intro:
        "The same $CLAUS can have different prices in different pools. This hook can trade that gap and use available profit for buybacks.",
      facts: [
        ["One", "transaction for both trades"],
        ["About $500", "available profit per buyback"],
        ["Project", "pays execution costs"],
      ],
      steps: [
        [
          "Find a price gap",
          "Buy $CLAUS in the cheaper pool and sell it in the more expensive pool, in one transaction.",
        ],
        [
          "Cover the costs",
          "Account for execution, setup and service costs, and keep a reserve for future gas.",
        ],
        [
          "Buy back $CLAUS",
          "Use roughly $500 of available profit to buy tokens in the main pool. The tokens go to the project wallet.",
        ],
      ],
      notes: [
        [
          "What it changes for a trade",
          "Arbitrage runs separately. An ordinary swap does not perform the search or receive an extra arbitrage fee.",
        ],
        [
          "Profit is not guaranteed",
          "Someone else can reach the opportunity first. Failed attempts can still cost gas. Spending limits apply, and buybacks wait when price impact, costs or available profit do not meet the rules.",
        ],
        [
          "Where the tokens go",
          "These buybacks send $CLAUS to the project wallet. The separate Buyback & Burn hook removes tokens from supply.",
        ],
      ],
      action: "View arbitrage results",
      related: ["Burn", "Funding"],
      journal: "journal:claus-arbitrage-20261006",
    },
    Funding: {
      intro:
        "Pool trades help pay for what Claus does next. The project fee supports development and the functions connected to the token.",
      facts: [
        ["2%", "project fee per buy or sell"],
        ["ETH value", "used to calculate the fee"],
        ["One fee", "shared across its uses"],
      ],
      steps: [
        [
          "A trade happens",
          "A buy or sell in the main pool contributes a fee based on its ETH value.",
        ],
        [
          "The hook allocates it",
          "Parts go to NFT rewards, FOMO buybacks, burns and liquidity. The rest goes to the project wallet.",
        ],
        [
          "The project uses it",
          "The project wallet pays for research, running costs and new functions.",
        ],
      ],
      notes: [
        [
          "The allocations belong to the same fee",
          "The 0.35% NFT-holder allocation, 0.15% FOMO buyback allocation and 0.50% shared by burns and liquidity come from the 2% project fee. They are not extra fees stacked on top.",
        ],
        [
          "Check the current split",
          "Weather changes the balance between burns and liquidity. The live funding page shows the current allocation from the contract.",
        ],
      ],
      action: "View the current fee split",
      related: ["Weather", "NFTs"],
    },
    Burn: {
      intro:
        "Trading fees buy $CLAUS from the pool and burn those tokens. Burning permanently reduces the token supply.",
      facts: [
        ["Pool fees", "fund the purchase"],
        ["$CLAUS", "bought from the pool"],
        ["Permanent", "supply reduction"],
      ],
      steps: [
        [
          "Collect the allocation",
          "The hook sets aside part of the project fee in ETH.",
        ],
        ["Buy tokens", "That ETH buys $CLAUS from the pool."],
        [
          "Burn them",
          "The purchased tokens are removed from supply permanently.",
        ],
      ],
      notes: [
        [
          "How much goes to burns",
          "Weather Switch adjusts this part of the existing fee. Rain assigns more to burns; dry weather assigns more to liquidity.",
        ],
        [
          "Reading the total",
          "The live page shows total supply removed since launch. That total can also include tokens burned directly by holders.",
        ],
      ],
      action: "View the burn total",
      related: ["Weather", "Liquidity"],
    },
    Liquidity: {
      intro:
        "Part of the trading fee goes back into the original pool as ETH and $CLAUS, giving the pool more of both assets.",
      facts: [
        ["About $500", "per liquidity batch"],
        ["ETH + $CLAUS", "added together"],
        ["Original pool", "receives the liquidity"],
      ],
      steps: [
        [
          "Build a batch",
          "The liquidity allocation accumulates until it reaches roughly $500.",
        ],
        ["Get both assets", "Part of the accumulated ETH buys $CLAUS."],
        [
          "Add liquidity",
          "The ETH and tokens are deposited into the original pool together.",
        ],
      ],
      notes: [
        [
          "Where the allocation comes from",
          "Liquidity is funded inside the 2% project fee. Weather Switch adjusts its share alongside the burn allocation.",
        ],
        [
          "Follow the next batch",
          "The live page shows ETH saved for the next addition and the amounts already added by this hook.",
        ],
      ],
      action: "View liquidity additions",
      related: ["Weather", "Burn"],
    },
    Weather: {
      intro:
        "London’s weather changes where part of the trading fee goes. Rain favours burns; dry weather favours liquidity.",
      facts: [
        ["4 hours", "between weather checks"],
        ["0.50%", "shared by burns and liquidity"],
        ["6 hours", "maximum report age"],
      ],
      steps: [
        [
          "Read the weather",
          "IMD checks NOAA’s weather observations for London Heathrow and signs the report.",
        ],
        [
          "Verify the report",
          "The hook checks the signed report and whether it is still fresh.",
        ],
        [
          "Set the split",
          "The same fee allocation is divided differently between burns and liquidity.",
        ],
      ],
      notes: [
        [
          "If the report expires",
          "The usual split returns: 0.25% to burns and 0.25% to liquidity. Pool trading continues. The hook relies on IMD to sign accurate observations.",
        ],
      ],
      action: "View the current weather split",
      related: ["Burn", "Liquidity"],
    },
    Buybacks: {
      intro:
        "A share of pool fees buys $CLAUS for FounderClaus’s FOMO wallet. You can follow how much ETH was used and how many tokens were delivered.",
      facts: [
        ["0.15%", "of each trade’s ETH value"],
        ["$CLAUS", "bought from the pool"],
        ["FOMO wallet", "receives the tokens"],
      ],
      steps: [
        [
          "Set aside ETH",
          "Each buy and sell allocates 0.15% of its ETH value from the existing project fee.",
        ],
        ["Buy $CLAUS", "The allocated ETH buys tokens in the pool."],
        [
          "Deliver the tokens",
          "The purchased $CLAUS goes to FounderClaus’s FOMO wallet.",
        ],
      ],
      notes: [
        [
          "What the total means",
          "The live tracker reports tokens delivered by this hook. It does not represent the wallet’s current token balance.",
        ],
        [
          "Where this fee fits",
          "This allocation is part of the 2% project fee. It continues independently of the retired Pool Arbitrage function.",
        ],
      ],
      action: "View FOMO buybacks",
      related: ["Funding", "Burn"],
    },
    Name: {
      intro:
        "Claus can change the token’s name and ticker after launch. The contract address stays the same, so holders do not need to move their tokens.",
      facts: [
        ["Claus", "token name"],
        ["CLAUS", "ticker"],
        ["Same address", "through a name change"],
      ],
      steps: [
        [
          "Change the metadata",
          "The name and ticker can be updated through the token’s metadata function.",
        ],
        [
          "Keep the token",
          "Your balance, the contract address and the pool remain in place.",
        ],
        [
          "Keep the history",
          "The Journal records each change, including earlier names.",
        ],
      ],
      notes: [
        [
          "Why the address matters",
          "A name can be reused by another token. The contract address identifies the official $CLAUS token.",
        ],
        [
          "When a tracker looks different",
          "External trading sites can cache the old name or ticker after a change. The current contract and Journal provide the reference.",
        ],
      ],
      action: "View token identity",
      related: ["Funding", "NFTs"],
      journal: "journal:token-restore-claus-20261006",
    },
  };
  const order = [
    "NFTs",
    "Predictions",
    "Arena",
    "Arbitrage",
    "Funding",
    "Burn",
    "Liquidity",
    "Weather",
    "Buybacks",
    "Name",
  ];
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
  const pathFor = (item) => {
    try {
      return new URL(item.href).pathname;
    } catch {
      return "";
    }
  };
  const keyFor = (path) =>
    Object.keys(hooks).find(
      (key) => `/Hooks/${key}`.toLowerCase() === path.toLowerCase()
    );
  const dated = (value) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  const journalPath = (entry) => `/Journal/${encodeURIComponent(entry.id)}`;
  const external = (url, label, className = "") => {
    try {
      if (new URL(url).protocol !== "https:") return "";
    } catch {
      return "";
    }
    return `<a class="${className}" href="${escape(
      url
    )}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  };
  const chevron =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const meta = (entry) =>
    `<div class="journal-meta"><span>Entry ${escape(
      entry.number
    )}</span><time datetime="${escape(entry.at)}">${dated(
      entry.at
    )}</time></div>`;
  const paragraphs = (text) =>
    String(text || "")
      .split(/\n\n+/)
      .map((p) => `<p>${escape(p)}</p>`)
      .join("");
  const sourceNav = (content, extra = "") =>
    `<nav class="source-links" aria-label="Onchain references">${extra}<a href="/Contract">Token contract</a>${external(
      "https://robin.etherscan.io/address/0x37Bfb8AC7C960E558657871D41Ca70E07e7DbfFf#code",
      "Hook contract"
    )}<a href="/Wallet">Project wallet</a></nav>`;
  const addressCard = (label, address) =>
    `<section class="address-card"><h2>${label}</h2><p class="public-address">${escape(
      address
    )}</p><div class="guide-actions"><button class="guide-button" type="button" data-copy="${escape(
      address
    )}">Copy address</button>${external(
      `https://robin.etherscan.io/address/${address}#code`,
      "View on Etherscan",
      "guide-text-link"
    )}</div></section>`;
  function render(route, content) {
    const functions = content.functions || [];
    const entries = [...(content.journals || [])].sort(
      (a, b) =>
        (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0) ||
        Number(b.number) - Number(a.number)
    );
    const itemFor = (key) =>
      functions.find(
        (item) => pathFor(item).toLowerCase() === `/Hooks/${key}`.toLowerCase()
      );
    const cardFor = (item, index) =>
      `<li><a class="hook-index-link" href="${escape(
        pathFor(item)
      )}"><span class="hook-index-number" aria-hidden="true">${String(
        index + 1
      ).padStart(2, "0")}</span><div><h2>${escape(item.name)}</h2><p>${escape(
        item.description
      )}</p></div>${chevron}</a></li>`;
    if (route.key === "hooks" || route.key === "nfts") {
      const key = keyFor(route.path);
      const item = itemFor(key);
      if (key === "Arbitrage" && !item)
        return {
          heading: "Pool Arbitrage",
          section: "hooks",
          description: "The arbitrage function has been removed.",
          html: `<p class="guide-lead">The arbitrage function has been removed from the pool hook. Its operator and profit-funded buybacks are stopped.</p><p>The existing token, pool, NFT benefits and other functions continue.</p><div class="guide-actions"><a class="guide-button" href="/Hooks">Current hooks</a><a class="guide-text-link" href="/Journal/journal%3Aclaus-arbitrage-removed-20261006">Read the removal entry</a></div>${sourceNav(
            content
          )}`,
        };
      if (key && item) {
        const info = hooks[key];
        const journal = entries.find((entry) => entry.id === info.journal);
        const related = info.related.map(itemFor).filter(Boolean);
        const application = {
          NFTs: "/nfts",
          Predictions: "/predictions",
          Arena: "/arena",
          Arbitrage: "/arbitrage",
        }[key];
        const art =
          key === "NFTs"
            ? `<figure class="guide-nfts"><div>${["001", "041", "291"]
                .map(
                  (id) =>
                    `<img src="/assets/nfts/thumb/${id}.png" width="240" height="240" alt="Claus NFT ${Number(
                      id
                    )}" decoding="async">`
                )
                .join(
                  ""
                )}</div><figcaption>Three of the 300 Claus NFTs</figcaption></figure>`
            : "";
        const weather =
          key === "Weather"
            ? '<table class="weather-table"><caption>Share of a trade’s ETH value</caption><thead><tr><th scope="col">Weather</th><th scope="col">Burns</th><th scope="col">Liquidity</th></tr></thead><tbody><tr><th scope="row">Rain</th><td>0.35%</td><td>0.15%</td></tr><tr><th scope="row">Dry</th><td>0.15%</td><td>0.35%</td></tr><tr><th scope="row">No fresh report</th><td>0.25%</td><td>0.25%</td></tr></tbody></table>'
            : "";
        return {
          heading: item.name,
          section: "hooks",
          description: info.intro,
          html: `
          <p class="guide-lead">${escape(info.intro)}</p>
          <div class="guide-actions">${
            application
              ? `<a class="guide-button" href="${application}">${escape(
                  info.action
                )}</a>`
              : ""
          }${
            journal
              ? `<a class="guide-text-link" href="${journalPath(
                  journal
                )}">Read the Journal entry</a>`
              : ""
          }</div>
          ${art}
          <dl class="hook-facts">${info.facts
            .map(
              ([value, label]) =>
                `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`
            )
            .join("")}</dl>
          <section class="guide-section"><h2>How it works</h2><ol class="guide-steps" role="list">${info.steps
            .map(
              ([heading, text], i) =>
                `<li><span class="guide-step-number" aria-hidden="true">${
                  i + 1
                }</span><div><h3>${escape(heading)}</h3><p>${escape(
                  text
                )}</p></div></li>`
            )
            .join("")}</ol></section>
          ${weather}
          <div class="guide-notes">${info.notes
            .map(
              ([heading, text]) =>
                `<section><h2>${escape(heading)}</h2><p>${escape(
                  text
                )}</p></section>`
            )
            .join("")}</div>
          ${sourceNav(
            content,
            key === "NFTs"
              ? external(
                  "https://opensea.io/collection/contractclaus",
                  "OpenSea collection"
                )
              : ""
          )}
          <nav class="related-hooks" aria-label="Related hooks"><h2>Connected hooks</h2>${related
            .map(
              (item) =>
                `<a href="${escape(pathFor(item))}">${escape(
                  item.name
                )}${chevron}</a>`
            )
            .join("")}</nav>`,
        };
      }
      if (/^\/Hooks\/?$/i.test(route.path))
        return {
          heading: "Hooks",
          section: "hooks",
          description: "Explore the functions connected to $CLAUS.",
          html: `<p class="guide-lead">The functions connected to $CLAUS. Each hook explains what happens, where the funds go and how you can use it.</p><ul class="hook-index" role="list">${order
            .map(itemFor)
            .filter(Boolean)
            .map(cardFor)
            .join("")}</ul>${sourceNav(content)}`,
        };
    }
    if (route.key === "journal") {
      let id;
      try {
        id = decodeURIComponent(
          route.path.split("/")[2] || route.hash.slice(1)
        );
      } catch {
        id = "";
      }
      const entry = entries.find(
        (item) => item.id === id || String(item.number) === id
      );
      if (entry) {
        const position = entries.indexOf(entry),
          older = entries[position + 1],
          newer = entries[position - 1];
        const linkedHook = order.find((key) => hooks[key].journal === entry.id);
        const entryArrow = (item, step, label) => {
          const icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${
            step < 0 ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"
          }"/></svg>`;
          return item
            ? `<a class="journal-entry-arrow" data-entry-step="${step}" href="${journalPath(
                item
              )}" aria-label="${label}: ${escape(
                item.title
              )}" title="${label}">${icon}</a>`
            : `<button class="journal-entry-arrow" type="button" disabled aria-label="No ${label.toLowerCase()}">${icon}</button>`;
        };
        let source = "";
        try {
          const url = new URL(entry.href);
          const ownHook =
            url.origin === "https://claus.si" &&
            url.pathname.startsWith("/Hooks/");
          source = ownHook
            ? `<a href="${escape(url.pathname)}">View hook</a>`
            : external(
                entry.href,
                url.hostname === "etherscan.io" &&
                  url.pathname.startsWith("/tx/")
                  ? "Change transaction"
                  : "View source"
              );
          if (linkedHook && url.pathname !== `/Hooks/${linkedHook}`)
            source += `<a href="/Hooks/${linkedHook}">View hook</a>`;
        } catch {
          if (linkedHook)
            source = `<a href="/Hooks/${linkedHook}">View hook</a>`;
        }
        return {
          heading: entry.title,
          section: "journal",
          layout: "journal",
          date: { at: entry.at, label: dated(entry.at) },
          entryNavigation:
            entryArrow(newer, -1, "Newer entry") +
            entryArrow(older, 1, "Older entry"),
          description: entry.summary,
          html: `<div class="journal-prose">${
            entry.unavailable
              ? "<p>This entry could not load. Please reload the page or open the text version.</p>"
              : paragraphs(entry.body || entry.summary)
          }</div><nav class="source-links" aria-label="Entry references">${source}${
            entry.onchain?.transactionHash
              ? external(
                  `https://robin.etherscan.io/tx/${entry.onchain.transactionHash}`,
                  "Onchain record"
                )
              : ""
          }</nav><nav class="journal-pagination" aria-label="Journal navigation"><a href="/Journal">All entries</a><a href="/Home">Home</a></nav>`,
        };
      }
      if (!id)
        return {
          heading: "Journal",
          section: "journal",
          description:
            "A record of what changed, why it changed and the transactions behind it.",
          html: `<p class="guide-lead">What changed, why it changed and the transactions behind it. The newest entry is first.</p><ol class="journal-index" role="list">${entries
            .map(
              (entry) =>
                `<li><a href="${journalPath(entry)}">${meta(
                  entry
                )}<div><h2>${escape(entry.title)}</h2><p>${escape(
                  entry.summary
                )}</p></div>${chevron}</a></li>`
            )
            .join("")}</ol>`,
        };
    }
    if (route.key === "address")
      return {
        heading: "On Ethereum",
        section: "address",
        description:
          "The official $CLAUS token and the contracts connected to it.",
        html: `<p class="guide-lead">Names can change. The contract address identifies the official token. These are the contracts behind $CLAUS.</p>${addressCard(
          "$CLAUS token",
          content.token.address
        )}${addressCard(
          "Replaceable pool hook",
          "0x37Bfb8AC7C960E558657871D41Ca70E07e7DbfFf"
        )}${addressCard(
          "Claus NFT collection",
          "0x80396c7131159eB92E7E84839e51C9887A7A95d9"
        )}<nav class="source-links" aria-label="Explore onchain activity"><a href="/Wallet">Project wallet</a><a href="/Journal">Journal and transaction records</a></nav>`,
      };
    if (route.key === "wallet")
      return {
        heading: "Project wallet",
        section: "wallet",
        description: "Follow the project wallet on Ethereum.",
        html: `<p class="guide-lead">The wallet used for project activity. Its public transactions show what was received, spent and changed on Ethereum.</p>${addressCard(
          "Wallet address",
          content.wallets.activeAddress
        )}<section class="guide-section"><h2>Follow the activity</h2><p>Etherscan shows balances and individual transactions. The Journal explains the context behind published project changes.</p><div class="guide-actions">${external(
          `https://robin.etherscan.io/address/${content.wallets.activeAddress}`,
          "View transactions",
          "guide-button"
        )}<a class="guide-text-link" href="/Journal">Read the Journal</a></div></section>`,
      };
    if (route.key === "posts")
      return {
        heading: "Talk to Claus",
        section: "posts",
        description: "Find Claus on X.",
        html: `<p class="guide-lead">Have a question or an idea for what $CLAUS could become? Tag @contractclaus on X.</p><div class="guide-actions">${external(
          "https://x.com/contractclaussi",
          "Find Claus on X",
          "guide-button"
        )}</div><section class="guide-section"><h2>Looking for what changed?</h2><p>The Journal keeps the project’s published changes together, with their transaction records.</p><a class="guide-text-link" href="/Journal">Open the Journal</a></section>`,
      };
    return {
      heading: "Page not found",
      section: route.key,
      description: "This page could not be found.",
      html: '<p class="guide-lead">This link does not match a published page.</p><div class="guide-actions"><a class="guide-button" href="/">Back to Claus</a><a class="guide-text-link" href="/Hooks">Browse the hooks</a></div>',
    };
  }
  return { render };
})();

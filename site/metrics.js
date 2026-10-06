window.ClausMetrics = (() => {
  const token = "TBA";
  const targets = {
    Burn: ["/burn.json", "Total $CLAUS burned"],
    Buybacks: ["/hook-stats.json", "$CLAUS bought for the FOMO wallet"],
    Liquidity: ["/hook-stats.json", "ETH added to liquidity"],
    Weather: ["/fee-state.json", "Current weather allocation"],
  };
  const whole = (value) => (amount(value) / 10n ** 18n).toLocaleString("en-US");
  function amount(value) {
    if (!/^\d{1,78}$/.test(value)) throw Error("Invalid amount");
    return BigInt(value);
  }
  const eth = (value) => {
    const n = amount(value);
    return (
      (n / 10n ** 18n).toLocaleString("en-US") +
      "." +
      (n % 10n ** 18n).toString().padStart(18, "0").slice(0, 4)
    );
  };
  let request, timer;
  return {
    stop() {
      clearTimeout(timer);
      request?.abort();
    },
    show(page, route, reflow) {
      clearTimeout(timer);
      request?.abort();
      const key = route.path.split("/").pop();
      const config = targets[key];
      const notes = page.querySelector(".guide-notes");
      if (!config || !notes) return;
      const slot = document.createElement("section");
      slot.className = "live-stat";
      slot.innerHTML =
        '<h2></h2><p class="live-value">—</p><p class="live-detail"></p><small>Reading Ethereum…</small>';
      slot.querySelector("h2").textContent = config[1];
      notes.prepend(slot);
      reflow();
      async function load() {
        if (!slot.isConnected) return;
        if (document.hidden) {
          timer = setTimeout(load, 30000);
          return;
        }
        request = new AbortController();
        try {
          const response = await fetch(config[0], {
            signal: AbortSignal.any([
              request.signal,
              AbortSignal.timeout(20000),
            ]),
          });
          if (!response.ok) throw Error("Data unavailable");
          const data = await response.json();
          if (
            data.chainId !== 1 ||
            data.token !== token ||
            !Number.isSafeInteger(data.blockNumber) ||
            !Number.isFinite(Date.parse(data.observedAt)) ||
            Date.now() - Date.parse(data.observedAt) > 300000
          )
            throw Error("Unconfirmed data");
          let value, detail;
          if (key === "Burn") {
            if (
              data.measurement !== "initial_supply_minus_total_supply" ||
              amount(data.burned) + amount(data.totalSupply) !==
                amount(data.initialSupply)
            )
              throw Error("Invalid supply");
            value = whole(data.burned);
            detail = "Includes direct burns by holders.";
          } else if (key === "Buybacks") {
            if (
              data.measurement !== "successful_hook_events" ||
              data.fomo.recipient !==
                "0x04F1E9F9848C92508699BFcd59e0522e8246DC16"
            )
              throw Error("Invalid recipient");
            value = whole(data.fomo.tokensDelivered);
            detail = eth(data.fomo.ethSpent) + " ETH spent on these buybacks.";
          } else if (key === "Liquidity") {
            if (
              data.liquidity.tokenId !== 433751 ||
              data.liquidity.measurement !==
                "cumulative_hook_deposits_not_current_pool_balance"
            )
              throw Error("Invalid liquidity total");
            value = eth(data.liquidity.ethAdded);
            detail =
              whole(data.liquidity.tokensAdded) +
              " $CLAUS added. " +
              eth(data.liquidity.pendingEth) +
              " ETH saved for the next batch. Cumulative deposits, not the current pool balance.";
          } else {
            if (
              data.fees.unit !== "parts_per_million_of_gross_ETH" ||
              !["rain", "dry", "stale", "fallback"].includes(
                data.weather.mode
              ) ||
              ![data.fees.burn, data.fees.liquidity].every(Number.isSafeInteger)
            )
              throw Error("Invalid weather allocation");
            value =
              data.weather.mode === "dry"
                ? "Dry"
                : data.weather.mode === "rain"
                ? "Rain"
                : "No fresh report";
            detail = `${data.fees.burn / 10000}% to burns and ${
              data.fees.liquidity / 10000
            }% to liquidity. London Heathrow.`;
          }
          if (!slot.isConnected) return;
          slot.querySelector(".live-value").textContent = value;
          slot.querySelector(".live-detail").textContent = detail;
          slot.querySelector("small").textContent =
            "Ethereum block " + data.blockNumber.toLocaleString("en-US");
        } catch {
          if (slot.isConnected)
            slot.querySelector("small").textContent =
              "Live data temporarily unavailable. Retrying shortly.";
        } finally {
          if (slot.isConnected) {
            reflow();
            timer = setTimeout(load, 120000);
          }
        }
      }
      void load();
    },
  };
})();

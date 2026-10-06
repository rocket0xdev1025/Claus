window.ClausContent = (() => {
  const embedded = (id) => {
    try {
      return JSON.parse(document.getElementById(id)?.textContent || "null");
    } catch {
      return null;
    }
  };
  const entries = new Map();
  const initialEntry = embedded("journal-data");
  if (initialEntry?.id) entries.set(initialEntry.id, initialEntry);
  async function get(path) {
    const response = await fetch(path, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Error("Public content unavailable");
    return response.json();
  }
  return {
    async load() {
      const state = embedded("public-edition") || (await get("/state.json"));
      if (
        !state?.token ||
        !Array.isArray(state.logs) ||
        !Array.isArray(state.functions)
      )
        throw Error("Invalid public edition");
      return {
        token: state.token,
        wallets: state.wallets,
        journals: state.logs,
        functions: state.functions,
        revision: state.revision,
      };
    },
    async complete(content, route) {
      if (route?.key !== "journal") return;
      let id;
      try {
        id = decodeURIComponent(
          route.path.split("/")[2] || route.hash.slice(1)
        );
      } catch {
        return;
      }
      const entry = content.journals.find(
        (item) => item.id === id || String(item.number) === id
      );
      if (!entry || entry.body) return;
      try {
        const full =
          entries.get(entry.id) ||
          (await get(`/journal/${encodeURIComponent(entry.id)}.json`));
        if (full.id !== entry.id || typeof full.body !== "string")
          throw Error("Invalid Journal entry");
        entries.set(full.id, full);
        Object.assign(entry, full, { unavailable: false });
      } catch {
        entry.unavailable = true;
      }
    },
  };
})();

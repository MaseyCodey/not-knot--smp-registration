(() => {
  const CONFIG = window.SMP_CONFIG || {};
  const STORAGE_KEY = "notKnotSmpResponses";

  const loginCard = document.querySelector("#loginCard");
  const dashboard = document.querySelector("#dashboard");
  const loginForm = document.querySelector("#loginForm");
  const adminKeyInput = document.querySelector("#adminKey");
  const loginMessage = document.querySelector("#loginMessage");
  const adminMessage = document.querySelector("#adminMessage");
  const responsesEl = document.querySelector("#responses");
  const responseCount = document.querySelector("#responseCount");
  const refreshBtn = document.querySelector("#refreshBtn");
  const downloadBtn = document.querySelector("#downloadBtn");
  const logoutBtn = document.querySelector("#logoutBtn");

  let activeKey = "";
  let currentResponses = [];

  function setLoginMessage(text, type = "") {
    loginMessage.textContent = text;
    loginMessage.className = `message ${type}`.trim();
  }

  function setAdminMessage(text, type = "") {
    adminMessage.textContent = text;
    adminMessage.className = `message ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function unlock() {
    loginCard.classList.add("hidden");
    dashboard.classList.remove("hidden");
  }

  function normalizeResponse(row) {
    return {
      timestamp: row.timestamp || row.Timestamp || row["Timestamp"] || "",
      name: row.name || row.Name || row["Name"] || "",
      contact: row.contact || row["Email or Phone"] || row["Email / Phone Number"] || "",
      discord: row.discord || row.Discord || "",
      days: Array.isArray(row.days) ? row.days : String(row.Days || row.days || "").split(/,\s*/).filter(Boolean),
      birthday: row.birthday || row.Birthday || "",
      noGriefing: row.noGriefing || row["No Griefing Agreement"] || "",
      video: row.video || row["Application Video"] || "",
      ign: row.ign || row["Minecraft IGN"] || "",
      edition: row.edition || row["Minecraft Edition"] || ""
    };
  }

  function render(responses) {
    currentResponses = responses.map(normalizeResponse);
    responseCount.textContent = `${currentResponses.length} response${currentResponses.length === 1 ? "" : "s"} loaded.`;

    if (!currentResponses.length) {
      responsesEl.innerHTML = `<div class="empty-state">No responses yet. The response cave is empty.</div>`;
      return;
    }

    responsesEl.innerHTML = currentResponses.map((r, index) => {
      const date = r.timestamp ? new Date(r.timestamp) : null;
      const niceDate = date && !Number.isNaN(date.valueOf()) ? date.toLocaleString() : escapeHtml(r.timestamp || "No timestamp");
      const video = r.video ? `<a href="${escapeHtml(r.video)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.video)}</a>` : "";

      return `
        <article class="response-card">
          <div class="response-top">
            <h3>#${index + 1} ${escapeHtml(r.name || "No name")}</h3>
            <time>${escapeHtml(niceDate)}</time>
          </div>
          <div class="response-grid">
            ${item("Contact", r.contact)}
            ${item("Discord", r.discord || "—")}
            ${item("Days", (r.days || []).join(", ") || "—")}
            ${item("Birthday", r.birthday)}
            ${item("No griefing", r.noGriefing)}
            ${item("Minecraft IGN", r.ign || "—")}
            ${item("Edition", r.edition || "—")}
            <div class="data-item"><strong>Application video</strong><span>${video || "—"}</span></div>
          </div>
        </article>
      `;
    }).join("");
  }

  function item(label, value) {
    return `<div class="data-item"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`;
  }

  function jsonp(url) {
    return new Promise((resolve, reject) => {
      const callbackName = `smpCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const script = document.createElement("script");
      const separator = url.includes("?") ? "&" : "?";
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Request timed out."));
      }, 12000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("Could not load backend."));
      };

      script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}`;
      document.body.appendChild(script);
    });
  }

  async function loadResponses() {
    setAdminMessage("Loading responses...", "");

    const backendUrl = String(CONFIG.appsScriptUrl || "").trim();
    if (!backendUrl) {
      const local = loadLocal();
      render(local);
      setAdminMessage("Showing browser-only demo responses. Deploy the Google Sheets backend to see responses from everyone.", "success");
      return;
    }

    const url = `${backendUrl}?action=list&key=${encodeURIComponent(activeKey)}`;
    const data = await jsonp(url);

    if (!data || data.ok === false) {
      throw new Error(data?.error || "Admin key rejected.");
    }

    render(Array.isArray(data.responses) ? data.responses : []);
    setAdminMessage("Responses loaded from Google Sheets.", "success");
  }

  function toCsv(rows) {
    const headers = ["Timestamp", "Name", "Contact", "Discord", "Days", "Birthday", "No griefing", "Application video", "Minecraft IGN", "Minecraft Edition"];
    const values = rows.map(r => [
      r.timestamp, r.name, r.contact, r.discord, (r.days || []).join(", "), r.birthday, r.noGriefing, r.video, r.ign, r.edition
    ]);
    return [headers, ...values].map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    activeKey = adminKeyInput.value.trim();

    if (!String(CONFIG.appsScriptUrl || "").trim()) {
      if (activeKey !== String(CONFIG.localAdminPassword || "changeme")) {
        setLoginMessage("Wrong local demo password.", "error");
        return;
      }
    } else if (!activeKey) {
      setLoginMessage("Enter your admin key.", "error");
      return;
    }

    unlock();
    try { await loadResponses(); }
    catch (err) {
      console.error(err);
      setAdminMessage(err.message || "Could not load responses.", "error");
      render([]);
    }
  });

  refreshBtn?.addEventListener("click", () => loadResponses().catch(err => setAdminMessage(err.message, "error")));

  downloadBtn?.addEventListener("click", () => {
    const blob = new Blob([toCsv(currentResponses)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `not-knot-smp-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  logoutBtn?.addEventListener("click", () => {
    activeKey = "";
    adminKeyInput.value = "";
    currentResponses = [];
    dashboard.classList.add("hidden");
    loginCard.classList.remove("hidden");
    setLoginMessage("Locked.", "success");
    setAdminMessage("", "");
  });
})();

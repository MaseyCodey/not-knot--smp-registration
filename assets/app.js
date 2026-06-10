(() => {
  const CONFIG = window.SMP_CONFIG || {};
  const STORAGE_KEY = "notKnotSmpResponses";

  const form = document.querySelector("#quizForm");
  const msg = document.querySelector("#message");
  const formTitle = document.querySelector("#formTitle");
  const formSubtitle = document.querySelector("#formSubtitle");

  if (formTitle && CONFIG.formTitle) formTitle.textContent = CONFIG.formTitle;
  if (formSubtitle && CONFIG.formSubtitle) formSubtitle.textContent = CONFIG.formSubtitle;
  if (CONFIG.siteTitle) document.title = `${CONFIG.formTitle || "Registration"} • ${CONFIG.siteTitle}`;

  function setMessage(text, type = "") {
    msg.textContent = text;
    msg.className = `message ${type}`.trim();
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
  }

  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function saveLocal(response) {
    if (!CONFIG.keepLocalBackup) return;
    const existing = loadLocal();
    existing.unshift(response);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 250)));
  }

  function validate(formData, days, noGriefing) {
    const required = ["name", "contact", "birthday", "video"];
    for (const key of required) {
      if (!String(formData.get(key) || "").trim()) return "Fill out all required fields first.";
    }
    if (!days.length) return "Pick at least one day you can play.";
    if (!noGriefing) return "Pick Yes or No for the no griefing rule.";
    const video = String(formData.get("video") || "").trim();
    try { new URL(video); }
    catch { return "Your application video needs to be a real link."; }
    return "";
  }

  async function sendToAppsScript(response) {
    const url = String(CONFIG.appsScriptUrl || "").trim();
    if (!url) return { mode: "local" };

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(response)
    });

    return { mode: "backend" };
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const days = getCheckedValues("days");
    const noGriefing = getRadioValue("noGriefing");
    const edition = getRadioValue("edition");

    const error = validate(formData, days, noGriefing);
    if (error) {
      setMessage(error, "error");
      return;
    }

    const response = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      discord: String(formData.get("discord") || "").trim(),
      days,
      birthday: String(formData.get("birthday") || "").trim(),
      noGriefing,
      video: String(formData.get("video") || "").trim(),
      ign: String(formData.get("ign") || "").trim(),
      edition,
      userAgent: navigator.userAgent
    };

    submitBtn.disabled = true;
    setMessage("Submitting...", "");

    try {
      saveLocal(response);
      const result = await sendToAppsScript(response);
      form.reset();
      if (result.mode === "backend") {
        setMessage("Submitted. Your application flew into the response vault.", "success");
      } else {
        setMessage("Saved in this browser. Connect the Google Sheets backend to collect real responses from everyone.", "success");
      }
    } catch (err) {
      console.error(err);
      setMessage("It saved locally, but the online backend did not answer. Check your Apps Script URL.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

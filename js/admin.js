// ---------- Utilities ----------
const API_BASE_DEFAULT = "http://127.0.0.1:3330";
// const API_BASE_DEFAULT = "https://api.siteman.cessar.tech";

function $(id) {
  return document.getElementById(id);
}

function showAlert(type, message) {
  const box = $("alertBox");
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAlert() {
  const box = $("alertBox");
  box.classList.add("d-none");
  box.textContent = "";
}

function setPreview(el, obj) {
  el.textContent = JSON.stringify(obj, null, 2);
}

function normalizeBaseUrl(url) {
  return (url || "").replace(/\/+$/, "");
}

// ---------- Auth helpers ----------
function getJwt() {
  // JWT input can override, but localStorage is the main storage
  const fromInput = $("jwtInput")?.value?.trim();
  const fromStorage = localStorage.getItem("jwt") || "";
  return (fromInput || fromStorage).trim();
}

function setJwt(token) {
  const t = (token || "").trim();
  if (!t) return;
  localStorage.setItem("jwt", t);
  if ($("jwtInput")) $("jwtInput").value = t;
}

function clearJwt() {
  localStorage.removeItem("jwt");
  if ($("jwtInput")) $("jwtInput").value = "";
}

function setAuthedUI(isAuthed) {
  const loginSection = $("loginSection");
  const reportSection = $("reportSection");
  const logoutBtn = $("logoutBtn");

  if (isAuthed) {
    loginSection?.classList.add("d-none");
    reportSection?.classList.remove("d-none");
    logoutBtn?.classList.remove("d-none");
  } else {
    loginSection?.classList.remove("d-none");
    reportSection?.classList.add("d-none");
    logoutBtn?.classList.add("d-none");
  }
}

// ---------- State ----------
let blockCounter = 0;

// ---------- Block UI ----------
function createBlockCard({ type }) {
  const id = `block_${++blockCounter}`;

  const wrapper = document.createElement("div");
  wrapper.className = "block-card bg-white p-3";
  wrapper.dataset.blockId = id;

  wrapper.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <span class="badge text-bg-${type === "note" ? "warning" : "info"}">${type}</span>
        <span class="muted small">Block #${blockCounter}</span>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-block">Remove</button>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-md-4">
        <label class="form-label">Type</label>
        <select class="form-select" data-field="type">
          <option value="paragraph" ${type === "paragraph" ? "selected" : ""}>paragraph</option>
          <option value="note" ${type === "note" ? "selected" : ""}>note</option>
        </select>
      </div>

      <div class="col-md-8">
        <label class="form-label">Text (optional)</label>
        <textarea class="form-control" rows="2" data-field="content" placeholder="Write something..."></textarea>
      </div>

      <div class="col-12">
        <div class="d-flex align-items-center justify-content-between">
          <label class="form-label mb-0">Images (optional URLs)</label>
          <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-image">+ Add image URL</button>
        </div>
        <div class="mt-2 d-grid gap-2" data-field="images"></div>
        <div class="form-text">Example: https://cdn.example.com/photo.jpg</div>
      </div>
    </div>
  `;

  wrapper.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (action === "remove-block") {
      wrapper.remove();
      return;
    }
    if (action === "add-image") {
      const imagesWrap = wrapper.querySelector('[data-field="images"]');
      imagesWrap.appendChild(createImageRow());
      return;
    }
  });

  return wrapper;
}

function createImageRow(value = "") {
  const row = document.createElement("div");
  row.className = "input-group img-url-row";
  row.innerHTML = `
    <input type="url" class="form-control" placeholder="https://..." value="${value.replace(/"/g, "&quot;")}" />
    <button type="button" class="btn btn-outline-danger">Remove</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  return row;
}

function readBlocks() {
  const blocks = [];
  const blockEls = Array.from($("blocksContainer").children);

  blockEls.forEach((el) => {
    const type = el.querySelector('[data-field="type"]').value;
    const content = el.querySelector('[data-field="content"]').value.trim();

    const imgWrap = el.querySelector('[data-field="images"]');
    const urls = Array.from(imgWrap.querySelectorAll("input"))
      .map((i) => i.value.trim())
      .filter(Boolean);

    const block = { type };
    if (content) block.content = content;
    if (urls.length) block.images = urls;

    blocks.push(block);
  });

  return blocks;
}

function buildPayload() {
  return {
    siteId: $("siteId").value.trim(),
    reportDate: $("reportDate").value,
    progressPercent: Number($("progressPercent").value),
    blocks: readBlocks(),
  };
}

// ---------- Auth API ----------
async function login(apiBase, email, password) {
  // ✅ Adjust this endpoint to match your backend
  const url = `${API_BASE_DEFAULT}/auth/email/signin`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `Login failed (${res.status})`;
    throw new Error(msg);
  }

  // Common patterns: { token }, { jwt }, { accessToken }, { data: { token } }
  const token =
    json?.token ||
    json?.jwt ||
    json?.accessToken ||
    json?.data?.token ||
    json?.data?.jwt;

  if (!token) {
    throw new Error(
      "Login succeeded but no JWT token was returned by the API.",
    );
  }

  return { token, raw: json };
}

async function fetchSites(apiBase, jwt) {
  const res = await fetch(`${API_BASE_DEFAULT}/sites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg =
      json?.message || json?.error || `Failed to load sites (${res.status})`;
    throw new Error(msg);
  }

  // Accept either { items: [...] } or [...] etc.
  const items = Array.isArray(json) ? json : json?.sites || json?.data || [];
  if (!Array.isArray(items)) return [];

  return items;
}

function getSiteTitle(site) {
  // Adjust based on your API shape
  return (
    site?.name ||
    site?.title ||
    site?.siteName ||
    site?.code ||
    site?.id ||
    "Untitled site"
  );
}

function getSiteSubtitle(site) {
  // Adjust based on your API shape
  const parts = [];
  if (site?.address) parts.push(site.address);
  if (site?.city) parts.push(site.city);
  if (site?.clientName) parts.push(site.clientName);
  // fallback: show id if nothing else
  if (!parts.length && site?.id) parts.push(site.id);
  return parts.join(" • ");
}

function setSelectedSite(site) {
  const siteId = site?.id || site?.siteId || "";
  $("siteId").value = siteId;

  const title = getSiteTitle(site);
  const subtitle = getSiteSubtitle(site);

  $("siteDropdownBtn").innerHTML = subtitle
    ? `${escapeHtml(title)} <div class="small text-muted">${escapeHtml(subtitle)}</div>`
    : escapeHtml(title);

  // Hide invalid message if selected
  $("siteInvalid").style.display = siteId ? "none" : "block";
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSitesDropdown(sites) {
  const menu = $("siteDropdownMenu");
  menu.innerHTML = "";

  if (!sites.length) {
    menu.innerHTML = `<li class="px-3 py-2 text-muted small">No sites found.</li>`;
    return;
  }

  sites.forEach((site) => {
    const title = getSiteTitle(site);
    const subtitle = getSiteSubtitle(site);

    const li = document.createElement("li");
    li.innerHTML = `
      <button type="button" class="dropdown-item rounded-2">
        <div class="fw-semibold">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="small text-muted">${escapeHtml(subtitle)}</div>` : ""}
      </button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      setSelectedSite(site);
    });

    menu.appendChild(li);
  });
}

async function loadSitesIntoUI() {
  const jwt = getJwt();

  if (!jwt) {
    // Not logged in yet
    const menu = $("siteDropdownMenu");
    if (menu)
      menu.innerHTML = `<li class="px-3 py-2 text-muted small">Log in to load sites.</li>`;
    return;
  }

  const menu = $("siteDropdownMenu");
  if (menu)
    menu.innerHTML = `<li class="px-3 py-2 text-muted small">Loading…</li>`;

  try {
    const sites = await fetchSites(API_BASE_DEFAULT, jwt);
    renderSitesDropdown(sites);

    // Optional: auto-select first site if nothing selected yet
    if (!$("siteId").value && sites[0]) setSelectedSite(sites[0]);
  } catch (err) {
    if (menu)
      menu.innerHTML = `<li class="px-3 py-2 text-danger small">${escapeHtml(err.message || err)}</li>`;
  }
}

// ---------- Init ----------
function init() {
  // default date today
  const today = new Date();
  $("reportDate").value = today.toISOString().slice(0, 10);

  // load jwt from localStorage
  const savedJwt = localStorage.getItem("jwt");
  if (savedJwt) $("jwtInput").value = savedJwt;

  // initial block
  $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));

  // progress bar update
  function updateProgressBar() {
    const val = Math.max(
      0,
      Math.min(100, Number($("progressPercent").value || 0)),
    );
    $("progressBar").style.width = val + "%";
    $("progressBar").textContent = val + "%";
    $("progressPercent").value = val;
  }
  $("progressPercent").addEventListener("input", updateProgressBar);
  updateProgressBar();

  // add block buttons
  $("addParagraphBtn").addEventListener("click", () => {
    $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));
  });
  $("addNoteBtn").addEventListener("click", () => {
    $("blocksContainer").appendChild(createBlockCard({ type: "note" }));
  });

  // manual save jwt (still useful for debugging)
  $("saveJwtBtn").addEventListener("click", () => {
    const t = $("jwtInput").value.trim();
    if (!t) {
      clearJwt();
      showAlert("secondary", "JWT removed from localStorage.");
      setAuthedUI(false);
      return;
    }
    setJwt(t);
    showAlert("success", "JWT saved to localStorage.jwt");
    setAuthedUI(true);
  });

  // logout
  $("logoutBtn")?.addEventListener("click", () => {
    clearAlert();
    clearJwt();
    showAlert("secondary", "Logged out.");
    setAuthedUI(false);
  });

  // login form submit
  $("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert();

    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert("danger", "Please fix validation errors.");
      return;
    }

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    try {
      const { token } = await login(API_BASE_DEFAULT, email, password);
      setJwt(token);
      setAuthedUI(true);
      await loadSitesIntoUI();
      showAlert("success", "Authenticated successfully.");
    } catch (err) {
      showAlert("danger", String(err.message || err));
      setAuthedUI(false);
    }
  });

  // preview payload
  $("previewPayloadBtn").addEventListener("click", () => {
    clearAlert();
    setPreview($("payloadPreview"), buildPayload());
  });

  // reset
  $("resetBtn").addEventListener("click", () => {
    clearAlert();
    $("siteId").value = "";
    $("progressPercent").value = 0;
    $("blocksContainer").innerHTML = "";
    $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));
    $("responsePreview").textContent = "";
    setPreview($("payloadPreview"), buildPayload());
    $("progressBar").style.width = "0%";
    $("progressBar").textContent = "0%";
  });

  // form submit (create report)
  $("reportForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert();

    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert("danger", "Please fix validation errors.");
      return;
    }

    const jwt = getJwt();
    if (!jwt) {
      showAlert("warning", "You are not logged in. Please sign in first.");
      setAuthedUI(false);
      return;
    }

    const payload = buildPayload();
    setPreview($("payloadPreview"), payload);
    if (!$("siteId").value.trim()) {
      $("siteInvalid").style.display = "block";
      showAlert("danger", "Please select a site.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_DEFAULT}/reports${payload.siteId ? `/${payload.siteId}` : ""}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      setPreview($("responsePreview"), json);

      // If token expired/invalid, kick back to login
      if (res.status === 401 || res.status === 403) {
        clearJwt();
        setAuthedUI(false);
        showAlert("warning", "Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        showAlert(
          "danger",
          `Failed to create report (${res.status}). See response below.`,
        );
        return;
      }

      if (json?.clientAccess?.code) {
        showAlert(
          "success",
          `Report created. Client code: ${json.clientAccess.code}`,
        );
      } else {
        showAlert("success", "Report created successfully.");
      }
    } catch (err) {
      showAlert("danger", "Network error creating report.");
      $("responsePreview").textContent = String(err);
    }
  });

  // initial preview
  setPreview($("payloadPreview"), buildPayload());

  // initial UI state
  const hasToken = !!localStorage.getItem("jwt");
  setAuthedUI(hasToken);
  if (hasToken) loadSitesIntoUI();
}

init();

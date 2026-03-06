let minProgressPercentage = 0;
// const API_BASE_DEFAULT = "https://api.siteman.cessar.tech";
const API_BASE_DEFAULT = "http://127.0.0.1:3330";

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

async function showCodeBox(site, type, message) {
  const [codeResp, reportResp] = await Promise.all([
    fetch(`${API_BASE_DEFAULT}/sites/${site}/client-code`, {
      headers: {
        Authorization: `Bearer ${getJwt()}`,
      },
    }),
    fetch(`${API_BASE_DEFAULT}/reports/site/${site}`, {
      headers: {
        Authorization: `Bearer ${getJwt()}`,
      },
    }),
  ]);

  const [codeData, reportData] = await Promise.all([
    codeResp.json(),
    reportResp.json(),
  ]);

  minProgressPercentage = reportData?.[0]?.progress_percent || 0;
  updateProgressBar(minProgressPercentage);
  $("progressPercent").min = minProgressPercentage;

  const box = $("codeBox");
  if (codeData.code) {
    box.textContent = `${message}\n\n${codeData.code}`;
  }
  box.className = `alert alert-${type}`;
  box.classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAlert() {
  const box = $("alertBox");
  box.classList.add("d-none");
  box.textContent = "";
}

function getJwt() {
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

let blockCounter = 0;

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
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <label class="form-label mb-0">Images (optional)</label>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-camera-image">+ Camera</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-action="add-gallery-image">+ Gallery</button>
          </div>
        </div>

        <div class="mt-2 d-grid gap-2" data-field="images"></div>
        <div class="form-text">
          On mobile, Camera opens the device camera directly when supported.
        </div>
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

    const imagesWrap = wrapper.querySelector('[data-field="images"]');

    if (action === "add-camera-image") {
      const row = createImageRow({ useCamera: true });
      imagesWrap.appendChild(row);
      row.querySelector('input[type="file"]').click();
      return;
    }

    if (action === "add-gallery-image") {
      const row = createImageRow({ useCamera: false });
      imagesWrap.appendChild(row);
      row.querySelector('input[type="file"]').click();
      return;
    }
  });

  return wrapper;
}

function createImageRow({ useCamera = false } = {}) {
  const row = document.createElement("div");
  row.className = "border rounded p-2 bg-light";

  row.innerHTML = `
    <div class="d-flex align-items-center gap-2 flex-wrap">
      <input
        type="file"
        class="form-control"
        accept="image/*"
        ${useCamera ? 'capture="environment"' : ""}
        style="max-width: 320px;"
      />
      <button type="button" class="btn btn-outline-danger btn-sm">Remove</button>
    </div>
    <div class="mt-2 d-none" data-role="preview-wrap">
      <img
        data-role="preview-img"
        alt="Preview"
        class="img-thumbnail"
        style="max-width: 180px; max-height: 180px; object-fit: cover;"
      />
      <div class="small text-muted mt-1" data-role="file-name"></div>
    </div>
  `;

  const fileInput = row.querySelector('input[type="file"]');
  const removeBtn = row.querySelector("button");
  const previewWrap = row.querySelector('[data-role="preview-wrap"]');
  const previewImg = row.querySelector('[data-role="preview-img"]');
  const fileName = row.querySelector('[data-role="file-name"]');

  let objectUrl = null;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];

    if (!file) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      previewWrap.classList.add("d-none");
      previewImg.removeAttribute("src");
      fileName.textContent = "";
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);

    previewImg.src = objectUrl;
    fileName.textContent = file.name;
    previewWrap.classList.remove("d-none");
  });

  removeBtn.addEventListener("click", () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    row.remove();
  });

  return row;
}

function readBlocks() {
  const blocks = [];
  const blockEls = Array.from($("blocksContainer").children);

  blockEls.forEach((el) => {
    const type = el.querySelector('[data-field="type"]').value;
    const content = el.querySelector('[data-field="content"]').value.trim();

    const block = { type };
    if (content) block.content = content;

    blocks.push(block);
  });

  return blocks;
}

function getBlockFiles() {
  const blockEls = Array.from($("blocksContainer").children);

  return blockEls.map((el) => {
    const imgWrap = el.querySelector('[data-field="images"]');
    const fileInputs = Array.from(
      imgWrap.querySelectorAll('input[type="file"]'),
    );

    return fileInputs.map((input) => input.files?.[0] || null).filter(Boolean);
  });
}

function buildReportPayload() {
  return {
    reportDate: $("reportDate").value,
    progressPercent: Number($("progressPercent").value),
    blocks: readBlocks(),
  };
}

function buildReportFormData() {
  const formData = new FormData();
  const reportPayload = buildReportPayload();
  const blockFiles = getBlockFiles();

  formData.append("report", JSON.stringify(reportPayload));

  blockFiles.forEach((files, blockIndex) => {
    files.forEach((file) => {
      formData.append(`blockImages[${blockIndex}]`, file);
    });
  });

  return formData;
}

async function login(apiBase, email, password) {
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

  const items = Array.isArray(json) ? json : json?.sites || json?.data || [];
  if (!Array.isArray(items)) return [];

  return items;
}

function getSiteTitle(site) {
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
  const parts = [];
  if (site?.address) parts.push(site.address);
  if (site?.city) parts.push(site.city);
  if (site?.clientName) parts.push(site.clientName);
  if (!parts.length && site?.id) parts.push(site.id);
  return parts.join(" • ");
}

function setSelectedSite(site) {
  const siteId = site?.id || site?.siteId || "";
  $("siteId").value = siteId;
  showCodeBox(siteId, "success", "Report code for client:");

  const title = getSiteTitle(site);
  const subtitle = getSiteSubtitle(site);

  $("siteDropdownBtn").innerHTML = subtitle
    ? `${escapeHtml(title)} <div class="small text-muted">${escapeHtml(subtitle)}</div>`
    : escapeHtml(title);

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
    const menu = $("siteDropdownMenu");
    if (menu) {
      menu.innerHTML = `<li class="px-3 py-2 text-muted small">Log in to load sites.</li>`;
    }
    return;
  }

  const menu = $("siteDropdownMenu");
  if (menu) {
    menu.innerHTML = `<li class="px-3 py-2 text-muted small">Loading…</li>`;
  }

  try {
    const sites = await fetchSites(API_BASE_DEFAULT, jwt);
    renderSitesDropdown(sites);

    if (!$("siteId").value && sites[0]) {
      setSelectedSite(sites[0]);
    }
  } catch (err) {
    if (menu) {
      menu.innerHTML = `<li class="px-3 py-2 text-danger small">${escapeHtml(err.message || err)}</li>`;
    }
  }
}

function updateProgressBar(value) {
  const warning = $("progressWarning");

  if (typeof value !== "object") {
    const val = Math.max(0, Math.min(100, Number(value)));
    if (warning) warning.classList.add("d-none");

    $("progressBar").style.width = val + "%";
    $("progressBar").textContent = val + "%";
    $("progressPercent").value = val;
  } else {
    let val = Number($("progressPercent").value || minProgressPercentage);

    if (val < minProgressPercentage) {
      if (warning) warning.classList.remove("d-none");
    } else {
      if (warning) warning.classList.add("d-none");
    }

    val = Math.max(minProgressPercentage, Math.min(100, val));

    $("progressBar").style.width = val + "%";
    $("progressBar").textContent = val + "%";
    $("progressPercent").value = val;
  }
}

function resetFormUI() {
  clearAlert();
  $("siteId").value = "";
  $("progressPercent").value = 0;
  $("blocksContainer").innerHTML = "";
  $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));
  $("progressBar").style.width = "0%";
  $("progressBar").textContent = "0%";
  $("siteDropdownBtn").innerHTML = "Select a site...";
  const codeBox = $("codeBox");
  if (codeBox) {
    codeBox.classList.add("d-none");
    codeBox.textContent = "";
  }
}

function init() {
  const today = new Date();
  $("reportDate").value = today.toISOString().slice(0, 10);

  const savedJwt = localStorage.getItem("jwt");
  if (savedJwt) $("jwtInput").value = savedJwt;

  $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));

  $("progressPercent").addEventListener("input", updateProgressBar);
  updateProgressBar();

  $("addParagraphBtn").addEventListener("click", () => {
    $("blocksContainer").appendChild(createBlockCard({ type: "paragraph" }));
  });

  $("addNoteBtn").addEventListener("click", () => {
    $("blocksContainer").appendChild(createBlockCard({ type: "note" }));
  });

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

  $("logoutBtn")?.addEventListener("click", () => {
    clearAlert();
    clearJwt();
    showAlert("secondary", "Logged out.");
    setAuthedUI(false);
  });

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

  $("resetBtn").addEventListener("click", () => {
    resetFormUI();
  });

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

    const siteId = $("siteId").value.trim();
    if (!siteId) {
      $("siteInvalid").style.display = "block";
      showAlert("danger", "Please select a site.");
      return;
    }

    const progress = Number($("progressPercent").value || 0);
    if (progress < minProgressPercentage) {
      showAlert(
        "danger",
        `Progress cannot be lower than ${minProgressPercentage}%.`,
      );
      return;
    }

    const formData = buildReportFormData();

    try {
      const res = await fetch(`${API_BASE_DEFAULT}/reports/${siteId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      if (res.status === 401 || res.status === 403) {
        clearJwt();
        setAuthedUI(false);
        showAlert("warning", "Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        showAlert(
          "danger",
          json?.message || `Failed to create report (${res.status}).`,
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

      const selectedSiteId = $("siteId").value.trim();
      resetFormUI();
      if (selectedSiteId) {
        $("siteId").value = selectedSiteId;
        await loadSitesIntoUI();
      }
    } catch (err) {
      showAlert("danger", "Network error creating report.");
    }
  });

  const hasToken = !!localStorage.getItem("jwt");
  setAuthedUI(hasToken);
  if (hasToken) loadSitesIntoUI();
}

init();

// --------------------
// Helpers
// --------------------
function $(id) {
  return document.getElementById(id);
}

function normalizeBaseUrl(url) {
  return (url || "").replace(/\/+$/, "");
}

function showAlert(type, msg) {
  const box = $("alertBox");
  box.className = `alert alert-${type}`;
  box.textContent = msg;
  box.classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAlert() {
  const box = $("alertBox");
  box.classList.add("d-none");
  box.textContent = "";
}

function setSessionHint(site) {
  const hint = $("sessionHint");
  if (!site) {
    hint.textContent = "";
    return;
  }
  hint.textContent = `Unlocked: ${site.name || "Site"} (${site.id})`;
}

function setProgress(pct) {
  const v = Math.max(0, Math.min(100, Number(pct || 0)));
  $("progressValue").textContent = v;
  $("progressBar").style.width = v + "%";
  $("progressBar").textContent = v + "%";
}

// --------------------
// Storage keys
// --------------------
const LS_TOKEN = "clientToken";
const LS_SITE = "clientSite"; // store site info JSON
const LS_API = "clientApiBase";
const SITE_ID = "siteId"; // optional: if you want to store site ID separately

// --------------------
// API calls
// --------------------
async function clientAuth({ apiBase, code }) {
  const res = await fetch(`${apiBase}/client/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Invalid code");
  return data; // { token, site, expiresInHours }
}

async function fetchClientReports({ apiBase, token }) {
  const siteId = localStorage.getItem(SITE_ID);
  const res = await fetch(`${apiBase}/client/reports/site/${siteId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to fetch reports");
  return data; // could be array or {reports:[]}, we handle both
}

// OPTIONAL (recommended): fetch one report detail
async function fetchClientReportDetail({ apiBase, token, reportId }) {
  const res = await fetch(`${apiBase}/client/site/reports/${reportId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to fetch report");
  return data; // expected: full report + blocks
}

// --------------------
// Rendering
// --------------------
function renderReportsList(reports) {
  const list = $("reportsList");
  list.innerHTML = "";

  if (!reports || reports.length === 0) {
    $("reportsEmpty").classList.remove("d-none");
    return;
  }
  $("reportsEmpty").classList.add("d-none");

  reports.forEach((r) => {
    const a = document.createElement("a");
    a.className = "list-group-item list-group-item-action clickable";
    a.dataset.reportId = r.id;

    const date = r.report_date || r.reportDate || "";
    const progress = r.progress_percent ?? r.progressPercent ?? 0;

    a.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
              <div class="fw-semibold">Report</div>
              <small class="muted">${date}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <small class="muted mono">${r.id}</small>
              <span class="badge text-bg-primary">${progress}%</span>
            </div>
          `;

    a.addEventListener("click", async () => {
      const apiBase = normalizeBaseUrl($("apiBase").value);
      const token = localStorage.getItem(LS_TOKEN);
      if (!token)
        return showAlert("warning", "Session expired. Enter code again.");

      try {
        clearAlert();
        // If you don't have the detail route yet, we fall back to showing minimal info
        const detail = await fetchClientReportDetail({
          apiBase,
          token,
          reportId: r.id,
        });
        renderReportDetail(detail);
      } catch (e) {
        // fallback: show minimal report info
        showAlert(
          "info",
          "Report detail route not available. Showing summary only.",
        );
        renderReportDetail({
          report: {
            id: r.id,
            reportDate: date,
            progressPercent: progress,
          },
          blocks: [],
        });
      }
    });

    list.appendChild(a);
  });
}

function renderReportDetail(data) {
  $("reportDetailEmpty").classList.add("d-none");
  $("reportDetail").classList.remove("d-none");

  // support either {report, blocks} or a flat object
  const report = data.report || data;
  const blocks = data.blocks || report.blocks || [];

  const reportDate = report.report_date || report.reportDate || "";
  const progress = report.progress_percent ?? report.progressPercent ?? 0;

  $("reportTitle").textContent = `Report`;
  $("reportMeta").textContent = `Date: ${reportDate} • ID: ${report.id || ""}`;
  setProgress(progress);

  const blocksContainer = $("blocksContainer");
  blocksContainer.innerHTML = "";

  if (!blocks.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "No blocks in this report.";
    blocksContainer.appendChild(empty);
    return;
  }

  blocks.forEach((b) => {
    const type = b.block_type || b.type || "paragraph";
    const content = (b.content || "").trim();

    const images =
      b.images ||
      b.image_urls ||
      b.imageUrls ||
      (b.imageRows ? b.imageRows.map((x) => x.image_url) : []);

    const card = document.createElement("div");
    card.className = `report-card bg-white p-3`;

    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center mb-2";
    header.innerHTML = `
            <span class="badge text-bg-${type === "note" ? "warning" : "info"}">${type}</span>
          `;

    const body = document.createElement("div");
    body.className = `block ${type === "note" ? "note" : ""}`;

    body.innerHTML = content
      ? `<div>${escapeHtml(content).replace(/\n/g, "<br/>")}</div>`
      : `<div class="muted">No text.</div>`;

    card.appendChild(header);
    card.appendChild(body);

    if (images && images.length) {
      const grid = document.createElement("div");
      grid.className = "img-grid mt-3";

      images.forEach((url) => {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.src = url;
        img.alt = "Report image";
        grid.appendChild(img);
      });

      card.appendChild(grid);
    }

    blocksContainer.appendChild(card);
  });

  // Debug (optional)
  // $("rawDebug").classList.remove("d-none");
  // $("rawDebug").textContent = JSON.stringify(data, null, 2);
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// --------------------
// Init + actions
// --------------------
async function unlockWithCode() {
  clearAlert();

  const apiBase = normalizeBaseUrl($("apiBase").value);
  const code = $("codeInput").value.trim();

  if (!code) {
    showAlert("warning", "Please enter your access code.");
    return;
  }

  try {
    const data = await clientAuth({ apiBase, code });
    console.log("Auth success:", data);
    localStorage.setItem(LS_TOKEN, data.token);
    localStorage.setItem(LS_SITE, JSON.stringify(data.site || null));
    localStorage.setItem(LS_API, apiBase);
    localStorage.setItem(SITE_ID, data.site?.id || "");

    setSessionHint(data.site);
    showAlert("success", "Access granted. Loading reports...");

    await loadReports();
  } catch (e) {
    showAlert("danger", e?.message || "Invalid code.");
  }
}

async function loadReports() {
  clearAlert();
  const apiBase = normalizeBaseUrl($("apiBase").value);
  const token = localStorage.getItem(LS_TOKEN);

  if (!token) {
    showAlert("warning", "No client session. Enter your access code.");
    return;
  }

  try {
    const raw = await fetchClientReports({ apiBase, token });

    // support both: array OR {reports:[...]}
    const reports = Array.isArray(raw) ? raw : raw.reports || raw.items || [];
    renderReportsList(reports);

    const site = JSON.parse(localStorage.getItem(LS_SITE) || "null");
    setSessionHint(site);
    $("siteInfo").textContent = site
      ? `Site: ${site.name || ""} • ${site.address || ""}`
      : "";

    if (reports.length === 0) {
      $("reportDetailEmpty").classList.remove("d-none");
      $("reportDetail").classList.add("d-none");
    }
  } catch (e) {
    showAlert("danger", e?.message || "Failed to fetch reports.");
  }
}

function useSavedSession() {
  clearAlert();
  const savedApi = localStorage.getItem(LS_API);
  if (savedApi) $("apiBase").value = savedApi;

  const site = JSON.parse(localStorage.getItem(LS_SITE) || "null");
  setSessionHint(site);

  loadReports();
}

function logout() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_SITE);
  localStorage.removeItem(LS_API);

  $("reportsList").innerHTML = "";
  $("reportsEmpty").classList.add("d-none");
  $("siteInfo").textContent = "";
  $("reportDetail").classList.add("d-none");
  $("reportDetailEmpty").classList.remove("d-none");
  $("codeInput").value = "";
  setSessionHint(null);

  showAlert("secondary", "Logged out.");
}

// wire buttons
$("authBtn").addEventListener("click", unlockWithCode);
$("loadSavedBtn").addEventListener("click", useSavedSession);
$("logoutBtn").addEventListener("click", logout);
$("refreshReportsBtn").addEventListener("click", loadReports);

// auto-load saved session on open
(function boot() {
  const savedApi = localStorage.getItem(LS_API);
  if (savedApi) $("apiBase").value = savedApi;

  const site = JSON.parse(localStorage.getItem(LS_SITE) || "null");
  if (site) setSessionHint(site);

  if (localStorage.getItem(LS_TOKEN)) {
    useSavedSession();
  }
})();

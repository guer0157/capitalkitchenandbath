// ---------- Utilities ----------
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

  // Add one empty image row? (No, keep it clean)
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

  blockEls.forEach((el, idx) => {
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
  const payload = {
    siteId: $("siteId").value.trim(),
    reportDate: $("reportDate").value,
    progressPercent: Number($("progressPercent").value),
    blocks: readBlocks(),
  };
  return payload;
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

  // save jwt
  $("saveJwtBtn").addEventListener("click", () => {
    const t = $("jwtInput").value.trim();
    if (!t) {
      localStorage.removeItem("jwt");
      showAlert("secondary", "JWT removed from localStorage.");
      return;
    }
    localStorage.setItem("jwt", t);
    showAlert("success", "JWT saved to localStorage.jwt");
  });

  // preview payload
  $("previewPayloadBtn").addEventListener("click", () => {
    clearAlert();
    const payload = buildPayload();
    setPreview($("payloadPreview"), payload);
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

  // form submit
  $("reportForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert();

    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert("danger", "Please fix validation errors.");
      return;
    }

    const apiBase = normalizeBaseUrl($("apiBase").value);
    const jwt = (
      $("jwtInput").value.trim() ||
      localStorage.getItem("jwt") ||
      ""
    ).trim();
    if (!jwt) {
      showAlert(
        "warning",
        "Missing JWT. Paste it above or save it to localStorage.jwt.",
      );
      return;
    }

    const payload = buildPayload();
    setPreview($("payloadPreview"), payload);

    try {
      const res = await fetch(`${apiBase}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      setPreview($("responsePreview"), json);

      if (!res.ok) {
        showAlert(
          "danger",
          `Failed to create report (${res.status}). See response below.`,
        );
        return;
      }

      // Your backend may return client access code when created:
      // { reportId, clientAccess: { code, existed } }
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
}

init();

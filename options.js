const DEFAULT_SITES = ["reddit.com", "x.com", "facebook.com", "instagram.com", "tiktok.com"];
const DEFAULT_DELAY = 30;

const TRASH_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5h11M5.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M6.5 7v4M9.5 7v4"/><path d="M3.5 4.5l.5 8a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5l.5-8"/></svg>';
const GLOBE_ICON = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="#6b5e55" stroke-width="1.2"><circle cx="8" cy="8" r="6.5"/><ellipse cx="8" cy="8" rx="3" ry="6.5"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>');

let sites = [];

function save() {
  const delay = Math.max(1, parseInt(document.getElementById("delay").value, 10) || DEFAULT_DELAY);
  const enabled = document.getElementById("enabled-toggle").checked;
  chrome.storage.sync.set({ sites, delay, enabled });
}

function renderSites() {
  const list = document.getElementById("site-list");
  list.innerHTML = "";

  if (sites.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No sites blocked yet. Add one below.";
    list.appendChild(li);
    return;
  }

  sites.forEach((site, i) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.className = "site-favicon";
    img.src = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(site) + "&sz=32";
    img.alt = "";
    img.onerror = function () { this.src = GLOBE_ICON; };
    const span = document.createElement("span");
    span.className = "site-name-text";
    span.textContent = site;
    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.innerHTML = TRASH_ICON;
    btn.title = "Remove " + site;
    btn.setAttribute("aria-label", "Remove " + site);
    btn.addEventListener("click", () => {
      sites.splice(i, 1);
      renderSites();
      save();
    });
    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateDisabledNotice(enabled) {
  document.getElementById("disabled-notice").classList.toggle("visible", !enabled);
}

// Load saved settings.
chrome.storage.sync.get({ sites: DEFAULT_SITES, delay: DEFAULT_DELAY, enabled: true }, (data) => {
  sites = data.sites;
  document.getElementById("delay").value = data.delay;
  document.getElementById("enabled-toggle").checked = data.enabled;
  updateDisabledNotice(data.enabled);
  renderSites();
});

// Toggle saves immediately.
document.getElementById("enabled-toggle").addEventListener("change", (e) => {
  updateDisabledNotice(e.target.checked);
  save();
});

// Delay saves on change.
document.getElementById("delay").addEventListener("change", () => {
  save();
});

// Add a new site.
document.getElementById("btn-add").addEventListener("click", () => {
  const input = document.getElementById("new-site");
  const value = input.value.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  if (value && !sites.includes(value)) {
    sites.push(value);
    renderSites();
    save();
    input.value = "";
  }
});

document.getElementById("new-site").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btn-add").click();
  }
});

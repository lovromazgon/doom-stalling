const DEFAULT_SITES = ["reddit.com", "x.com", "facebook.com", "instagram.com", "tiktok.com"];
const DEFAULT_DELAY = 30;

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept top-level navigations (not iframes).
  if (details.frameId !== 0) {
    return;
  }

  // If this tab just got the green light, let it through.
  // Uses chrome.storage.session so the bypass survives service worker restarts.
  const key = `proceed_${details.tabId}`;
  const result = await chrome.storage.session.get(key);
  if (result[key]) {
    await chrome.storage.session.remove(key);
    return;
  }

  let url;
  try {
    url = new URL(details.url);
  } catch {
    return;
  }

  const hostname = url.hostname.replace(/^www\./, "");

  const { sites, delay, enabled } = await chrome.storage.sync.get({
    sites: DEFAULT_SITES,
    delay: DEFAULT_DELAY,
    enabled: true,
  });

  if (!enabled) {
    return;
  }

  const matched = sites.some((site) => {
    const pattern = site.replace(/^www\./, "").toLowerCase();
    return hostname.toLowerCase() === pattern || hostname.toLowerCase().endsWith("." + pattern);
  });

  if (!matched) {
    return;
  }

  const stallUrl =
    chrome.runtime.getURL("stall.html") +
    "?url=" + encodeURIComponent(details.url) +
    "&delay=" + encodeURIComponent(delay) +
    "&site=" + encodeURIComponent(hostname);

  chrome.tabs.update(details.tabId, { url: stallUrl });
});

// Listen for messages from the stall page to allow proceeding.
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "proceed" && sender.tab) {
    const key = `proceed_${sender.tab.id}`;
    chrome.storage.session.set({ [key]: true }).then(() => {
      chrome.tabs.update(sender.tab.id, { url: message.url });
    });
  }
});

const QUESTIONS = [
  "Don't you have something better to do?",
  "Is future-you going to be proud of this decision?",
  "What would your mom think right now?",
  "Weren't you supposed to be working?",
  "How did the last 2-hour scroll session make you feel?",
  "You know you're not going to find anything new, right?",
  "What if you read a book instead?",
  "Your posture is terrible right now. Fix it. Then reconsider.",
  "Remember that thing you've been putting off? Yeah, that one.",
  "Be honest — is this really what you want to be doing?",
  "You opened this tab on autopilot, didn't you?",
  "One does not simply scroll for 'just 5 minutes'.",
  "Plot twist: the content will still be there tomorrow.",
];

const params = new URLSearchParams(window.location.search);
const originalUrl = params.get("url") || "";
const siteName = params.get("site") || originalUrl;
const delay = Math.max(1, parseInt(params.get("delay"), 10) || 30);

document.getElementById("site-name").textContent = siteName;
document.getElementById("question").textContent =
  QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

const countdownEl = document.getElementById("countdown");
const ringEl = document.getElementById("ring");
const circumference = 2 * Math.PI * 54; // matches r=54 in SVG

ringEl.style.strokeDasharray = circumference;
ringEl.style.strokeDashoffset = "0";

let remaining = delay;
countdownEl.textContent = remaining;

// Kick off the first ring segment immediately so the animation starts at
// page load. The CSS transition (1s linear) animates it visually. Each
// interval tick then: (1) updates the number to match what the ring just
// finished showing, and (2) sets the next ring target.
let ticks = 0;

function advanceRing() {
  ticks++;
  ringEl.style.strokeDashoffset = ((ticks / delay) * circumference).toString();
}

// Start the first ring segment right away (after a frame so the browser
// registers the initial strokeDashoffset: 0 before transitioning).
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    advanceRing();
  });
});

const timer = setInterval(() => {
  // The ring just finished animating to the current tick, so update the
  // number to reflect where the ring visually is now.
  remaining = delay - ticks;
  countdownEl.textContent = remaining;

  if (ticks >= delay) {
    clearInterval(timer);
    document.getElementById("btn-proceed").disabled = false;
    return;
  }

  // Set the next ring target — the CSS transition will animate it over 1s.
  advanceRing();
}, 1000);

document.getElementById("btn-back").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.close();
  }
});

document.getElementById("btn-proceed").addEventListener("click", () => {
  if (originalUrl) {
    chrome.runtime.sendMessage({ action: "proceed", url: originalUrl });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // if (document.body.classList.contains("main-page")) {
  //     setInterval(createCircle, 3500); // Runs only on breathe-page
  // }

  if (document.body.classList.contains("breathe__page")) {
    setInterval(updateCountdown, 1000); // Runs only on main-page
  }
  // if (document.body.classList.contains("breathe-page")) {
  //     setInterval(calmingBreathing, 5000); // Runs only on main-page
  // }
});

const startingMinutes = 10;
let time = startingMinutes * 60;

function updateCountdown() {
  const countdownElement = document.getElementById("countdown");
  if (!countdownElement) return; // Prevent errors if element is missing

  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  countdownElement.innerHTML = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  time--;
  if (time < 0) {
    return;
  }
}

// Inhale/Exhale section

let breathTime = 15;
let isInhaling = true;
let isOngoing = false;
let breathingInterval = null;
let breathingModes = ["default", "box"];
let breathingMode = breathingModes[0];
let boxStep = 0;

const breath__button = document.getElementById("breath__button");
const mode__button = document.getElementById("mode__button");
const breathingElement = document.getElementById("breath__state");
const breathRectangle = document.getElementById("rectangle__container");
const breathCircle = document.getElementById("breathCircle");

// Start Session Button Listener (legacy fallback)
document
  .getElementById("startSessionButton")
  ?.addEventListener("click", function () {
    const sec = document.getElementById("breathingSection");
    if (sec) sec.style.display = "block";
    this.style.display = "none";
  });

function startBreathing() {
  if (!breathingElement) return;

  if (breathingMode === "default") {
    isInhaling = true;
    triggerBreathing();
    breathingInterval = setInterval(triggerBreathing, 6000);
  } else if (breathingMode === "box") {
    boxStep = 0;
    triggerBoxBreathing();
    breathingInterval = setInterval(triggerBoxBreathing, 4000);
  }
}

function triggerBreathing() {
  if (!breathingElement) return;

  if (breathCircle) {
    breathCircle.classList.remove("box-timing", "hold", "hold-empty");
    if (isInhaling) {
      breathCircle.classList.remove("exhale");
      breathCircle.classList.add("inhale");
    } else {
      breathCircle.classList.remove("inhale");
      breathCircle.classList.add("exhale");
    }
  }

  const textMessage = isInhaling ? "Inhale..." : "Exhale...";
  const speechText = isInhaling ? "Breathe in" : "Breathe out";

  breathingElement.textContent = textMessage;
  speakBreathingStep(speechText);

  isInhaling = !isInhaling;
}

function triggerBoxBreathing() {
  if (!breathingElement) return;

  let textMessage = "";
  let speechText = "";

  if (breathCircle) {
    breathCircle.classList.add("box-timing");
    breathCircle.classList.remove("inhale", "hold", "exhale", "hold-empty");
  }

  switch (boxStep) {
    // Inhale (4s)
    case 0:
      if (breathCircle) breathCircle.classList.add("inhale");
      textMessage = "Inhale...";
      speechText = "Inhale";
      break;
    // Hold full (4s)
    case 1:
      if (breathCircle) breathCircle.classList.add("hold");
      textMessage = "Hold...";
      speechText = "Hold";
      break;
    // Exhale (4s)
    case 2:
      if (breathCircle) breathCircle.classList.add("exhale");
      textMessage = "Exhale...";
      speechText = "Exhale";
      break;
    // Hold empty (4s)
    case 3:
      if (breathCircle) breathCircle.classList.add("hold-empty");
      textMessage = "Hold...";
      speechText = "Hold";
      break;
    default:
      break;
  }

  breathingElement.textContent = textMessage;
  speakBreathingStep(speechText);
  boxStep = (boxStep + 1) % 4;
}

function stopBreathing() {
  clearInterval(breathingInterval);
  breathingInterval = null;
  if (breathCircle) {
    breathCircle.className = "immersive-circle";
  }
  if (breathingElement) {
    breathingElement.textContent = "Paused. Press play to resume";
  }
}

// TTS section
let ttsEnabled = false;
const ttsBtn = document.getElementById("ttsToggleButton");
const breathState = document.getElementById("breath__state");

ttsBtn?.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsBtn.textContent = ttsEnabled ? "voice on" : "Toggle voice";
});

let naturalVoice = null;
const loadVoices = () => {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices() || [];
  naturalVoice =
    voices.find(
      (v) =>
        v.name.includes("Natural") ||
        v.name.includes("Google") ||
        v.name.includes("Neural"),
    ) || voices.find((v) => v.lang.startsWith("en"));
};

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

const speakBreathingStep = (text) => {
  if (!ttsEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (!naturalVoice) loadVoices();
  if (naturalVoice) utterance.voice = naturalVoice;
  utterance.rate = 0.85; // Slower, relaxed pacing
  utterance.pitch = 0.95; // Warmer, soothing tone
  window.speechSynthesis.speak(utterance);
};

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

// function createCircle() {
//   const circle = document.createElement("div");
//   circle.classList.add("circle");

//   const size = Math.random() * 200 + 20; // Circle size between 20 and 220px
//   const posX = Math.random() * (window.innerWidth - size);
//   const posY = Math.random() * (window.innerHeight - size);

//   const colors = ["#d6cafc", "#8e7bca", "#bcabef"];
//   const color = colors[Math.floor(Math.random() * colors.length)];

//   circle.style.width = `${size}px`;
//   circle.style.height = `${size}px`;
//   circle.style.left = `${posX}px`;
//   circle.style.top = `${posY}px`;
//   circle.style.backgroundColor = color;

//   document.body.appendChild(circle);

//   setTimeout(() => {
//     circle.remove();
//   }, 3000);
// }

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

const breath__button = document.getElementById("breath__button");
const breathingElement = document.getElementById("breath__state");
const breathRectangle = document.getElementById("rectangle__container");

// Start Session Button Listener
document
  .getElementById("startSessionButton")
  .addEventListener("click", function () {
    document.getElementById("breathingSection").style.display = "block";
    this.style.display = "none";
  });

breath__button.onclick = function buttonToggle() {
  isOngoing = !isOngoing;
  if (isOngoing) {
    breath__button.innerHTML = "Stop";
    startBreathing();
  } else {
    breath__button.innerHTML = "Start";
    stopBreathing();
  }
};

function startBreathing() {
  if (!breathingElement || !breathRectangle) return;
  isInhaling = true;
  triggerBreathing();
  breathingInterval = setInterval(triggerBreathing, 6000);
}

function triggerBreathing() {
  if (isInhaling) {
    breathRectangle.style.animation = "none";
    void breathRectangle.offsetHeight;
    breathRectangle.style.animation = "fadeOutBreath 6s ease-out";
    breathingElement.innerHTML = "inhale...";
    speakBreathingStep("Breathe in");
    breathRectangle.style.backgroundColor = "white";
    breathingElement.style.color = "purple";
  } else {
    breathRectangle.style.animation = "none";
    void breathRectangle.offsetHeight;
    breathRectangle.style.animation = "fadeInBreath 6s ease-in";
    breathingElement.innerHTML = "exhale...";
    speakBreathingStep("Breathe out");
    breathRectangle.style.backgroundColor = "black";
    breathingElement.style.color = "purple";
  }
  isInhaling = !isInhaling;
}

function stopBreathing() {
  clearInterval(breathingInterval);
  breathRectangle.style.animation = "none";
  // breathingElement.innerHTML = "";
}

// TTS section
let ttsEnabled = false;
const ttsBtn = document.getElementById("ttsToggleButton");
const breathState = document.getElementById("breath__state");

ttsBtn?.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsBtn.textContent = ttsEnabled ? "voice on" : "toggle voice";
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

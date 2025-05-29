
let micButton = document.getElementById("mic-button");
let outputText = document.getElementById("output-text");
let loader = document.getElementById("waveform-loader");

function toggleLoader(show) {
  loader.style.display = show ? "flex" : "none";
}

let selectedVoice = null;
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  selectedVoice = voices.find(v => v.name === "Google UK English Female") ||
                  voices.find(v => v.lang === "en-US") ||
                  voices[0];
}
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    toggleLoader(true);
    outputText.innerText = "Listening...";
  };
  recognition.onend = () => {
    toggleLoader(false);
  };
  recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    outputText.innerText = "You: " + transcript;
    getAIResponse(transcript);
  };

  micButton.addEventListener("click", () => {
    recognition.start();
  });
} else {
  outputText.innerText = "Speech recognition not supported.";
}

async function getAIResponse(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  const reply = data.reply;
  outputText.innerText += `\nNayas: ${reply}`;
  speakResponse(reply);
}

function speakResponse(text) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  let index = 0;
  function speakNext() {
    if (index < sentences.length) {
      const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
      utterance.voice = selectedVoice;
      utterance.lang = "en-US";
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.onend = () => { index++; speakNext(); };
      synth.speak(utterance);
    }
  }
  speakNext();
}

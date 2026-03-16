const WORKER_BASE = "https://YOUR-WORKER-NAME.workers.dev";

async function coachRequest(payload) {
  const res = await fetch(WORKER_BASE + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Worker request failed");
  }

  return await res.json();
}

async function classifyAnswer(payload) {
  return await coachRequest(payload);
}

async function transcribeAudio(blob) {
  const fd = new FormData();
  fd.append("audio", blob, "speech.webm");

  const res = await fetch(WORKER_BASE + "/transcribe", {
    method: "POST",
    body: fd
  });

  if (!res.ok) {
    throw new Error("Transcription failed");
  }

  return await res.json();
}

window.classifyAnswer = classifyAnswer;
window.transcribeAudio = transcribeAudio;
window.coachRequest = coachRequest;

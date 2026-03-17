const WORKER_BASE = "const WORKER_BASE = "https://shy-morning-692c.seansynge.workers.dev/";

async function coachRequest(payload) {
  const res = await fetch(WORKER_BASE + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error("Worker error: " + res.status + " " + text);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Worker returned non-JSON: " + text);
  }
}

window.coachRequest = coachRequest;";

async function coachRequest(payload) {
  const res = await fetch(WORKER_BASE + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error("Worker error: " + res.status + " " + text);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Worker returned non-JSON: " + text);
  }
}

window.coachRequest = coachRequest;

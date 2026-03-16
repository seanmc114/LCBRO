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

window.coachRequest = coachRequest;

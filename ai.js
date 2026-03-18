const WORKER_BASE = 'https://shy-morning-692c.seansynge.workers.dev';

async function coachRequest(payload) {
  try {
    const res = await fetch(WORKER_BASE + '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error('Worker error ' + res.status + ': ' + text);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Worker returned non-JSON: ' + text);
    }
  } catch (err) {
    const msg = String(err && err.message || err || 'Unknown error');
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
      throw new Error('Failed to reach the Worker. Check that worker-updated.js is deployed to ' + WORKER_BASE + ' and that the route is live.');
    }
    throw err;
  }
}

window.coachRequest = coachRequest;
window.BROTHER_WORKER_BASE = WORKER_BASE;

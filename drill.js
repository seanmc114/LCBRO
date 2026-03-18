document.addEventListener("DOMContentLoaded", () => {
  const subject = localStorage.getItem("brother_subject") || "";
  const questionType = localStorage.getItem("brother_question_type") || "general";
  const focus = localStorage.getItem("brother_fix") || localStorage.getItem("brother_biggest_leak") || "";
  const queue = JSON.parse(localStorage.getItem("brother_drill_queue") || "[]");
  let drillIndex = Number(localStorage.getItem("brother_drill_index") || "0");

  const subjectLabel = document.getElementById("subjectLabel");
  const focusLabel = document.getElementById("focusLabel");
  const drillCounter = document.getElementById("drillCounter");
  const taskTitle = document.getElementById("taskTitle");
  const taskQuestion = document.getElementById("taskQuestion");
  const mustIncludeList = document.getElementById("mustIncludeList");
  const starterBox = document.getElementById("starterBox");
  const drillInput = document.getElementById("drillInput");
  const submitBtn = document.getElementById("submitDrillBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const nextDrillBtn = document.getElementById("nextDrillBtn");
  const finishGymBtn = document.getElementById("finishGymBtn");
  const outEl = document.getElementById("drillOut");
  const gymSummary = document.getElementById("gymSummary");

  const fallbackMeta = {
    title: "Targeted repair drill",
    question: "Write a short exam-style answer.",
    must_include: ["one clear point", "one support"],
    starter: ["Point:", "Reason:"],
    leak_category: questionType || "general"
  };

  let currentMeta = queue[drillIndex] || JSON.parse(localStorage.getItem("brother_drill_meta") || "null") || fallbackMeta;

  subjectLabel.textContent = niceSubject(subject);
  focusLabel.textContent = focus || "General improvement";
  renderDrill();
  renderSummary();

  drillInput.addEventListener("paste", (e) => e.preventDefault());

  tryAgainBtn.addEventListener("click", () => {
    drillInput.value = "";
    outEl.classList.add("hidden");
    outEl.innerHTML = "";
  });

  submitBtn.addEventListener("click", async () => {
    const answer = drillInput.value.trim();
    if (!answer) return;

    outEl.classList.remove("hidden");
    outEl.innerHTML = "Thinking…";

    try {
      const result = await window.coachRequest({
        mode: "drill_coach",
        subject,
        question_type: questionType,
        focus,
        drill: currentMeta.title + " :: " + currentMeta.question,
        answer
      });

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || "Good. Let's tighten that up.")}</p>

        <div class="resultBlock"><strong>What worked</strong><br>${escapeHtml(result.good || "—")}</div>
        <div class="resultBlock"><strong>Main issue</strong><br>${escapeHtml(result.main_issue || "—")}</div>
        <div class="resultBlock"><strong>Fix</strong><br>${escapeHtml(result.fix || "—")}</div>
        <div class="resultBlock"><strong>Scaffold for retry</strong><br>${escapeHtml(result.scaffold || "—")}</div>
        <div class="resultBlock"><strong>Model</strong><br>${escapeHtml(result.model || "—")}</div>
      `;

      saveDrillAttempt(result);
      renderSummary();

      if (drillIndex < queue.length - 1) {
        nextDrillBtn.classList.remove("hidden");
      } else {
        finishGymBtn.classList.remove("hidden");
      }
    } catch (err) {
      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>Something went wrong while marking that drill.</p>
        <p class="tiny">${escapeHtml(err.message || String(err))}</p>
      `;
      console.error(err);
    }
  });

  nextDrillBtn.addEventListener("click", () => {
    drillIndex += 1;
    localStorage.setItem("brother_drill_index", String(drillIndex));
    currentMeta = queue[drillIndex] || fallbackMeta;
    drillInput.value = "";
    outEl.classList.add("hidden");
    outEl.innerHTML = "";
    nextDrillBtn.classList.add("hidden");
    renderDrill();
  });

  finishGymBtn.addEventListener("click", () => {
    gymSummary.classList.remove("hidden");
    finishGymBtn.classList.add("hidden");
    gymSummary.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderDrill() {
    taskTitle.textContent = currentMeta.title || "Targeted repair drill";
    taskQuestion.textContent = currentMeta.question || "Write a short exam-style answer.";
    drillCounter.textContent = queue.length ? `${drillIndex + 1} / ${queue.length}` : "1 / 1";
    mustIncludeList.innerHTML = (currentMeta.must_include || []).map(x => `<li>${escapeHtml(String(x))}</li>`).join("");
    starterBox.textContent = Array.isArray(currentMeta.starter) ? currentMeta.starter.join("  |  ") : "";
  }

  function saveDrillAttempt(result) {
    const attempts = JSON.parse(localStorage.getItem("lc_drill_attempts") || "[]");
    attempts.push({
      subject,
      questionType,
      title: currentMeta.title,
      question: currentMeta.question,
      good: result.good || "",
      main_issue: result.main_issue || "",
      fix: result.fix || "",
      date: new Date().toLocaleDateString("en-IE")
    });
    localStorage.setItem("lc_drill_attempts", JSON.stringify(attempts));

    const leaks = JSON.parse(localStorage.getItem("lc_leaks") || "{}");
    if (!Array.isArray(leaks[subject])) leaks[subject] = [];
    leaks[subject].push({
      date: new Date().toLocaleDateString("en-IE"),
      category: currentMeta.leak_category || questionType || "general",
      detail: result.main_issue || result.fix || focus || "Drill weakness",
      source: "gym"
    });
    localStorage.setItem("lc_leaks", JSON.stringify(leaks));
  }

  function renderSummary() {
    const attempts = JSON.parse(localStorage.getItem("lc_drill_attempts") || "[]").filter(x => x.subject === subject).slice(-5).reverse();
    if (!attempts.length) {
      gymSummary.innerHTML = `<h3 style="margin-top:0;">Gym summary</h3><div class="tiny">No stored drill attempts yet.</div>`;
      return;
    }
    gymSummary.innerHTML = `
      <h3 style="margin-top:0;">Gym summary</h3>
      <div class="tiny">Recent drill attempts in this subject.</div>
      ${attempts.map(a => `<div class="historyRow"><strong>${escapeHtml(a.title || "Drill")}</strong><span>${escapeHtml(a.date)} · ${escapeHtml(a.main_issue || a.fix || "Tighten the structure")}</span></div>`).join("")}
    `;
  }

  function niceSubject(s) {
    const map = {
      english_hl: "English HL",
      irish_hl: "Irish HL",
      maths_ol: "Maths OL",
      pe_hl: "PE HL",
      biology_hl: "Biology HL",
      homeec_hl: "Home Ec HL",
      spanish_ol: "Spanish OL"
    };
    return map[s] || s || "—";
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});

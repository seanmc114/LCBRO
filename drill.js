document.addEventListener("DOMContentLoaded", () => {
  const profile = window.loadBrotherProfile ? window.loadBrotherProfile() : {};
  const subject = localStorage.getItem("brother_subject") || "";
  const questionType = localStorage.getItem("brother_question_type") || "general";
  const focus = localStorage.getItem("brother_fix") || localStorage.getItem("brother_biggest_leak") || "";
  const courseContext = localStorage.getItem("brother_course_context") || "";
  const queue = JSON.parse(localStorage.getItem("brother_drill_queue") || "[]");
  let idx = Number(localStorage.getItem("brother_drill_index") || "0");
  let gymResults = JSON.parse(localStorage.getItem("brother_gym_results") || "[]");

  const subjectLabel = document.getElementById("subjectLabel");
  const focusLabel = document.getElementById("focusLabel");
  const counter = document.getElementById("drillCounter");
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

  subjectLabel.textContent = niceSubject(subject);
  focusLabel.textContent = focus || "General improvement";

  if (!queue.length) {
    outEl.classList.remove("hidden");
    outEl.innerHTML = `<h2 style="margin-top:0;">THE BROTHER</h2><p>No drill queue is loaded yet. Go back to Results Coach first.</p>`;
    return;
  }

  renderDrill();

  drillInput.addEventListener("paste", (e) => e.preventDefault());
  tryAgainBtn.addEventListener("click", () => { drillInput.value = ""; outEl.classList.add("hidden"); outEl.innerHTML = ""; });
  nextDrillBtn.addEventListener("click", () => { idx += 1; localStorage.setItem("brother_drill_index", String(idx)); drillInput.value = ""; outEl.classList.add("hidden"); nextDrillBtn.classList.add("hidden"); finishGymBtn.classList.add("hidden"); renderDrill(); });
  finishGymBtn.addEventListener("click", finishGym);

  submitBtn.addEventListener("click", async () => {
    const answer = drillInput.value.trim();
    if (!answer) return;
    const meta = queue[idx];
    outEl.classList.remove("hidden");
    outEl.innerHTML = "Thinking…";
    try {
      const result = await window.coachRequest({
        mode: "drill_coach",
        learner_name: profile.name || "",
        subject,
        question_type: questionType,
        focus,
        answer,
        course_context: courseContext,
        drill_meta: meta
      });

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || "Let's tighten the next rep.")}</p>
        <div class="scoreBadge">${escapeHtml(result.score || "—")}</div>
        <div class="resultBlock"><strong>What worked</strong><br>${escapeHtml(result.good || "—")}</div>
        <div class="resultBlock"><strong>Main leak</strong><br>${escapeHtml(result.main_issue || "—")}</div>
        <div class="resultBlock"><strong>Fix next</strong><br>${escapeHtml(result.fix || "—")}</div>
        <div class="resultBlock"><strong>Scaffold</strong><br>${escapeHtml(result.scaffold || "—")}</div>
        <div class="resultBlock"><strong>What good looks like</strong><br>${escapeHtml(result.model || "—")}</div>
      `;

      gymResults.push({subject, score: result.score || "", task: meta.title || "", main_issue: result.main_issue || ""});
      localStorage.setItem("brother_gym_results", JSON.stringify(gymResults));
      savePracticeProgress(parseScoreOutOf10(result.score), subject);

      if (idx < queue.length - 1) nextDrillBtn.classList.remove("hidden");
      else finishGymBtn.classList.remove("hidden");
    } catch (err) {
      outEl.innerHTML = `<h2 style="margin-top:0;">THE BROTHER</h2><p>Something went wrong while marking that drill.</p><p class="tiny">${escapeHtml(err.message || String(err))}</p>`;
    }
  });

  function renderDrill(){
    const meta = queue[idx];
    if (!meta) return finishGym();
    counter.textContent = `${idx + 1} / ${queue.length}`;
    taskTitle.textContent = meta.title || "Targeted repair drill";
    taskQuestion.textContent = meta.question || "Write a short exam-style answer.";
    mustIncludeList.innerHTML = (meta.must_include || []).map(x => `<li>${escapeHtml(String(x))}</li>`).join("");
    starterBox.textContent = Array.isArray(meta.starter) ? meta.starter.join("  |  ") : (meta.starter || "");
  }

  function finishGym(){
    gymSummary.classList.remove("hidden");
    gymSummary.innerHTML = `
      <h3 style="margin-top:0;">Gym complete</h3>
      <div class="tiny">You have finished ${queue.length} targeted drills for ${escapeHtml(niceSubject(subject))}.</div>
      <div style="margin-top:10px;"><button class="goldBtn" type="button" onclick="location.href='results.html'">Back to Results Coach</button></div>
    `;
    nextDrillBtn.classList.add("hidden");
    finishGymBtn.classList.add("hidden");
  }

  function parseScoreOutOf10(score){
    const m = String(score || "").match(/(\d+)\s*\/\s*10/);
    return m ? Number(m[1]) * 10 : null;
  }

  function savePracticeProgress(percent, subject){
    if (percent === null || !subject) return;
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    let history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    if (!history[subject]) history[subject] = [];
    history[subject].push({ score: percent, date: dateLabel, source: "practice" });
    localStorage.setItem("lc_progress", JSON.stringify(history));
  }

  function niceSubject(s) {
    return ({english_hl:"English HL",irish_hl:"Irish HL",maths_ol:"Maths OL",pe_hl:"P.E. HL",biology_hl:"Biology HL",homeec_hl:"Home Ec HL",spanish_ol:"Spanish OL"})[s] || s || "—";
  }

  function escapeHtml(s) {
    return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }
});

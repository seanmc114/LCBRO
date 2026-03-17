document.addEventListener("DOMContentLoaded", () => {
  const subject = localStorage.getItem("brother_subject") || "";
  const questionType = localStorage.getItem("brother_question_type") || "general";
  const focus = localStorage.getItem("brother_fix") || localStorage.getItem("brother_biggest_leak") || "";
  const drillMeta = JSON.parse(localStorage.getItem("brother_drill_meta") || "null");

  const subjectLabel = document.getElementById("subjectLabel");
  const focusLabel = document.getElementById("focusLabel");
  const taskTitle = document.getElementById("taskTitle");
  const taskQuestion = document.getElementById("taskQuestion");
  const mustIncludeList = document.getElementById("mustIncludeList");
  const starterBox = document.getElementById("starterBox");
  const drillInput = document.getElementById("drillInput");
  const submitBtn = document.getElementById("submitDrillBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const outEl = document.getElementById("drillOut");

  subjectLabel.textContent = niceSubject(subject);
  focusLabel.textContent = focus || "General improvement";

  const meta = drillMeta || {
    title: "Targeted repair drill",
    question: "Write a short exam-style answer.",
    must_include: ["one clear point", "one support"],
    starter: ["Point:", "Reason:"]
  };

  taskTitle.textContent = meta.title || "Targeted repair drill";
  taskQuestion.textContent = meta.question || "Write a short exam-style answer.";
  mustIncludeList.innerHTML = (meta.must_include || [])
    .map(x => `<li>${escapeHtml(String(x))}</li>`)
    .join("");
  starterBox.textContent = Array.isArray(meta.starter) ? meta.starter.join("  |  ") : "";

  drillInput.addEventListener("paste", (e) => {
    e.preventDefault();
  });

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
        drill: meta.title + " :: " + meta.question,
        answer
      });

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || "Good. Let's tighten that up.")}</p>

        <div class="resultBlock">
          <strong>What worked</strong><br>
          ${escapeHtml(result.good || "—")}
        </div>

        <div class="resultBlock">
          <strong>Main issue</strong><br>
          ${escapeHtml(result.main_issue || "—")}
        </div>

        <div class="resultBlock">
          <strong>Fix</strong><br>
          ${escapeHtml(result.fix || "—")}
        </div>

        <div class="resultBlock">
          <strong>Scaffold for retry</strong><br>
          ${escapeHtml(result.scaffold || "—")}
        </div>

        <div class="resultBlock">
          <strong>Model</strong><br>
          ${escapeHtml(result.model || "—")}
        </div>
      `;
    } catch (err) {
      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>Something went wrong while marking that drill.</p>
        <p class="tiny">${escapeHtml(err.message || String(err))}</p>
      `;
      console.error(err);
    }
  });

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

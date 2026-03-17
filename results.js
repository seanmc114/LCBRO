document.addEventListener("DOMContentLoaded", () => {
  const subjectBtns = document.querySelectorAll(".subjectBtn");
  const questionTypeSelect = document.getElementById("questionTypeSelect");
  const questionTypeHelp = document.getElementById("questionTypeHelp");
  const exampleBox = document.getElementById("exampleBox");
  const useExampleBtn = document.getElementById("useExampleBtn");
  const clearBtn = document.getElementById("clearBtn");
  const inputEl = document.getElementById("resultsInput");
  const analyseBtn = document.getElementById("analyseBtn");
  const outEl = document.getElementById("resultsOut");
  const chartCanvas = document.getElementById("progressChart");
  const toggleCaoBtn = document.getElementById("toggleCaoBtn");
  const caoPanel = document.getElementById("caoPanel");
  const caoTotal = document.getElementById("caoTotal");
  const caoNote = document.getElementById("caoNote");
  const caoBreakdown = document.getElementById("caoBreakdown");

  let currentSubject = null;
  let chart = null;
  let showCao = false;

  const subjectColours = {
    english_hl: "#7C3AED",
    irish_hl: "#16A34A",
    maths_ol: "#2563EB",
    pe_hl: "#F97316",
    biology_hl: "#0EA5E9",
    homeec_hl: "#EC4899",
    spanish_ol: "#FACC15"
  };

  const subjectLabels = {
    english_hl: "English HL",
    irish_hl: "Irish HL",
    maths_ol: "Maths OL",
    pe_hl: "PE HL",
    biology_hl: "Biology HL",
    homeec_hl: "Home Ec HL",
    spanish_ol: "Spanish OL"
  };

  const QUESTION_TYPES = {
    english_hl: [
      { value: "general", label: "General" },
      { value: "macbeth", label: "Macbeth" },
      { value: "comparative", label: "Comparative" },
      { value: "poetry", label: "Poetry" },
      { value: "comprehension", label: "Comprehension" },
      { value: "composition", label: "Composition" }
    ],
    irish_hl: [
      { value: "general", label: "General" },
      { value: "oral", label: "Oral" },
      { value: "ceapadoireacht", label: "Ceapadóireacht" },
      { value: "leamhthuiscint", label: "Léamhthuiscint" },
      { value: "cluastuiscint", label: "Cluastuiscint" },
      { value: "pros", label: "Prós" },
      { value: "filiocht", label: "Filíocht" }
    ],
    maths_ol: [
      { value: "general", label: "General" },
      { value: "algebra", label: "Algebra" },
      { value: "financial_maths", label: "Financial Maths" },
      { value: "geometry", label: "Geometry" },
      { value: "trigonometry", label: "Trigonometry" },
      { value: "statistics", label: "Statistics / Probability" }
    ],
    pe_hl: [
      { value: "general", label: "General" },
      { value: "short_questions", label: "Short Questions" },
      { value: "physiology", label: "Physiology" },
      { value: "skill_acquisition", label: "Skill Acquisition" },
      { value: "sociology", label: "Sociology of Sport" },
      { value: "project", label: "Project" }
    ],
    biology_hl: [
      { value: "general", label: "General" },
      { value: "definitions", label: "Definitions / Keywords" },
      { value: "respiration", label: "Respiration" },
      { value: "genetics", label: "Genetics" },
      { value: "ecology", label: "Ecology" },
      { value: "experiments", label: "Mandatory Experiments" }
    ],
    homeec_hl: [
      { value: "general", label: "General" },
      { value: "short_answers", label: "Short Answers" },
      { value: "core", label: "Core Long Answer" },
      { value: "elective_nutrition", label: "Elective: Nutrition" },
      { value: "elective_resource", label: "Elective: Resource Management" },
      { value: "elective_social", label: "Elective: Social Studies" }
    ],
    spanish_ol: [
      { value: "general", label: "General" },
      { value: "oral", label: "Oral" },
      { value: "aural", label: "Aural" },
      { value: "reading", label: "Reading" },
      { value: "written_email", label: "Written: Email / Message" },
      { value: "written_opinion", label: "Written: Opinion Paragraph" },
      { value: "written_accuracy", label: "Written: Accuracy / Grammar" }
    ]
  };

  const EXAMPLES = {
    english_hl: `English HL
Paper 1
Comprehension 15/20
Composition 42/60

Paper 2
Macbeth 38/60
Comparative 45/70
Poetry 42/50`,

    irish_hl: `Irish HL
Ceapadóireacht 32/50
Léamhthuiscint 18/25
Cluastuiscint 42/60
Prós 28/50
Filíocht 26/35`,

    maths_ol: `Maths OL
Paper 1
Algebra 22/50
Financial Maths 28/50
Number 35/50

Paper 2
Geometry 30/50
Trigonometry 24/50
Statistics 26/50`,

    pe_hl: `PE HL
Short Questions 62/80
Physiology 18/30
Skill Acquisition 20/30
Sociology 14/30
Project 72/80`,

    biology_hl: `Biology HL
Definitions 12/20
Respiration 16/30
Genetics 14/30
Ecology 22/30`,

    homeec_hl: `Home Ec HL
Short Answers 24/40
Core Long Answer 34/60
Elective Nutrition 18/30`,

    spanish_ol: `Spanish OL
Oral 62/80
Aural 40/60
Reading 48/60
Written Email 14/20
Written Opinion 8/20
Written Accuracy 12/20`
  };

  subjectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subjectBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      exampleBox.textContent = EXAMPLES[currentSubject] || "";
      buildQuestionTypeOptions(currentSubject);
    });
  });

  useExampleBtn.addEventListener("click", () => {
    if (currentSubject) inputEl.value = EXAMPLES[currentSubject];
  });

  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    outEl.classList.add("hidden");
    outEl.innerHTML = "";
  });

  toggleCaoBtn.addEventListener("click", () => {
    showCao = !showCao;
    caoPanel.classList.toggle("hidden", !showCao);
    toggleCaoBtn.textContent = showCao ? "Hide CAO Projection" : "Show CAO Projection";
    if (showCao) drawCaoProjection();
  });

  analyseBtn.addEventListener("click", async () => {
    if (!currentSubject) {
      alert("Choose a subject first.");
      return;
    }

    const raw = inputEl.value.trim();
    if (!raw) {
      alert("Paste some results first.");
      return;
    }

    const questionType = questionTypeSelect.value || "general";

    outEl.classList.remove("hidden");
    outEl.innerHTML = "Thinking…";

    try {
      const result = await window.coachRequest({
        mode: "results_coach",
        subject: currentSubject,
        question_type: questionType,
        raw_results: raw
      });

      const drills = Array.isArray(result.drills) ? result.drills : [];
      const drillMeta = result.drill_meta || null;
      const improvementLine = buildImprovementLine(currentSubject, raw);

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>

        <p>${escapeHtml(result.message || "Hi Tom. All good?")}</p>

        ${improvementLine ? `
          <div class="improvementBanner">${escapeHtml(improvementLine)}</div>
        ` : ""}

        <div class="resultBlock">
          <strong>Biggest points leak</strong><br>
          ${escapeHtml(result.biggest_leak || "—")}
        </div>

        <div class="resultBlock">
          <strong>Why it matters</strong><br>
          ${escapeHtml(result.why_it_matters || "—")}
        </div>

        <div class="resultBlock">
          <strong>Fix first</strong><br>
          ${escapeHtml(result.fix_first || "—")}
        </div>

        <div class="resultBlock">
          <strong>Tonight's drills</strong>
          <ul>
            ${drills.map(d => `<li>${escapeHtml(String(d))}</li>`).join("")}
          </ul>
        </div>

        ${drillMeta ? `
          <div class="resultBlock">
            <strong>First drill task</strong><br>
            ${escapeHtml(drillMeta.title)}<br><br>
            ${escapeHtml(drillMeta.question)}
          </div>
        ` : ""}

        ${result.next_data_request ? `
          <div class="resultBlock">
            <strong>Next thing I need from you</strong><br>
            ${escapeHtml(result.next_data_request)}
          </div>
        ` : ""}

        <div class="controls" style="margin-top:16px;">
          <button id="startDrillBtn" class="goldBtn" type="button">Start Drill</button>
        </div>
      `;

      localStorage.setItem("brother_subject", currentSubject);
      localStorage.setItem("brother_question_type", questionType);
      localStorage.setItem("brother_fix", result.fix_first || "");
      localStorage.setItem("brother_biggest_leak", result.biggest_leak || "");
      localStorage.setItem("brother_drills", JSON.stringify(drills));
      localStorage.setItem("brother_drill_meta", JSON.stringify(drillMeta || null));

      const startBtn = document.getElementById("startDrillBtn");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          window.location.href = "drill.html";
        });
      }

      saveProgress(raw);
      drawGraph();
      if (showCao) drawCaoProjection();
    } catch (err) {
      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>Something went wrong while analysing those results.</p>
        <p class="tiny">${escapeHtml(err.message || String(err))}</p>
      `;
      console.error(err);
    }
  });

  function buildQuestionTypeOptions(subject) {
    const list = QUESTION_TYPES[subject] || [{ value: "general", label: "General" }];
    questionTypeSelect.innerHTML = list
      .map(item => `<option value="${item.value}">${item.label}</option>`)
      .join("");

    questionTypeHelp.textContent =
      subject === "spanish_ol"
        ? "Spanish gets much better if you choose the weak question type: oral, aural, reading, email, opinion, or accuracy."
        : "Pick the weak question family if you know it. Otherwise leave it on General.";
  }

  function saveProgress(text) {
    const percent = extractScore(text);
    if (percent === null || !currentSubject) return;

    const now = new Date();
    const dateLabel =
      String(now.getDate()).padStart(2, "0") + "/" +
      String(now.getMonth() + 1).padStart(2, "0");

    let history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    if (!history[currentSubject]) history[currentSubject] = [];

    history[currentSubject].push({
      score: percent,
      date: dateLabel
    });

    localStorage.setItem("lc_progress", JSON.stringify(history));
  }

  function extractScore(text) {
    const matches = text.match(/\d+\/\d+/g);
    if (!matches) return null;

    let total = 0;
    let max = 0;

    matches.forEach(m => {
      const [a, b] = m.split("/");
      total += Number(a);
      max += Number(b);
    });

    if (!max) return null;
    return Math.round((total / max) * 100);
  }

  function buildImprovementLine(subject, raw) {
    const percent = extractScore(raw);
    if (percent === null) return "";

    const history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    const prev = Array.isArray(history[subject]) && history[subject].length
      ? history[subject][history[subject].length - 1]
      : null;

    if (!prev) return "";

    if (percent > prev.score) {
      return `${subjectLabels[subject]} improved ${prev.score}% → ${percent}%`;
    }
    return "";
  }

  function drawGraph() {
    if (!chartCanvas || typeof Chart === "undefined") return;

    const data = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    const datasets = [];
    const labels = [];

    Object.keys(data).forEach(sub => {
      const entries = data[sub];
      if (!Array.isArray(entries) || !entries.length) return;

      entries.forEach(e => {
        if (!labels.includes(e.date)) labels.push(e.date);
      });

      datasets.push({
        label: subjectLabels[sub] || sub,
        data: entries.map(e => ({ x: e.date, y: e.score })),
        borderColor: subjectColours[sub],
        backgroundColor: subjectColours[sub],
        tension: 0.3
      });
    });

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });
  }

  function drawCaoProjection() {
    const history = JSON.parse(localStorage.getItem("lc_progress") || "{}");

    const latest = {};
    Object.keys(history).forEach(sub => {
      const arr = history[sub];
      if (Array.isArray(arr) && arr.length) latest[sub] = arr[arr.length - 1].score;
    });

    const entries = Object.keys(latest).map(sub => {
      const pct = latest[sub];
      const points = convertPercentToPoints(sub, pct);
      return { sub, pct, points };
    });

    const bestSix = entries
      .sort((a, b) => b.points - a.points)
      .slice(0, 6);

    const total = bestSix.reduce((sum, x) => sum + x.points, 0);

    caoTotal.textContent = total ? `${total} pts` : "—";
    caoNote.textContent = "Uses latest stored percentage for each subject on this device. Approximate only.";

    caoBreakdown.innerHTML = bestSix.length
      ? bestSix.map(x => `
          <div style="margin-top:8px;">
            <strong>${subjectLabels[x.sub] || x.sub}</strong> — ${x.pct}% ≈ ${x.points} pts
          </div>
        `).join("")
      : `<div class="tiny">No stored results yet.</div>`;
  }

  function convertPercentToPoints(subject, pct) {
    const isHL = !subject.includes("_ol");

    if (isHL) {
      if (pct >= 90) return 100;
      if (pct >= 80) return 88;
      if (pct >= 70) return 77;
      if (pct >= 60) return 66;
      if (pct >= 50) return 56;
      if (pct >= 40) return 46;
      if (pct >= 30) return 37;
      return 0;
    }

    if (pct >= 90) return 56;
    if (pct >= 80) return 46;
    if (pct >= 70) return 37;
    if (pct >= 60) return 28;
    if (pct >= 50) return 20;
    if (pct >= 40) return 12;
    return 0;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  drawGraph();
  if (showCao) drawCaoProjection();
});

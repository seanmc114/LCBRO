document.addEventListener("DOMContentLoaded", () => {
  const profile = window.loadBrotherProfile ? window.loadBrotherProfile() : {};
  const subjectBtns = document.querySelectorAll(".subjectBtn");
  const questionTypeSelect = document.getElementById("questionTypeSelect");
  const questionTypeHelp = document.getElementById("questionTypeHelp");
  const exampleBox = document.getElementById("exampleBox");
  const savedCourseContext = document.getElementById("savedCourseContext");
  const useExampleBtn = document.getElementById("useExampleBtn");
  const clearBtn = document.getElementById("clearBtn");
  const inputEl = document.getElementById("resultsInput");
  const analyseBtn = document.getElementById("analyseBtn");
  const outEl = document.getElementById("resultsOut");
  const chartCanvas = document.getElementById("progressChart");
  const toggleCaoBtn = document.getElementById("toggleCaoBtn");
  const caoPanel = document.getElementById("caoPanel");
  const caoTotal = document.getElementById("caoTotal");
  const caoBreakdown = document.getElementById("caoBreakdown");
  const resultsIntro = document.getElementById("resultsIntro");

  let currentSubject = null;
  let chart = null;
  let showCao = false;

  if (profile.name) {
    resultsIntro.textContent = `${profile.name}, choose a subject, paste the results, and I'll identify the biggest points leak first.`;
  }

  const subjectLabels = {
    english_hl: "English HL",
    irish_hl: "Irish HL",
    maths_ol: "Maths OL",
    pe_hl: "P.E. HL",
    biology_hl: "Biology HL",
    homeec_hl: "Home Ec HL",
    spanish_ol: "Spanish OL"
  };

  const QUESTION_TYPES = {
    english_hl: [["general","General"],["single_text","Single Text"],["comparative","Comparative"],["poetry","Poetry"],["comprehension","Comprehension"],["composition","Composition"]],
    irish_hl: [["general","General"],["ceapadoireacht","Ceapadóireacht"],["leamhthuiscint","Léamhthuiscint"],["cluastuiscint","Cluastuiscint"],["pros","Prós"],["filiocht","Filíocht"],["gramadach","Gramadach"]],
    maths_ol: [["general","General"],["algebra","Algebra"],["financial_maths","Financial Maths"],["geometry","Geometry"],["trigonometry","Trigonometry"],["statistics","Statistics / Probability"]],
    pe_hl: [["general","General"],["short_questions","Short Questions"],["physiology","Physiology"],["skill_acquisition","Skill Acquisition"],["project","Project"]],
    biology_hl: [["general","General"],["definitions","Definitions / Keywords"],["experiments","Mandatory Experiments"],["genetics","Genetics"],["ecology","Ecology"],["respiration","Respiration"]],
    homeec_hl: [["general","General"],["short_answers","Short Answers"],["nutrition","Nutrition"],["resource","Resource Management"],["social","Social Studies"]],
    spanish_ol: [["general","General"],["oral","Oral"],["aural","Aural"],["reading","Reading"],["written_email","Written: Email / Message"],["written_opinion","Written: Opinion Paragraph"],["written_accuracy","Written: Accuracy / Grammar"]]
  };

  const EXAMPLES = {
    english_hl: `Paper 1\nComprehension 15/20\nComposition 42/60\n\nPaper 2\nSingle Text 38/60\nComparative 45/70\nPoetry 42/50`,
    irish_hl: `Ceapadóireacht 32/50\nLéamhthuiscint 18/25\nCluastuiscint 42/60\nPrós 28/50\nFilíocht 26/35`,
    maths_ol: `Paper 1\nAlgebra 22/50\nFinancial Maths 28/50\nNumber 35/50\n\nPaper 2\nGeometry 30/50\nTrigonometry 24/50\nStatistics 26/50`,
    pe_hl: `Short Questions 62/80\nPhysiology 18/30\nSkill Acquisition 20/30\nProject 72/80`,
    biology_hl: `Definitions 12/20\nRespiration 16/30\nGenetics 14/30\nEcology 22/30`,
    homeec_hl: `Short Answers 24/40\nNutrition 18/30\nCore Long Answer 34/60`,
    spanish_ol: `Oral 62/80\nAural 40/60\nReading 48/60\nWritten Email 14/20\nWritten Opinion 8/20\nWritten Accuracy 12/20`
  };

  function getSavedCourseContext(subject){
    if (subject === "english_hl") {
      const english = profile.english || {};
      const parts = [];
      if (english.singleText) parts.push(`Single Text: ${english.singleText}`);
      (english.comparativeTexts || []).forEach((t, i) => parts.push(`Comparative ${i + 1}: ${t}`));
      if ((english.poets || []).length) parts.push(`Poets: ${(english.poets || []).join(", ")}`);
      if (english.focus) parts.push(`Focus: ${english.focus}`);
      return parts.join(" · ");
    }
    if (subject === "irish_hl") {
      const irish = profile.irish || {};
      const parts = [];
      if (irish.pros) parts.push(`Prós: ${irish.pros}`);
      if (irish.drama) parts.push(`Dráma: ${irish.drama}`);
      if (irish.filiocht) parts.push(`Filíocht: ${irish.filiocht}`);
      if (irish.focus) parts.push(`Focus: ${irish.focus}`);
      return parts.join(" · ");
    }
    return "";
  }

  function updateSavedContext(subject){
    const txt = getSavedCourseContext(subject);
    savedCourseContext.textContent = txt || "No saved course content for this subject.";
  }

  function buildQuestionTypeOptions(subject) {
    const list = QUESTION_TYPES[subject] || [["general", "General"]];
    questionTypeSelect.innerHTML = list.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    questionTypeHelp.textContent = "Optional. Use this if you already know the weak area. The coach still reads the marks first.";
  }

  subjectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subjectBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      exampleBox.textContent = EXAMPLES[currentSubject] || "";
      buildQuestionTypeOptions(currentSubject);
      updateSavedContext(currentSubject);
    });
  });

  const available = Array.isArray(profile.subjects) && profile.subjects.length ? profile.subjects : [];
  if (available.length) {
    subjectBtns.forEach(btn => {
      if (!available.includes(btn.dataset.subject)) btn.classList.add("mutedChoice");
    });
  }

  buildQuestionTypeOptions("english_hl");
  updateSavedContext("english_hl");

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
        learner_name: profile.name || "",
        subject: currentSubject,
        question_type: questionType,
        raw_results: raw,
        course_context: getSavedCourseContext(currentSubject)
      });

      const drills = Array.isArray(result.drills) ? result.drills : [];
      const drillQueue = Array.isArray(result.drill_queue) ? result.drill_queue : [];

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || "Let's find the biggest leak first.")}</p>
        <div class="resultBlock"><strong>Biggest points leak</strong><br>${escapeHtml(result.biggest_leak || "—")}</div>
        <div class="resultBlock"><strong>Why it matters</strong><br>${escapeHtml(result.why_it_matters || "—")}</div>
        <div class="resultBlock"><strong>Fix first</strong><br>${escapeHtml(result.fix_first || "—")}</div>
        <div class="resultBlock"><strong>Tonight's drills</strong><ul>${drills.map(d => `<li>${escapeHtml(String(d))}</li>`).join("")}</ul></div>
        <div class="controls" style="margin-top:16px;"><button id="startDrillBtn" class="goldBtn" type="button">Start Gym</button></div>
      `;

      localStorage.setItem("brother_subject", currentSubject);
      localStorage.setItem("brother_question_type", questionType);
      localStorage.setItem("brother_fix", result.fix_first || "");
      localStorage.setItem("brother_biggest_leak", result.biggest_leak || "");
      localStorage.setItem("brother_drill_queue", JSON.stringify(drillQueue));
      localStorage.setItem("brother_drill_index", "0");
      localStorage.setItem("brother_course_context", getSavedCourseContext(currentSubject));

      document.getElementById("startDrillBtn")?.addEventListener("click", () => { window.location.href = "drill.html"; });
      saveExamProgress(raw);
      drawGraph();
      if (showCao) drawCaoProjection();
    } catch (err) {
      outEl.innerHTML = `<h2 style="margin-top:0;">THE BROTHER</h2><p>Something went wrong while analysing those results.</p><p class="tiny">${escapeHtml(err.message || String(err))}</p>`;
    }
  });

  function saveExamProgress(text) {
    const percent = extractScore(text);
    if (percent === null || !currentSubject) return;
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    let history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    if (!history[currentSubject]) history[currentSubject] = [];
    history[currentSubject].push({ score: percent, date: dateLabel, source: "exam" });
    localStorage.setItem("lc_progress", JSON.stringify(history));
  }

  function extractScore(text) {
    const matches = text.match(/\d+\/\d+/g);
    if (!matches) return null;
    let total = 0, max = 0;
    matches.forEach(m => { const [a,b] = m.split("/").map(Number); total += a; max += b; });
    return max ? Math.round((total/max)*100) : null;
  }

  function gradeFromPercent(subject, percent){
    if (subject.endsWith("_hl")) {
      if (percent >= 90) return ["H1",100];
      if (percent >= 80) return ["H2",88];
      if (percent >= 70) return ["H3",77];
      if (percent >= 60) return ["H4",66];
      if (percent >= 50) return ["H5",56];
      if (percent >= 40) return ["H6",46];
      if (percent >= 30) return ["H7",37];
      return ["H8",0];
    }
    if (percent >= 90) return ["O1",56];
    if (percent >= 80) return ["O2",46];
    if (percent >= 70) return ["O3",37];
    if (percent >= 60) return ["O4",28];
    if (percent >= 50) return ["O5",20];
    if (percent >= 40) return ["O6",12];
    return ["O7/O8",0];
  }

  function drawCaoProjection(){
    const history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    const breakdown = [];
    let total = 0;
    Object.entries(history).forEach(([subject, entries]) => {
      if (!Array.isArray(entries) || !entries.length) return;
      const latest = entries[entries.length - 1].score;
      const [grade, points] = gradeFromPercent(subject, latest);
      total += points;
      breakdown.push(`<div>${escapeHtml(subjectLabels[subject] || subject)}: ${latest}% → ${grade} → ${points} pts</div>`);
    });
    caoTotal.textContent = total ? `${total} points` : "—";
    caoBreakdown.innerHTML = breakdown.join("") || "<div class='tiny'>No stored subjects yet.</div>";
  }

  function drawGraph(){
    const history = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    const datasets = Object.entries(history).map(([subject, entries], i) => ({
      label: subjectLabels[subject] || subject,
      data: entries.map((x, idx) => ({x: idx+1, y: x.score})),
      borderColor: ["#7C3AED","#16A34A","#2563EB","#F97316","#0EA5E9","#EC4899","#D97706"][i % 7],
      tension: 0.15
    }));
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: "line",
      data: { datasets },
      options: {
        parsing: false,
        plugins: { legend: { labels: { color: "#213547" } } },
        scales: {
          x: { title: { display: true, text: "Attempt" }, ticks: { color: "#213547" } },
          y: { min: 0, max: 100, title: { display: true, text: "%" }, ticks: { color: "#213547" } }
        }
      }
    });
  }

  drawGraph();
});

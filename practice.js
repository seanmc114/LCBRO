document.addEventListener("DOMContentLoaded", () => {
  const subjectBtns = document.querySelectorAll(".subjectBtn");
  const practiceTypeSelect = document.getElementById("practiceTypeSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const generateBtn = document.getElementById("generateBtn");
  const newVariantBtn = document.getElementById("newVariantBtn");
  const practiceCard = document.getElementById("practiceCard");
  const answerCard = document.getElementById("answerCard");
  const answerEl = document.getElementById("practiceAnswer");
  const markBtn = document.getElementById("markBtn");
  const clearAnswerBtn = document.getElementById("clearAnswerBtn");
  const feedbackCard = document.getElementById("feedbackCard");
  const historyEl = document.getElementById("practiceHistory");

  let currentSubject = "english_hl";
  let currentQuestion = null;

  const subjectLabels = {
    english_hl: "English HL",
    irish_hl: "Irish HL",
    maths_ol: "Maths OL",
    pe_hl: "PE HL",
    biology_hl: "Biology HL",
    homeec_hl: "Home Ec HL",
    spanish_ol: "Spanish OL"
  };

  const PRACTICE_TYPES = {
    english_hl: [
      ["quotes", "Quotes / evidence recall"],
      ["single_paragraph", "Short paragraph"],
      ["terms", "Literary terms / key ideas"],
      ["comparison_link", "Comparative link sentence"]
    ],
    irish_hl: [
      ["keywords", "Keywords / key terms"],
      ["short_response", "Short structured response"],
      ["grammar", "Grammar / mechanics"],
      ["text_reference", "Text reference / quote support"]
    ],
    maths_ol: [
      ["algebra", "Algebra"],
      ["formulae", "Formulae"],
      ["financial_maths", "Financial maths"],
      ["short_method", "Short method question"]
    ],
    pe_hl: [
      ["definitions", "Definitions / key terms"],
      ["physiology", "Physiology application"],
      ["short_response", "Short structured response"],
      ["project_language", "Project wording / terminology"]
    ],
    biology_hl: [
      ["definitions", "Definitions"],
      ["keywords", "Keywords / label knowledge"],
      ["experiments", "Experiments / method"],
      ["short_explain", "Short explain question"]
    ],
    homeec_hl: [
      ["definitions", "Definitions / keywords"],
      ["short_answers", "Short answers"],
      ["nutrition", "Nutrition mechanics"],
      ["application", "Application sentence"]
    ],
    spanish_ol: [
      ["grammar", "Grammar / tense accuracy"],
      ["vocabulary", "Vocabulary / phrases"],
      ["written_accuracy", "Written accuracy"],
      ["oral_mini", "Short oral-style response"]
    ]
  };

  function buildPracticeOptions(subject) {
    const list = PRACTICE_TYPES[subject] || [["general", "General mechanics"]];
    practiceTypeSelect.innerHTML = list.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  }

  buildPracticeOptions(currentSubject);
  const initialBtn = document.querySelector(`[data-subject="${currentSubject}"]`);
  if (initialBtn) initialBtn.classList.add("active");
  renderHistory();

  subjectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subjectBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      buildPracticeOptions(currentSubject);
      resetQuestionView();
    });
  });

  generateBtn.addEventListener("click", async () => {
    await generateQuestion(false);
  });

  newVariantBtn.addEventListener("click", async () => {
    await generateQuestion(true);
  });

  clearAnswerBtn.addEventListener("click", () => {
    answerEl.value = "";
  });

  markBtn.addEventListener("click", async () => {
    const answer = answerEl.value.trim();
    if (!currentQuestion) {
      alert("Generate a question first.");
      return;
    }
    if (!answer) {
      alert("Write an answer first.");
      return;
    }

    feedbackCard.classList.remove("hidden");
    feedbackCard.innerHTML = "Thinking…";

    try {
      const result = await window.coachRequest({
        mode: "practice_mark",
        subject: currentSubject,
        practice_type: currentQuestion.practice_type,
        difficulty: currentQuestion.difficulty,
        question_title: currentQuestion.title,
        question_text: currentQuestion.question,
        mark_scheme: currentQuestion.mark_scheme,
        leak_category: currentQuestion.leak_category,
        answer
      });

      const score = Number(result.score || 0);
      const max = Number(result.max_score || 10);
      const percent = max > 0 ? Math.round((score / max) * 100) : 0;

      savePracticeAttempt({
        subject: currentSubject,
        type: currentQuestion.practice_type,
        difficulty: currentQuestion.difficulty,
        title: currentQuestion.title,
        question: currentQuestion.question,
        score,
        max,
        percent,
        source: "practice",
        leakCategory: result.leak_category || currentQuestion.leak_category || currentQuestion.practice_type,
        biggestLeak: result.biggest_leak || "Needs tighter mechanics"
      });

      feedbackCard.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || "Good. Now tighten it.")}</p>

        <div class="scorePill">${score}/${max} · ${percent}%</div>

        <div class="resultBlock">
          <strong>What worked</strong><br>
          ${escapeHtml(result.good || "—")}
        </div>

        <div class="resultBlock">
          <strong>Biggest leak now</strong><br>
          ${escapeHtml(result.biggest_leak || "—")}
        </div>

        <div class="resultBlock">
          <strong>Fix next</strong><br>
          ${escapeHtml(result.fix_next || "—")}
        </div>

        <div class="resultBlock">
          <strong>Scaffold</strong><br>
          ${escapeHtml(result.scaffold || "—")}
        </div>

        <div class="resultBlock">
          <strong>Model</strong><br>
          ${escapeHtml(result.model || "—")}
        </div>
      `;

      localStorage.setItem("brother_subject", currentSubject);
      localStorage.setItem("brother_question_type", currentQuestion.practice_type || "general");
      localStorage.setItem("brother_fix", result.fix_next || result.biggest_leak || "Tighten the mechanics");
      localStorage.setItem("brother_biggest_leak", result.biggest_leak || currentQuestion.leak_category || "mechanics");

      renderHistory();
    } catch (err) {
      feedbackCard.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>Something went wrong while marking that answer.</p>
        <p class="tiny">${escapeHtml(err.message || String(err))}</p>
      `;
    }
  });

  async function generateQuestion(variantOnly) {
    const practiceType = practiceTypeSelect.value || "general";
    const difficulty = difficultySelect.value || "standard";

    practiceCard.classList.remove("hidden");
    practiceCard.innerHTML = "Thinking…";
    answerCard.classList.add("hidden");
    feedbackCard.classList.add("hidden");
    feedbackCard.innerHTML = "";

    try {
      const result = await window.coachRequest({
        mode: "practice_generate",
        subject: currentSubject,
        practice_type: practiceType,
        difficulty,
        variant_only: !!variantOnly
      });

      currentQuestion = result;
      practiceCard.innerHTML = `
        <div class="tiny"><strong>${escapeHtml(subjectLabels[currentSubject] || currentSubject)}</strong> · ${escapeHtml(result.practice_type || practiceType)} · ${escapeHtml(result.difficulty || difficulty)}</div>
        <h3 style="margin-bottom:8px;">${escapeHtml(result.title || "Practice question")}</h3>
        <div class="exampleBox">${escapeHtml(result.question || "—")}</div>

        <div class="resultBlock">
          <strong>What this is testing</strong><br>
          ${escapeHtml(result.testing || "Short accurate exam-style mechanics.")}
        </div>

        <div class="resultBlock">
          <strong>Marking lens</strong><br>
          ${escapeHtml(result.marking_lens || "Accuracy, relevance, exam style.")}
        </div>

        <div class="resultBlock">
          <strong>Must include</strong>
          <ul>
            ${(Array.isArray(result.must_include) ? result.must_include : []).map(x => `<li>${escapeHtml(String(x))}</li>`).join("")}
          </ul>
        </div>
      `;
      answerCard.classList.remove("hidden");
      answerEl.value = "";
    } catch (err) {
      practiceCard.innerHTML = `
        <h3 style="margin-top:0;">Practice Mode</h3>
        <p>Something went wrong while generating the question.</p>
        <p class="tiny">${escapeHtml(err.message || String(err))}</p>
      `;
    }
  }

  function savePracticeAttempt(entry) {
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;

    const progress = JSON.parse(localStorage.getItem("lc_progress") || "{}");
    if (!Array.isArray(progress[entry.subject])) progress[entry.subject] = [];
    progress[entry.subject].push({
      score: entry.percent,
      raw_score: entry.score,
      raw_max: entry.max,
      weighted_score: Math.round(entry.percent * 0.55),
      date: dateLabel,
      source: "practice",
      practice_type: entry.type,
      title: entry.title
    });
    localStorage.setItem("lc_progress", JSON.stringify(progress));

    const attempts = JSON.parse(localStorage.getItem("lc_practice_attempts") || "[]");
    attempts.push({
      ...entry,
      date: dateLabel,
      timestamp: Date.now()
    });
    localStorage.setItem("lc_practice_attempts", JSON.stringify(attempts));

    const leaks = JSON.parse(localStorage.getItem("lc_leaks") || "{}");
    if (!Array.isArray(leaks[entry.subject])) leaks[entry.subject] = [];
    leaks[entry.subject].push({
      date: dateLabel,
      category: entry.leakCategory,
      detail: entry.biggestLeak,
      source: "practice"
    });
    localStorage.setItem("lc_leaks", JSON.stringify(leaks));
  }

  function renderHistory() {
    const attempts = JSON.parse(localStorage.getItem("lc_practice_attempts") || "[]");
    if (!attempts.length) {
      historyEl.innerHTML = `<div class="tiny">No practice attempts stored yet.</div>`;
      return;
    }

    const rows = attempts.slice(-8).reverse().map(a => {
      return `<div class="historyRow"><strong>${escapeHtml(subjectLabels[a.subject] || a.subject)}</strong> · ${escapeHtml(a.title || a.type || "Practice")}
        <span>${escapeHtml(a.date)} · ${escapeHtml(String(a.score))}/${escapeHtml(String(a.max))} · ${escapeHtml(String(a.percent))}%</span></div>`;
    }).join("");

    historyEl.innerHTML = rows;
  }

  function resetQuestionView() {
    currentQuestion = null;
    practiceCard.classList.add("hidden");
    answerCard.classList.add("hidden");
    feedbackCard.classList.add("hidden");
    feedbackCard.innerHTML = "";
    answerEl.value = "";
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

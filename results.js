const subjectBtns = document.querySelectorAll(".subjectBtn");
const exampleBox = document.getElementById("exampleBox");
const useExampleBtn = document.getElementById("useExampleBtn");
const clearBtn = document.getElementById("clearBtn");
const inputEl = document.getElementById("resultsInput");
const analyseBtn = document.getElementById("analyseBtn");
const outEl = document.getElementById("resultsOut");

let currentSubject = null;
let chart = null;

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
Q1 45/50
Q2 32/50
Q3 28/50

Paper 2
Q1 36/50
Q2 30/50
Q3 22/50`,

  pe_hl: `PE HL
Short Questions 62/80
Long Questions 84/120
Project 72/80`,

  biology_hl: `Biology HL
Short Questions 68/90
Long Questions 96/150
Weak areas:
Respiration
Genetics`,

  homeec_hl: `Home Ec HL
Section A 52/80
Section B 74/120
Elective 46/80`,

  spanish_ol: `Spanish OL
Oral 68/80
Aural 42/60
Reading 48/60
Written Expression 36/60`
};

subjectBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    subjectBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentSubject = btn.dataset.subject;
    exampleBox.textContent = EXAMPLES[currentSubject] || "";
  });
});

useExampleBtn.onclick = () => {
  if (currentSubject) {
    inputEl.value = EXAMPLES[currentSubject];
  }
};

clearBtn.onclick = () => {
  inputEl.value = "";
  outEl.classList.add("hidden");
};

analyseBtn.onclick = async () => {
  if (!currentSubject) {
    alert("Choose a subject first.");
    return;
  }

  const raw = inputEl.value.trim();
  if (!raw) return;

  outEl.classList.remove("hidden");
  outEl.innerHTML = "Thinking…";

  let result;
  try {
    result = await window.coachRequest({
      mode: "results_coach",
      subject: currentSubject,
      raw_results: raw
    });
  } catch {
    outEl.innerHTML = "<h2>THE BROTHER</h2><p>Something went wrong.</p>";
    return;
  }

  const drills = Array.isArray(result.drills) ? result.drills : [];

  outEl.innerHTML = `
    <h2 style="margin-top:0;">THE BROTHER</h2>

    <p>${escapeHtml(result.message || "Hi Tom. All good?")}</p>

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

    ${result.next_data_request ? `
      <div class="resultBlock">
        <strong>Next thing I need from you</strong><br>
        ${escapeHtml(result.next_data_request)}
      </div>
    ` : ""}
  `;

  saveProgress(raw);
  drawGraph();
};

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

function drawGraph() {
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

  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          min: 0,
          max: 100
        }
      }
    }
  });
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

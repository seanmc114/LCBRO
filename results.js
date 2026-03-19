document.addEventListener('DOMContentLoaded', () => {
  const subjectGrid = document.getElementById('subjectGrid');
  const resultsIntro = document.getElementById('resultsIntro');
  const questionTypeSelect = document.getElementById('questionTypeSelect');
  const exampleBox = document.getElementById('exampleBox');
  const useExampleBtn = document.getElementById('useExampleBtn');
  const clearBtn = document.getElementById('clearBtn');
  const inputEl = document.getElementById('resultsInput');
  const analyseBtn = document.getElementById('analyseBtn');
  const outEl = document.getElementById('resultsOut');
  const chartCanvas = document.getElementById('progressChart');
  const toggleCaoBtn = document.getElementById('toggleCaoBtn');
  const caoPanel = document.getElementById('caoPanel');
  const caoTotal = document.getElementById('caoTotal');
  const caoBreakdown = document.getElementById('caoBreakdown');
  const currentPicture = document.getElementById('currentPicture');

  const profile = window.getBrotherProfile();
  const resultsProfileName = document.getElementById('resultsProfileName');
  const resultsProfileSummary = document.getElementById('resultsProfileSummary');
  const editSetupResultsBtn = document.getElementById('editSetupResultsBtn');
  const clearStoredHistoryBtn = document.getElementById('clearStoredHistoryBtn');
  if (profile.learnerName) {
    resultsIntro.textContent = `${profile.learnerName}, choose a subject, paste results, and THE BROTHER will identify the biggest points leak first.`;
    resultsProfileName.textContent = profile.learnerName;
  }
  resultsProfileSummary.textContent = profile.selectedSubjects?.length ? profile.selectedSubjects.map(id => window.getSubjectLabel(id)).join(', ') : 'Results are mainly for calibration. Practice remains the main engine.';
  editSetupResultsBtn?.addEventListener('click', () => { window.location.href = 'index.html'; });
  clearStoredHistoryBtn?.addEventListener('click', () => {
    if (!confirm('Clear stored practice, results and leak history on this device?')) return;
    window.saveBrotherJson(window.BROTHER_STORAGE.attempts, []);
    window.saveBrotherJson(window.BROTHER_STORAGE.progress, {});
    window.saveBrotherJson(window.BROTHER_STORAGE.leaks, {});
    drawGraph();
    drawCurrentPicture();
    if (showCao) drawCaoProjection();
  });

  const selectedSubjects = window.getSelectedSubjects();
  let currentSubject = selectedSubjects[0]?.id || window.BROTHER_SUBJECTS[0].id;
  let chart = null;
  let showCao = false;

  const QUESTION_TYPES = {
    english_hl: [['general','General'],['single_text','Single text'],['comparative','Comparative'],['poetry','Poetry'],['comprehension','Comprehension'],['composition','Composition']],
    english_ol: [['general','General'],['single_text','Single text'],['poetry','Poetry'],['comprehension','Comprehension'],['composition','Composition']],
    irish_hl: [['general','General'],['oral','Oral'],['ceapadoireacht','Ceapadóireacht'],['leamhthuiscint','Léamhthuiscint'],['cluastuiscint','Cluastuiscint'],['pros','Prós'],['filiocht','Filíocht']],
    irish_ol: [['general','General'],['oral','Oral'],['ceapadoireacht','Ceapadóireacht'],['leamhthuiscint','Léamhthuiscint'],['cluastuiscint','Cluastuiscint']],
    maths_ol: [['general','General'],['algebra','Algebra'],['financial_maths','Financial Maths'],['geometry','Geometry'],['trigonometry','Trigonometry'],['statistics','Statistics / Probability']],
    maths_hl: [['general','General'],['algebra','Algebra'],['calculus','Calculus'],['trigonometry','Trigonometry'],['statistics','Statistics / Probability']],
    pe_hl: [['general','General'],['short_questions','Short Questions'],['physiology','Physiology'],['skill_acquisition','Skill Acquisition'],['sociology','Sociology of Sport'],['project','Project']],
    biology_hl: [['general','General'],['definitions','Definitions / Keywords'],['respiration','Respiration'],['genetics','Genetics'],['ecology','Ecology'],['experiments','Mandatory Experiments']],
    biology_ol: [['general','General'],['definitions','Definitions / Keywords'],['respiration','Respiration'],['genetics','Genetics'],['ecology','Ecology'],['experiments','Mandatory Experiments']],
    homeec_hl: [['general','General'],['short_answers','Short Answers'],['core','Core Long Answer'],['elective_nutrition','Elective: Nutrition'],['elective_resource','Elective: Resource Management'],['elective_social','Elective: Social Studies']],
    homeec_ol: [['general','General'],['short_answers','Short Answers'],['core','Core Long Answer'],['nutrition','Nutrition']],
    spanish_ol: [['general','General'],['oral','Oral'],['aural','Aural'],['reading','Reading'],['written_email','Written: Email / Message'],['written_opinion','Written: Opinion Paragraph'],['written_accuracy','Written: Accuracy / Grammar']],
    spanish_hl: [['general','General'],['oral','Oral'],['aural','Aural'],['reading','Reading'],['written_opinion','Written opinion'],['written_accuracy','Written accuracy']]
  };

  function exampleFor(subject){
    const label = window.getSubjectLabel(subject);
    if (subject.startsWith('english')) return `${label}\nPaper 1\nComprehension 15/20\nComposition 42/60\n\nPaper 2\nSingle Text 38/60\nComparative 45/70\nPoetry 42/50`;
    if (subject.startsWith('irish')) return `${label}\nCeapadóireacht 32/50\nLéamhthuiscint 18/25\nCluastuiscint 42/60\nPrós 28/50\nFilíocht 26/35`;
    if (subject.startsWith('maths')) return `${label}\nPaper 1\nAlgebra 22/50\nFinancial Maths 28/50\nNumber 35/50\n\nPaper 2\nGeometry 30/50\nTrigonometry 24/50\nStatistics 26/50`;
    if (subject.startsWith('biology')) return `${label}\nDefinitions 12/20\nRespiration 16/30\nGenetics 14/30\nEcology 22/30`;
    if (subject.startsWith('spanish')) return `${label}\nOral 62/80\nAural 40/60\nReading 48/60\nWritten Email 14/20\nWritten Opinion 8/20\nWritten Accuracy 12/20`;
    if (subject.startsWith('homeec')) return `${label}\nShort Answers 24/40\nCore Long Answer 34/60\nNutrition 18/30`;
    if (subject === 'pe_hl') return `${label}\nShort Questions 62/80\nPhysiology 18/30\nSkill Acquisition 20/30\nSociology 14/30\nProject 72/80`;
    return `${label}\nSection A 24/40\nSection B 18/30\nSection C 22/30`;
  }

  buildSubjectButtons();
  buildQuestionTypeOptions(currentSubject);
  exampleBox.textContent = exampleFor(currentSubject);
  drawGraph();
  drawCurrentPicture();

  useExampleBtn.addEventListener('click', () => { inputEl.value = exampleFor(currentSubject); });
  clearBtn.addEventListener('click', () => { inputEl.value = ''; outEl.classList.add('hidden'); outEl.innerHTML = ''; });

  toggleCaoBtn.addEventListener('click', () => {
    showCao = !showCao;
    caoPanel.classList.toggle('hidden', !showCao);
    toggleCaoBtn.textContent = showCao ? 'Hide CAO Projection' : 'Show CAO Projection';
    if (showCao) drawCaoProjection();
  });

  analyseBtn.addEventListener('click', async () => {
    const raw = inputEl.value.trim();
    if (!raw) return alert('Paste some results first.');
    const questionType = questionTypeSelect.value || 'general';

    outEl.classList.remove('hidden');
    outEl.innerHTML = 'Thinking…';

    try {
      const result = await window.coachRequest({
        mode:'results_coach',
        subject: currentSubject,
        question_type: questionType,
        raw_results: raw,
        learner_name: profile.learnerName || ''
      });

      const drills = Array.isArray(result.drills) ? result.drills : [];
      const drillMeta = result.drill_meta || null;
      const drillQueue = Array.isArray(result.drill_queue) ? result.drill_queue : (drillMeta ? [drillMeta] : []);
      const improvementLine = buildImprovementLine(currentSubject, raw);

      outEl.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || 'Ready. Let\'s find the leak.')}</p>
        ${improvementLine ? `<div class="improvementBanner">${escapeHtml(improvementLine)}</div>` : ''}
        <div class="resultBlock"><strong>Biggest points leak</strong><br>${escapeHtml(result.biggest_leak || '—')}</div>
        <div class="resultBlock"><strong>Why it matters</strong><br>${escapeHtml(result.why_it_matters || '—')}</div>
        <div class="resultBlock"><strong>Fix first</strong><br>${escapeHtml(result.fix_first || '—')}</div>
        <div class="resultBlock"><strong>Tonight\'s drills</strong><ul>${drills.map(d => `<li>${escapeHtml(String(d))}</li>`).join('')}</ul></div>
        ${drillQueue.length ? `<div class="resultBlock"><strong>Gym block</strong><br>${escapeHtml(drillQueue.length + ' targeted drills ready.')}</div>` : ''}
        <div class="controls" style="margin-top:16px;"><button id="startDrillBtn" class="goldBtn" type="button">Start Gym</button></div>
      `;

      localStorage.setItem('brother_subject', currentSubject);
      localStorage.setItem('brother_question_type', questionType);
      localStorage.setItem('brother_fix', result.fix_first || '');
      localStorage.setItem('brother_biggest_leak', result.biggest_leak || '');
      localStorage.setItem('brother_drills', JSON.stringify(drills));
      localStorage.setItem('brother_drill_meta', JSON.stringify(drillMeta || null));
      localStorage.setItem('brother_drill_queue', JSON.stringify(drillQueue));
      localStorage.setItem('brother_drill_index', '0');
      document.getElementById('startDrillBtn')?.addEventListener('click', () => { window.location.href = 'drill.html'; });

      saveExamProgress(raw, result, questionType);
      drawGraph();
      drawCurrentPicture();
      if (showCao) drawCaoProjection();
    } catch (err) {
      outEl.innerHTML = `<h2 style="margin-top:0;">THE BROTHER</h2><p>Something went wrong while analysing those results.</p><p class="tiny">${escapeHtml(err.message || String(err))}</p>`;
    }
  });

  function buildSubjectButtons(){
    subjectGrid.innerHTML = selectedSubjects.map(sub => `<button class="subjectBtn" data-subject="${sub.id}" style="background:${sub.color};${sub.id.includes('spanish') ? 'color:black;' : ''}">${escapeHtml(sub.label)}</button>`).join('');
    subjectGrid.querySelectorAll('.subjectBtn').forEach(btn => {
      if (btn.dataset.subject === currentSubject) btn.classList.add('active');
      btn.addEventListener('click', () => {
        subjectGrid.querySelectorAll('.subjectBtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSubject = btn.dataset.subject;
        buildQuestionTypeOptions(currentSubject);
        exampleBox.textContent = exampleFor(currentSubject);
      });
    });
  }

  function buildQuestionTypeOptions(subject){
    const list = QUESTION_TYPES[subject] || [['general','General'],['definitions','Definitions / keywords'],['short_response','Short response'],['application','Application']];
    questionTypeSelect.innerHTML = list.map(([value,label]) => `<option value="${value}">${label}</option>`).join('');
  }

  function saveExamProgress(text, result, questionType){
    const percent = extractScore(text);
    if (percent === null || !currentSubject) return;
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
    const history = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
    if (!history[currentSubject]) history[currentSubject] = [];
    history[currentSubject].push({ score: percent, weighted_score: percent, date: dateLabel, source: 'exam' });
    window.saveBrotherJson(window.BROTHER_STORAGE.progress, history);

    const leaks = window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {});
    if (!Array.isArray(leaks[currentSubject])) leaks[currentSubject] = [];
    leaks[currentSubject].push({ date: dateLabel, category: (result?.drill_meta?.leak_category) || questionType || 'general', detail: (result?.biggest_leak) || 'Biggest leak from exam input', source: 'exam' });
    window.saveBrotherJson(window.BROTHER_STORAGE.leaks, leaks);
  }

  function extractScore(text){
    const matches = text.match(/\d+\/\d+/g);
    if (!matches) return null;
    let total = 0;
    let max = 0;
    matches.forEach(m => { const [a,b] = m.split('/'); total += Number(a); max += Number(b); });
    return max ? Math.round((total / max) * 100) : null;
  }

  function buildImprovementLine(subject, raw){
    const percent = extractScore(raw);
    if (percent === null) return '';
    const history = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
    const prev = Array.isArray(history[subject]) && history[subject].length ? history[subject][history[subject].length - 1] : null;
    if (!prev) return '';
    if (percent > prev.score) return `${window.getSubjectLabel(subject)} improved ${prev.score}% → ${percent}%`;
    return '';
  }

  function drawGraph(){
    if (!chartCanvas || typeof Chart === 'undefined') return;
    const data = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
    const allowed = new Set(selectedSubjects.map(s => s.id));
    const datasets = [];
    const labels = [];
    Object.keys(data).filter(sub => allowed.has(sub)).forEach(sub => {
      const entries = data[sub];
      if (!Array.isArray(entries) || !entries.length) return;
      entries.forEach(e => { if (!labels.includes(e.date)) labels.push(e.date); });
      datasets.push({ label: window.getSubjectLabel(sub), data: entries.map(e => ({ x:e.date, y:e.score })), borderColor: window.getSubjectColor(sub), backgroundColor: window.getSubjectColor(sub), tension:0.3 });
    });
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, { type:'line', data:{ labels, datasets }, options:{ responsive:true, plugins:{ legend:{ display:true } }, scales:{ y:{ min:0, max:100 } } } });
  }

  function drawCaoProjection(){
    const history = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
    const latest = {};
    selectedSubjects.forEach(sub => {
      const arr = history[sub.id];
      if (Array.isArray(arr) && arr.length) latest[sub.id] = arr[arr.length - 1].score;
    });
    const entries = Object.keys(latest).map(sub => ({ sub, pct: latest[sub], points: convertPercentToPoints(sub, latest[sub]) }));
    const bestSix = entries.sort((a,b) => b.points - a.points).slice(0,6);
    const total = bestSix.reduce((sum,x) => sum + x.points, 0);
    caoTotal.textContent = total ? `${total} pts` : '—';
    caoBreakdown.innerHTML = bestSix.length ? bestSix.map(x => `<div style="margin-top:8px;"><strong>${window.getSubjectLabel(x.sub)}</strong> — ${x.pct}% ≈ ${x.points} pts</div>`).join('') : `<div class="tiny">No stored results yet.</div>`;
  }

  function convertPercentToPoints(subject, pct){
    const isHL = !subject.includes('_ol');
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

  function drawCurrentPicture(){
    const progress = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
    const leaks = window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {});
    const ids = selectedSubjects.map(s => s.id).filter(sub => Array.isArray(progress[sub]) && progress[sub].length);
    if (!ids.length) { currentPicture.innerHTML = `<div class="tiny">No stored picture yet. Practice will build this over time.</div>`; return; }
    currentPicture.innerHTML = ids.map(sub => {
      const entries = progress[sub] || [];
      const weightedAvg = Math.round(entries.reduce((sum,e) => sum + Number(e.weighted_score ?? e.score ?? 0), 0) / entries.length);
      const latest = entries[entries.length - 1];
      const leakEntries = Array.isArray(leaks[sub]) ? leaks[sub] : [];
      const topLeak = mostCommonLeak(leakEntries);
      const entryCount = entries.length; const pictureText = entryCount < 2 ? `Not enough stored data yet` : `Blended picture: ${weightedAvg}% · Latest: ${escapeHtml(String(latest.score))}%`; const leakText = leakEntries.length < 2 ? 'Recurring leak: Not enough data yet' : `Recurring leak: ${escapeHtml(topLeak)}`; return `<div class="pictureRow"><strong>${escapeHtml(window.getSubjectLabel(sub))}</strong><span>${pictureText} · ${leakText}</span></div>`;
    }).join('');
  }

  function mostCommonLeak(entries){
    if (!entries.length) return 'Not enough data yet';
    const counts = {};
    entries.forEach(e => { const key = String(e.category || e.detail || 'general'); counts[key] = (counts[key] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
  }

  function escapeHtml(s){
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
});

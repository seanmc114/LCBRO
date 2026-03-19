document.addEventListener('DOMContentLoaded', () => {
  const subjectGrid = document.getElementById('subjectGrid');
  const practiceIntro = document.getElementById('practiceIntro');
  const practiceProfileName = document.getElementById('practiceProfileName');
  const practiceProfileSummary = document.getElementById('practiceProfileSummary');
  const practiceTypeSelect = document.getElementById('practiceTypeSelect');
  const practiceTypeHelp = document.getElementById('practiceTypeHelp');
  const difficultySelect = document.getElementById('difficultySelect');
  const courseContextInput = document.getElementById('courseContextInput');
  const saveContextBtn = document.getElementById('saveContextBtn');
  const editSetupPracticeBtn = document.getElementById('editSetupPracticeBtn');
  const diagnosticBtn = document.getElementById('diagnosticBtn');
  const generateBtn = document.getElementById('generateBtn');
  const newVariantBtn = document.getElementById('newVariantBtn');
  const practiceCard = document.getElementById('practiceCard');
  const answerCard = document.getElementById('answerCard');
  const answerEl = document.getElementById('practiceAnswer');
  const markBtn = document.getElementById('markBtn');
  const clearAnswerBtn = document.getElementById('clearAnswerBtn');
  const feedbackCard = document.getElementById('feedbackCard');
  const historyEl = document.getElementById('practiceHistory');
  const contextSavedNote = document.getElementById('contextSavedNote');

  const profile = window.getBrotherProfile();
  if (profile.learnerName) {
    practiceIntro.textContent = `${profile.learnerName}, setup once, then practise. Early attempts help THE BROTHER find the real weaknesses. Results later confirm whether that picture is honest.`;
    practiceProfileName.textContent = profile.learnerName;
  }
  practiceProfileSummary.textContent = profile.selectedSubjects?.length
    ? profile.selectedSubjects.map(id => window.getSubjectLabel(id)).join(', ')
    : 'No subjects chosen yet. Go back and use Learner setup.';

  const selectedSubjects = window.getSelectedSubjects();
  let currentSubject = selectedSubjects[0]?.id || window.BROTHER_SUBJECTS[0].id;
  let currentQuestion = null;
  let diagnosticMode = false;
  const manualContexts = window.loadBrotherJson(window.BROTHER_STORAGE.manualContexts, {}) || {};

  const PRACTICE_TYPES = {
    english_hl: [['quotes','Quotes / evidence recall'],['single_paragraph','Short paragraph'],['terms','Literary terms / key ideas'],['comparison_link','Comparative link sentence']],
    english_ol: [['quotes','Quotes / evidence recall'],['single_paragraph','Short paragraph'],['terms','Key ideas'],['comprehension','Comprehension mechanics']],
    irish_hl: [['keywords','Keywords / key terms'],['short_response','Short structured response'],['grammar','Grammar / mechanics'],['text_reference','Text reference / quote support']],
    irish_ol: [['keywords','Keywords / key terms'],['short_response','Short structured response'],['grammar','Grammar / mechanics'],['reading','Reading support']],
    maths_ol: [['algebra','Algebra'],['formulae','Formulae'],['financial_maths','Financial maths'],['short_method','Short method question']],
    maths_hl: [['algebra','Algebra'],['calculus','Calculus'],['trigonometry','Trigonometry'],['short_method','Short method question']],
    pe_hl: [['definitions','Definitions / key terms'],['physiology','Physiology application'],['short_response','Short structured response'],['project_language','Project wording / terminology']],
    biology_hl: [['definitions','Definitions'],['keywords','Keywords / label knowledge'],['experiments','Experiments / method'],['short_explain','Short explain question']],
    biology_ol: [['definitions','Definitions'],['keywords','Keywords / label knowledge'],['experiments','Experiments / method'],['short_explain','Short explain question']],
    homeec_hl: [['definitions','Definitions / keywords'],['short_answers','Short answers'],['nutrition','Nutrition mechanics'],['application','Application sentence']],
    homeec_ol: [['definitions','Definitions / keywords'],['short_answers','Short answers'],['nutrition','Nutrition mechanics'],['application','Application sentence']],
    spanish_ol: [['grammar','Grammar / tense accuracy'],['vocabulary','Vocabulary / phrases'],['written_accuracy','Written accuracy'],['oral_mini','Short oral-style response']],
    spanish_hl: [['grammar','Grammar / tense accuracy'],['vocabulary','Vocabulary / phrases'],['written_accuracy','Written accuracy'],['oral_mini','Short oral-style response']]
  };


  const GENERIC_PRACTICE_TYPES = {
    languages: [['vocabulary','Vocabulary / phrases'],['grammar','Grammar / accuracy'],['short_response','Short response'],['comprehension','Comprehension mechanics']],
    sciences: [['definitions','Definitions / key terms'],['keywords','Keywords / labels'],['experiments','Method / experiment'],['short_explain','Short explain question']],
    humanities: [['terms','Key terms / concepts'],['short_response','Short structured response'],['evidence','Evidence / example use'],['comparison','Compare / link sentence']],
    businessish: [['definitions','Definitions / key terms'],['application','Application sentence'],['short_response','Short structured response'],['keywords','Keywords / concepts']],
    practical: [['definitions','Definitions / key terms'],['application','Application / scenario'],['short_response','Short structured response'],['keywords','Keywords / concepts']],
    maths: [['algebra','Algebra / manipulation'],['formulae','Formulae / substitution'],['short_method','Short method question'],['interpretation','Interpretation / reading the question']]
  };

  function genericTypesForSubject(subject){
    if (!subject) return [['general','General mechanics']];
    if (subject.includes('maths') || subject.includes('applied_maths') || subject.includes('dcg')) return GENERIC_PRACTICE_TYPES.maths;
    if (['biology','chemistry','physics','agricultural_science'].some(x => subject.includes(x))) return GENERIC_PRACTICE_TYPES.sciences;
    if (['english','irish','history','geography','classical_studies','religious_education','politics_society','ancient_greek'].some(x => subject.includes(x))) return GENERIC_PRACTICE_TYPES.humanities;
    if (['spanish','french','german','arabic','japanese'].some(x => subject.includes(x))) return GENERIC_PRACTICE_TYPES.languages;
    if (['business','economics','accounting'].some(x => subject.includes(x))) return GENERIC_PRACTICE_TYPES.businessish;
    if (['homeec','pe','construction_studies','computer_science','music','art'].some(x => subject.includes(x))) return GENERIC_PRACTICE_TYPES.practical;
    return [['general','General mechanics']];
  }

  const CONTEXT_HINTS = {
    english_hl: { placeholder:'Uses saved text names automatically. Add a theme, character or comparative mode here if useful.', note:'Saved English texts are pulled in from setup. Add a sharper focus here only if needed.' },
    english_ol: { placeholder:'Add your studied text or current focus if useful.', note:'Saved English setup is pulled in automatically.' },
    irish_hl: { placeholder:'Uses saved Irish text names automatically. Add a theme or grammar target here if useful.', note:'Saved Irish texts are pulled in from setup. Add a sharper focus here only if needed.' },
    irish_ol: { placeholder:'Add your studied text or grammar focus if useful.', note:'Saved Irish setup is pulled in automatically.' },
    biology_hl: { placeholder:'e.g. enzymes, photosynthesis, respiration, ecology', note:'Useful for chapter names, experiments, or the current biology topic.' },
    spanish_ol: { placeholder:'e.g. mi instituto, vacaciones, familia, pasado', note:'Useful for topic areas or a tense/theme you want to target.' },
    maths_ol: { placeholder:'e.g. algebra, circles, percentages, trigonometry', note:'Useful for a current maths topic or chapter.' },
    pe_hl: { placeholder:'e.g. training methods, skill-related fitness, project', note:'Useful for chapter headings, fitness components, or project language.' },
    homeec_hl: { placeholder:'e.g. protein, vitamins, food hygiene, consumer studies', note:'Useful for nutrition, food studies, or the current chapter.' }
  };

  buildSubjectButtons();
  buildPracticeOptions(currentSubject);
  applyContextHint(currentSubject);
  renderHistory();

  editSetupPracticeBtn?.addEventListener('click', () => { window.location.href = 'index.html'; });
  diagnosticBtn?.addEventListener('click', async () => {
    diagnosticMode = true;
    await generateQuestion(false);
  });
  saveContextBtn?.addEventListener('click', saveCurrentContext);
  courseContextInput?.addEventListener('blur', saveCurrentContext);
  generateBtn.addEventListener('click', async () => { diagnosticMode = false; await generateQuestion(false); });
  newVariantBtn.addEventListener('click', async () => { diagnosticMode = false; await generateQuestion(true); });
  clearAnswerBtn.addEventListener('click', () => { answerEl.value = ''; });

  markBtn.addEventListener('click', async () => {
    const answer = answerEl.value.trim();
    if (!currentQuestion) return alert('Generate a question first.');
    if (!answer) return alert('Write an answer first.');

    feedbackCard.classList.remove('hidden');
    feedbackCard.innerHTML = 'Thinking…';

    try {
      const result = await window.coachRequest({
        mode: 'practice_mark',
        subject: currentSubject,
        practice_type: currentQuestion.practice_type,
        difficulty: currentQuestion.difficulty,
        question_title: currentQuestion.title,
        question_text: currentQuestion.question,
        mark_scheme: currentQuestion.mark_scheme,
        leak_category: currentQuestion.leak_category,
        answer,
        learner_name: profile.learnerName || '',
        course_context: getEffectiveContext(currentSubject)
      });

      const score = Number(result.score || 0);
      const max = Number(result.max_score || 10);
      const percent = max > 0 ? Math.round((score / max) * 100) : 0;
      const now = new Date();
      const dateLabel = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
      const leakCategory = result.leak_category || currentQuestion.leak_category || currentQuestion.practice_type;

      savePracticeAttempt({
        subject: currentSubject,
        type: currentQuestion.practice_type,
        difficulty: currentQuestion.difficulty,
        title: currentQuestion.title,
        question: currentQuestion.question,
        score,
        max,
        percent,
        source: 'practice',
        leakCategory,
        biggestLeak: result.biggest_leak || 'Needs tighter mechanics'
      });

      const progress = window.loadBrotherJson(window.BROTHER_STORAGE.progress, {});
      if (!Array.isArray(progress[currentSubject])) progress[currentSubject] = [];
      progress[currentSubject].push({ score: percent, weighted_score: Math.round(percent * 0.7), date: dateLabel, source: 'practice' });
      window.saveBrotherJson(window.BROTHER_STORAGE.progress, progress);

      const leaks = window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {});
      if (!Array.isArray(leaks[currentSubject])) leaks[currentSubject] = [];
      leaks[currentSubject].push({ date: dateLabel, category: leakCategory, detail: result.biggest_leak || leakCategory, source: 'practice' });
      window.saveBrotherJson(window.BROTHER_STORAGE.leaks, leaks);

      feedbackCard.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || 'Good. Now tighten it.')}</p>
        <div class="scorePill">${score}/${max} · ${percent}%</div>
        <div class="resultBlock"><strong>What worked</strong><br>${escapeHtml(result.good || '—')}</div>
        <div class="resultBlock"><strong>Biggest leak now</strong><br>${escapeHtml(result.biggest_leak || '—')}</div>
        <div class="resultBlock"><strong>Fix next</strong><br>${escapeHtml(result.fix_next || result.fix || '—')}</div>
        <div class="resultBlock"><strong>Scaffold</strong><br>${escapeHtml(result.scaffold || '—')}</div>
        <div class="resultBlock"><strong>What good looks like</strong><br>${escapeHtml(result.model || '—')}</div>
      `;
      renderHistory();
    } catch (err) {
      feedbackCard.innerHTML = `<strong>Something went wrong.</strong><div class="tiny" style="margin-top:8px;">${escapeHtml(err.message || String(err))}</div>`;
    }
  });

  function buildSubjectButtons(){
    subjectGrid.innerHTML = '';
    selectedSubjects.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subjectBtn';
      btn.textContent = sub.label;
      btn.style.background = sub.color;
      if (sub.id === currentSubject) btn.classList.add('active');
      btn.addEventListener('click', () => {
        currentSubject = sub.id;
        diagnosticMode = false;
        [...subjectGrid.querySelectorAll('.subjectBtn')].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildPracticeOptions(currentSubject);
        applyContextHint(currentSubject);
        practiceCard.classList.add('hidden');
        answerCard.classList.add('hidden');
        feedbackCard.classList.add('hidden');
        renderHistory();
      });
      subjectGrid.appendChild(btn);
    });
  }

  function buildPracticeOptions(subject){
    const opts = PRACTICE_TYPES[subject] || genericTypesForSubject(subject);
    practiceTypeSelect.innerHTML = opts.map(([v,l]) => `<option value="${v}">${escapeHtml(l)}</option>`).join('');
    practiceTypeHelp.textContent = 'Choose the paper section or skill area you want to practise. This is the day-to-day engine; results later confirm whether the picture is accurate.';
  }

  function getSavedCourseContext(subject){
    const p = window.getBrotherProfile();
    if (subject === 'english_hl' || subject === 'english_ol') {
      const parts = [];
      if (p.english?.singleText) parts.push(`Single Text: ${p.english.singleText}`);
      if (p.english?.comparativeTexts?.length) parts.push(`Comparative: ${p.english.comparativeTexts.join(', ')}`);
      if (p.english?.poets?.length) parts.push(`Poets: ${p.english.poets.join(', ')}`);
      if (p.english?.focus) parts.push(`Focus: ${p.english.focus}`);
      return parts.join(' | ');
    }
    if (subject === 'irish_hl' || subject === 'irish_ol') {
      const parts = [];
      if (p.irish?.pros) parts.push(`Prós: ${p.irish.pros}`);
      if (p.irish?.drama) parts.push(`Dráma: ${p.irish.drama}`);
      if (p.irish?.filiocht) parts.push(`Filíocht: ${p.irish.filiocht}`);
      if (p.irish?.focus) parts.push(`Focus: ${p.irish.focus}`);
      return parts.join(' | ');
    }
    return '';
  }

  function getEffectiveContext(subject){
    const manual = String(manualContexts[subject] || '').trim();
    return manual || getSavedCourseContext(subject);
  }

  function applyContextHint(subject){
    const hint = CONTEXT_HINTS[subject] || { placeholder:'Optional topic or chapter', note:'Optional.' };
    const saved = getSavedCourseContext(subject);
    const manual = String(manualContexts[subject] || '').trim();
    courseContextInput.placeholder = hint.placeholder;
    courseContextInput.value = manual || saved;
    document.getElementById('courseContextHelp').textContent = hint.note + (saved ? ` Saved setup for this subject: ${saved}.` : '');
    updateSavedNote(subject);
  }

  function saveCurrentContext(){
    const value = courseContextInput.value.trim();
    if (value) manualContexts[currentSubject] = value;
    else delete manualContexts[currentSubject];
    window.saveBrotherJson(window.BROTHER_STORAGE.manualContexts, manualContexts);
    updateSavedNote(currentSubject, true);
  }

  function updateSavedNote(subject, justSaved=false){
    const manual = String(manualContexts[subject] || '').trim();
    const saved = getSavedCourseContext(subject);
    if (!contextSavedNote) return;
    if (manual) {
      contextSavedNote.textContent = `${justSaved ? 'Saved. ' : ''}Current context for this subject: ${manual}`;
      return;
    }
    if (saved) {
      contextSavedNote.textContent = `Using saved setup for this subject: ${saved}`;
      return;
    }
    contextSavedNote.textContent = 'No saved context yet for this subject. You can still generate practice now.';
  }

  function pickDiagnosticType(subject){
    const opts = PRACTICE_TYPES[subject] || genericTypesForSubject(subject);
    const leaks = window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {});
    const entries = Array.isArray(leaks[subject]) ? leaks[subject] : [];
    if (entries.length >= 2) {
      const counts = {};
      entries.forEach(e => counts[e.category] = (counts[e.category] || 0) + 1);
      const best = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];
      if (opts.some(([v]) => v === best)) return best;
    }
    return opts[0][0];
  }

  async function generateQuestion(newVariant){
    let practiceType = practiceTypeSelect.value;
    if (diagnosticMode) {
      practiceType = pickDiagnosticType(currentSubject);
      practiceTypeSelect.value = practiceType;
    }
    const difficulty = difficultySelect.value;
    const courseContext = getEffectiveContext(currentSubject);
    saveCurrentContext();

    practiceCard.classList.remove('hidden');
    practiceCard.innerHTML = diagnosticMode ? 'Building a quick diagnostic…' : 'Thinking…';
    answerCard.classList.add('hidden');
    feedbackCard.classList.add('hidden');

    try {
      const result = await window.coachRequest({
        mode: 'practice_generate',
        subject: currentSubject,
        practice_type: practiceType,
        difficulty,
        course_context: courseContext,
        new_variant: !!newVariant,
        learner_name: profile.learnerName || ''
      });

      currentQuestion = result;
      const contextLine = courseContext ? `<div class="resultBlock"><strong>Course context</strong><br>${escapeHtml(courseContext)}</div>` : '';
      const diagnosticLine = diagnosticMode ? `<div class="resultBlock"><strong>Diagnostic mode</strong><br>This first question is probing for likely marks leakage in ${escapeHtml(window.getSubjectLabel(currentSubject))}.</div>` : '';
      practiceCard.innerHTML = `
        <h2 style="margin-top:0;">${escapeHtml(window.getSubjectLabel(currentSubject))} · ${escapeHtml(practiceType)} · ${escapeHtml(difficulty)}</h2>
        ${diagnosticLine}
        ${contextLine}
        <div class="resultBlock"><strong>${escapeHtml(result.title || 'Practice question')}</strong></div>
        <div class="resultBlock">${escapeHtml(result.question || '')}</div>
        <div class="resultBlock"><strong>What this is testing</strong><br>${escapeHtml(result.testing || '')}</div>
        <div class="resultBlock"><strong>Marking lens</strong><br>${escapeHtml(result.marking_lens || '')}</div>
        <div class="resultBlock"><strong>Must include</strong><br>${(result.must_include || []).map(escapeHtml).join(' · ')}</div>
      `;
      answerCard.classList.remove('hidden');
      answerEl.value = '';
      feedbackCard.classList.add('hidden');
      diagnosticMode = false;
    } catch (err) {
      practiceCard.innerHTML = `<strong>Something went wrong.</strong><div class="tiny" style="margin-top:8px;">${escapeHtml(err.message || String(err))}</div>`;
    }
  }

  function savePracticeAttempt(entry){
    const all = window.loadBrotherJson(window.BROTHER_STORAGE.attempts, []);
    all.push({ ...entry, date: new Date().toISOString() });
    window.saveBrotherJson(window.BROTHER_STORAGE.attempts, all);
  }

  function renderHistory(){
    const all = window.loadBrotherJson(window.BROTHER_STORAGE.attempts, []);
    const rows = all.filter(x => x.subject === currentSubject).slice(-8).reverse();
    if (!rows.length) {
      historyEl.innerHTML = '<div class="tiny">No practice saved yet for this subject.</div>';
      return;
    }
    historyEl.innerHTML = rows.map(row => `
      <div class="historyRow">
        <strong>${escapeHtml(row.title || row.type || 'Practice')}</strong>
        <span>${escapeHtml(String(row.score))}/${escapeHtml(String(row.max))} · ${escapeHtml(String(row.percent))}%</span>
      </div>
    `).join('');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const els = {
    intro: $('practiceIntro'),
    profileName: $('practiceProfileName'),
    profileSummary: $('practiceProfileSummary'),
    subjectGrid: $('subjectGrid'),
    areaButtons: $('practiceAreaButtons'),
    areaCurrent: $('practiceAreaCurrent'),
    typeSelect: $('practiceTypeSelect'),
    typeHelp: $('practiceTypeHelp'),
    difficulty: $('difficultySelect'),
    contextInput: $('courseContextInput'),
    contextHelp: $('courseContextHelp'),
    contextSaved: $('contextSavedNote'),
    saveContext: $('saveContextBtn'),
    editSetup: $('editSetupPracticeBtn'),
    diagnostic: $('diagnosticBtn'),
    generate: $('generateBtn'),
    variant: $('newVariantBtn'),
    practiceCard: $('practiceCard'),
    answerCard: $('answerCard'),
    answer: $('practiceAnswer'),
    mark: $('markBtn'),
    clear: $('clearAnswerBtn'),
    feedback: $('feedbackCard'),
    history: $('practiceHistory')
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const profile = window.getBrotherProfile ? window.getBrotherProfile() : { learnerName:'', selectedSubjects:[] };
  const allSubjects = Array.isArray(window.BROTHER_SUBJECTS) ? window.BROTHER_SUBJECTS : [];
  const selected = window.getSelectedSubjects ? window.getSelectedSubjects() : allSubjects;
  const subjects = selected.length ? selected : allSubjects;
  const manualContexts = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.manualContexts, {}) || {}) : {};

  const AREAS = {
    english_hl: [['quotes','Quotes / evidence recall'],['single_paragraph','Short paragraph'],['terms','Literary terms / key ideas'],['comparison_link','Comparative link sentence']],
    english_ol: [['quotes','Quotes / evidence recall'],['single_paragraph','Short paragraph'],['terms','Key ideas'],['comprehension','Comprehension mechanics']],
    irish_hl: [['keywords','Keywords / key terms'],['short_response','Short structured response'],['grammar','Grammar / mechanics'],['text_reference','Text reference / support']],
    irish_ol: [['keywords','Keywords / key terms'],['short_response','Short structured response'],['grammar','Grammar / mechanics'],['reading','Reading support']],
    maths_ol: [['algebra','Algebra'],['formulae','Formulae'],['financial_maths','Financial maths'],['short_method','Short method']],
    maths_hl: [['algebra','Algebra'],['calculus','Calculus'],['trigonometry','Trigonometry'],['short_method','Short method']],
    biology_hl: [['definitions','Definitions'],['keywords','Keywords / labels'],['experiments','Experiments / method'],['short_explain','Short explain']],
    biology_ol: [['definitions','Definitions'],['keywords','Keywords / labels'],['experiments','Experiments / method'],['short_explain','Short explain']],
    spanish_ol: [['grammar','Grammar / tense accuracy'],['vocabulary','Vocabulary / phrases'],['written_accuracy','Written accuracy'],['oral_mini','Short oral-style response']],
    spanish_hl: [['grammar','Grammar / tense accuracy'],['vocabulary','Vocabulary / phrases'],['written_accuracy','Written accuracy'],['oral_mini','Short oral-style response']],
    pe_hl: [['definitions','Definitions / key terms'],['physiology','Physiology application'],['short_response','Short structured response'],['project_language','Project wording / terminology']],
    homeec_hl: [['definitions','Definitions / keywords'],['short_answers','Short answers'],['nutrition','Nutrition mechanics'],['application','Application sentence']],
    homeec_ol: [['definitions','Definitions / keywords'],['short_answers','Short answers'],['nutrition','Nutrition mechanics'],['application','Application sentence']],
    religious_education_hl: [['terms','Key terms / concepts'],['short_response','Short structured response'],['evidence','Evidence / example use'],['comparison','Compare / link sentence']],
    religious_education_ol: [['terms','Key terms / concepts'],['short_response','Short structured response'],['evidence','Evidence / example use'],['comparison','Compare / link sentence']],
    applied_maths_hl: [['formulae','Formulae'],['short_method','Short method'],['interpretation','Interpretation'],['application','Application']],
    physics_hl: [['definitions','Definitions'],['formulae','Formulae'],['experiments','Experiments / method'],['short_explain','Short explain']],
    physics_ol: [['definitions','Definitions'],['formulae','Formulae'],['experiments','Experiments / method'],['short_explain','Short explain']],
    chemistry_hl: [['definitions','Definitions'],['keywords','Keywords'],['experiments','Experiments / method'],['short_explain','Short explain']],
    chemistry_ol: [['definitions','Definitions'],['keywords','Keywords'],['experiments','Experiments / method'],['short_explain','Short explain']],
    art_hl: [['terms','Visual language'],['evidence','Artwork evidence'],['comparison','Comparison'],['short_response','Short response']],
    art_ol: [['terms','Visual language'],['evidence','Artwork evidence'],['comparison','Comparison'],['short_response','Short response']],
    economics_hl: [['definitions','Definitions'],['terms','Terms'],['application','Application'],['short_response','Short response']],
    economics_ol: [['definitions','Definitions'],['terms','Terms'],['application','Application'],['short_response','Short response']],
    business_hl: [['definitions','Definitions'],['terms','Terms'],['short_response','Short response'],['application','Application']],
    business_ol: [['definitions','Definitions'],['terms','Terms'],['short_response','Short response'],['application','Application']],
    accounting_hl: [['terms','Terms'],['short_method','Short method'],['interpretation','Interpretation'],['application','Application']],
    accounting_ol: [['terms','Terms'],['short_method','Short method'],['interpretation','Interpretation'],['application','Application']],
    german_hl: [['vocabulary','Vocabulary'],['grammar','Grammar'],['written_accuracy','Written accuracy'],['oral_mini','Short response']],
    german_ol: [['vocabulary','Vocabulary'],['grammar','Grammar'],['written_accuracy','Written accuracy'],['oral_mini','Short response']],
    french_hl: [['vocabulary','Vocabulary'],['grammar','Grammar'],['written_accuracy','Written accuracy'],['oral_mini','Short response']],
    french_ol: [['vocabulary','Vocabulary'],['grammar','Grammar'],['written_accuracy','Written accuracy'],['oral_mini','Short response']],
    computer_science_hl: [['definitions','Definitions'],['terms','Terms'],['application','Application'],['short_response','Short response']],
    geography_hl: [['definitions','Definitions'],['terms','Terms'],['evidence','Evidence'],['comparison','Comparison']],
    geography_ol: [['definitions','Definitions'],['terms','Terms'],['evidence','Evidence'],['comparison','Comparison']],
    history_hl: [['terms','Terms'],['evidence','Evidence'],['comparison','Comparison'],['short_response','Short response']],
    history_ol: [['terms','Terms'],['evidence','Evidence'],['comparison','Comparison'],['short_response','Short response']]
  };

  function genericAreas(subjectId) {
    const s = String(subjectId || '').toLowerCase();
    if (s.includes('maths') || s.includes('applied_maths') || s.includes('dcg')) return [['algebra','Algebra / manipulation'],['formulae','Formulae / substitution'],['short_method','Short method'],['interpretation','Interpretation']];
    if (['biology','chemistry','physics','agricultural_science'].some(x => s.includes(x))) return [['definitions','Definitions'],['keywords','Keywords / labels'],['experiments','Method / experiment'],['short_explain','Short explain']];
    if (['english','irish','history','geography','classical_studies','religious_education','politics_society','ancient_greek'].some(x => s.includes(x))) return [['terms','Key terms / concepts'],['short_response','Short structured response'],['evidence','Evidence / example use'],['comparison','Compare / link sentence']];
    if (['spanish','french','german','arabic','japanese'].some(x => s.includes(x))) return [['vocabulary','Vocabulary / phrases'],['grammar','Grammar / accuracy'],['short_response','Short response'],['comprehension','Comprehension mechanics']];
    return [['general','General mechanics'],['terms','Key terms'],['short_response','Short response'],['application','Application']];
  }

  function subjectLabel(id){ return window.getSubjectLabel ? window.getSubjectLabel(id) : id; }
  function subjectColor(id){ return window.getSubjectColor ? window.getSubjectColor(id) : '#2fa39a'; }
  function areasFor(id){ return AREAS[id] || genericAreas(id); }

  let currentSubject = subjects[0]?.id || allSubjects[0]?.id || 'english_hl';
  let currentArea = areasFor(currentSubject)[0][0];
  let currentQuestion = null;
  let diagnosticMode = false;

  function savedCourseContext(subject){
    const p = window.getBrotherProfile ? window.getBrotherProfile() : profile;
    if (subject.startsWith('english_')) {
      const bits = [];
      if (p.english?.singleText) bits.push(`Single Text: ${p.english.singleText}`);
      if (p.english?.comparativeTexts?.length) bits.push(`Comparative: ${p.english.comparativeTexts.join(', ')}`);
      if (p.english?.poets?.length) bits.push(`Poets: ${p.english.poets.join(', ')}`);
      if (p.english?.focus) bits.push(`Focus: ${p.english.focus}`);
      return bits.join(' | ');
    }
    if (subject.startsWith('irish_')) {
      const bits = [];
      if (p.irish?.pros) bits.push(`Prós: ${p.irish.pros}`);
      if (p.irish?.drama) bits.push(`Dráma: ${p.irish.drama}`);
      if (p.irish?.filiocht) bits.push(`Filíocht: ${p.irish.filiocht}`);
      if (p.irish?.focus) bits.push(`Focus: ${p.irish.focus}`);
      return bits.join(' | ');
    }
    return '';
  }

  function effectiveContext(subject){
    return String(manualContexts[subject] || '').trim() || savedCourseContext(subject) || '';
  }

  function setContextUI() {
    const hints = {
      english_hl: ['e.g. Macbeth, Lady Macbeth, ambition, kingship', 'Saved English setup is used automatically. Add a sharper text focus here if needed.'],
      english_ol: ['e.g. Macbeth, character, theme, scene', 'Saved English setup is used automatically. Add a sharper text focus here if needed.'],
      irish_hl: ['e.g. An Triail, Hurlamaboc, téama, carachtar', 'Saved Irish setup is used automatically. Add a sharper text focus here if needed.'],
      irish_ol: ['e.g. prós, dráma, dán, gramadach', 'Saved Irish setup is used automatically. Add a sharper text focus here if needed.']
    };
    const [placeholder, note] = hints[currentSubject] || ['Optional course context, chapter, or topic', 'Optional. Use this to make the question fit current classwork.'];
    if (els.contextInput) {
      els.contextInput.placeholder = placeholder;
      els.contextInput.value = String(manualContexts[currentSubject] || '').trim() || savedCourseContext(currentSubject) || '';
    }
    if (els.contextHelp) els.contextHelp.textContent = note;
    const manual = String(manualContexts[currentSubject] || '').trim();
    const saved = savedCourseContext(currentSubject);
    if (els.contextSaved) {
      if (manual) els.contextSaved.textContent = `Current context for this subject: ${manual}`;
      else if (saved) els.contextSaved.textContent = `Using saved setup for this subject: ${saved}`;
      else els.contextSaved.textContent = 'No saved context yet for this subject. You can still start now.';
    }
  }

  function saveContext() {
    const val = String(els.contextInput?.value || '').trim();
    if (val) manualContexts[currentSubject] = val; else delete manualContexts[currentSubject];
    if (window.saveBrotherJson) window.saveBrotherJson(window.BROTHER_STORAGE.manualContexts, manualContexts);
    setContextUI();
  }

  function renderSubjects() {
    if (!els.subjectGrid) return;
    els.subjectGrid.innerHTML = '';
    subjects.forEach(sub => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'subjectBtn' + (sub.id === currentSubject ? ' active' : '');
      b.textContent = sub.label;
      b.style.background = sub.color || subjectColor(sub.id);
      b.addEventListener('click', () => {
        currentSubject = sub.id;
        currentArea = areasFor(currentSubject)[0][0];
        currentQuestion = null;
        diagnosticMode = false;
        renderSubjects();
        renderAreas();
        setContextUI();
        renderHistory();
        if (els.answer) els.answer.value = '';
        if (els.practiceCard) els.practiceCard.classList.add('hidden');
        if (els.answerCard) els.answerCard.classList.add('hidden');
        if (els.feedback) els.feedback.classList.add('hidden');
      });
      els.subjectGrid.appendChild(b);
    });
  }

  function renderAreas() {
    const areas = areasFor(currentSubject);
    if (els.areaButtons) {
      els.areaButtons.innerHTML = '';
      areas.forEach(([value, label]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'areaBtn' + (value === currentArea ? ' active' : '');
        b.textContent = label;
        b.addEventListener('click', () => {
          currentArea = value;
          currentQuestion = null;
          if (els.typeSelect) els.typeSelect.value = value;
          if (els.answer) els.answer.value = '';
          if (els.practiceCard) els.practiceCard.classList.add('hidden');
          if (els.answerCard) els.answerCard.classList.add('hidden');
          if (els.feedback) els.feedback.classList.add('hidden');
          renderAreas();
        });
        els.areaButtons.appendChild(b);
      });
    }
    if (els.typeSelect) {
      els.typeSelect.innerHTML = areas.map(([value, label]) => `<option value="${esc(value)}" ${value===currentArea?'selected':''}>${esc(label)}</option>`).join('');
      els.typeSelect.size = Math.min(4, areas.length);
      els.typeSelect.value = currentArea;
    }
    const selectedLabel = (areas.find(([v]) => v === currentArea) || [null, 'General mechanics'])[1];
    if (els.areaCurrent) els.areaCurrent.textContent = `Current area: ${selectedLabel}`;
    if (els.typeHelp) els.typeHelp.textContent = 'Pick one starting area below. If unsure, use Quick diagnostic.';
  }

  function renderQuestionCard(q) {
    if (!els.practiceCard) return;
    els.practiceCard.innerHTML = `
      <h2 style="margin-top:0;">${esc(q.title || 'Short practice')}</h2>
      <div class="tiny">${esc(subjectLabel(currentSubject))} · ${esc(q.practice_type || currentArea)} · ${esc(q.difficulty || els.difficulty?.value || 'standard')}</div>
      <p style="font-size:20px;font-weight:800;line-height:1.35;">${esc(q.question || 'Question not available.')}</p>
      ${q.course_context ? `<div class="resultBlock"><strong>Course context</strong><br>${esc(q.course_context)}</div>` : ''}
      <div class="resultBlock"><strong>What this is testing</strong><br>${esc(q.what_this_tests || 'short accurate exam-style mechanics')}</div>
      <div class="resultBlock"><strong>Marking lens</strong><br>${esc(q.mark_scheme || q.marking_lens || 'accuracy, relevance, exam wording')}</div>
      <div class="resultBlock"><strong>Must include</strong><ul class="mustList">${(q.must_include || []).map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>
    `;
    els.practiceCard.classList.remove('hidden');
    els.answerCard?.classList.remove('hidden');
  }

  function saveAttempt(entry) {
    const attempts = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.attempts, []) || []) : [];
    attempts.unshift({ ...entry, time: new Date().toISOString() });
    if (window.saveBrotherJson) window.saveBrotherJson(window.BROTHER_STORAGE.attempts, attempts.slice(0, 60));
  }

  function renderHistory() {
    if (!els.history) return;
    const attempts = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.attempts, []) || []) : [];
    const filtered = attempts.filter(a => a.subject === currentSubject).slice(0, 8);
    if (!filtered.length) {
      els.history.innerHTML = '<div class="tiny">No practice attempts stored yet for this subject.</div>';
      return;
    }
    els.history.innerHTML = filtered.map(a => {
      const d = new Date(a.time);
      const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      return `<div class="historyRow"><div><strong>${esc(a.title || a.type || 'Practice')}</strong><div class="tiny">${label} · ${esc(a.type || 'general')} · ${esc(a.biggestLeak || '—')}</div></div><span>${Number(a.score || 0)}/${Number(a.max || 10)} · ${Number(a.percent || 0)}%</span></div>`;
    }).join('');
  }

  function pickDiagnosticArea() {
    const opts = areasFor(currentSubject);
    const leaks = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {}) || {}) : {};
    const entries = Array.isArray(leaks[currentSubject]) ? leaks[currentSubject] : [];
    if (entries.length >= 2) {
      const counts = {};
      entries.forEach(e => counts[e.category] = (counts[e.category] || 0) + 1);
      const best = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];
      if (best && opts.some(([v]) => v === best)) return best;
    }
    return opts[0][0];
  }

  async function generateQuestion(newVariant = false) {
    if (!window.coachRequest) {
      if (els.practiceCard) {
        els.practiceCard.classList.remove('hidden');
        els.practiceCard.innerHTML = '<strong>Worker not available.</strong><div class="tiny" style="margin-top:8px;">The page could not find ai.js / coachRequest.</div>';
      }
      return;
    }
    try {
      if (diagnosticMode) currentArea = pickDiagnosticArea();
      renderAreas();
      if (els.feedback) els.feedback.classList.add('hidden');
      if (els.practiceCard) {
        els.practiceCard.classList.remove('hidden');
        els.practiceCard.innerHTML = '<p><strong>Building question…</strong></p>';
      }
      const payload = {
        mode: 'practice_generate',
        subject: currentSubject,
        practice_type: currentArea,
        difficulty: els.difficulty?.value || 'standard',
        course_context: effectiveContext(currentSubject),
        learner_name: profile.learnerName || '',
        new_variant: !!newVariant,
        diagnostic_mode: !!diagnosticMode
      };
      const q = await window.coachRequest(payload);
      if (els.answer) els.answer.value = '';
      currentQuestion = {
        title: q.title || 'Mechanics quick hit',
        question: q.question || 'Answer one short exam-style question clearly and accurately.',
        what_this_tests: q.what_this_tests || 'short accurate exam-style mechanics',
        mark_scheme: q.mark_scheme || q.marking_lens || 'accuracy, relevance, exam wording',
        must_include: Array.isArray(q.must_include) && q.must_include.length ? q.must_include : ['clear answer','one accurate support'],
        practice_type: q.practice_type || currentArea,
        difficulty: q.difficulty || (els.difficulty?.value || 'standard'),
        leak_category: q.leak_category || currentArea,
        course_context: q.course_context || payload.course_context || ''
      };
      renderQuestionCard(currentQuestion);
    } catch (err) {
      if (els.practiceCard) {
        els.practiceCard.classList.remove('hidden');
        els.practiceCard.innerHTML = `<strong>Something went wrong.</strong><div class="tiny" style="margin-top:8px;">${esc(err.message || String(err))}</div>`;
      }
    }
  }

  async function markAnswer() {
    const answer = String(els.answer?.value || '').trim();
    if (!currentQuestion) { alert('Generate a question first.'); return; }
    if (!answer) { alert('Write an answer first.'); return; }
    if (els.feedback) {
      els.feedback.classList.remove('hidden');
      els.feedback.innerHTML = 'Marking…';
    }
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
        course_context: effectiveContext(currentSubject)
      });
      const score = Number(result.score || 0);
      const max = Number(result.max_score || 10);
      const percent = max > 0 ? Math.round((score / max) * 100) : 0;
      const now = new Date();
      const dateLabel = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
      const leakCategory = result.leak_category || currentQuestion.leak_category || currentQuestion.practice_type;

      saveAttempt({
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

      const progress = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.progress, {}) || {}) : {};
      if (!Array.isArray(progress[currentSubject])) progress[currentSubject] = [];
      progress[currentSubject].push({ score: percent, weighted_score: Math.round(percent * 0.7), date: dateLabel, source: 'practice' });
      if (window.saveBrotherJson) window.saveBrotherJson(window.BROTHER_STORAGE.progress, progress);

      const leaks = window.loadBrotherJson ? (window.loadBrotherJson(window.BROTHER_STORAGE.leaks, {}) || {}) : {};
      if (!Array.isArray(leaks[currentSubject])) leaks[currentSubject] = [];
      leaks[currentSubject].push({ date: dateLabel, category: leakCategory, detail: result.biggest_leak || leakCategory, source: 'practice' });
      if (window.saveBrotherJson) window.saveBrotherJson(window.BROTHER_STORAGE.leaks, leaks);

      if (els.feedback) {
        els.feedback.innerHTML = `
          <h2 style="margin-top:0;">THE BROTHER</h2>
          <p>${esc(result.message || 'Good. Now improve the next step.')}</p>
          <div class="scorePill">${score}/${max} · ${percent}%</div>
          <div class="resultBlock"><strong>What worked</strong><br>${esc(result.good || '—')}</div>
          <div class="resultBlock"><strong>Biggest leak now</strong><br>${esc(result.biggest_leak || '—')}</div>
          <div class="resultBlock"><strong>Fix next</strong><br>${esc(result.fix_next || result.fix || '—')}</div>
          <div class="resultBlock"><strong>Scaffold</strong><br>${esc(result.scaffold || '—')}</div>
          <div class="resultBlock"><strong>What good looks like</strong><br>${esc(result.model || '—')}</div>
        `;
      }
      renderHistory();
    } catch (err) {
      if (els.feedback) els.feedback.innerHTML = `<strong>Something went wrong.</strong><div class="tiny" style="margin-top:8px;">${esc(err.message || String(err))}</div>`;
    }
  }

  if (els.intro) els.intro.textContent = profile.learnerName ? `${profile.learnerName}, pick a subject, pick an area, and start. Early practice helps THE BROTHER find the real weaknesses.` : 'Pick a subject, pick an area, and start. Early practice helps THE BROTHER find the real weaknesses.';
  if (els.profileName) els.profileName.textContent = profile.learnerName || 'Learner';
  if (els.profileSummary) els.profileSummary.textContent = subjects.length ? subjects.map(s => subjectLabel(s.id)).join(', ') : 'No subjects chosen yet. Go back and use Learner setup.';

  renderSubjects();
  renderAreas();
  setContextUI();
  renderHistory();

  els.typeSelect?.addEventListener('change', () => { currentArea = els.typeSelect.value; currentQuestion = null; if (els.answer) els.answer.value = ''; if (els.practiceCard) els.practiceCard.classList.add('hidden'); if (els.answerCard) els.answerCard.classList.add('hidden'); if (els.feedback) els.feedback.classList.add('hidden'); renderAreas(); });
  els.saveContext?.addEventListener('click', saveContext);
  els.contextInput?.addEventListener('blur', saveContext);
  els.editSetup?.addEventListener('click', () => { window.location.href = 'index.html'; });
  els.diagnostic?.addEventListener('click', async () => { diagnosticMode = true; await generateQuestion(false); });
  els.generate?.addEventListener('click', async () => { diagnosticMode = false; await generateQuestion(false); });
  els.variant?.addEventListener('click', async () => { diagnosticMode = false; await generateQuestion(true); });
  els.mark?.addEventListener('click', markAnswer);
  els.clear?.addEventListener('click', () => { if (els.answer) els.answer.value = ''; });
});

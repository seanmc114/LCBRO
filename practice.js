document.addEventListener('DOMContentLoaded', () => {
  const subjectGrid = document.getElementById('subjectGrid');
  const practiceIntro = document.getElementById('practiceIntro');
  const practiceTypeSelect = document.getElementById('practiceTypeSelect');
  const practiceTypeHelp = document.getElementById('practiceTypeHelp');
  const difficultySelect = document.getElementById('difficultySelect');
  const courseContextInput = document.getElementById('courseContextInput');
  const generateBtn = document.getElementById('generateBtn');
  const newVariantBtn = document.getElementById('newVariantBtn');
  const practiceCard = document.getElementById('practiceCard');
  const answerCard = document.getElementById('answerCard');
  const answerEl = document.getElementById('practiceAnswer');
  const markBtn = document.getElementById('markBtn');
  const clearAnswerBtn = document.getElementById('clearAnswerBtn');
  const feedbackCard = document.getElementById('feedbackCard');
  const historyEl = document.getElementById('practiceHistory');

  const profile = window.getBrotherProfile();
  if (profile.learnerName) {
    practiceIntro.textContent = `${profile.learnerName}, this is short, authentic practice on the small bits that leak marks.`;
  }

  const selectedSubjects = window.getSelectedSubjects();
  let currentSubject = selectedSubjects[0]?.id || window.BROTHER_SUBJECTS[0].id;
  let currentQuestion = null;

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

  const CONTEXT_HINTS = {
    english_hl: { placeholder:'e.g. Hamlet, Hécuba, comparative mode, Plath', note:'Best for text names, poets, comparative pairings, or current class theme.' },
    irish_hl: { placeholder:'e.g. An Triail, Hurlamaboc, Colscaradh, poetry theme', note:'Useful for text names, poetry, or current grammar/text focus.' },
    biology_hl: { placeholder:'e.g. enzymes, photosynthesis, respiration, ecology', note:'Useful for chapter names, experiments, or current biology topic.' },
    spanish_ol: { placeholder:'e.g. mi instituto, vacaciones, familia, pasado', note:'Useful for topic areas or a tense/theme you want to target.' },
    maths_ol: { placeholder:'e.g. algebra, circles, percentages, trigonometry', note:'Useful for a current maths topic or chapter.' },
    pe_hl: { placeholder:'e.g. training methods, skill-related fitness, project', note:'Useful for chapter headings, fitness components, or project language.' },
    homeec_hl: { placeholder:'e.g. protein, vitamins, food hygiene, consumer studies', note:'Useful for nutrition, food studies, or current chapter.' }
  };

  buildSubjectButtons();
  buildPracticeOptions(currentSubject);
  applyContextHint(currentSubject);
  renderHistory();

  generateBtn.addEventListener('click', async () => await generateQuestion(false));
  newVariantBtn.addEventListener('click', async () => await generateQuestion(true));
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
        course_context: courseContextInput.value.trim()
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
        source: 'practice',
        leakCategory: result.leak_category || currentQuestion.leak_category || currentQuestion.practice_type,
        biggestLeak: result.biggest_leak || 'Needs tighter mechanics'
      });

      feedbackCard.innerHTML = `
        <h2 style="margin-top:0;">THE BROTHER</h2>
        <p>${escapeHtml(result.message || 'Good. Now tighten it.')}</p>
        <div class="scorePill">${score}/${max} · ${percent}%</div>
        <div class="resultBlock"><strong>What worked</strong><br>${escapeHtml(result.good || '—')}</div>
        <div class="resultBlock"><strong>Biggest leak now</strong><br>${escapeHtml(result.biggest_leak || '—')}</div>
        <div class="resultBlock"><strong>Fix next</strong><br>${escapeHtml(result.fix_next || '—')}</div>
        <div class="resultBlock"><strong>Scaffold</strong><br>${escapeHtml(result.scaffold || '—')}</div>
        <div class="resultBlock"><strong>Model</strong><br>${escapeHtml(result.model || '—')}</div>
      `;

      localStorage.setItem('brother_subject', currentSubject);
      localStorage.setItem('brother_question_type', currentQuestion.practice_type || 'general');
      localStorage.setItem('brother_fix', result.fix_next || result.biggest_leak || 'Tighten the mechanics');
      localStorage.setItem('brother_biggest_leak', result.biggest_leak || currentQuestion.leak_category || 'mechanics');
      renderHistory();
    } catch (err) {
      feedbackCard.innerHTML = `<h2 style="margin-top:0;">THE BROTHER</h2><p>Something went wrong while marking that answer.</p><p class="tiny">${escapeHtml(err.message || String(err))}</p>`;
    }
  });

  function buildSubjectButtons(){
    subjectGrid.innerHTML = selectedSubjects.map(sub => {
      return `<button class="subjectBtn" data-subject="${sub.id}" style="background:${sub.color};${sub.id.includes('spanish') ? 'color:black;' : ''}">${escapeHtml(sub.label)}</button>`;
    }).join('');
    subjectGrid.querySelectorAll('.subjectBtn').forEach(btn => {
      if (btn.dataset.subject === currentSubject) btn.classList.add('active');
      btn.addEventListener('click', () => {
        subjectGrid.querySelectorAll('.subjectBtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSubject = btn.dataset.subject;
        buildPracticeOptions(currentSubject);
        applyContextHint(currentSubject);
        resetQuestionView();
      });
    });
  }

  function buildPracticeOptions(subject){
    const list = PRACTICE_TYPES[subject] || [['general','General mechanics'],['definitions','Definitions / keywords'],['short_response','Short structured response'],['application','Application sentence']];
    practiceTypeSelect.innerHTML = list.map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
    practiceTypeHelp.textContent = 'Short, markable practice focused on the basics that leak marks first.';
  }

  function applyContextHint(subject){
    const hint = CONTEXT_HINTS[subject] || { placeholder:'e.g. current chapter, text, topic or weak area', note:'Useful for text names, topics, chapters, or the exact area to target.' };
    courseContextInput.placeholder = hint.placeholder;
    const tiny = courseContextInput.parentElement?.querySelector('.tiny');
    if (tiny) tiny.textContent = hint.note;
  }

  async function generateQuestion(variantOnly){
    const practiceType = practiceTypeSelect.value || 'general';
    const difficulty = difficultySelect.value || 'standard';
    const courseContext = courseContextInput.value.trim();

    practiceCard.classList.remove('hidden');
    practiceCard.innerHTML = 'Thinking…';
    answerCard.classList.add('hidden');
    feedbackCard.classList.add('hidden');
    feedbackCard.innerHTML = '';

    try {
      const result = await window.coachRequest({
        mode: 'practice_generate',
        subject: currentSubject,
        practice_type: practiceType,
        difficulty,
        variant_only: !!variantOnly,
        learner_name: profile.learnerName || '',
        course_context: courseContext
      });

      currentQuestion = result;
      practiceCard.innerHTML = `
        <div class="tiny"><strong>${escapeHtml(window.getSubjectLabel(currentSubject))}</strong> · ${escapeHtml(result.practice_type || practiceType)} · ${escapeHtml(result.difficulty || difficulty)}</div>
        <h3 style="margin-bottom:8px;">${escapeHtml(result.title || 'Practice question')}</h3>
        <div class="exampleBox">${escapeHtml(result.question || '—')}</div>
        <div class="resultBlock"><strong>What this is testing</strong><br>${escapeHtml(result.testing || 'Short accurate exam-style mechanics.')}</div>
        <div class="resultBlock"><strong>Marking lens</strong><br>${escapeHtml(result.marking_lens || 'Accuracy, relevance, exam style.')}</div>
        <div class="resultBlock"><strong>Must include</strong><ul>${(Array.isArray(result.must_include) ? result.must_include : []).map(x => `<li>${escapeHtml(String(x))}</li>`).join('')}</ul></div>
      `;
      answerCard.classList.remove('hidden');
      answerEl.value = '';
    } catch (err) {
      practiceCard.innerHTML = `<h3 style="margin-top:0;">Practice Mode</h3><p>Something went wrong while generating the question.</p><p class="tiny">${escapeHtml(err.message || String(err))}</p>`;
    }
  }

  function savePracticeAttempt(entry){
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;

    const progress = JSON.parse(localStorage.getItem('lc_progress') || '{}');
    if (!Array.isArray(progress[entry.subject])) progress[entry.subject] = [];
    progress[entry.subject].push({
      score: entry.percent,
      raw_score: entry.score,
      raw_max: entry.max,
      weighted_score: Math.round(entry.percent * 0.55),
      date: dateLabel,
      source: 'practice',
      practice_type: entry.type,
      title: entry.title
    });
    localStorage.setItem('lc_progress', JSON.stringify(progress));

    const attempts = JSON.parse(localStorage.getItem('lc_practice_attempts') || '[]');
    attempts.push({ ...entry, date: dateLabel, timestamp: Date.now() });
    localStorage.setItem('lc_practice_attempts', JSON.stringify(attempts));

    const leaks = JSON.parse(localStorage.getItem('lc_leaks') || '{}');
    if (!Array.isArray(leaks[entry.subject])) leaks[entry.subject] = [];
    leaks[entry.subject].push({ date: dateLabel, category: entry.leakCategory, detail: entry.biggestLeak, source: 'practice' });
    localStorage.setItem('lc_leaks', JSON.stringify(leaks));
  }

  function renderHistory(){
    const allowed = new Set(selectedSubjects.map(s => s.id));
    const attempts = JSON.parse(localStorage.getItem('lc_practice_attempts') || '[]').filter(a => allowed.has(a.subject));
    if (!attempts.length) {
      historyEl.innerHTML = `<div class="tiny">No practice attempts stored yet.</div>`;
      return;
    }
    historyEl.innerHTML = attempts.slice(-8).reverse().map(a => `<div class="historyRow"><strong>${escapeHtml(window.getSubjectLabel(a.subject))}</strong> · ${escapeHtml(a.title || a.type || 'Practice')}<span>${escapeHtml(a.date)} · ${escapeHtml(String(a.score))}/${escapeHtml(String(a.max))} · ${escapeHtml(String(a.percent))}%</span></div>`).join('');
  }

  function resetQuestionView(){
    currentQuestion = null;
    practiceCard.classList.add('hidden');
    answerCard.classList.add('hidden');
    feedbackCard.classList.add('hidden');
    feedbackCard.innerHTML = '';
    answerEl.value = '';
  }

  function escapeHtml(s){
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
});

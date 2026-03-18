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
    practiceIntro.textContent = `${profile.learnerName}, this is where the real day-to-day improvement happens. Results mainly confirm whether the picture is honest.`;
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
    english_hl: { placeholder:'Uses saved text names automatically. Add a theme, character or comparative mode here if useful.', note:'Saved English texts are pulled in from setup. Add a sharper focus here if needed.' },
    irish_hl: { placeholder:'Uses saved Irish text names automatically. Add a theme or grammar target here if useful.', note:'Saved Irish texts are pulled in from setup. Add a sharper focus here if needed.' },
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
        <div class="resultBlock"><strong>Fix next</strong><br>${escapeHtml(result.fix || '—')}</div>
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
        [...subjectGrid.querySelectorAll('.subjectBtn')].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildPracticeOptions(currentSubject);
        applyContextHint(currentSubject);
        practiceCard.classList.add('hidden');
        answerCard.classList.add('hidden');
        feedbackCard.classList.add('hidden');
      });
      subjectGrid.appendChild(btn);
    });
  }

  function buildPracticeOptions(subject){
    const opts = PRACTICE_TYPES[subject] || [['general','General mechanics']];
    practiceTypeSelect.innerHTML = opts.map(([v,l]) => `<option value="${v}">${escapeHtml(l)}</option>`).join('');
    practiceTypeHelp.textContent = 'Choose a short question family. Practice is the main engine here; results later confirm whether the picture is accurate.';
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

  function applyContextHint(subject){
    const hint = CONTEXT_HINTS[subject] || { placeholder:'Optional topic or chapter', note:'Optional.' };
    const saved = getSavedCourseContext(subject);
    courseContextInput.placeholder = hint.placeholder;
    courseContextInput.value = saved;
    const savedLine = saved ? ` Saved setup: ${saved}.` : '';
    document.getElementById('courseContextHelp').textContent = hint.note + savedLine;
  }

  async function generateQuestion(newVariant){
    const practiceType = practiceTypeSelect.value;
    const difficulty = difficultySelect.value;
    const courseContext = courseContextInput.value.trim();

    practiceCard.classList.remove('hidden');
    practiceCard.innerHTML = 'Thinking…';
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
      practiceCard.innerHTML = `
        <h2 style="margin-top:0;">${escapeHtml(window.getSubjectLabel(currentSubject))} · ${escapeHtml(practiceType)} · ${escapeHtml(difficulty)}</h2>
        <div class="resultBlock"><strong>${escapeHtml(result.title || 'Practice question')}</strong></div>
        <div class="resultBlock">${escapeHtml(result.question || '')}</div>
        <div class="resultBlock"><strong>What this is testing</strong><br>${escapeHtml(result.testing || '')}</div>
        <div class="resultBlock"><strong>Marking lens</strong><br>${escapeHtml(result.marking_lens || '')}</div>
        <div class="resultBlock"><strong>Must include</strong><br>${(result.must_include || []).map(escapeHtml).join(' · ')}</div>
      `;
      answerCard.classList.remove('hidden');
      answerEl.value = '';
      feedbackCard.classList.add('hidden');
    } catch (err) {
      practiceCard.innerHTML = `<strong>Something went wrong.</strong><div class="tiny" style="margin-top:8px;">${escapeHtml(err.message || String(err))}</div>`;
    }
  }

  function savePracticeAttempt(entry){
    const key = 'brother_attempts';
    const all = JSON.parse(localStorage.getItem(key) || '[]');
    all.push({ ...entry, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(all));
  }

  function renderHistory(){
    const all = JSON.parse(localStorage.getItem('brother_attempts') || '[]');
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

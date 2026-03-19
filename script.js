console.log('THE BROTHER ready');
function escapeHtml(str){return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
window.escapeHtml = escapeHtml;
function splitCsv(value){return String(value || '').split(',').map(x => x.trim()).filter(Boolean);}

document.addEventListener('DOMContentLoaded', () => {
  const profileCard = document.getElementById('profileCard');
  if (!profileCard) return;
  const profileSummary = document.getElementById('profileSummary');
  const setupCard = document.getElementById('setupCard');
  const learnerNameInput = document.getElementById('learnerNameInput');
  const subjectChecklist = document.getElementById('subjectChecklist');
  const editSetupBtn = document.getElementById('editSetupBtn');
  const resetDataBtn = document.getElementById('resetDataBtn');
  const saveSetupBtn = document.getElementById('saveSetupBtn');
  const cancelSetupBtn = document.getElementById('cancelSetupBtn');
  const fields = {
    engSingleText: document.getElementById('engSingleText'), engComp1: document.getElementById('engComp1'), engComp2: document.getElementById('engComp2'), engComp3: document.getElementById('engComp3'), engPoets: document.getElementById('engPoets'), engFocus: document.getElementById('engFocus'),
    irlPros: document.getElementById('irlPros'), irlDrama: document.getElementById('irlDrama'), irlFiliocht: document.getElementById('irlFiliocht'), irlFocus: document.getElementById('irlFocus')
  };

  buildChecklist();
  renderProfile();
  const profile = window.getBrotherProfile();
  if (!profile.learnerName || !profile.selectedSubjects.length) openSetup();
  editSetupBtn?.addEventListener('click', openSetup);
  cancelSetupBtn?.addEventListener('click', () => { const p = window.getBrotherProfile(); if (p.learnerName || p.selectedSubjects.length) closeSetup(); });
  resetDataBtn?.addEventListener('click', () => {
    if (!confirm('Reset stored learner setup, practice history, results history and leak tracking on this device?')) return;
    window.clearBrotherData();
    window.location.reload();
  });
  saveSetupBtn?.addEventListener('click', () => {
    const selectedSubjects = Array.from(subjectChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(x => x.value);
    if (!learnerNameInput.value.trim()) return alert('Enter a learner name first.');
    if (!selectedSubjects.length) return alert('Choose at least one subject.');
    const next = {
      learnerName: learnerNameInput.value.trim(),
      selectedSubjects,
      english: {
        singleText: fields.engSingleText.value.trim(),
        comparativeTexts: [fields.engComp1.value.trim(), fields.engComp2.value.trim(), fields.engComp3.value.trim()].filter(Boolean),
        poets: splitCsv(fields.engPoets.value),
        focus: fields.engFocus.value.trim()
      },
      irish: {
        pros: fields.irlPros.value.trim(),
        drama: fields.irlDrama.value.trim(),
        filiocht: fields.irlFiliocht.value.trim(),
        focus: fields.irlFocus.value.trim()
      }
    };
    window.saveBrotherProfile(next);
    renderProfile();
    closeSetup();
  });

  function buildChecklist(){
    subjectChecklist.innerHTML = window.BROTHER_SUBJECTS.map(sub => `<label class="checkItem"><input type="checkbox" value="${sub.id}"><span>${escapeHtml(sub.label)}</span></label>`).join('');
  }
  function renderProfile(){
    const p = window.getBrotherProfile();
    learnerNameInput.value = p.learnerName || '';
    subjectChecklist.querySelectorAll('input[type="checkbox"]').forEach(box => box.checked = (p.selectedSubjects || []).includes(box.value));
    fields.engSingleText.value = p.english?.singleText || '';
    fields.engComp1.value = p.english?.comparativeTexts?.[0] || '';
    fields.engComp2.value = p.english?.comparativeTexts?.[1] || '';
    fields.engComp3.value = p.english?.comparativeTexts?.[2] || '';
    fields.engPoets.value = (p.english?.poets || []).join(', ');
    fields.engFocus.value = p.english?.focus || '';
    fields.irlPros.value = p.irish?.pros || '';
    fields.irlDrama.value = p.irish?.drama || '';
    fields.irlFiliocht.value = p.irish?.filiocht || '';
    fields.irlFocus.value = p.irish?.focus || '';
    const name = p.learnerName ? escapeHtml(p.learnerName) : 'No learner saved yet';
    const subjects = p.selectedSubjects?.length ? p.selectedSubjects.map(id => escapeHtml(window.getSubjectLabel(id))).join(', ') : 'No subjects chosen yet';
    const engSummary = buildCourseSummary('English', p.english?.singleText, p.english?.comparativeTexts, p.english?.poets);
    const irSummary = buildCourseSummary('Irish', p.irish?.pros, [p.irish?.drama, p.irish?.filiocht].filter(Boolean), []);
    profileSummary.innerHTML = `<strong>${name}</strong><br><span class="tiny">${subjects}</span>${engSummary || irSummary ? `<div class="tiny" style="margin-top:8px;">${engSummary}${engSummary && irSummary ? ' · ' : ''}${irSummary}</div>` : ''}`;
  }
  function buildCourseSummary(label, first, others, extra){
    const items = [first, ...(others || []), ...(extra || [])].filter(Boolean);
    return items.length ? `${escapeHtml(label)}: ${escapeHtml(items.join(', '))}` : '';
  }
  function openSetup(){ setupCard.classList.remove('hidden'); setupCard.scrollIntoView({behavior:'smooth', block:'start'}); }
  function closeSetup(){ setupCard.classList.add('hidden'); }
});

console.log('THE BROTHER ready');

document.addEventListener('DOMContentLoaded', () => {
  const profileCard = document.getElementById('profileCard');
  const profileSummary = document.getElementById('profileSummary');
  const setupCard = document.getElementById('setupCard');
  const learnerNameInput = document.getElementById('learnerNameInput');
  const subjectChecklist = document.getElementById('subjectChecklist');
  const editSetupBtn = document.getElementById('editSetupBtn');
  const saveSetupBtn = document.getElementById('saveSetupBtn');
  const cancelSetupBtn = document.getElementById('cancelSetupBtn');

  buildChecklist();
  renderProfile();

  const hasProfile = (() => {
    const profile = window.getBrotherProfile();
    return profile.learnerName || profile.selectedSubjects.length;
  })();
  if (!hasProfile) openSetup();

  editSetupBtn?.addEventListener('click', openSetup);
  cancelSetupBtn?.addEventListener('click', () => {
    const profile = window.getBrotherProfile();
    if (profile.learnerName || profile.selectedSubjects.length) closeSetup();
  });

  saveSetupBtn?.addEventListener('click', () => {
    const selectedSubjects = Array.from(subjectChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(x => x.value);
    const learnerName = learnerNameInput.value.trim();
    window.saveBrotherProfile({ learnerName, selectedSubjects });
    renderProfile();
    closeSetup();
  });

  function buildChecklist(){
    subjectChecklist.innerHTML = window.BROTHER_SUBJECTS.map(sub => {
      return `<label class="checkItem"><input type="checkbox" value="${sub.id}"><span>${escapeHtml(sub.label)}</span></label>`;
    }).join('');
  }

  function renderProfile(){
    const profile = window.getBrotherProfile();
    learnerNameInput.value = profile.learnerName || '';
    const chosen = profile.selectedSubjects;
    subjectChecklist.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = chosen.includes(box.value);
    });

    const name = profile.learnerName ? escapeHtml(profile.learnerName) : 'No name saved yet';
    const subjects = chosen.length ? chosen.map(id => escapeHtml(window.getSubjectLabel(id))).join(', ') : 'No subjects chosen yet';
    profileSummary.innerHTML = `<strong>${name}</strong><br><span class="tiny">${subjects}</span>`;
  }

  function openSetup(){
    setupCard.classList.remove('hidden');
    profileCard.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function closeSetup(){
    setupCard.classList.add('hidden');
  }
});

function escapeHtml(str){
  return String(str)
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'",'&#039;');
}
window.escapeHtml = escapeHtml;

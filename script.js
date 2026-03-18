console.log("THE BROTHER ready");

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
window.escapeHtml = escapeHtml;

const PROFILE_KEY = "brother_profile";

function loadProfile(){
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveProfile(profile){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

window.loadBrotherProfile = loadProfile;
window.saveBrotherProfile = saveProfile;

function splitCsv(value){
  return String(value || "").split(",").map(x => x.trim()).filter(Boolean);
}

function initSetup(){
  const nameEl = document.getElementById("learnerName");
  if (!nameEl) return;

  const saveBtn = document.getElementById("saveProfileBtn");
  const statusEl = document.getElementById("profileStatus");
  const checks = [...document.querySelectorAll("#setupSubjects input[type='checkbox']")];
  const profile = loadProfile();

  const fields = {
    engSingleText: document.getElementById("engSingleText"),
    engComp1: document.getElementById("engComp1"),
    engComp2: document.getElementById("engComp2"),
    engComp3: document.getElementById("engComp3"),
    engPoets: document.getElementById("engPoets"),
    engThemes: document.getElementById("engThemes"),
    irlPros: document.getElementById("irlPros"),
    irlDrama: document.getElementById("irlDrama"),
    irlFiliocht: document.getElementById("irlFiliocht"),
    irlFocus: document.getElementById("irlFocus")
  };

  nameEl.value = profile.name || "";
  checks.forEach(c => { c.checked = Array.isArray(profile.subjects) && profile.subjects.includes(c.value); });

  const english = profile.english || {};
  const irish = profile.irish || {};
  fields.engSingleText.value = english.singleText || "";
  fields.engComp1.value = (english.comparativeTexts || [])[0] || "";
  fields.engComp2.value = (english.comparativeTexts || [])[1] || "";
  fields.engComp3.value = (english.comparativeTexts || [])[2] || "";
  fields.engPoets.value = (english.poets || []).join(", ");
  fields.engThemes.value = english.focus || "";
  fields.irlPros.value = irish.pros || "";
  fields.irlDrama.value = irish.drama || "";
  fields.irlFiliocht.value = irish.filiocht || "";
  fields.irlFocus.value = irish.focus || "";

  saveBtn?.addEventListener("click", () => {
    const next = {
      name: nameEl.value.trim(),
      subjects: checks.filter(c => c.checked).map(c => c.value),
      english: {
        singleText: fields.engSingleText.value.trim(),
        comparativeTexts: [fields.engComp1.value.trim(), fields.engComp2.value.trim(), fields.engComp3.value.trim()].filter(Boolean),
        poets: splitCsv(fields.engPoets.value),
        focus: fields.engThemes.value.trim()
      },
      irish: {
        pros: fields.irlPros.value.trim(),
        drama: fields.irlDrama.value.trim(),
        filiocht: fields.irlFiliocht.value.trim(),
        focus: fields.irlFocus.value.trim()
      }
    };
    saveProfile(next);
    statusEl.textContent = `Saved${next.name ? ` for ${next.name}` : ""}.`;
  });
}

document.addEventListener("DOMContentLoaded", initSetup);

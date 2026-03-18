(function(){
  const SUBJECTS = [
    { id:'accounting_hl', label:'Accounting HL', color:'#14B8A6' },
    { id:'accounting_ol', label:'Accounting OL', color:'#0F766E' },
    { id:'agricultural_science_hl', label:'Agricultural Science HL', color:'#65A30D' },
    { id:'agricultural_science_ol', label:'Agricultural Science OL', color:'#4D7C0F' },
    { id:'ancient_greek_hl', label:'Ancient Greek HL', color:'#8B5CF6' },
    { id:'applied_maths_hl', label:'Applied Maths HL', color:'#2563EB' },
    { id:'arabic_hl', label:'Arabic HL', color:'#22C55E' },
    { id:'arabic_ol', label:'Arabic OL', color:'#15803D' },
    { id:'art_hl', label:'Art HL', color:'#F97316' },
    { id:'art_ol', label:'Art OL', color:'#EA580C' },
    { id:'biology_hl', label:'Biology HL', color:'#0EA5E9' },
    { id:'biology_ol', label:'Biology OL', color:'#0284C7' },
    { id:'business_hl', label:'Business HL', color:'#10B981' },
    { id:'business_ol', label:'Business OL', color:'#059669' },
    { id:'chemistry_hl', label:'Chemistry HL', color:'#06B6D4' },
    { id:'chemistry_ol', label:'Chemistry OL', color:'#0891B2' },
    { id:'classical_studies_hl', label:'Classical Studies HL', color:'#A855F7' },
    { id:'classical_studies_ol', label:'Classical Studies OL', color:'#9333EA' },
    { id:'computer_science_hl', label:'Computer Science HL', color:'#6366F1' },
    { id:'construction_studies_hl', label:'Construction Studies HL', color:'#D97706' },
    { id:'construction_studies_ol', label:'Construction Studies OL', color:'#B45309' },
    { id:'dcg_hl', label:'DCG HL', color:'#F59E0B' },
    { id:'dcg_ol', label:'DCG OL', color:'#D97706' },
    { id:'economics_hl', label:'Economics HL', color:'#84CC16' },
    { id:'economics_ol', label:'Economics OL', color:'#65A30D' },
    { id:'english_hl', label:'English HL', color:'#7C3AED' },
    { id:'english_ol', label:'English OL', color:'#6D28D9' },
    { id:'french_hl', label:'French HL', color:'#2563EB' },
    { id:'french_ol', label:'French OL', color:'#1D4ED8' },
    { id:'geography_hl', label:'Geography HL', color:'#22C55E' },
    { id:'geography_ol', label:'Geography OL', color:'#16A34A' },
    { id:'german_hl', label:'German HL', color:'#374151' },
    { id:'german_ol', label:'German OL', color:'#1F2937' },
    { id:'history_hl', label:'History HL', color:'#92400E' },
    { id:'history_ol', label:'History OL', color:'#78350F' },
    { id:'homeec_hl', label:'Home Ec HL', color:'#EC4899' },
    { id:'homeec_ol', label:'Home Ec OL', color:'#DB2777' },
    { id:'irish_hl', label:'Irish HL', color:'#16A34A' },
    { id:'irish_ol', label:'Irish OL', color:'#15803D' },
    { id:'japanese_hl', label:'Japanese HL', color:'#EF4444' },
    { id:'japanese_ol', label:'Japanese OL', color:'#DC2626' },
    { id:'maths_hl', label:'Maths HL', color:'#1D4ED8' },
    { id:'maths_ol', label:'Maths OL', color:'#2563EB' },
    { id:'music_hl', label:'Music HL', color:'#A855F7' },
    { id:'music_ol', label:'Music OL', color:'#9333EA' },
    { id:'pe_hl', label:'P.E. HL', color:'#F97316' },
    { id:'physics_hl', label:'Physics HL', color:'#38BDF8' },
    { id:'physics_ol', label:'Physics OL', color:'#0EA5E9' },
    { id:'politics_society_hl', label:'Politics & Society HL', color:'#F43F5E' },
    { id:'religious_education_hl', label:'Religious Education HL', color:'#A16207' },
    { id:'religious_education_ol', label:'Religious Education OL', color:'#854D0E' },
    { id:'spanish_hl', label:'Spanish HL', color:'#FBBF24' },
    { id:'spanish_ol', label:'Spanish OL', color:'#FACC15' }
  ];

  const EMPTY_PROFILE = {
    learnerName:'',
    selectedSubjects:[],
    english:{ singleText:'', comparativeTexts:[], poets:[], focus:'' },
    irish:{ pros:'', drama:'', filiocht:'', focus:'' }
  };

  function unique(list){ return Array.from(new Set((Array.isArray(list) ? list : []).filter(Boolean))); }

  function normalizeProfile(raw){
    const p = raw && typeof raw === 'object' ? raw : {};
    return {
      learnerName: String(p.learnerName || '').trim(),
      selectedSubjects: unique((p.selectedSubjects || []).map(x => String(x).trim())),
      english: {
        singleText: String(p.english?.singleText || '').trim(),
        comparativeTexts: unique((p.english?.comparativeTexts || []).map(x => String(x).trim())),
        poets: unique((p.english?.poets || []).map(x => String(x).trim())),
        focus: String(p.english?.focus || '').trim()
      },
      irish: {
        pros: String(p.irish?.pros || '').trim(),
        drama: String(p.irish?.drama || '').trim(),
        filiocht: String(p.irish?.filiocht || '').trim(),
        focus: String(p.irish?.focus || '').trim()
      }
    };
  }

  function getBrotherProfile(){
    try { return normalizeProfile(JSON.parse(localStorage.getItem('brother_profile') || 'null') || EMPTY_PROFILE); }
    catch { return normalizeProfile(EMPTY_PROFILE); }
  }
  function saveBrotherProfile(profile){
    const clean = normalizeProfile(profile);
    localStorage.setItem('brother_profile', JSON.stringify(clean));
    return clean;
  }
  function getSelectedSubjectIds(){ return getBrotherProfile().selectedSubjects; }
  function getSelectedSubjects(){
    const ids = getSelectedSubjectIds();
    return ids.length ? SUBJECTS.filter(s => ids.includes(s.id)) : SUBJECTS;
  }
  function getSubjectLabel(id){ return (SUBJECTS.find(s => s.id === id) || {}).label || id || '—'; }
  function getSubjectColor(id){ return (SUBJECTS.find(s => s.id === id) || {}).color || '#2fa39a'; }

  window.BROTHER_SUBJECTS = SUBJECTS;
  window.getBrotherProfile = getBrotherProfile;
  window.saveBrotherProfile = saveBrotherProfile;
  window.getSelectedSubjectIds = getSelectedSubjectIds;
  window.getSelectedSubjects = getSelectedSubjects;
  window.getSubjectLabel = getSubjectLabel;
  window.getSubjectColor = getSubjectColor;
})();

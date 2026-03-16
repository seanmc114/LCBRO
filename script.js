// Basic shared script for THE BROTHER system

console.log("THE BROTHER ready");

// future modules (Spanish oral, drills etc.) will attach here

function escapeHtml(str){
  return String(str)
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");
}

window.escapeHtml = escapeHtml;

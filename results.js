const input = document.getElementById("resultsInput");
const button = document.getElementById("analyseBtn");
const out = document.getElementById("resultsOut");

button.addEventListener("click", async () => {

  const raw = input.value.trim();
  if (!raw) return;

  out.innerHTML = "Thinking...";

  try {

    const result = await window.coachRequest({
      mode: "results_coach",
      raw_results: raw
    });

    out.innerHTML = `
      <h2>THE BROTHER</h2>

      <p>${result.message}</p>

      <p><b>Biggest leak:</b> ${result.biggest_leak}</p>

      <p><b>Why:</b> ${result.why_it_matters}</p>

      <p><b>Fix first:</b> ${result.fix_first}</p>

      <p><b>Drills:</b></p>

      <ul>
        ${result.drills.map(d => `<li>${d}</li>`).join("")}
      </ul>
    `;

  } catch {

    out.innerHTML = "Something went wrong.";

  }

});

// File: src/modules/problem-solution-fit/logic.js

let currentStepIndex = 0;
let steps = [];
const contentEl = document.getElementById("content");

async function loadSteps() {
  const response = await fetch("steps.json");
  steps = await response.json();
  renderStep();
}

function renderStep() {
  const step = steps[currentStepIndex];
  if (!step) return;

  contentEl.innerHTML = `
    <section class="step">
      <h2>${step.title}</h2>
      <p>${step.question}</p>
      ${renderInput(step)}
      <button onclick="nextStep()">Next</button>
    </section>
  `;
}

function renderInput(step) {
  if (step.type === "radio") {
    return step.options.map((option, index) => `
      <label>
        <input type="radio" name="step-${step.id}" value="${index}" />
        ${option}
      </label>
    `).join("<br>");
  }
  if (step.type === "textarea") {
    return `<textarea id="textarea-${step.id}" placeholder="${step.placeholder || ''}"></textarea>`;
  }
  return "";
}

function nextStep() {
  const step = steps[currentStepIndex];
  let value;

  if (step.type === "radio") {
    const selected = document.querySelector(`input[name='step-${step.id}']:checked`);
    if (!selected) return alert("Please select an option");
    value = selected.value;
    const responseMessage = step.responseMap?.[value];
    if (responseMessage) alert(responseMessage);
  }

  if (step.type === "textarea") {
    const textarea = document.getElementById(`textarea-${step.id}`);
    if (!textarea.value.trim()) return alert("Please enter a response");
    value = textarea.value;
  }

  currentStepIndex++;
  if (currentStepIndex < steps.length) {
    renderStep();
  } else {
    renderSummary();
  }
}

function renderSummary() {
  contentEl.innerHTML = `
    <section class="summary">
      <h2>You're Done!</h2>
      <p>You've taken another step toward clarity and traction. Check your inbox for next steps.</p>
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", loadSteps);

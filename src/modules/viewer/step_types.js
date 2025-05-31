// Handles rendering of each step type in Easy-Kit SPA

export function renderStep(step, responses, nextStep, allSteps) {
  const container = document.getElementById("step-container");
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = step.title;
  container.appendChild(title);

  if (step.description) {
    const desc = document.createElement("p");
    desc.textContent = step.description;
    container.appendChild(desc);
  }

  if (step.type === "choice") {
    step.options.forEach(option => {
      const button = document.createElement("button");
      button.textContent = option.label;
      button.onclick = () => {
        responses[step.id] = option.value;
        nextStep();
      };
      container.appendChild(button);
    });
  } else if (step.type === "info") {
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue";
    continueBtn.onclick = nextStep;
    container.appendChild(continueBtn);

  } else if (step.type === "summary") {
    const summaryBlock = document.createElement("div");
    summaryBlock.className = "summary-block";

    step.include.forEach(id => {
      const answer = responses[id];
      const sourceStep = allSteps.find(s => s.id === id);

      const item = document.createElement("div");
      item.className = "summary-item";

      const label = document.createElement("strong");
      label.textContent = sourceStep ? sourceStep.title + ": " : id + ": ";

      const value = document.createElement("span");
      value.textContent = answer || "(no response)";

      item.appendChild(label);
      item.appendChild(value);
      summaryBlock.appendChild(item);
    });

    container.appendChild(summaryBlock);
  }
}

// Core input step types - no AI dependencies

export function renderChoiceStep(step, container, responses, nextStep) {
  step.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.label;
    button.onclick = () => {
      responses[step.id] = option.value;
      nextStep();
    };
    container.appendChild(button);
  });
}

export function renderInfoStep(step, container, responses, nextStep) {
  const label = document.createElement("label");
  label.textContent = step.description || "Please enter your response:";

  const input = document.createElement("input");
  input.type = "text";
  input.name = step.id;

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue";
  continueBtn.onclick = () => {
    const value = input.value.trim();
    if (value !== "") {
      responses[step.id] = value;
    }
    nextStep();
  };

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(continueBtn);
}

export function renderTextInputStep(step, container, responses, nextStep) {
  const label = document.createElement("label");
  label.textContent = step.label || "Enter your response:";

  const input = document.createElement("input");
  input.type = "text";
  input.name = step.id;
  input.placeholder = step.placeholder || "";

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue";
  continueBtn.onclick = () => {
    const value = input.value.trim();
    if (value !== "") {
      responses[step.id] = value;
    }
    nextStep();
  };

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(continueBtn);
}

export function renderLongTextStep(step, container, responses, nextStep) {
  const label = document.createElement("label");
  label.textContent = step.label || "Please provide detailed input:";

  const textarea = document.createElement("textarea");
  textarea.name = step.id;
  textarea.rows = 6;
  textarea.placeholder = step.placeholder || "";

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue";
  continueBtn.onclick = () => {
    const value = textarea.value.trim();
    if (value !== "") {
      responses[step.id] = value;
    }
    nextStep();
  };

  container.appendChild(label);
  container.appendChild(textarea);
  container.appendChild(continueBtn);
}

export function renderSummaryStep(step, container, responses, allSteps) {
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

export function renderFallbackStep(step, container) {
  const message = document.createElement("p");
  message.textContent = `Unsupported step type: "${step.type}"`;
  container.appendChild(message);
}
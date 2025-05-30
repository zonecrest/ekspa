// stepTypes.js
export function renderChoiceStep(step, container, responses, branding, goToStep, nextStep) {
  const form = document.createElement("form");

  step.options.forEach(opt => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = opt.value;

    label.appendChild(input);
    label.append(` ${opt.label}`);
    form.appendChild(label);
    form.appendChild(document.createElement("br"));
  });

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = branding.primaryCTA || "Next";
  form.appendChild(button);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selected = form.elements["choice"].value;
    responses[step.id] = selected;
    console.log(`Response saved: ${step.id} → ${selected}`);
    console.log("Current responses:", responses);

    if (step.next) {
      goToStep(step.next);
    } else {
      nextStep();
    }
  });

  container.appendChild(form);
}

export function renderFallbackStep(step, container, branding, nextStep, allowRetry, retryCountRef) {
  const fallback = document.createElement("textarea");
  fallback.rows = 4;
  fallback.cols = 40;
  container.appendChild(fallback);

  const button = document.createElement("button");
  button.textContent = branding.primaryCTA || "Next";
  button.addEventListener("click", () => {
    if (retryCountRef.value < 3 && allowRetry) {
      retryCountRef.value++;
    } else {
      retryCountRef.value = 0;
      nextStep();
    }
  });

  container.appendChild(document.createElement("br"));
  container.appendChild(button);
}

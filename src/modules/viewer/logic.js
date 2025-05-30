document.addEventListener("DOMContentLoaded", async () => {
  const contentContainer = document.getElementById("spa-container");
  if (!contentContainer) {
    console.error("Missing container: #spa-container not found in DOM.");
    return;
  }

  const query = new URLSearchParams(window.location.search);
  const kit = query.get("kit");
  const module = query.get("module");

  if (!kit || !module) {
    contentContainer.innerHTML = `<p>Error: Missing kit or module in query string.</p>`;
    return;
  }

  try {
    const [brandingRes, stepsRes] = await Promise.all([
      fetch("/_data/branding.json"),
      fetch(`/modules/${kit}/${module}/steps.json`)
    ]);

    if (!brandingRes.ok) throw new Error("Could not fetch branding.json");
    if (!stepsRes.ok) throw new Error("Could not fetch steps.json");

    const branding = await brandingRes.json();
    const steps = await stepsRes.json();

    const rootStyle = document.documentElement.style;
    if (branding.fontFamily) {
      rootStyle.setProperty("--font-family", branding.fontFamily);
      document.body.style.fontFamily = branding.fontFamily;
    }
    if (branding.primary1) rootStyle.setProperty("--primary1", branding.primary1);
    if (branding.primary2) rootStyle.setProperty("--primary2", branding.primary2);
    if (branding.accentColor) rootStyle.setProperty("--accent-color", branding.accentColor);

    let currentStepIndex = 0;
    let retryCount = 0;
    const maxRetries = 3;

    // ✅ Response storage
    const responses = {};

    function goToStep(stepId) {
      const newIndex = steps.findIndex(s => s.id === stepId);
      if (newIndex === -1) {
        contentContainer.innerHTML = `<p>Error: Unknown next step "${stepId}".</p>`;
      } else {
        currentStepIndex = newIndex;
        retryCount = 0;
        renderStep();
      }
    }

    function renderStep() {
      const step = steps[currentStepIndex];
      if (!step) {
        contentContainer.innerHTML = `<p>All done!</p>`;
        console.log("Final responses:", responses);
        return;
      }

      const wrapper = document.createElement("div");

      // ✅ Progress indicator
      const progress = document.createElement("div");
      progress.className = "progress";
      progress.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;
      wrapper.appendChild(progress);

      const title = document.createElement("h2");
      title.textContent = step.title || "Untitled Step";
      wrapper.appendChild(title);

      if (step.description) {
        const desc = document.createElement("p");
        desc.textContent = step.description;
        wrapper.appendChild(desc);
      }

      if (step.type === "choice" && Array.isArray(step.options)) {
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
            currentStepIndex++;
            renderStep();
          }
        });

        wrapper.appendChild(form);
      } else {
        const fallback = document.createElement("textarea");
        fallback.rows = 4;
        fallback.cols = 40;
        wrapper.appendChild(fallback);

        const button = document.createElement("button");
        button.textContent = branding.primaryCTA || "Next";
        button.addEventListener("click", () => {
          if (retryCount < maxRetries && step.allowRetry) {
            retryCount++;
          } else {
            currentStepIndex++;
            retryCount = 0;
          }
          renderStep();
        });

        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(button);
      }

      contentContainer.innerHTML = "";
      contentContainer.appendChild(wrapper);
    }

    renderStep();
  } catch (err) {
    contentContainer.innerHTML = `<p>Error loading resources: ${err.message}</p>`;
  }
});

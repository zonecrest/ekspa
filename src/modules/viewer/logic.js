import {
  renderChoiceStep,
  renderInfoStep,
  renderSummaryStep,
  renderFallbackStep,
  renderTextInputStep,
  renderLongTextStep,
  renderAiTutorSubmitStep
} from './step_types.js';

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
    const responses = {};
    const retryCountRef = { value: 0 };

    function goToStep(stepId) {
      const newIndex = steps.findIndex(s => s.id === stepId);
      if (newIndex === -1) {
        contentContainer.innerHTML = `<p>Error: Unknown next step "${stepId}".</p>`;
      } else {
        currentStepIndex = newIndex;
        retryCountRef.value = 0;
        renderStep();
      }
    }

    function nextStep() {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
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

      switch (step.type) {
        case "info":
          renderInfoStep(step, wrapper, responses, nextStep);
          break;
        case "choice":
          renderChoiceStep(step, wrapper, responses, nextStep);
          break;
        case "text_input":
          renderTextInputStep(step, wrapper, responses, nextStep);
          break;
        case "long_text":
          renderLongTextStep(step, wrapper, responses, nextStep);
          break;
        case "summary":
          renderSummaryStep(step, wrapper, responses, steps);
          break;
        case "ai_tutor_submit":
          renderAiTutorSubmitStep(step, wrapper, responses, kit, module);
          break;
        default:
          renderFallbackStep(step, wrapper);
          break;
      }

      contentContainer.innerHTML = "";
      contentContainer.appendChild(wrapper);
    }

    renderStep();
  } catch (err) {
    contentContainer.innerHTML = `<p>Error loading resources: ${err.message}</p>`;
  }
});
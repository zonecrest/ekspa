let step = 0;
function nextStep() {
  const steps = [
    "What problem does your customer face?",
    "Why is it urgent to solve now?",
    "How do you clearly describe your solution?"
  ];
  const container = document.getElementById("stepContainer");
  if (step < steps.length) {
    container.innerHTML = `<p>${steps[step]}</p>`;
    step++;
  } else {
    container.innerHTML = `<p>Well done! You've completed this quick pass.</p>`;
  }
}

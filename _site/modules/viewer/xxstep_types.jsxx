// Handles rendering of each step type in Easy-Kit SPA

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

export function renderAiTutorSubmitStep(step, container, responses, kit, module) {
  const submitBtn = document.createElement("button");
  submitBtn.textContent = step.buttonText || "Start AI Tutor Session";
  submitBtn.className = "submit-button";
  
  // Loading state
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.style.display = "none";
  loadingDiv.textContent = "Starting your AI tutor session...";
  
  // Results container
  const resultsDiv = document.createElement("div");
  resultsDiv.className = "ai-tutor-results";
  resultsDiv.style.display = "none";

  submitBtn.onclick = async () => {
    submitBtn.disabled = true;
    loadingDiv.style.display = "block";
    
    try {
      const payload = {
        kit: kit,
        module: module,
        responses: responses,
        sessionType: "ai_tutor",
        topic: step.topic || module,
        timestamp: new Date().toISOString()
      };

      const webhookUrl = step.webhookUrl;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        // Handle non-JSON response (like "Accepted")
        result = { success: true, message: "Webhook received but no JSON response" };
      }
      
      loadingDiv.style.display = "none";
      resultsDiv.style.display = "block";
      
      // Display AI tutor session results
      displayTutorResults(result, resultsDiv);
      
    } catch (error) {
      loadingDiv.style.display = "none";
      resultsDiv.innerHTML = `<div class="error">Error: ${error.message}. Please try again.</div>`;
      resultsDiv.style.display = "block";
      submitBtn.disabled = false;
    }
  };

  container.appendChild(submitBtn);
  container.appendChild(loadingDiv);
  container.appendChild(resultsDiv);
}

function displayTutorResults(result, container) {
  container.innerHTML = '';
  
  const title = document.createElement("h3");
  title.textContent = "AI Tutor Session Results";
  container.appendChild(title);

  // Display each question/feedback pair
  if (result.questions && Array.isArray(result.questions)) {
    result.questions.forEach((q, index) => {
      const questionBlock = document.createElement("div");
      questionBlock.className = "tutor-question-block";
      
      const questionTitle = document.createElement("h4");
      questionTitle.textContent = `Question ${index + 1}`;
      questionBlock.appendChild(questionTitle);
      
      const question = document.createElement("p");
      question.className = "tutor-question";
      question.textContent = q.question;
      questionBlock.appendChild(question);
      
      const feedback = document.createElement("p");
      feedback.className = "tutor-feedback";
      feedback.textContent = q.feedback;
      questionBlock.appendChild(feedback);
      
      container.appendChild(questionBlock);
    });
  }

  // Display summary insights
  if (result.summary) {
    const summaryDiv = document.createElement("div");
    summaryDiv.className = "tutor-summary";
    
    const summaryTitle = document.createElement("h4");
    summaryTitle.textContent = "Key Insights";
    summaryDiv.appendChild(summaryTitle);
    
    const summaryText = document.createElement("p");
    summaryText.textContent = result.summary;
    summaryDiv.appendChild(summaryText);
    
    container.appendChild(summaryDiv);
  }
}

export function renderAiAssessmentSubmitStep(step, container, responses, kit, module) {
  // Validate required fields
  if (!step.webhookUrl) {
    container.innerHTML = '<div class="error">Configuration error: Missing webhook URL</div>';
    return;
  }

  // Validate required responses for assessment
  const missingFields = [];
  if (step.requiredFields) {
    step.requiredFields.forEach(field => {
      if (!responses[field] || responses[field].trim() === "") {
        missingFields.push(field);
      }
    });
  }

  if (missingFields.length > 0) {
    container.innerHTML = `<div class="error">Please complete all required fields: ${missingFields.join(', ')}</div>`;
    return;
  }

  const submitBtn = document.createElement("button");
  submitBtn.textContent = step.buttonText || "Take Assessment";
  submitBtn.className = "submit-button";
  
  // Loading state
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.style.display = "none";
  loadingDiv.textContent = "Processing your assessment...";
  
  // Results container
  const resultsDiv = document.createElement("div");
  resultsDiv.className = "ai-assessment-results";
  resultsDiv.style.display = "none";

  submitBtn.onclick = async () => {
    submitBtn.disabled = true;
    loadingDiv.style.display = "block";
    
    try {
      const payload = {
        kit: kit,
        module: module,
        responses: responses,
        sessionType: "ai_assessment",
        topic: step.topic || module,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(step.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Invalid response format from server");
      }

      // Validate response structure
      if (!result.success) {
        throw new Error(result.error || "Assessment processing failed");
      }
      
      loadingDiv.style.display = "none";
      resultsDiv.style.display = "block";
      
      // Display assessment results
      displayAssessmentResults(result, resultsDiv);
      
    } catch (error) {
      loadingDiv.style.display = "none";
      resultsDiv.innerHTML = `<div class="error">Error: ${error.message}. Please try again.</div>`;
      resultsDiv.style.display = "block";
      submitBtn.disabled = false;
    }
  };

  container.appendChild(submitBtn);
  container.appendChild(loadingDiv);
  container.appendChild(resultsDiv);
}

function displayAssessmentResults(result, container) {
  container.innerHTML = '';
  
  const title = document.createElement("h3");
  title.textContent = "Assessment Results";
  container.appendChild(title);

  // Display score if available
  if (result.score !== undefined) {
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "assessment-score";
    
    const scoreTitle = document.createElement("h4");
    scoreTitle.textContent = "Your Score";
    scoreDiv.appendChild(scoreTitle);
    
    const scoreText = document.createElement("p");
    scoreText.className = "score-display";
    scoreText.textContent = `${result.score}%`;
    scoreDiv.appendChild(scoreText);
    
    container.appendChild(scoreDiv);
  }

  // Display quiz questions and answers
  if (result.questions && Array.isArray(result.questions)) {
    result.questions.forEach((q, index) => {
      const questionBlock = document.createElement("div");
      questionBlock.className = "assessment-question-block";
      
      const questionTitle = document.createElement("h4");
      questionTitle.textContent = `Question ${index + 1}`;
      questionBlock.appendChild(questionTitle);
      
      const question = document.createElement("p");
      question.className = "assessment-question";
      question.textContent = q.question;
      questionBlock.appendChild(question);
      
      const userAnswer = document.createElement("p");
      userAnswer.className = "user-answer";
      userAnswer.innerHTML = `<strong>Your Answer:</strong> ${q.userAnswer}`;
      questionBlock.appendChild(userAnswer);
      
      const feedback = document.createElement("p");
      feedback.className = "assessment-feedback";
      feedback.innerHTML = `<strong>Feedback:</strong> ${q.feedback}`;
      questionBlock.appendChild(feedback);
      
      container.appendChild(questionBlock);
    });
  }

  // Display overall feedback
  if (result.overallFeedback) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "overall-feedback";
    
    const feedbackTitle = document.createElement("h4");
    feedbackTitle.textContent = "Overall Feedback";
    feedbackDiv.appendChild(feedbackTitle);
    
    const feedbackText = document.createElement("p");
    feedbackText.textContent = result.overallFeedback;
    feedbackDiv.appendChild(feedbackText);
    
    container.appendChild(feedbackDiv);
  }

  // Display recommendations
  if (result.recommendations) {
    const recDiv = document.createElement("div");
    recDiv.className = "recommendations";
    
    const recTitle = document.createElement("h4");
    recTitle.textContent = "Recommendations";
    recDiv.appendChild(recTitle);
    
    const recText = document.createElement("p");
    recText.textContent = result.recommendations;
    recDiv.appendChild(recText);
    
    container.appendChild(recDiv);
  }
}

export function renderAiResourceSubmitStep(step, container, responses, kit, module) {
  const submitBtn = document.createElement("button");
  submitBtn.textContent = step.buttonText || "Generate Resource";
  submitBtn.className = "submit-button";
  
  // Loading state
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.style.display = "none";
  loadingDiv.textContent = "Generating your custom resource...";
  
  // Results container
  const resultsDiv = document.createElement("div");
  resultsDiv.className = "ai-resource-results";
  resultsDiv.style.display = "none";

  submitBtn.onclick = async () => {
    submitBtn.disabled = true;
    loadingDiv.style.display = "block";
    
    try {
      const payload = {
        kit: kit,
        module: module,
        responses: responses,
        sessionType: "ai_resource",
        topic: step.topic || module,
        resourceType: step.resourceType || "guide",
        timestamp: new Date().toISOString()
      };

      const response = await fetch(step.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Invalid response format from server");
      }

      if (!result.success) {
        throw new Error(result.error || "Resource generation failed");
      }
      
      loadingDiv.style.display = "none";
      resultsDiv.style.display = "block";
      
      // Display generated resource
      displayResourceResults(result, resultsDiv);
      
    } catch (error) {
      loadingDiv.style.display = "none";
      resultsDiv.innerHTML = `<div class="error">Error: ${error.message}. Please try again.</div>`;
      resultsDiv.style.display = "block";
      submitBtn.disabled = false;
    }
  };

  container.appendChild(submitBtn);
  container.appendChild(loadingDiv);
  container.appendChild(resultsDiv);
}

function displayResourceResults(result, container) {
  container.innerHTML = '';
  
  const title = document.createElement("h3");
  title.textContent = result.title || "Your Generated Resource";
  container.appendChild(title);

  // Action buttons container
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "resource-actions";
  
  // Save as HTML button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save as HTML File";
  saveBtn.className = "action-button";
  saveBtn.onclick = () => saveAsHTML(result);
  actionsDiv.appendChild(saveBtn);
  
  // Print button
  const printBtn = document.createElement("button");
  printBtn.textContent = "Print";
  printBtn.className = "action-button";
  printBtn.onclick = () => printResource(result);
  actionsDiv.appendChild(printBtn);
  
  container.appendChild(actionsDiv);

  // Display content immediately
  const contentDiv = document.createElement("div");
  contentDiv.className = "generated-content";
  
  if (result.htmlContent) {
    contentDiv.innerHTML = result.htmlContent;
  } else if (result.sections && Array.isArray(result.sections)) {
    // Display sections
    result.sections.forEach(section => {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "content-section";
      
      const sectionTitle = document.createElement("h4");
      sectionTitle.textContent = section.title;
      sectionDiv.appendChild(sectionTitle);
      
      const sectionContent = document.createElement("div");
      sectionContent.innerHTML = section.content;
      sectionDiv.appendChild(sectionContent);
      
      contentDiv.appendChild(sectionDiv);
    });
  } else {
    contentDiv.innerHTML = "<p>Resource generated successfully, but no content to display.</p>";
  }
  
  container.appendChild(contentDiv);
}

function saveAsHTML(result) {
  const htmlContent = generateFullHTML(result);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename || 'generated-resource.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printResource(result) {
  const htmlContent = generateFullHTML(result);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}

function generateFullHTML(result) {
  let content = '';
  
  if (result.htmlContent) {
    content = result.htmlContent;
  } else if (result.sections && Array.isArray(result.sections)) {
    content = result.sections.map(section => 
      `<div class="section">
        <h2>${section.title}</h2>
        <div class="section-content">${section.content}</div>
      </div>`
    ).join('');
  }
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.title || 'Generated Resource'}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6; 
        }
        .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid; 
        }
        .section h2 { 
            color: #333; 
            border-bottom: 2px solid #eee; 
            padding-bottom: 10px; 
        }
        .section-content { 
            margin-top: 15px; 
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <h1>${result.title || 'Generated Resource'}</h1>
    <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
    ${content}
</body>
</html>`;
}

export function renderFallbackStep(step, container) {
  const message = document.createElement("p");
  message.textContent = `Unsupported step type: "${step.type}"`;
  container.appendChild(message);
}
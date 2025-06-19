// AI Assessment step type and related functions

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
      if (result.success === false) {
        throw new Error(result.error || "Assessment processing failed");
      }
      
      // If no success field but has content, assume it worked
      if (result.success === undefined && !result.score && !result.questions) {
        throw new Error("No assessment results received from server");
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
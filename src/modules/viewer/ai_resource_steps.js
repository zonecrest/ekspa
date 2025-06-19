// AI Resource Generation step type and related functions

export function renderAiResourceSubmitStep(step, container, responses, kit, module) {
  // Validate required fields
  if (!step.webhookUrl) {
    container.innerHTML = '<div class="error">Configuration error: Missing webhook URL</div>';
    return;
  }

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

      // Check if result has success field, if not assume success if title exists
      if (result.success === false) {
        throw new Error(result.error || "Resource generation failed");
      }
      
      // If no success field but has content, assume it worked
      if (result.success === undefined && !result.title && !result.sections) {
        throw new Error("No content received from server");
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
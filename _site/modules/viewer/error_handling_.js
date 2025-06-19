// Shared error handling utilities for all AI interaction types

export class InteractionError extends Error {
  constructor(message, type = 'GENERAL_ERROR', details = null) {
    super(message);
    this.name = 'InteractionError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  CONFIG_ERROR: 'CONFIG_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR', 
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RESPONSE_ERROR: 'RESPONSE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

export function validateStepConfig(step, requiredFields = ['webhookUrl']) {
  const missing = requiredFields.filter(field => !step[field]);
  if (missing.length > 0) {
    throw new InteractionError(
      `Configuration error: Missing required fields: ${missing.join(', ')}`,
      ErrorTypes.CONFIG_ERROR,
      { missingFields: missing }
    );
  }
}

export function validateRequiredResponses(responses, requiredFields = []) {
  if (!requiredFields || requiredFields.length === 0) return;
  
  const missing = requiredFields.filter(field => 
    !responses[field] || responses[field].toString().trim() === ""
  );
  
  if (missing.length > 0) {
    throw new InteractionError(
      `Please complete all required fields: ${missing.join(', ')}`,
      ErrorTypes.VALIDATION_ERROR,
      { missingFields: missing }
    );
  }
}

export async function makeWebhookCall(webhookUrl, payload, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new InteractionError(
        `Server returned error: ${response.status} ${response.statusText}`,
        ErrorTypes.SERVER_ERROR,
        { 
          status: response.status,
          statusText: response.statusText,
          url: webhookUrl 
        }
      );
    }
    
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new InteractionError(
        'Request timed out. Please try again.',
        ErrorTypes.TIMEOUT_ERROR,
        { timeoutMs, url: webhookUrl }
      );
    }
    
    if (error instanceof InteractionError) {
      throw error;
    }
    
    throw new InteractionError(
      'Network error. Please check your connection and try again.',
      ErrorTypes.NETWORK_ERROR,
      { originalError: error.message, url: webhookUrl }
    );
  }
}

export function parseWebhookResponse(response, expectedFields = []) {
  let result;
  
  try {
    result = response;
  } catch (e) {
    throw new InteractionError(
      'Invalid response format from server',
      ErrorTypes.RESPONSE_ERROR,
      { parseError: e.message }
    );
  }
  
  // Check for server-reported errors
  if (result.success === false) {
    throw new InteractionError(
      result.error || 'Server processing failed',
      ErrorTypes.SERVER_ERROR,
      { serverDetails: result.details }
    );
  }
  
  // Validate expected fields are present
  if (expectedFields.length > 0) {
    const missing = expectedFields.filter(field => result[field] === undefined);
    if (missing.length > 0 && result.success === undefined) {
      throw new InteractionError(
        'Incomplete response from server',
        ErrorTypes.RESPONSE_ERROR,
        { missingFields: missing }
      );
    }
  }
  
  return result;
}

export function displayError(error, container) {
  let errorMessage = error.message || 'An unknown error occurred';
  let errorClass = 'error';
  
  // Customize error display based on type
  switch (error.type) {
    case ErrorTypes.CONFIG_ERROR:
      errorClass = 'error config-error';
      break;
    case ErrorTypes.VALIDATION_ERROR:
      errorClass = 'error validation-error';
      break;
    case ErrorTypes.TIMEOUT_ERROR:
      errorMessage += ' The server may be busy - please wait a moment and try again.';
      break;
    case ErrorTypes.NETWORK_ERROR:
      errorMessage += ' Please check your internet connection.';
      break;
  }
  
  container.innerHTML = `
    <div class="${errorClass}">
      <strong>Error:</strong> ${errorMessage}
      ${error.details ? `<details><summary>Technical Details</summary><pre>${JSON.stringify(error.details, null, 2)}</pre></details>` : ''}
    </div>
  `;
}

export function logError(error, context = {}) {
  console.error('Interaction Error:', {
    message: error.message,
    type: error.type,
    details: error.details,
    timestamp: error.timestamp,
    context: context
  });
  
  // Optional: Send to error tracking service
  // if (window.errorTracker) {
  //   window.errorTracker.captureError(error, context);
  // }
}
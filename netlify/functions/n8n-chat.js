// netlify/functions/n8n-chat.js
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, userId, usageType = 'token' } = JSON.parse(event.body);
    
    if (!message || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message and userId are required' })
      };
    }

    // In a real implementation, you'd use a database
    // For demo purposes, we'll simulate user data in memory
    const userData = await getUserData(userId);
    
    // Check usage limits based on type
    if (usageType === 'token' && userData.tokensLeft <= 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          error: 'No tokens remaining',
          tokensLeft: 0,
          usageType: usageType
        })
      };
    }

    if (usageType === 'attempt' && userData.attemptsLeft <= 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          error: 'No attempts remaining',
          attemptsLeft: 0,
          usageType: usageType
        })
      };
    }

    // Call n8n webhook
    const n8nResponse = await callN8nWorkflow(message, userId, usageType);
    
    // Deduct usage based on type
    if (usageType === 'token') {
      userData.tokensLeft -= 1;
    } else if (usageType === 'attempt') {
      userData.attemptsLeft -= 1;
    }
    // No deduction for 'unlimited' type
    
    await updateUserData(userId, userData);

    // Build response based on usage type
    const response = {
      response: n8nResponse.output,
      usageType: usageType
    };
    
    if (usageType === 'token') {
      response.tokensLeft = userData.tokensLeft;
    } else if (usageType === 'attempt') {
      response.attemptsLeft = userData.attemptsLeft;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Simulate calling n8n workflow
async function callN8nWorkflow(message, userId, usageType = 'token') {
  // Replace with your actual n8n webhook URL
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://zonecrest.app.n8n.cloud/webhook-test/chat-demo';
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userId: userId,
        usageType: usageType,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('n8n call failed:', error);
    
    // Fallback response for demo purposes
    return {
      output: generateMockResponse(message)
    };
  }
}

// Mock response generator for demo/testing
function generateMockResponse(message) {
  const responses = [
    `I understand you're asking about "${message}". This is a demo response from the chat system.`,
    `That's an interesting question about "${message}". In a real implementation, this would be processed by your n8n automation.`,
    `Thanks for your message: "${message}". The AI would normally provide a more detailed response here.`,
    `I've received your input: "${message}". This demonstrates the token-based usage system working correctly.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Simulate user data storage (replace with real database)
const userDataStore = new Map();

async function getUserData(userId) {
  if (!userDataStore.has(userId)) {
    // New user defaults - could be configured per user type
    userDataStore.set(userId, {
      tokensLeft: 50,
      attemptsLeft: 10,
      maxAttempts: 10,
      // Usage type flags could be set here based on user subscription/type
      usageType: 'token', // 'token', 'attempt', or 'unlimited'
      createdAt: new Date().toISOString()
    });
  }
  
  return userDataStore.get(userId);
}

async function updateUserData(userId, data) {
  userDataStore.set(userId, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  
  // In a real app, you'd save to database here
  // await database.updateUser(userId, data);
}
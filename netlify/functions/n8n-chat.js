// netlify/functions/n8n-chat.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, userId, usageType } = JSON.parse(event.body);
    
    if (!message || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message and userId are required' })
      };
    }

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://zonecrest.app.n8n.cloud/webhook-test/chat-demo';
    
    // Just pass everything to n8n - no frontend logic
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
    
    // Return exactly what n8n sends
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to reach n8n',
        details: error.message 
      })
    };
  }
};
# Chat Interface Setup Instructions

## Overview
This prototype creates a token-metered chat interface that integrates with your existing Eleventy site and uses n8n for backend processing.

## Files Created

### 1. Frontend (Eleventy Page)
- **File**: `src/chat.html`
- **Purpose**: Interactive chat interface with Alpine.js
- **Features**: 
  - Real-time token/attempt counters
  - Message history
  - Error handling
  - Responsive design

### 2. Backend (Netlify Function)
- **File**: `netlify/functions/n8n-chat.js`
- **Purpose**: Middleware between frontend and n8n
- **Features**:
  - Token/attempt validation
  - Usage deduction
  - n8n webhook calls
  - Fallback responses

### 3. n8n Workflow
- **File**: Import the JSON into your n8n instance
- **Purpose**: Process chat messages
- **Features**:
  - Webhook trigger
  - Message processing
  - Structured responses

## Setup Steps

### Step 1: Add Files to Your Project

1. Copy `src/chat.html` to your Eleventy `src` folder
2. Create `netlify/functions/` directory and add `n8n-chat.js`
3. Import the workflow JSON into your n8n instance

### Step 2: Environment Variables

Add to your Netlify environment variables:
```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-demo
```

### Step 3: Update package.json

Add to your existing `package.json` scripts:
```json
{
  "scripts": {
    "dev": "eleventy --serve",
    "build": "eleventy",
    "deploy": "netlify deploy --prod"
  }
}
```

### Step 4: Deploy

1. Build your Eleventy site: `npm run build`
2. Deploy to Netlify: `npm run deploy`
3. Or use Netlify's Git integration for automatic deployments

## Configuration Options

### Token Management
Modify the default values in `netlify/functions/n8n-chat.js`:

```javascript
// New user defaults
userDataStore.set(userId, {
  tokensLeft: 50,        // Change default token count
  attemptsLeft: 10,      // Change default attempts
  maxAttempts: 10,       // Change max attempts per session
  createdAt: new Date().toISOString()
});
```

### n8n Workflow Customization
The workflow can be extended to:
- Integrate with OpenAI/Claude APIs
- Connect to databases
- Add complex business logic
- Integrate with external services

### Frontend Customization
The chat interface supports:
- Custom styling via CSS
- Additional usage metrics
- Different message types
- Enhanced error handling

## Testing

1. **Local Development**:
   - Run `npm start` for Eleventy dev server
   - Use Netlify CLI for function testing: `netlify dev`

2. **n8n Testing**:
   - Test webhook directly with curl or Postman
   - Use n8n's built-in testing tools

3. **End-to-End**:
   - Visit `/chat.html` on your deployed site
   - Send test messages
   - Verify token deduction

## Production Considerations

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Add user login/registration
3. **Payment Integration**: Connect to Stripe for token purchases
4. **Rate Limiting**: Add additional abuse protection
5. **Monitoring**: Add logging and analytics
6. **Scaling**: Consider Redis for session management

## Next Steps

1. Test the basic flow works
2. Customize the n8n workflow for your use case
3. Style the chat interface to match your branding
4. Add real database persistence
5. Implement payment flow for token purchases

The prototype provides a solid foundation that can be enhanced based on your specific requirements!
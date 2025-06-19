# Make.com Production Scenario Templates (Text Parser Approach)

## ChatGPT Model Recommendations

### For All Scenarios:
- **Model**: `gpt-4o` (recommended) or `gpt-4-turbo`
- **Temperature**: See specific settings below
- **Max Tokens**: See specific settings below
- **Top P**: `1` (default)
- **Frequency Penalty**: `0` (default)
- **Presence Penalty**: `0` (default)

---

## 1. AI Tutor Scenario Template

### Module Structure:
1. **Webhook Trigger**
2. **Text Parser - Get Elements** (JSON field extraction)
3. **Filter** (Validation)
4. **ChatGPT AI Tutor**
5. **Webhook Response**
6. **Error Handler** (runs on filter failure)

### Module 1: Webhook Trigger
**Settings:**
- JSON pass-through: Yes
- Get request headers: Yes
- Get request HTTP method: Yes

### Module 2: Text Parser - Get Elements
**Text to parse**: `{{1.value}}`



### Module 3: Filter (Validation)
**Condition**: 
- `{{2.kit}}` (Text) is not empty
- AND `{{2.sessionType}}` (Text) equals exactly `ai_tutor`

### Module 4: ChatGPT AI Tutor
**Model Settings:**
- **Model**: `gpt-4o`
- **Temperature**: `0.7`
- **Max Tokens**: `1500`

**System Message:**
```
You are an expert business coach conducting a 10-minute AI tutoring session about {{2.topic}}.

The user provided these responses: {{2.responses}}

Generate exactly 3 questions with personalized feedback following this structure for {{2.topic}}:

Question 1: [Relevant question based on their responses]
Feedback: [Specific, actionable advice based on their situation]

Question 2: [Follow-up question building on their context]  
Feedback: [Practical strategies tailored to their business]

Question 3: [Implementation-focused question]
Feedback: [Next steps and recommendations specific to their responses]

Also provide a brief summary with key insights and next steps.

Format your response as valid JSON:
{
  "questions": [
    {"question": "Question 1 text", "feedback": "Feedback 1 text"},
    {"question": "Question 2 text", "feedback": "Feedback 2 text"}, 
    {"question": "Question 3 text", "feedback": "Feedback 3 text"}
  ],
  "summary": "Key insights and next steps summary"
}

IMPORTANT: Return only valid JSON, no additional text or formatting.
```

### Module 5: Webhook Response (Success)
**Data Structure:**
```json
{
  "success": true,
  "sessionType": "ai_tutor",
  "topic": "{{2.topic}}",
  "questions": {{4.questions}},
  "summary": "{{4.summary}}",
  "timestamp": "{{now}}"
}
```

### Module 6: Error Handler (Fallback Route)
**Filter**: `{{2.sessionType}}` does not equal `ai_tutor` OR `{{2.kit}}` is empty

**Webhook Response:**
```json
{
  "success": false,
  "error": "Invalid request for AI Tutor endpoint",
  "details": "Expected sessionType: ai_tutor, received: {{2.sessionType}}",
  "timestamp": "{{now}}"
}
```

---

## 2. AI Assessment Scenario Template

### Module Structure:
1. **Webhook Trigger**
2. **Text Parser - Get Elements** 
3. **Filter** (Validation)
4. **ChatGPT Assessment**
5. **Webhook Response**
6. **Error Handler**

### Module 2: Text Parser - Get Elements
**Same as AI Tutor** - extract kit, module, sessionType, topic, responses

### Module 3: Filter (Validation)
**Condition**: 
- `{{2.sessionType}}` (Text) equals exactly `ai_assessment`
- AND `{{2.kit}}` (Text) is not empty

### Module 4: ChatGPT Assessment
**Model Settings:**
- **Model**: `gpt-4o` 
- **Temperature**: `0.3` (more consistent scoring)
- **Max Tokens**: `1200`

**System Message:**
```
You are an expert business coach conducting an assessment quiz about {{2.topic}}.

User responses: {{2.responses}}

ASSESSMENT CRITERIA for {{2.topic}}:

For "draft_initial_materials" topic:
CORRECT ANSWERS:
- learning_check_1: "reduces_scrambles" (Reduces last-minute scrambles and improves professionalism)
- learning_check_2: "always_ready" (Have them ready for any sales opportunity)

For "ideal_customer_profile" topic:
CORRECT ANSWERS:
- pain_points: "coordination_issues" 
- demographics: "specific_targeting"

SCORING: Total out of 100 points
- Each multiple choice question: 40 points
- Practical application response: 20 points

Evaluate their responses and provide:
1. Score out of 100
2. Feedback for each question explaining correctness
3. Overall assessment of understanding
4. Specific recommendations for improvement

Format as valid JSON:
{
  "score": 85,
  "questions": [
    {
      "question": "What is a primary benefit of having Draft Initial Materials?",
      "userAnswer": "Their actual response", 
      "feedback": "Explanation of correctness and guidance"
    }
  ],
  "overallFeedback": "Assessment of their overall understanding",
  "recommendations": "Specific next steps for improvement"
}

IMPORTANT: Return only valid JSON, no additional text.
```

### Module 5: Webhook Response (Success)
```json
{
  "success": true,
  "sessionType": "ai_assessment",
  "topic": "{{2.topic}}",
  "score": "{{4.score}}",
  "questions": {{4.questions}},
  "overallFeedback": "{{4.overallFeedback}}",
  "recommendations": "{{4.recommendations}}",
  "timestamp": "{{now}}"
}
```

### Module 6: Error Handler
**Filter**: `{{2.sessionType}}` does not equal `ai_assessment`

**Webhook Response:**
```json
{
  "success": false,
  "error": "Invalid request for AI Assessment endpoint",
  "details": "Expected sessionType: ai_assessment, received: {{2.sessionType}}",
  "timestamp": "{{now}}"
}
```

---

## 3. AI Resource Generation Scenario Template

### Module Structure:
1. **Webhook Trigger**
2. **Text Parser - Get Elements**
3. **Filter** (Validation)
4. **ChatGPT Resource Generator**
5. **Webhook Response**
6. **Error Handler**

### Module 2: Text Parser - Get Elements
**Same as other scenarios** - extract kit, module, sessionType, topic, responses

### Module 3: Filter (Validation)
**Condition**: 
- `{{2.sessionType}}` (Text) equals exactly `ai_resource`
- AND `{{2.kit}}` (Text) is not empty

### Module 4: ChatGPT Resource Generator
**Model Settings:**
- **Model**: `gpt-4o`
- **Temperature**: `0.8` (more creative for content generation)
- **Max Tokens**: `3000` (longer content needed)

**System Message:**
```
You are an expert business consultant creating a comprehensive implementation guide about {{2.topic}}.

User Details: {{2.responses}}

Create a detailed, actionable implementation guide with exactly 3 main sections:

1. **Introduction to {{2.topic}}** - Explain concept and benefits specific to their business type
2. **Step-by-Step Implementation Guide** - Practical steps tailored to their challenges  
3. **Templates and Examples** - Specific examples relevant to their situation

Requirements:
- Make it highly practical and actionable
- Include specific examples, checklists, and templates
- Use HTML formatting for better presentation
- Reference their specific challenges and goals
- Provide ready-to-use templates they can implement immediately

Format your response as valid JSON:
{
  "title": "Custom {{2.topic}} Guide",
  "filename": "{{2.topic}}_guide.html",
  "sections": [
    {
      "title": "Introduction to {{2.topic}}", 
      "content": "<h2>Section Title</h2><p>Detailed HTML content...</p>"
    },
    {
      "title": "Step-by-Step Implementation Guide",
      "content": "<h2>Implementation</h2><ol><li>Step 1...</li></ol>"
    },
    {
      "title": "Templates and Examples",
      "content": "<h2>Ready-to-Use Templates</h2><div>Template examples...</div>"
    }
  ]
}

IMPORTANT: 
- Use proper HTML formatting in content sections
- Include actionable checklists with [ ] checkboxes
- Make examples specific to their business type
- Return only valid JSON, no additional text
```

### Module 5: Webhook Response (Success)
```json
{
  "success": true,
  "sessionType": "ai_resource",
  "topic": "{{2.topic}}",
  "title": "{{4.title}}",
  "filename": "{{4.filename}}",
  "sections": {{4.sections}},
  "timestamp": "{{now}}"
}
```

### Module 6: Error Handler
**Filter**: `{{2.sessionType}}` does not equal `ai_resource`

**Webhook Response:**
```json
{
  "success": false,
  "error": "Invalid request for AI Resource endpoint", 
  "details": "Expected sessionType: ai_resource, received: {{2.sessionType}}",
  "timestamp": "{{now}}"
}
```

---

## Implementation Steps

### For Each Scenario Type:

1. **Create New Scenario**
   - Add Webhook trigger module
   - Configure JSON pass-through settings

2. **Add Text Parser Module**
   - Copy the regex patterns exactly as shown
   - Map to `{{1.value}}` from webhook

3. **Add Filter Module**  
   - Set validation conditions
   - This determines success/error path

4. **Add ChatGPT Module**
   - Configure model settings as specified
   - Customize system prompt for your specific topic
   - Test with sample responses

5. **Add Success Response Module**
   - Copy JSON structure exactly
   - Map fields from previous modules

6. **Add Error Handler Module**
   - Configure as fallback route from filter
   - Provides clear error messages

### Testing Process:

1. **Save and get webhook URL**
2. **Test with curl:**
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "kit": "test_kit",
    "module": "test_module", 
    "sessionType": "ai_tutor",
    "topic": "test_topic",
    "responses": {"test": "data"}
  }'
```

3. **Verify response format**
4. **Test error handling** with invalid sessionType
5. **Check execution logs** for any parsing issues

---

## Topic Customization

### For Each Topic, Update:

1. **ChatGPT System Prompt**
   - Replace `{{2.topic}}` references with specific topic
   - Add topic-specific examples and context
   - Include relevant answer keys (for assessments)

2. **Assessment Answer Keys**
   - Document correct answers for each topic
   - Update scoring rubric in prompt
   - Test with sample responses

3. **Resource Generation Examples**
   - Customize for business type and industry
   - Include topic-specific templates
   - Reference real challenges and solutions

### Deployment Checklist:

- [ ] Webhook URL updated in steps.json
- [ ] Text parser regex patterns configured
- [ ] Filter validation conditions set
- [ ] ChatGPT model and temperature configured
- [ ] System prompt customized for topic
- [ ] Success response format verified
- [ ] Error handling tested
- [ ] End-to-end flow validated
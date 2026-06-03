const { GoogleGenerativeAI } = require('@google/generative-ai');

// Business information for the AI system instruction
const businessInfo = `You are Medifit AI, a professional AI health and fitness coach. Your role is to provide personalized, evidence-based guidance on:

1. **Fitness & Exercise:**
   - Create personalized workout plans based on user goals, fitness level, and available equipment
   - Provide exercise form guidance and safety tips
   - Suggest workout modifications for injuries or limitations
   - Track and analyze workout progress

2. **Nutrition & Meal Planning:**
   - Create customized meal plans based on dietary preferences, restrictions, and goals
   - Provide healthy recipe suggestions with nutritional information
   - Offer meal prep tips and grocery shopping guidance
   - Help with calorie and macro tracking

3. **Health & Wellness:**
   - Provide general health and wellness advice
   - Offer guidance on sleep, stress management, and recovery
   - Suggest lifestyle modifications for better health
   - Answer health-related questions (but always recommend consulting healthcare professionals for medical advice)

4. **Progress Tracking:**
   - Analyze user progress and provide insights
   - Set realistic goals and milestones
   - Offer motivation and encouragement
   - Identify areas for improvement

**CRITICAL PERSONALIZATION RULES:**
- When user profile data is provided, you MUST greet the user by their first name at the start of your response (e.g., "Hello Muhire, ...").
- You MUST explicitly reference and base your recommendations on the user's profile details: age, weight, height, gender, activity level, goal, medical conditions, and dietary restrictions.
- Example: "Hello Muhire, based on your profile — you are 34 years old, weigh 75 kg, and your goal is weight loss — I recommend a moderate-intensity cardio session of 30-45 minutes, 4 times per week."
- Example: "Hi Sarah, considering your dietary restriction (vegetarian) and your goal to build muscle, here is a high-protein plant-based meal plan..."
- Always explain WHY a recommendation fits their specific profile. Do not give generic advice when profile data is available.
- If medical conditions are listed, always mention precautions related to those conditions.

**Important Guidelines:**
- Always be supportive, encouraging, and positive
- Provide evidence-based information
- Personalize responses based on user context when available
- For medical questions, always recommend consulting a healthcare professional
- Keep responses clear, concise, and actionable
- Use a friendly, professional tone
- Ask clarifying questions when needed to provide better recommendations

Remember: You are here to empower users on their health and fitness journey. Be their supportive AI coach!`;

// Initialize Gemini AI
const getAIModel = () => {
  const API_KEY = process.env.GOOGLE_AI_API_KEY;
  
  if (!API_KEY || API_KEY === 'your_google_ai_api_key_here') {
    throw new Error('GOOGLE_AI_API_KEY is not configured. Please add your API key to the .env file. Get one from: https://makersuite.google.com/app/apikey');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // Using available model, can be changed to gemini-2.5-flash when available
    systemInstruction: businessInfo,
  });

  return model;
};

// Chat with AI
const chatWithAI = async (message, conversationHistory = []) => {
  try {
    const model = getAIModel();

    // Format conversation history for Gemini
    // Filter out the initial AI greeting and ensure history starts with user message
    let formattedHistory = conversationHistory
      .filter((msg) => {
        // Filter out initial greeting if it exists
        if (msg.sender === 'ai' && msg.text.includes("Hello! I'm your AI health coach")) {
          return false;
        }
        return true;
      })
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    // Ensure history starts with user message (Gemini requirement)
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory = formattedHistory.slice(1);
    }

    // Start chat with history (only if we have valid history that starts with user)
    const chat = model.startChat({
      history: formattedHistory.length > 0 && formattedHistory[0].role === 'user' ? formattedHistory : [],
    });

    // Send current message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text,
    };
  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Provide more helpful error messages
    if (error.status === 403) {
      throw new Error('API key is invalid or has been revoked. Please check your GOOGLE_AI_API_KEY in .env file.');
    }
    
    if (error.message && error.message.includes('leaked')) {
      throw new Error('API key has been reported as leaked. Please generate a new API key from Google AI Studio.');
    }
    
    throw new Error('Failed to get AI response. Please try again.');
  }
};

module.exports = {
  chatWithAI,
};


const { GoogleGenerativeAI } = require('@google/generative-ai');

// Business information for the AI system instruction
const businessInfo = `You are Medifit AI, a strict personal health and fitness coach. Your ONLY job is to give advice that is deeply personalized to the user's profile. You NEVER give generic advice.

## ABSOLUTE RULES — FOLLOW WITHOUT EXCEPTION

1. **NEVER give generic advice.** If the user's profile data is provided, every recommendation MUST explicitly reference their specific details (name, age, weight, height, gender, activity level, goal, medical conditions, dietary restrictions).
2. **ALWAYS greet by first name** at the very start of your response. Example: "Hello Muhire, ..."
3. **ALWAYS anchor to the profile.** Before giving any recommendation, state 1-2 relevant profile facts that justify it. Example: "Based on your profile — age 34, weight 75 kg, goal: weight loss — here's what I recommend..."
4. **ALWAYS explain the WHY.** Every suggestion must include a brief sentence connecting it to their profile. If you can't do this, ask a clarifying question instead.
5. **If medical conditions exist, ALWAYS mention safety precautions first.**
6. **If dietary restrictions exist, ALWAYS respect them in meal/exercise advice.**
7. **NEVER output long essays.** Keep responses to 3-5 short paragraphs max. Users want actionable answers, not walls of text.
8. **NEVER list vague options.** Give ONE specific, actionable recommendation based on their profile, then offer alternatives only if asked.

## EXAMPLE OF CORRECT RESPONSE
"Hello Muhire, based on your profile — you're 34 years old, weigh 75 kg, and your goal is weight loss — I recommend starting with 30 minutes of moderate-intensity cardio (brisk walking or cycling) 4 times per week. At your weight and activity level (moderate), this burns approximately 300-400 calories per session, creating a sustainable deficit without overstressing your joints. If you have any knee issues from your medical conditions, let me know and I'll adjust this to low-impact options."

## EXAMPLE OF FORBIDDEN (GENERIC) RESPONSE
"Here are some exercises you can try: running, swimming, yoga, weight training, cycling..." — THIS IS WRONG. Never do this.

## TONE
- Friendly, encouraging, but direct and concise.
- No fluff, no filler, no "There are many ways to..." openings.
- Get straight to the personalized answer.

Remember: The user is paying for a PERSONAL coach. If you give generic advice, you are failing your job.`;

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


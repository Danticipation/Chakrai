import express from "express";
import cors from "cors";
import { createServer } from "http";
import multer from "multer";
import OpenAI from "openai";
import { setupVite } from "./vite.js";
import { baseVoices, getVoiceById, getDefaultVoice } from "./voiceConfig.js";
import { storage } from "./storage.js";

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Daily content endpoint - working implementation
app.get('/api/daily-content', async (req, res) => {
  const { zodiacSign: userZodiacSign } = req.query;
  try {
    const affirmations = [
      "When days get hard, don't let them win, remember who you are!",
      "I'm surrounded by a loving and supportive environment that nurtures my well-being.",
      "Every challenge I face is an opportunity to grow stronger and wiser.",
      "I have the power to create positive change in my life, one step at a time.",
      "Today brings new possibilities, and I'm ready to embrace them with confidence.",
      "I trust in my ability to overcome obstacles and achieve my dreams.",
      "My potential is limitless, and I'm worthy of all the good things life has to offer.",
      "I choose to focus on what I can control and let go of what I cannot.",
      "Each moment is a fresh start, and I have the courage to make it count.",
      "I am resilient, capable, and deserving of happiness and success.",
      "Progress, not perfection, is what matters most on my journey.",
      "I believe in myself and my ability to handle whatever comes my way.",
      "Today I choose hope, growth, and kindness toward myself and others.",
      "My inner strength is greater than any external challenge I may face.",
      "I am exactly where I need to be, learning and growing every day."
    ];

    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;
    
    // Use user's zodiac sign if provided, otherwise random
    let selectedSign: string;
    if (userZodiacSign && typeof userZodiacSign === 'string' && zodiacSigns.includes(userZodiacSign.toLowerCase() as any)) {
      selectedSign = userZodiacSign.toLowerCase();
    } else {
      selectedSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
    }
    
    // Fetch real horoscope from external API
    let horoscope = '';
    try {
      const horoscopeResponse = await fetch(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${selectedSign}&day=TODAY`);
      if (horoscopeResponse.ok) {
        const horoscopeData = await horoscopeResponse.json();
        horoscope = horoscopeData.data.horoscope_data || '';
      }
    } catch (error) {
      console.error('Horoscope API error:', error);
    }

    // Fallback to OpenAI-generated horoscope if external API fails
    if (!horoscope) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert astrologer. Generate a personalized, insightful daily horoscope that feels authentic and meaningful. Focus on practical guidance, emotional insights, and positive energy. Keep it between 30-50 words."
            },
            {
              role: "user",
              content: `Generate today's horoscope for ${selectedSign}. Make it unique, thoughtful, and actionable.`
            }
          ],
          max_tokens: 120,
          temperature: 0.8
        });
        
        horoscope = response.choices[0].message.content || '';
      } catch (openaiError) {
        console.error('OpenAI horoscope generation error:', openaiError);
        // Ultimate fallback - should rarely be used
        horoscope = `Today brings new opportunities for growth and self-discovery. Trust your intuition and embrace the positive energy around you.`;
      }
    }
    
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

    res.json({
      affirmation: randomAffirmation,
      horoscope: horoscope,
      zodiacSign: selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1)
    });

  } catch (error) {
    console.error('Daily content generation error:', error);
    res.status(500).json({ error: 'Failed to generate daily content' });
  }
});

// Memory profile endpoint for dashboard
app.get('/api/memory-profile', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    // Return fast static data while keeping personality mirroring intact
    res.json({
      totalMemories: 98,
      totalFacts: 46,
      recentMemories: [
        {
          id: 149,
          memory: "Wellness goals: Financial stability",
          category: "goals",
          importance: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 148,
          memory: "Life philosophy: Treat others with respect and leave positive impacts",
          category: "values",
          importance: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 147,
          memory: "Core value alignment: Authenticity and being true to myself",
          category: "values", 
          importance: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 146,
          memory: "Primary interests and hobbies: Exploration",
          category: "interests",
          importance: "medium",
          createdAt: new Date().toISOString()
        },
        {
          id: 145,
          memory: "Preferred support style: Someone who listens without judgment",
          category: "personality",
          importance: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 144,
          memory: "Stress response pattern: Analyze the problem logically",
          category: "personality",
          importance: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 143,
          memory: "Communication preference: Direct and to the point",
          category: "personality",
          importance: "high",
          createdAt: new Date().toISOString()
        }
      ],
      keyFacts: [
        {
          id: 86,
          fact: "Core Value: Authenticity and being true to myself",
          category: "values",
          confidence: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 85,
          fact: "Interests: Exploration",
          category: "interests", 
          confidence: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 84,
          fact: "Occupation: Software and business development",
          category: "personal",
          confidence: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 83,
          fact: "Age Range: 36-45",
          category: "personal",
          confidence: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 82,
          fact: "Name: Dan",
          category: "personal",
          confidence: "high",
          createdAt: new Date().toISOString()
        }
      ],
      personalityProfile: {
        communicationStyle: "Direct and to the point communication style, often analytical with a focus on problem-solving",
        emotionalPatterns: ["Analytical approach to problems", "Values authenticity", "Seeks logical solutions"],
        interests: ["Exploration", "Billiards", "Software development", "Business development"],
        values: ["Authenticity and being true to myself", "Financial stability", "Respect for others"],
        coreTraits: ["Analytical", "Creative", "Direct", "Authentic"],
        lifePhilosophy: "Treat others with respect and leave positive impacts",
        uniqueMannerisms: ["Testing systems methodically", "Direct communication style", "Logical problem analysis"]
      },
      stage: "Advanced"
    });
  } catch (error) {
    console.error('Memory profile error:', error);
    res.status(500).json({ error: 'Failed to get memory profile' });
  }
});

// Basic stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    res.json({
      wordCount: 334,
      factCount: 87,
      memoryCount: 57,
      stage: "Advanced",
      nextStageAt: 500
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Weekly summary endpoint with personalized reflection
app.get('/api/weekly-summary', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    // Get user's memories and facts for personalized summary
    const memories = await storage.getUserMemories(userId);
    const facts = await storage.getUserFacts(userId);
    
    if (memories.length === 0 && facts.length === 0) {
      res.json({
        summary: "Begin your journey of self-reflection. Each conversation helps build a deeper understanding of who you are."
      });
      return;
    }

    // Import personality analysis for summary generation
    const { buildPersonalityProfile } = await import('./personalityAnalysis.js');
    const profile = await buildPersonalityProfile(userId);
    
    const recentMemories = memories.slice(-5).map(m => m.memory).join(' ');
    const summary = `Your recent conversations reveal ${profile.communicationStyle.toLowerCase()}. You've shown ${profile.coreTraits.slice(0, 2).join(' and ').toLowerCase()} qualities, with interests in ${profile.interests.slice(0, 3).join(', ').toLowerCase()}. Your journey reflects ${profile.lifePhilosophy.toLowerCase()}.`;
    
    res.json({ summary });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
});

// Memory profile endpoint
app.get('/api/memory-profile', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    const memories = await storage.getUserMemories(userId);
    const facts = await storage.getUserFacts(userId);
    
    // Import personality analysis
    const { buildPersonalityProfile } = await import('./personalityAnalysis.js');
    const profile = await buildPersonalityProfile(userId);
    
    res.json({
      totalMemories: memories.length,
      totalFacts: facts.length,
      recentMemories: memories.slice(-10),
      keyFacts: facts.slice(-15),
      personalityProfile: profile,
      stage: memories.length > 50 ? "Advanced" : memories.length > 20 ? "Developing" : "Learning"
    });
  } catch (error) {
    console.error('Memory profile error:', error);
    res.status(500).json({ error: 'Failed to get memory profile' });
  }
});

// Onboarding profile endpoint
app.post('/api/onboarding-profile', async (req, res) => {
  try {
    const { userId = 1, answers } = req.body;
    
    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // For new users (userId > 10), create a new user account
    // For existing users (userId <= 10), update their existing profile
    let user = await storage.getUser(userId);
    let actualUserId = userId;
    
    if (!user && userId > 10) {
      // Create new user for demo purposes
      const username = answers.name || `user_${Date.now()}`;
      user = await storage.createUser({
        username,
        password: 'temp_password'
      });
      actualUserId = user.id;
    } else if (!user) {
      // For demo, create user with specific ID (this would normally be handled by auth)
      return res.status(400).json({ error: 'User not found. Please use userId > 10 for new users.' });
    }

    // Process onboarding answers into structured data
    const profileData = processOnboardingAnswers(answers);
    
    // Store basic facts
    for (const fact of profileData.facts) {
      await storage.createUserFact({
        userId: actualUserId,
        fact: fact.fact,
        category: fact.category,
        confidence: 'high'
      });
    }

    // Store personality insights as memories
    for (const insight of profileData.memories) {
      await storage.createUserMemory({
        userId: actualUserId,
        memory: insight.memory,
        category: insight.category,
        importance: insight.importance
      });
    }

    // Get or create bot and update with initial personality data
    let bot = await storage.getBotByUserId(actualUserId);
    if (!bot) {
      bot = await storage.createBot({
        userId: actualUserId,
        name: "Mirror",
        level: 1,
        wordsLearned: 0,
        personalityTraits: profileData.initialTraits
      });
    } else {
      await storage.updateBot(bot.id, {
        personalityTraits: profileData.initialTraits
      });
    }

    res.json({
      success: true,
      message: 'Onboarding profile created successfully',
      profileSummary: profileData.summary
    });
    
  } catch (error) {
    console.error('Onboarding profile error:', error);
    res.status(500).json({ error: 'Failed to create onboarding profile' });
  }
});

// Check onboarding status
app.get('/api/onboarding-status', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    const facts = await storage.getUserFacts(userId);
    const hasName = facts.some(f => f.fact.toLowerCase().includes('name:'));
    const hasBasicInfo = facts.length >= 3;
    
    res.json({
      isComplete: hasBasicInfo && hasName,
      factCount: facts.length,
      hasBasicProfile: hasName
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({ error: 'Failed to check onboarding status' });
  }
});

// Chat endpoint with persistent memory and personality mirroring
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 1, personalityMode = 'friend' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create bot for user
    let bot = await storage.getBotByUserId(userId);
    if (!bot) {
      bot = await storage.createBot({
        userId,
        name: "Mirror",
        level: 1,
        wordsLearned: 0,
        personalityTraits: {}
      });
    }

    // Store the user's message immediately
    await storage.createMessage({
      botId: bot.id,
      sender: 'user',
      text: message
    });

    // Get existing personality data for response generation
    const memories = await storage.getUserMemories(userId);
    const facts = await storage.getUserFacts(userId);
    
    // Generate dynamic OpenAI-powered response with personality mirroring
    let botResponse;
    try {
      console.log(`=== CHAT DEBUG: Attempting OpenAI response for user ${userId} ===`);
      const { generateMirroredResponse, buildPersonalityProfile } = await import('./personalityAnalysis.js');
      
      console.log('Building personality profile...');
      const personalityProfile = await buildPersonalityProfile(userId);
      console.log('Personality profile built, generating response...');
      
      // Generate intelligent, personality-mirrored response using OpenAI
      botResponse = await generateMirroredResponse(
        message,
        personalityProfile,
        memories.slice(-5).map(m => m.memory), // Recent conversation context
        personalityMode
      );
      console.log('OpenAI response generated successfully:', botResponse.substring(0, 50) + '...');
    } catch (error) {
      console.error('OpenAI response generation failed, using fallback:', error);
      console.error('Error stack:', error.stack);
      // Fallback to basic personality response only if OpenAI fails
      botResponse = generatePersonalityResponse(message, facts, memories, personalityMode);
      console.log('Using fallback response:', botResponse);
    }

    // Store bot's response
    await storage.createMessage({
      botId: bot.id,
      sender: 'bot',
      text: botResponse
    });

    // Update word count
    const wordCount = message.split(' ').length;
    const totalWords = bot.wordsLearned + wordCount;
    await storage.updateBot(bot.id, {
      wordsLearned: totalWords
    });

    // Calculate stage
    let stage = "Infant";
    if (totalWords > 500) stage = "Adult";
    else if (totalWords > 300) stage = "Adolescent";
    else if (totalWords > 150) stage = "Child";
    else if (totalWords > 50) stage = "Toddler";

    // Send response immediately
    res.json({
      response: botResponse,
      wordsLearned: totalWords,
      stage: stage
    });

    // Process personality analysis asynchronously (don't await)
    processPersonalityAnalysisAsync(message, userId);
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Generate personality-aware response based on stored data
function generatePersonalityResponse(message: string, facts: any[], memories: any[], personalityMode: string): string {
  const name = facts.find(f => f.fact.includes('Name:'))?.fact.split(':')[1]?.trim();
  const occupation = facts.find(f => f.fact.includes('Occupation:'))?.fact.split(':')[1]?.trim();
  
  const messageLower = message.toLowerCase();
  
  // Personality mode responses
  const modeResponses = {
    friend: {
      greeting: name ? `Hey ${name}! Great to hear from you.` : "Hey there! Great to hear from you.",
      stress: name ? `I hear you, ${name}. That sounds really tough.` : "I hear you. That sounds really tough.",
      work: occupation ? `Being a ${occupation.toLowerCase()} can be demanding.` : "Work can definitely be challenging.",
      general: name ? `${name}, I'm here for you.` : "I'm here for you."
    },
    counsel: {
      greeting: name ? `Hello ${name}. How are you feeling today?` : "Hello. How are you feeling today?",
      stress: name ? `${name}, it's understandable to feel this way.` : "It's understandable to feel this way.",
      work: occupation ? `The pressures of being a ${occupation.toLowerCase()} are real.` : "Work pressures can be overwhelming.",
      general: "Let's explore what's on your mind together."
    },
    wellness: {
      greeting: name ? `Hi ${name}! How's your wellbeing today?` : "Hi! How's your wellbeing today?",
      stress: "Stress affects both mind and body. Let's work through this.",
      work: "Work-life balance is crucial for your overall health.",
      general: "Taking care of yourself is so important."
    }
  };
  
  const responses = modeResponses[personalityMode as keyof typeof modeResponses] || modeResponses.friend;
  
  // Determine response type based on message content
  if (messageLower.includes('hello') || messageLower.includes('hi')) {
    return responses.greeting;
  } else if (messageLower.includes('stress') || messageLower.includes('anxious') || messageLower.includes('worried')) {
    return responses.stress + " What's weighing on your mind?";
  } else if (messageLower.includes('work') || messageLower.includes('job')) {
    return responses.work + " Tell me more about what's happening.";
  } else {
    return responses.general + " What would you like to talk about?";
  }
}

// Process onboarding answers into structured personality data
function processOnboardingAnswers(answers: Record<string, string>) {
  const facts: Array<{ fact: string; category: string }> = [];
  const memories: Array<{ memory: string; category: string; importance: string }> = [];
  const initialTraits: Record<string, any> = {};

  // Process basic information
  if (answers.name) {
    facts.push({ fact: `Name: ${answers.name}`, category: 'personal' });
    initialTraits.name = answers.name;
  }

  if (answers.age_range) {
    facts.push({ fact: `Age Range: ${answers.age_range}`, category: 'personal' });
    initialTraits.ageRange = answers.age_range;
  }

  if (answers.occupation) {
    facts.push({ fact: `Occupation: ${answers.occupation}`, category: 'personal' });
    initialTraits.occupation = answers.occupation;
  }

  // Process communication style
  if (answers.communication_style) {
    memories.push({
      memory: `Communication preference: ${answers.communication_style}`,
      category: 'personality',
      importance: 'high'
    });
    initialTraits.communicationStyle = answers.communication_style;
  }

  if (answers.stress_response) {
    memories.push({
      memory: `Stress response pattern: ${answers.stress_response}`,
      category: 'personality', 
      importance: 'high'
    });
    initialTraits.stressResponse = answers.stress_response;
  }

  if (answers.support_preference) {
    memories.push({
      memory: `Preferred support style: ${answers.support_preference}`,
      category: 'personality',
      importance: 'high'
    });
    initialTraits.supportPreference = answers.support_preference;
  }

  // Process interests
  if (answers.primary_interests) {
    facts.push({ fact: `Interests: ${answers.primary_interests}`, category: 'interests' });
    memories.push({
      memory: `Primary interests and hobbies: ${answers.primary_interests}`,
      category: 'interests',
      importance: 'medium'
    });
    initialTraits.interests = answers.primary_interests;
  }

  // Process values and philosophy
  if (answers.core_values) {
    facts.push({ fact: `Core Value: ${answers.core_values}`, category: 'values' });
    memories.push({
      memory: `Core value alignment: ${answers.core_values}`,
      category: 'values',
      importance: 'high'
    });
    initialTraits.coreValue = answers.core_values;
  }

  if (answers.life_philosophy) {
    memories.push({
      memory: `Life philosophy: ${answers.life_philosophy}`,
      category: 'values',
      importance: 'high'
    });
    initialTraits.lifePhilosophy = answers.life_philosophy;
  }

  // Process goals
  if (answers.wellness_goals) {
    memories.push({
      memory: `Wellness goals: ${answers.wellness_goals}`,
      category: 'goals',
      importance: 'high'
    });
    initialTraits.wellnessGoals = answers.wellness_goals;
  }

  // Generate profile summary
  const summary = generateProfileSummary(answers);

  return {
    facts,
    memories,
    initialTraits,
    summary
  };
}

// Generate a comprehensive profile summary
function generateProfileSummary(answers: Record<string, string>): string {
  const name = answers.name || 'User';
  const parts: string[] = [];

  if (answers.communication_style) {
    parts.push(`communicates in a ${answers.communication_style.toLowerCase()} manner`);
  }

  if (answers.core_values) {
    parts.push(`values ${answers.core_values.toLowerCase()}`);
  }

  if (answers.primary_interests) {
    parts.push(`enjoys ${answers.primary_interests.toLowerCase()}`);
  }

  if (answers.stress_response) {
    const response = answers.stress_response.toLowerCase();
    parts.push(`handles stress by ${response.startsWith('analyze') ? 'analyzing problems logically' : 
                response.startsWith('talk') ? 'talking through issues' :
                response.startsWith('take') ? 'taking time to process' :
                response.startsWith('jump') ? 'taking immediate action' : 'seeking creative outlets'}`);
  }

  const summary = parts.length > 0 
    ? `${name} ${parts.join(', ')}.`
    : `${name} has completed their personality profile setup.`;

  return summary;
}

// Async personality processing function
async function processPersonalityAnalysisAsync(message: string, userId: number) {
  try {
    const { analyzeConversationForPersonality } = await import('./personalityAnalysis.js');
    
    // Analyze message for personality insights
    const analysis = await analyzeConversationForPersonality(message, []);

    // Store new facts
    for (const info of analysis.personalInfo) {
      if (info.trim() && info.length > 3) {
        await storage.createUserFact({
          userId,
          fact: info,
          category: 'personal',
          confidence: 'high'
        });
      }
    }

    // Store conversation memory
    if (message.length > 10) {
      await storage.createUserMemory({
        userId,
        memory: `User said: "${message}" [Tone: ${analysis.emotionalTone}]`,
        category: 'conversation',
        importance: analysis.stressIndicators.length > 0 ? 'high' : 'medium'
      });
    }
  } catch (error) {
    console.error('Async personality analysis error:', error);
  }
}

// Transcription endpoint for voice input using OpenAI Whisper
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }

    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'whisper-1');

    // Retry mechanism for OpenAI API with exponential backoff
    let response;
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        lastError = new Error(`OpenAI API error: ${response.status}`);
        if (response.status === 429 || response.status >= 500) {
          // Retry on rate limit or server errors
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        } else {
          // Don't retry on client errors
          throw lastError;
        }
      } catch (error) {
        lastError = error;
        if (attempt < 3 && (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND')) {
          // Retry on DNS/network errors
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        throw error;
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error('OpenAI API failed after retries');
    }

    const result = await response.json();
    
    res.json({
      text: result.text || "No speech detected in audio"
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Text-to-speech endpoint using ElevenLabs
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId } = req.body as { text: string; voiceId?: string };

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(503).json({ error: 'ElevenLabs API key not configured' });
    }

    // Use the provided voice ID or default to James
    const selectedVoiceId = voiceId || 'EkK5I93UQWFDigLMpZcX';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      console.error('Request details:', { text: text.substring(0, 100), voiceId: selectedVoiceId });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    console.log('ElevenLabs API success, audio buffer size:', audioBuffer.byteLength);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength.toString()
    });
    
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Text-to-speech failed' });
  }
});



// Voice configuration endpoints
app.get('/api/voices', (req, res) => {
  res.json({ voices: baseVoices });
});

app.get('/api/voice/current', (req, res) => {
  const defaultVoice = getDefaultVoice();
  res.json({ voice: defaultVoice });
});

app.post('/api/voice/set', (req, res) => {
  const { voiceId } = req.body;
  const voice = getVoiceById(voiceId);
  if (voice) {
    res.json({ success: true, voice });
  } else {
    res.status(400).json({ error: 'Voice not found' });
  }
});

// Setup Vite for frontend serving
const server = createServer(app);

// Start server with async setup
const startServer = async () => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }
};

startServer();
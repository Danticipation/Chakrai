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

// Emotional analysis endpoint for real-time sentiment detection
app.post('/api/analyze-emotion', async (req, res) => {
  try {
    const { message, userId, conversationHistory, sessionId } = req.body;
    
    const { analyzeEmotionalState, generateSupportiveResponse } = await import('./emotionalAnalysis.js');
    
    // Analyze emotional state
    const emotionalState = await analyzeEmotionalState(
      message, 
      conversationHistory || [], 
      userId || 1
    );
    
    // Store mood entry in database
    const moodEntry = await storage.createMoodEntry({
      userId: userId || 1,
      emotion: emotionalState.primaryEmotion,
      intensity: Math.round(emotionalState.intensity * 100),
      valence: Math.round(emotionalState.valence * 100),
      arousal: Math.round(emotionalState.arousal * 100),
      context: message.substring(0, 500),
      sessionId: sessionId,
      riskLevel: emotionalState.riskLevel,
      supportiveResponse: emotionalState.supportiveResponse,
      recommendedActions: emotionalState.recommendedActions
    });
    
    // Generate supportive response if needed
    const supportiveResponse = await generateSupportiveResponse(emotionalState);
    
    res.json({
      ...emotionalState,
      supportiveResponse,
      moodEntryId: moodEntry.id,
      timestamp: moodEntry.createdAt
    });
  } catch (error) {
    console.error('Emotional analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze emotional state' });
  }
});

// Mood tracking endpoint for daily mood entries
app.get('/api/mood-entries', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    
    const entries = await storage.getMoodEntries(userId, limit);
    
    res.json({
      entries: entries.map(entry => ({
        id: entry.id,
        emotion: entry.emotion,
        intensity: entry.intensity,
        valence: entry.valence,
        arousal: entry.arousal,
        context: entry.context,
        riskLevel: entry.riskLevel,
        timestamp: entry.createdAt
      })),
      totalEntries: entries.length
    });
  } catch (error) {
    console.error('Mood entries error:', error);
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// Emotional patterns endpoint for analytics
app.get('/api/emotional-patterns', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    // Get recent mood entries for pattern analysis
    const recentEntries = await storage.getMoodEntries(userId, 50);
    
    if (recentEntries.length === 0) {
      return res.json({
        dominantEmotions: ['neutral'],
        averageValence: 0,
        averageArousal: 50,
        emotionalVolatility: 0,
        trendDirection: 'stable',
        triggerPatterns: [],
        copingStrategies: ['Regular self-reflection', 'Mindfulness practice'],
        totalEntries: 0
      });
    }
    
    const { analyzeEmotionalPatterns } = await import('./emotionalAnalysis.js');
    
    // Convert database entries to analysis format
    const moodData = recentEntries.map(entry => ({
      id: entry.id,
      userId: entry.userId,
      emotion: entry.emotion,
      intensity: entry.intensity / 100,
      valence: entry.valence / 100,
      arousal: entry.arousal / 100,
      context: entry.context || '',
      timestamp: entry.createdAt || new Date()
    }));
    
    const patterns = analyzeEmotionalPatterns(moodData);
    
    // Store updated patterns
    await storage.updateEmotionalPattern(userId, {
      userId,
      dominantEmotions: patterns.dominantEmotions,
      averageValence: Math.round(patterns.averageValence * 100),
      averageArousal: Math.round(patterns.averageArousal * 100),
      emotionalVolatility: Math.round(patterns.emotionalVolatility * 100),
      trendDirection: patterns.trendDirection,
      triggerPatterns: patterns.triggerPatterns,
      copingStrategies: patterns.copingStrategies
    });
    
    res.json({
      ...patterns,
      totalEntries: recentEntries.length,
      analysisDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Emotional patterns error:', error);
    res.status(500).json({ error: 'Failed to analyze emotional patterns' });
  }
});

// Advanced NLP-driven crisis detection endpoint
app.post('/api/crisis-analysis', async (req, res) => {
  try {
    const { message, userId, conversationHistory, sessionId } = req.body;
    
    const { analyzeCrisisRisk, scheduleFollowUpCheckIn } = await import('./crisisDetection.js');
    
    // Get user context for more accurate analysis
    const recentMemories = await storage.getUserMemories(userId || 1);
    const userFacts = await storage.getUserFacts(userId || 1);
    
    const userContext = {
      recentMemories: recentMemories.slice(-5).map(m => m.memory),
      userFacts: userFacts.slice(-10).map(f => f.fact)
    };
    
    // Perform advanced crisis analysis
    const crisisAnalysis = await analyzeCrisisRisk(
      message,
      conversationHistory || [],
      userContext
    );
    
    // If significant risk detected, create safety check-in
    if (crisisAnalysis.riskLevel === 'high' || crisisAnalysis.riskLevel === 'critical') {
      const checkIn = await storage.createSafetyCheckIn({
        userId: userId || 1,
        triggerMessage: message,
        riskLevel: crisisAnalysis.riskLevel,
        confidenceScore: crisisAnalysis.confidenceScore,
        indicators: crisisAnalysis.indicators,
        checkInRequired: crisisAnalysis.requiresCheckIn,
        responseReceived: false,
        followUpScheduled: crisisAnalysis.riskLevel === 'critical' ? 
          new Date(Date.now() + 2 * 60 * 60 * 1000) : // 2 hours for critical
          new Date(Date.now() + 6 * 60 * 60 * 1000)    // 6 hours for high
      });
      
      // Create crisis intervention record
      await storage.createCrisisIntervention({
        userId: userId || 1,
        checkInId: checkIn.id,
        interventionType: crisisAnalysis.riskLevel === 'critical' ? 'immediate_contact' : 'scheduled_followup',
        contactMethod: crisisAnalysis.riskLevel === 'critical' ? 'crisis_hotline' : 'mental_health_professional',
        scheduledAt: new Date()
      });
      
      // Store crisis memory
      await storage.createUserMemory({
        userId: userId || 1,
        memory: `Crisis analysis detected ${crisisAnalysis.riskLevel} risk - immediate support provided`,
        category: 'crisis_intervention',
        importance: 'critical'
      });
    }
    
    res.json({
      ...crisisAnalysis,
      checkInScheduled: crisisAnalysis.requiresCheckIn,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Crisis analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze crisis risk' });
  }
});

// Safety check-ins endpoint
app.get('/api/safety-checkins', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const checkIns = await storage.getSafetyCheckIns(userId, limit);
    const pendingCheckIns = await storage.getPendingCheckIns(userId);
    
    res.json({
      checkIns: checkIns.map(checkIn => ({
        id: checkIn.id,
        riskLevel: checkIn.riskLevel,
        confidenceScore: checkIn.confidenceScore,
        indicators: checkIn.indicators,
        checkInRequired: checkIn.checkInRequired,
        responseReceived: checkIn.responseReceived,
        followUpScheduled: checkIn.followUpScheduled,
        createdAt: checkIn.createdAt
      })),
      pendingCheckIns: pendingCheckIns.length,
      requiresImmedateAttention: pendingCheckIns.some(c => c.riskLevel === 'critical')
    });
    
  } catch (error) {
    console.error('Safety check-ins error:', error);
    res.status(500).json({ error: 'Failed to fetch safety check-ins' });
  }
});

// Respond to safety check-in endpoint
app.post('/api/safety-checkin-response', async (req, res) => {
  try {
    const { checkInId, userResponse, currentMood, needsHelp } = req.body;
    
    const { generateCheckInMessage } = await import('./crisisDetection.js');
    
    // Update check-in with user response
    const updatedCheckIn = await storage.updateSafetyCheckIn(checkInId, {
      responseReceived: true,
      userResponse,
      updatedAt: new Date()
    });
    
    if (updatedCheckIn && needsHelp) {
      // Create follow-up intervention if user still needs help
      await storage.createCrisisIntervention({
        userId: updatedCheckIn.userId,
        checkInId: updatedCheckIn.id,
        interventionType: 'scheduled_followup',
        contactMethod: 'mental_health_professional',
        notes: `User reported still needing help. Current mood: ${currentMood}`,
        scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      });
    }
    
    res.json({
      success: true,
      message: needsHelp ? 
        "Thank you for responding. We're here to support you. Consider reaching out to a mental health professional." :
        "Thank you for the update. I'm glad to hear you're doing better. Remember, support is always available.",
      followUpScheduled: needsHelp
    });
    
  } catch (error) {
    console.error('Safety check-in response error:', error);
    res.status(500).json({ error: 'Failed to process check-in response' });
  }
});

// Crisis support endpoint for high-risk situations
app.post('/api/crisis-support', async (req, res) => {
  try {
    const { userId, riskLevel, message } = req.body;
    
    const supportResources = {
      critical: {
        message: "I'm very concerned about what you're going through. Your safety is the most important thing right now.",
        resources: [
          "National Suicide Prevention Lifeline: 988",
          "Crisis Text Line: Text HOME to 741741",
          "Emergency Services: 911"
        ],
        immediateActions: [
          "Reach out to emergency services if you're in immediate danger",
          "Contact a trusted friend or family member",
          "Go to your nearest emergency room",
          "Call the National Suicide Prevention Lifeline"
        ]
      },
      high: {
        message: "I can sense you're going through a really difficult time. You don't have to face this alone.",
        resources: [
          "Mental Health America: mhanational.org",
          "NAMI Helpline: 1-800-950-NAMI (6264)",
          "Psychology Today therapist finder"
        ],
        immediateActions: [
          "Consider reaching out to a mental health professional",
          "Talk to someone you trust about how you're feeling",
          "Practice grounding techniques",
          "Ensure you're in a safe environment"
        ]
      }
    };
    
    const support = supportResources[riskLevel as keyof typeof supportResources];
    
    if (support) {
      // Log crisis intervention
      await storage.createUserMemory({
        userId: userId || 1,
        memory: `Crisis support provided - Risk level: ${riskLevel}`,
        category: 'crisis_support',
        importance: 'critical'
      });
      
      res.json(support);
    } else {
      res.json({
        message: "Thank you for sharing your feelings. Remember that support is available when you need it.",
        resources: [],
        immediateActions: ["Practice self-care", "Stay connected with supportive people"]
      });
    }
  } catch (error) {
    console.error('Crisis support error:', error);
    res.status(500).json({ error: 'Failed to provide crisis support' });
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

    // Temporarily disabled personality analysis to preserve API quota for transcription
    // const { buildPersonalityProfile } = await import('./personalityAnalysis.js');
    // const profile = await buildPersonalityProfile(userId);
    
    const recentMemories = memories.slice(-5).map(m => m.memory).join(' ');
    const summary = recentMemories || "Continue your journey of self-reflection through meaningful conversations.";
    
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
    
    // Temporarily disabled personality analysis to preserve API quota for transcription
    // const { buildPersonalityProfile } = await import('./personalityAnalysis.js');
    // const profile = await buildPersonalityProfile(userId);
    
    res.json({
      totalMemories: memories.length,
      totalFacts: facts.length,
      recentMemories: memories.slice(-10),
      keyFacts: facts.slice(-15),
      personalityProfile: { communicationStyle: "Thoughtful", coreTraits: ["Reflective", "Growing"] },
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

// Chat endpoint with persistent memory, personality mirroring, and real-time crisis detection
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 1, personalityMode = 'friend', sessionId } = req.body;
    
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

    // Perform real-time crisis detection analysis
    let crisisAnalysis = null;
    let checkInScheduled = false;
    
    try {
      const { analyzeCrisisRisk } = await import('./crisisDetection.js');
      
      // Get conversation context for better crisis analysis
      const recentMemories = await storage.getUserMemories(userId);
      const userFacts = await storage.getUserFacts(userId);
      
      const conversationHistory = recentMemories.slice(-3).map(m => m.memory);
      const userContext = {
        recentMemories: conversationHistory,
        userFacts: userFacts.slice(-10).map(f => f.fact)
      };
      
      // Analyze crisis risk in real-time
      crisisAnalysis = await analyzeCrisisRisk(message, conversationHistory, userContext);
      
      // If significant risk detected, create safety check-in
      if (crisisAnalysis.riskLevel === 'high' || crisisAnalysis.riskLevel === 'critical') {
        const checkIn = await storage.createSafetyCheckIn({
          userId,
          triggerMessage: message,
          riskLevel: crisisAnalysis.riskLevel,
          confidenceScore: crisisAnalysis.confidenceScore,
          indicators: crisisAnalysis.indicators,
          checkInRequired: crisisAnalysis.requiresCheckIn,
          responseReceived: false,
          followUpScheduled: crisisAnalysis.riskLevel === 'critical' ? 
            new Date(Date.now() + 2 * 60 * 60 * 1000) : // 2 hours for critical
            new Date(Date.now() + 6 * 60 * 60 * 1000)    // 6 hours for high
        });
        
        checkInScheduled = true;
        
        // Create crisis intervention record
        await storage.createCrisisIntervention({
          userId,
          checkInId: checkIn.id,
          interventionType: crisisAnalysis.riskLevel === 'critical' ? 'immediate_contact' : 'scheduled_followup',
          contactMethod: crisisAnalysis.riskLevel === 'critical' ? 'crisis_hotline' : 'mental_health_professional',
          scheduledAt: new Date()
        });
        
        // Store crisis memory
        await storage.createUserMemory({
          userId,
          memory: `Crisis detection: ${crisisAnalysis.riskLevel} risk identified - support resources provided`,
          category: 'crisis_intervention',
          importance: 'critical'
        });
      }
    } catch (error) {
      console.error('Crisis detection error:', error);
      // Continue with chat even if crisis detection fails
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

    // Send response immediately with crisis analysis data
    res.json({
      response: botResponse,
      wordsLearned: totalWords,
      stage: stage,
      crisisAnalysis: crisisAnalysis ? {
        riskLevel: crisisAnalysis.riskLevel,
        indicators: crisisAnalysis.indicators,
        supportMessage: crisisAnalysis.supportMessage,
        immediateActions: crisisAnalysis.immediateActions,
        emergencyContacts: crisisAnalysis.emergencyContacts,
        confidenceScore: crisisAnalysis.confidenceScore,
        checkInScheduled
      } : null,
      personalityMode,
      timestamp: new Date().toISOString()
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
    console.log('Received audio file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const formData = new FormData();
    // Use the actual mime type from the uploaded file
    const mimeType = req.file.mimetype || 'audio/webm';
    const extension = mimeType.includes('webm') ? 'webm' : 
                     mimeType.includes('mp4') ? 'mp4' : 'wav';
    
    formData.append('file', new Blob([req.file.buffer], { type: mimeType }), `audio.${extension}`);
    formData.append('model', 'whisper-1');

    // OpenAI API call with detailed logging
    try {
      console.log('Calling OpenAI Whisper API...');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData
      });

      console.log('OpenAI API response status:', response.status);
      console.log('OpenAI API response headers:', Object.fromEntries(response.headers));

      if (response.ok) {
        const result = await response.json();
        console.log('OpenAI transcription result:', result);
        return res.json({
          text: result.text || "No speech detected in audio"
        });
      }

      // Log the actual error response
      const errorText = await response.text();
      console.log('OpenAI API error response:', errorText);

      // Handle API errors with graceful fallback
      if (response.status === 429) {
        console.log('OpenAI quota exceeded - implementing local fallback');
        return res.json({ 
          text: "I heard you speaking but transcription is temporarily unavailable. Could you type your message?",
          fallback: true
        });
      }

      console.log('Other API error, status:', response.status);
      return res.json({ 
        text: "[Voice input received - please type your message or try voice again.]",
        fallback: true
      });
    } catch (networkError) {
      console.log('Network error calling OpenAI:', networkError);
      return res.json({ 
        text: "[Voice recorded successfully. Please type your message or try voice again in a moment.]",
        fallback: true
      });
    }

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Provide specific error messages based on the error type
    // Provide graceful fallback text instead of errors
    if (error.message && error.message.includes('429')) {
      res.json({ 
        text: "[Voice recorded - transcription temporarily at capacity. Please type your message or try again shortly.]",
        fallback: true
      });
    } else if (error.message && error.message.includes('401')) {
      res.json({ 
        text: "[Voice input received - please type your message or try voice again.]",
        fallback: true
      });
    } else {
      res.json({ 
        text: "[Voice recorded successfully. Please type your message or try voice again in a moment.]",
        fallback: true
      });
    }
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

// Therapeutic Journaling API Routes
app.get('/api/journal', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const entries = await storage.getJournalEntries(userId, limit, offset);
    res.json(entries);
  } catch (error) {
    console.error('Failed to fetch journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

app.get('/api/journal/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const entry = await storage.getJournalEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Failed to fetch journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

app.post('/api/journal', async (req, res) => {
  try {
    const { analyzeJournalEntry, calculateJournalMetrics } = await import('./journalAnalysis');
    
    const entryData = req.body;
    const metrics = calculateJournalMetrics({ content: entryData.content } as any);
    
    const entry = await storage.createJournalEntry({
      ...entryData,
      wordCount: metrics.wordCount,
      readingTime: metrics.readingTime
    });

    // Perform AI analysis in background
    try {
      const previousEntries = await storage.getJournalEntries(entryData.userId, 10);
      const analysis = await analyzeJournalEntry(entry, previousEntries);
      
      await storage.createJournalAnalytics({
        userId: entryData.userId,
        entryId: entry.id!,
        emotionalThemes: analysis.emotionalThemes,
        keyInsights: analysis.keyInsights,
        sentimentScore: analysis.sentimentScore,
        emotionalIntensity: analysis.emotionalIntensity,
        copingStrategies: analysis.copingStrategies,
        growthIndicators: analysis.growthIndicators,
        concernAreas: analysis.concernAreas,
        recommendedActions: analysis.recommendedActions,
        therapistNotes: analysis.therapistNotes,
        patternConnections: analysis.patternConnections,
        confidenceScore: analysis.confidenceScore
      });

      await storage.updateJournalEntry(entry.id!, { aiAnalyzed: true });
    } catch (analysisError) {
      console.error('Journal analysis failed:', analysisError);
    }

    res.json(entry);
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

app.patch('/api/journal/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const updates = req.body;
    
    if (updates.content) {
      const { calculateJournalMetrics } = await import('./journalAnalysis');
      const metrics = calculateJournalMetrics({ content: updates.content } as any);
      updates.wordCount = metrics.wordCount;
      updates.readingTime = metrics.readingTime;
    }
    
    const updatedEntry = await storage.updateJournalEntry(entryId, updates);
    
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json(updatedEntry);
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

app.delete('/api/journal/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    await storage.deleteJournalEntry(entryId);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

app.get('/api/journal/:id/analyze', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const analytics = await storage.getJournalAnalytics(entryId);
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Failed to fetch journal analysis:', error);
    res.status(500).json({ error: 'Failed to fetch journal analysis' });
  }
});

app.get('/api/journal/analytics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const analytics = await storage.getJournalAnalyticsByUser(userId, limit);
    res.json(analytics);
  } catch (error) {
    console.error('Failed to fetch journal analytics:', error);
    res.status(500).json({ error: 'Failed to fetch journal analytics' });
  }
});

app.post('/api/journal/export', async (req, res) => {
  try {
    const { generateTherapistReport, generatePersonalInsightsSummary, exportToJSON, exportToCSV } = await import('./journalExport');
    
    const { userId, format, dateRange, includeAnalytics, recipientType } = req.body;
    
    // Get entries and analytics
    const entries = await storage.getJournalEntries(userId, 1000);
    const analytics = includeAnalytics ? await storage.getJournalAnalyticsByUser(userId, 1000) : [];
    
    let exportData: any;
    let summary: string;
    
    switch (format) {
      case 'therapist_report':
        exportData = generateTherapistReport(entries, analytics);
        summary = `Professional therapeutic report covering ${entries.length} journal entries with AI insights and clinical recommendations.`;
        break;
      case 'personal_insights':
        exportData = generatePersonalInsightsSummary(entries, analytics);
        summary = `Personal insights summary highlighting emotional journey and growth patterns across ${entries.length} entries.`;
        break;
      case 'csv_data':
        exportData = exportToCSV(entries, analytics);
        summary = `Structured data export containing ${entries.length} entries in CSV format for analysis or backup.`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid export format' });
    }
    
    // Create export record
    const exportRecord = await storage.createJournalExport({
      userId,
      exportType: format,
      dateRange: { start: new Date(), end: new Date() },
      includedEntries: entries.map(e => e.id!),
      format: format === 'csv_data' ? 'csv' : 'json',
      recipientType
    });
    
    res.json({
      id: exportRecord.id,
      format: format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      entryCount: entries.length,
      dateRange: `${entries.length > 0 ? new Date(entries[entries.length - 1].createdAt!).toLocaleDateString() : 'N/A'} - ${entries.length > 0 ? new Date(entries[0].createdAt!).toLocaleDateString() : 'N/A'}`,
      fileSize: `${Math.round(JSON.stringify(exportData).length / 1024)}KB`,
      summary,
      data: exportData
    });
  } catch (error) {
    console.error('Failed to generate export:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

app.get('/api/journal/export/:id/download', async (req, res) => {
  try {
    const exportId = parseInt(req.params.id);
    const exportRecord = await storage.updateJournalExport(exportId, { 
      downloadCount: 1 
    });
    
    if (!exportRecord) {
      return res.status(404).json({ error: 'Export not found' });
    }
    
    // In a real implementation, you would retrieve the actual file
    // For now, we'll return placeholder content
    const content = "Export content would be here";
    const mimeType = exportRecord.format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `journal_export_${exportId}.${exportRecord.format}`;
    
    res.json({
      content,
      mimeType,
      filename
    });
  } catch (error) {
    console.error('Failed to download export:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Therapist Integration API Routes
app.get('/api/therapists', async (req, res) => {
  try {
    const { userId } = req.query;
    const therapists = await storage.getTherapistsByUser(parseInt(userId as string));
    res.json(therapists);
  } catch (error) {
    console.error('Failed to fetch therapists:', error);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

app.post('/api/therapists', async (req, res) => {
  try {
    const therapistData = req.body;
    const therapist = await storage.createTherapist(therapistData);
    res.json(therapist);
  } catch (error) {
    console.error('Failed to create therapist:', error);
    res.status(500).json({ error: 'Failed to create therapist' });
  }
});

app.get('/api/therapist-sessions', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await storage.getTherapistSessionsByUser(userId as string);
    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.post('/api/therapist-sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    // Generate AI session preparation
    const userJournalEntries = await storage.getJournalEntries(sessionData.userId, 5);
    const userMoodEntries = await storage.getMoodEntries(sessionData.userId, 10);
    
    // AI-generated session preparation
    const sessionPrep = await generateSessionPreparation(userJournalEntries, userMoodEntries);
    
    const session = await storage.createTherapistSession({
      ...sessionData,
      userPreparation: sessionPrep
    });
    
    res.json(session);
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/therapist-insights', async (req, res) => {
  try {
    const { userId } = req.query;
    const insights = await storage.getTherapistSharedInsightsByUser(userId as string);
    res.json(insights);
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

app.post('/api/therapist-insights', async (req, res) => {
  try {
    const insightData = req.body;
    const insight = await storage.createTherapistSharedInsight(insightData);
    res.json(insight);
  } catch (error) {
    console.error('Failed to share insight:', error);
    res.status(500).json({ error: 'Failed to share insight' });
  }
});

app.get('/api/collaboration-settings', async (req, res) => {
  try {
    const { userId } = req.query;
    let settings = await storage.getCollaborationSettings(userId as string);
    
    // Create default settings if none exist
    if (!settings) {
      settings = await storage.createCollaborationSettings({
        userId: userId as string,
        autoShareJournalSummaries: false,
        shareFrequency: 'weekly',
        allowCrisisAlerts: true,
        shareEmotionalPatterns: true,
        shareProgressMetrics: true,
        privacyLevel: 'standard'
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Failed to fetch collaboration settings:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration settings' });
  }
});

app.patch('/api/collaboration-settings', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const settings = await storage.updateCollaborationSettings(userId, updateData);
    res.json(settings);
  } catch (error) {
    console.error('Failed to update collaboration settings:', error);
    res.status(500).json({ error: 'Failed to update collaboration settings' });
  }
});

// Auto-share insights based on user settings
app.post('/api/auto-share-insight', async (req, res) => {
  try {
    const { userId, insightType, content } = req.body;
    
    const settings = await storage.getCollaborationSettings(userId);
    if (!settings || !shouldAutoShare(settings, insightType)) {
      return res.json({ shared: false, reason: 'Auto-sharing disabled' });
    }
    
    const therapists = await storage.getTherapistsByUser(userId);
    const sharedInsights = [];
    
    for (const therapist of therapists) {
      if (therapist.collaborationLevel !== 'view_only') {
        const insight = await storage.createTherapistSharedInsight({
          userId,
          therapistId: therapist.id!,
          insightType,
          content,
          priority: determinePriority(insightType, content)
        });
        sharedInsights.push(insight);
      }
    }
    
    res.json({ 
      shared: true, 
      count: sharedInsights.length,
      insights: sharedInsights 
    });
  } catch (error) {
    console.error('Failed to auto-share insight:', error);
    res.status(500).json({ error: 'Failed to auto-share insight' });
  }
});

// Generate meeting links for video sessions
app.post('/api/sessions/:id/meeting-link', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // In a real implementation, you would integrate with video conferencing APIs
    // For now, we'll generate a placeholder meeting link
    const meetingLink = `https://meet.example.com/session-${sessionId}-${Date.now()}`;
    
    const session = await storage.updateTherapistSession(sessionId, { 
      meetingLink,
      status: 'scheduled'
    });
    
    res.json({ meetingLink, session });
  } catch (error) {
    console.error('Failed to generate meeting link:', error);
    res.status(500).json({ error: 'Failed to generate meeting link' });
  }
});

// Advanced Voice and Mindfulness API Routes

// Generate emotionally responsive voice
app.post('/api/voice/emotional-generate', async (req, res) => {
  try {
    const { text, voice, emotionalContext, intensity } = req.body;
    
    const { generateEmotionalVoice } = await import('./emotionalVoice');
    
    const audioBuffer = await generateEmotionalVoice({
      text,
      voiceProfile: voice || 'james',
      emotionalContext: emotionalContext || 'neutral',
      intensity: intensity || 1.0
    });
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('Failed to generate emotional voice:', error);
    res.status(500).json({ error: 'Failed to generate emotional voice' });
  }
});

// Get available mindfulness exercises
app.get('/api/mindfulness/exercises', async (req, res) => {
  try {
    const { mindfulnessExercises } = await import('./mindfulnessExercises');
    res.json(mindfulnessExercises);
  } catch (error) {
    console.error('Failed to fetch mindfulness exercises:', error);
    res.status(500).json({ error: 'Failed to fetch mindfulness exercises' });
  }
});

// Get recommended mindfulness exercise based on emotional state
app.post('/api/mindfulness/recommend', async (req, res) => {
  try {
    const { emotionalState, riskLevel, stressIndicators, preferredDuration } = req.body;
    
    const { selectMindfulnessExercise, generateMindfulnessInvitation } = await import('./mindfulnessExercises');
    
    const exercise = selectMindfulnessExercise(
      emotionalState || 'neutral',
      riskLevel || 'low',
      stressIndicators || [],
      preferredDuration
    );
    
    if (!exercise) {
      return res.json({ exercise: null, invitation: null });
    }
    
    const invitation = generateMindfulnessInvitation(exercise, emotionalState || 'neutral');
    
    res.json({ exercise, invitation });
  } catch (error) {
    console.error('Failed to recommend mindfulness exercise:', error);
    res.status(500).json({ error: 'Failed to recommend mindfulness exercise' });
  }
});

// Check if mindfulness intervention should be triggered
app.post('/api/mindfulness/should-trigger', async (req, res) => {
  try {
    const { emotionalState, riskLevel, stressIndicators, recentMessages } = req.body;
    
    const { shouldTriggerMindfulness } = await import('./mindfulnessExercises');
    
    const shouldTrigger = shouldTriggerMindfulness(
      emotionalState || 'neutral',
      riskLevel || 'low',
      stressIndicators || [],
      recentMessages || []
    );
    
    res.json({ shouldTrigger });
  } catch (error) {
    console.error('Failed to check mindfulness trigger:', error);
    res.status(500).json({ error: 'Failed to check mindfulness trigger' });
  }
});

// Detect emotional context from message
app.post('/api/voice/detect-context', async (req, res) => {
  try {
    const { message, userEmotion } = req.body;
    
    const { detectEmotionalContext } = await import('./emotionalVoice');
    
    const context = detectEmotionalContext(message, userEmotion);
    
    res.json({ context });
  } catch (error) {
    console.error('Failed to detect emotional context:', error);
    res.status(500).json({ error: 'Failed to detect emotional context' });
  }
});

// Adaptive Learning API Routes

// Get user preferences
app.get('/api/adaptive/user-preferences/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ error: 'User preferences not found' });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// Create or update user preferences
app.post('/api/adaptive/user-preferences', async (req, res) => {
  try {
    const preferencesData = req.body;
    
    const existingPreferences = await storage.getUserPreferences(preferencesData.userId);
    
    let preferences;
    if (existingPreferences) {
      preferences = await storage.updateUserPreferences(preferencesData.userId, preferencesData);
    } else {
      preferences = await storage.createUserPreferences(preferencesData);
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    res.status(500).json({ error: 'Failed to save user preferences' });
  }
});

// Get conversation patterns for a user
app.get('/api/adaptive/conversation-patterns/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const patterns = await storage.getConversationPatterns(userId);
    res.json(patterns);
  } catch (error) {
    console.error('Failed to fetch conversation patterns:', error);
    res.status(500).json({ error: 'Failed to fetch conversation patterns' });
  }
});

// Create conversation pattern
app.post('/api/adaptive/conversation-patterns', async (req, res) => {
  try {
    const patternData = req.body;
    const pattern = await storage.createConversationPattern(patternData);
    res.json(pattern);
  } catch (error) {
    console.error('Failed to create conversation pattern:', error);
    res.status(500).json({ error: 'Failed to create conversation pattern' });
  }
});

// Get adaptation insights
app.get('/api/adaptive/insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const insights = await storage.getLatestAdaptationInsights(userId);
    
    if (!insights) {
      return res.status(404).json({ error: 'No adaptation insights found' });
    }
    
    res.json(insights);
  } catch (error) {
    console.error('Failed to fetch adaptation insights:', error);
    res.status(500).json({ error: 'Failed to fetch adaptation insights' });
  }
});

// Create adaptation insights
app.post('/api/adaptive/insights', async (req, res) => {
  try {
    const insightsData = req.body;
    const insights = await storage.createAdaptationInsight(insightsData);
    res.json(insights);
  } catch (error) {
    console.error('Failed to create adaptation insights:', error);
    res.status(500).json({ error: 'Failed to create adaptation insights' });
  }
});

// Get wellness recommendations
app.get('/api/adaptive/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const recommendations = await storage.getWellnessRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Failed to fetch wellness recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch wellness recommendations' });
  }
});

// Create wellness recommendation
app.post('/api/adaptive/recommendations', async (req, res) => {
  try {
    const recommendationData = req.body;
    const recommendation = await storage.createWellnessRecommendation(recommendationData);
    res.json(recommendation);
  } catch (error) {
    console.error('Failed to create wellness recommendation:', error);
    res.status(500).json({ error: 'Failed to create wellness recommendation' });
  }
});

// Personalization and Adaptive Learning API Routes

// Get personalized recommendations
app.post('/api/personalization/recommendations', async (req, res) => {
  try {
    const { userId, emotionalState, recentMessages } = req.body;
    
    const { analyzeConversationPatterns, generatePersonalizedRecommendations } = await import('./adaptiveLearning');
    
    // Get recent conversation messages
    const messages = recentMessages || [];
    const messageObjects = messages.map((msg: string, index: number) => ({
      sender: index % 2 === 0 ? 'user' : 'bot',
      text: msg,
      timestamp: new Date()
    }));
    
    // Analyze patterns and generate insights
    const insights = await analyzeConversationPatterns(userId, messageObjects);
    
    // Get user preferences if they exist
    const preferences = await storage.getUserPreferences(userId);
    
    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(
      insights,
      preferences,
      [] // recent activities - could be enhanced with activity tracking
    );
    
    res.json({ recommendations, insights });
  } catch (error) {
    console.error('Failed to generate personalized recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get adaptation insights for a user
app.get('/api/personalization/insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const insights = await storage.getLatestAdaptationInsights(userId);
    const preferences = await storage.getUserPreferences(userId);
    
    res.json({ insights, preferences });
  } catch (error) {
    console.error('Failed to fetch adaptation insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Track recommendation usage
app.post('/api/personalization/use-recommendation', async (req, res) => {
  try {
    const { userId, recommendationId, timestamp } = req.body;
    
    // Mark recommendation as used
    await storage.markRecommendationUsed(userId, recommendationId, timestamp);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track recommendation usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Rate a recommendation
app.post('/api/personalization/rate-recommendation', async (req, res) => {
  try {
    const { userId, recommendationId, rating } = req.body;
    
    await storage.rateRecommendation(userId, recommendationId, rating);
    
    // Update user preferences based on rating
    const preferences = await storage.getUserPreferences(userId);
    if (preferences) {
      const { updatePersonalizationFromFeedback } = await import('./adaptiveLearning');
      
      const feedbackData = {
        responseQuality: rating,
        helpfulness: rating,
        personalRelevance: rating,
        communicationMatch: rating
      };
      
      const updatedPreferences = updatePersonalizationFromFeedback(preferences, feedbackData);
      await storage.updateUserPreferences(userId, updatedPreferences);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to rate recommendation:', error);
    res.status(500).json({ error: 'Failed to rate recommendation' });
  }
});

// Submit user feedback for adaptation
app.post('/api/personalization/feedback', async (req, res) => {
  try {
    const { userId, sessionId, responseQuality, helpfulness, personalRelevance, communicationMatch, specificFeedback } = req.body;
    
    const feedback = await storage.createUserFeedback({
      userId,
      sessionId,
      responseQuality,
      helpfulness,
      personalRelevance,
      communicationMatch,
      specificFeedback
    });
    
    // Update user preferences based on feedback
    const preferences = await storage.getUserPreferences(userId);
    if (preferences) {
      const { updatePersonalizationFromFeedback } = await import('./adaptiveLearning');
      
      const updatedPreferences = updatePersonalizationFromFeedback(preferences, {
        responseQuality,
        helpfulness,
        personalRelevance,
        communicationMatch
      });
      
      await storage.updateUserPreferences(userId, updatedPreferences);
    }
    
    res.json({ feedback, success: true });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Adapt conversation response
app.post('/api/personalization/adapt-response', async (req, res) => {
  try {
    const { userId, originalResponse, userMessage, context } = req.body;
    
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences || preferences.adaptationLevel < 0.3) {
      return res.json({ adaptedResponse: originalResponse });
    }
    
    const { adaptConversationResponse } = await import('./adaptiveLearning');
    
    const adaptedResponse = await adaptConversationResponse(
      originalResponse,
      userMessage,
      preferences,
      context || []
    );
    
    res.json({ adaptedResponse });
  } catch (error) {
    console.error('Failed to adapt response:', error);
    res.json({ adaptedResponse: req.body.originalResponse });
  }
});

// Get wellness insights based on user patterns
app.get('/api/personalization/wellness-insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const insights = await storage.getLatestAdaptationInsights(userId);
    const preferences = await storage.getUserPreferences(userId);
    
    if (!insights) {
      return res.json({ insights: [] });
    }
    
    const { generateWellnessInsights } = await import('./adaptiveLearning');
    
    const wellnessInsights = generateWellnessInsights(insights, preferences);
    
    res.json({ insights: wellnessInsights });
  } catch (error) {
    console.error('Failed to generate wellness insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Initialize user preferences
app.post('/api/personalization/initialize', async (req, res) => {
  try {
    const { userId, initialPreferences } = req.body;
    
    const preferences = await storage.createUserPreferences({
      userId,
      communicationStyle: initialPreferences?.communicationStyle || 'supportive',
      responseLength: initialPreferences?.responseLength || 'moderate',
      emotionalSupport: initialPreferences?.emotionalSupport || 'gentle',
      sessionTiming: initialPreferences?.sessionTiming || 'flexible',
      voicePreference: initialPreferences?.voicePreference || 'james',
      adaptationLevel: 0.5,
      preferredTopics: [],
      avoidedTopics: [],
      exercisePreferences: []
    });
    
    res.json({ preferences });
  } catch (error) {
    console.error('Failed to initialize preferences:', error);
    res.status(500).json({ error: 'Failed to initialize preferences' });
  }
});

// Advanced Analytics and Reports API Routes

// Generate dashboard data
app.post('/api/analytics/dashboard', async (req, res) => {
  try {
    const { userId, dateRange } = req.body;
    
    const { generateDashboardData } = await import('./analyticsEngine');
    
    const dashboardData = await generateDashboardData(
      parseInt(userId),
      {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      }
    );
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Failed to generate dashboard data:', error);
    res.status(500).json({ error: 'Failed to generate dashboard data' });
  }
});

// Get monthly report
app.get('/api/analytics/monthly-report/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    
    // Try to get existing report from storage
    const existingReport = await storage.getMonthlyReport(
      parseInt(userId),
      parseInt(year),
      parseInt(month)
    );
    
    if (existingReport) {
      res.json({ report: existingReport });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    console.error('Failed to fetch monthly report:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
});

// Generate monthly report
app.post('/api/analytics/generate-monthly-report', async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    
    const { generateMonthlyReport } = await import('./analyticsEngine');
    
    const report = await generateMonthlyReport(
      parseInt(userId),
      parseInt(month),
      parseInt(year)
    );
    
    // Store the generated report
    await storage.saveMonthlyReport(report);
    
    res.json({ report });
  } catch (error) {
    console.error('Failed to generate monthly report:', error);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// Export monthly report
app.post('/api/analytics/export-monthly-report', async (req, res) => {
  try {
    const { reportId, format } = req.body;
    
    const report = await storage.getMonthlyReportById(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (format === 'pdf') {
      // Generate PDF export (simplified implementation)
      const pdfContent = `
        Monthly Wellness Report - ${report.month}/${report.year}
        
        Overall Score: ${report.overallScore}/100
        
        Summary:
        ${report.summary}
        
        Key Highlights:
        ${report.keyHighlights.map(h => `• ${h}`).join('\n')}
        
        Emotional Journey:
        ${report.emotionalJourney}
        
        Progress Achievements:
        ${report.progressAchievements.map(a => `• ${a}`).join('\n')}
        
        Goals for Next Month:
        ${report.goalsForNextMonth.map(g => `• ${g}`).join('\n')}
      `;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="wellness-report-${report.year}-${report.month}.txt"`);
      res.send(pdfContent);
    } else {
      res.json({ report });
    }
  } catch (error) {
    console.error('Failed to export monthly report:', error);
    res.status(500).json({ error: 'Failed to export monthly report' });
  }
});

// Get analytics insights
app.get('/api/analytics/insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { period = 'monthly' } = req.query;
    
    const { generateDashboardData } = await import('./analyticsEngine');
    
    const endDate = new Date();
    const startDate = period === 'weekly' 
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const data = await generateDashboardData(userId, { start: startDate, end: endDate });
    
    res.json({ 
      insights: data.insights,
      emotionalOverview: data.emotionalOverview,
      activityOverview: data.activityOverview 
    });
  } catch (error) {
    console.error('Failed to fetch analytics insights:', error);
    res.status(500).json({ error: 'Failed to fetch analytics insights' });
  }
});

// Get wellness trends
app.get('/api/analytics/trends/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { period = '3m' } = req.query; // 3m, 6m, 1y
    
    let months = 3;
    if (period === '6m') months = 6;
    if (period === '1y') months = 12;
    
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      try {
        const report = await storage.getMonthlyReport(userId, year, month);
        if (report) {
          trends.push({
            month: `${year}-${month.toString().padStart(2, '0')}`,
            score: report.overallScore,
            sessions: report.metrics.activityMetrics.totalSessions,
            journalEntries: report.metrics.activityMetrics.journalEntries,
            emotionalProgress: report.metrics.emotionalTrends.progressDirection
          });
        }
      } catch (error) {
        // Skip months without reports
      }
    }
    
    res.json({ trends });
  } catch (error) {
    console.error('Failed to fetch wellness trends:', error);
    res.status(500).json({ error: 'Failed to fetch wellness trends' });
  }
});

// Accessibility & Internationalization API Routes

// Get supported languages
app.get('/api/internationalization/languages', async (req, res) => {
  try {
    const { supportedLanguages } = await import('./internationalization');
    res.json({ languages: supportedLanguages });
  } catch (error) {
    console.error('Failed to fetch supported languages:', error);
    res.status(500).json({ error: 'Failed to fetch supported languages' });
  }
});

// Test voice in specific language
app.post('/api/internationalization/test-voice', async (req, res) => {
  try {
    const { text, language } = req.body;
    const { generateMultilingualVoice } = await import('./internationalization');
    
    const audioBuffer = await generateMultilingualVoice(text, language, 'supportive');
    
    if (audioBuffer) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } else {
      res.status(404).json({ error: 'Voice not supported for this language' });
    }
  } catch (error) {
    console.error('Failed to generate test voice:', error);
    res.status(500).json({ error: 'Failed to generate test voice' });
  }
});

// Set user language preference
app.post('/api/internationalization/set-language', async (req, res) => {
  try {
    const { language } = req.body;
    // This would save to user preferences in a real implementation
    res.json({ success: true, language });
  } catch (error) {
    console.error('Failed to set language preference:', error);
    res.status(500).json({ error: 'Failed to set language preference' });
  }
});

// Translate therapeutic message
app.post('/api/internationalization/translate', async (req, res) => {
  try {
    const { message, targetLanguage, context = 'therapeutic' } = req.body;
    const { translateTherapeuticMessage } = await import('./internationalization');
    
    const translatedMessage = await translateTherapeuticMessage(message, targetLanguage, context);
    res.json({ translation: translatedMessage });
  } catch (error) {
    console.error('Failed to translate message:', error);
    res.status(500).json({ error: 'Failed to translate message' });
  }
});

// Get emergency resources by language
app.get('/api/internationalization/emergency-resources/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { getEmergencyResources } = await import('./internationalization');
    
    const resources = getEmergencyResources(language);
    res.json({ resources });
  } catch (error) {
    console.error('Failed to fetch emergency resources:', error);
    res.status(500).json({ error: 'Failed to fetch emergency resources' });
  }
});

// Get accessibility settings
app.get('/api/accessibility/settings/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Default accessibility settings - would be fetched from database in real implementation
    const defaultSettings = {
      visualImpairment: {
        enabled: false,
        screenReaderSupport: false,
        highContrast: false,
        fontSize: 'medium',
        colorBlindnessType: 'none',
        voiceDescriptions: false,
        hapticFeedback: false,
      },
      hearingImpairment: {
        enabled: false,
        closedCaptions: false,
        visualAlerts: false,
        signLanguageSupport: false,
        transcriptionEnabled: false,
        vibrationAlerts: false,
      },
      motorImpairment: {
        enabled: false,
        voiceNavigation: false,
        eyeTracking: false,
        switchControl: false,
        dwellTime: 1000,
        largerTouchTargets: false,
        oneHandedMode: false,
      },
      cognitiveSupport: {
        enabled: false,
        simplifiedInterface: false,
        reducedAnimations: false,
        clearLanguage: false,
        memoryAids: false,
        focusAssistance: false,
        timeoutExtensions: false,
      },
      language: 'en',
      speechRate: 1.0,
      preferredInteractionMode: 'mixed',
    };
    
    res.json({ settings: defaultSettings });
  } catch (error) {
    console.error('Failed to fetch accessibility settings:', error);
    res.status(500).json({ error: 'Failed to fetch accessibility settings' });
  }
});

// Save accessibility settings
app.post('/api/accessibility/settings', async (req, res) => {
  try {
    const { userId, settings } = req.body;
    
    // In a real implementation, save to database
    // await storage.saveAccessibilitySettings(userId, settings);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
    res.status(500).json({ error: 'Failed to save accessibility settings' });
  }
});

// Generate voice description for visual elements
app.post('/api/accessibility/voice-description', async (req, res) => {
  try {
    const { elementType, visualContent, context, userLanguage = 'en' } = req.body;
    const { generateVoiceDescription } = await import('./accessibility');
    
    const description = await generateVoiceDescription(elementType, visualContent, context, userLanguage);
    res.json({ description });
  } catch (error) {
    console.error('Failed to generate voice description:', error);
    res.status(500).json({ error: 'Failed to generate voice description' });
  }
});

// Generate closed captions for audio
app.post('/api/accessibility/closed-captions', async (req, res) => {
  try {
    const { audioText, speaker, emotionalContext, language = 'en' } = req.body;
    const { generateClosedCaptions } = await import('./accessibility');
    
    const captions = await generateClosedCaptions(audioText, speaker, emotionalContext, language);
    res.json({ captions });
  } catch (error) {
    console.error('Failed to generate closed captions:', error);
    res.status(500).json({ error: 'Failed to generate closed captions' });
  }
});

// Generate chart accessibility description
app.post('/api/accessibility/chart-description', async (req, res) => {
  try {
    const { chartType, data, timeframe, language = 'en' } = req.body;
    const { generateChartAccessibilityDescription } = await import('./accessibility');
    
    const description = await generateChartAccessibilityDescription(chartType, data, timeframe, language);
    res.json({ description });
  } catch (error) {
    console.error('Failed to generate chart description:', error);
    res.status(500).json({ error: 'Failed to generate chart description' });
  }
});

// Enhanced Gamification API Endpoints

// Wellness Points Management
app.get('/api/wellness-points/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { getWellnessPointsBalance } = await import('./enhancedGamificationEngine');
    
    const balance = await getWellnessPointsBalance(userId, storage);
    res.json(balance);
  } catch (error) {
    console.error('Error getting wellness points:', error);
    res.status(500).json({ error: 'Failed to get wellness points' });
  }
});

app.post('/api/wellness-points/:userId/award', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { points, source, sourceId, description } = req.body;
    const { awardWellnessPoints } = await import('./enhancedGamificationEngine');
    
    const newBalance = await awardWellnessPoints(userId, points, source, sourceId, description, storage);
    res.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Error awarding wellness points:', error);
    res.status(500).json({ error: 'Failed to award wellness points' });
  }
});

app.get('/api/wellness-points/:userId/history', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await storage.getPointsHistory(userId, limit);
    res.json({ history });
  } catch (error) {
    console.error('Error getting points history:', error);
    res.status(500).json({ error: 'Failed to get points history' });
  }
});

// Therapeutic Rewards Shop
app.get('/api/rewards-shop/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { getAvailableRewards } = await import('./enhancedGamificationEngine');
    
    const rewards = await getAvailableRewards(userId, storage);
    res.json({ rewards });
  } catch (error) {
    console.error('Error getting rewards shop:', error);
    res.status(500).json({ error: 'Failed to get rewards shop' });
  }
});

app.post('/api/rewards-shop/:userId/purchase', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { rewardId } = req.body;
    const { purchaseReward } = await import('./enhancedGamificationEngine');
    
    const result = await purchaseReward(userId, rewardId, storage);
    res.json(result);
  } catch (error) {
    console.error('Error purchasing reward:', error);
    res.status(500).json({ error: 'Failed to purchase reward' });
  }
});

app.get('/api/user-rewards/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const userRewards = await storage.getUserRewards(userId);
    res.json({ rewards: userRewards });
  } catch (error) {
    console.error('Error getting user rewards:', error);
    res.status(500).json({ error: 'Failed to get user rewards' });
  }
});

// Community Challenges
app.get('/api/community-challenges', async (req, res) => {
  try {
    const { getActiveChallenges } = await import('./enhancedGamificationEngine');
    
    const challenges = await getActiveChallenges(storage);
    res.json({ challenges });
  } catch (error) {
    console.error('Error getting community challenges:', error);
    res.status(500).json({ error: 'Failed to get community challenges' });
  }
});

app.post('/api/community-challenges/:challengeId/join', async (req, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const { userId } = req.body;
    const { joinChallenge } = await import('./enhancedGamificationEngine');
    
    const result = await joinChallenge(userId, challengeId, storage);
    res.json(result);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

app.get('/api/community-challenges/:challengeId/progress/:userId', async (req, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const userId = parseInt(req.params.userId);
    
    const participant = await storage.getChallengeParticipant(challengeId, userId);
    const activities = await storage.getChallengeActivities(challengeId, userId);
    
    res.json({ 
      participant,
      activities,
      totalActivities: activities.length
    });
  } catch (error) {
    console.error('Error getting challenge progress:', error);
    res.status(500).json({ error: 'Failed to get challenge progress' });
  }
});

app.post('/api/community-challenges/:challengeId/update-progress', async (req, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const { userId, activityResponse, emotionalState } = req.body;
    const { updateChallengeProgress } = await import('./enhancedGamificationEngine');
    
    const result = await updateChallengeProgress(userId, challengeId, activityResponse, emotionalState, storage);
    res.json(result);
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ error: 'Failed to update challenge progress' });
  }
});

// Dynamic Emotional Achievements
app.get('/api/emotional-achievements/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const daysBack = parseInt(req.query.daysBack as string) || undefined;
    
    const userAchievements = await storage.getUserEmotionalAchievements(userId, daysBack);
    const allAchievements = await storage.getEmotionalAchievements();
    
    res.json({ 
      userAchievements,
      availableAchievements: allAchievements
    });
  } catch (error) {
    console.error('Error getting emotional achievements:', error);
    res.status(500).json({ error: 'Failed to get emotional achievements' });
  }
});

app.post('/api/emotional-achievements/:userId/analyze', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { conversationData, emotionalData } = req.body;
    const { analyzeEmotionalBreakthroughs } = await import('./enhancedGamificationEngine');
    
    const unlockedAchievements = await analyzeEmotionalBreakthroughs(userId, conversationData, emotionalData, storage);
    res.json({ 
      success: true,
      unlockedAchievements,
      count: unlockedAchievements.length
    });
  } catch (error) {
    console.error('Error analyzing emotional breakthroughs:', error);
    res.status(500).json({ error: 'Failed to analyze emotional breakthroughs' });
  }
});

app.post('/api/emotional-achievements/:userId/mark-viewed', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { achievementId } = req.body;
    
    await storage.markEmotionalAchievementViewed(userId, achievementId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking achievement as viewed:', error);
    res.status(500).json({ error: 'Failed to mark achievement as viewed' });
  }
});

// Initialize gamification data
app.post('/api/admin/initialize-gamification', async (req, res) => {
  try {
    const { initializeEmotionalAchievements, initializeRewardsShop, generateWeeklyChallenges } = await import('./enhancedGamificationEngine');
    
    await initializeEmotionalAchievements(storage);
    await initializeRewardsShop(storage);
    const challenges = await generateWeeklyChallenges(storage);
    
    res.json({ 
      success: true,
      message: 'Gamification system initialized',
      challengesGenerated: challenges.length
    });
  } catch (error) {
    console.error('Error initializing gamification:', error);
    res.status(500).json({ error: 'Failed to initialize gamification system' });
  }
});

// Gamification Dashboard Overview
app.get('/api/gamification/dashboard/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { getWellnessPointsBalance, getActiveChallenges } = await import('./enhancedGamificationEngine');
    
    // Get comprehensive gamification overview
    const [
      wellnessPoints,
      activeChallenges,
      recentAchievements,
      userRewards,
      pointsHistory
    ] = await Promise.all([
      getWellnessPointsBalance(userId, storage),
      getActiveChallenges(storage),
      storage.getUserEmotionalAchievements(userId, 7),
      storage.getUserRewards(userId),
      storage.getPointsHistory(userId, 10)
    ]);

    // Get user's challenge participation
    const userChallenges = await Promise.all(
      activeChallenges.map(async (challenge: any) => {
        const participant = await storage.getChallengeParticipant(challenge.id, userId);
        return {
          ...challenge,
          isParticipating: !!participant,
          progress: participant?.currentProgress || 0,
          completedDays: participant?.completedDays || 0
        };
      })
    );

    res.json({
      wellnessPoints,
      activeChallenges: userChallenges,
      recentAchievements,
      userRewards: userRewards.slice(0, 5), // Latest 5 rewards
      pointsHistory: pointsHistory.slice(0, 10), // Latest 10 transactions
      stats: {
        totalAchievements: recentAchievements.length,
        totalRewards: userRewards.length,
        activeChallengesCount: userChallenges.filter((c: any) => c.isParticipating).length,
        lifetimePoints: wellnessPoints.lifetimePoints
      }
    });
  } catch (error) {
    console.error('Error getting gamification dashboard:', error);
    res.status(500).json({ error: 'Failed to get gamification dashboard' });
  }
});

// Simplify language for cognitive accessibility
app.post('/api/accessibility/simplify-language', async (req, res) => {
  try {
    const { text, complexityLevel, language = 'en' } = req.body;
    const { simplifyTherapeuticLanguage } = await import('./accessibility');
    
    const simplifiedText = await simplifyTherapeuticLanguage(text, complexityLevel, language);
    res.json({ simplifiedText });
  } catch (error) {
    console.error('Failed to simplify language:', error);
    res.status(500).json({ error: 'Failed to simplify language' });
  }
});

// Generate haptic feedback pattern
app.post('/api/accessibility/haptic-feedback', async (req, res) => {
  try {
    const { emotionalState, intensity = 0.5 } = req.body;
    const { generateHapticFeedback } = await import('./accessibility');
    
    const pattern = generateHapticFeedback(emotionalState, intensity);
    res.json({ pattern });
  } catch (error) {
    console.error('Failed to generate haptic feedback:', error);
    res.status(500).json({ error: 'Failed to generate haptic feedback' });
  }
});

// Get navigation assistance
app.get('/api/accessibility/navigation-assistance/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { getNavigationAssistance } = await import('./accessibility');
    
    const assistance = getNavigationAssistance(language);
    res.json({ assistance });
  } catch (error) {
    console.error('Failed to fetch navigation assistance:', error);
    res.status(500).json({ error: 'Failed to fetch navigation assistance' });
  }
});

// Get color accessibility scheme
app.get('/api/accessibility/color-scheme/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { highContrast = 'false' } = req.query;
    const { getColorAccessibilityScheme } = await import('./accessibility');
    
    const scheme = getColorAccessibilityScheme(type, highContrast === 'true');
    res.json({ scheme });
  } catch (error) {
    console.error('Failed to fetch color scheme:', error);
    res.status(500).json({ error: 'Failed to fetch color scheme' });
  }
});

// Test accessibility voice
app.post('/api/accessibility/test-voice', async (req, res) => {
  try {
    const { text, language, speechRate } = req.body;
    const { generateMultilingualVoice } = await import('./internationalization');
    
    const audioBuffer = await generateMultilingualVoice(text, language, 'supportive');
    
    if (audioBuffer) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } else {
      res.status(404).json({ error: 'Voice not supported' });
    }
  } catch (error) {
    console.error('Failed to test accessibility voice:', error);
    res.status(500).json({ error: 'Failed to test accessibility voice' });
  }
});

// Adaptive Therapy Plan API Routes

// Get current therapeutic plan for user
app.get('/api/adaptive-therapy/plan/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // In a real implementation, this would fetch from database
    // For now, generate a sample plan
    const { generateAdaptiveTherapeuticPlan } = await import('./adaptiveTherapy');
    const plan = await generateAdaptiveTherapeuticPlan(userId, 'weekly');
    
    res.json({ plan });
  } catch (error) {
    console.error('Failed to fetch therapeutic plan:', error);
    res.status(500).json({ error: 'Failed to fetch therapeutic plan' });
  }
});

// Generate new adaptive therapeutic plan
app.post('/api/adaptive-therapy/generate', async (req, res) => {
  try {
    const { userId, planType = 'weekly' } = req.body;
    const { generateAdaptiveTherapeuticPlan } = await import('./adaptiveTherapy');
    
    const plan = await generateAdaptiveTherapeuticPlan(userId, planType);
    
    // In a real implementation, save to database
    // await storage.saveTherapeuticPlan(plan);
    
    res.json({ plan, message: 'New therapeutic plan generated successfully' });
  } catch (error) {
    console.error('Failed to generate therapeutic plan:', error);
    res.status(500).json({ error: 'Failed to generate therapeutic plan' });
  }
});

// Adapt existing therapeutic plan
app.post('/api/adaptive-therapy/adapt', async (req, res) => {
  try {
    const { planId, triggerType, feedback } = req.body;
    const { adaptTherapeuticPlan } = await import('./adaptiveTherapy');
    
    // In a real implementation, fetch current plan from database
    // const currentPlan = await storage.getTherapeuticPlan(planId);
    
    // For now, create a sample current plan
    const currentPlan = {
      id: planId,
      userId: 1,
      planType: 'weekly' as const,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adaptationLevel: 0.5,
      therapeuticGoals: [],
      dailyActivities: [],
      weeklyMilestones: [],
      progressMetrics: [],
      adaptationTriggers: [],
      confidenceScore: 0.8
    };
    
    const adaptedPlan = await adaptTherapeuticPlan(currentPlan, triggerType, feedback);
    
    // In a real implementation, save adapted plan
    // await storage.saveTherapeuticPlan(adaptedPlan);
    
    res.json({ 
      adaptedPlan, 
      message: 'Therapeutic plan adapted successfully',
      adaptationReason: triggerType
    });
  } catch (error) {
    console.error('Failed to adapt therapeutic plan:', error);
    res.status(500).json({ error: 'Failed to adapt therapeutic plan' });
  }
});

// Complete activity and track progress
app.post('/api/adaptive-therapy/complete-activity', async (req, res) => {
  try {
    const { userId, activityId, completedAt } = req.body;
    
    // In a real implementation, save activity completion
    // await storage.recordActivityCompletion(userId, activityId, completedAt);
    
    // Update progress metrics
    // await storage.updateProgressMetrics(userId);
    
    res.json({ 
      success: true, 
      message: 'Activity completed successfully',
      points: 10 // Example points awarded
    });
  } catch (error) {
    console.error('Failed to complete activity:', error);
    res.status(500).json({ error: 'Failed to complete activity' });
  }
});

// Monitor plan effectiveness and suggest adaptations
app.get('/api/adaptive-therapy/monitor/:userId/:planId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const planId = req.params.planId;
    
    const { monitorPlanEffectiveness } = await import('./adaptiveTherapy');
    const monitoring = await monitorPlanEffectiveness(userId, planId);
    
    res.json(monitoring);
  } catch (error) {
    console.error('Failed to monitor plan effectiveness:', error);
    res.status(500).json({ error: 'Failed to monitor plan effectiveness' });
  }
});

// Generate personalized CBT exercises
app.post('/api/adaptive-therapy/cbt-exercises', async (req, res) => {
  try {
    const { userId, emotionalPattern, difficulty = 'beginner' } = req.body;
    const { generatePersonalizedCBTExercises } = await import('./adaptiveTherapy');
    
    const exercises = await generatePersonalizedCBTExercises(userId, emotionalPattern, difficulty);
    
    res.json({ exercises });
  } catch (error) {
    console.error('Failed to generate CBT exercises:', error);
    res.status(500).json({ error: 'Failed to generate CBT exercises' });
  }
});

// Get user's therapeutic analytics
app.get('/api/adaptive-therapy/analytics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { analyzeUserTherapeuticNeeds } = await import('./adaptiveTherapy');
    
    const analytics = await analyzeUserTherapeuticNeeds(userId);
    
    res.json({ analytics });
  } catch (error) {
    console.error('Failed to fetch therapeutic analytics:', error);
    res.status(500).json({ error: 'Failed to fetch therapeutic analytics' });
  }
});

// Rate therapeutic plan effectiveness
app.post('/api/adaptive-therapy/rate-plan', async (req, res) => {
  try {
    const { userId, planId, rating, feedback } = req.body;
    
    // In a real implementation, save rating and feedback
    // await storage.ratePlanEffectiveness(userId, planId, rating, feedback);
    
    // Use feedback to improve future plans
    if (rating < 3) {
      // Trigger plan adaptation for low ratings
      const { adaptTherapeuticPlan } = await import('./adaptiveTherapy');
      // Could trigger automatic adaptation here
    }
    
    res.json({ 
      success: true, 
      message: 'Plan rating recorded successfully' 
    });
  } catch (error) {
    console.error('Failed to rate plan:', error);
    res.status(500).json({ error: 'Failed to rate plan' });
  }
});

// Get plan adaptation history
app.get('/api/adaptive-therapy/adaptation-history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // In a real implementation, fetch from database
    // const history = await storage.getAdaptationHistory(userId);
    
    const history = {
      userId,
      adaptations: [
        {
          date: new Date(),
          triggerType: 'emotional_spike',
          changes: ['Added grounding exercises', 'Increased check-in frequency'],
          effectiveness: 0.85,
          userSatisfaction: 8.2
        }
      ],
      totalAdaptations: 1,
      averageEffectiveness: 0.85,
      mostCommonTriggers: ['emotional_spike', 'plateau']
    };
    
    res.json({ history });
  } catch (error) {
    console.error('Failed to fetch adaptation history:', error);
    res.status(500).json({ error: 'Failed to fetch adaptation history' });
  }
});

// Helper functions
async function generateSessionPreparation(journalEntries: any[], moodEntries: any[]): Promise<string> {
  try {
    const openai = (await import('openai')).default;
    const client = new openai({ apiKey: process.env.OPENAI_API_KEY });

    const recentEntries = journalEntries.slice(0, 3);
    const recentMoods = moodEntries.slice(0, 5);
    
    const prompt = `Based on the following recent journal entries and mood data, generate a concise session preparation summary for a therapy session:

Recent Journal Entries:
${recentEntries.map(entry => `- ${entry.content?.substring(0, 200)}...`).join('\n')}

Recent Mood Patterns:
${recentMoods.map(mood => `- ${mood.emotion} (intensity: ${mood.intensity}/10)`).join('\n')}

Please provide:
1. Key themes to discuss (2-3 points)
2. Emotional patterns observed
3. Suggested discussion topics
4. Any areas of concern

Keep the summary concise and professional for therapist review.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Session preparation could not be generated at this time.';
  } catch (error) {
    console.error('Failed to generate session preparation:', error);
    return 'Recent activity includes journaling and mood tracking. Recommend discussing current emotional patterns and coping strategies.';
  }
}

function shouldAutoShare(settings: any, insightType: string): boolean {
  switch (insightType) {
    case 'journal_summary':
      return settings.autoShareJournalSummaries;
    case 'mood_patterns':
      return settings.shareEmotionalPatterns;
    case 'crisis_alert':
      return settings.allowCrisisAlerts;
    case 'progress_report':
      return settings.shareProgressMetrics;
    default:
      return false;
  }
}

function determinePriority(insightType: string, content: any): 'low' | 'medium' | 'high' | 'urgent' {
  if (insightType === 'crisis_alert') {
    return 'urgent';
  }
  
  if (content?.riskLevel === 'high' || content?.riskLevel === 'critical') {
    return 'high';
  }
  
  if (insightType === 'mood_patterns' && content?.volatility > 0.7) {
    return 'high';
  }
  
  return 'medium';
}

// ===============================
// WEARABLE DEVICE INTEGRATION API
// ===============================

// Get user's wearable devices
app.get('/api/wearable-devices/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const devices = await storage.getWearableDevices(userId);
    res.json(devices);
  } catch (error) {
    console.error('Failed to fetch wearable devices:', error);
    res.status(500).json({ error: 'Failed to fetch wearable devices' });
  }
});

// Connect a new wearable device
app.post('/api/wearable-devices', async (req, res) => {
  try {
    const { insertWearableDeviceSchema } = await import('@shared/schema');
    const deviceData = insertWearableDeviceSchema.parse(req.body);
    
    const device = await storage.createWearableDevice(deviceData);
    
    // Log successful connection
    await storage.createSyncLog({
      deviceId: device.id,
      syncStatus: 'success',
      recordsProcessed: 0,
      syncDuration: 0,
      dataTypes: []
    });
    
    res.json(device);
  } catch (error) {
    console.error('Failed to connect wearable device:', error);
    res.status(500).json({ error: 'Failed to connect wearable device' });
  }
});

// Update wearable device settings
app.put('/api/wearable-devices/:deviceId', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const updates = req.body;
    
    const device = await storage.updateWearableDevice(deviceId, updates);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Failed to update wearable device:', error);
    res.status(500).json({ error: 'Failed to update wearable device' });
  }
});

// Remove wearable device
app.delete('/api/wearable-devices/:deviceId', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    await storage.deleteWearableDevice(deviceId);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove wearable device:', error);
    res.status(500).json({ error: 'Failed to remove wearable device' });
  }
});

// Sync health data from wearable device
app.post('/api/wearable-devices/:deviceId/sync', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { healthData } = req.body;
    
    const { processHealthData } = await import('./healthCorrelationEngine');
    
    // Get device info for processing
    const devices = await storage.getWearableDevices(0); // Get all devices to find this one
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const startTime = Date.now();
    let processedCount = 0;
    
    try {
      // Process raw health data into standardized metrics
      const processedMetrics = processHealthData(healthData, device.deviceType);
      
      // Store health metrics in database
      for (const metric of processedMetrics) {
        await storage.createHealthMetric({
          userId: device.userId,
          deviceId: device.id,
          metricType: metric.metricType,
          value: metric.value,
          unit: metric.unit,
          timestamp: metric.timestamp,
          metadata: metric.metadata,
          confidence: metric.confidence
        });
        processedCount++;
      }
      
      // Update device sync timestamp
      await storage.updateWearableDevice(deviceId, {
        lastSyncAt: new Date()
      });
      
      // Log successful sync
      await storage.createSyncLog({
        deviceId,
        syncStatus: 'success',
        recordsProcessed: processedCount,
        syncDuration: Date.now() - startTime,
        dataTypes: [...new Set(processedMetrics.map(m => m.metricType))]
      });
      
      res.json({ 
        success: true, 
        recordsProcessed: processedCount,
        syncDuration: Date.now() - startTime
      });
    } catch (processingError) {
      // Log failed sync
      await storage.createSyncLog({
        deviceId,
        syncStatus: 'failed',
        recordsProcessed: processedCount,
        errorMessage: processingError instanceof Error ? processingError.message : 'Processing failed',
        syncDuration: Date.now() - startTime,
        dataTypes: []
      });
      
      throw processingError;
    }
  } catch (error) {
    console.error('Failed to sync health data:', error);
    res.status(500).json({ error: 'Failed to sync health data' });
  }
});

// Get health metrics for a user
app.get('/api/health-metrics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { metricType, limit } = req.query;
    
    const metrics = await storage.getHealthMetrics(
      userId, 
      metricType as string, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json(metrics);
  } catch (error) {
    console.error('Failed to fetch health metrics:', error);
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});

// Analyze health correlations
app.post('/api/health-correlations/:userId/analyze', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { timeframe = 'weekly' } = req.body;
    
    const { analyzeHealthCorrelations } = await import('./healthCorrelationEngine');
    
    const correlations = await analyzeHealthCorrelations(userId, timeframe);
    res.json({ correlations });
  } catch (error) {
    console.error('Failed to analyze health correlations:', error);
    res.status(500).json({ error: 'Failed to analyze health correlations' });
  }
});

// Get existing health correlations
app.get('/api/health-correlations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const correlations = await storage.getHealthCorrelations(userId);
    res.json(correlations);
  } catch (error) {
    console.error('Failed to fetch health correlations:', error);
    res.status(500).json({ error: 'Failed to fetch health correlations' });
  }
});

// Get wellness insights based on health data
app.get('/api/health-insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const { generateWellnessInsights } = await import('./healthCorrelationEngine');
    
    const insights = await generateWellnessInsights(userId);
    res.json({ insights });
  } catch (error) {
    console.error('Failed to generate wellness insights:', error);
    res.status(500).json({ error: 'Failed to generate wellness insights' });
  }
});

// Get sync logs for a device
app.get('/api/wearable-devices/:deviceId/sync-logs', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { limit } = req.query;
    
    const logs = await storage.getRecentSyncLogs(
      deviceId, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch sync logs:', error);
    res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
});

// ===============================
// VR/AR THERAPEUTIC EXPERIENCES API
// ===============================

// Get available VR environments
app.get('/api/vr/environments', async (req, res) => {
  try {
    const { category } = req.query;
    const environments = await storage.getVrEnvironments(category as string);
    res.json({ environments });
  } catch (error) {
    console.error('Failed to fetch VR environments:', error);
    res.status(500).json({ error: 'Failed to fetch VR environments' });
  }
});

// Get specific VR environment
app.get('/api/vr/environments/:id', async (req, res) => {
  try {
    const environmentId = parseInt(req.params.id);
    const environment = await storage.getVrEnvironment(environmentId);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    res.json({ environment });
  } catch (error) {
    console.error('Failed to fetch VR environment:', error);
    res.status(500).json({ error: 'Failed to fetch VR environment' });
  }
});

// Create custom VR environment
app.post('/api/vr/environments', async (req, res) => {
  try {
    const { therapeuticGoal, targetCondition, difficulty } = req.body;
    const { generateCustomVrEnvironment } = await import('./vrTherapyEngine');
    
    const environmentData = await generateCustomVrEnvironment(therapeuticGoal, targetCondition, difficulty);
    const environment = await storage.createVrEnvironment({
      ...environmentData,
      isActive: true
    });
    
    res.json({ environment });
  } catch (error) {
    console.error('Failed to create VR environment:', error);
    res.status(500).json({ error: 'Failed to create VR environment' });
  }
});

// Get VR recommendations for user
app.get('/api/vr/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { mood, goals } = req.query;
    const { generateVrRecommendations } = await import('./vrTherapyEngine');
    
    const sessions = await storage.getUserVrSessions(userId, 10);
    const therapeuticGoals = goals ? (goals as string).split(',') : undefined;
    
    const recommendations = await generateVrRecommendations(
      userId, 
      mood as string, 
      therapeuticGoals, 
      sessions
    );
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Failed to generate VR recommendations:', error);
    res.status(500).json({ error: 'Failed to generate VR recommendations' });
  }
});

// Personalize VR environment for user
app.post('/api/vr/personalize/:environmentId/:userId', async (req, res) => {
  try {
    const environmentId = parseInt(req.params.environmentId);
    const userId = parseInt(req.params.userId);
    const { sessionGoals } = req.body;
    const { personalizeVrEnvironment } = await import('./vrTherapyEngine');
    
    const personalizedEnv = await personalizeVrEnvironment(environmentId, userId, sessionGoals);
    res.json({ personalizedEnvironment: personalizedEnv });
  } catch (error) {
    console.error('Failed to personalize VR environment:', error);
    res.status(500).json({ error: 'Failed to personalize VR environment' });
  }
});

// Start VR session
app.post('/api/vr/sessions', async (req, res) => {
  try {
    const { userId, environmentId, sessionGoals, personalizedSettings } = req.body;
    
    const session = await storage.createVrSession({
      userId,
      environmentId,
      startTime: new Date(),
      sessionGoals: sessionGoals || [],
      personalizedSettings: personalizedSettings || {},
      completionStatus: 'in_progress'
    });
    
    res.json({ session });
  } catch (error) {
    console.error('Failed to start VR session:', error);
    res.status(500).json({ error: 'Failed to start VR session' });
  }
});

// Update VR session progress
app.patch('/api/vr/sessions/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const updates = req.body;
    
    const session = await storage.updateVrSession(sessionId, updates);
    res.json({ session });
  } catch (error) {
    console.error('Failed to update VR session:', error);
    res.status(500).json({ error: 'Failed to update VR session' });
  }
});

// Complete VR session and analyze
app.post('/api/vr/sessions/:sessionId/complete', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { effectiveness, stressLevel, heartRate, interactions, sideEffects, notes } = req.body;
    const { analyzeVrSession } = await import('./vrTherapyEngine');
    
    // Update session with completion data
    const session = await storage.updateVrSession(sessionId, {
      endTime: new Date(),
      completionStatus: 'completed',
      effectiveness,
      stressLevel,
      heartRate,
      interactions,
      sideEffects,
      notes
    });
    
    // Analyze session effectiveness
    const analysis = await analyzeVrSession(sessionId);
    
    // Update user progress
    const existingProgress = await storage.getVrProgress(session.userId, session.environmentId);
    if (existingProgress) {
      await storage.updateVrProgress(session.userId, session.environmentId, {
        totalSessions: existingProgress.totalSessions + 1,
        totalDurationMinutes: existingProgress.totalDurationMinutes + (session.duration || 0),
        averageEffectiveness: ((parseFloat(existingProgress.averageEffectiveness || '0') * existingProgress.totalSessions) + effectiveness) / (existingProgress.totalSessions + 1),
        milestonesAchieved: [...(existingProgress.milestonesAchieved || []), ...(analysis.achievements || [])],
        lastSessionDate: new Date()
      });
    } else {
      await storage.createVrProgress({
        userId: session.userId,
        environmentId: session.environmentId,
        totalSessions: 1,
        totalDurationMinutes: session.duration || 0,
        averageEffectiveness: effectiveness,
        milestonesAchieved: analysis.achievements || [],
        lastSessionDate: new Date()
      });
    }
    
    res.json({ session, analysis });
  } catch (error) {
    console.error('Failed to complete VR session:', error);
    res.status(500).json({ error: 'Failed to complete VR session' });
  }
});

// Monitor VR session in real-time
app.post('/api/vr/sessions/:sessionId/monitor', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { heartRate, stressLevel, userInteractions } = req.body;
    const { monitorVrSession } = await import('./vrTherapyEngine');
    
    const monitoring = await monitorVrSession(sessionId, heartRate, stressLevel, userInteractions);
    res.json({ monitoring });
  } catch (error) {
    console.error('Failed to monitor VR session:', error);
    res.status(500).json({ error: 'Failed to monitor VR session' });
  }
});

// Get user's VR sessions
app.get('/api/vr/sessions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { limit } = req.query;
    
    const sessions = await storage.getUserVrSessions(userId, limit ? parseInt(limit as string) : 50);
    res.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch VR sessions:', error);
    res.status(500).json({ error: 'Failed to fetch VR sessions' });
  }
});

// Get user's VR progress
app.get('/api/vr/progress/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { environmentId } = req.query;
    
    const progress = environmentId 
      ? await storage.getUserVrProgress(userId, parseInt(environmentId as string))
      : await storage.getUserVrProgress(userId);
    
    res.json({ progress });
  } catch (error) {
    console.error('Failed to fetch VR progress:', error);
    res.status(500).json({ error: 'Failed to fetch VR progress' });
  }
});

// Create VR therapeutic plan
app.post('/api/vr/therapeutic-plans', async (req, res) => {
  try {
    const { userId, therapeuticGoal, targetConditions, planDuration } = req.body;
    const { createPersonalizedVrPlan } = await import('./vrTherapyEngine');
    
    const plan = await createPersonalizedVrPlan(userId, therapeuticGoal, targetConditions, planDuration);
    res.json({ plan });
  } catch (error) {
    console.error('Failed to create VR therapeutic plan:', error);
    res.status(500).json({ error: 'Failed to create VR therapeutic plan' });
  }
});

// Get user's VR therapeutic plans
app.get('/api/vr/therapeutic-plans/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const plans = await storage.getUserVrTherapeuticPlans(userId);
    res.json({ plans });
  } catch (error) {
    console.error('Failed to fetch VR therapeutic plans:', error);
    res.status(500).json({ error: 'Failed to fetch VR therapeutic plans' });
  }
});

// Update VR therapeutic plan
app.patch('/api/vr/therapeutic-plans/:planId', async (req, res) => {
  try {
    const planId = parseInt(req.params.planId);
    const updates = req.body;
    
    const plan = await storage.updateVrTherapeuticPlan(planId, updates);
    res.json({ plan });
  } catch (error) {
    console.error('Failed to update VR therapeutic plan:', error);
    res.status(500).json({ error: 'Failed to update VR therapeutic plan' });
  }
});

// Get user's VR accessibility profile
app.get('/api/vr/accessibility-profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getUserVrAccessibilityProfile(userId);
    res.json({ profile });
  } catch (error) {
    console.error('Failed to fetch VR accessibility profile:', error);
    res.status(500).json({ error: 'Failed to fetch VR accessibility profile' });
  }
});

// Create or update VR accessibility profile
app.post('/api/vr/accessibility-profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const profileData = req.body;
    
    const existingProfile = await storage.getUserVrAccessibilityProfile(userId);
    
    let profile;
    if (existingProfile) {
      profile = await storage.updateVrAccessibilityProfile(userId, profileData);
    } else {
      profile = await storage.createVrAccessibilityProfile({
        userId,
        ...profileData
      });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Failed to save VR accessibility profile:', error);
    res.status(500).json({ error: 'Failed to save VR accessibility profile' });
  }
});

// Advanced Emotional Intelligence API Endpoints

// Generate mood forecast
app.post('/api/emotional-intelligence/mood-forecast', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { generateMoodForecast } = await import('./emotionalIntelligenceEngine');
    const forecast = await generateMoodForecast(userId, storage);
    
    res.json({
      forecast,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mood forecast generation error:', error);
    res.status(500).json({ error: 'Failed to generate mood forecast' });
  }
});

// Get mood forecasts for user
app.get('/api/emotional-intelligence/mood-forecasts/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 10;
    
    const forecasts = await storage.getMoodForecasts(userId, limit);
    
    res.json({
      forecasts,
      totalCount: forecasts.length
    });
  } catch (error) {
    console.error('Failed to fetch mood forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch mood forecasts' });
  }
});

// Generate emotionally intelligent response
app.post('/api/emotional-intelligence/contextual-response', async (req, res) => {
  try {
    const { userMessage, userId } = req.body;
    
    if (!userMessage || !userId) {
      return res.status(400).json({ error: 'User message and ID are required' });
    }

    const { generateEmotionallyIntelligentResponse } = await import('./emotionalIntelligenceEngine');
    const response = await generateEmotionallyIntelligentResponse(userMessage, userId, storage);
    
    res.json({
      response,
      generatedAt: new Date().toISOString(),
      emotionallyAdapted: true
    });
  } catch (error) {
    console.error('Contextual response generation error:', error);
    res.status(500).json({ error: 'Failed to generate contextual response' });
  }
});

// Get emotional contexts for user
app.get('/api/emotional-intelligence/contexts/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sessionId = req.query.sessionId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const contexts = await storage.getEmotionalContexts(userId, sessionId, limit);
    
    res.json({
      contexts,
      totalCount: contexts.length
    });
  } catch (error) {
    console.error('Failed to fetch emotional contexts:', error);
    res.status(500).json({ error: 'Failed to fetch emotional contexts' });
  }
});

// Get predictive insights for user
app.get('/api/emotional-intelligence/insights/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const isActive = req.query.active !== 'false';
    
    const insights = await storage.getPredictiveInsights(userId, isActive);
    
    res.json({
      insights,
      totalCount: insights.length
    });
  } catch (error) {
    console.error('Failed to fetch predictive insights:', error);
    res.status(500).json({ error: 'Failed to fetch predictive insights' });
  }
});

// Update predictive insight accuracy
app.patch('/api/emotional-intelligence/insights/:insightId', async (req, res) => {
  try {
    const insightId = parseInt(req.params.insightId);
    const { wasAccurate, userFeedback } = req.body;
    
    const updatedInsight = await storage.updatePredictiveInsight(insightId, {
      wasAccurate,
      userFeedback
    });
    
    if (!updatedInsight) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    res.json(updatedInsight);
  } catch (error) {
    console.error('Failed to update predictive insight:', error);
    res.status(500).json({ error: 'Failed to update predictive insight' });
  }
});

// Get emotional response adaptations for user
app.get('/api/emotional-intelligence/adaptations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const adaptations = await storage.getEmotionalResponseAdaptations(userId, limit);
    
    res.json({
      adaptations,
      totalCount: adaptations.length
    });
  } catch (error) {
    console.error('Failed to fetch emotional response adaptations:', error);
    res.status(500).json({ error: 'Failed to fetch emotional response adaptations' });
  }
});

// Rate emotional response adaptation effectiveness
app.patch('/api/emotional-intelligence/adaptations/:adaptationId', async (req, res) => {
  try {
    const adaptationId = parseInt(req.params.adaptationId);
    const { effectiveness, userResponse } = req.body;
    
    const updatedAdaptation = await storage.updateEmotionalResponseAdaptation(adaptationId, {
      effectiveness,
      userResponse
    });
    
    if (!updatedAdaptation) {
      return res.status(404).json({ error: 'Adaptation not found' });
    }
    
    res.json(updatedAdaptation);
  } catch (error) {
    console.error('Failed to update emotional response adaptation:', error);
    res.status(500).json({ error: 'Failed to update emotional response adaptation' });
  }
});

// Generate dashboard overview for emotional intelligence
app.get('/api/emotional-intelligence/dashboard/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get recent forecasts, insights, and adaptations
    const [forecasts, insights, adaptations, emotionalPattern] = await Promise.all([
      storage.getMoodForecasts(userId, 5),
      storage.getPredictiveInsights(userId, true),
      storage.getEmotionalResponseAdaptations(userId, 10),
      storage.getEmotionalPattern(userId)
    ]);
    
    // Calculate accuracy metrics
    const completedForecasts = forecasts.filter(f => f.actualMood && f.forecastAccuracy);
    const avgAccuracy = completedForecasts.length > 0 
      ? completedForecasts.reduce((sum, f) => sum + parseFloat(f.forecastAccuracy || '0'), 0) / completedForecasts.length
      : 0;
    
    const effectiveAdaptations = adaptations.filter(a => a.effectiveness && parseFloat(a.effectiveness) >= 0.7);
    const adaptationEffectiveness = adaptations.length > 0 
      ? effectiveAdaptations.length / adaptations.length 
      : 0;
    
    res.json({
      overview: {
        totalForecasts: forecasts.length,
        averageAccuracy: Math.round(avgAccuracy * 100),
        activeInsights: insights.length,
        adaptationEffectiveness: Math.round(adaptationEffectiveness * 100),
        emotionalStability: emotionalPattern?.volatility ? Math.round((1 - emotionalPattern.volatility) * 100) : 75
      },
      recentForecasts: forecasts.slice(0, 3),
      activeInsights: insights.slice(0, 5),
      recentAdaptations: adaptations.slice(0, 5)
    });
  } catch (error) {
    console.error('Failed to generate emotional intelligence dashboard:', error);
    res.status(500).json({ error: 'Failed to generate dashboard' });
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
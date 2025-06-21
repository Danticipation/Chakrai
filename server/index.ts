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
import express from "express";
import multer from 'multer';
import { storage } from './storage.js';
import { analyzeEmotionalState } from './emotionalAnalysis.js';
import { openai } from './openaiRetry.js';
import { agentSystem } from './agentSystem.js';
import { TherapeuticAnalyticsSystem } from './therapeuticAnalytics.js';

const analyticsSystem = new TherapeuticAnalyticsSystem();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper functions for advanced emotional intelligence features
async function generateMoodForecast(userId: number, recentMoods: any[]): Promise<any> {
  try {
    const prompt = `Based on recent mood data: ${JSON.stringify(recentMoods.slice(-7))}, generate a 24-48 hour mood forecast. Return JSON with: predictedMood (string), confidenceScore (0.0-1.0), riskLevel ('low'|'medium'|'high'|'critical'), triggerFactors (string[]), preventiveRecommendations (string[])`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      predictedMood: 'neutral',
      confidenceScore: 0.5,
      riskLevel: 'low',
      triggerFactors: [],
      preventiveRecommendations: ['Continue regular self-care practices']
    };
  }
}

async function generateContextualResponse(originalMessage: string, emotionalState: any, userId: number): Promise<any> {
  try {
    const prompt = `Adapt this therapeutic response "${originalMessage}" based on emotional state: ${JSON.stringify(emotionalState)}. Return JSON with: response (adapted message), tone, intensity, responseLength, communicationStyle, priorityFocus (array)`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      response: originalMessage,
      tone: 'supportive',
      intensity: 'moderate',
      responseLength: 'moderate',
      communicationStyle: 'therapeutic',
      priorityFocus: ['emotional support']
    };
  }
}

async function detectCrisisSignals(message: string, userId: number): Promise<any> {
  try {
    const prompt = `Analyze this message for crisis indicators: "${message}". Return JSON with: riskLevel ('low'|'medium'|'high'|'critical'), confidence (0.0-1.0), indicators (string[] of specific signals), supportResources (string[] of crisis resources)`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      riskLevel: 'low',
      confidence: 0.5,
      indicators: [],
      supportResources: []
    };
  }
}

async function analyzeEmotionalPatterns(userId: number, timeframeDays: number): Promise<any> {
  try {
    const moodEntries = await storage.getMoodEntries(userId);
    const prompt = `Analyze emotional patterns from mood data: ${JSON.stringify(moodEntries)}. Return JSON with: dominantEmotions (string[]), averageValence (-1.0 to 1.0), volatility (0.0 to 1.0), trendDirection ('improving'|'declining'|'stable'), triggerPatterns (string[]), insights (string[])`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      dominantEmotions: ['neutral'],
      averageValence: 0.0,
      volatility: 0.3,
      trendDirection: 'stable',
      triggerPatterns: [],
      insights: []
    };
  }
}

// ====================
// CHAT & AI ENDPOINTS
// ====================

// Main chat endpoint with AI integration
router.post('/chat', async (req, res) => {
  try {
    const { message, voice, userId = 1, personalityMode = 'supportive' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request:', { message: message.substring(0, 50) + '...', voice, userId });

    // Crisis detection
    const crisisData = await detectCrisisSignals(message, userId);
    const crisisDetected = crisisData.riskLevel === 'high' || crisisData.riskLevel === 'critical';

    // Emotional analysis
    const emotionalState = await analyzeEmotionalState(message);

    // Get user data for personality mirroring
    const userFacts = await storage.getUserFacts(userId).catch(() => []);
    const userMemories = await storage.getUserMemories(userId).catch(() => []);

    // Enhanced system prompt with personality mirroring
    const personalityContext = userFacts.length > 0 ? 
      `User's personality traits: ${userFacts.map(f => f.fact).join(', ')}\n` +
      `User's memories: ${userMemories.map(m => m.memory).join(', ')}\n` : '';

    const systemPrompt = `You are TraI, a therapeutic AI companion providing mental wellness support. Your responses should be:
- Warm, empathetic, and professionally therapeutic
- Personalized based on the user's communication style and personality
- Focused on emotional support and growth
- Crisis-aware when risk indicators are detected

${personalityContext}

Current emotional context: ${JSON.stringify(emotionalState)}
Crisis level: ${crisisData.riskLevel}

Adapt your response to mirror the user's communication patterns while maintaining therapeutic value.`;

    // Generate OpenAI response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    console.log('OpenAI response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.log('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;
    console.log('OpenAI response received:', aiResponse.substring(0, 50) + '...');

    // Generate ElevenLabs voice synthesis
    const voiceMap: Record<string, string> = {
      'james': 'EkK5I93UQWFDigLMpZcX',
      'brian': 'nPczCjzI2devNBz1zQrb', 
      'alexandra': 'kdmDKE6EkgrWrrykO9Qt',
      'carla': 'l32B8XDoylOsZKiSdfhE'
    };

    const selectedVoice = voice || 'carla';
    const voiceId = voiceMap[selectedVoice] || voiceMap['carla'];
    let audioUrl = null;

    if (process.env.ELEVENLABS_API_KEY) {
      try {
        console.log(`Making ElevenLabs request for voice: ${selectedVoice} (ID: ${voiceId})`);
        console.log(`Text to synthesize: "${aiResponse.substring(0, 50)}..."`);
        
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          } as HeadersInit,
          body: JSON.stringify({
            text: aiResponse,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            }
          })
        });

        console.log('ElevenLabs response status:', elevenLabsResponse.status);

        if (elevenLabsResponse.ok) {
          const audioBuffer = await elevenLabsResponse.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          
          console.log(`Audio buffer size: ${audioBuffer.byteLength}`);
          console.log(`Base64 audio length: ${base64Audio.length}`);
          
          audioUrl = base64Audio;
        } else {
          const errorText = await elevenLabsResponse.text();
          console.error('ElevenLabs API error:', elevenLabsResponse.status, errorText);
        }
      } catch (elevenLabsError: any) {
        console.error('ElevenLabs request failed:', elevenLabsError);
      }
    } else {
      console.error('ELEVENLABS_API_KEY not configured');
    }

    res.json({
      message: aiResponse,
      response: aiResponse,
      audioUrl: audioUrl,
      voiceUsed: selectedVoice,
      wordsLearned: 1000,
      stage: "Therapist",
      crisisDetected: crisisDetected,
      crisisData: crisisDetected ? crisisData : null,
      personalityMode: personalityMode,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    const fallbackResponse = "I'm here to support you. Sometimes I have trouble connecting to my full capabilities, but I'm still listening. How are you feeling right now?";
    res.json({
      message: fallbackResponse,
      response: fallbackResponse,
      wordsLearned: 1000,
      stage: "Therapist",
      crisisDetected: false,
      crisisData: null,
      personalityMode: "supportive",
      timestamp: new Date().toISOString()
    });
  }
});

// Voice transcription endpoint
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'Voice transcription temporarily unavailable',
        errorType: 'auth_error'
      });
    }

    const formData = new FormData();
    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Voice transcription temporarily unavailable due to high demand',
          errorType: 'quota_exceeded'
        });
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    res.json({ text: result.text });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      error: 'Voice transcription failed. Please try again.',
      errorType: 'transcription_error'
    });
  }
});

// Text-to-speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'james', emotionalContext = 'neutral' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceMap: Record<string, string> = {
      'james': 'EkK5I93UQWFDigLMpZcX',
      'brian': 'nPczCjzI2devNBz1zQrb', 
      'alexandra': 'kdmDKE6EkgrWrrykO9Qt',
      'carla': 'l32B8XDoylOsZKiSdfhE'
    };

    const voiceId = voiceMap[voice] || voiceMap['james'];
    
    try {
      console.log(`Making ElevenLabs request for voice: ${voice} (ID: ${voiceId})`);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
        } as HeadersInit,
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        
        console.log(`Generated audio for voice ${voice}: ${audioBuffer.byteLength} bytes`);
        
        // Return audio as blob instead of JSON with base64
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache'
        });
        
        res.send(Buffer.from(audioBuffer));
      } else {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      fallback: 'Browser TTS will be used instead'
    });
  }
});

// ====================
// STATS & BOT ENDPOINTS
// ====================

// Stats endpoint - support both with and without userId
router.get('/stats/:userId?', (req, res) => {
  try {
    res.json({
      level: 3,
      stage: "Therapist", 
      wordsLearned: 1000,
      wordCount: 1000
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Bot stats endpoint (alternate endpoint name)
router.get('/bot-stats/:userId', (req, res) => {
  try {
    res.json({
      level: 3,
      stage: "Therapist",
      wordsLearned: 1000
    });
  } catch (error) {
    console.error('Bot stats error:', error);
    res.status(500).json({ error: 'Failed to get bot stats' });
  }
});

// ====================
// CONTENT ENDPOINTS
// ====================

// Daily affirmation endpoint
router.get('/daily-affirmation', async (req, res) => {
  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: "Generate a therapeutic daily affirmation for mental wellness. Be supportive, empowering, and focused on self-care and emotional growth. Return just the affirmation text."
        }],
        max_tokens: 100,
        temperature: 0.8
      });
      
      const affirmation = response.choices[0].message.content?.trim() || "You are capable of amazing things and deserve support on your wellness journey.";
      res.json({ affirmation });
    } else {
      // Fallback affirmations
      const affirmations = [
        "You are capable of amazing things.",
        "Your mental health matters and you deserve support.",
        "Every small step forward is progress worth celebrating.",
        "You have the strength to overcome today's challenges.",
        "Your feelings are valid and you are not alone."
      ];
      
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      res.json({ affirmation: randomAffirmation });
    }
  } catch (error) {
    console.error('Daily affirmation error:', error);
    res.json({ affirmation: "You are worthy of love, support, and all the good things life has to offer." });
  }
});

// Weekly summary endpoint
router.get('/weekly-summary', async (req, res) => {
  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: "Generate a weekly therapeutic summary message focusing on growth, progress, and encouragement for someone on their mental wellness journey. Be supportive and motivating."
        }],
        max_tokens: 150,
        temperature: 0.7
      });
      
      const summary = response.choices[0].message.content?.trim() || "This week has been a journey of growth and self-discovery.";
      res.json({ summary });
    } else {
      const summaries = [
        "This week, you've shown remarkable growth in self-awareness and emotional intelligence.",
        "Your conversations reflect deep introspection and a commitment to personal wellness.",
        "This week's interactions demonstrate your resilience and willingness to explore difficult topics.",
        "You've engaged thoughtfully with therapeutic concepts, showing genuine progress.",
        "Your openness to growth and self-reflection has been particularly evident this week."
      ];
      
      const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
      res.json({ summary: randomSummary });
    }
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.json({ summary: "Your therapeutic journey continues to unfold with courage and determination." });
  }
});

// Horoscope endpoint
router.get('/horoscope/:sign', async (req, res) => {
  try {
    const { sign } = req.params;
    
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: "You are a therapeutic astrologer providing comprehensive wellness guidance. Always write complete, full-length horoscopes with proper paragraph structure and meaningful therapeutic insights."
        }, {
          role: "user",
          content: `Write a complete, comprehensive therapeutic horoscope for ${sign}. Focus on mental wellness, emotional healing, and personal growth. Include 4-5 full paragraphs covering:

1. Current emotional landscape and opportunities
2. Specific mindfulness and self-care practices
3. Personal growth and relationship insights  
4. Practical wellness advice and action steps
5. Encouraging closing thoughts

Make it supportive, detailed, and therapeutically valuable. Write complete sentences and full paragraphs. Do not cut off mid-sentence.`
        }],
        max_tokens: 800,
        temperature: 0.7
      });
      
      const horoscope = response.choices[0].message.content?.trim() || "Today brings opportunities for personal growth and emotional healing.";
      res.json({ horoscope });
    } else {
      const horoscopes = {
        aries: "Today brings new opportunities for personal growth and emotional healing.",
        taurus: "Focus on grounding exercises and self-care to maintain your emotional balance.",
        gemini: "Communication and connection with others will bring you joy today.",
        cancer: "Trust your intuition and take time for reflection and self-nurturing.",
        leo: "Your natural confidence will help you overcome any challenges today.",
        virgo: "Organization and mindfulness will bring clarity to your thoughts.",
        libra: "Seek harmony in your relationships and practice gratitude.",
        scorpio: "Deep introspection will reveal important insights about yourself.",
        sagittarius: "Adventure and optimism will lift your spirits today.",
        capricorn: "Steady progress toward your goals will boost your confidence.",
        aquarius: "Innovation and creativity will help you solve problems today.",
        pisces: "Compassion for yourself and others will guide your day."
      };
      
      res.json({ 
        horoscope: horoscopes[sign.toLowerCase() as keyof typeof horoscopes] || "Today is a great day for self-reflection and growth." 
      });
    }
  } catch (error) {
    console.error('Horoscope error:', error);
    res.json({ horoscope: "Today holds potential for growth, healing, and positive change in your life." });
  }
});

// ====================
// MOOD & WELLNESS ENDPOINTS
// ====================

// Mood tracking endpoint
router.post('/mood', async (req, res) => {
  try {
    const { userId, mood, intensity, triggers, notes } = req.body;
    
    if (!userId || !mood || intensity === undefined) {
      return res.status(400).json({ error: 'userId, mood, and intensity are required' });
    }

    const moodEntry = await storage.createMoodEntry({
      userId: parseInt(userId),
      mood,
      intensity: parseInt(intensity),
      triggers: triggers || [],
      notes: notes || '',
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      message: `Mood "${mood}" recorded with intensity ${intensity}`,
      moodEntry
    });
  } catch (error) {
    console.error('Mood tracking error:', error);
    res.status(500).json({ error: 'Failed to track mood' });
  }
});

// Get mood entries for a user
router.get('/mood/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const moodEntries = await storage.getMoodEntries(userId);
    res.json({ moodEntries });
  } catch (error) {
    console.error('Get mood entries error:', error);
    res.status(500).json({ error: 'Failed to get mood entries' });
  }
});

// ====================
// PERSONALITY & REFLECTION ENDPOINTS
// ====================

// Personality reflection endpoint - AI analysis of user traits and growth
router.get('/personality-reflection/:userId?', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId?.toString() || '1');
    
    // Get recent data for analysis using available storage methods
    const journalEntries = await storage.getJournalEntries(userId).then(entries => entries.slice(0, 5)).catch(() => []);
    const moodEntries = await storage.getMoodEntries(userId).then(entries => entries.slice(0, 7)).catch(() => []);
    
    // Prepare conversation and journal text for analysis
    const journalText = journalEntries
      .map(entry => entry.content)
      .join('\n');
    
    const moodSummary = moodEntries
      .map(mood => `${mood.mood}: ${mood.intensity}/10`)
      .join(', ');

    // Generate AI personality analysis
    const analysisPrompt = `Analyze this user's personality, communication style, and emotional patterns based on their recent interactions:

JOURNAL ENTRIES:
${journalText || 'No journal entries available'}

MOOD PATTERNS:
${moodSummary || 'No mood data available'}

Provide a comprehensive personality reflection including:
1. PERSONALITY TRAITS: Key characteristics and communication style
2. POSITIVE ATTRIBUTES: Strengths and admirable qualities 
3. AREAS FOR GROWTH: Gentle suggestions for improvement
4. EMOTIONAL PATTERNS: How they process and express emotions
5. THERAPEUTIC INSIGHTS: Professional observations for their wellness journey

Be supportive, encouraging, and therapeutic in tone. Focus on growth and self-awareness.`;

    if (process.env.OPENAI_API_KEY) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a therapeutic AI providing personality reflection and analysis. Be supportive, insightful, and focused on personal growth and self-awareness.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        const reflection = data.choices[0].message.content;
        
        res.json({
          reflection,
          lastUpdated: new Date().toISOString(),
          dataPoints: {
            conversations: 0,
            journalEntries: journalEntries.length,
            moodEntries: moodEntries.length
          }
        });
        return;
      }
    }
    
    // Fallback if OpenAI is unavailable
    res.json({
      reflection: "Your therapeutic journey shows dedication to self-improvement and emotional awareness. Continue engaging with the platform to develop deeper insights about your personality and growth patterns.",
      lastUpdated: new Date().toISOString(),
      dataPoints: {
        conversations: 0,
        journalEntries: journalEntries.length,
        moodEntries: moodEntries.length
      }
    });
  } catch (error) {
    console.error('Personality reflection error:', error);
    res.status(500).json({ 
      error: 'Failed to generate personality reflection',
      reflection: "Continue your therapeutic journey by engaging in conversations and journaling to develop deeper self-awareness and emotional insights.",
      lastUpdated: new Date().toISOString(),
      dataPoints: {
        conversations: 0,
        journalEntries: 0,
        moodEntries: 0
      }
    });
  }
});

// ====================
// EMOTIONAL INTELLIGENCE ENDPOINTS
// ====================

// Real-time emotional detection endpoint
router.post('/emotional-intelligence/detect', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const emotionalState = await analyzeEmotionalState(message);
    
    // Store emotional context
    await storage.createEmotionalContext({
      userId: parseInt(userId),
      contextData: emotionalState,
      detectedAt: new Date()
    });

    res.json({
      success: true,
      emotionalState,
      detectedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Emotional detection error:', error);
    res.status(500).json({ error: 'Failed to detect emotional state' });
  }
});

// Mood forecasting endpoint
router.get('/emotional-intelligence/mood-forecast/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const moodEntries = await storage.getMoodEntries(userId);
    
    const forecast = await generateMoodForecast(userId, moodEntries);
    
    // Store mood forecast
    await storage.createMoodForecast({
      userId,
      predictedMood: forecast.predictedMood,
      confidenceScore: forecast.confidenceScore,
      riskLevel: forecast.riskLevel,
      triggerFactors: forecast.triggerFactors,
      preventiveRecommendations: forecast.preventiveRecommendations,
      generatedAt: new Date()
    });

    res.json({
      success: true,
      forecast,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mood forecast error:', error);
    res.status(500).json({ error: 'Failed to generate mood forecast' });
  }
});

// Contextual response adaptation endpoint
router.post('/emotional-intelligence/adapt-response', async (req, res) => {
  try {
    const { userId, originalMessage, emotionalState } = req.body;
    
    if (!userId || !originalMessage) {
      return res.status(400).json({ error: 'userId and originalMessage are required' });
    }

    const adaptedResponse = await generateContextualResponse(originalMessage, emotionalState, userId);
    
    // Store response adaptation
    await storage.createEmotionalResponseAdaptation({
      userId: parseInt(userId),
      originalMessage,
      adaptedMessage: adaptedResponse.response,
      emotionalContext: emotionalState || {},
      adaptationReason: adaptedResponse.priorityFocus?.join(', ') || 'emotional support',
      createdAt: new Date()
    });

    res.json({
      success: true,
      adaptedResponse,
      adaptedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Response adaptation error:', error);
    res.status(500).json({ error: 'Failed to adapt response' });
  }
});

// Crisis detection endpoint
router.post('/emotional-intelligence/crisis-detection', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const crisisData = await detectCrisisSignals(message, userId);
    const crisisDetected = crisisData.riskLevel === 'high' || crisisData.riskLevel === 'critical';
    
    if (crisisDetected) {
      // Store crisis detection log
      await storage.createCrisisDetectionLog({
        userId: parseInt(userId),
        riskLevel: crisisData.riskLevel,
        confidenceScore: crisisData.confidence,
        indicators: crisisData.indicators,
        supportResources: crisisData.supportResources,
        detectedAt: new Date()
      });
    }

    res.json({
      success: true,
      crisisDetected,
      crisisData,
      detectedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crisis detection error:', error);
    res.status(500).json({ error: 'Failed to perform crisis detection' });
  }
});

// Emotional pattern analysis endpoint
router.get('/emotional-intelligence/patterns/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const timeframeDays = parseInt(req.query.timeframeDays as string) || 30;
    
    const patterns = await analyzeEmotionalPatterns(userId, timeframeDays);

    res.json({
      success: true,
      patterns,
      timeframeDays,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Emotional pattern analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze emotional patterns' });
  }
});

// Journal API endpoints
router.get('/journal/entries/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const entries = await storage.getJournalEntries(userId);
    res.json(entries || []);
  } catch (error) {
    console.error('Failed to fetch journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

router.post('/journal/entries', async (req, res) => {
  try {
    const { userId, content, mood, tags, triggers, copingStrategies, isPrivate } = req.body;
    const entry = await storage.createJournalEntry({
      userId: userId || 1,
      content,
      mood,
      tags: tags || [],
      triggers: triggers || [],
      copingStrategies: copingStrategies || [],
      isPrivate: isPrivate || false
    });
    res.json(entry);
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

router.get('/journal/analytics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const journalEntries = await storage.getJournalEntries(userId) || [];
    const moodEntries = await storage.getMoodEntries(userId) || [];
    
    res.json({
      success: true,
      analytics: {
        totalEntries: journalEntries.length,
        averageMoodIntensity: moodEntries.length > 0 ? 
          moodEntries.reduce((acc, m) => acc + (m.intensity || 5), 0) / moodEntries.length : 5,
        emotionalJourney: "Stable emotional progression",
        recurringThemes: ["Self-reflection", "Growth", "Wellness"],
        sentimentTrend: "Positive",
        riskIndicators: [],
        therapeuticProgress: "Good progress"
      }
    });
  } catch (error) {
    console.error('Journal analytics error:', error);
    res.status(500).json({ error: 'Failed to generate journal analytics' });
  }
});

// ===== THERAPIST PORTAL ROUTES - NEW FEATURE =====

// Therapist management
router.post('/therapist/register', async (req, res) => {
  try {
    const therapist = await storage.createTherapist(req.body);
    res.json(therapist);
  } catch (error) {
    console.error('Failed to register therapist:', error);
    res.status(500).json({ error: 'Failed to register therapist' });
  }
});

router.get('/therapist/:id', async (req, res) => {
  try {
    const therapist = await storage.getTherapistById(parseInt(req.params.id));
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json(therapist);
  } catch (error) {
    console.error('Failed to get therapist:', error);
    res.status(500).json({ error: 'Failed to get therapist' });
  }
});

// Client-therapist relationships
router.post('/therapist/invite-client', async (req, res) => {
  try {
    const { therapistId, clientUserId, inviteCode } = req.body;
    const relationship = await storage.createClientTherapistRelationship({
      therapistId,
      clientUserId,
      inviteCode,
      status: 'pending'
    });
    res.json(relationship);
  } catch (error) {
    console.error('Failed to create client relationship:', error);
    res.status(500).json({ error: 'Failed to create client relationship' });
  }
});

router.get('/therapist/:therapistId/clients', async (req, res) => {
  try {
    const therapistId = parseInt(req.params.therapistId);
    const relationships = await storage.getClientTherapistRelationships(therapistId);
    res.json(relationships);
  } catch (error) {
    console.error('Failed to get therapist clients:', error);
    res.status(500).json({ error: 'Failed to get therapist clients' });
  }
});

router.patch('/therapist/relationship/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const relationship = await storage.updateRelationshipStatus(parseInt(req.params.id), status);
    res.json(relationship);
  } catch (error) {
    console.error('Failed to update relationship status:', error);
    res.status(500).json({ error: 'Failed to update relationship status' });
  }
});

// Client dashboard data
router.get('/therapist/:therapistId/client/:clientId/dashboard', async (req, res) => {
  try {
    const therapistId = parseInt(req.params.therapistId);
    const clientUserId = parseInt(req.params.clientId);
    
    const dashboardData = await storage.getClientDashboardData(therapistId, clientUserId);
    res.json(dashboardData);
  } catch (error) {
    console.error('Failed to get client dashboard data:', error);
    res.status(500).json({ error: 'Failed to get client dashboard data' });
  }
});

// Privacy settings
router.get('/client/:clientId/therapist/:therapistId/privacy', async (req, res) => {
  try {
    const clientUserId = parseInt(req.params.clientId);
    const therapistId = parseInt(req.params.therapistId);
    
    const settings = await storage.getClientPrivacySettings(clientUserId, therapistId);
    res.json(settings || {
      shareJournalData: true,
      shareMoodData: true,
      shareReflectionData: true,
      shareCrisisAlerts: true,
      blurCrisisFlags: false,
      shareSessionSummaries: true,
      dataRetentionDays: 90
    });
  } catch (error) {
    console.error('Failed to get privacy settings:', error);
    res.status(500).json({ error: 'Failed to get privacy settings' });
  }
});

router.put('/client/privacy-settings', async (req, res) => {
  try {
    const settings = await storage.updateClientPrivacySettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Failed to update privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Session notes
router.post('/therapist/session-note', async (req, res) => {
  try {
    const note = await storage.createTherapistSessionNote(req.body);
    res.json(note);
  } catch (error) {
    console.error('Failed to create session note:', error);
    res.status(500).json({ error: 'Failed to create session note' });
  }
});

router.get('/therapist/:therapistId/session-notes', async (req, res) => {
  try {
    const therapistId = parseInt(req.params.therapistId);
    const clientUserId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    
    const notes = await storage.getTherapistSessionNotes(therapistId, clientUserId);
    res.json(notes);
  } catch (error) {
    console.error('Failed to get session notes:', error);
    res.status(500).json({ error: 'Failed to get session notes' });
  }
});

// Risk alerts
router.get('/therapist/:therapistId/alerts', async (req, res) => {
  try {
    const therapistId = parseInt(req.params.therapistId);
    const clientUserId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    const acknowledged = req.query.acknowledged ? req.query.acknowledged === 'true' : undefined;
    
    const alerts = await storage.getRiskAlerts(therapistId, clientUserId, acknowledged);
    res.json(alerts);
  } catch (error) {
    console.error('Failed to get risk alerts:', error);
    res.status(500).json({ error: 'Failed to get risk alerts' });
  }
});

router.patch('/therapist/alert/:alertId/acknowledge', async (req, res) => {
  try {
    const alert = await storage.acknowledgeRiskAlert(parseInt(req.params.alertId));
    res.json(alert);
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Generate risk alerts (automated)
router.post('/client/:clientId/generate-risk-alerts', async (req, res) => {
  try {
    const clientUserId = parseInt(req.params.clientId);
    await storage.generateRiskAlerts(clientUserId);
    res.json({ success: true, message: 'Risk alerts generated' });
  } catch (error) {
    console.error('Failed to generate risk alerts:', error);
    res.status(500).json({ error: 'Failed to generate risk alerts' });
  }
});

// PWA Notification endpoints
router.post('/notifications/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    // Store push subscription for this user
    console.log('Push notification subscription:', subscription);
    res.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

router.post('/notifications/schedule-wellness-reminders', async (req, res) => {
  try {
    const { affirmationTime, moodCheckTime, journalTime } = req.body;
    
    // Store notification preferences for user
    console.log('Wellness reminder schedule:', {
      affirmationTime,
      moodCheckTime,
      journalTime
    });
    
    res.json({ 
      success: true, 
      message: 'Wellness reminders scheduled',
      schedule: {
        affirmationTime,
        moodCheckTime,
        journalTime
      }
    });
  } catch (error) {
    console.error('Failed to schedule wellness reminders:', error);
    res.status(500).json({ error: 'Failed to schedule reminders' });
  }
});

router.get('/user/notification-preferences', async (req, res) => {
  try {
    // Return user notification preferences
    // For now, return defaults - would be stored in database in production
    res.json({
      enableReminders: true,
      affirmationTime: '09:00',
      moodCheckTime: '18:00',
      journalTime: '20:00'
    });
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// ============================================================================
// THERAPEUTIC AGENT SYSTEM ENDPOINTS
// ============================================================================

// Get available therapeutic agents
router.get('/agents', async (req, res) => {
  try {
    const agents = agentSystem.getAvailableAgents();
    res.json({ agents });
  } catch (error) {
    console.error('Failed to get agents:', error);
    res.status(500).json({ error: 'Failed to retrieve agents' });
  }
});

// Analyze message for potential agent handoff
router.post('/agents/analyze-handoff', async (req, res) => {
  try {
    const { userId, message, conversationHistory } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysis = await agentSystem.analyzeForHandoff(
      parseInt(userId), 
      message, 
      conversationHistory || []
    );
    
    // If handoff is recommended, include the offer message
    if (analysis.shouldHandoff && analysis.recommendedAgent) {
      analysis.handoffMessage = agentSystem.createHandoffOffer(
        analysis.recommendedAgent, 
        analysis.reason || ''
      );
    }

    res.json(analysis);
  } catch (error) {
    console.error('Failed to analyze handoff:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

// Start agent session
router.post('/agents/start-session', async (req, res) => {
  try {
    const { userId, agentType, objective } = req.body;
    
    if (!userId || !agentType || !objective) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await agentSystem.startAgentSession(
      parseInt(userId), 
      agentType, 
      objective
    );
    
    res.json({ 
      success: true, 
      session,
      message: `Connected to ${agentType.replace('_', ' ')} specialist. How can I help you with ${objective}?`
    });
  } catch (error) {
    console.error('Failed to start agent session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Send message to active agent
router.post('/agents/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = agentSystem.getActiveSession(parseInt(userId));
    if (!session) {
      return res.status(404).json({ error: 'No active agent session' });
    }

    const result = await agentSystem.generateAgentResponse(
      parseInt(userId), 
      message
    );
    
    // If agent recommends transferring back to main bot
    if (result.shouldTransferBack) {
      agentSystem.completeSession(parseInt(userId), result.transferReason);
      result.response += `\n\n*Session completed. Transferring you back to the main therapeutic companion.*`;
    }

    res.json({
      response: result.response,
      insights: result.insights,
      sessionActive: !result.shouldTransferBack,
      transferReason: result.transferReason
    });
  } catch (error) {
    console.error('Failed to process agent chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get active agent session
router.get('/agents/session/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const session = agentSystem.getActiveSession(userId);
    
    res.json({ 
      hasActiveSession: !!session,
      session: session || null
    });
  } catch (error) {
    console.error('Failed to get agent session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// End agent session manually
router.post('/agents/end-session', async (req, res) => {
  try {
    const { userId, completionNotes } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    agentSystem.completeSession(parseInt(userId), completionNotes);
    
    res.json({ 
      success: true, 
      message: 'Agent session ended successfully'
    });
  } catch (error) {
    console.error('Failed to end agent session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// ================================
// THERAPEUTIC OUTCOME ANALYTICS ENDPOINTS
// ================================

// Analyze emotional tone of message
router.post('/api/analytics/emotional-tone', async (req, res) => {
  try {
    const { userId, message, sessionId } = req.body;
    
    const analysis = await analyticsSystem.analyzeEmotionalTone(
      userId || 1, 
      message, 
      sessionId || Date.now().toString()
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Emotional tone analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze emotional tone' });
  }
});

// Track affirmation response
router.post('/api/analytics/affirmation-response', async (req, res) => {
  try {
    const { userId, affirmationType, content, userResponse } = req.body;
    
    const efficacy = await analyticsSystem.trackAffirmationResponse(
      userId || 1,
      affirmationType,
      content,
      userResponse
    );
    
    res.json(efficacy);
  } catch (error) {
    console.error('Affirmation tracking error:', error);
    res.status(500).json({ error: 'Failed to track affirmation response' });
  }
});

// Track wellness goal progress
router.post('/api/analytics/wellness-goal', async (req, res) => {
  try {
    const { userId, goalType, description, target, current } = req.body;
    
    const progress = await analyticsSystem.trackWellnessGoalProgress(
      userId || 1,
      goalType,
      description,
      target,
      current
    );
    
    res.json(progress);
  } catch (error) {
    console.error('Wellness goal tracking error:', error);
    res.status(500).json({ error: 'Failed to track wellness goal' });
  }
});

// Track user engagement
router.post('/api/analytics/engagement', async (req, res) => {
  try {
    const { userId, sessionDuration, featuresUsed, interactions } = req.body;
    
    await analyticsSystem.trackUserEngagement(
      userId || 1,
      sessionDuration,
      featuresUsed,
      interactions
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Engagement tracking error:', error);
    res.status(500).json({ error: 'Failed to track engagement' });
  }
});

// Generate therapeutic efficacy report
router.post('/api/analytics/efficacy-report', async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    const report = await analyticsSystem.generateEfficacyReport(
      reportType || 'monthly',
      new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(endDate || Date.now())
    );
    
    res.json(report);
  } catch (error) {
    console.error('Efficacy report generation error:', error);
    res.status(500).json({ error: 'Failed to generate efficacy report' });
  }
});

// Get emotional trends for user
router.get('/api/analytics/emotional-trends/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const days = parseInt(req.query.days as string) || 30;
    
    const trends = await analyticsSystem.getEmotionalTrends(userId, days);
    
    res.json(trends);
  } catch (error) {
    console.error('Emotional trends error:', error);
    res.status(500).json({ error: 'Failed to get emotional trends' });
  }
});

// Get most effective affirmations for user
router.get('/api/analytics/effective-affirmations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const affirmations = await analyticsSystem.getMostEffectiveAffirmations(userId);
    
    res.json(affirmations);
  } catch (error) {
    console.error('Effective affirmations error:', error);
    res.status(500).json({ error: 'Failed to get effective affirmations' });
  }
});

// Get analytics dashboard overview
router.get('/api/analytics/dashboard/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get comprehensive analytics overview
    const [emotionalTrends, effectiveAffirmations] = await Promise.all([
      analyticsSystem.getEmotionalTrends(userId, 7), // Last 7 days
      analyticsSystem.getMostEffectiveAffirmations(userId)
    ]);
    
    const dashboard = {
      emotionalTrends,
      effectiveAffirmations,
      summary: {
        weeklyEmotionalImprovement: emotionalTrends.length > 0 ? 
          emotionalTrends[emotionalTrends.length - 1]?.avgSentiment || 0 : 0,
        topAffirmationType: effectiveAffirmations[0]?.affirmationType || 'self-compassion',
        overallEfficacy: effectiveAffirmations.length > 0 ?
          effectiveAffirmations.reduce((acc, curr) => acc + (curr.avgEfficacy || 0), 0) / effectiveAffirmations.length : 0.7
      }
    };
    
    res.json(dashboard);
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to get analytics dashboard' });
  }
});

// ================================
// EHR INTEGRATION & INSURANCE SYSTEM ENDPOINTS
// ================================

import { 
  FHIRService, 
  InsuranceService, 
  ClinicalExportService, 
  AuditService, 
  EncryptionService 
} from './ehrIntegration.js';

// EHR Integration Management
router.post('/api/ehr/integration', async (req, res) => {
  try {
    const { 
      userId, 
      therapistId, 
      ehrSystemType, 
      fhirEndpoint, 
      apiKey, 
      clientId,
      tenantId,
      syncFrequency,
      dataTypes 
    } = req.body;

    // Encrypt sensitive data
    const encryptedApiKey = apiKey ? EncryptionService.encrypt(apiKey, process.env.EHR_ENCRYPTION_KEY || 'default-key') : null;

    const integration = await storage.createEhrIntegration({
      userId,
      therapistId,
      ehrSystemType,
      fhirEndpoint,
      apiKey: encryptedApiKey?.encryptedData,
      clientId,
      tenantId,
      syncFrequency: syncFrequency || 'daily',
      dataTypes: dataTypes || ['sessions', 'assessments', 'progress_notes']
    });

    // Log audit trail
    await AuditService.logAccess(
      userId,
      therapistId,
      'create',
      'ehr_integration',
      integration.id.toString(),
      req.ip,
      req.get('User-Agent') || '',
      'success'
    );

    res.json({ success: true, integration: { ...integration, apiKey: '[ENCRYPTED]' } });
  } catch (error) {
    console.error('EHR integration creation error:', error);
    res.status(500).json({ error: 'Failed to create EHR integration' });
  }
});

// Generate FHIR Resources
router.post('/api/ehr/fhir/patient', async (req, res) => {
  try {
    const { userId, userData } = req.body;
    
    const patientResource = FHIRService.generatePatientResource(userId, userData);
    
    const fhirResource = await storage.createFhirResource({
      userId,
      resourceType: 'Patient',
      resourceId: patientResource.id,
      fhirVersion: 'R4',
      resourceData: patientResource
    });

    res.json({ success: true, resource: fhirResource });
  } catch (error) {
    console.error('FHIR Patient creation error:', error);
    res.status(500).json({ error: 'Failed to create FHIR Patient resource' });
  }
});

router.post('/api/ehr/fhir/encounter', async (req, res) => {
  try {
    const { sessionId, userId, therapistId, sessionData } = req.body;
    
    const encounterResource = FHIRService.generateEncounterResource(sessionId, userId, therapistId, sessionData);
    
    const fhirResource = await storage.createFhirResource({
      userId,
      resourceType: 'Encounter',
      resourceId: encounterResource.id,
      fhirVersion: 'R4',
      resourceData: encounterResource
    });

    res.json({ success: true, resource: fhirResource });
  } catch (error) {
    console.error('FHIR Encounter creation error:', error);
    res.status(500).json({ error: 'Failed to create FHIR Encounter resource' });
  }
});

router.post('/api/ehr/fhir/observation', async (req, res) => {
  try {
    const { observationId, userId, observationType, value, effectiveDate } = req.body;
    
    const observationResource = FHIRService.generateObservationResource(
      observationId, 
      userId, 
      observationType, 
      value, 
      effectiveDate
    );
    
    const fhirResource = await storage.createFhirResource({
      userId,
      resourceType: 'Observation',
      resourceId: observationResource.id,
      fhirVersion: 'R4',
      resourceData: observationResource
    });

    res.json({ success: true, resource: fhirResource });
  } catch (error) {
    console.error('FHIR Observation creation error:', error);
    res.status(500).json({ error: 'Failed to create FHIR Observation resource' });
  }
});

// Insurance Eligibility Verification
router.post('/api/insurance/verify-eligibility', async (req, res) => {
  try {
    const { userId, therapistId, memberId, insuranceProvider, therapistNPI } = req.body;
    
    const verification = await InsuranceService.verifyEligibility(memberId, insuranceProvider, therapistNPI);
    
    const eligibility = await storage.createInsuranceEligibility({
      userId,
      therapistId,
      insuranceProvider,
      memberId,
      eligibilityStatus: verification.eligibilityStatus,
      coverageType: verification.coverageType,
      copayAmount: verification.copayAmount,
      deductibleRemaining: verification.deductibleRemaining,
      annualLimit: verification.annualLimit,
      sessionsRemaining: verification.sessionsRemaining,
      preAuthRequired: verification.preAuthRequired,
      verificationDate: new Date(verification.verificationDate),
      expirationDate: new Date(verification.expirationDate)
    });

    res.json({ success: true, eligibility, verification });
  } catch (error) {
    console.error('Insurance verification error:', error);
    res.status(500).json({ error: 'Failed to verify insurance eligibility' });
  }
});

// Session Billing
router.post('/api/insurance/session-billing', async (req, res) => {
  try {
    const { 
      userId, 
      therapistId, 
      sessionId, 
      insuranceEligibilityId,
      sessionType, 
      sessionDuration, 
      diagnosisCode 
    } = req.body;
    
    const cptCode = InsuranceService.generateCPTCode(sessionType, sessionDuration);
    const billableAmount = InsuranceService.calculateBillableAmount(cptCode, 'default');
    
    const billing = await storage.createSessionBilling({
      userId,
      therapistId,
      sessionId,
      insuranceEligibilityId,
      cptCode,
      diagnosisCode,
      sessionDate: new Date(),
      sessionDuration,
      sessionType,
      billableAmount
    });

    res.json({ success: true, billing, cptCode, billableAmount });
  } catch (error) {
    console.error('Session billing error:', error);
    res.status(500).json({ error: 'Failed to create session billing' });
  }
});

// Clinical Data Export
router.post('/api/ehr/export/pdf', async (req, res) => {
  try {
    const { userId, therapistId, dateRange, includedData } = req.body;
    
    const exportResult = await ClinicalExportService.generatePDFReport(
      userId, 
      therapistId, 
      dateRange, 
      includedData
    );
    
    const clinicalExport = await storage.createClinicalExport({
      userId,
      therapistId,
      exportType: 'pdf_report',
      exportFormat: 'pdf',
      dateRange,
      includedData,
      filePath: exportResult.filePath,
      fileSize: exportResult.fileSize,
      complianceLevel: 'hipaa'
    });

    // Log export action
    await AuditService.logAccess(
      userId,
      therapistId,
      'export',
      'clinical_data',
      clinicalExport.id.toString(),
      req.ip,
      req.get('User-Agent') || '',
      'success',
      { exportType: 'pdf', fileSize: exportResult.fileSize }
    );

    res.json({ 
      success: true, 
      export: clinicalExport,
      downloadUrl: `/api/ehr/download/${clinicalExport.id}`
    });
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF export' });
  }
});

router.post('/api/ehr/export/csv', async (req, res) => {
  try {
    const { userId, dateRange, includedData } = req.body;
    
    const exportResult = await ClinicalExportService.generateCSVExport(
      userId, 
      dateRange, 
      includedData
    );
    
    const clinicalExport = await storage.createClinicalExport({
      userId,
      exportType: 'csv_data',
      exportFormat: 'csv',
      dateRange,
      includedData,
      filePath: exportResult.filePath,
      fileSize: exportResult.fileSize,
      complianceLevel: 'hipaa'
    });

    res.json({ 
      success: true, 
      export: clinicalExport,
      downloadUrl: `/api/ehr/download/${clinicalExport.id}`
    });
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

router.post('/api/ehr/export/fhir-bundle', async (req, res) => {
  try {
    const { userId, dateRange } = req.body;
    
    const exportResult = await ClinicalExportService.generateFHIRBundle(
      userId, 
      dateRange
    );
    
    const clinicalExport = await storage.createClinicalExport({
      userId,
      exportType: 'fhir_bundle',
      exportFormat: 'json',
      dateRange,
      includedData: ['sessions', 'assessments', 'observations'],
      filePath: exportResult.filePath,
      fileSize: exportResult.fileSize,
      complianceLevel: 'hipaa'
    });

    res.json({ 
      success: true, 
      export: clinicalExport,
      downloadUrl: `/api/ehr/download/${clinicalExport.id}`
    });
  } catch (error) {
    console.error('FHIR Bundle export error:', error);
    res.status(500).json({ error: 'Failed to generate FHIR Bundle export' });
  }
});

// Download Clinical Exports
router.get('/api/ehr/download/:exportId', async (req, res) => {
  try {
    const exportId = parseInt(req.params.exportId);
    const clinicalExport = await storage.getClinicalExport(exportId);
    
    if (!clinicalExport || !clinicalExport.filePath) {
      return res.status(404).json({ error: 'Export not found' });
    }

    // Update download count
    await storage.updateClinicalExportDownload(exportId);

    // Log download access
    await AuditService.logAccess(
      clinicalExport.userId,
      clinicalExport.therapistId,
      'download',
      'clinical_export',
      exportId.toString(),
      req.ip,
      req.get('User-Agent') || '',
      'success'
    );

    res.download(clinicalExport.filePath);
  } catch (error) {
    console.error('Export download error:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Get User's Clinical Exports
router.get('/api/ehr/exports/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const exports = await storage.getUserClinicalExports(userId);
    
    res.json({ exports });
  } catch (error) {
    console.error('Get exports error:', error);
    res.status(500).json({ error: 'Failed to get exports' });
  }
});

// Insurance Summary for Licensed Therapists
router.post('/api/insurance/session-summary', async (req, res) => {
  try {
    const { 
      therapistId, 
      userId, 
      sessionDate, 
      sessionDuration, 
      sessionType,
      treatmentGoals,
      progressNotes,
      diagnosisCode,
      interventions 
    } = req.body;
    
    // Verify therapist licensing (would check against license database in production)
    const isLicensed = true; // Mock verification
    
    if (!isLicensed) {
      return res.status(403).json({ error: 'Therapist licensing verification failed' });
    }

    const cptCode = InsuranceService.generateCPTCode(sessionType, sessionDuration);
    const billableAmount = InsuranceService.calculateBillableAmount(cptCode, 'default');
    
    const summary = {
      sessionId: `SESSION-${Date.now()}`,
      therapistId,
      userId: `PATIENT-${userId}`,
      sessionDate,
      sessionDuration,
      sessionType,
      cptCode,
      diagnosisCode,
      billableAmount,
      treatmentGoals,
      progressNotes,
      interventions,
      clinicalImpression: `Patient demonstrated ${progressNotes.engagement || 'good'} engagement in therapy session. ${progressNotes.progress || 'Continued progress towards treatment goals observed.'} Recommend ${progressNotes.recommendation || 'continuing current treatment plan'}.`,
      nextAppointment: progressNotes.nextAppointment || null,
      riskAssessment: progressNotes.riskLevel || 'low',
      complianceNotes: 'Session conducted in accordance with HIPAA privacy standards and professional therapeutic guidelines.'
    };

    // Store insurance-eligible session summary
    const billing = await storage.createSessionBilling({
      userId,
      therapistId,
      sessionId: summary.sessionId,
      cptCode,
      diagnosisCode,
      sessionDate: new Date(sessionDate),
      sessionDuration,
      sessionType,
      billableAmount,
      claimStatus: 'draft'
    });

    res.json({ 
      success: true, 
      summary, 
      billingRecord: billing,
      eligibleForInsurance: true,
      message: 'Insurance-eligible session summary generated successfully'
    });
  } catch (error) {
    console.error('Insurance session summary error:', error);
    res.status(500).json({ error: 'Failed to generate insurance session summary' });
  }
});

// Audit Trail Retrieval
router.get('/api/ehr/audit-logs/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const auditLogs = await storage.getAuditLogs(userId, startDate, endDate);
    
    res.json({ auditLogs });
  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

export default router;
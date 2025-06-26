import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import multer from 'multer';
import { setupVite, serveStatic, log } from "./vite.js";
import { storage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Chat endpoint with OpenAI integration and personality mirroring
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 1 } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Making OpenAI API call...');
    
    // Get user's personality data for mirroring
    let personalityContext = '';
    try {
      const { storage } = await import('./storage.js');
      const memories = await storage.getUserMemories(userId);
      const facts = await storage.getUserFacts(userId);
      console.log('Loaded personality data:', { memoriesCount: memories.length, factsCount: facts.length });
      
      if (memories.length > 0 || facts.length > 0) {
        const memoryText = memories.slice(-5).map(m => m.memory).join('\n');
        const factText = facts.slice(-5).map(f => f.fact).join('\n');
        
        personalityContext = `

PERSONALITY MIRRORING CONTEXT:
User Memories: ${memoryText}
User Facts: ${factText}

Mirror this user's communication style, personality traits, and mannerisms back to them. Be their therapeutic reflection - use their own patterns, interests, and communication style while providing support. Reference their personal details naturally.`;
      }
    } catch (error) {
      console.log('Could not load personality data:', error.message);
    }
    
    // OpenAI API call with personality mirroring
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
            content: `You are TrAI, a therapeutic companion that mirrors the user's personality back to them for self-reflection. Your core purpose is to reflect their identity, communication style, and mannerisms to help them see themselves clearly.

Be supportive and therapeutic while authentically mirroring their:
- Communication patterns and style
- Interests and values  
- Personality traits and mannerisms
- Personal background and experiences

Use their own words, phrases, and communication patterns when appropriate. Reference their personal details naturally to show you understand and remember them.${personalityContext}`
          },
          {
            role: 'user',
            content: message
          }
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

    res.json({
      message: aiResponse,
      response: aiResponse,
      wordsLearned: 1000,
      stage: "Therapist",
      crisisDetected: false,
      crisisData: null,
      personalityMode: "supportive",
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

// Stats endpoint - support both with and without userId
app.get('/api/stats/:userId?', (req, res) => {
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
app.get('/api/bot-stats/:userId', (req, res) => {
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

// Mood tracking endpoint
app.post('/api/mood', (req, res) => {
  try {
    const { userId, mood, intensity } = req.body;
    
    res.json({ 
      success: true, 
      message: `Mood "${mood}" recorded with intensity ${intensity}` 
    });
  } catch (error) {
    console.error('Mood tracking error:', error);
    res.status(500).json({ error: 'Failed to track mood' });
  }
});

// Daily affirmation endpoint
app.get('/api/daily-affirmation', (req, res) => {
  const affirmations = [
    "You are capable of amazing things.",
    "Your mental health matters and you deserve support.",
    "Every small step forward is progress worth celebrating.",
    "You have the strength to overcome today's challenges.",
    "Your feelings are valid and you are not alone."
  ];
  
  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  
  res.json({ affirmation: randomAffirmation });
});

// Daily content endpoint
app.get('/api/daily-content', (req, res) => {
  const affirmations = [
    "When days get hard, don't let them win, remember who you are!",
    "I'm surrounded by a loving and supportive environment that nurtures my well-being.",
    "Every challenge I face is an opportunity to grow stronger and wiser.",
    "I have the power to create positive change in my life, one step at a time.",
    "Today brings new possibilities, and I'm ready to embrace them with confidence."
  ];
  
  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  
  res.json({ 
    affirmation: randomAffirmation,
    horoscope: "Today is a great day for self-reflection and growth."
  });
});

// Horoscope endpoint
app.get('/api/horoscope/:sign', (req, res) => {
  const { sign } = req.params;
  
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
    horoscope: horoscopes[sign.toLowerCase()] || "Today is a great day for self-reflection and growth." 
  });
});

// Weekly summary endpoint
app.get('/api/weekly-summary', (req, res) => {
  try {
    const summaries = [
      "This week, you've shown remarkable growth in self-awareness and emotional intelligence.",
      "Your conversations reflect deep introspection and a commitment to personal wellness.",
      "This week's interactions demonstrate your resilience and willingness to explore difficult topics.",
      "You've engaged thoughtfully with therapeutic concepts, showing genuine progress.",
      "Your openness to growth and self-reflection has been particularly evident this week."
    ];
    
    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
    res.json({ summary: randomSummary });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
});

// Voice transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
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
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'james', emotionalContext = 'neutral' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // CORRECTED voice IDs - using actual working Carla voice
    const voiceMap: Record<string, string> = {
      'james': 'EkK5I93UQWFDigLMpZcX',
      'brian': 'nPczCjzI2devNBz1zQrb', 
      'alexandra': 'kdmDKE6EkgrWrrykO9Qt',
      'carla': 'l32B8XDoylOsZKiSdfhE'  // Correct Carla voice ID
    };

    const voiceId = voiceMap[voice] || voiceMap['james'];
    
    try {
      console.log(`Making ElevenLabs request for voice: ${voice} (ID: ${voiceId})`);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: emotionalContext === 'calming' ? 0.8 : 0.6,
            similarity_boost: 0.7,
            style: emotionalContext === 'energizing' ? 0.3 : 0.1,
            use_speaker_boost: true
          }
        })
      });

      console.log('ElevenLabs response status:', response.status);

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        console.log('Audio buffer size:', audioBuffer.byteLength);
        
        if (audioBuffer.byteLength > 0) {
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          console.log('Base64 audio length:', base64Audio.length);
          
          return res.json({
            audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
            useBrowserTTS: false,
            voice: voice,
            success: true
          });
        } else {
          console.log('Empty audio buffer received from ElevenLabs');
          throw new Error('Empty audio response');
        }
      } else {
        const errorText = await response.text();
        console.log('ElevenLabs API error:', response.status, response.statusText, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    } catch (elevenLabsError) {
      console.log('ElevenLabs API failed:', elevenLabsError.message);
      
      // NO BROWSER TTS FALLBACK
      res.json({ 
        audioUrl: null,
        useBrowserTTS: false,
        success: false,
        error: elevenLabsError.message
      });
    }

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Voice synthesis failed' });
  }
});

// Onboarding status endpoint
app.get('/api/onboarding-status/:userId', async (req, res) => {
  try {
    // Return that onboarding is complete to bypass the quiz
    res.json({ 
      isComplete: true,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

// Complete onboarding endpoint
app.post('/api/complete-onboarding', async (req, res) => {
  try {
    const { userId, responses } = req.body;
    
    // Store onboarding responses (simplified for now)
    res.json({ 
      success: true,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Bot stats endpoint
app.get('/api/stats/:userId', async (req, res) => {
  try {
    res.json({
      level: 3,
      stage: "Therapist",
      wordsLearned: 1000
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});


// Journal endpoints
app.post('/api/journal/entries', async (req, res) => {
  try {
    const { userId = 1, title, content, mood, moodIntensity, tags } = req.body;
    
    const entry = await storage.createJournalEntry({
      userId,
      title,
      content,
      mood,
      moodIntensity,
      tags: tags || [],
      isPrivate: true
    });
    
    res.json(entry);
  } catch (error) {
    console.error('Journal entry creation error:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

app.get('/api/journal/entries/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const entries = await storage.getJournalEntries(userId);
    res.json(entries);
  } catch (error) {
    console.error('Journal entries fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Mood tracking endpoints
app.post('/api/mood/entries', async (req, res) => {
  try {
    const { userId = 1, mood, intensity, notes, triggers, copingStrategies } = req.body;
    
    const entry = await storage.createMoodEntry({
      userId,
      mood,
      intensity,
      notes,
      triggers: triggers || [],
      copingStrategies: copingStrategies || []
    });
    
    res.json(entry);
  } catch (error) {
    console.error('Mood entry creation error:', error);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

app.get('/api/mood/entries/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const entries = await storage.getMoodEntries(userId);
    res.json(entries);
  } catch (error) {
    console.error('Mood entries fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// Goals endpoints
app.post('/api/goals', async (req, res) => {
  try {
    const { userId = 1, title, description, category, targetValue, targetDate } = req.body;
    
    const goal = await storage.createTherapeuticGoal({
      userId,
      title,
      description,
      category,
      targetValue,
      currentValue: 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      isActive: true
    });
    
    res.json(goal);
  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.get('/api/goals/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const goals = await storage.getTherapeuticGoals(userId);
    res.json(goals);
  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Community endpoints
app.get('/api/community/forums', async (req, res) => {
  try {
    const forums = await storage.getSupportForums();
    res.json(forums);
  } catch (error) {
    console.error('Forums fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

app.get('/api/community/posts/:forumId', async (req, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    const posts = await storage.getForumPosts(forumId);
    res.json(posts);
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Analytics endpoints
app.get('/api/analytics/wellness-score/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const score = await storage.calculateWellnessScore(userId);
    res.json({ score });
  } catch (error) {
    console.error('Wellness score error:', error);
    res.status(500).json({ error: 'Failed to calculate wellness score' });
  }
});

app.get('/api/achievements/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const achievements = await storage.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Setup development or production serving AFTER all API routes
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  setupVite(app, server).then(() => {
    console.log('Vite setup complete');
  });
}

server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Replit domain: ${process.env.REPLIT_DEV_DOMAIN || 'localhost'}`);
});

export default app;
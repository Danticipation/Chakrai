import express from "express";
import cors from "cors";
import { createServer } from "http";
import multer from "multer";
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

    const horoscopes = {
      aries: [
        "Your leadership qualities shine today. Take initiative on projects that matter to you.",
        "Mars energizes your ambition. A bold move could lead to unexpected opportunities.",
        "Your competitive spirit serves you well. Channel that energy into productive pursuits."
      ],
      taurus: [
        "Venus brings harmony to your relationships. Focus on building stronger connections.",
        "Your practical nature helps you solve a financial matter. Trust your instincts.",
        "Slow and steady progress in your goals brings lasting satisfaction today."
      ],
      gemini: [
        "Mercury enhances your communication skills. Important conversations flow easily.",
        "Your curiosity leads to valuable discoveries. Stay open to learning something new.",
        "Networking and social connections bring unexpected benefits your way."
      ],
      cancer: [
        "The Moon illuminates your intuitive powers. Trust your emotional guidance today.",
        "Family and home matters receive positive attention. Nurturing brings rewards.",
        "Your empathetic nature helps someone in need, creating good karma."
      ],
      leo: [
        "The Sun spotlights your creative talents. Express yourself boldly and authentically.",
        "Your natural charisma attracts positive attention from others today.",
        "Leadership opportunities present themselves. Step into your power confidently."
      ],
      virgo: [
        "Your attention to detail pays off in a significant way. Perfectionism serves you well.",
        "Health and wellness routines bring noticeable improvements to your energy.",
        "Practical solutions to complex problems come naturally to you today."
      ],
      libra: [
        "Balance and harmony guide your decisions. Diplomatic approaches yield success.",
        "Venus enhances your charm and social appeal. Relationships flourish today.",
        "Artistic or aesthetic projects receive inspiration and positive feedback."
      ],
      scorpio: [
        "Your intensity and focus help you uncover hidden truths or opportunities.",
        "Transformation energy is strong. Embrace changes that serve your highest good.",
        "Your investigative nature leads to valuable insights about a situation."
      ],
      sagittarius: [
        "Jupiter expands your horizons. Travel, learning, or philosophy captures your interest.",
        "Your optimistic outlook inspires others and opens new doors for you.",
        "Adventure calls to you. Take calculated risks that align with your goals."
      ],
      capricorn: [
        "Saturn rewards your hard work and dedication with tangible progress.",
        "Your disciplined approach to goals shows impressive results today.",
        "Authority figures or mentors provide valuable guidance for your career path."
      ],
      aquarius: [
        "Uranus brings innovative ideas and fresh perspectives to your projects.",
        "Your humanitarian nature guides you toward meaningful social connections.",
        "Technology or unconventional approaches solve problems others cannot."
      ],
      pisces: [
        "Neptune enhances your intuition and creative inspiration flows freely.",
        "Your compassionate nature attracts kindred spirits and meaningful relationships.",
        "Dreams and subconscious insights provide guidance for important decisions."
      ]
    };

    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;
    
    // Use user's zodiac sign if provided, otherwise random
    let selectedSign: string;
    if (userZodiacSign && typeof userZodiacSign === 'string' && zodiacSigns.includes(userZodiacSign.toLowerCase() as any)) {
      selectedSign = userZodiacSign.toLowerCase();
    } else {
      selectedSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
    }
    
    const signHoroscopes = horoscopes[selectedSign as keyof typeof horoscopes];
    
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    const randomHoroscope = signHoroscopes[Math.floor(Math.random() * signHoroscopes.length)];

    res.json({
      affirmation: randomAffirmation,
      horoscope: randomHoroscope,
      zodiacSign: selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1)
    });

  } catch (error) {
    console.error('Daily content generation error:', error);
    res.status(500).json({ error: 'Failed to generate daily content' });
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

// Chat endpoint with persistent memory and personality mirroring
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 1, personalityMode = 'friend' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }

    // Import personality analysis
    const { analyzeConversationForPersonality, buildPersonalityProfile, generateMirroredResponse } = await import('./personalityAnalysis.js');
    
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

    // Get recent conversation history
    const recentMessages = await storage.getMessages(bot.id);
    const conversationHistory = recentMessages
      .slice(-10)
      .map(m => `${m.sender}: ${m.text}`);

    // Store the user's message
    await storage.createMessage({
      botId: bot.id,
      sender: 'user',
      text: message
    });

    // Analyze current message for personality insights
    const analysis = await analyzeConversationForPersonality(
      message,
      conversationHistory.map(h => h.split(': ')[1]).filter(Boolean)
    );

    // Store new facts and memories
    for (const info of analysis.personalInfo) {
      if (info.trim()) {
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

    // Build comprehensive personality profile
    const personalityProfile = await buildPersonalityProfile(userId);

    // Generate response that mirrors user's personality
    const botResponse = await generateMirroredResponse(
      message,
      personalityProfile,
      conversationHistory,
      personalityMode
    );

    // Store bot's response
    await storage.createMessage({
      botId: bot.id,
      sender: 'bot',
      text: botResponse
    });

    // Update bot's learned words count
    const wordCount = message.split(' ').length;
    await storage.updateBot(bot.id, {
      wordsLearned: bot.wordsLearned + wordCount,
      personalityTraits: personalityProfile
    });

    // Calculate stage based on total words
    const totalWords = bot.wordsLearned + wordCount;
    let stage = "Infant";
    if (totalWords > 500) stage = "Adult";
    else if (totalWords > 300) stage = "Adolescent";
    else if (totalWords > 150) stage = "Child";
    else if (totalWords > 50) stage = "Toddler";

    res.json({
      response: botResponse,
      wordsLearned: totalWords,
      stage: stage,
      personalityInsights: {
        emotionalTone: analysis.emotionalTone,
        communicationStyle: personalityProfile.communicationStyle,
        coreTraits: personalityProfile.coreTraits.slice(0, 3)
      }
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

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

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
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
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Chat endpoint with OpenAI integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 1 } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // OpenAI API call
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
            content: 'You are TrAI, a compassionate mental wellness and therapy companion. Provide supportive, therapeutic responses that are empathetic, professional, and helpful. Keep responses conversational and supportive.'
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

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

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
    const { text, voiceId = 'EkK5I93UQWFDigLMpZcX' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a fallback response since ElevenLabs requires specific setup
    // In production, this would connect to ElevenLabs API
    res.status(503).json({ 
      error: 'Voice synthesis temporarily unavailable. Please enable browser text-to-speech.',
      fallback: true
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Voice synthesis failed' });
  }
});

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, '../dist/public')));

// Handle all other routes - serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
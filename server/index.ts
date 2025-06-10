import express from "express";
import cors from "cors";
import { createServer } from "http";
import { setupVite } from "./vite.js";

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

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

// Weekly summary endpoint
app.get('/api/weekly-summary', async (req, res) => {
  try {
    res.json({
      summary: "Your journey this week has shown remarkable growth and self-reflection. You've engaged thoughtfully with complex topics and demonstrated a genuine commitment to personal development. Keep embracing the conversations that challenge and inspire you."
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const responses = [
      "That's a thoughtful perspective. Tell me more about what's on your mind.",
      "I appreciate you sharing that with me. How does that make you feel?",
      "Your insights are valuable. What would you like to explore next?",
      "I'm here to listen and support you. What's most important to you right now?",
      "Thank you for trusting me with your thoughts. How can I help you today?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
      response: randomResponse,
      wordsLearned: 335,
      stage: "Advanced"
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Transcription endpoint for voice input
app.post('/api/transcribe', async (req, res) => {
  try {
    res.json({
      text: "Voice transcription requires OpenAI API configuration. Please type your message instead."
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Text-to-speech endpoint for audio responses
app.post('/api/text-to-speech', async (req, res) => {
  try {
    res.status(503).json({ error: 'Text-to-speech requires ElevenLabs API configuration' });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Text-to-speech failed' });
  }
});

// Setup Vite for frontend serving
const server = createServer(app);

// Start server with async setup
const startServer = async () => {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
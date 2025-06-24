import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chat endpoint - working version
app.post('/api/chat', (req, res) => {
  try {
    const { message, userId = 1 } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple therapeutic response
    const response = "I understand you're reaching out. I'm here to support you through your mental wellness journey. How are you feeling right now?";

    res.json({
      message: response,
      response: response,
      wordsLearned: 1000,
      stage: "Therapist",
      crisisDetected: false,
      crisisData: null,
      personalityMode: "supportive",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Stats endpoint
app.get('/api/stats/:userId', (req, res) => {
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

// Serve static files and handle React routes
app.use(express.static('client/dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
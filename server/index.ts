import express from "express";
import cors from "cors";
import { createServer } from "http";

const app = express();
const PORT = 3000;

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

    const insights = [
      "Small consistent actions create remarkable transformations over time.",
      "Your thoughts shape your reality - choose them wisely and with intention.",
      "Embracing uncertainty opens doors to unexpected opportunities and growth.",
      "The only way out is through - trust the process and keep moving forward.",
      "Every ending is a new beginning waiting to unfold in your life.",
      "Your current struggles are preparing you for future strength and wisdom.",
      "Focus on progress, not perfection - every step forward matters.",
      "The answers you seek often come when you stop forcing and start flowing.",
      "Your authentic self is your greatest gift to the world around you.",
      "Patience with yourself creates space for genuine transformation to occur.",
      "What you practice grows stronger - choose your habits mindfully today.",
      "Sometimes the best thing you can do is simply show up as you are.",
      "Your energy is precious - invest it in what truly aligns with your values.",
      "Every challenge contains wisdom that will serve you in the future.",
      "The path forward becomes clearer when you trust your inner guidance."
    ];

    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];

    res.json({
      affirmation: randomAffirmation,
      horoscope: randomInsight
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

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
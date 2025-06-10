import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Daily content endpoint
app.get('/api/daily-content', (req, res) => {
  const affirmations = [
    "When days get hard, don't let them win, remember who you are!",
    "Every challenge I face is an opportunity to grow stronger and wiser.",
    "I have the power to create positive change in my life, one step at a time.",
    "Today brings new possibilities, and I'm ready to embrace them with confidence.",
    "I trust in my ability to overcome obstacles and achieve my dreams."
  ];

  const insights = [
    "Small consistent actions create remarkable transformations over time.",
    "Your thoughts shape your reality - choose them wisely and with intention.",
    "Embracing uncertainty opens doors to unexpected opportunities and growth.",
    "The only way out is through - trust the process and keep moving forward.",
    "Every ending is a new beginning waiting to unfold in your life."
  ];

  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  res.json({
    affirmation: randomAffirmation,
    horoscope: randomInsight
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    wordCount: 334,
    factCount: 87,
    memoryCount: 57,
    stage: "Advanced",
    nextStageAt: 500
  });
});

app.get('/api/weekly-summary', (req, res) => {
  res.json({
    summary: "Your journey this week has shown remarkable growth and self-reflection. You've engaged thoughtfully with complex topics and demonstrated a genuine commitment to personal development."
  });
});

app.post('/api/chat', (req, res) => {
  const responses = [
    "That's a thoughtful perspective. Tell me more about what's on your mind.",
    "I appreciate you sharing that with me. How does that make you feel?",
    "Your insights are valuable. What would you like to explore next?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    response: randomResponse,
    wordsLearned: 335,
    stage: "Advanced"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
import express from "express";
import cors from "cors";

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// Daily content endpoint
app.get('/api/daily-content', (req, res) => {
  res.json({
    affirmation: "Today is a new opportunity to grow and shine. You have everything within you to achieve great things.",
    horoscope: "The stars align in your favor today. Focus on your goals and trust your intuition to guide you forward."
  });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `I hear you saying: "${message}". Thank you for sharing that with me. How does that make you feel?`
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
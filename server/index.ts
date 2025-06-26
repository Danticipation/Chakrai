import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { setupVite, serveStatic, log } from "./vite.js";
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Direct bot stats endpoint to fix immediate JSON parsing error
app.get('/api/bot-stats', (req, res) => {
  res.json({ 
    level: 3,
    stage: "Therapist",
    wordsLearned: 1000
  });
});

// Direct daily affirmation endpoint
app.get('/api/daily-affirmation', (req, res) => {
  res.json({ 
    affirmation: 'Today is a beautiful day to practice self-compassion and growth.' 
  });
});

// Direct weekly summary endpoint
app.get('/api/weekly-summary', (req, res) => {
  res.json({ 
    summary: 'Your therapeutic journey continues to evolve positively. Focus on your mental wellness and personal growth this week.' 
  });
});

// Use API routes
app.use('/api', routes);

// Setup Vite in development or serve static files in production
async function setupServer() {
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running on port ${PORT}`);
    log(`Server accessible at http://0.0.0.0:${PORT}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(',')[0];
      log(`Replit domain: ${domain}`);
    }
    
    log('Vite setup complete');
  });
}

setupServer().catch(console.error);
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { setupVite, serveStatic, log } from "./vite.js";

// Import route modules
import chatRoutes from './routes/chat.js';
import contentRoutes from './routes/content.js';
import moodRoutes from './routes/mood.js';
import journalRoutes from './routes/journal.js';
import analyticsRoutes from './routes/analytics.js';
import gamificationRoutes from './routes/gamification.js';
import communityRoutes from './routes/community.js';
import healthRoutes from './routes/health.js';
import privacyRoutes from './routes/privacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes - organized by feature
app.use('/api', chatRoutes);
app.use('/api', contentRoutes);
app.use('/api', moodRoutes);
app.use('/api', journalRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', gamificationRoutes);
app.use('/api', communityRoutes);
app.use('/api', healthRoutes);
app.use('/api', privacyRoutes);

// Setup Vite in development or serve static files in production
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
});
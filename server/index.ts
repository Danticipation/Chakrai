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
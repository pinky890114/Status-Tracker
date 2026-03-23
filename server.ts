import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Telegram Notifications
  app.post('/api/notify', async (req: Request, res: Response) => {
    const { message } = req.body;
    
    // Use server-side env variables (more reliable and secure)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;

    console.log("Telegram Notify Request Received.");
    console.log("Bot Token exists:", !!botToken);
    console.log("Chat ID exists:", !!chatId);

    if (!botToken || !chatId) {
      console.error("Telegram config missing on server:", { hasToken: !!botToken, hasChatId: !!chatId });
      return res.status(500).json({ error: "Telegram configuration missing on server." });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        console.error("Telegram API error:", data);
        return res.status(response.status).json(data);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Telegram fetch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

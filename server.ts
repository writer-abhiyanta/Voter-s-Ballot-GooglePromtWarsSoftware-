import express from "express";
import { createServer as createViteServer } from "vite";
import { Logging } from '@google-cloud/logging';
import path from "path";

// Initialize the Google Cloud Logging Client
// Authentication assumes appropriate Application Default Credentials or Service Account keys are set in the environment
const logging = new Logging();
const log = logging.log('election-app-log');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to capture client-side logs using the Google Cloud Logging SDK
  app.post("/api/log", async (req, res) => {
    try {
      const { event, details, severity = 'INFO' } = req.body;
      
      const metadata = {
        resource: { type: 'global' },
        severity: severity,
      };

      const entry = log.entry(metadata, { event, ...details });
      
      // Write the log entry to Cloud Logging
      // Explicitly using the Google Cloud Logging SDK to track errors and events structurally
      await log.write(entry);
      
      res.json({ status: "logged" });
    } catch (error) {
      console.error("Failed to write to Cloud Logging:", error);
      res.status(500).json({ error: "Failed to log" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

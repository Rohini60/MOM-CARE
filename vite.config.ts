import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import {
  handleSymptomTriage,
  handleContextualChat,
  handleReportInsights,
  handleMomCareNoticed,
  handleWombRender,
  handleHomeInsight,
} from './src/server/geminiHandler';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        const url = req.url.split('?')[0];

        // Collect body chunks
        const chunks: Uint8Array[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        let body: any = {};
        try {
          if (rawBody) {
            body = JSON.parse(rawBody);
          }
        } catch {
          body = {};
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (url === '/api/gemini/symptom-triage') {
            const result = await handleSymptomTriage(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (url === '/api/gemini/chat') {
            const result = await handleContextualChat(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (url === '/api/gemini/report-insights') {
            const result = await handleReportInsights(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (url === '/api/gemini/pattern-notice') {
            const result = await handleMomCareNoticed(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (url === '/api/gemini/womb-render') {
            const result = await handleWombRender(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (url === '/api/gemini/home-insight') {
            const result = await handleHomeInsight(body);
            res.end(JSON.stringify(result));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (error: any) {
          console.error('API Error in Vite Middleware:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error?.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


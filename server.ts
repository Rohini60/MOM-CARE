import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleSymptomTriage,
  handleContextualChat,
  handleReportInsights,
  handleMomCareNoticed,
  handleWombRender,
  handleHomeInsight,
} from './src/server/geminiHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(process.cwd(), 'dist');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.post('/api/gemini/symptom-triage', async (req, res) => {
  try {
    const result = await handleSymptomTriage(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const result = await handleContextualChat(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/report-insights', async (req, res) => {
  try {
    const result = await handleReportInsights(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/pattern-notice', async (req, res) => {
  try {
    const result = await handleMomCareNoticed(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/womb-render', async (req, res) => {
  try {
    const result = await handleWombRender(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/home-insight', async (req, res) => {
  try {
    const result = await handleHomeInsight(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download Route for Presentation PPTX
app.get(['/MomCare_Presentation.pptx', '/api/download-presentation'], (req, res) => {
  const pptxPath = path.resolve(process.cwd(), 'public', 'MomCare_Presentation.pptx');
  res.download(pptxPath, 'MomCare_Presentation.pptx');
});

// Serve static assets from dist
app.use(express.static(distDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MomCare production server running on port ${PORT}`);
});

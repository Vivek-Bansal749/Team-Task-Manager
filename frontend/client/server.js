import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;
const distPath = join(__dirname, 'dist');

// Serve static files from the dist directory
app.use(express.static(distPath, { 
  maxAge: '1d',
  etag: false
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  
  // Check if file exists before sending
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at ${indexPath}`);
    res.status(404).send('index.html not found. Make sure to run "npm run build" first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving files from: ${distPath}`);
});

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const TOOL_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'compress-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'resize-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'crop-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'rotate-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'photo-editor', priority: '0.9', changefreq: 'weekly' },
  { path: 'watermark-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'blur-face', priority: '0.9', changefreq: 'weekly' },
  { path: 'remove-background', priority: '0.9', changefreq: 'weekly' },
  { path: 'meme-generator', priority: '0.85', changefreq: 'weekly' },
  { path: 'upscale-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'html-to-image', priority: '0.8', changefreq: 'weekly' },
  { path: 'image-to-pdf', priority: '0.9', changefreq: 'weekly' },
  { path: 'pdf-to-image', priority: '0.9', changefreq: 'weekly' },
  { path: 'jpg-to-png', priority: '0.85', changefreq: 'monthly' },
  { path: 'png-to-jpg', priority: '0.85', changefreq: 'monthly' },
  { path: 'jpg-to-webp', priority: '0.85', changefreq: 'monthly' },
  { path: 'png-to-webp', priority: '0.85', changefreq: 'monthly' },
  { path: 'webp-to-jpg', priority: '0.8', changefreq: 'monthly' },
  { path: 'webp-to-png', priority: '0.8', changefreq: 'monthly' },
  { path: 'gif-to-jpg', priority: '0.8', changefreq: 'monthly' },
  { path: 'gif-to-png', priority: '0.8', changefreq: 'monthly' },
  { path: 'bmp-to-jpg', priority: '0.8', changefreq: 'monthly' },
  { path: 'bmp-to-png', priority: '0.8', changefreq: 'monthly' },
  { path: 'svg-to-png', priority: '0.8', changefreq: 'monthly' },
  { path: 'heic-to-jpg', priority: '0.85', changefreq: 'monthly' },
  { path: 'heic-to-png', priority: '0.85', changefreq: 'monthly' }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dynamic Sitemap generator function
  const generateSitemapXml = (req: express.Request) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'imagemagic.app';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const xmlUrls = TOOL_ROUTES.map(route => {
      const url = route.path ? `${baseUrl}/${route.path}` : `${baseUrl}/`;
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlUrls}
</urlset>`;
  };

  // Dynamic /sitemap.xml and /api/sitemap.xml routes
  app.get(['/sitemap.xml', '/api/sitemap.xml'], (req, res) => {
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml(req));
  });

  // Dynamic /robots.txt
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'imagemagic.app';
    const baseUrl = `${protocol}://${host}`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *
Allow: /

# Dynamic Sitemap Reference for Googlebot & Crawlers
Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // Google AdSense /ads.txt
  app.get('/ads.txt', (req, res) => {
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send('google.com, pub-3688655520936788, DIRECT, f08c47fec0942fa0\n');
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

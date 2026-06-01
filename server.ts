import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import { dbInstance, hashPassword, verifyPassword } from './server/db';

// Fixed hardcoded JWT secret fallback vulnerability by generating a high-entropy random key when process.env is empty
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Input sanitization and verification middleware to prevent Server TypeError crashes (DoS)
  function validateAuthPayload(req: any, res: any, next: any) {
    const { email, password, name } = req.body;
    
    // Check missing fields for registration
    if (req.path.endsWith('/register') && (!email || !password || !name)) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }
    // Check missing fields for login
    if (req.path.endsWith('/login') && (!email || !password)) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email !== undefined && (typeof email !== 'string' || email.length > 254 || !email.includes('@'))) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 6 || password.length > 100)) {
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters long' });
    }
    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
      return res.status(400).json({ error: 'Name must be a string under 100 characters' });
    }
    next();
  }

  function validateProjectPayload(req: any, res: any, next: any) {
    const { name, type, content, design, trackingId } = req.body;
    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
      return res.status(400).json({ error: 'Project name must be a string and under 100 characters' });
    }
    if (type !== undefined && (typeof type !== 'string' || type.length > 30)) {
      return res.status(400).json({ error: 'Invalid project type format' });
    }
    if (content !== undefined && (typeof content !== 'string' || content.length > 2048)) {
      return res.status(400).json({ error: 'Content must be a string under 2048 characters' });
    }
    if (trackingId !== undefined && (typeof trackingId !== 'string' || trackingId.length > 50)) {
      return res.status(400).json({ error: 'Invalid trackingId format' });
    }
    next();
  }

  // Middleware to authenticate JWT Token
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Session expired or invalid token' });
      }
      req.user = decoded;
      next();
    });
  }

  // API Check Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'ready', auth: 'jwt' });
  });

  // --- AUTHENTICATION ENDPOINTS ---

  // User Registration
  app.post('/api/auth/register', validateAuthPayload, async (req, res) => {
    const { email, password, name } = req.body;

    try {
      const existingUser = await dbInstance.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = hashPassword(password);
      const newUser = await dbInstance.createUser({
        email,
        name,
        passwordHash
      });

      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (err: any) {
      console.error('Registration processing error:', err);
      res.status(500).json({ error: 'Internal server error while registering user.' });
    }
  });

  // User Login
  app.post('/api/auth/login', validateAuthPayload, async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await dbInstance.findUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (err: any) {
      console.error('Login processing error:', err);
      res.status(500).json({ error: 'Internal server error while logging in.' });
    }
  });

  // Fetch Session User Info
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await dbInstance.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (err: any) {
      console.error('Me verifying error:', err);
      res.status(500).json({ error: 'Error validating session.' });
    }
  });

  // --- PROJECTS ENDPOINTS ---

  // Get User Projects
  app.get('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const projects = await dbInstance.getProjects(req.user.id);
      res.json(projects);
    } catch (err: any) {
      console.error('Fetch projects error:', err);
      res.status(500).json({ error: 'Failed to retrieve projects.' });
    }
  });

  // Save/Create/Update Project
  app.post('/api/projects', authenticateToken, validateProjectPayload, async (req: any, res) => {
    const { id, name, type, content, design, trackingEnabled, trackingId } = req.body;

    const projectId = id || `proj-${Math.random().toString(36).substring(2, 11)}`;
    const finalTrackingId = trackingId || Math.random().toString(36).substring(2, 8);

    const isUpdate = !!id;

    try {
      if (isUpdate) {
        const updated = await dbInstance.updateProject(projectId, req.user.id, {
          name,
          type,
          content,
          design,
          trackingEnabled
        });
        if (!updated) {
          return res.status(404).json({ error: 'Project not found or unauthorized' });
        }
        res.json(updated);
      } else {
        const created = await dbInstance.createProject({
          id: projectId,
          userId: req.user.id,
          name: name || 'My Custom QR Code',
          type: type || 'url',
          content: content || 'https://google.com',
          design: design || {},
          trackingEnabled: trackingEnabled ?? true,
          trackingId: finalTrackingId
        });
        res.status(201).json(created);
      }
    } catch (err: any) {
      console.error('Save project error:', err);
      res.status(500).json({ error: 'Failed to save/update project.' });
    }
  });

  // Delete Project
  app.delete('/api/projects/:id', authenticateToken, async (req: any, res) => {
    try {
      const deleted = await dbInstance.deleteProject(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      res.json({ success: true, message: 'Project and matching analytics deleted successfully' });
    } catch (err: any) {
      console.error('Delete project error:', err);
      res.status(500).json({ error: 'Failed to delete project.' });
    }
  });

  // --- SCANS ENDPOINTS ---

  // Retrieve User Click Analytics logs
  app.get('/api/scans', authenticateToken, async (req: any, res) => {
    try {
      const scans = await dbInstance.getScans(req.user.id);
      res.json(scans);
    } catch (err: any) {
      console.error('Retrieve scans error:', err);
      res.status(500).json({ error: 'Failed to load clicks analytics logs.' });
    }
  });

  // Seed and generate mock scan logs for testing
  app.post('/api/scans/seed', authenticateToken, async (req: any, res) => {
    const { projectId, trackingId } = req.body;
    if (!projectId || !trackingId) {
      return res.status(400).json({ error: 'projectId and trackingId are required' });
    }

    try {
      // Security Check: Validate that project belongs to authorized user
      const project = await dbInstance.getProjectById(projectId);
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }

      const locationVariants = ['United Kingdom', 'Germany', 'France', 'United States', 'Ireland', 'Japan'];
      const deviceVariants = ['Mobile', 'Desktop', 'Tablet'];
      const browserVariants = ['Safari', 'Chrome', 'Firefox', 'Edge'];

      const locSelected = locationVariants[Math.floor(Math.random() * locationVariants.length)];
      const devSelected = deviceVariants[Math.floor(Math.random() * deviceVariants.length)];
      const bSelected = browserVariants[Math.floor(Math.random() * browserVariants.length)];
      const randomIp = `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;

      const scanId = `scan-${Math.random().toString(36).substring(2, 11)}`;

      // Generate scan
      const newScan = await dbInstance.createScan({
        id: scanId,
        projectId,
        trackingId,
        deviceType: devSelected,
        browser: bSelected,
        approxLocation: locSelected,
        ip: randomIp,
        userId: req.user.id
      });

      // Increment counter
      await dbInstance.incrementProjectScan(projectId);

      res.status(201).json(newScan);
    } catch (err: any) {
      console.error('Seeding scan analytics error:', err);
      res.status(500).json({ error: 'Failed to seed scan records.' });
    }
  });

  // Wipe all clicks logs for a user accounts safely
  app.delete('/api/scans/purge', authenticateToken, async (req: any, res) => {
    try {
      await dbInstance.purgeScans(req.user.id);
      res.json({ success: true, message: 'All click visitor logs successfully reset' });
    } catch (err: any) {
      console.error('Purging user scans data error:', err);
      res.status(500).json({ error: 'Failed to reset log history.' });
    }
  });


  // --- REDIRECTIONAL ACCESS GATE ---
  // Real-Time public tracking short URL parser
  app.get('/qr/:trackingId', async (req, res) => {
    const { trackingId } = req.params;
    try {
      const project = await dbInstance.getProjectByTrackingId(trackingId);
      if (!project) {
        return res.status(404).send('Dynamic short link not found.');
      }

      const destination = project.content || 'https://google.com';

      // Redirection protocol verification to fix Open Redirect/stored XSS via javascript URIs
      const cleanDestination = destination.trim().toLowerCase();
      if (cleanDestination.startsWith('javascript:')) {
        return res.status(400).send('Blocked unsafe protocol redirect.');
      }

      // Record logs if tracking is enabled
      if (project.trackingEnabled) {
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();
        let deviceType = 'Desktop';
        if (userAgent.includes('mobi')) {
          deviceType = 'Mobile';
        } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
          deviceType = 'Tablet';
        }

        let browser = 'Chrome';
        if (userAgent.includes('firefox')) {
          browser = 'Firefox';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
          browser = 'Safari';
        } else if (userAgent.includes('edge')) {
          browser = 'Edge';
        }

        const ip = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
        const lang = (req.headers['accept-language'] || '').toLowerCase();
        let approxLocation = 'Global';
        if (lang.includes('gb') || lang.includes('uk')) {
          approxLocation = 'United Kingdom';
        } else if (lang.includes('fr')) {
          approxLocation = 'France';
        } else if (lang.includes('de')) {
          approxLocation = 'Germany';
        } else if (lang.includes('ja') || lang.includes('jp')) {
          approxLocation = 'Japan';
        } else if (lang.includes('us')) {
          approxLocation = 'United States';
        }

        const scanId = `scan-${Math.random().toString(36).substring(2, 11)}`;

        await dbInstance.createScan({
          id: scanId,
          projectId: project.id,
          trackingId: trackingId,
          deviceType,
          browser,
          approxLocation,
          ip,
          userId: project.userId
        });

        // Increment count
        await dbInstance.incrementProjectScan(project.id);
      }

      // Perform Redirection
      res.redirect(destination);
    } catch (err) {
      console.error('Core scan tracking process failed:', err);
      res.redirect('/');
    }
  });


  // --- SEO ROUTING: SITEMAP & ROBOTS ENFORCEMENTS ---
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    const host = req.headers.host || 'qrcodeps.com';
    const baseUrl = `https://${host}`;
    const slugs = [
      '',
      'wifi-qr-generator',
      'whatsapp-qr-generator',
      'email-qr-generator',
      'sms-qr-generator',
      'vcard-qr-generator',
      'url-qr-generator',
      'business-card-qr-generator',
      'restaurant-qr-generator',
      'facebook-qr-generator',
      'instagram-qr-generator',
      'youtube-qr-generator',
      'pdf-qr-generator'
    ];
    const urlXmls = slugs.map(slug => {
      return `  <url>
    <loc>${baseUrl}/${slug ? slug : ''}</loc>
    <lastmod>2026-06-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${slug === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    }).join('\n');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXmls}
</urlset>`;
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    const host = req.headers.host || 'qrcodeps.com';
    const robots = `User-agent: *
Allow: /

Sitemap: https://${host}/sitemap.xml`;
    res.send(robots);
  });


  // --- VITE MIDDLEWARE INTERFACE ---
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
    console.log(`Dynamic QR work server executing seamlessly on port ${PORT}`);
  });
}

startServer();

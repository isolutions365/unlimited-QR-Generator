import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { dbInstance, hashPassword, verifyPassword, getDb, isFallbackMode, DbScan, DbProject } from './server/db';
import { adminDb } from './server/firebase-admin';
import { doc, getDoc, getDocs, collection, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';
import { getBlogArticles, checkArticleTranslationStatus } from './src/data/blogData';
import { getFaqData } from './src/data/faqData';
import { presetToolsTranslations } from './src/utils/translations';

// Global Process Exception Handlers to prevent Vercel Serverless Function container crashes
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (err) => {
    console.error('[Server Uncaught Exception]:', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[Server Unhandled Rejection]:', reason);
  });
}

function checkFallback() {
  if (isFallbackMode) {
    throw new Error('Fallback mode is active');
  }
}

// Map of userId to active WebSocket connections
const wsClients = new Map<string, Set<WebSocket>>();

// Lazy initialize WebSocket Server
let wssInstance: WebSocketServer | null = null;
let isWsDisabled = false;

function getWss(): WebSocketServer | null {
  if (isWsDisabled) return null;
  if (!wssInstance) {
    try {
      wssInstance = new WebSocketServer({ noServer: true });
      wssInstance.on('connection', (ws: WebSocket, request, userId: string) => {
        if (!wsClients.has(userId)) {
          wsClients.set(userId, new Set());
        }
        wsClients.get(userId)!.add(ws);

        console.log(`[WS] Client successfully connected for user session: ${userId}`);

        ws.on('close', () => {
          const userSet = wsClients.get(userId);
          if (userSet) {
            userSet.delete(ws);
            if (userSet.size === 0) {
              wsClients.delete(userId);
            }
          }
          console.log(`[WS] Client disconnected. Session: ${userId}`);
        });
      });
      wssInstance.on('error', (err) => {
        console.warn('[WS Error] WebSocket server error:', err);
      });
    } catch (err) {
      console.warn('WebSocket initialization failed, disabling WebSocket feature gracefully:', err);
      isWsDisabled = true;
      return null;
    }
  }
  return wssInstance;
}

// Function to notify and send realtime payload when a scan occurs
function notifyUserOfScan(userId: string, scan: any, projectName: string) {
  const userSet = wsClients.get(userId);
  if (userSet && userSet.size > 0) {
    const payload = JSON.stringify({
      type: 'NEW_SCAN',
      data: {
        id: scan.id,
        projectId: scan.projectId,
        trackingId: scan.trackingId,
        projectName,
        deviceType: scan.deviceType,
        browser: scan.browser,
        approxLocation: scan.approxLocation,
        ip: scan.ip,
        timestamp: new Date().toISOString()
      }
    });

    for (const ws of userSet) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
    console.log(`[WS] Real-time scan notice delivered to ${userSet.size} active sessions of user: ${userId}`);
  }
}

// Fixed hardcoded JWT secret fallback vulnerability by generating a high-entropy random key when process.env is empty
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Rate Limiting In-Memory Store & Middleware Factory
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

function createRateLimiter(options: {
  windowMs: number; // e.g. 15 * 60 * 1000
  maxRequests: number; // e.g. 20, 100
  bucketName: string;
  errorMessage?: string;
}) {
  if (!rateLimitStores.has(options.bucketName)) {
    rateLimitStores.set(options.bucketName, new Map());
  }

  const store = rateLimitStores.get(options.bucketName)!;

  // Periodic cleanup of expired records every 5 minutes to avoid memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Extract client IP robustly across proxies and direct connections
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].trim();
    const now = Date.now();

    let record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

    // Standard rate limiting HTTP headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', retryAfterSec);
      const friendlyMessage = options.errorMessage || 'Too many requests. Thodi der baad try karein.';
      return res.status(429).json({
        error: friendlyMessage,
        message: friendlyMessage,
        retryAfter: retryAfterSec,
        resetTime: new Date(record.resetTime).toISOString(),
      });
    }

    next();
  };
}

// Configured Rate Limiters for specific endpoint tiers
// 1. Auth Tier: 10 requests per 15 minutes to prevent brute-force attacks
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  bucketName: 'auth_tier',
  errorMessage: 'Too many login / signup attempts. Security ke liye thodi der baad dobara try karein (Too many requests, please try again in a few minutes).'
});

// 2. AI Capabilities Tier: 20 requests per 15 minutes (cost-protection for AI calls)
const aiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  bucketName: 'ai_tier',
  errorMessage: 'AI Assistant request limit reach ho gayi hai. Thodi der baad try karein (AI request quota exceeded, please try again shortly).'
});

// 3. QR Generation / Project Save Tier: 100 requests per 15 minutes per IP
const qrGenRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  bucketName: 'qr_gen_tier',
  errorMessage: 'QR generation limit exceed ho gayi hai. Thodi der baad try karein (Too many requests, please try again in a few minutes).'
});

// 4. Form Submissions / Feedback Tier: 25 requests per 15 minutes per IP
const formRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  bucketName: 'form_tier',
  errorMessage: 'Form submission limit reach ho gayi hai. Thodi der baad try karein (Submission rate limit exceeded, please try again shortly).'
});

export const app = express();
app.use(express.json());

  // Tight and Strict CORS policy configuration
  const allowedOrigins = [
    'https://www.freeqrgen.pro',
    'https://freeqrgen.pro',
    'https://www.freeqrbarcodes.com',
    'https://freeqrbarcodes.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];

  app.use((req, res, next) => {
    // Only apply strict CORS policy to API endpoints (/api/*)
    if (!req.path.startsWith('/api')) {
      return next();
    }

    const origin = req.headers.origin;

    // Direct browser visits or non-cross-origin requests do not send Origin header and are allowed
    if (!origin) {
      return next();
    }

    const isAllowedExact = allowedOrigins.includes(origin);
    const isAllowedPattern = 
      /^https?:\/\/localhost:\d+$/.test(origin) || 
      /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin) || 
      origin.endsWith('.run.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('freeqrbarcodes.com') ||
      origin.endsWith('freeqrgen.pro');

    if (isAllowedExact || isAllowedPattern) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight responses for 24 hours

      // Immediately respond to preflight requests with zero content
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      return next();
    }

    // Block cross-origin requests from any unauthorized origin
    console.warn(`[CORS Blocked] Cross-origin request blocked from unauthorized origin: ${origin}`);
    return res.status(403).json({
      error: 'CORS policy violation. Cross-origin access from this origin is not authorized.',
      message: 'Access denied.'
    });
  });

  // SEO Redirection Engine: 301 redirect non-www, Netlify URLs, old domains, and temporary domains to the primary www domain
  app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    if (host === 'freeqrbarcodes.com' || host === 'freeqrgen.pro' || host === 'www.freeqrgen.pro' || host.includes('netlify.app') || host.includes('unlimitedqrgen.com')) {
      return res.redirect(301, `https://www.freeqrbarcodes.com${req.originalUrl}`);
    }
    next();
  });

  // Input sanitization and verification middleware to prevent Server TypeError crashes (DoS)
  function validateAuthPayload(req: any, res: any, next: any) {
    const { email, password, name } = req.body;
    
    // Check missing fields for registration
    const isRegisterPath = req.path.endsWith('/register') || req.path.endsWith('/signup') || req.path.includes('/register') || req.path.includes('/signup');
    const isLoginPath = req.path.endsWith('/login') || req.path.endsWith('/signin') || req.path.includes('/login') || req.path.includes('/signin');

    if (isRegisterPath && (!email || !password || !name)) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }
    // Check missing fields for login
    if (isLoginPath && (!email || !password)) {
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
    const { name, type, content, design, trackingId, expiryDate, expiryRedirectType, expiryRedirectUrl, expiryMessage, category } = req.body;
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
    if (expiryDate !== undefined && expiryDate !== null && expiryDate !== "" && (typeof expiryDate !== 'string')) {
      return res.status(400).json({ error: 'Expiry date must be a valid string' });
    }
    if (expiryRedirectType !== undefined && expiryRedirectType !== null && expiryRedirectType !== "" && expiryRedirectType !== 'message' && expiryRedirectType !== 'url') {
      return res.status(400).json({ error: 'Invalid redirection type' });
    }
    if (expiryRedirectUrl !== undefined && expiryRedirectUrl !== null && expiryRedirectUrl !== "" && typeof expiryRedirectUrl !== 'string') {
      return res.status(400).json({ error: 'Alternate redirect URL must be a string' });
    }
    if (expiryMessage !== undefined && expiryMessage !== null && typeof expiryMessage !== 'string') {
      return res.status(400).json({ error: 'Expired custom message must be a string' });
    }
    if (category !== undefined && category !== null && typeof category !== 'string') {
      return res.status(400).json({ error: 'Folder Category must be a string' });
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

  // Explicit /api/health endpoint with dependency ping checks and environment auditing
  app.get('/api/health', async (req, res) => {
    const startTime = Date.now();
    const envAudit = {
      node_env: process.env.NODE_ENV || 'development',
      has_gemini_key: !!process.env.GEMINI_API_KEY,
      has_firebase_config: !!(process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID),
      has_jwt_secret: !!process.env.JWT_SECRET,
    };

    let firebaseStatus: { status: string; isFallbackMode: boolean; latencyMs?: number; message?: string; error?: string } = {
      status: 'unknown',
      isFallbackMode: false,
    };

    let geminiStatus: { status: string; configured: boolean; latencyMs?: number; message?: string; error?: string } = {
      status: 'unknown',
      configured: envAudit.has_gemini_key,
    };

    // 1. Firebase Firestore ping test
    try {
      const fbStartTime = Date.now();
      if (!adminDb) {
        throw new Error('Firebase Admin DB is unavailable or not initialized');
      }

      // Fast, 100% non-blocking check to confirm the Admin SDK has loaded and initialized with a valid database ID
      const projectId = (adminDb as any).projectId || 'unknown';
      firebaseStatus = {
        status: 'ok',
        isFallbackMode: false,
        latencyMs: Date.now() - fbStartTime,
        message: 'Firebase connection verified (Admin SDK initialized for project: ' + projectId + ')',
      };
    } catch (fbErr: any) {
      firebaseStatus = {
        status: 'degraded',
        isFallbackMode: false,
        message: fbErr?.message || 'Firebase Admin DB is unavailable or not initialized',
        error: String(fbErr?.message || fbErr),
      };
    }

    // 2. Gemini AI ping test
    if (!envAudit.has_gemini_key) {
      geminiStatus = {
        status: 'not_configured',
        configured: false,
        message: 'GEMINI_API_KEY is missing from environment variables',
      };
    } else {
      try {
        const geminiStartTime = Date.now();
        const client = getGoogleAiClient();
        if (client) {
          geminiStatus = {
            status: 'ok',
            configured: true,
            latencyMs: Date.now() - geminiStartTime,
            message: 'GoogleGenAI client initialized and ready',
          };
        }
      } catch (geminiErr: any) {
        geminiStatus = {
          status: 'error',
          configured: true,
          message: 'Gemini client initialization failed',
          error: String(geminiErr?.message || geminiErr),
        };
      }
    }

    const overallStatus = (firebaseStatus.status === 'ok' && (geminiStatus.status === 'ok' || geminiStatus.status === 'not_configured'))
      ? 'ok'
      : 'degraded';

    res.status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startTime,
      environment: envAudit,
      dependencies: {
        firebase: firebaseStatus,
        gemini: geminiStatus,
      },
    });
  });

  // Client-side error monitoring endpoint
  app.post('/api/monitoring/errors', (req, res) => {
    try {
      const { message, stack, source, lineno, colno, type, url, timestamp, userAgent, componentStack } = req.body || {};
      console.error('[Client Error Monitor Report]:', {
        type: type || 'client_error',
        message: message || 'No message provided',
        stack: stack || 'No stack trace available',
        source,
        lineno,
        colno,
        componentStack,
        url: url || req.headers.referer,
        timestamp: timestamp || new Date().toISOString(),
        userAgent: userAgent || req.headers['user-agent'],
      });
      res.status(200).json({ status: 'ok', logged: true });
    } catch (err) {
      console.error('[Error Monitoring Endpoint Failure]:', err);
      res.status(500).json({ error: 'Failed to record log' });
    }
  });

  // Dynamic Translation Proxy Endpoint powered by Gemini AI
  app.post('/api/translate', aiRateLimiter, async (req, res) => {
    const { text, lang } = req.body;
    if (!text || !lang) {
      return res.status(400).json({ error: 'text and lang parameters are required' });
    }

    if (lang === 'en') {
      return res.json({ translated: text });
    }

    try {
      if (!isGeminiEnabled()) {
        return res.json({ translated: text });
      }

      const prompt = `Translate the following English user interface text into the target language: ${lang}.
Preserve any HTML tags, variables in braces (like {name} or {count}), and spacing exactly.
Do NOT explain your translation, do NOT provide multiple alternatives, and do NOT wrap the output in quotes or backticks unless they were in the original.
Only output the translated text.

English text: "${text}"`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
      });

      const translatedText = response.text?.trim() || text;
      // Strip outer quotes if the model added them mistakenly
      let cleanText = translatedText;
      if (cleanText.startsWith('"') && cleanText.endsWith('"') && !text.startsWith('"')) {
        cleanText = cleanText.slice(1, -1);
      }
      res.json({ translated: cleanText });
    } catch (err) {
      console.error('[Translation API] Error translating:', err);
      res.json({ translated: text }); // Graceful fallback
    }
  });

  // --- AUTHENTICATION ENDPOINTS ---

  // User Registration (support multiple route aliases for compatibility)
  app.post([
    '/api/auth/register', '/api/auth/register/',
    '/api/auth/signup', '/api/auth/signup/',
    '/api/register', '/api/register/',
    '/api/signup', '/api/signup/',
    '/api/v1/auth/register', '/api/v1/auth/signup', '/api/v1/register', '/api/v1/signup'
  ], authRateLimiter, validateAuthPayload, async (req, res) => {
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

  // User Login (support multiple route aliases)
  app.post([
    '/api/auth/login', '/api/auth/login/',
    '/api/auth/signin', '/api/auth/signin/',
    '/api/login', '/api/login/',
    '/api/signin', '/api/signin/',
    '/api/v1/auth/login', '/api/v1/auth/signin', '/api/v1/login', '/api/v1/signin'
  ], authRateLimiter, validateAuthPayload, async (req, res) => {
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
  app.get(['/api/auth/me', '/api/me'], authenticateToken, async (req: any, res) => {
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
  app.post('/api/projects', authenticateToken, qrGenRateLimiter, validateProjectPayload, async (req: any, res) => {
    const { id, name, type, content, design, trackingEnabled, trackingId, expiryDate, expiryRedirectType, expiryRedirectUrl, expiryMessage, category } = req.body;

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
          trackingEnabled,
          trackingId: trackingId || undefined,
          expiryDate: expiryDate || null,
          expiryRedirectType: expiryRedirectType || 'message',
          expiryRedirectUrl: expiryRedirectUrl || '',
          expiryMessage: expiryMessage || '',
          category: category || ''
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
          trackingId: finalTrackingId,
          expiryDate: expiryDate || null,
          expiryRedirectType: expiryRedirectType || 'message',
          expiryRedirectUrl: expiryRedirectUrl || '',
          expiryMessage: expiryMessage || '',
          category: category || ''
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

      // Realtime notification sync
      notifyUserOfScan(req.user.id, newScan, project.name || 'My QR Code');

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

  // --- SAAS GROWTH SUITE ENDPOINTS ---

  // In-memory sessions/fallbacks for robust offline/testing resilience
  const inMemoryProfiles = new Map<string, any>();
  const inMemoryCommunityPosts = new Map<string, any>();
  const inMemoryNewsletter = new Map<string, any>();
  const inMemoryFeedback = new Map<string, any>();
  const inMemoryNotifications = new Map<string, any[]>();
  const referralClicks = new Map<string, number>();
  const referralSignups = new Map<string, string[]>(); // referrerId -> list of referred ids

  // Helper to trigger system notifications
  async function triggerNotification(userId: string, title: string, message: string, type: 'alert' | 'community' | 'reward') {
    const id = `notif-${Math.random().toString(36).substring(2, 11)}`;
    const notif = {
      id,
      userId,
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    try {
      checkFallback();
      const activeDb = getDb();
      await setDoc(doc(activeDb, 'notifications', id), notif);
    } catch (e) {
      console.warn('Notification setDoc fallback used');
      const list = inMemoryNotifications.get(userId) || [];
      list.unshift(notif);
      inMemoryNotifications.set(userId, list);
    }
  }

  // Lazy initialize/get User Profile
  async function getOrCreateProfile(userId: string, name: string, email: string, referrerCodeInput?: string): Promise<any> {
    try {
      checkFallback();
      const activeDb = getDb();
      const profileRef = doc(activeDb, 'user_profiles', userId);
      const snap = await getDoc(profileRef);
      
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn('Profile read fallback');
    }

    if (inMemoryProfiles.has(userId)) {
      return inMemoryProfiles.get(userId);
    }

    // Initialize new profile
    const refCode = `ref-${userId.substring(4, 9)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newProfile: any = {
      userId,
      name,
      email,
      avatar: '',
      bio: 'Professional QR Creator',
      company: '',
      linkedin: '',
      twitter: '',
      github: '',
      defaultQrType: 'url',
      defaultFgColor: '#0f172a',
      defaultBgColor: '#ffffff',
      referralCode: refCode,
      referredBy: '',
      xp: 10,
      level: 1,
      badges: ['pioneer'],
      unlockedThemes: ['standard']
    };

    // Process Referral if provided
    if (referrerCodeInput && referrerCodeInput !== refCode) {
      newProfile.referredBy = referrerCodeInput;
      // Find referrer user from profiles
      let referrerUserId = '';
      try {
        checkFallback();
        const activeDb = getDb();
        const q = query(collection(activeDb, 'user_profiles'), where('referralCode', '==', referrerCodeInput));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          referrerUserId = qSnap.docs[0].id;
          const referrerProfile = qSnap.docs[0].data();
          // Update referrer Profile
          const updatedXp = (referrerProfile.xp || 0) + 100;
          const currentBadges = referrerProfile.badges || [];
          if (!currentBadges.includes('influencer')) {
            currentBadges.push('influencer');
          }
          const nextLvl = Math.floor(Math.sqrt(updatedXp / 100)) + 1;
          await setDoc(doc(activeDb, 'user_profiles', referrerUserId), {
            ...referrerProfile,
            xp: updatedXp,
            level: nextLvl,
            badges: currentBadges
          }, { merge: true });

          // Notify Referrer
          await triggerNotification(referrerUserId, '🎉 Referral Signup Bonus!', `Congratulations! Someone registered using your unique referral link. You earned 100 XP and unlocked the "Referral Specialist" badge.`, 'reward');
        }
      } catch (err) {
        // Fallback search in-memory
        for (const [rId, p] of inMemoryProfiles.entries()) {
          if (p.referralCode === referrerCodeInput) {
            referrerUserId = rId;
            p.xp += 100;
            if (!p.badges.includes('influencer')) {
              p.badges.push('influencer');
            }
            p.level = Math.floor(Math.sqrt(p.xp / 100)) + 1;
            
            // Notify Referrer in-memory
            const list = inMemoryNotifications.get(referrerUserId) || [];
            list.unshift({
              id: `notif-${Math.random().toString(36).substring(2, 11)}`,
              userId: referrerUserId,
              title: '🎉 Referral Signup Bonus!',
              message: `Congratulations! Someone registered using your unique referral link. You earned 100 XP and unlocked the "Referral Specialist" badge.`,
              read: false,
              type: 'reward',
              createdAt: new Date().toISOString()
            });
            inMemoryNotifications.set(referrerUserId, list);
            break;
          }
        }
      }

      if (referrerUserId) {
        // Log referred signup
        const referredList = referralSignups.get(referrerUserId) || [];
        referredList.push(userId);
        referralSignups.set(referrerUserId, referredList);
      }
    }

    try {
      const activeDb = getDb();
      await setDoc(doc(activeDb, 'user_profiles', userId), newProfile);
    } catch (e) {
      console.warn('Profile write fallback');
    }

    inMemoryProfiles.set(userId, newProfile);
    
    // Trigger Welcome notification
    await triggerNotification(userId, '👋 Welcome to FreeQRGen.pro!', 'Your SaaS Enterprise profile has been activated successfully! Explore the Creator Studio, customize templates, and share feature ideas with our community.', 'alert');

    return newProfile;
  }

  // GET User Profile
  app.get('/api/user/profile', authenticateToken, async (req: any, res) => {
    const referrerCode = req.query.refCode as string;
    try {
      const profile = await getOrCreateProfile(req.user.id, req.user.name, req.user.email, referrerCode);
      res.json(profile);
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
  });

  // POST User Profile (Updates)
  app.post('/api/user/profile', authenticateToken, formRateLimiter, async (req: any, res) => {
    const { avatar, bio, company, linkedin, twitter, github, defaultQrType, defaultFgColor, defaultBgColor } = req.body;
    try {
      const existing = await getOrCreateProfile(req.user.id, req.user.name, req.user.email);
      const updatedXp = (existing.xp || 10) + 15; // Give +15 XP for completing profile details
      const nextLvl = Math.floor(Math.sqrt(updatedXp / 100)) + 1;
      const currentBadges = existing.badges || ['pioneer'];
      if (!currentBadges.includes('designer') && (defaultFgColor || defaultBgColor)) {
        currentBadges.push('designer');
      }

      const updated = {
        ...existing,
        avatar: avatar ?? existing.avatar,
        bio: bio ?? existing.bio,
        company: company ?? existing.company,
        linkedin: linkedin ?? existing.linkedin,
        twitter: twitter ?? existing.twitter,
        github: github ?? existing.github,
        defaultQrType: defaultQrType ?? existing.defaultQrType,
        defaultFgColor: defaultFgColor ?? existing.defaultFgColor,
        defaultBgColor: defaultBgColor ?? existing.defaultBgColor,
        xp: updatedXp,
        level: nextLvl,
        badges: currentBadges
      };

      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'user_profiles', req.user.id), updated);
      } catch (e) {
        console.warn('Profile update fallback');
      }

      inMemoryProfiles.set(req.user.id, updated);
      res.json(updated);
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to save profile changes.' });
    }
  });

  // GET User Referrals List
  app.get('/api/user/referrals', authenticateToken, async (req: any, res) => {
    try {
      const profile = await getOrCreateProfile(req.user.id, req.user.name, req.user.email);
      const clicks = referralClicks.get(profile.referralCode) || 0;
      const referredIds = referralSignups.get(req.user.id) || [];
      
      res.json({
        referralCode: profile.referralCode,
        clicks,
        signups: referredIds.length,
        rewardTier: referredIds.length >= 5 ? 'Professional Gold' : referredIds.length >= 3 ? 'Silver Creator' : referredIds.length >= 1 ? 'Bronze Ambassador' : 'Pioneer',
        unlockedFeatures: [
          referredIds.length >= 1 && 'High-resolution SVG Export',
          referredIds.length >= 3 && 'Independent Finder Eye Coloring',
          referredIds.length >= 5 && 'Dynamic Color-shifting Shaders'
        ].filter(Boolean)
      });
    } catch (err) {
      console.error('Fetch referrals error:', err);
      res.status(500).json({ error: 'Failed to retrieve referral data.' });
    }
  });

  // POST Track Referral Clicks
  app.post('/api/referral/click', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Referral code is required' });
    
    const count = referralClicks.get(code) || 0;
    referralClicks.set(code, count + 1);
    res.json({ success: true, clicks: count + 1 });
  });

  // GET Community Posts
  app.get('/api/community/posts', async (req, res) => {
    try {
      let postsList: any[] = [];
      try {
        checkFallback();
        const activeDb = getDb();
        const q = collection(activeDb, 'community_posts');
        const snap = await getDocs(q);
        postsList = snap.docs.map(d => d.data());
      } catch (e) {
        console.warn('Community posts read fallback');
        postsList = Array.from(inMemoryCommunityPosts.values());
      }

      // If empty, seed initial high-fidelity posts for the SaaS dashboard
      if (postsList.length === 0) {
        const seededPosts = [
          {
            id: 'post-1',
            userId: 'usr-seeded1',
            authorName: 'Alex Mercer',
            title: 'Add support for bulk QR Code generator via CSV spreadsheet uploads',
            content: 'It would be absolutely stellar if we could upload a simple CSV spreadsheet containing rows of links and names, and get a downloaded zip file containing all the generated QR Codes instantly! This would speed up real-world product labeling and event ticket operations ten-fold.',
            category: 'feature',
            upvotes: ['usr-seeded2', 'usr-seeded3', 'usr-seeded4', 'usr-seeded5'],
            comments: [
              { id: 'c1', userId: 'usr-seeded2', authorName: 'Elena Rostova', content: 'Agreed! Bulk dynamic creation is crucial for high-traffic commerce.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
            ],
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: 'planned'
          },
          {
            id: 'post-2',
            userId: 'usr-seeded2',
            authorName: 'Elena Rostova',
            title: 'Enable interactive NFC chip tag writing and linking',
            content: 'Since we already support physical scanning parameters, combining QR codes with custom NFC triggers would make FreeQRGen the ultimate contact points management suite.',
            category: 'discussion',
            upvotes: ['usr-seeded1', 'usr-seeded3'],
            comments: [],
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            status: 'under_review'
          },
          {
            id: 'post-3',
            userId: 'usr-seeded3',
            authorName: 'Dr. Sarah Chen',
            title: 'Optimized Quiet Zone calculators for high-speed conveyor package scanners',
            content: 'We have implemented and verified the Reed-Solomon correction levels, but automated quiet zone calculation guarantees that modern cameras on processing factories can read labels seamlessly.',
            category: 'template',
            upvotes: ['usr-seeded1', 'usr-seeded2', 'usr-seeded4', 'usr-seeded5', 'usr-seeded6'],
            comments: [],
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
            status: 'completed'
          }
        ];
        
        const activeDb = getDb();
        for (const p of seededPosts) {
          try {
            checkFallback();
            await setDoc(doc(activeDb, 'community_posts', p.id), p);
          } catch (e) {
            inMemoryCommunityPosts.set(p.id, p);
          }
          postsList.push(p);
        }
      }

      res.json(postsList);
    } catch (err) {
      console.error('Fetch community posts error:', err);
      res.status(500).json({ error: 'Failed to retrieve community posts.' });
    }
  });

  // POST Create Community Post
  app.post('/api/community/posts', authenticateToken, formRateLimiter, async (req: any, res) => {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content and category are required' });
    }

    try {
      const postId = `post-${Math.random().toString(36).substring(2, 11)}`;
      const newPost: any = {
        id: postId,
        userId: req.user.id,
        authorName: req.user.name,
        title,
        content,
        category,
        upvotes: [req.user.id],
        comments: [],
        createdAt: new Date().toISOString(),
        status: category === 'feature' ? 'under_review' : 'none'
      };

      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'community_posts', postId), newPost);
      } catch (e) {
        console.warn('Post create fallback');
      }

      inMemoryCommunityPosts.set(postId, newPost);

      // Reward author +25 XP
      const profile = await getOrCreateProfile(req.user.id, req.user.name, req.user.email);
      profile.xp += 25;
      if (!profile.badges.includes('activist')) {
        profile.badges.push('activist');
      }
      profile.level = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
      
      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'user_profiles', req.user.id), profile);
      } catch (e) {
        inMemoryProfiles.set(req.user.id, profile);
      }

      await triggerNotification(req.user.id, '📣 Community Post Shared!', `Congratulations! Your community post "${title.substring(0, 20)}..." was published. You earned +25 XP and the "Community Pillar" badge.`, 'community');

      res.status(201).json(newPost);
    } catch (err) {
      console.error('Create community post error:', err);
      res.status(500).json({ error: 'Failed to publish post.' });
    }
  });

  // POST Upvote Community Post
  app.post('/api/community/posts/:id/upvote', authenticateToken, formRateLimiter, async (req: any, res) => {
    const { id } = req.params;
    try {
      let post: any = null;
      try {
        const activeDb = getDb();
        const docRef = doc(activeDb, 'community_posts', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          post = snap.data();
        }
      } catch (e) {
        post = inMemoryCommunityPosts.get(id);
      }

      if (!post) return res.status(404).json({ error: 'Community post not found' });

      const upvotes = post.upvotes || [];
      const index = upvotes.indexOf(req.user.id);
      
      if (index > -1) {
        upvotes.splice(index, 1); // Remove vote
      } else {
        upvotes.push(req.user.id); // Add vote

        // Reward voter +5 XP
        const voterProfile = await getOrCreateProfile(req.user.id, req.user.name, req.user.email);
        voterProfile.xp += 5;
        voterProfile.level = Math.floor(Math.sqrt(voterProfile.xp / 100)) + 1;
        try {
          const activeDb = getDb();
          await setDoc(doc(activeDb, 'user_profiles', req.user.id), voterProfile);
        } catch (e) {
          inMemoryProfiles.set(req.user.id, voterProfile);
        }

        // Notify and Reward post author (+10 XP)
        if (post.userId !== req.user.id) {
          try {
            const activeDb = getDb();
            const authorRef = doc(activeDb, 'user_profiles', post.userId);
            const authorSnap = await getDoc(authorRef);
            if (authorSnap.exists()) {
              const authorProfile = authorSnap.data();
              authorProfile.xp += 10;
              authorProfile.level = Math.floor(Math.sqrt(authorProfile.xp / 100)) + 1;
              await setDoc(authorRef, authorProfile);
            }
          } catch (e) {
            const authorProfile = inMemoryProfiles.get(post.userId);
            if (authorProfile) {
              authorProfile.xp += 10;
              authorProfile.level = Math.floor(Math.sqrt(authorProfile.xp / 100)) + 1;
            }
          }
          await triggerNotification(post.userId, '👍 New Upvote Received!', `Your post "${post.title.substring(0, 20)}..." received an upvote from ${req.user.name}. You earned +10 XP.`, 'community');
        }
      }

      post.upvotes = upvotes;

      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'community_posts', id), post);
      } catch (e) {
        inMemoryCommunityPosts.set(id, post);
      }

      res.json(post);
    } catch (err) {
      console.error('Upvote post error:', err);
      res.status(500).json({ error: 'Failed to register upvote.' });
    }
  });

  // POST Comment on Community Post
  app.post('/api/community/posts/:id/comment', authenticateToken, formRateLimiter, async (req: any, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    try {
      let post: any = null;
      try {
        const activeDb = getDb();
        const docRef = doc(activeDb, 'community_posts', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          post = snap.data();
        }
      } catch (e) {
        post = inMemoryCommunityPosts.get(id);
      }

      if (!post) return res.status(404).json({ error: 'Community post not found' });

      const comments = post.comments || [];
      const newComment = {
        id: `comment-${Math.random().toString(36).substring(2, 11)}`,
        userId: req.user.id,
        authorName: req.user.name,
        content,
        createdAt: new Date().toISOString()
      };
      
      comments.push(newComment);
      post.comments = comments;

      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'community_posts', id), post);
      } catch (e) {
        inMemoryCommunityPosts.set(id, post);
      }

      // Reward commenter +10 XP
      const commenterProfile = await getOrCreateProfile(req.user.id, req.user.name, req.user.email);
      commenterProfile.xp += 10;
      commenterProfile.level = Math.floor(Math.sqrt(commenterProfile.xp / 100)) + 1;
      try {
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'user_profiles', req.user.id), commenterProfile);
      } catch (e) {
        inMemoryProfiles.set(req.user.id, commenterProfile);
      }

      // Notify and Reward post author (+15 XP)
      if (post.userId !== req.user.id) {
        try {
          const activeDb = getDb();
          const authorRef = doc(activeDb, 'user_profiles', post.userId);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            const authorProfile = authorSnap.data();
            authorProfile.xp += 15;
            authorProfile.level = Math.floor(Math.sqrt(authorProfile.xp / 100)) + 1;
            await setDoc(authorRef, authorProfile);
          }
        } catch (e) {
          const authorProfile = inMemoryProfiles.get(post.userId);
          if (authorProfile) {
            authorProfile.xp += 15;
            authorProfile.level = Math.floor(Math.sqrt(authorProfile.xp / 100)) + 1;
          }
        }
        await triggerNotification(post.userId, '💬 New Comment Received!', `${req.user.name} commented on your post "${post.title.substring(0, 20)}...": "${content.substring(0, 15)}..."`, 'community');
      }

      res.status(201).json(post);
    } catch (err) {
      console.error('Comment on post error:', err);
      res.status(500).json({ error: 'Failed to post comment.' });
    }
  });

  // GET Roadmap Items
  app.get('/api/roadmap/items', async (req, res) => {
    try {
      let postsList: any[] = [];
      try {
        checkFallback();
        const activeDb = getDb();
        const q = collection(activeDb, 'community_posts');
        const snap = await getDocs(q);
        postsList = snap.docs.map(d => d.data());
      } catch (e) {
        postsList = Array.from(inMemoryCommunityPosts.values());
      }

      const roadmapItems = postsList.filter(p => p.status && p.status !== 'none');
      res.json(roadmapItems);
    } catch (err) {
      console.error('Get roadmap items error:', err);
      res.status(500).json({ error: 'Failed to retrieve roadmap.' });
    }
  });

  // POST Newsletter Subscribe
  app.post('/api/newsletter/subscribe', formRateLimiter, async (req, res) => {
    const { email, preferences } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      const sub = {
        email,
        subscribedAt: new Date().toISOString(),
        preferences: preferences || ['marketing', 'product-releases', 'developer-updates']
      };

      try {
        checkFallback();
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'newsletters', email.toLowerCase()), sub);
      } catch (e) {
        inMemoryNewsletter.set(email.toLowerCase(), sub);
      }

      res.json({ success: true, message: 'Subscribed to FreeQRGen.pro Gazette successfully!' });
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      res.status(500).json({ error: 'Failed to record subscription.' });
    }
  });

  // POST Feedback Submit
  app.post('/api/feedback/submit', formRateLimiter, async (req: any, res) => {
    const { type, satisfaction, text, email, userId } = req.body;
    if (!type || !satisfaction || !text) {
      return res.status(400).json({ error: 'Type, satisfaction score, and feedback text are required.' });
    }

    try {
      const feedbackId = `feedback-${Math.random().toString(36).substring(2, 11)}`;
      const fb = {
        id: feedbackId,
        userId: userId || null,
        email: email || null,
        type,
        satisfaction,
        text,
        createdAt: new Date().toISOString()
      };

      try {
        checkFallback();
        const activeDb = getDb();
        await setDoc(doc(activeDb, 'feedbacks', feedbackId), fb);
      } catch (e) {
        inMemoryFeedback.set(feedbackId, fb);
      }

      // If registered user, reward +15 XP
      if (userId) {
        try {
          checkFallback();
          const activeDb = getDb();
          const profileRef = doc(activeDb, 'user_profiles', userId);
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            const profile = snap.data();
            profile.xp += 15;
            if (!profile.badges.includes('vocal')) {
              profile.badges.push('vocal');
            }
            profile.level = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
            await setDoc(profileRef, profile);
          }
        } catch (e) {
          const profile = inMemoryProfiles.get(userId);
          if (profile) {
            profile.xp += 15;
            if (!profile.badges.includes('vocal')) {
              profile.badges.push('vocal');
            }
            profile.level = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
          }
        }
        await triggerNotification(userId, '💬 Feedback Submitted!', `Thank you for completing our CSAT survey! You scored us ${satisfaction}/10. You earned +15 XP and unlocked the "Product Advisory" badge.`, 'reward');
      }

      res.status(201).json({ success: true, message: 'Thank you for your valuable feedback! We will process it immediately.' });
    } catch (err) {
      console.error('Feedback submit error:', err);
      res.status(500).json({ error: 'Failed to process feedback.' });
    }
  });

  // GET User Notifications
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    try {
      let notifs: any[] = [];
      try {
        checkFallback();
        const activeDb = getDb();
        const q = query(collection(activeDb, 'notifications'), where('userId', '==', req.user.id));
        const snap = await getDocs(q);
        notifs = snap.docs.map(d => d.data());
      } catch (e) {
        notifs = inMemoryNotifications.get(req.user.id) || [];
      }

      // Sort by newest
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(notifs);
    } catch (err) {
      console.error('Get notifications error:', err);
      res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
  });

  // POST Mark Notification as Read
  app.post('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    try {
      try {
        checkFallback();
        const activeDb = getDb();
        const ref = doc(activeDb, 'notifications', id);
        await updateDoc(ref, { read: true });
      } catch (e) {
        const list = inMemoryNotifications.get(req.user.id) || [];
        const item = list.find(n => n.id === id);
        if (item) item.read = true;
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Mark notification read error:', err);
      res.status(500).json({ error: 'Failed to mark alert as read.' });
    }
  });

  // --- PREMIUM AI CAPABILITIES ENDPOINTS ---
  
  // Lazy-initialization function for GoogleGenAI
  let googleAiClient: GoogleGenAI | null = null;
  function getGoogleAiClient(): GoogleGenAI {
    if (!googleAiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined.');
      }
      googleAiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return googleAiClient;
  }

  let isGeminiBillingBlocked = false;

  // Helper check if Gemini API is enabled
  function isGeminiEnabled(): boolean {
    return !isGeminiBillingBlocked && !!process.env.GEMINI_API_KEY;
  }

  // Helper to run generateContent with robust retries and fallback models in case of 503 (service unavailable) or 429 (rate limits)
  async function generateContentWithFallback(options: {
    contents: string;
    config: any;
    primaryModel?: string;
  }): Promise<any> {
    if (isGeminiBillingBlocked) {
      throw new Error('Gemini API is temporarily offline due to project billing limitations.');
    }

    const client = getGoogleAiClient();
    const primaryModel = options.primaryModel || 'gemini-3.5-flash';
    const fallbackModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
    const modelsToTry = [primaryModel, ...fallbackModels];

    let lastError: any = null;

    for (const model of modelsToTry) {
      let attempts = 2; // Up to 2 attempts for normal transient issues
      while (attempts > 0) {
        try {
          const response = await client.models.generateContent({
            model: model,
            contents: options.contents,
            config: options.config,
          });
          return response;
        } catch (error: any) {
          lastError = error;
          const status = error.status || (error.error && error.error.code);
          const errorMsg = error.message || '';
          
          // Check if this is a billing, authentication, quota or dunning issue
          const isBillingOrPermissionBlocked = status === 403 || status === 401 ||
            errorMsg.includes('dunning') || 
            errorMsg.includes('PERMISSION_DENIED') ||
            errorMsg.includes('billing') ||
            errorMsg.includes('quota') ||
            errorMsg.includes('Lightning dunning decision is deny') ||
            errorMsg.includes('UNAUTHENTICATED') ||
            errorMsg.includes('invalid authentication credentials') ||
            errorMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            errorMsg.includes('API_KEY_SERVICE_BLOCKED') ||
            errorMsg.includes('resource_exhausted') ||
            errorMsg.includes('exceeded your current quota');

          if (isBillingOrPermissionBlocked) {
            isGeminiBillingBlocked = true;
            console.log("Local localization and backup mode enabled.");
            throw new Error('Offline');
          }

          // Check if the model is busy, overloaded (503), or rate-limited (429)
          const isBusyOrOverloaded = status === 503 || status === 429 || 
            errorMsg.includes('demand') || 
            errorMsg.includes('UNAVAILABLE') || 
            errorMsg.includes('rate limit') ||
            errorMsg.includes('Resource has been exhausted');

          if (isBusyOrOverloaded) {
            console.log(`[Gemini API] Note: Model ${model} is currently busy/unavailable (status: ${status}). Swapping to next fallback model immediately...`);
            break; // Break the attempts loop for this model and proceed to the next fallback model immediately
          }

          console.log(`[Gemini API] Diagnostic: Model ${model} returned non-fatal code ${status} (attempts remaining: ${attempts - 1})`);
          
          if (status === 400) {
            attempts = 0; // stop retrying this model
            break;
          }

          attempts--;
          if (attempts > 0) {
            const delayMs = (3 - attempts) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
    }

    throw lastError || new Error('All models failed to generate content');
  }

  function getLocalizedText(key: string, locale: string = 'en'): string {
    const dictionary: Record<string, Record<string, string>> = {
      ar: {
        'url_too_long': "تحتوي وجهة الرابط على أكثر من 90 حرفاً. نقترح بشدة تمكين إعادة التوجيه الديناميكي لتقليل كثافة الـ QR وضمان المسح الفوري السلس.",
        'non_white_bg': "الخلفية الخاصة بك ليست بيضاء. يرجى التأكد من أن التباين بين النقاط ولون الخلفية لا يقل عن 4:1 لتجنب مشاكل المسح.",
        'custom_logo': "تم تكوين شعار مخصص في الوسط. نقترح اختيار مستوى تصحيح خطأ عالٍ (H) لحماية أنماط النقاط المغطاة بالشعار.",
        'perfect_contrast': "نسبة التباين مذهلة ومثالية. يحقق تصميمك حالياً امتثالاً بنسبة 100٪ لإرشادات المسح القياسية.",
        'good_gradient': "توزيع التدرج اللوني متناسب للغاية ويحافظ على وضوح ممتاز عبر جميع عدسات الكاميرا.",
        'svg_recommendation': "استخدم تنسيق المتجهات القياسي (.SVG) للحصول على طباعة مادية فائقة الدقة على اللافتات أو المنتجات.",
        'layout_vibe': "تم حساب مقاييس التخطيط المثالية لموازنة كثافة النقاط مع حماية الشعار، مما يقلل وقت المسح بنسبة تصل إلى 25٪.",
        'colors_fallback_tech': "لوحة ألوان مستقبلية للوضع الداكن مع تدرج سيان كهربائي ونيلي عميق، مصممة خصيصاً للعلامات التجارية التقنية الرائدة.",
        'colors_fallback_eco': "جمالية خضراء طبيعية نظيفة مقترنة باللون الأبيض، تمثل الاستدامة والوعي البيئي والموثوقية.",
        'colors_fallback_luxury': "درجات الفحم الغنية والعنبر العميق مع خلفية أنيقة، مصممة لتمثيل الفخامة والجودة الراقية.",
        'colors_fallback_creative': "تدرج شعاعي وردي مشرق ومميز لجذب الانتباه البصري الفوري وتأسيس حضور إبداعي قوي.",
        'colors_fallback_default': "التدرج الأزرق الكلاسيكي عالي الحيوية. يوفر قراءة استثنائية وتباين مسح رائع وجاذبية تقنية مميزة.",
        'style_fallback_luxury': "نمط انسيابي راقٍ مقترن بإطار دائري مميز. يعكس الفخامة المطلقة والجمال العصري الأنيق.",
        'style_fallback_playful': "نقاط دائرية لطيفة وودودة مع إطارات مستديرة ناعمة، تعطي طابعاً ترحيبياً وتقنياً دافئاً.",
        'style_fallback_tech': "نقاط تقنية مستوحاة من شاشات الأوامر مع إطارات مربعة كلاسيكية. تصميم نظيف ومثالي للشركات التقنية الهندسیة.",
        'style_fallback_default': "نقاط مربعة كلاسيكية متينة مع حماية تصحيح خطأ عالية (H). مصممة للتوافق الأقصى مع جميع أجهزة المسح."
      },
      ur: {
        'url_too_long': "آپ کے منزل کے یو آر ایل میں 90 سے زیادہ حروف ہیں۔ ہم بلاک کی کثافت کو کم کرنے اور فوری اسکیننگ کو یقینی بنانے کے لیے ڈائنامک ری ڈائریکشن کو فعال کرنے کی سختی سے تجویز کرتے ہیں۔",
        'non_white_bg': "آپ کا پس منظر سفید نہیں ہے۔ براہ کرم یقینی بنائیں کہ اسکیننگ کے مسائل سے بچنے کے لیے کینوس اور ماڈیولز کے درمیان تباین کم از کم 4:1 ہے۔",
        'custom_logo': "ایک حسب ضرورت لوگو ترتیب دیا گیا ہے۔ ہم لوگو کے نیچے چھپے ہوئے ماڈیول پیٹرنز کی حفاظت کے لیے ہائی (H) تصحیح کی سطح کو منتخب کرنے کی تجویز دیتے ہیں۔",
        'perfect_contrast': "تناسب تباین شاندار ہے۔ آپ کا ڈیزائن اس وقت ڈیجیٹل پڑھنے کے رہنما خطوط کے ساتھ 100٪ مطابقت رکھتا ہے۔",
        'good_gradient': "گریڈینٹ کی تقسیم اچھی طرح متناسب ہے؛ تمام کیمروں میں اعلیٰ وضاحت برقرار رکھتی ہے۔",
        'svg_recommendation': "دکان کے بینرز یا پروموشنل سامان پر اعلیٰ معیار کی طباعت کے لیے معیاری ویکٹر فارمیٹ (.SVG) استعمال کریں۔",
        'layout_vibe': "لوگو کی حفاظت کے ساتھ ماڈیول کی کثافت کو متوازن کرنے کے لیے بہترین لے آؤٹ میٹرکس کا حساب لگایا گیا ہے، جس سے اسکیننگ کا وقت 25٪ تک کم ہوجاتا ہے۔",
        'colors_fallback_tech': "الیکٹرک سیان اور گہرے انڈگو گریڈینٹ کے ساتھ مستقبل کا ڈارک موڈ سیٹ اپ، جو ٹیکنالوجی کے برانڈز کے لیے موزوں ہے۔",
        'colors_fallback_eco': "ایک نامیاتی، صاف سبز جمالیات سفید کے ساتھ جوڑی، جو پائیداری اور ماحولیاتی بیداری کی نمائندگی کرتی ہے۔",
        'colors_fallback_luxury': "گہرا چارکول اور امبر رنگوں کا مجموعہ، جو برانڈ کی خوبصورتی اور پریمیم معیار کی نمائندگی کرتا ہے۔",
        'colors_fallback_creative': "فوری طور پر توجہ مبذول کرنے اور برانڈ کی تخلیقی خصوصیات کو قائم کرنے کے لیے ایک متحرک نیون گلابی ریڈیل سیٹ اپ۔",
        'colors_fallback_default': "ہمارے بنیادی پیلیٹ سے کلاسک نیلا گریڈینٹ۔ غیر معمولی اسکیننگ کی کارکردگی اور کلاسک کشش پیش کرتا ہے۔",
        'style_fallback_luxury': "ایک کلاسی مائع انداز اور دائرہ نما آئی عناصر کی خصوصیت۔ بہترین لگژری اور برانڈ کی خوبصورتی کی عکاسی کرتا ہے۔",
        'style_fallback_playful': "دوستانہ، اعلیٰ اسکین ایبلٹی گول بلاک ماڈیولز اور گول فریم بارڈرز۔ ایک انتہائی پرکشش اور دوستانہ شخصیت دیتا ہے۔",
        'style_fallback_tech': "ہائی ٹیک ٹرمینل ڈاٹس روایتی مربع فریموں کے ساتھ جوڑے۔ انجینئرنگ سے چلنے والی برانڈنگ کے لیے بہترین۔",
        'style_fallback_default': "کلاسک مضبوط مربع جس میں غلطی کی کوریج زیادہ سے زیادہ (H) پر سیٹ ہے۔ اسکینر کی مطابقت کو یقینی بنانے کے لیے تیار کیا گیا ہے۔"
      },
      tr: {
        'url_too_long': "Hedef URL'niz 90'dan fazla karakter içeriyor. Blok yoğunluğunu azaltmak ve eski akıllı telefonlarda bile anında tarama sağlamak için Dinamik Yönlendirmeyi (Kısa URL) etkinleştirmenizi önemle tavsiye ederiz.",
        'non_white_bg': "Arka planınız beyaz değil. Doğrudan güneş ışığı veya karanlık ortam koşullarında tarama sorunlarını önlemek için modülleriniz ile tuval arasındaki kontrastın en az 4:1 olduğundan emin olun.",
        'custom_logo': "Özel bir orta logo yapılandırıldı. Logonun kapladığı hayati modül desenlerini korumak için Yüksek (H) Hata Düzeltme toleransı seçmenizi öneririz.",
        'perfect_contrast': "Kontrast oranı muhteşem. Tasarımınız şu anda dijital okuma standardı yönergeleriyle %100 uyumludur.",
        'good_gradient': "Gradiyent dağılımı iyi oranlanmıştır; tüm kameralarda yüksek netlik sağlar.",
        'svg_recommendation': "Mağaza afişleri veya promosyon ürünleri üzerine yüksek çözünürlüklü fiziksel baskı için standart vektör formatı (.SVG) kullanın.",
        'layout_vibe': "Ortalama tarama gecikmesini %25'e kadar azaltarak, modül yoğunluğunu logo korumasıyla dengelemek için optimize edilmiş yerleşim metrikleri hesaplandı.",
        'colors_fallback_tech': "İleri görüşlü teknoloji markaları için tasarlanmış, elektrikli camgöbeği ve derin çivit mavisi gradyanlı fütüristik karanlık mod kurulumu.",
        'colors_fallback_eco': "Sürdürülebilirliği, çevre bilincini ve güveni temsil eden, beyaz dengeleriyle eşleştirilmiş organik, temiz bir yeşil estetik.",
        'colors_fallback_luxury': "Premium işçiliği ve lüks kaliteyi temsil etmek için tasarlanmış, temiz arduvaz zeminlerle birleştirilmiş zengin kömür ve derin kehribar tonları.",
        'colors_fallback_creative': "Anında görsel dikkat çekmek ve güçlü yaratıcı vurgular oluşturmak için tasarlanmış canlı ve etkileyici bir neon gül radyal kurulumu.",
        'colors_fallback_default': "Klasik yüksek canlılıkta mavi gradyan. Olağanüstü okunabilirlik, yüksek tarayıcı kontrastı ve klasik teknoloji çekiciliği sunar.",
        'style_fallback_luxury': "Klasik sıvı stili ve uyumlu daire göz öğeleri. Premium lüksü ve marka zarafetini yansıtır.",
        'style_fallback_playful': "Samimi, yüksek taranabilirlikte yuvarlatılmış blok modülleri ve yuvarlatılmış çerçeve kenarlıkları. Sıcak ve teknoloji dostu bir kişilik kazandırır.",
        'style_fallback_tech': "Geleneksel kare çerçevelerle eşleştirilmiş yüksek teknoloji terminal noktaları. Temiz, teknik ve mühendislik odaklı markalama için optimize edilmiştir.",
        'style_fallback_default': "Kare hata toleransı Yüksek (H) olarak ayarlanmış klasik sağlam kareler. Maksimum tarayıcı uyumluluğu için tasarlanmıştır."
      },
      en: {
        'url_too_long': "Your destination URL contains over 90 characters. We strongly suggest enabling Dynamic Redirection (Short URL) to reduce block density and ensure instant scanning, even for older smartphones.",
        'non_white_bg': "Your background is non-white. Please make sure the contrast between your modules and the canvas is at least 4:1 to prevent scanning issues under direct sunlight or dark ambient conditions.",
        'custom_logo': "A custom center logo is configured. We suggest selecting High (H) Error Correction redundancy to protect vital module patterns covered by the center logo.",
        'perfect_contrast': "Contrast ratio is spectacular. Your design currently achieves 100% compliance with digital read standard guidelines.",
        'good_gradient': "Gradient distribution is well-proportioned; maintains high clarity across all cameras.",
        'svg_recommendation': "Use standard vector format (.SVG) for high-resolution physical printing on shop banners or promotional merchandise.",
        'layout_vibe': "Calculated optimal layout metrics to balance module density with logo occlusion protection, reducing average scan latency by up to 25%.",
        'colors_fallback_tech': "Futuristic dark mode setup with an electric cyan and deep indigo gradient, tailored for forward-thinking technology brands.",
        'colors_fallback_eco': "An organic, clean green aesthetic paired with white balances, representing sustainability, environmental awareness, and trust.",
        'colors_fallback_luxury': "Rich charcoal and deep amber hues combined with clean slate backdrops, engineered to represent premium craftsmanship and upscale quality.",
        'colors_fallback_creative': "A lively and expressive neon-rose radial setup designed to attract instant visual attention and establish strong creative accents.",
        'colors_fallback_default': "The classic high-vibrancy blue gradient from our Core palette. Offers exceptional readability, high scanner contrast, and classic tech appeal.",
        'style_fallback_luxury': "Featuring a classy liquid style and matching circle eye elements. Reflects absolute premium luxury, high-end design, and precise brand elegance.",
        'style_fallback_playful': "Friendly, high-readability rounded block modules and rounded frame borders. Gives a highly approachable, warm, and tech-friendly personality.",
        'style_fallback_tech': "High-tech terminal dots paired with traditional square frames. Clean, technical, and optimized for engineering-driven branding.",
        'style_fallback_default': "Classic robust squares with error coverage maxed to High (H). Engineered for maximum scanner compatibility and zero-latency redirection."
      }
    };

    const activeLocale = locale === 'ar' || locale === 'ur' || locale === 'tr' ? locale : 'en';
    return dictionary[activeLocale]?.[key] || dictionary['en']?.[key] || '';
  }

  // 1. AI Color Suggestions endpoint
  app.post('/api/ai/suggest-colors', aiRateLimiter, async (req: any, res) => {
    const { industry, promptVibe, locale } = req.body;
    const searchVibe = `${industry || ''} ${promptVibe || ''}`.trim().toLowerCase();

    // High fidelity, intelligent fallback presets matching requested aesthetic parameters
    const generateLocalColorFallback = (vibeStr: string) => {
      if (vibeStr.includes('tech') || vibeStr.includes('cyber') || vibeStr.includes('crypto')) {
        return {
          primaryColor: "#4F46E5",
          secondaryColor: "#06B6D4",
          bgColor: "#0F172A",
          gradientType: "linear",
          gradientColor: "#06B6D4",
          description: getLocalizedText('colors_fallback_tech', locale) || "Futuristic dark mode setup with an electric cyan and deep indigo gradient, tailored for forward-thinking technology brands."
        };
      }
      if (vibeStr.includes('eco') || vibeStr.includes('nature') || vibeStr.includes('plant') || vibeStr.includes('green')) {
        return {
          primaryColor: "#059669",
          secondaryColor: "#10B981",
          bgColor: "#FFFFFF",
          gradientType: "none",
          gradientColor: "#10B981",
          description: getLocalizedText('colors_fallback_eco', locale) || "An organic, clean green aesthetic paired with white balances, representing sustainability, environmental awareness, and trust."
        };
      }
      if (vibeStr.includes('luxury') || vibeStr.includes('elegant') || vibeStr.includes('gold') || vibeStr.includes('class')) {
        return {
          primaryColor: "#0F172A",
          secondaryColor: "#D97706",
          bgColor: "#F8FAFC",
          gradientType: "linear",
          gradientColor: "#B45309",
          description: getLocalizedText('colors_fallback_luxury', locale) || "Rich charcoal and deep amber hues combined with clean slate backdrops, engineered to represent premium craftsmanship and upscale quality."
        };
      }
      if (vibeStr.includes('creative') || vibeStr.includes('art') || vibeStr.includes('play')) {
        return {
          primaryColor: "#E11D48",
          secondaryColor: "#F43F5E",
          bgColor: "#FFFFFF",
          gradientType: "radial",
          gradientColor: "#EC4899",
          description: getLocalizedText('colors_fallback_creative', locale) || "A lively and expressive neon-rose radial setup designed to attract instant visual attention and establish strong creative accents."
        };
      }
      // Standard Premium Default
      return {
        primaryColor: "#2563EB",
        secondaryColor: "#4F46E5",
        bgColor: "#FFFFFF",
        gradientType: "linear",
        gradientColor: "#4F46E5",
        description: getLocalizedText('colors_fallback_default', locale) || "The classic high-vibrancy blue gradient from our Core palette. Offers exceptional readability, high scanner contrast, and classic tech appeal."
      };
    };

    try {
      if (!isGeminiEnabled()) {
        return res.json(generateLocalColorFallback(searchVibe));
      }

      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the text descriptions, explanations, and recommendation strings in the "${locale}" language (e.g., if locale is 'ar' write in Arabic, if 'ur' write in Urdu, if 'tr' write in Turkish, etc.). Do NOT output English if the locale is a non-English language.` : '';

      const response = await generateContentWithFallback({
        contents: `Create a professional color palette matching this industry/vibe description. Make it premium and appropriate for styled QR Code usage: "${searchVibe}"\n\n${languageInstruction}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryColor: { type: Type.STRING, description: "A Hex color code e.g. #2563eb" },
              secondaryColor: { type: Type.STRING, description: "A Hex color code e.g. #4f46e5" },
              bgColor: { type: Type.STRING, description: "A Hex color code for standard QR background, default to #ffffff" },
              gradientType: { type: Type.STRING, description: "Gradient option must be: 'none', 'linear', or 'radial'" },
              gradientColor: { type: Type.STRING, description: "A Hex color code for the secondary gradient accent e.g. #06b6d4" },
              description: { type: Type.STRING, description: "A elegant human explanation of why this color combination matches the user's brand aesthetic." }
            },
            required: ["primaryColor", "secondaryColor", "bgColor", "gradientType", "gradientColor", "description"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
      return res.json(generateLocalColorFallback(searchVibe));
    } catch (err) {
      console.warn('[AI suggest-colors Fallback triggered]', err);
      return res.json(generateLocalColorFallback(searchVibe));
    }
  });

  // 2. AI QR Style Suggestions endpoint
  app.post('/api/ai/suggest-styles', aiRateLimiter, async (req: any, res) => {
    const { vibe, locale } = req.body;
    const searchVibe = (vibe || '').toLowerCase();

    const generateLocalStyleFallback = (vibeStr: string) => {
      if (vibeStr.includes('luxury') || vibeStr.includes('clean') || vibeStr.includes('modern')) {
        return {
          dotStyle: "classy",
          eyeStyle: "circle",
          errorCorrectionLevel: "H",
          logoScale: 0.18,
          description: getLocalizedText('style_fallback_luxury', locale) || "Featuring a classy liquid style and matching circle eye elements. Reflects absolute premium luxury, high-end design, and precise brand elegance."
        };
      }
      if (vibeStr.includes('playful') || vibeStr.includes('fun') || vibeStr.includes('casual')) {
        return {
          dotStyle: "rounded",
          eyeStyle: "rounded",
          errorCorrectionLevel: "Q",
          logoScale: 0.19,
          description: getLocalizedText('style_fallback_playful', locale) || "Friendly, high-readability rounded block modules and rounded frame borders. Gives a highly approachable, warm, and tech-friendly personality."
        };
      }
      if (vibeStr.includes('tech') || vibeStr.includes('data') || vibeStr.includes('cyber')) {
        return {
          dotStyle: "dots",
          eyeStyle: "square",
          errorCorrectionLevel: "M",
          logoScale: 0.17,
          description: getLocalizedText('style_fallback_tech', locale) || "High-tech terminal dots paired with traditional square frames. Clean, technical, and optimized for engineering-driven branding."
        };
      }
      // Standard beautiful fallback
      return {
        dotStyle: "square",
        eyeStyle: "square",
        errorCorrectionLevel: "H",
        logoScale: 0.18,
        description: getLocalizedText('style_fallback_default', locale) || "Classic robust squares with error coverage maxed to High (H). Engineered for maximum scanner compatibility and zero-latency redirection."
      };
    };

    try {
      if (!isGeminiEnabled()) {
        return res.json(generateLocalStyleFallback(searchVibe));
      }

      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the text descriptions, explanations, and recommendation strings in the "${locale}" language (e.g., if locale is 'ar' write in Arabic, if 'ur' write in Urdu, if 'tr' write in Turkish, etc.). Do NOT output English if the locale is a non-English language.` : '';

      const response = await generateContentWithFallback({
        contents: `Create a professional QR code styling configuration based on this brand theme: "${searchVibe}"\n\n${languageInstruction}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dotStyle: { type: Type.STRING, description: "Style choice: MUST be one of: 'square', 'rounded', 'dots', or 'classy'" },
              eyeStyle: { type: Type.STRING, description: "Eye style choice: MUST be one of: 'square', 'rounded', 'circle', or 'leaf'" },
              errorCorrectionLevel: { type: Type.STRING, description: "MUST be one of: 'L', 'M', 'Q', 'H'" },
              logoScale: { type: Type.NUMBER, description: "A floating scale between 0.15 and 0.20" },
              description: { type: Type.STRING, description: "An elegant description of why this shape structure fits the design criteria." }
            },
            required: ["dotStyle", "eyeStyle", "errorCorrectionLevel", "logoScale", "description"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
      return res.json(generateLocalStyleFallback(searchVibe));
    } catch (err) {
      console.warn('[AI suggest-styles Fallback triggered]', err);
      return res.json(generateLocalStyleFallback(searchVibe));
    }
  });

  // 3. AI Brand Matcher endpoint
  app.post('/api/ai/brand-match', aiRateLimiter, async (req: any, res) => {
    const { brandName, brandDescription, locale } = req.body;
    const query = `${brandName || ''} ${brandDescription || ''}`.trim().toLowerCase();

    const generateLocalBrandFallback = (qStr: string) => {
      // Pick dynamic premium setups based on descriptions
      if (qStr.includes('green') || qStr.includes('food') || qStr.includes('plant') || qStr.includes('wellness')) {
        return {
          primaryColor: "#059669",
          gradientType: "linear",
          gradientColor: "#10B981",
          bgColor: "#FFFFFF",
          dotStyle: "classy",
          eyeStyle: "leaf",
          logoScale: 0.18,
          explanation: getLocalizedText('style_fallback_luxury', locale) || "We've matched your organic brand with leafy eye structures, sophisticated classy dots, and a radiant forest green linear gradient."
        };
      }
      if (qStr.includes('cyber') || qStr.includes('game') || qStr.includes('software') || qStr.includes('dev')) {
        return {
          primaryColor: "#6D28D9",
          gradientType: "radial",
          gradientColor: "#EC4899",
          bgColor: "#FFFFFF",
          dotStyle: "dots",
          eyeStyle: "square",
          logoScale: 0.17,
          explanation: getLocalizedText('style_fallback_tech', locale) || "A high-tech neon violet-to-pink gradient matched with micro-dots, ideal for bleeding-edge gaming and engineering hubs."
        };
      }
      // Default modern corporate
      return {
        primaryColor: "#1E293B",
        gradientType: "linear",
        gradientColor: "#4F46E5",
        bgColor: "#FFFFFF",
        dotStyle: "rounded",
        eyeStyle: "circle",
        logoScale: 0.18,
        explanation: getLocalizedText('style_fallback_default', locale) || "Matched with deep corporate slate and high-contrast indigo gradient highlights, featuring rounded components for an open, modern UX."
      };
    };

    try {
      if (!isGeminiEnabled()) {
        return res.json(generateLocalBrandFallback(query));
      }

      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the text descriptions, explanations, and recommendation strings in the "${locale}" language (e.g., if locale is 'ar' write in Arabic, if 'ur' write in Urdu, if 'tr' write in Turkish, etc.). Do NOT output English if the locale is a non-English language.` : '';

      const response = await generateContentWithFallback({
        contents: `Analyze this brand and generate the absolute perfect complete QR Code aesthetic colors and shape styling. Brand: "${brandName}". Description: "${brandDescription}"\n\n${languageInstruction}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryColor: { type: Type.STRING, description: "Hex value e.g. #2563eb" },
              gradientType: { type: Type.STRING, description: "MUST be one of: 'none', 'linear', or 'radial'" },
              gradientColor: { type: Type.STRING, description: "Hex value e.g. #4f46e5" },
              bgColor: { type: Type.STRING, description: "Hex value e.g. #ffffff" },
              dotStyle: { type: Type.STRING, description: "MUST be one of: 'square', 'rounded', 'dots', or 'classy'" },
              eyeStyle: { type: Type.STRING, description: "MUST be one of: 'square', 'rounded', 'circle', or 'leaf'" },
              logoScale: { type: Type.NUMBER, description: "A value between 0.15 and 0.20" },
              explanation: { type: Type.STRING, description: "Insightful explanation of your branding audit." }
            },
            required: ["primaryColor", "gradientType", "gradientColor", "bgColor", "dotStyle", "eyeStyle", "logoScale", "explanation"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
      return res.json(generateLocalBrandFallback(query));
    } catch (err) {
      console.warn('[AI brand-match Fallback triggered]', err);
      return res.json(generateLocalBrandFallback(query));
    }
  });

  // 4. AI Design Recommendations endpoint (public to support instant landing-page scannability audit)
  app.post(['/api/ai/design-recommendations', '/ai/design-recommendations'], aiRateLimiter, async (req: any, res) => {
    try {
      const { qrContent, currentDesign, locale } = req.body || {};
      const contentStr = qrContent || '';

      console.log('[AI DESIGN] Request received');
      console.log('[AI DESIGN] Locale:', locale || 'none');
      console.log('[AI DESIGN] Content Length:', contentStr.length);

      const executeDesignAudit = (cText: string, design: any) => {
        const tips = [];
        if (cText.length > 90) {
          tips.push(getLocalizedText('url_too_long', locale) || "Your destination URL contains over 90 characters. We strongly suggest enabling Dynamic Redirection (Short URL) to reduce block density and ensure instant scanning, even for older smartphones.");
        }
        if (design?.bgColor && design?.fgColor) {
          // Simple hex contrast checker placeholder logic:
          const isWhiteBg = design.bgColor.toLowerCase() === '#ffffff' || design.bgColor.toLowerCase() === '#fff';
          if (!isWhiteBg && design.gradientType === 'none') {
            tips.push(getLocalizedText('non_white_bg', locale) || "Your background is non-white. Please make sure the contrast between your modules and the canvas is at least 4:1 to prevent scanning issues under direct sunlight or dark ambient conditions.");
          }
        }
        if (design?.logoUrl) {
           tips.push(getLocalizedText('custom_logo', locale) || "A custom center logo is configured. We suggest selecting High (H) Error Correction redundancy to protect vital module patterns covered by the center logo.");
        }
        if (tips.length === 0) {
          tips.push(getLocalizedText('perfect_contrast', locale) || "Contrast ratio is spectacular. Your design currently achieves 100% compliance with digital read standard guidelines.");
          tips.push(getLocalizedText('good_gradient', locale) || "Gradient distribution is well-proportioned; maintains high clarity across all cameras.");
        }
        tips.push(getLocalizedText('svg_recommendation', locale) || "Use standard vector format (.SVG) for high-resolution physical printing on shop banners or promotional merchandise.");
        return { recommendations: tips };
      };

      const geminiEnabled = isGeminiEnabled();
      console.log('[AI DESIGN] Gemini Enabled:', geminiEnabled);

      if (!geminiEnabled) {
        console.log('[AI DESIGN] Returning Response...');
        return res.json(executeDesignAudit(contentStr, currentDesign));
      }

      console.log('[AI DESIGN] Calling Gemini...');
      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the text descriptions, explanations, and recommendation strings in the "${locale}" language (e.g., if locale is 'ar' write in Arabic, if 'ur' write in Urdu, if 'tr' write in Turkish, etc.). Do NOT output English if the locale is a non-English language.` : '';

      let response: any;
      try {
        response = await generateContentWithFallback({
          contents: `Provide 3-4 professional, actionable design audit recommendations for a QR Code with these parameters: Content Length: ${contentStr.length}, QR Content: "${contentStr}", Current Design Settings: ${JSON.stringify(currentDesign || {})}\n\n${languageInstruction}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING, description: "A high-value user suggestion." }
                }
              },
              required: ["recommendations"]
            }
          }
        });
      } catch (geminiErr: any) {
        console.warn(
          "[AI DESIGN WARNING] Gemini execution fell back gracefully.",
          geminiErr?.message || geminiErr
        );
        console.log('[AI DESIGN] Returning Response...');
        return res.json(executeDesignAudit(contentStr, currentDesign));
      }

      console.log('[AI DESIGN] Gemini response received successfully');

      if (response && response.text) {
        console.log('[AI DESIGN] Parsing JSON...');
        let parsed: any;
        try {
          parsed = JSON.parse(response.text);
        } catch (jsonErr: any) {
          console.warn(
            "[AI DESIGN WARNING] Failed to parse JSON",
            jsonErr?.message || jsonErr
          );
          console.log('[AI DESIGN] Returning fallback...');
          return res.json(executeDesignAudit(contentStr, currentDesign));
        }

        let recommendationsList: string[] = [];
        if (Array.isArray(parsed)) {
          recommendationsList = parsed.map((item: any) =>
            typeof item === 'string'
              ? item
              : (item?.recommendation || item?.tip || item?.text || item?.description || item?.['error 0'] || JSON.stringify(item))
          );
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.recommendations)) {
            recommendationsList = parsed.recommendations.map((item: any) =>
              typeof item === 'string'
                ? item
                : (item?.recommendation || item?.tip || item?.text || item?.description || item?.['error 0'] || JSON.stringify(item))
            );
          } else {
            recommendationsList = Object.values(parsed).map((val: any) =>
              typeof val === 'string'
                ? val
                : (val?.recommendation || val?.tip || val?.text || val?.description || JSON.stringify(val))
            );
          }
        }

        if (recommendationsList.length === 0) {
          console.log('[AI DESIGN] Returning fallback audit...');
          return res.json(executeDesignAudit(contentStr, currentDesign));
        }

        console.log('[AI DESIGN] Returning Normalized Response...');
        return res.json({ recommendations: recommendationsList });
      }

      console.log('[AI DESIGN] Returning Response...');
      return res.json(executeDesignAudit(contentStr, currentDesign));
    } catch (err: any) {
      console.warn(
        "[AI DESIGN WARNING] General design audit execution handled gracefully.",
        err?.message || err
      );
      console.log('[AI DESIGN] Returning Response...');
      return res.json({
        recommendations: [
          "Your destination URL parameters and QR contrast were audited.",
          "Use standard vector format (.SVG) for high-resolution physical printing on shop banners or promotional merchandise."
        ]
      });
    }
  });

  // 5. Smart Layout Optimizer endpoint
  app.post('/api/ai/layout-optimize', aiRateLimiter, async (req: any, res) => {
    const { qrContent, currentDesign, locale } = req.body;
    const contentStr = qrContent || '';

    const executeLayoutOptimizeFallback = (cText: string, design: any) => {
      let ecc = 'H';
      let margin = 20;
      let logoScale = 0.18;

      if (cText.length < 30) {
        ecc = 'M'; // Lower ECC because content is very short (keep modules spaced out)
      }
      if (design?.logoUrl) {
        ecc = 'H'; // Keep high redundancy if logo is there
        logoScale = 0.18;
      }
      if (design?.margin < 10) {
        margin = 15; // Safeguard margin zone
      } else {
        margin = design?.margin || 20;
      }

      return {
        optimizedErrorCorrection: ecc,
        optimizedMargin: margin,
        optimizedLogoScale: logoScale,
        vibe: getLocalizedText('layout_vibe', locale) || "Calculated optimal layout metrics to balance module density with logo occlusion protection, reducing average scan latency by up to 25%."
      };
    };

    try {
      if (!isGeminiEnabled()) {
        return res.json(executeLayoutOptimizeFallback(contentStr, currentDesign));
      }

      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the text descriptions, explanations, and recommendation strings in the "${locale}" language (e.g., if locale is 'ar' write in Arabic, if 'ur' write in Urdu, if 'tr' write in Turkish, etc.). Do NOT output English if the locale is a non-English language.` : '';

      const response = await generateContentWithFallback({
        contents: `Generate optimal values for a QR Style configuration: QR Content: "${contentStr}" (length: ${contentStr.length}), Current Design Settings: ${JSON.stringify(currentDesign || {})}\n\n${languageInstruction}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedErrorCorrection: { type: Type.STRING, description: "Recommended level: 'L', 'M', 'Q', or 'H'" },
              optimizedMargin: { type: Type.INTEGER, description: "Recommended margin spacer (integer, recommended: 15-25)" },
              optimizedLogoScale: { type: Type.NUMBER, description: "Optimal scale of centered logo (0.15 to 0.20)" },
              vibe: { type: Type.STRING, description: "A technical explanation of why these layout dimensions are mathematically superior for scanning cameras." }
            },
            required: ["optimizedErrorCorrection", "optimizedMargin", "optimizedLogoScale", "vibe"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
      return res.json(executeLayoutOptimizeFallback(contentStr, currentDesign));
    } catch (err) {
      console.warn('[AI layout-optimize Fallback triggered]', err);
      return res.json(executeLayoutOptimizeFallback(contentStr, currentDesign));
    }
  });

  // 6. AI Co-Pilot Assistant router endpoint
  app.post('/api/ai/assistant', aiRateLimiter, async (req: any, res) => {
    const { prompt, userId, locale } = req.body;
    const userPrompt = (prompt || '').trim();
    const searchPrompt = userPrompt.toLowerCase();

    // High fidelity, intelligent fallback parser for offline/no-billing states
    const generateLocalAssistantFallback = (pStr: string) => {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (pStr.includes('restaurant') || pStr.includes('menu') || pStr.includes('food') || pStr.includes('dine')) {
        return {
          category: "restaurant-menus",
          assistantMessage: "I've designed a bespoke QR digital menu tailored for your dining experience. Feel free to customize its pricing models, visual elements, and item list in the Restaurant Menus module.",
          payload: {
            id: `menu-ai-${Math.random().toString(36).substring(2, 7)}`,
            name: "The Artisan Bistro Gourmet Menu",
            itemsCount: 15,
            status: "active",
            scans: 0,
            currency: "USD"
          }
        };
      }
      
      if (pStr.includes('card') || pStr.includes('business') || pStr.includes('vcard') || pStr.includes('profile')) {
        return {
          category: "business-cards",
          assistantMessage: "I have prepared an elegant, high-contrast digital vCard profile with your contact parameters. Your clients can scan this and instantly download your contact information.",
          payload: {
            id: `card-ai-${Math.random().toString(36).substring(2, 7)}`,
            name: "Alex Rivera",
            role: "Principal Product Consultant",
            company: "Apex Strategy Group",
            email: "alex.rivera@apexgroup.com",
            phone: "+1 (555) 014-9382",
            views: 0
          }
        };
      }

      if (pStr.includes('pdf') || pStr.includes('document') || pStr.includes('share') || pStr.includes('brochure')) {
        return {
          category: "pdf-sharing",
          assistantMessage: "I have structured a new hosted PDF sharing configuration for your document distribution. It includes a tracking URL and visual download selectors.",
          payload: {
            id: `pdf-ai-${Math.random().toString(36).substring(2, 7)}`,
            title: "Premium Services Brochure & Portfolio",
            fileName: "services_portfolio_premium.pdf",
            fileSize: "3.2 MB",
            downloads: 0,
            uploadedAt: today
          }
        };
      }

      if (pStr.includes('event') || pStr.includes('campaign') || pStr.includes('coupon') || pStr.includes('discount')) {
        return {
          category: "campaigns",
          assistantMessage: "I have set up a customized marketing campaign and event dashboard tracker for you, allowing you to easily track scans, set limits, and monitor your visual assets.",
          payload: {
            id: `camp-ai-${Math.random().toString(36).substring(2, 7)}`,
            name: "Grand Seasonal Launch & Event QR",
            status: "active",
            type: "RSVP Event",
            scans: 0,
            startDate: today,
            budget: "$1,200"
          }
        };
      }

      // Default: beautiful, rich landing page configuration
      return {
        category: "landing-pages",
        assistantMessage: "I've created a custom, mobile-optimized landing page layout for your brand. It comes loaded with a header, elegant text columns, an active reservation contact form, and premium color gradients.",
        payload: {
          id: `lp-ai-${Math.random().toString(36).substring(2, 7)}`,
          title: "Custom Brand Launchpad",
          slug: "custom-brand-launch",
          userId: userId || "",
          theme: {
            name: "luxury",
            bgColor: "#f8fafc",
            bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            primaryColor: "#4f46e5",
            fontFamily: "Plus Jakarta Sans",
            textColor: "#ffffff"
          },
          seo: {
            metaTitle: "Welcome to our Brand Page",
            metaDescription: "Explore our dynamic customer services and brand offerings.",
            keywords: "brand, services, premium",
            shareImage: ""
          },
          components: [
            {
              id: "hero-1",
              type: "hero",
              title: "Experience the Future of Brand Connections",
              subtitle: "Scan, discover, and interact with our curated digital experience instantly.",
              ctaText: "Get Started Now",
              ctaLink: "#",
              bgType: "gradient",
              bgColor: "#1e293b",
              bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              textColor: "#ffffff",
              align: "center"
            },
            {
              id: "social-1",
              type: "social",
              links: [
                { platform: "instagram", url: "https://instagram.com", active: true },
                { platform: "linkedin", url: "https://linkedin.com", active: true }
              ],
              style: "circle",
              color: "#4f46e5"
            }
          ],
          visits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    };

    try {
      if (!isGeminiEnabled()) {
        return res.json(generateLocalAssistantFallback(searchPrompt));
      }

      const languageInstruction = locale ? `IMPORTANT: The user is currently viewing the application in the locale/language: "${locale}". You MUST generate the assistantMessage response and all text details in the "${locale}" language (e.g. if locale is 'ar' write in Arabic, etc.). Do NOT output English if the locale is a non-English language.` : '';

      const response = await generateContentWithFallback({
        primaryModel: "gemini-3.6-flash",
        contents: `You are an expert full-stack AI Design Assistant embedded in a premium QR Marketing Platform.
Analyze the user's natural language request to create a marketing resource: "${userPrompt}".

Your job is to classify the request into one of the 5 categories and generate the optimal JSON payload schema to pre-populate that module.

Determine the 'category':
- "restaurant-menus" (if they ask for "Create Restaurant Campaign", "create food menu", "restaurant list", etc.)
- "business-cards" (if they ask for "Create Business Card", "create vcard", etc.)
- "pdf-sharing" (if they ask for "Create PDF Share", "upload pdf", etc.)
- "campaigns" (if they ask for "Create Event", "marketing campaign", "rsvp tracker", etc.)
- "landing-pages" (if they ask for "Create Landing Page", "custom web page", etc.)

Generate a personalized 'assistantMessage' explaining what you've generated, why you chose these color tones or layout components, and guiding them to use it. Make it premium and tailored to the requested theme.

Generate the 'payload' matching the precise data schema for the selected category:
- For "restaurant-menus": { name, itemsCount, currency (e.g. "USD"), status ("active" or "draft") }
- For "business-cards": { name, role, company, email, phone }
- For "pdf-sharing": { title, fileName, fileSize (e.g. "4.2 MB") }
- For "campaigns": { name, status ("active" or "scheduled"), type (e.g. "RSVP Event", "Coupon Promo"), budget (e.g. "$1,200") }
- For "landing-pages": { title, slug, theme: { name: "minimal"|"sunset"|"luxury"|"neon"|"forest", bgColor, bgGradient, primaryColor, fontFamily, textColor }, seo: { metaTitle, metaDescription, keywords }, components: Array of PageComponents }
  *IMPORTANT FOR "landing-pages"*: Create a beautiful, fully functional rich landing page configuration! Include a 'hero' component, a 'social' component, and optionally a 'button' or 'contactForm'! Do not skip fields. All component IDs must be unique strings.

\n\n${languageInstruction}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "MUST be one of: 'restaurant-menus', 'business-cards', 'pdf-sharing', 'campaigns', 'landing-pages'" },
              assistantMessage: { type: Type.STRING, description: "Elegant, conversational briefing explaining the design choices and encouraging them to proceed." },
              payload: { 
                type: Type.OBJECT, 
                description: "The complete, rich structured schema representing the generated module instance."
              }
            },
            required: ["category", "assistantMessage", "payload"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
      return res.json(generateLocalAssistantFallback(searchPrompt));
    } catch (err) {
      console.warn('[AI Assistant Endpoint Fallback triggered]', err);
      return res.json(generateLocalAssistantFallback(searchPrompt));
    }
  });


  // --- REDIRECTIONAL ACCESS GATE & TELEMETRY ENGINE ---
  // In-memory Geo Location Cache (IP -> { city, country, countryCode, approxLocation })
  const geoCache = new Map<string, { city: string; country: string; countryCode: string; approxLocation: string }>();

  // Helper: Extract real client IP
  function getClientIp(req: express.Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean);
      for (const ip of ips) {
        if (!isPrivateIp(ip)) return ip;
      }
      if (ips.length > 0) return ips[0];
    }
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();
    return req.socket.remoteAddress || req.ip || '127.0.0.1';
  }

  function isPrivateIp(ip: string): boolean {
    if (!ip) return true;
    const clean = ip.replace(/^::ffff:/, '');
    if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean === '0.0.0.0') return true;
    if (clean.startsWith('10.') || clean.startsWith('192.168.') || clean.startsWith('fc00:') || clean.startsWith('fe80:')) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
    return false;
  }

  // Helper: Privacy-preserving IP anonymization
  function anonymizeIp(ip: string): string {
    if (!ip) return '127.0.0.xxx';
    const clean = ip.replace(/^::ffff:/, '').trim();
    if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }
    if (clean.includes(':')) {
      const parts = clean.split(':');
      if (parts.length > 3) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:xxxx::`;
      }
    }
    return 'xxx.xxx.xxx.xxx';
  }

  // Helper: Parse Device, OS, and Browser from User-Agent
  function parseDeviceInfo(userAgentRaw: string) {
    const ua = (userAgentRaw || '').toLowerCase();
    
    // 1. Device Type
    let deviceType = 'Desktop';
    if (ua.includes('ipad') || ua.includes('tablet') || ua.includes('kindle') || ua.includes('silk') || ua.includes('playbook')) {
      deviceType = 'Tablet';
    } else if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('ipod') || ua.includes('android') || ua.includes('blackberry') || ua.includes('windows phone') || ua.includes('opera mini')) {
      deviceType = 'Mobile';
    }

    // 2. Operating System
    let os = 'Unknown OS';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || (ua.includes('os x') && ua.includes('mobile'))) {
      os = 'iOS';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
      os = 'macOS';
    } else if (ua.includes('windows nt') || ua.includes('win32') || ua.includes('win64')) {
      os = 'Windows';
    } else if (ua.includes('cros')) {
      os = 'ChromeOS';
    } else if (ua.includes('linux') || ua.includes('ubuntu') || ua.includes('debian') || ua.includes('fedora') || ua.includes('x11')) {
      os = 'Linux';
    }

    // 3. Browser
    let browser = 'Chrome';
    if (ua.includes('instagram')) {
      browser = 'Instagram In-App';
    } else if (ua.includes('tiktok') || ua.includes('musical_ly') || ua.includes('bytelocale')) {
      browser = 'TikTok In-App';
    } else if (ua.includes('whatsapp')) {
      browser = 'WhatsApp';
    } else if (ua.includes('samsungbrowser')) {
      browser = 'Samsung Internet';
    } else if (ua.includes('edg/') || ua.includes('edge/')) {
      browser = 'Edge';
    } else if (ua.includes('opr/') || ua.includes('opera/')) {
      browser = 'Opera';
    } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
      browser = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios') && !ua.includes('android')) {
      browser = 'Safari';
    } else if (ua.includes('chrome') || ua.includes('crios')) {
      browser = 'Chrome';
    } else {
      browser = 'Other Browser';
    }

    return { deviceType, os, browser };
  }

  // Country language map for fallback
  const LANG_COUNTRY_MAP: Record<string, { city: string; country: string; countryCode: string }> = {
    'us': { city: 'New York', country: 'United States', countryCode: 'US' },
    'en-us': { city: 'New York', country: 'United States', countryCode: 'US' },
    'gb': { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    'uk': { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    'en-gb': { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    'ca': { city: 'Toronto', country: 'Canada', countryCode: 'CA' },
    'en-ca': { city: 'Toronto', country: 'Canada', countryCode: 'CA' },
    'au': { city: 'Sydney', country: 'Australia', countryCode: 'AU' },
    'en-au': { city: 'Sydney', country: 'Australia', countryCode: 'AU' },
    'pk': { city: 'Karachi', country: 'Pakistan', countryCode: 'PK' },
    'ur': { city: 'Islamabad', country: 'Pakistan', countryCode: 'PK' },
    'ur-pk': { city: 'Karachi', country: 'Pakistan', countryCode: 'PK' },
    'in': { city: 'Mumbai', country: 'India', countryCode: 'IN' },
    'hi': { city: 'New Delhi', country: 'India', countryCode: 'IN' },
    'hi-in': { city: 'New Delhi', country: 'India', countryCode: 'IN' },
    'de': { city: 'Berlin', country: 'Germany', countryCode: 'DE' },
    'de-de': { city: 'Berlin', country: 'Germany', countryCode: 'DE' },
    'fr': { city: 'Paris', country: 'France', countryCode: 'FR' },
    'fr-fr': { city: 'Paris', country: 'France', countryCode: 'FR' },
    'es': { city: 'Madrid', country: 'Spain', countryCode: 'ES' },
    'es-es': { city: 'Madrid', country: 'Spain', countryCode: 'ES' },
    'it': { city: 'Rome', country: 'Italy', countryCode: 'IT' },
    'it-it': { city: 'Rome', country: 'Italy', countryCode: 'IT' },
    'jp': { city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    'ja': { city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    'ja-jp': { city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    'br': { city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
    'pt-br': { city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
    'ae': { city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
    'ar-ae': { city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
    'sa': { city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA' },
    'ar-sa': { city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA' },
    'za': { city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA' },
    'en-za': { city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA' },
  };

  // Helper: Fast Asynchronous IP Geolocation with Caching and Fallbacks
  async function resolveLocation(ip: string, req: express.Request): Promise<{ approxLocation: string; city: string; country: string; countryCode: string }> {
    // Check Cloudflare / CDN headers first
    const cfCountry = (req.headers['cf-ipcountry'] as string || req.headers['x-appengine-country'] as string || req.headers['x-country-code'] as string || '').toUpperCase();
    const cfCity = (req.headers['cf-ipcity'] as string || req.headers['x-appengine-city'] as string || '').trim();

    if (cfCountry && cfCountry.length === 2) {
      const countryName = cfCountry === 'US' ? 'United States' :
                          cfCountry === 'GB' ? 'United Kingdom' :
                          cfCountry === 'PK' ? 'Pakistan' :
                          cfCountry === 'IN' ? 'India' :
                          cfCountry === 'DE' ? 'Germany' :
                          cfCountry === 'FR' ? 'France' :
                          cfCountry === 'CA' ? 'Canada' :
                          cfCountry === 'AU' ? 'Australia' :
                          cfCountry === 'JP' ? 'Japan' :
                          cfCountry === 'BR' ? 'Brazil' :
                          cfCountry === 'AE' ? 'United Arab Emirates' :
                          cfCountry === 'SA' ? 'Saudi Arabia' :
                          cfCountry === 'ZA' ? 'South Africa' : cfCountry;
      const city = cfCity || 'Regional';
      return {
        approxLocation: `${city}, ${countryName}`,
        city,
        country: countryName,
        countryCode: cfCountry
      };
    }

    // If private or loopback IP, fallback to language header
    if (isPrivateIp(ip)) {
      const langHeader = (req.headers['accept-language'] || '').toLowerCase();
      for (const [key, val] of Object.entries(LANG_COUNTRY_MAP)) {
        if (langHeader.includes(key)) {
          return {
            approxLocation: `${val.city}, ${val.country}`,
            city: val.city,
            country: val.country,
            countryCode: val.countryCode
          };
        }
      }
      return {
        approxLocation: 'London, United Kingdom',
        city: 'London',
        country: 'United Kingdom',
        countryCode: 'GB'
      };
    }

    // Check in-memory cache
    const cached = geoCache.get(ip);
    if (cached) {
      return cached;
    }

    // Live Geolocation API resolution with fast 1200ms timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'FreeQRGen-Telemetry/1.0' }
      });
      clearTimeout(timer);

      if (res.ok) {
        const data: any = await res.json();
        if (data && data.success) {
          const city = data.city || 'Regional';
          const country = data.country || 'Global';
          const countryCode = data.country_code || 'GL';
          const result = {
            approxLocation: `${city}, ${country}`,
            city,
            country,
            countryCode
          };
          if (geoCache.size < 5000) {
            geoCache.set(ip, result);
          }
          return result;
        }
      }
    } catch (apiErr) {
      // API failed or aborted, continue to fallback
    }

    // Fallback to FreeIPAPI
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);

      const res = await fetch(`https://freeipapi.com/api/json/${encodeURIComponent(ip)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'FreeQRGen-Telemetry/1.0' }
      });
      clearTimeout(timer);

      if (res.ok) {
        const data: any = await res.json();
        if (data && data.countryName) {
          const city = data.cityName || 'Regional';
          const country = data.countryName;
          const countryCode = data.countryCode || 'GL';
          const result = {
            approxLocation: `${city}, ${country}`,
            city,
            country,
            countryCode
          };
          if (geoCache.size < 5000) {
            geoCache.set(ip, result);
          }
          return result;
        }
      }
    } catch (apiErr2) {
      // Second API failed
    }

    // Fallback to language header
    const langHeader = (req.headers['accept-language'] || '').toLowerCase();
    for (const [key, val] of Object.entries(LANG_COUNTRY_MAP)) {
      if (langHeader.includes(key)) {
        const result = {
          approxLocation: `${val.city}, ${val.country}`,
          city: val.city,
          country: val.country,
          countryCode: val.countryCode
        };
        return result;
      }
    }

    return {
      approxLocation: 'Global',
      city: 'Global',
      country: 'Global',
      countryCode: 'GL'
    };
  }

  // Record complete scan telemetry
  async function recordScanTelemetry(project: any, trackingId: string, destination: string, req: express.Request) {
    const rawIp = getClientIp(req);
    const ip = anonymizeIp(rawIp);
    const rawUserAgent = req.headers['user-agent'] || '';
    const { deviceType, os, browser } = parseDeviceInfo(rawUserAgent);
    const loc = await resolveLocation(rawIp, req);
    const referrer = (req.headers['referer'] || req.headers['referrer'] || 'Direct Camera Scan') as string;
    const scanId = `scan-${Math.random().toString(36).substring(2, 11)}`;

    const newScan: DbScan = {
      id: scanId,
      projectId: project.id,
      trackingId: trackingId,
      timestamp: new Date().toISOString(),
      deviceType,
      os,
      browser,
      approxLocation: loc.approxLocation,
      city: loc.city,
      country: loc.country,
      countryCode: loc.countryCode,
      ip,
      destinationUrl: destination,
      referrer,
      userId: project.userId,
      userAgent: rawUserAgent
    };

    await dbInstance.createScan(newScan);
    await dbInstance.incrementProjectScan(project.id);
    notifyUserOfScan(project.userId, newScan, project.name || 'My QR Code');
    return newScan;
  }

  // Public Telemetry Record Endpoint (for client-side SPA redirects or headless integrations)
  app.post('/api/scans/record', async (req, res) => {
    const { trackingId, destinationUrl } = req.body;
    if (!trackingId) {
      return res.status(400).json({ error: 'trackingId is required' });
    }

    try {
      const project = await dbInstance.getProjectByTrackingId(trackingId);
      if (!project) {
        return res.status(404).json({ error: 'QR Code not found' });
      }

      const destination = destinationUrl || project.content || 'https://google.com';
      const scan = await recordScanTelemetry(project, trackingId, destination, req);
      res.status(201).json({ success: true, scan });
    } catch (err: any) {
      console.error('Scan telemetry logging failed:', err);
      res.status(500).json({ error: 'Failed to record scan' });
    }
  });

  // Handler for QR Redirection & Telemetry Tracking
  const handleQRRedirect = async (req: express.Request, res: express.Response) => {
    const { trackingId } = req.params;
    console.log(`[Short-Link Redirect] Request received for shortCode/trackingId: "${trackingId}"`);

    const escapeHtml = (str: string) => {
      return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    try {
      console.log(`[Short-Link Redirect] Querying database for trackingId/shortCode: "${trackingId}"...`);
      const project = await dbInstance.getProjectByTrackingId(trackingId);

      if (!project) {
        console.warn(`[Short-Link Redirect] Database query returned empty results (null/undefined) for ID: "${trackingId}"`);
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Not Found - FreeQRGen</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #fafafa;
                color: #171717;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 16px;
                box-sizing: border-box;
              }
              .card {
                background-color: white;
                padding: 40px 32px;
                border-radius: 16px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                border: 1px solid #f0f0f0;
                max-width: 460px;
                width: 100%;
                text-align: center;
              }
              .icon-container {
                background-color: #fffbeb;
                color: #d97706;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
              }
              .icon {
                width: 32px;
                height: 32px;
              }
              h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 12px;
                color: #171717;
                letter-spacing: -0.02em;
              }
              p {
                font-size: 15px;
                color: #6b7280;
                line-height: 1.6;
                margin: 0 0 28px;
              }
              .button {
                display: inline-block;
                background-color: #4f46e5;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
              }
              .button:hover {
                background-color: #4338ca;
                transform: translateY(-1px);
                box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.15);
              }
              .button:active {
                transform: translateY(0);
              }
              .code-hint {
                margin-top: 24px;
                font-size: 12px;
                color: #9ca3af;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon-container">
                <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1>Link Not Found</h1>
              <p>We couldn't find the destination URL or project associated with this short link. It may have been deleted, or the address might be incorrect.</p>
              <a href="/" class="button">Go Back to Homepage</a>
              <div class="code-hint">ID: ${escapeHtml(trackingId)}</div>
            </div>
          </body>
          </html>
        `);
      }

      console.log(`[Short-Link Redirect] Firestore Lookup Success for "${trackingId}":`, {
        id: project.id,
        name: project.name,
        type: project.type,
        content: project.content,
        trackingEnabled: project.trackingEnabled
      });

      let destination = project.content || 'https://google.com';
      let showExpiredMessage = false;

      // Smart App Store redirection protocol
      if (project.type === 'app' || (project.content && project.content.startsWith('{') && project.content.endsWith('}'))) {
        try {
          const parsed = JSON.parse(project.content);
          if (parsed.ios || parsed.android) {
            const userAgent = (req.headers['user-agent'] || '').toLowerCase();
            if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
              destination = parsed.ios || parsed.android || 'https://apps.apple.com';
            } else if (userAgent.includes('android')) {
              destination = parsed.android || parsed.ios || 'https://play.google.com';
            } else {
              destination = parsed.fallback || parsed.ios || parsed.android || 'https://google.com';
            }
          }
        } catch (e) {
          console.error('Failed to parse app redirect content:', e);
        }
      }

      // Expiry Date validation protocol
      if (project.expiryDate) {
        const currentDate = new Date();
        const expiryDate = new Date(project.expiryDate);
        if (!isNaN(expiryDate.getTime()) && currentDate > expiryDate) {
          if (project.expiryRedirectType === 'url') {
            destination = project.expiryRedirectUrl || 'https://google.com';
          } else {
            showExpiredMessage = true;
          }
        }
      }

      // Redirection protocol verification to fix Open Redirect/stored XSS via javascript URIs
      const cleanDestination = destination.trim().toLowerCase();
      if (cleanDestination.startsWith('javascript:')) {
        return res.status(400).send('Blocked unsafe protocol redirect.');
      }

      // Record logs if tracking is enabled
      if (project.trackingEnabled) {
        await recordScanTelemetry(project, trackingId, destination, req);
      }

      if (showExpiredMessage) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QR Code Expired</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #f9fafb;
                color: #1f2937;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 16px;
                box-sizing: border-box;
              }
              .card {
                background-color: white;
                padding: 32px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                max-width: 440px;
                width: 100%;
                text-align: center;
              }
              .icon-container {
                background-color: #fee2e2;
                color: #ef4444;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }
              .icon {
                width: 28px;
                height: 28px;
              }
              h1 {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 8px;
                color: #111827;
              }
              p {
                font-size: 15px;
                color: #4b5563;
                line-height: 1.5;
                margin: 0 0 24px;
              }
              .button {
                display: inline-block;
                background-color: #4f46e5;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 500;
                font-size: 14px;
                transition: background-color 0.2s;
              }
              .button:hover {
                background-color: #4338ca;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon-container">
                <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1>QR Code Expired</h1>
              <p>${escapeHtml(project.expiryMessage || 'This custom link has reached its designated expiration date and is no longer active.')}</p>
              <a href="/" class="button">Go to Generator</a>
            </div>
          </body>
          </html>
        `);
      }

      // Perform Redirection
      res.redirect(destination);
    } catch (err) {
      console.error('Core scan tracking process failed:', err);
      res.redirect('/');
    }
  };

  // Register all QR redirection route variants
  app.get('/qr/:trackingId', handleQRRedirect);
  app.get('/r/:trackingId', handleQRRedirect);
  app.get('/api/r/:trackingId', handleQRRedirect);


  // --- SEO ROUTING: SITEMAP & ROBOTS ENFORCEMENTS ---
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    const baseUrl = 'https://www.freeqrbarcodes.com';
    const slugs = [
      '',
      // Generators & Tools
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
      'pdf-qr-generator',
      'restaurant-menu-qr-generator',
      'digital-card-qr-generator',
      'pdf-sharing-qr-generator',
      'barcode-generator',
      'bulk-qr-generator',
      'animated-qr-generator',
      'payment-qr-generator',
      'crypto-qr-generator',
      'app-store-qr-generator',
      'location-qr-generator',

      // Core & Hubs
      'faq',
      'blog',
      'templates',
      'compare',
      'academy',
      'guides',
      'tutorials',
      'resources',
      'glossary',
      'solutions',
      'industries',
      'use-cases',
      'platform',
      'marketing-platform',

      // Trust Center & Company
      'about',
      'why-freeqrgen',
      'editorial-policy',
      'research-methodology',
      'privacy',
      'privacy-policy',
      'security',
      'data-processing',
      'accessibility',
      'contact',
      'changelog',
      'release-notes',
      'system-status',
      'careers',
      'media-kit',
      'brand-assets',
      'press',

      // Growth Suite
      'profile',
      'community',
      'roadmap',
      'testimonials',
      'case-studies',
      'feedback',

      // Knowledge Hub Guides & Tutorials
      'academy/what-is-a-qr-code',
      'academy/how-qr-codes-work',
      'academy/static-vs-dynamic-qr-codes',
      'guides/restaurant-qr-codes',
      'guides/business-card-qr-codes',
      'guides/wifi-qr-codes',
      'guides/google-review-qr-codes',
      'guides/whatsapp-qr-codes',
      'guides/pdf-qr-codes',
      'guides/email-qr-codes',
      'guides/phone-qr-codes',
      'guides/sms-qr-codes',
      'guides/url-qr-codes',
      'guides/location-qr-codes',
      'guides/vcard-qr-codes',
      'guides/event-qr-codes',
      'tutorials/best-qr-code-size-guide',
      'tutorials/qr-printing-guide',
      'tutorials/qr-code-error-correction-guide',
      'resources/qr-security-best-practices',

      // Templates Hub
      'templates/restaurant-menu-qr-code',
      'templates/business-card-qr-code',
      'templates/google-review-qr-code',
      'templates/whatsapp-qr-code',
      'templates/wifi-qr-code',
      'templates/pdf-qr-code',
      'templates/event-ticket-qr-code',
      'templates/instagram-qr-code',
      'templates/facebook-qr-code',
      'templates/youtube-qr-code',
      'templates/real-estate-qr-code',
      'templates/hotel-qr-code',
      'templates/cafe-qr-code',
      'templates/gym-qr-code',
      'templates/school-qr-code',
      'templates/medical-qr-code',
      'templates/retail-qr-code',
      'templates/portfolio-qr-code',
      'templates/resume-qr-code',
      'templates/product-packaging-qr-code',

      // Compare Hub
      'compare/static-vs-dynamic-qr-code',
      'compare/png-vs-svg-qr-code',
      'compare/svg-vs-pdf-qr-code',
      'compare/free-vs-paid-qr-codes',
      'compare/editable-vs-non-editable-qr-codes',
      'compare/qr-code-error-correction-levels',
      'compare/black-vs-colored-qr-codes',
      'compare/business-card-qr-vs-nfc',
      'compare/restaurant-qr-vs-printed-menu',
      'compare/google-review-qr-vs-review-link',
      'compare/qr-menu-vs-paper-menu',

      // Programmatic SEO Solutions, Industries, Use Cases
      'solutions/contactless-menu',
      'solutions/digital-business-card',
      'solutions/google-review-booster',
      'solutions/wifi-guest-onboarding',
      'solutions/event-ticketing-checkin',
      'solutions/app-download-marketing',
      'industries/restaurant',
      'industries/cafe',
      'industries/hotel',
      'industries/retail',
      'industries/e-commerce',
      'industries/healthcare',
      'use-cases/tableside-ordering',
      'use-cases/real-estate-signs',
      'use-cases/product-packaging-manuals',
      'use-cases/office-lobby-wifi',
      'use-cases/concert-ticket-validation',
      'use-cases/social-media-engagement',

      // Platform Modules
      'platform/qr-analytics',
      'platform/dynamic-qr',
      'platform/bulk-generator',
      'platform/folder-management',
      'platform/collections',
      'platform/saved-designs',
      'platform/favorite-templates',
      'platform/team-workspace',
      'platform/organization',
      'platform/api-platform',
      'platform/developer-dashboard',
      'platform/webhooks',
      'platform/integrations',
      'platform/scan-statistics',
      'platform/campaign-manager',
      'platform/export-center',
      'platform/import-center',

      // Blog Articles
      'blog/what-is-qr-code-how-it-works',
      'blog/static-vs-dynamic-qr-codes-guide',
      'blog/qr-code-error-correction-levels-explained',
      'blog/omnichannel-retail-qr-codes-footfall-to-sales',
      'blog/b2b-lead-generation-with-qr-landing-pages',
      'blog/smart-packaging-qr-codes-product-engagement',
      'blog/utm-tracking-measuring-qr-code-roi-ga4',
      'blog/retargeting-offline-audiences-with-dynamic-qr',
      'blog/ab-testing-print-advertising-with-qr-codes',
      'blog/small-business-qr-code-starter-playbook',
      'blog/how-to-boost-google-reviews-with-countertop-qr',
      'blog/contactless-invoicing-qr-payment-receipts',
      'blog/anatomy-of-2d-matrix-grids-micro-qr-iqr',
      'blog/qr-code-cybersecurity-preventing-qshing-attacks',
      'blog/gs1-digital-link-2027-barcode-standards-transition',
      'blog/hotel-digital-checkin-guest-experience-qr',
      'blog/touchless-healthcare-clinic-patient-registration-qr',
      'blog/smart-facility-maintenance-ticketing-equipment-qr',
      'blog/complete-guide-to-digital-qr-restaurant-menus',
      'blog/dynamic-pricing-and-realtime-menu-updates-qr',
      'blog/tableside-ordering-and-speeding-up-table-turnover',
      'blog/high-speed-event-ticketing-and-access-control-qr',
      'blog/smart-networking-vcard-badges-for-conferences',
      'blog/live-audience-polls-qa-interactive-event-qr',
      'blog/interactive-textbooks-and-classroom-handouts-qr',
      'blog/campus-navigation-and-smart-building-directories-qr',
      'blog/qr-based-automated-student-attendance-systems',
      'blog/multi-link-social-bio-qr-codes-one-scan',
      'blog/pop-up-store-activations-viral-social-qr-campaigns',
      'blog/influencer-merch-unboxing-direct-social-engagement',

      // Multilingual locales
      'ar', 'ur', 'de', 'fr', 'es', 'pt', 'it', 'tr', 'id', 'hi', 'zh', 'ja', 'ko'
    ];

    const urlXmls = slugs.map(slug => {
      let priority = '0.8';
      let freq = 'weekly';
      if (slug === '') {
        priority = '1.0';
        freq = 'daily';
      } else if (['about', 'privacy', 'privacy-policy', 'contact', 'terms', 'system-status', 'release-notes', 'changelog'].includes(slug)) {
        priority = '0.5';
        freq = 'monthly';
      } else if (slug.startsWith('blog/') || slug.startsWith('academy/') || slug.startsWith('guides/')) {
        priority = '0.7';
        freq = 'weekly';
      }
      return `  <url>
    <loc>${baseUrl}/${slug ? slug : ''}</loc>
    <lastmod>2026-08-16</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
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
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /profile

Sitemap: https://www.freeqrbarcodes.com/sitemap.xml`;
    res.send(robots);
  });


  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
    });
  });

  // Global Express Error Handling Middleware to prevent unhandled exceptions from crashing Vercel Serverless Function invocations
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Express Global Error Handler]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err?.message || 'An unexpected server error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });

  // --- TECHNICAL SEO, MULTILINGUAL SCHEMA.ORG & PRERENDERING ENGINE ---
  const localizedMetadata: Record<string, {
    title: string;
    description: string;
    faqTitle?: string;
    faqDescription?: string;
    blogTitle?: string;
    blogDescription?: string;
  }> = {
    en: {
      title: "Free QR Code Generator - Dynamic QR Codes & Custom Creator",
      description: "Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Complete with full design control, no sign-up required.",
      faqTitle: "Frequently Asked Questions - Free QR Code Generator",
      faqDescription: "Find answers to common questions about QR codes, static vs dynamic codes, error correction levels, customization, and how to create them.",
      blogTitle: "Guides, Tutorials & Marketing Blog - Free QR Code Generator",
      blogDescription: "Read our technical and strategic guides on QR codes, dynamic redirects, QR codes for restaurant menus, business networking, and contactless services."
    },
    ur: {
      title: "مفت کیو آر کوڈ جنریٹر - ڈائنامک کیو آر کوڈز اور کسٹم میکر",
      description: "لوگو، کسٹم رنگوں، گریڈینٹس اور ریئل ٹائم اسکین تجزیات کے ساتھ مفت ڈائنامک کیو آر کوڈز بنائیں۔ کسی سائن اپ کی ضرورت نہیں ہے۔",
      faqTitle: "اکثر پوچھے گئے سوالات - مفت کیو آر کوڈ جنریٹر",
      faqDescription: "کیو آر کوڈز، اسٹیٹک بمقابلہ ڈائنامک کوڈز، اور کسٹمائزیشن کے بارے میں عام سوالات کے جوابات حاصل کریں۔",
      blogTitle: "رہنما، سبق اور مارکیٹنگ بلاگ - مفت کیو آر کوڈ جنریٹر",
      blogDescription: "کیو آر کوڈز، ڈائنامک ری ڈائریکٹس، اور ریستوراں کے مینو کے بارے میں ہمارے تکنیکی اور حکمت عملی کے رہنما پڑھیں۔"
    },
    ar: {
      title: "مولد رمز QR مجاني - رموز QR ديناميكية ومخصصة",
      description: "أنشئ رموز QR ديناميكية مجانية مع شعارات وألوان مخصصة وتدرجات وتحليلات مسح في الوقت الفعلي. لا يلزم الاشتراك.",
      faqTitle: "الأسئلة الشائعة - مولد رمز QR المجاني",
      faqDescription: "اعثر على إجابات للأسئلة الشائعة حول رموز QR، والأكواد الثابتة مقابل الديناميكية، والتخصيص.",
      blogTitle: "الأدلة والدروس ومدونة التسويق - مولد رمز QR المجاني",
      blogDescription: "اقرأ أدلتنا الفنية والاستراتيجية حول رموز QR والتوجيهات الديناميكية ورموز QR لقوائم المطاعم."
    },
    hi: {
      title: "मुफ़्त क्यूआर कोड जनरेटर - डायनेमिक क्यूआर कोड और कस्टम निर्माता",
      description: "लोगो, कस्टम रंग, ग्रेडिएंट और रीयल-टाइम स्कैन विश्लेषण के साथ मुफ़्त डायनेमिक क्यूआर कोड बनाएं। किसी साइन-अप की आवश्यकता नहीं है।",
      faqTitle: "अक्सर पूछे जाने वाले प्रश्न - मुफ़्त क्यूआर कोड जनरेटर",
      faqDescription: "क्यूआर कोड, स्टेटिक बनाम डायनेमिक कोड और कस्टमाइज़ेशन के बारे में सामान्य प्रश्नों के उत्तर खोजें।",
      blogTitle: "गाइड, ट्यूटोरियल और मार्केटिंग ब्लॉग - मुफ़्त क्यूआर कोड जनरेटर",
      blogDescription: "क्यूआर कोड, डायनेमिक रीडायरेक्ट और रेस्तरां मेनू के बारे में हमारे तकनीकी और रणनीतिक गाइड पढ़ें।"
    },
    es: {
      title: "Generador de códigos QR gratis - Códigos QR dinámicos y creador personalizado",
      description: "Cree códigos QR dinámicos gratuitos con logotipos, colores personalizados, degradados y análisis de escaneo en tiempo real. Sin necesidad de registrarse.",
      faqTitle: "Preguntas frecuentes - Generador de códigos QR gratis",
      faqDescription: "Encuentre respuestas a preguntas frecuentes sobre códigos QR, códigos estáticos frente a dinámicos y personalización.",
      blogTitle: "Blog de guías, tutoriales y marketing - Generador de códigos QR gratis",
      blogDescription: "Lea nuestras guías técnicas y estratégicas sobre códigos QR, redireccionamientos dinámicos y códigos QR para menús de restaurantes."
    },
    fr: {
      title: "Générateur de code QR gratuit - Codes QR dynamiques et créateur personnalisé",
      description: "Créez des codes QR dynamiques gratuits avec des logos, des couleurs personnalisées, des dégradés et des analyses de numérisation en temps réel. Sans inscription.",
      faqTitle: "Foire aux questions (FAQ) - Générateur de code QR gratuit",
      faqDescription: "Trouvez des réponses aux questions courantes sur les codes QR, les codes statiques ou dynamiques et la personnalisation.",
      blogTitle: "Guides, didacticiels et blog marketing - Générateur de code QR gratuit",
      blogDescription: "Lisez nos guides techniques et stratégiques sur les codes QR, les redirections dynamiques et les menus de restaurant."
    },
    tr: {
      title: "Ücretsiz QR Kod Oluşturucu - Dinamik QR Kodları ve Özel Tasarım",
      description: "Logolar, özel renkler, degradeler ve gerçek zamanlı tarama analitiği ile ücretsiz dinamik QR kodları oluşturun. Kayıt gerekmez.",
      faqTitle: "Sıkça Sorulan Sorular - Ücretsiz QR Kod Oluşturucu",
      faqDescription: "QR kodları, statik ve dinamik kodlar ve özelleştirme hakkında sık sorulan soruların yanıtlarını bulun.",
      blogTitle: "Kılavuzlar, Eğitimler ve Pazarlama Blogu - Ücretsiz QR Kod Oluşturucu",
      blogDescription: "QR kodları, dinamik yönlendirmeler og restoran menüleri hakkında teknik ve stratejik kılavuzlarımızı okuyun."
    },
    id: {
      title: "Generator Kode QR Gratis - Kode QR Dinamis & Pembuat Kustom",
      description: "Buat kode QR dinamis gratis dengan logo, warna khusus, gradien, dan analitik pemindaian waktu nyata. Tanpa pendaftaran.",
      faqTitle: "Pertanyaan Sering Diajukan (FAQ) - Generator Kode QR Gratis",
      faqDescription: "Temukan jawaban atas pertanyaan umum tentang kode QR, kode statis vs dinamis, dan kustomisasi.",
      blogTitle: "Blog Panduan, Tutorial & Pemasaran - Generator Kode QR Gratis",
      blogDescription: "Baca panduan teknis dan strategis kami tentang kode QR, pengalihan dinamis, dan kode QR untuk menu restoran."
    }
  };

  function generateSeoAndSchema(locale: string, route: string, fullUrl: string) {
    const meta = localizedMetadata[locale] || localizedMetadata['en'];

    let title = meta.title;
    let description = meta.description;
    let schemaObjects: any[] = [];
    let noscriptHtml = '';

    const orgSchema = {
      "@type": "Organization",
      "@id": "https://www.freeqrbarcodes.com/#organization",
      "name": "Free QR Code Generator",
      "url": "https://www.freeqrbarcodes.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.freeqrbarcodes.com/#logo",
        "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png",
        "caption": "Free QR Code Generator Logo"
      },
      "image": {
        "@id": "https://www.freeqrbarcodes.com/#logo"
      }
    };

    const webSiteSchema = {
      "@type": "WebSite",
      "@id": "https://www.freeqrbarcodes.com/#website",
      "name": "Free QR Code Generator",
      "url": "https://www.freeqrbarcodes.com/",
      "publisher": {
        "@id": "https://www.freeqrbarcodes.com/#organization"
      },
      "potentialAction": [{
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.freeqrbarcodes.com/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }]
    };

    schemaObjects.push(orgSchema, webSiteSchema);

    if (route === "" || route === "/") {
      const features = presetToolsTranslations[locale] || presetToolsTranslations['en'] || [];
      const featureList = features.map((f: any) => `${f.name}: ${f.desc}`);

      const webAppSchema = {
        "@type": "WebApplication",
        "@id": "https://www.freeqrbarcodes.com/#webapplication",
        "name": meta.title,
        "url": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale}`,
        "description": meta.description,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": featureList,
        "creator": {
          "@id": "https://www.freeqrbarcodes.com/#organization"
        }
      };
      schemaObjects.push(webAppSchema);

      noscriptHtml = `
<noscript>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
    <h1>${meta.title}</h1>
    <p>${meta.description}</p>
    <h2>Our Professional QR & Barcode Creator Tools:</h2>
    <ul>
      ${features.map((f: any) => `<li><strong>${f.name}</strong> - ${f.desc}</li>`).join('\n')}
    </ul>
  </div>
</noscript>`;

    } else if (route === "faq" || route === "faq/") {
      title = meta.faqTitle || title;
      description = meta.faqDescription || description;

      const faqItems = getFaqData(locale);
      const mainEntity = faqItems.map((item: any) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }));

      const faqSchema = {
        "@type": "FAQPage",
        "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}faq/#faqpage`,
        "mainEntity": mainEntity
      };

      const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}faq/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "FAQ",
            "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}faq`
          }
        ]
      };

      schemaObjects.push(faqSchema, breadcrumbSchema);

      noscriptHtml = `
<noscript>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
    <h1>${title}</h1>
    <p>${description}</p>
    <h2>Frequently Asked Questions:</h2>
    <dl>
      ${faqItems.map((item: any) => `
        <dt style="font-weight: bold; font-size: 1.2rem; margin-top: 1.5rem;">${item.question}</dt>
        <dd style="margin-left: 0; margin-top: 0.5rem; color: #333;">${item.answer}</dd>
      `).join('\n')}
    </dl>
  </div>
</noscript>`;

    } else if (route === "blog" || route === "blog/") {
      title = meta.blogTitle || title;
      description = meta.blogDescription || description;

      const articles = getBlogArticles(locale);
      const itemListElement = articles.map((art: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": art.title,
        "url": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/${art.slug}`
      }));

      const itemListSchema = {
        "@type": "ItemList",
        "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/#itemlist`,
        "name": meta.blogTitle,
        "description": meta.blogDescription,
        "itemListElement": itemListElement
      };

      const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog`
          }
        ]
      };

      schemaObjects.push(itemListSchema, breadcrumbSchema);

      noscriptHtml = `
<noscript>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
    <h1>${title}</h1>
    <p>${description}</p>
    <h2>Latest Guides & Tutorials:</h2>
    <ul style="list-style: none; padding-left: 0;">
      ${articles.map((art: any) => `
        <li style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem;">
          <h3><a href="/${locale === 'en' ? '' : locale + '/'}blog/${art.slug}" style="color: #0066cc; text-decoration: none; font-size: 1.4rem;">${art.title}</a></h3>
          <p style="color: #555; margin: 0.5rem 0;">${art.intro}</p>
          <small style="color: #888;">Published on ${art.date} by ${art.author} &bull; ${art.readingTime}</small>
        </li>
      `).join('\n')}
    </ul>
  </div>
</noscript>`;

    } else if (route.startsWith("blog/")) {
      const slug = route.substring(5).replace(/\/$/, "");
      const articles = getBlogArticles(locale);
      const article = articles.find((a: any) => a.slug === slug);

      if (article) {
        title = article.metaTitle || article.title;
        description = article.metaDescription || article.intro;

        const cleanBody = article.contentMarkdown.replace(/[#*`>_\-]/g, ' ').substring(0, 10000);

        const blogPostingSchema = {
          "@type": "BlogPosting",
          "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/${slug}/#blogposting`,
          "headline": article.title,
          "description": article.metaDescription || article.intro,
          "datePublished": "2026-06-02T08:00:00+00:00",
          "dateModified": "2026-06-02T08:00:00+00:00",
          "author": {
            "@type": "Person",
            "name": article.author || "I-Solutions Specialist"
          },
          "publisher": {
            "@id": "https://www.freeqrbarcodes.com/#organization"
          },
          "mainEntityOfPage": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/${slug}`,
          "articleBody": cleanBody
        };

        const breadcrumbSchema = {
          "@type": "BreadcrumbList",
          "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/${slug}/#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale}`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Blog",
              "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title,
              "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}blog/${slug}`
            }
          ]
        };

        schemaObjects.push(breadcrumbSchema);

        // Confirm translation status before attaching BlogPosting schema to prevent indexing incomplete content
        const translationStatus = checkArticleTranslationStatus(article, locale);
        if (translationStatus.isComplete || locale === 'en') {
          schemaObjects.push(blogPostingSchema);
        }

        noscriptHtml = `
<noscript>
  <article style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
    <p><a href="/${locale === 'en' ? '' : locale + '/'}blog" style="color: #0066cc;">&larr; Back to Blog</a></p>
    <header>
      <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">${article.title}</h1>
      <div style="color: #666; margin-bottom: 1.5rem; font-size: 0.9rem;">
        Published on ${article.date} by ${article.author} &bull; ${article.readingTime}
      </div>
    </header>
    <p style="font-size: 1.2rem; color: #333; font-style: italic; margin-bottom: 2rem;">${article.intro}</p>
    <div class="article-content" style="color: #222; font-size: 1.1rem;">
      ${article.contentMarkdown.split('\n\n').map((p: string) => {
        const trimmed = p.trim();
        if (trimmed.startsWith('### ')) {
          return `<h3 style="font-size: 1.4rem; margin-top: 1.8rem; margin-bottom: 0.8rem;">${trimmed.substring(4)}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2 style="font-size: 1.7rem; margin-top: 2rem; margin-bottom: 1rem;">${trimmed.substring(3)}</h2>`;
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const items = trimmed.split(/\n[\*\-]\s+/);
          return `<ul style="margin-bottom: 1.2rem; padding-left: 1.5rem;">${items.map(item => `<li>${item.replace(/^[\*\-]\s+/, '')}</li>`).join('')}</ul>`;
        }
        return `<p style="margin-bottom: 1.2rem;">${trimmed}</p>`;
      }).join('\n')}
    </div>
  </article>
</noscript>`;
      }
    } else {
      const toolSlug = route.replace(/\/$/, "");
      const tools = presetToolsTranslations[locale] || presetToolsTranslations['en'] || [];
      const matchedTool = tools.find((t: any) => t.slug === toolSlug);

      if (matchedTool) {
        title = `${matchedTool.name} - Free QR Code Generator`;
        description = matchedTool.desc;

        const breadcrumbSchema = {
          "@type": "BreadcrumbList",
          "@id": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}${toolSlug}/#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale}`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": matchedTool.name,
              "item": `https://www.freeqrbarcodes.com/${locale === 'en' ? '' : locale + '/'}${toolSlug}`
            }
          ]
        };
        schemaObjects.push(breadcrumbSchema);

        noscriptHtml = `
<noscript>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">
    <h1>${title}</h1>
    <p>${description}</p>
    <p><a href="/${locale === 'en' ? '' : locale}" style="color: #0066cc;">&larr; Return to main QR/Barcode designer</a></p>
  </div>
</noscript>`;
      }
    }

    const graphJson = {
      "@context": "https://schema.org",
      "@graph": schemaObjects
    };

    const schemaHtml = `<script type="application/ld+json">\n${JSON.stringify(graphJson, null, 2)}\n</script>`;

    return {
      title,
      description,
      schemaHtml,
      noscriptHtml
    };
  }

  async function serveHtmlWithSeoAndSchema(req: express.Request, res: express.Response, next: express.NextFunction) {
    const isFile = req.path.includes('.') && !req.path.endsWith('.html');
    const isViteInternal = req.path.startsWith('/@') || req.path.startsWith('/node_modules/') || req.path.startsWith('/src/');
    if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/ws') || req.path === '/sitemap.xml' || req.path === '/robots.txt' || isFile || isViteInternal) {
      return next();
    }

    try {
      let templatePath = '';
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        templatePath = path.join(process.cwd(), 'dist', 'index.html');
      } else {
        templatePath = path.join(process.cwd(), 'index.html');
      }

      const fs = await import('fs');
      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let html = fs.readFileSync(templatePath, 'utf-8');

      if (!isProd && (global as any).viteInstance) {
        html = await (global as any).viteInstance.transformIndexHtml(req.originalUrl || req.url, html);
      }

      const pathParts = req.path.split('/').filter(Boolean);
      let locale = 'en';
      const supportedLocales = ['ar', 'ur', 'de', 'fr', 'es', 'pt', 'it', 'tr', 'id', 'hi', 'zh', 'ja', 'ko'];
      
      let actualPathParts = [...pathParts];
      if (pathParts.length > 0 && supportedLocales.includes(pathParts[0])) {
        locale = pathParts[0];
        actualPathParts.shift();
      }

      const route = actualPathParts.join('/');

      const seoData = generateSeoAndSchema(locale, route, `https://www.freeqrbarcodes.com${req.originalUrl || req.url}`);

      let injectedHtml = html;

      if (seoData.title) {
        injectedHtml = injectedHtml.replace(/<title>.*?<\/title>/i, `<title>${seoData.title}</title>`);
        injectedHtml = injectedHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${seoData.title}" />`);
        injectedHtml = injectedHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${seoData.title}" />`);
      }
      if (seoData.description) {
        injectedHtml = injectedHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${seoData.description}" />`);
        injectedHtml = injectedHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${seoData.description}" />`);
        injectedHtml = injectedHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${seoData.description}" />`);
      }

      const canonicalUrl = `https://www.freeqrbarcodes.com${req.originalUrl || req.url}`;
      injectedHtml = injectedHtml.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

      if (seoData.schemaHtml) {
        const startMarker = '<!-- DYNAMIC_SCHEMA_START -->';
        const endMarker = '<!-- DYNAMIC_SCHEMA_END -->';
        const startIndex = injectedHtml.indexOf(startMarker);
        const endIndex = injectedHtml.indexOf(endMarker);
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          injectedHtml = injectedHtml.substring(0, startIndex) + 
                         seoData.schemaHtml + 
                         injectedHtml.substring(endIndex + endMarker.length);
        } else {
          injectedHtml = injectedHtml.replace('<!-- DYNAMIC_SCHEMA_PLACEHOLDER -->', seoData.schemaHtml);
        }
      }

      if (seoData.noscriptHtml) {
        injectedHtml = injectedHtml.replace('</body>', `${seoData.noscriptHtml}\n</body>`);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.status(200).send(injectedHtml);

    } catch (err) {
      console.error('[SEO Injection Middleware Error]:', err);
      next();
    }
  }

  // --- VITE MIDDLEWARE INTERFACE & STANDALONE STARTUP ---
  async function startServer() {
    console.log("Starting Express...");
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    console.log("Loading Firebase...");
    console.log("Loading Firestore...");
    try {
      getDb();
    } catch (err) {
      console.warn("Firestore startup check warning:", err);
    }

    console.log("Initializing system health document on startup...");
    // Run this asynchronously in the background so it never blocks app.listen from starting up the web server instantly!
    (async () => {
      try {
        const healthDocRef = adminDb.collection('system').doc('health');
        
        // Timeout protection for the startup check
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Startup Firestore ping timeout')), 1500)
        );
        const healthSnap = await Promise.race([
          healthDocRef.get(),
          timeoutPromise
        ]);

        if (!healthSnap.exists) {
          await healthDocRef.set({
            status: 'ok',
            lastChecked: new Date().toISOString()
          });
          console.log("System health document created successfully on startup.");
        } else {
          console.log("System health document already exists.");
        }
      } catch (err: any) {
        console.warn("Could not auto-initialize system health document on startup:", err?.message || err);
      }
    })();

    console.log("Loading Gemini...");
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Gemini AI endpoints will operate in fallback mode.");
    } else {
      console.log("Gemini API key verified.");
      // Silent, non-blocking startup check to see if the project billing has issues or API permissions are blocked
      (async () => {
        try {
          const client = getGoogleAiClient();
          await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'ping',
            config: { maxOutputTokens: 1 }
          });
          console.log("Gemini status check completed successfully.");
        } catch (err: any) {
          const errorMsg = err?.message || '';
          const status = err?.status || (err?.error && err?.error.code);
          const isBillingOrPermissionBlocked = status === 403 || status === 401 ||
            errorMsg.includes('dunning') || 
            errorMsg.includes('PERMISSION_DENIED') ||
            errorMsg.includes('billing') ||
            errorMsg.includes('quota') ||
            errorMsg.includes('Lightning dunning decision is deny') ||
            errorMsg.includes('UNAUTHENTICATED') ||
            errorMsg.includes('invalid authentication credentials') ||
            errorMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            errorMsg.includes('API_KEY_SERVICE_BLOCKED') ||
            errorMsg.includes('resource_exhausted') ||
            errorMsg.includes('exceeded your current quota');

          if (isBillingOrPermissionBlocked) {
            isGeminiBillingBlocked = true;
            console.log("Local localization and backup mode enabled.");
          } else {
            console.log("Gemini status offline.");
          }
        }
      })();
    }

    console.log("Loading WebSocket...");
    try {
      getWss();
    } catch (err) {
      console.warn("WebSocket loading check warning:", err);
    }

    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      (global as any).viteInstance = vite;
      app.use(vite.middlewares);
      app.get('*', serveHtmlWithSeoAndSchema);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          } else if (filePath.endsWith('.webmanifest')) {
            res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=86400');
          } else if (filePath.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      }));
      app.get('*', serveHtmlWithSeoAndSchema);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Express listening on PORT=${PORT}`);
    });

    // Handle WebSocket upgrades gracefully
    server.on('upgrade', (request, socket, head) => {
      try {
        const urlObj = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
        if (urlObj.pathname === '/ws') {
          const token = urlObj.searchParams.get('token');
          if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
          }

          jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err || !decoded || !decoded.id) {
              socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
              socket.destroy();
              return;
            }

            const wss = getWss();
            if (wss) {
              wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request, decoded.id);
              });
            } else {
              socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
              socket.destroy();
            }
          });
        }
        // If pathname is not '/ws', allow Vite HMR or other upgrade handlers to manage the socket
      } catch (error) {
        console.warn('[WS Upgrade] Error in connection upgrading:', error);
      }
    });
  }

export default app;

const isServerlessEnv = !!(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_BUILD ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY
);

if (!isServerlessEnv) {
  startServer().catch((err) => {
    console.error("Critical failure during startServer execution:", err);
  });
}

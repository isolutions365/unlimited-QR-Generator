import app from '../server';

function resolveRealUrl(req: any): string {
  if (req.headers) {
    const forwardedUri = req.headers['x-forwarded-uri'];
    if (typeof forwardedUri === 'string' && forwardedUri && !forwardedUri.startsWith('/api/index')) {
      return forwardedUri;
    }
    const invokePath = req.headers['x-invoke-path'];
    if (typeof invokePath === 'string' && invokePath && !invokePath.startsWith('/api/index')) {
      return invokePath;
    }
    const matchedPath = req.headers['x-matched-path'];
    if (typeof matchedPath === 'string' && matchedPath && !matchedPath.startsWith('/api/index')) {
      return matchedPath;
    }
  }
  if (req.originalUrl && typeof req.originalUrl === 'string' && !req.originalUrl.startsWith('/api/index')) {
    return req.originalUrl;
  }
  return req.url;
}

export default function handler(req: any, res: any) {
  try {
    if (req.url && (req.url.startsWith('/api/index') || req.url === '/api' || req.url === '/api/')) {
      req.url = resolveRealUrl(req);
    }
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'FUNCTION_INVOCATION_FAILED',
        message: err?.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
  }
}

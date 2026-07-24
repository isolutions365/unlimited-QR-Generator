import app from '../server';

export default function handler(req: any, res: any) {
  if (req.url && (req.url.startsWith('/api/index') || req.url === '/api')) {
    if (req.headers && req.headers['x-matched-path']) {
      req.url = req.headers['x-matched-path'];
    } else if (req.originalUrl && req.originalUrl !== '/api/index') {
      req.url = req.originalUrl;
    }
  }
  return app(req, res);
}


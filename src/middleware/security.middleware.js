import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      default:
        limit = 5;
        break;
    }

    const client = aj.withRule(slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: limit,
    }));

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()){
      logger.warn('Bot request blocked', {ip: req.ip, userAgent: req.get('User-Agent'), path: req.path});
      return res.status(403).json({ error: 'Access denied for bots' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Request blocked by shield', {ip: req.ip, userAgent: req.get('User-Agent'), path: req.path, method: req.method});
      return res.status(403).json({ error: 'Access denied by security shield' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {ip: req.ip, userAgent: req.get('User-Agent'), path: req.path});
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    next();

  } catch (error) {
    console.error('Security middleware error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default securityMiddleware;
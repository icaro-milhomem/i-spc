import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/CacheService';

interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const cacheService = CacheService.getInstance();
  const { ttl, keyPrefix = 'cache:' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Não cachear requisições que não sejam GET
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${keyPrefix}${req.originalUrl}`;

    try {
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Intercepta a resposta original
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheService.set(cacheKey, data, ttl);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de cache:', error);
      next();
    }
  };
}; 
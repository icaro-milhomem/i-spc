import redis from '../config/redis';

class CacheService {
  private static instance: CacheService;
  private readonly defaultTTL: number = 3600; // 1 hora em segundos

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redis.set(key, serializedValue, 'EX', ttl);
    } catch (error) {
      console.error(`Erro ao definir cache para chave ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Erro ao deletar cache para chave ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      console.log(`[Cache] Tentando deletar cache com padrão: ${pattern}`);
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        console.log(`[Cache] Encontradas ${keys.length} chaves para deletar`);
        await redis.del(...keys);
        console.log(`[Cache] Cache deletado com sucesso para o padrão: ${pattern}`);
      } else {
        console.log(`[Cache] Nenhuma chave encontrada para o padrão: ${pattern}`);
      }
    } catch (error) {
      console.error(`[Cache] Erro ao deletar cache com padrão ${pattern}:`, error);
      // Não propaga o erro para não afetar a operação principal
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Erro ao verificar existência da chave ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await redis.flushall();
    } catch (error) {
      console.error('Erro ao limpar todo o cache:', error);
    }
  }
}

export default CacheService; 
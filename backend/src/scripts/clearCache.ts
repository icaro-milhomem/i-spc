import CacheService from '../services/CacheService';

async function clearCache() {
  try {
    const cacheService = CacheService.getInstance();
    await cacheService.flush();
    console.log('Cache limpo com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    process.exit(1);
  }
}

clearCache(); 
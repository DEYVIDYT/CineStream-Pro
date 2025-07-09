
const CACHE_PREFIX = 'cine_stream_';
const CACHE_KEYS = {
  LAST_UPDATED: `${CACHE_PREFIX}last_updated`,
  LIVE_CATEGORIES: `${CACHE_PREFIX}live_categories`,
  MOVIE_CATEGORIES: `${CACHE_PREFIX}movie_categories`,
  SERIES_CATEGORIES: `${CACHE_PREFIX}series_categories`,
  ALL_LIVE_STREAMS: `${CACHE_PREFIX}all_live_streams`,
  ALL_MOVIES: `${CACHE_PREFIX}all_movies`,
  ALL_SERIES: `${CACHE_PREFIX}all_series`,
};

// Helper to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Função para comprimir dados usando JSON.stringify com otimizações
const compressData = (data: any): string => {
  try {
    // Remove propriedades desnecessárias ou vazias para reduzir o tamanho
    const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
      // Remove propriedades vazias ou nulas
      if (value === null || value === undefined || value === '') {
        return undefined;
      }
      return value;
    }));
    
    return JSON.stringify(cleanData);
  } catch (e) {
    console.error('Erro ao comprimir dados:', e);
    return JSON.stringify(data);
  }
};

// Função para descomprimir dados
const decompressData = (dataString: string): any => {
  try {
    return JSON.parse(dataString);
  } catch (e) {
    console.error('Erro ao descomprimir dados:', e);
    return null;
  }
};

export const dataCache = {
  isCacheValid: (): boolean => {
    // Always return false to disable caching
    return false;
  },

  getData: <T,>(key: keyof typeof CACHE_KEYS): T | null => {
    // Always return null to disable caching
    return null;
  },

  saveData: <T,>(key: keyof typeof CACHE_KEYS, data: T) => {
    // Do nothing to disable saving data to cache
  },

  setCacheTimestamp: () => {
    // Do nothing to disable setting cache timestamp
  },

  clearCache: () => {
    // Do nothing to disable clearing cache
  },

  // Método para verificar o tamanho total do cache
  getCacheSize: (): number => {
    return 0; // Always return 0 to indicate no cache is being used
  },

  // Método para otimizar o cache removendo dados antigos se necessário
  optimizeCache: () => {
    // Do nothing to disable cache optimization
  },

  KEYS: CACHE_KEYS,
};




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

export const dataCache = {
  isCacheValid: (): boolean => {
    const lastUpdatedString = localStorage.getItem(CACHE_KEYS.LAST_UPDATED);
    if (!lastUpdatedString) return false;
    
    const lastUpdated = new Date(parseInt(lastUpdatedString, 10));
    const now = new Date();
    
    return isSameDay(lastUpdated, now);
  },

  getData: <T,>(key: keyof typeof CACHE_KEYS): T | null => {
    const dataString = localStorage.getItem(CACHE_KEYS[key]);
    if (!dataString) return null;
    try {
      return JSON.parse(dataString) as T;
    } catch (e) {
      console.error(`Failed to parse cache for key ${key}`, e);
      return null;
    }
  },

  saveData: <T,>(key: keyof typeof CACHE_KEYS, data: T) => {
    try {
      const dataString = JSON.stringify(data);
      localStorage.setItem(CACHE_KEYS[key], dataString);
    } catch(e) {
      console.error(`Failed to save cache for key ${key}, clearing cache.`, e);
      // Could be due to storage limit
      dataCache.clearCache();
    }
  },

  setCacheTimestamp: () => {
    localStorage.setItem(CACHE_KEYS.LAST_UPDATED, Date.now().toString());
  },

  clearCache: () => {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log("Cache cleared.");
  },

  KEYS: CACHE_KEYS,
};

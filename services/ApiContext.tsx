import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { XtremecodesApi } from './api';
import { LoginCredentials, Category, Stream } from '../types';
import { InitialLoadingScreen } from '../components/common/InitialLoadingScreen';
import { dataCache } from './dataCache';

interface ApiContextType {
  api: XtremecodesApi | null;
  credentials: LoginCredentials | null;
  liveCategories: Category[];
  movieCategories: Category[];
  seriesCategories: Category[];
  allLiveStreams: Stream[];
  allMovies: Stream[];
  allSeries: Stream[];
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<XtremecodesApi | null>(null);
  const [credentials, setCredentials] = useState<LoginCredentials | null>(null);
  
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadMessage, setPreloadMessage] = useState('Iniciando...');
  
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [movieCategories, setMovieCategories] = useState<Category[]>([]);
  const [seriesCategories, setSeriesCategories] = useState<Category[]>([]);
  const [allLiveStreams, setAllLiveStreams] = useState<Stream[]>([]);
  const [allMovies, setAllMovies] = useState<Stream[]>([]);
  const [allSeries, setAllSeries] = useState<Stream[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFromCache = (): boolean => {
        setPreloadMessage('Carregando biblioteca do cache...');
        
        // Otimizar cache antes de carregar
        dataCache.optimizeCache();
        
        const liveCats = dataCache.getData<Category[]>('LIVE_CATEGORIES');
        const movieCats = dataCache.getData<Category[]>('MOVIE_CATEGORIES');
        const seriesCats = dataCache.getData<Category[]>('SERIES_CATEGORIES');
        const live = dataCache.getData<Stream[]>('ALL_LIVE_STREAMS');
        const movies = dataCache.getData<Stream[]>('ALL_MOVIES');
        const series = dataCache.getData<Stream[]>('ALL_SERIES');

        // Check if all essential data is present in cache. If not, cache is considered invalid.
        if (!liveCats || !movieCats || !seriesCats || !live || !movies || !series) {
            console.log("Cache incompleto. Buscando novos dados.");
            return false;
        }

        setLiveCategories(liveCats);
        setMovieCategories(movieCats);
        setSeriesCategories(seriesCats);
        setAllLiveStreams(live);
        setAllMovies(movies);
        setAllSeries(series);
        
        const cacheSize = dataCache.getCacheSize();
        setPreloadMessage(`Biblioteca carregada do cache! (${cacheSize}KB)`);
        return true;
    };

    const fetchAndCacheAllData = async (apiInstance: XtremecodesApi) => {
        setPreloadMessage('Iniciando download da biblioteca...');
        dataCache.clearCache(); // Clear old/partial cache before fetching new data

        setPreloadMessage('Baixando dados... Aguarde, isso pode demorar um pouco.');
        
        // Usar o novo método otimizado que busca tudo em paralelo
        const allData = await apiInstance.getAllData();

        setPreloadMessage('Organizando e salvando biblioteca...');

        // Set application state all at once
        setLiveCategories(allData.liveCategories);
        setMovieCategories(allData.vodCategories);
        setSeriesCategories(allData.seriesCategories);
        setAllLiveStreams(allData.liveStreams);
        setAllMovies(allData.vodStreams);
        setAllSeries(allData.series);

        // Save fresh data to cache for next time
        dataCache.saveData('LIVE_CATEGORIES', allData.liveCategories);
        dataCache.saveData('ALL_LIVE_STREAMS', allData.liveStreams);
        dataCache.saveData('MOVIE_CATEGORIES', allData.vodCategories);
        dataCache.saveData('ALL_MOVIES', allData.vodStreams);
        dataCache.saveData('SERIES_CATEGORIES', allData.seriesCategories);
        dataCache.saveData('ALL_SERIES', allData.series);
        dataCache.setCacheTimestamp();

        setPreloadMessage('Biblioteca pronta!');
    };
      
    const loadInitialData = async () => {
      try {
        setPreloadMessage('Conectando ao servidor...');
        const apiInstance = new XtremecodesApi();
        const creds = await apiInstance.getCredentials();
        setApi(apiInstance);
        setCredentials(creds);

        // Check for valid cache from today. If not present or incomplete, fetch fresh data.
        if (dataCache.isCacheValid() && loadFromCache()) {
          console.log("Carregando dados do cache do navegador.");
        } else {
          console.log("Cache inválido ou expirado. Baixando novos dados.");
          await fetchAndCacheAllData(apiInstance);
        }

      } catch (e) {
        if (e instanceof Error) {
          setError(`Falha na inicialização: ${e.message}. Por favor, verifique sua conexão e a configuração do servidor.`);
        } else {
          setError('Ocorreu um erro desconhecido durante a inicialização.');
        }
      } finally {
        // Add a small delay to show the "Biblioteca pronta!" message
        setTimeout(() => setIsPreloading(false), 500);
      }
    };


    loadInitialData();
  }, []);

  if (isPreloading) {
    return <InitialLoadingScreen message={preloadMessage} />;
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <ApiContext.Provider value={{ api, credentials, liveCategories, movieCategories, seriesCategories, allLiveStreams, allMovies, allSeries }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
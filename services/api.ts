import { LoginCredentials, Category, Stream, VodInfo, SeriesInfo, Episode } from '../types';
import { invokeNative } from './androidBridge';

const GET_LOGIN_URL = 'http://mybrasiltv.x10.mx/GetLoguin.php';
const PROXY_URL = 'http://mybrasiltv.x10.mx/XC.php?url=';

// Check if the Android bridge is available at runtime
const isAndroid = typeof window.AndroidBridge?.makeApiRequest === 'function';

export class XtremecodesApi {
  private credentials: LoginCredentials | null = null;

  /**
   * Fetches credentials, either from the native bridge or a dedicated login endpoint.
   */
  private async initializeCredentials() {
    if (this.credentials) return;

    try {
        if (isAndroid) {
            // In Android, get credentials directly from the native shell
            const creds = await invokeNative<LoginCredentials>('get_credentials');
            this.credentials = creds;
        } else {
            // In a browser, fetch from the PHP endpoint
            const response = await fetch(GET_LOGIN_URL);
            if (!response.ok) {
                throw new Error(`Falha ao buscar credenciais: ${response.status} ${response.statusText}`);
            }
            
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error("Falha ao analisar o JSON de GetLoguin.php:", jsonError);
                console.error("Corpo da resposta:", responseText);
                throw new Error("A resposta do servidor de credenciais não é um JSON válido.");
            }

            const rawCredsData = Array.isArray(data) ? data[0] : data;

            if (!rawCredsData || !(rawCredsData.server || rawCredsData.url) || !(rawCredsData.username || rawCredsData.user) || !(rawCredsData.password || rawCredsData.pass)) {
                console.error("Dados de credenciais inválidos recebidos do servidor:", rawCredsData);
                throw new Error("Dados de credenciais inválidos ou ausentes recebidos do servidor.");
            }
            
            const creds: LoginCredentials = {
              id: rawCredsData.id,
              server: rawCredsData.server || rawCredsData.url,
              username: rawCredsData.username || rawCredsData.user,
              password: rawCredsData.password || rawCredsData.pass,
              added_at: rawCredsData.added_at || new Date().toISOString(),
              last_validated: rawCredsData.last_validated || new Date().toISOString(),
            };
            
            this.credentials = creds;
        }
    } catch(e) {
        console.error("Erro ao inicializar as credenciais:", e);
        if (e instanceof Error) {
            throw new Error(`Não foi possível carregar as credenciais do servidor: ${e.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido ao buscar as credenciais.");
    }
  }

  /**
   * Returns the user credentials, initializing them if necessary.
   */
  async getCredentials(): Promise<LoginCredentials> {
    if (!this.credentials) {
      await this.initializeCredentials();
    }
    // This non-null assertion is safe because initializeCredentials throws on failure.
    return this.credentials!;
  }

  /**
   * Makes a request to the Xtremecodes API, using the native bridge if available,
   * otherwise falling back to a web proxy.
   * @param action The API action to perform (e.g., 'get_live_categories').
   * @param params Additional parameters for the action.
   * @returns The JSON response from the API.
   */
  private async makeApiRequest<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    await this.initializeCredentials();
    const creds = this.credentials!;

    if (isAndroid) {
        // In Android, delegate the API call to the native shell.
        const apiParams = { action, ...params };
        
        // The native side expects 'player_api' as the main action, 
        // with the specific Xtremecodes action passed in the params.
        return invokeNative<T>('player_api', apiParams);
    } else {
        // In a browser, use the PHP proxy
        const targetUrl = new URL(`${creds.server}/player_api.php`);
        targetUrl.searchParams.append('username', creds.username);
        targetUrl.searchParams.append('password', creds.password);
        targetUrl.searchParams.append('action', action);

        for (const key in params) {
          targetUrl.searchParams.append(key, params[key]);
        }
        
        const encodedTargetUrl = encodeURIComponent(targetUrl.toString());
        const proxyUrl = `${PROXY_URL}${encodedTargetUrl}`;

        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Falha na requisição à API (via proxy): ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          return [] as T; // Return empty array for empty responses
        }

        try {
            const data = JSON.parse(text);
            // Handle auth response when data is expected, which can happen with invalid credentials
            if (data.user_info && data.server_info && !Array.isArray(data)) {
                if (action.includes('categories') || action.includes('streams') || action.includes('series')) {
                    // The API returned an auth object instead of an array, likely an error. Return empty.
                    return [] as T;
                }
            }
            return data as T;
        } catch (e) {
            console.error("Falha ao analisar o JSON da resposta do proxy:", text);
            throw new Error("A resposta da API (via proxy) não é um JSON válido.");
        }
    }
  }

  /**
   * Constructs an absolute URL for a resource if the path is relative.
   * @param path The relative or absolute path from the API.
   * @returns A full, valid URL or an empty string.
   */
  private fixUrl(path: string | null | undefined): string {
    if (!path || !this.credentials?.server) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    
    const serverUrl = this.credentials.server.endsWith('/') 
      ? this.credentials.server.slice(0, -1) 
      : this.credentials.server;
      
    const imageUrl = path.startsWith('/') ? path : `/${path}`;
    return `${serverUrl}${imageUrl}`;
  }

  /**
   * Applies fixUrl to an array of paths.
   */
  private fixUrlArray(paths: string[] | null | undefined): string[] {
      if (!paths) return [];
      return paths.map(p => this.fixUrl(p));
  }

  /**
   * Processes a single Stream object to fix its image URLs.
   */
  private processStream(stream: Stream): Stream {
      return {
          ...stream,
          stream_icon: this.fixUrl(stream.stream_icon),
          cover: this.fixUrl(stream.cover),
          backdrop_path: this.fixUrlArray(stream.backdrop_path),
      };
  }


  async getLiveCategories(): Promise<Category[]> {
    const data = await this.makeApiRequest<Category[] | any>('get_live_categories');
    return Array.isArray(data) ? data : [];
  }

  async getVodCategories(): Promise<Category[]> {
    const data = await this.makeApiRequest<Category[] | any>('get_vod_categories');
    return Array.isArray(data) ? data : [];
  }
  
  async getSeriesCategories(): Promise<Category[]> {
    const data = await this.makeApiRequest<Category[] | any>('get_series_categories');
    return Array.isArray(data) ? data : [];
  }

  async getLiveStreams(categoryId?: string): Promise<Stream[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    const data = await this.makeApiRequest<Stream[] | any>('get_live_streams', params);
    if (!Array.isArray(data)) return [];
    return data.map(stream => this.processStream(stream));
  }

  async getVodStreams(categoryId?: string): Promise<Stream[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    const data = await this.makeApiRequest<Stream[] | any>('get_vod_streams', params);
    if (!Array.isArray(data)) return [];
    return data.map(stream => this.processStream(stream));
  }
  
  async getSeries(categoryId?: string): Promise<Stream[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    const data = await this.makeApiRequest<Stream[] | any>('get_series', params);
    if (!Array.isArray(data)) return [];
    return data.map(stream => this.processStream(stream));
  }

  async getVodInfo(vodId: string): Promise<VodInfo> {
    const data = await this.makeApiRequest<VodInfo | VodInfo[]>('get_vod_info', { vod_id: vodId });
    const vodInfo = Array.isArray(data) ? data[0] : data;
    
    if (vodInfo) {
      if (vodInfo.info) {
          vodInfo.info.cover_big = this.fixUrl(vodInfo.info.cover_big);
          vodInfo.info.movie_image = this.fixUrl(vodInfo.info.movie_image);
          vodInfo.info.backdrop_path = this.fixUrlArray(vodInfo.info.backdrop_path);
      }
      if (vodInfo.movie_data) {
          vodInfo.movie_data = this.processStream(vodInfo.movie_data);
      }
    }

    return vodInfo;
  }
  
  async getSeriesInfo(seriesId: string): Promise<SeriesInfo> {
    const seriesInfo = await this.makeApiRequest<SeriesInfo>('get_series_info', { series_id: seriesId });
        
    if (seriesInfo) {
        if (seriesInfo.info) {
            seriesInfo.info = this.processStream(seriesInfo.info);
        }
        if (seriesInfo.seasons) {
            seriesInfo.seasons = seriesInfo.seasons.map(season => ({
                ...season,
                cover: this.fixUrl(season.cover),
                cover_big: this.fixUrl(season.cover_big),
            }));
        }
        if (seriesInfo.episodes) {
            for (const seasonNum in seriesInfo.episodes) {
                if (Object.prototype.hasOwnProperty.call(seriesInfo.episodes, seasonNum)) {
                    seriesInfo.episodes[seasonNum] = seriesInfo.episodes[seasonNum].map(ep => ({
                        ...ep,
                        info: {
                            ...ep.info,
                            movie_image: this.fixUrl(ep.info.movie_image),
                        }
                    }));
                }
            }
        }
    }
    
    return seriesInfo;
  }
}
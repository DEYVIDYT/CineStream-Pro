export interface LoginCredentials {
  id: string;
  server: string;
  username: string;
  password: string;
  added_at: string;
  last_validated: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface Stream {
  num: number;
  name: string;
  stream_type: 'movie' | 'live' | 'series';
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string | null;
  added: string;
  category_id: string;
  rating: number;
  rating_5based: number;
  backdrop_path: string[];
  title?: string; // For series
  cover?: string; // For series
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  last_modified?: string;
  youtube_trailer?: string;
  episode_run_time?: string;
  tmdb_id?: string;
}

export interface VodInfo {
  movie_data: Stream;
  info: {
    kinopoisk_url: string;
    tmdb_id: string;
    name: string;
    o_name: string;
    cover_big: string;
    movie_image: string;
    releasedate: string;
    episode_run_time: string;
    youtube_trailer: string;
    director: string;
    actors: string;
    cast: string;
    description: string;
    plot: string;
    age: string;
    mpaa_rating: string;
    rating_count_kinopoisk: number;
    country: string;
    genre: string;
    backdrop_path: string[];
    duration_secs: number;
    duration: string;
    rating: number;
    rating_5based: number;
  };
}

export interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    tmdb_id: number;
    releasedate: string;
    plot: string;
    duration_secs: number;
    duration: string;
    movie_image: string;
    name: string;
    o_name: string;
    rating: number;
  };
  added: string;
  season: number;
  direct_source: string;
}

export interface SeriesInfo {
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    season_number: number;
    cover: string;
    cover_big: string;
  }[];
  info: Stream;
  episodes: { [season: string]: Episode[] };
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApi } from '../services/ApiContext';
import { Stream } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useFocusable } from '../components/tv/FocusManager';

// Simple debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// A generic focusable result item
const FocusableResultLink: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
}> = ({ to, children, className }) => {
    const navigate = useNavigate();
    const { ref, isFocused } = useFocusable<HTMLDivElement>({ onEnterPress: () => navigate(to) });

    return (
        <div
            ref={ref}
            tabIndex={-1}
            onClick={() => navigate(to)}
            className={`${className} ${isFocused ? 'focused' : ''}`}
        >
            {children}
        </div>
    );
};

// Focusable Input for TV navigation
const FocusableInput: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}> = ({ value, onChange, placeholder }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { ref, isFocused } = useFocusable<HTMLDivElement>({
        onEnterPress: () => inputRef.current?.focus(),
        onArrowPress: (direction) => {
            if (direction === 'ArrowUp') return true; // Trap focus going up
            if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
                 // Allow default behavior for text editing
                return true;
            }
            // Allow down arrow to navigate away
            return false;
        }
    });

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div ref={ref} tabIndex={-1} className={`p-1 rounded-lg ${isFocused ? 'focused' : ''}`}>
            <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 bg-surface rounded-lg text-on-surface placeholder-on-surface-variant focus:outline-none"
            />
        </div>
    );
};


const SearchPage: React.FC = () => {
    const { allMovies, allSeries, allLiveStreams } = useApi();
    const navigate = useNavigate();
    
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [isSearching, setIsSearching] = useState(false);

    const searchResults = useMemo(() => {
        if (!debouncedQuery) {
            return { movies: [], series: [], live: [] };
        }

        const lowercasedQuery = debouncedQuery.toLowerCase();
        
        const filterFn = (stream: Stream) => (stream.name || stream.title || '').toLowerCase().includes(lowercasedQuery);

        return {
            movies: allMovies.filter(filterFn),
            series: allSeries.filter(filterFn),
            live: allLiveStreams.filter(filterFn),
        };

    }, [debouncedQuery, allMovies, allSeries, allLiveStreams]);

    useEffect(() => {
        setIsSearching(query !== debouncedQuery);
    }, [query, debouncedQuery]);


    const { movies, series, live } = searchResults;
    const hasResults = movies.length > 0 || series.length > 0 || live.length > 0;

    return (
        <div className="p-4 flex flex-col h-full bg-background">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Buscar</h1>
            <div className="sticky top-0 bg-background z-10 py-2">
                <FocusableInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busque por filmes, séries, canais..."
                />
            </div>
            
            <div className="flex-grow overflow-y-auto mt-4 scrollbar-hide">
                {isSearching && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
                
                {!isSearching && debouncedQuery && !hasResults && (
                    <div className="text-center text-on-surface-variant py-8">
                        <p>Nenhum resultado encontrado para "{debouncedQuery}"</p>
                    </div>
                )}
                
                {!isSearching && !debouncedQuery && (
                     <div className="text-center text-on-surface-variant py-8">
                        <p>Digite algo para começar a buscar.</p>
                    </div>
                )}

                {!isSearching && hasResults && (
                    <div className="space-y-6">
                        {live.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-on-surface mb-3">Canais Ao Vivo</h2>
                                <div className="space-y-2">
                                    {live.slice(0, 10).map(stream => (
                                        <FocusableResultLink key={`live-${stream.stream_id}`} to={`/player/live/${stream.stream_id}`} className="block group">
                                            <div className="w-full flex items-center p-3 text-left bg-surface rounded-lg hover:bg-white/10 transition-colors duration-200">
                                                <img src={stream.stream_icon} alt={stream.name} className="w-12 h-12 rounded-md bg-surface object-contain mr-3 flex-shrink-0" />
                                                <p className="text-on-surface font-semibold truncate">{stream.name}</p>
                                            </div>
                                        </FocusableResultLink>
                                    ))}
                                </div>
                            </section>
                        )}
                        {movies.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-on-surface mb-3">Filmes</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                     {movies.slice(0, 12).map(item => (
                                         <FocusableResultLink to={`/details/movie/${item.stream_id}`} key={`movie-${item.stream_id}`} className="block group">
                                            <img src={item.stream_icon} alt={item.name} className="w-full h-auto aspect-[2/3] object-cover rounded-lg bg-surface transition-transform" />
                                            <p className="text-sm text-on-surface font-semibold truncate mt-2 group-hover:text-primary">{item.name}</p>
                                         </FocusableResultLink>
                                     ))}
                                </div>
                            </section>
                        )}
                        {series.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-on-surface mb-3">Séries</h2>
                               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                     {series.slice(0, 12).map(item => (
                                         <FocusableResultLink to={`/details/series/${item.stream_id}`} key={`series-${item.stream_id}`} className="block group">
                                            <img src={item.cover || item.stream_icon} alt={item.title || item.name} className="w-full h-auto aspect-[2/3] object-cover rounded-lg bg-surface transition-transform" />
                                            <p className="text-sm text-on-surface font-semibold truncate mt-2 group-hover:text-primary">{item.title || item.name}</p>
                                         </FocusableResultLink>
                                     ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
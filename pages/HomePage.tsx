import React, { useState, useEffect } from 'react';
import { useApi } from '../services/ApiContext';
import { Stream } from '../types';
import ContentCarousel from '../components/common/ContentCarousel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import HeroBanner from '../components/common/HeroBanner';

const HomePage: React.FC = () => {
    const { movieCategories, seriesCategories, allMovies, allSeries } = useApi();
    const [heroItem, setHeroItem] = useState<Stream | null>(null);

    useEffect(() => {
        if (allMovies.length > 0) {
            const itemWithBackdrop = allMovies.find(s => s.backdrop_path && s.backdrop_path.length > 0 && s.backdrop_path[0]);
            setHeroItem(itemWithBackdrop || allMovies[Math.floor(Math.random() * allMovies.length)]);
        }
    }, [allMovies]);
    
    const getStreamsForCategory = (categoryId: string, type: 'movie' | 'series') => {
        const source = type === 'movie' ? allMovies : allSeries;
        return source.filter(stream => stream.category_id === categoryId).slice(0, 15);
    }

    if (!heroItem) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    const filteredMovieCategories = movieCategories.filter(c => c.category_name !== 'Recently Added Movies');

    return (
        <div className="bg-background">
            <HeroBanner item={heroItem} />
            <div className="py-4">
                {filteredMovieCategories.slice(0, 5).map(cat => (
                    <ContentCarousel 
                        key={`movie-${cat.category_id}`} 
                        title={cat.category_name} 
                        items={getStreamsForCategory(cat.category_id, 'movie')}
                    />
                ))}
                {seriesCategories.slice(0, 5).map(cat => (
                     <ContentCarousel 
                        key={`series-${cat.category_id}`} 
                        title={cat.category_name} 
                        items={getStreamsForCategory(cat.category_id, 'series')}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;

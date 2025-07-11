import React, { useState, useEffect } from 'react';
import { useApi } from '../../services/ApiContext';
import { Stream } from '../../types';
import ContentCarousel from '../../components/common/ContentCarousel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import HeroBanner from '../../components/common/HeroBanner';

const TvHomePage: React.FC = () => {
    const { movieCategories, seriesCategories, allMovies, allSeries } = useApi();
    const [heroItem, setHeroItem] = useState<Stream | null>(null);

    useEffect(() => {
        if (allMovies.length > 0 || allSeries.length > 0) {
            const allContent = [...allMovies, ...allSeries];
            // Find a movie with a good backdrop
            const popularContent = allContent.sort((a,b) => b.rating_5based - a.rating_5based);
            const itemWithBackdrop = popularContent.find(s => s.backdrop_path && s.backdrop_path.length > 0 && s.backdrop_path[0]);
            setHeroItem(itemWithBackdrop || popularContent[0] || null);
        }
    }, [allMovies, allSeries]);
    
    const getStreamsForCategory = (categoryId: string, type: 'movie' | 'series') => {
        const source = type === 'movie' ? allMovies : allSeries;
        return source.filter(stream => stream.category_id === categoryId).slice(0, 20); // More items for TV
    }

    if (!heroItem) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    const filteredMovieCategories = movieCategories.filter(c => c.category_name !== 'Recently Added Movies');

    return (
        <div className="bg-background">
            <HeroBanner item={heroItem} />
            <div className="py-4 lg:py-8">
                {filteredMovieCategories.slice(0, 8).map(cat => (
                    <ContentCarousel 
                        key={`movie-${cat.category_id}`} 
                        title={cat.category_name} 
                        items={getStreamsForCategory(cat.category_id, 'movie')}
                    />
                ))}
                {seriesCategories.slice(0, 8).map(cat => (
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

export default TvHomePage;

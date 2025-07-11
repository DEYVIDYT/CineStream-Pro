import React, { useState, useEffect } from 'react';
import { useApi } from '../services/ApiContext';
import { Stream } from '../types';
import ContentCarousel from '../components/common/ContentCarousel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import HeroBanner from '../components/common/HeroBanner';
import TelegramInviteDialog from '../components/common/TelegramInviteDialog';
import TelegramNotificationBanner from '../components/common/TelegramNotificationBanner';

const TELEGRAM_DIALOG_SEEN_KEY = 'telegramDialogSeen_v1'; // v1 to allow reset if needed
const TELEGRAM_BANNER_DISMISSED_KEY = 'telegramBannerDismissed_v1';

const HomePage: React.FC = () => {
    const { movieCategories, seriesCategories, allMovies, allSeries, isLoading } = useApi();
    const [heroItem, setHeroItem] = useState<Stream | null>(null);
    const [isTelegramDialogVisible, setIsTelegramDialogVisible] = useState(false);
    const [isTelegramBannerVisible, setIsTelegramBannerVisible] = useState(false);

    useEffect(() => {
        if (!isLoading && allMovies.length > 0) {
            const itemWithBackdrop = allMovies.find(s => s.backdrop_path && s.backdrop_path.length > 0 && s.backdrop_path[0]);
            setHeroItem(itemWithBackdrop || allMovies[Math.floor(Math.random() * allMovies.length)]);
        }
    }, [allMovies, isLoading]);

    useEffect(() => {
        // Check localStorage for dialog
        const dialogSeen = localStorage.getItem(TELEGRAM_DIALOG_SEEN_KEY);
        if (!dialogSeen) {
            setIsTelegramDialogVisible(true);
        } else {
            // If dialog has been seen, check if banner should be visible
            const bannerDismissed = localStorage.getItem(TELEGRAM_BANNER_DISMISSED_KEY);
            if (!bannerDismissed) {
                setIsTelegramBannerVisible(true);
            }
        }
    }, []);

    const handleCloseTelegramDialog = () => {
        setIsTelegramDialogVisible(false);
        localStorage.setItem(TELEGRAM_DIALOG_SEEN_KEY, 'true');
        // Show banner immediately after dialog is closed, if not already dismissed
        const bannerDismissed = localStorage.getItem(TELEGRAM_BANNER_DISMISSED_KEY);
        if (!bannerDismissed) {
            setIsTelegramBannerVisible(true);
        }
    };

    const handleDismissTelegramBanner = () => {
        setIsTelegramBannerVisible(false);
        localStorage.setItem(TELEGRAM_BANNER_DISMISSED_KEY, 'true');
    };
    
    const getStreamsForCategory = (categoryId: string, type: 'movie' | 'series') => {
        const source = type === 'movie' ? allMovies : allSeries;
        return source.filter(stream => stream.category_id === categoryId).slice(0, 15);
    }

    if (isLoading && !heroItem) { // Show loading spinner if API is loading and no hero item yet
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!isLoading && !heroItem && allMovies.length === 0 && allSeries.length === 0) {
        // This case might indicate an issue with data fetching or empty data
        return <div className="h-full flex items-center justify-center text-on-surface-variant">Nenhum conteúdo encontrado. Verifique sua conexão ou as configurações da API.</div>;
    }


    const filteredMovieCategories = movieCategories.filter(c => c.category_name !== 'Recently Added Movies');

    return (
        <div className="bg-background">
            <TelegramInviteDialog isOpen={isTelegramDialogVisible} onClose={handleCloseTelegramDialog} />
            <TelegramNotificationBanner isVisible={isTelegramBannerVisible} onDismiss={handleDismissTelegramBanner} />

            {heroItem && <HeroBanner item={heroItem} />}

            <div className={`py-4 ${isTelegramBannerVisible ? 'pt-16' : ''}`}> {/* Adjust padding if banner is visible */}
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

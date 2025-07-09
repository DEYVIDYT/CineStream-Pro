import React from 'react';
import { Stream } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useFocusable } from '../tv/FocusManager';

interface HeroBannerProps {
    item: Stream;
}

const FocusableButton: React.FC<{ to: string, children: React.ReactNode, className?: string }> = ({ to, children, className }) => {
    const navigate = useNavigate();
    const { ref, isFocused } = useFocusable<HTMLButtonElement>({
        onEnterPress: () => navigate(to)
    });

    return (
        <button
            ref={ref}
            tabIndex={-1}
            onClick={() => navigate(to)}
            className={`${className} ${isFocused ? 'focused' : ''}`}
        >
            {children}
        </button>
    );
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ item }) => {
    const backdrop = item.backdrop_path?.[0] || '';
    const title = item.title || item.name;
    const type = item.stream_type === 'movie' ? 'movie' : 'series';

    // For series, this links to the player which will auto-play the first episode.
    const playerLink = `/player/${type}/${item.stream_id}`;

    return (
        <div className="relative h-96 md:h-[550px] w-full">
            {backdrop ? (
                <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-surface"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 md:p-8 lg:p-12 w-full">
                <h1 className="text-3xl md:text-5xl font-bold text-on-surface">{title}</h1>
                <p className="text-sm md:text-base text-on-surface-variant mt-2">{item.genre || 'Ação • Aventura • Fantasia'}</p>
                <div className="flex items-center space-x-4 mt-6">
                    <FocusableButton 
                        to={playerLink} 
                        className="flex items-center justify-center bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" className="mr-2"><path d="M8 5v14l11-7z"/></svg>
                        Reproduzir
                    </FocusableButton>
                     <FocusableButton 
                        to={`/details/${type}/${item.stream_id}`} 
                        className="flex items-center justify-center bg-white/20 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/30 focus:outline-none transition-colors"
                    >
                        Mais Informações
                    </FocusableButton>
                </div>
            </div>
        </div>
    );
}

export default HeroBanner;
import React from 'react';
import { Stream } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useFocusable } from '../tv/FocusManager';

interface MovieCardProps {
  item: Stream;
}

const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
    const navigate = useNavigate();
    const type = item.stream_type === 'movie' ? 'movie' : 'series';

    const handleNavigation = () => {
      if (type === 'series') {
        navigate(`/series/${item.stream_id}`);
      } else {
        navigate(`/details/${type}/${item.stream_id}`);
      }
    };

    const { ref, isFocused } = useFocusable<HTMLDivElement>({
      onEnterPress: handleNavigation
    });
    
    const title = item.title || item.name;
    const cover = item.cover || item.stream_icon;

    return (
        <div 
            ref={ref}
            tabIndex={-1}
            onClick={handleNavigation}
            className={`flex-shrink-0 w-32 md:w-36 snap-start group relative transition-transform duration-200 ${isFocused ? 'focused' : ''}`}>
            <div className="overflow-hidden rounded-lg bg-surface shadow-lg">
                <img 
                    src={cover} 
                    alt={title} 
                    className="w-full h-48 md:h-54 object-cover bg-surface" 
                />
                <div className="p-2">
                    <h3 className="text-sm text-on-surface font-semibold truncate group-hover:text-primary">{title}</h3>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
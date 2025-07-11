import React from 'react';
import { Stream } from '../../types';
import MovieCard from './MovieCard';

interface ContentCarouselProps {
  title: string;
  items: Stream[];
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, items }) => {
  if (!items || items.length === 0) {
      return null;
  }

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold text-on-surface px-4 mb-3">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {items.map((item) => (
          <MovieCard key={`${item.stream_id}-${item.name}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ContentCarousel;

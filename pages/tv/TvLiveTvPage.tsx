import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../services/ApiContext';
import { Category, Stream } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useFocusable } from '../../components/tv/FocusManager';
import VideoPlayer from '../../components/common/VideoPlayer';
import { useTvLayout } from '../../contexts/TvLayoutContext';

// A focusable component tailored for this page's needs.
const FocusableItem: React.FC<{
  onEnter: () => void;
  onFocus?: () => void;
  onArrowPress?: (direction: string) => boolean;
  children: React.ReactNode;
  isCurrent?: boolean;
  className?: string;
}> = ({ onEnter, onFocus, onArrowPress, children, isCurrent, className }) => {
  const { ref, isFocused } = useFocusable<HTMLDivElement>({
    onEnterPress: onEnter,
    onArrowPress: (direction, event) => {
      if (onArrowPress) {
        return onArrowPress(direction);
      }
      return false; // Allow default behavior
    },
  });

  useEffect(() => {
    if (isFocused && onFocus) {
      onFocus();
    }
  }, [isFocused, onFocus]);
  
  const finalClassName = `${className} ${isFocused ? 'bg-brand-red text-white' : isCurrent ? 'bg-brand-red text-white' : ''}`;
  
  return (
    <div
      ref={ref}
      tabIndex={-1}
      onClick={onEnter}
      className={finalClassName}
    >
      {children}
    </div>
  );
};


const TvLiveTvPage: React.FC = () => {
  const { credentials, liveCategories, allLiveStreams } = useApi();
  const { isSidebarVisible, setSidebarVisible } = useTvLayout();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [playingStream, setPlayingStream] = useState<Stream | null>(null);
  const [focusedStream, setFocusedStream] = useState<Stream | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(true);

  // Animate sidebar out on mount, and back in on unmount.
  useEffect(() => {
    const timer = setTimeout(() => setSidebarVisible(false), 100);
    return () => {
      clearTimeout(timer);
      setSidebarVisible(true);
    };
  }, [setSidebarVisible]);

  const categories = useMemo(() => {
    const allCat: Category = { category_id: 'all', category_name: 'TODO', parent_id: 0 };
    const favCat: Category = { category_id: 'favs', category_name: 'LISTA DE FAVORITOS', parent_id: 0 };
    const filteredLiveCategories = liveCategories.filter(c => c.category_name !== "Canais Adultos");
    return [allCat, favCat, ...filteredLiveCategories];
  }, [liveCategories]);

  const streamsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory.category_id === 'all') return allLiveStreams;
    if (selectedCategory.category_id === 'favs') return []; // Favorites not yet implemented
    return allLiveStreams.filter(s => s.category_id === selectedCategory.category_id);
  }, [selectedCategory, allLiveStreams]);

  // Effect to set initial category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const initialCategory = categories.find(c => c.category_name === '4K') || categories[0];
      setSelectedCategory(initialCategory);
    }
  }, [categories, selectedCategory]);
  
  // Effect to update playing stream when category changes
  useEffect(() => {
    if (selectedCategory && streamsForCategory.length > 0) {
        setPlayingStream(streamsForCategory[0]);
    } else if (selectedCategory && streamsForCategory.length === 0) {
        setPlayingStream(null); // Stop player if category is empty
    }
  }, [selectedCategory, streamsForCategory]);

  // Handle keyboard events to show/hide the guide and sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // When the guide is HIDDEN, only 'Enter' brings it back.
      if (!isGuideVisible) {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          setIsGuideVisible(true);
        }
        return; // Ignore other keys
      }

      // When the guide is VISIBLE
      if (e.key === 'Backspace' || e.key === 'Escape') {
        // If the main sidebar is visible, don't hide the guide.
        // Let the default 'back' action (from FocusManager) happen.
        if (isSidebarVisible) {
          return;
        }

        // Otherwise, hide the guide.
        e.preventDefault();
        e.stopPropagation();
        setIsGuideVisible(false);
      }
    };

    // Use capture=true to run before FocusManager
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isGuideVisible, isSidebarVisible, setIsGuideVisible]);


  const streamUrl = useMemo(() => {
    if (playingStream && credentials) {
      return `${credentials.server}/live/${credentials.username}/${credentials.password}/${playingStream.stream_id}.m3u8`;
    }
    return '';
  }, [playingStream, credentials]);
  
  const focusedStreamIndex = useMemo(() => {
    if (!focusedStream || streamsForCategory.length === 0) return -1;
    return streamsForCategory.findIndex(s => s.stream_id === focusedStream.stream_id);
  }, [focusedStream, streamsForCategory]);

  if (liveCategories.length === 0) {
    return <div className="w-screen h-screen flex items-center justify-center bg-black"><LoadingSpinner /></div>;
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <style>{`.guide-container .focused { box-shadow: none; transform: none; }`}</style>
      
      {/* Background Player */}
      <div className="absolute inset-0 z-0">
        {streamUrl ? <VideoPlayer src={streamUrl} /> : <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}
      </div>

      {/* Guide overlay */}
      <div className={`guide-container absolute inset-0 z-20 flex transition-opacity duration-300 ease-in-out ${isGuideVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
           style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.80) 40%, rgba(0,0,0,0.60) 60%, rgba(0,0,0,0.0) 100%)' }}>
          
          {/* Categories */}
          <aside className="w-[300px] flex-shrink-0 pt-8 overflow-y-auto scrollbar-hide">
            <nav className="flex flex-col space-y-1 p-4">
              {categories.map(cat => (
                <FocusableItem
                  key={cat.category_id}
                  onEnter={() => setSelectedCategory(cat)}
                  isCurrent={selectedCategory?.category_id === cat.category_id}
                  className="w-full text-left text-lg font-semibold transition-colors duration-150 rounded-md p-3 text-gray-300 hover:bg-white/10 focus:outline-none"
                  onArrowPress={(direction) => {
                      if (direction === 'ArrowLeft') {
                          setSidebarVisible(true);
                          return false; // Allow focus to move to the new sidebar
                      }
                      return false;
                  }}
                >
                  {cat.category_name}
                </FocusableItem>
              ))}
            </nav>
          </aside>

          {/* Channels */}
          <main className="w-[520px] flex-shrink-0 flex flex-col overflow-hidden">
            <header className="px-6 pt-8 pb-4 flex justify-between items-center text-gray-300">
                <h2 className="text-xl font-bold">{selectedCategory?.category_name}</h2>
                {focusedStreamIndex !== -1 && (
                    <span>{focusedStreamIndex + 1}/{streamsForCategory.length}</span>
                )}
            </header>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {streamsForCategory.map(stream => (
                <FocusableItem
                  key={stream.stream_id}
                  onEnter={() => {
                      setPlayingStream(stream);
                      setIsGuideVisible(false);
                  }}
                  onFocus={() => setFocusedStream(stream)}
                  className="flex items-center space-x-4 p-3 m-2 rounded-md transition-colors duration-150 focus:outline-none"
                >
                    <span className="w-12 text-gray-400 text-lg font-mono text-left">{String(stream.num).padStart(3, '0')}</span>
                    <div className="w-24 h-10 flex items-center justify-center">
                        <img src={stream.stream_icon} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="flex-1 font-semibold text-lg text-gray-100 text-left">{stream.name}</span>
                </FocusableItem>
              ))}
            </div>
          </main>
      </div>
    </div>
  );
};

export default TvLiveTvPage;
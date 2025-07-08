import React, { useState, useEffect } from 'react';
import { useApi } from '../services/ApiContext';
import { Category, Stream } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import VideoPlayer from '../components/common/VideoPlayer';

const LiveTvPage: React.FC = () => {
  const { credentials, liveCategories, allLiveStreams } = useApi();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const categories = liveCategories.filter(c => c.category_name !== "Canais Adultos");

  // Set initial category
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  
  // Filter streams when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filteredStreams = allLiveStreams.filter(s => s.category_id === selectedCategory.category_id);
      setStreams(filteredStreams);
    } else {
        setStreams([]);
    }
  }, [selectedCategory, allLiveStreams]);

  const handleCategoryClick = (category: Category) => {
    if (selectedCategory?.category_id !== category.category_id) {
        setSelectedCategory(category);
    }
  };

  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream);
  };

  const streamUrl = selectedStream && credentials
    ? `${credentials.server}/live/${credentials.username}/${credentials.password}/${selectedStream.stream_id}.m3u8`
    : '';

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="w-full aspect-video bg-black sticky top-0 z-20">
        {streamUrl ? (
          <VideoPlayer src={streamUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-black">
            <p>Selecione um canal para reproduzir</p>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow overflow-hidden">
        <header className="p-4 bg-surface">
          <h1 className="text-2xl font-bold text-on-surface">TV Ao Vivo</h1>
        </header>
        {categories.length === 0 ? (
          <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="flex flex-grow overflow-hidden">
            <aside className="w-1/3 bg-background overflow-y-auto scrollbar-hide border-r border-white/10">
              <ul>
                {categories.map((cat) => (
                  <li key={cat.category_id}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left p-4 text-sm font-medium transition-colors duration-200 ${selectedCategory?.category_id === cat.category_id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface'}`}
                    >
                      {cat.category_name}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <main className="w-2/3 overflow-y-auto scrollbar-hide">
              {streams.length > 0 ? (
                <ul>
                  {streams.map((stream) => (
                    <li key={stream.stream_id}>
                      <button onClick={() => handleStreamSelect(stream)} className={`w-full flex items-center p-3 text-left hover:bg-surface transition-colors duration-200 border-b border-white/5 ${selectedStream?.stream_id === stream.stream_id ? 'bg-surface' : ''}`}>
                        <img
                          src={stream.stream_icon}
                          alt={stream.name}
                          className="w-12 h-12 rounded-md bg-surface object-contain mr-3 flex-shrink-0"
                        />
                        <div className="flex-grow overflow-hidden">
                          <p className="text-on-surface font-semibold truncate">{stream.name}</p>
                        </div>
                        {selectedStream?.stream_id === stream.stream_id && (
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="currentColor" className="text-primary flex-shrink-0 animate-pulse"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant p-4 text-center">
                    <p>Nenhum canal encontrado nesta categoria.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTvPage;
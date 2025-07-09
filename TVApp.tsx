import React from 'react';
import { Routes, Route } from 'react-router-dom';

import TvSidebar from './components/tv/TvSidebar';
import TvHomePage from './pages/tv/TvHomePage';
import DetailsPage from './pages/DetailsPage';
import PlayerPage from './pages/PlayerPage';
import TvLiveTvPage from './pages/tv/TvLiveTvPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import { useTvLayout } from './contexts/TvLayoutContext';


const TVApp: React.FC = () => {
  const { isSidebarVisible } = useTvLayout();

  return (
    <div className="h-screen w-screen bg-background font-sans flex text-on-surface overflow-hidden">
      <TvSidebar />
      <main className={`flex-grow overflow-y-auto scrollbar-hide transition-all duration-300 ease-in-out ${isSidebarVisible ? 'ml-20' : 'ml-0'}`}>
          <Routes>
              <Route path="/" element={<TvHomePage />} />
              <Route path="/live" element={<TvLiveTvPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/details/:type/:id" element={<DetailsPage />} />
              <Route path="/player/:type/:id"element={<PlayerPage />} />
          </Routes>
      </main>
    </div>
  );
};

export default TVApp;

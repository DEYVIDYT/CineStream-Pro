import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LiveTvPage from './pages/LiveTvPage';
import MovieDetailsPage from './pages/MovieDetailsPage'; // Renomeado de DetailsPage
import SeriesDetailsPage from './pages/SeriesDetailsPage';
import PlayerPage from './pages/PlayerPage';
import BottomNav from './components/layout/BottomNav';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import { ApiProvider } from './services/ApiContext';
import { PlayerProvider } from './contexts/PlayerContext';

const MobileApp: React.FC = () => {
    const location = useLocation();
    const noNavRoutes = ['/player'];

    return (
        <div className="h-screen w-screen max-w-md mx-auto bg-background font-sans flex flex-col overflow-hidden">
            <main className="flex-grow overflow-y-auto scrollbar-hide">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/live" element={<LiveTvPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/movie/:id" element={<MovieDetailsPage />} /> {/* Rota atualizada para filmes */}
                    <Route path="/series/:id" element={<SeriesDetailsPage />} />
                    <Route path="/player/:type/:id" element={<PlayerPage />} /> {/* PlayerPage ainda pode precisar do 'type' */}
                </Routes>
            </main>
            {!noNavRoutes.some(path => location.pathname.startsWith(path)) && <BottomNav />}
        </div>
    );
};

const AppContent: React.FC = () => {
    // Always render MobileApp directly
    return <MobileApp />;
};

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <ApiProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </ApiProvider>
    </PlayerProvider>
  );
};

export default App;


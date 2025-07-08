import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LiveTvPage from './pages/LiveTvPage';
import DetailsPage from './pages/DetailsPage';
import PlayerPage from './pages/PlayerPage';
import BottomNav from './components/layout/BottomNav';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import { ApiProvider } from './services/ApiContext';
import TVApp from './TVApp';
import PlatformSelectionPage from './pages/PlatformSelectionPage';
import { FocusProvider } from './components/tv/FocusManager';
import { TvLayoutProvider } from './contexts/TvLayoutContext';

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
                    <Route path="/details/:type/:id" element={<DetailsPage />} />
                    <Route path="/player/:type/:id" element={<PlayerPage />} />
                </Routes>
            </main>
            {!noNavRoutes.some(path => location.pathname.startsWith(path)) && <BottomNav />}
        </div>
    );
};

const AppContent: React.FC = () => {
    const [platform, setPlatform] = useState<'mobile' | 'tv' | null>(() => {
        return localStorage.getItem('platform_preference') as 'mobile' | 'tv' | null;
    });

    if (platform === 'mobile') {
        return <MobileApp />;
    }

    if (platform === 'tv') {
        // For the TV App, nest FocusProvider inside TvLayoutProvider
        // so the focus system can be aware of the sidebar's state.
        return (
            <TvLayoutProvider>
                <FocusProvider>
                    <TVApp />
                </FocusProvider>
            </TvLayoutProvider>
        );
    }

    // For the Platform Selection screen, just wrap with FocusProvider.
    return (
        <FocusProvider>
            <PlatformSelectionPage onSelectPlatform={setPlatform} />
        </FocusProvider>
    );
};


const App: React.FC = () => {
  return (
    <ApiProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ApiProvider>
  );
};

export default App;
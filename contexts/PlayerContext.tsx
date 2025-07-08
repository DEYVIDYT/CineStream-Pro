import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export type PlayerType = 'default' | 'secondary';

interface PlayerContextType {
  playerType: PlayerType;
  setPlayerType: (playerType: PlayerType) => void;
  togglePlayerType: () => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const LOCAL_STORAGE_PLAYER_KEY = 'cineStreamPlayerPreference';

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerType, setPlayerTypeState] = useState<PlayerType>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY) as PlayerType | null;
    if (storedPreference) {
      setPlayerTypeState(storedPreference);
    }
    setIsInitialized(true);
  }, []);

  const setPlayerType = useCallback((newPlayerType: PlayerType) => {
    if (isInitialized) {
      setPlayerTypeState(newPlayerType);
      localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, newPlayerType);
    }
  }, [isInitialized]);

  const togglePlayerType = useCallback(() => {
    if (isInitialized) {
      setPlayerTypeState(prevType => {
        const newType = prevType === 'default' ? 'secondary' : 'default';
        localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, newType);
        return newType;
      });
    }
  }, [isInitialized]);

  // Prevent rendering children until the preference is loaded to avoid UI flicker or incorrect initial state
  if (!isInitialized) {
    return null; // Or a loading spinner, but null is fine for context initialization
  }

  return (
    <PlayerContext.Provider value={{ playerType, setPlayerType, togglePlayerType }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

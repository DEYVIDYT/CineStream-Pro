import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export type PlayerType = 'default' | 'secondary';

interface PlayerContextType {
  playerType: PlayerType;
  setPlayerType: (playerType: PlayerType) => void;
  togglePlayerType: () => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const LOCAL_STORAGE_PLAYER_KEY = 'cineStreamPlayerPreference';

const getInitialPlayerType = (): PlayerType => {
  const storedPreference = localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY) as PlayerType | null;
  return storedPreference || 'default';
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerType, setPlayerTypeState] = useState<PlayerType>(getInitialPlayerType);

  const setPlayerType = useCallback((newPlayerType: PlayerType) => {
    setPlayerTypeState(newPlayerType);
    localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, newPlayerType);
  }, []);

  const togglePlayerType = useCallback(() => {
    setPlayerTypeState(prevType => {
      const newType = prevType === 'default' ? 'secondary' : 'default';
      localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, newType);
      return newType;
    });
  }, []);

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

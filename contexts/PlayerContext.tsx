import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerContextType {
  useSecondaryPlayer: boolean;
  togglePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useSecondaryPlayer, setUseSecondaryPlayer] = useState(false);

  const togglePlayer = () => {
    setUseSecondaryPlayer(prev => !prev);
  };

  return (
    <PlayerContext.Provider value={{ useSecondaryPlayer, togglePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};


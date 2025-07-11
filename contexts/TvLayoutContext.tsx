import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface TvLayoutContextType {
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

export const TvLayoutContext = createContext<TvLayoutContextType | undefined>(undefined);

export const TvLayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  // useMemo prevents re-rendering of consumers that don't use the changed value.
  const value = useMemo(() => ({
    isSidebarVisible,
    setSidebarVisible,
  }), [isSidebarVisible]);

  return (
    <TvLayoutContext.Provider value={value}>
      {children}
    </TvLayoutContext.Provider>
  );
};

export const useTvLayout = (): TvLayoutContextType => {
  const context = useContext(TvLayoutContext);
  if (context === undefined) {
    throw new Error('useTvLayout must be used within a TvLayoutProvider');
  }
  return context;
};

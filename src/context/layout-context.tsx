'use client';

import { createContext, useContext, useState } from 'react';

type LayoutContextType = {
  isFolderTreeOpen: boolean;
  setIsFolderTreeOpen: (isOpen: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isFolderTreeOpen, setIsFolderTreeOpen] = useState(false);
  return (
    <LayoutContext.Provider value={{ isFolderTreeOpen, setIsFolderTreeOpen }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}

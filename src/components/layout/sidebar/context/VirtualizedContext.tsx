import { createContext, useContext } from 'react';

const VirtualizedContext = createContext(false);

export const VirtualizedProvider = VirtualizedContext.Provider;

export function useIsVirtualized() {
  return useContext(VirtualizedContext);
}

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface RefreshContextType {
  refreshKey: number;
  isRefreshing: boolean;
  lastRefreshed: Date;
  triggerRefresh: (options?: { silent?: boolean }) => void;
}

const RefreshContext = createContext<RefreshContextType>({
  refreshKey: 1,
  isRefreshing: false,
  lastRefreshed: new Date(),
  triggerRefresh: () => {},
});

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const triggerRefresh = useCallback((options?: { silent?: boolean }) => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setLastRefreshed(new Date());

    // Provide a brief tactile duration matching the number animation settling time
    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        refreshKey,
        isRefreshing,
        lastRefreshed,
        triggerRefresh,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = (): RefreshContextType => {
  const context = useContext(RefreshContext);
  if (!context) {
    return {
      refreshKey: 1,
      isRefreshing: false,
      lastRefreshed: new Date(),
      triggerRefresh: () => {},
    };
  }
  return context;
};

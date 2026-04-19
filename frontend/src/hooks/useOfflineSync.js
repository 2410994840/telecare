import { useState, useEffect } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(() => {
    const stored = localStorage.getItem('offlineQueue');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = (action) => {
    const updated = [...pendingSync, { ...action, queuedAt: new Date().toISOString() }];
    setPendingSync(updated);
    localStorage.setItem('offlineQueue', JSON.stringify(updated));
  };

  const clearQueue = () => {
    setPendingSync([]);
    localStorage.removeItem('offlineQueue');
  };

  return { isOnline, pendingSync, queueAction, clearQueue };
};

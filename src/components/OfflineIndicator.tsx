import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-18 md:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-black px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-md animate-pulse border border-amber-300/40"
    >
      <WifiOff size={16} />
      <span>Offline Mode — Reading from saved device cache</span>
    </div>
  );
};

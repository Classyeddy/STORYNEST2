import React from 'react';
import { BookOpen, Compass, Bookmark, PenTool, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'discover' | 'library' | 'write' | 'profile' | 'admin';
  setActiveTab: (tab: 'home' | 'discover' | 'library' | 'write' | 'profile' | 'admin') => void;
  onClearReaderAndStory: () => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onClearReaderAndStory,
}) => {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: BookOpen },
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'library' as const, label: 'Library', icon: Bookmark },
    { id: 'write' as const, label: 'Write', icon: PenTool },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101114]/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-2 flex items-center justify-around safe-area-bottom shadow-2xl"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onClearReaderAndStory();
              setActiveTab(item.id);
            }}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl transition-colors relative min-w-[56px] ${
              isActive ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="absolute -top-1 w-6 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

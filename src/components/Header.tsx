import React from 'react';
import { PlusCircle, ShieldCheck, LogIn } from 'lucide-react';
import { UserProfile } from '../types';
import { formatNGN } from '../utils/monetization';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'home' | 'discover' | 'library' | 'write' | 'profile' | 'admin';
  setActiveTab: (tab: 'home' | 'discover' | 'library' | 'write' | 'profile' | 'admin') => void;
  user: UserProfile;
  isAuthenticated: boolean;
  onOpenTopUp: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  isAuthenticated,
  onOpenTopUp,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#101114]/95 backdrop-blur-md border-b border-gray-800/80 px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 group focus:outline-none"
        aria-label="StoryNest Home"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
          SN
        </div>
        <div className="text-left">
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-amber-400 bg-clip-text text-transparent block leading-tight">
            StoryNest
          </span>
          <span className="text-[10px] text-amber-400/80 tracking-widest uppercase font-semibold hidden sm:block">
            African Serial Fiction
          </span>
        </div>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-[#1A1D24] p-1 rounded-full border border-gray-800/80 text-xs font-semibold text-gray-400">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-1.5 rounded-full transition ${
            activeTab === 'home' ? 'bg-amber-500 text-black shadow font-bold' : 'hover:text-white'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-1.5 rounded-full transition ${
            activeTab === 'discover' ? 'bg-amber-500 text-black shadow font-bold' : 'hover:text-white'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-1.5 rounded-full transition ${
            activeTab === 'library' ? 'bg-amber-500 text-black shadow font-bold' : 'hover:text-white'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab('write')}
          className={`px-4 py-1.5 rounded-full transition ${
            activeTab === 'write' ? 'bg-amber-500 text-black shadow font-bold' : 'hover:text-white'
          }`}
        >
          Writer Studio
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-1.5 rounded-full transition flex items-center gap-1 ${
            activeTab === 'admin' ? 'bg-amber-500 text-black shadow font-bold' : 'hover:text-white'
          }`}
        >
          <ShieldCheck size={12} />
          <span>Governance</span>
        </button>
      </nav>

      {/* Right Action Cluster: PWA Install + NGN Wallet + Auth / Profile */}
      <div className="flex items-center gap-2.5">
        <PWAInstallButton />

        {/* NGN Wallet Balance Pill */}
        <button
          onClick={onOpenTopUp}
          title="Click to top up via Paystack"
          aria-label={`Wallet balance: ${formatNGN(user.walletBalanceNGN)}. Click to top up.`}
          className="flex items-center gap-1.5 bg-[#1E222B] hover:bg-[#252A35] px-3 py-1.5 rounded-full border border-gray-700/70 transition group"
        >
          <span className="text-[11px] font-bold text-amber-400">₦</span>
          <span className="text-xs font-bold text-gray-100">{user.walletBalanceNGN.toLocaleString()}</span>
          <PlusCircle size={13} className="text-gray-400 group-hover:text-amber-400 ml-0.5 transition-colors" />
        </button>

        {/* Auth status: Profile avatar if authenticated, or Sign In button */}
        {isAuthenticated ? (
          <button
            onClick={() => setActiveTab('profile')}
            aria-label="View user profile and settings"
            className={`relative rounded-full p-0.5 transition ${
              activeTab === 'profile' ? 'ring-2 ring-amber-400' : 'hover:ring-1 hover:ring-gray-600'
            }`}
          >
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#101114] rounded-full" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
            aria-label="Sign in or create account"
          >
            <LogIn size={13} />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

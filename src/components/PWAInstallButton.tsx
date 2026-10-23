import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install StoryNest PWA"
        className="flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 text-xs font-bold shadow-md transition"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install StoryNest on iOS"
          className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 px-3 py-1.5 text-xs font-semibold transition"
        >
          <Smartphone size={14} className="text-amber-400" />
          <span className="hidden sm:inline">Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1A1D24] border border-gray-800 p-6 shadow-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-sm">
                    SN
                  </div>
                  <h3 className="text-base font-bold text-white">Install StoryNest</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Install StoryNest on your iOS home screen for instant offline reading and zero mobile data consumption:
              </p>
              <ol className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>Tap the <strong className="text-white">Share</strong> button <Share size={13} className="inline ml-1 text-amber-400" /> at the bottom of Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Tap <strong className="text-white">Add</strong> in the top right to start reading full-screen.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

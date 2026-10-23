import React, { useState } from 'react';
import { Lock, ShieldCheck, Check, AlertCircle, CreditCard, X } from 'lucide-react';
import { Chapter } from '../types';
import { calculateRevenueSplit, formatNGN } from '../utils/monetization';

interface PaymentModalProps {
  chapter: Chapter | null;
  walletBalanceNGN: number;
  onClose: () => void;
  onUnlockWithWallet: (chapter: Chapter) => void;
  onTopUpAndUnlock: (chapter: Chapter, topUpAmount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  chapter,
  walletBalanceNGN,
  onClose,
  onUnlockWithWallet,
  onTopUpAndUnlock,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');

  if (!chapter) return null;

  const split = calculateRevenueSplit(chapter.priceNGN);
  const hasSufficientBalance = walletBalanceNGN >= chapter.priceNGN;
  const deficit = Math.max(0, chapter.priceNGN - walletBalanceNGN);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (hasSufficientBalance && paymentMethod === 'wallet') {
        onUnlockWithWallet(chapter);
      } else {
        // Top up difference or ₦1,000 via Paystack and unlock
        const topUp = Math.max(1000, deficit);
        onTopUpAndUnlock(chapter, topUp);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181A20] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          aria-label="Close unlock modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Lock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Paystack Author Monetization
            </span>
            <h3 className="text-base font-extrabold text-white leading-tight">
              Unlock Chapter {chapter.chapterNumber}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-300 font-medium mb-4 line-clamp-1">
          "{chapter.title}"
        </p>

        {/* Financial Breakdown Card */}
        <div className="bg-[#121317] rounded-2xl p-4 border border-gray-800/80 mb-5 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Chapter Price:</span>
            <span className="text-white font-extrabold text-sm">{formatNGN(chapter.priceNGN)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Your Wallet Balance:</span>
            <span className={`font-bold ${hasSufficientBalance ? 'text-amber-400' : 'text-red-400'}`}>
              {formatNGN(walletBalanceNGN)}
            </span>
          </div>

          <div className="border-t border-gray-800 my-1 pt-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-400" />
                <span>Author Net Earning (85%):</span>
              </span>
              <span className="text-emerald-400 font-bold">{formatNGN(split.authorNet)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
              <span>Platform & Network Fee (15%):</span>
              <span>{formatNGN(split.platformFee)}</span>
            </div>
          </div>
        </div>

        {/* Payment Choice Selection */}
        <div className="space-y-2 mb-6">
          <label
            onClick={() => setPaymentMethod('wallet')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
              paymentMethod === 'wallet'
                ? 'bg-amber-500/10 border-amber-500 text-white'
                : 'bg-[#14161C] border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'wallet'}
                onChange={() => setPaymentMethod('wallet')}
                className="accent-amber-500"
              />
              <span className="font-semibold text-white">StoryNest Wallet</span>
            </div>
            <span className="text-[11px] text-gray-400">Instant deduction</span>
          </label>

          <label
            onClick={() => setPaymentMethod('paystack')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
              paymentMethod === 'paystack'
                ? 'bg-amber-500/10 border-amber-500 text-white'
                : 'bg-[#14161C] border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'paystack'}
                onChange={() => setPaymentMethod('paystack')}
                className="accent-amber-500"
              />
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <CreditCard size={14} className="text-amber-400" />
                <span>Paystack (Cards, USSD, Bank Transfer)</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">₦1,000 Top-up</span>
          </label>
        </div>

        {/* Insufficient Warning */}
        {!hasSufficientBalance && paymentMethod === 'wallet' && (
          <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              Balance short by {formatNGN(deficit)}. We'll initiate an instant Paystack top-up.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isProcessing ? (
              <span>Authorizing...</span>
            ) : paymentMethod === 'wallet' && hasSufficientBalance ? (
              <span>Confirm Unlock ({formatNGN(chapter.priceNGN)})</span>
            ) : (
              <span>Pay via Paystack</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-4">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>Secured with 256-bit encryption & Paystack Webhook verification</span>
        </div>
      </div>
    </div>
  );
};

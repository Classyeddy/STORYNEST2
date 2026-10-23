import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Bookmark,
  ShieldCheck,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  PenTool,
  LogOut,
  LogIn,
  Edit2,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { UserProfile, Story, Transaction } from '../types';
import { formatNGN } from '../utils/monetization';
import { upgradeToWriter, updateUserProfile } from '../services/authService';
import { requestAuthorWithdrawal } from '../services/paymentService';

interface ProfileViewProps {
  user: UserProfile;
  stories: Story[];
  isAuthenticated: boolean;
  transactions?: Transaction[];
  onTopUp: (amount: number) => void;
  onRemoveFromLibrary: (storyId: string) => void;
  onSelectStory: (story: Story) => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stories,
  isAuthenticated,
  transactions = [],
  onTopUp,
  onRemoveFromLibrary,
  onSelectStory,
  onOpenAuth,
  onSignOut,
  onShowToast,
  onUserUpdated,
}) => {
  const [bankName, setBankName] = useState(user.bankAccount?.bankName || 'Access Bank');
  const [accountNumber, setAccountNumber] = useState(user.bankAccount?.accountNumber || '0124894920');
  const [accountName, setAccountName] = useState(user.bankAccount?.accountName || user.displayName);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);

  // Withdrawal State
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(1000);

  const libraryStories = stories.filter((s) => user.libraryStoryIds.includes(s.id));
  const isWriter = user.roles.includes('writer');

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const bankAccount = { bankName, accountNumber, accountName };
    await updateUserProfile(user.id, { bankAccount });
    onUserUpdated({ ...user, bankAccount });
    setIsEditingBank(false);
    onShowToast('Nigerian payout bank details updated successfully!');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(user.id, { displayName, bio });
    onUserUpdated({ ...user, displayName, bio });
    setIsEditingProfile(false);
    onShowToast('Profile updated successfully!');
  };

  const handleBecomeWriter = async () => {
    await upgradeToWriter(user.id);
    onUserUpdated({
      ...user,
      roles: [...user.roles, 'writer'],
      isVerifiedWriter: true,
    });
    onShowToast('Congratulations! You now have full Writer Studio publishing access.');
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.walletBalanceNGN < withdrawalAmount) {
      onShowToast('Insufficient wallet balance for this withdrawal amount.');
      return;
    }
    await requestAuthorWithdrawal({
      userId: user.id,
      authorName: user.displayName,
      amountNGN: withdrawalAmount,
      bankName,
      accountNumber,
      accountName,
    });
    setIsRequestingWithdrawal(false);
    onShowToast(`Withdrawal request for ${formatNGN(withdrawalAmount)} submitted for Friday NIBSS settlement!`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-[#181A20] border border-gray-800 text-center relative shadow-xl">
        <div className="absolute top-5 right-5 flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition flex items-center gap-1.5 text-xs font-bold"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        <div className="relative inline-block mb-3">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/40 shadow-xl mx-auto"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#181A20] rounded-full" />
        </div>

        {!isEditingProfile ? (
          <>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black text-white">{user.displayName}</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 rounded text-gray-400 hover:text-amber-400"
                  aria-label="Edit Profile"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">@{user.username} • {user.email || 'Guest'}</p>
            <p className="text-xs text-gray-300 mt-3 max-w-md mx-auto leading-relaxed">
              {user.bio}
            </p>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} className="max-w-md mx-auto space-y-3 mt-2 text-left">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#121316] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#121316] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-1.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-amber-500 text-black rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {isWriter ? 'Reader & Writer' : 'Reader Account'}
          </span>
          {user.isVerifiedWriter && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Verified Creator</span>
            </span>
          )}
        </div>

        {/* Reader to Writer Upgrade CTA */}
        {!isWriter && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PenTool size={14} className="text-amber-400" />
                <span>Want to publish serialized African fiction?</span>
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Enable Writer Studio to draft stories and earn 85% net royalties.
              </p>
            </div>
            <button
              onClick={handleBecomeWriter}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition shrink-0"
            >
              Become a Writer
            </button>
          </div>
        )}
      </div>

      {/* Paystack Wallet & Nigerian Banking Card */}
      <div className="p-6 rounded-3xl bg-[#181A20] border border-gray-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard size={18} />
            </span>
            <h3 className="text-sm font-bold text-white">StoryNest Wallet & Paystack Top-Up</h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} /> Active
          </span>
        </div>

        <div className="bg-[#121316] p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Available Reading Balance</span>
            <span className="text-2xl font-black text-amber-400">
              {formatNGN(user.walletBalanceNGN)}
            </span>
          </div>

          {isWriter && user.walletBalanceNGN > 0 && (
            <button
              onClick={() => setIsRequestingWithdrawal(!isRequestingWithdrawal)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1"
            >
              <ArrowUpRight size={13} />
              <span>Withdraw</span>
            </button>
          )}
        </div>

        {/* Withdrawal Modal / Form */}
        {isRequestingWithdrawal && (
          <form onSubmit={handleWithdrawalSubmit} className="bg-[#121316] p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <span className="text-xs font-bold text-white block">Request Earnings Withdrawal (NIBSS / Paystack)</span>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Amount to Withdraw (₦)</label>
              <input
                type="number"
                min="500"
                max={user.walletBalanceNGN}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                className="w-full bg-[#181A20] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Will be deposited to: <strong>{bankName} ••••••{accountNumber.slice(-4)}</strong> ({accountName})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRequestingWithdrawal(false)}
                className="flex-1 py-1.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-amber-500 text-black rounded-xl text-xs font-bold"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        {/* Quick Top-Up Buttons */}
        <div>
          <span className="text-xs font-bold text-gray-300 block mb-2">
            Instant Paystack Top-Up
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => onTopUp(amt)}
                className="py-2.5 px-3 rounded-xl bg-gray-800/80 hover:bg-amber-500 hover:text-black text-white text-xs font-bold border border-gray-700/80 transition flex items-center justify-center gap-1 group"
              >
                <Plus size={13} className="text-amber-400 group-hover:text-black transition" />
                <span>{formatNGN(amt)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nigerian Bank Account for Writer Payouts */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white">Creator Payout Bank Details</span>
            </div>
            <button
              onClick={() => setIsEditingBank(!isEditingBank)}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              {isEditingBank ? 'Cancel' : 'Edit Bank'}
            </button>
          </div>

          {isEditingBank ? (
            <form onSubmit={handleSaveBank} className="space-y-3 bg-[#121316] p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#181A20] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Access Bank">Access Bank</option>
                  <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Moniepoint">Moniepoint Microfinance</option>
                  <option value="Opay">OPay Digital Services</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">NUBAN Account Number (10 digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#181A20] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#181A20] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition"
              >
                Save Payout Account
              </button>
            </form>
          ) : (
            <div className="bg-[#121316] p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{accountName}</span>
                <span className="text-gray-400">{bankName} ••••••{accountNumber.slice(-4)}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User's Reading Library Card */}
      <div className="p-6 rounded-3xl bg-[#181A20] border border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Saved Stories in Library ({libraryStories.length})
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">Offline cached</span>
        </div>

        {libraryStories.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No stories in your library yet.</p>
        ) : (
          <div className="space-y-3">
            {libraryStories.map((story) => (
              <div
                key={story.id}
                className="p-3.5 rounded-2xl bg-[#121316] border border-gray-800 flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => onSelectStory(story)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-12 h-16 object-cover rounded-xl border border-gray-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{story.title}</h4>
                    <p className="text-[11px] text-gray-400 truncate">{story.authorName}</p>
                    <span className="text-[10px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
                      <BookOpen size={10} />
                      <span>{story.chapterCount} chapters available</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFromLibrary(story.id)}
                  className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-gray-800 transition"
                  title="Remove from library"
                  aria-label={`Remove ${story.title} from library`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

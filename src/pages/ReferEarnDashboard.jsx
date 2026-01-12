import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Copy, Share2, Check, Users, Clock, Gift, ChevronRight, TrendingUp, MessageCircle, Send, Sparkles, Award, Twitter, Mail, Zap, Crown, Target, Palette, Trophy, BookOpen, ShieldOff } from 'lucide-react';

const ReferEarnDashboard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        showToast('Failed to load referral data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  if (loading) return <LoadingSpinner text="Loading Referral Dashboard..." />;

  const referralCode = user?.referralCode || "Loading...";
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const referrals = user?.referrals || [];

  const stats = {
    totalInvites: referrals.length,
    successfulReferrals: referrals.length, // MVP: Treat all as successful for now
    pendingCoins: 0, // Placeholder as we don't track pending coins in DB yet
    totalCoins: referrals.length * 150
  };

  const invitedUsers = referrals.map(ref => ({
    name: ref.name || ref.email.split('@')[0],
    status: "Joined", // Defaulting to Joined as they are in DB
    coins: 150,
    date: new Date(ref.createdAt).toLocaleDateString()
  }));

  // Fallback if no referrals yet
  if (invitedUsers.length === 0) {
    // Keep empty logic or show placeholder message in UI
  }

  const rewardTiers = [
    { referrals: 5, bonus: 500 },
    { referrals: 10, bonus: 1200 },
    { referrals: 25, bonus: 3500 },
    { referrals: 50, bonus: 8000 },
  ];

  const features = [
    {
      name: 'Premium Cues',
      description: 'Unlock legendary cue sticks',
      cost: 500,
      icon: Target,
      locked: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Custom Tables',
      description: 'Exclusive table designs',
      cost: 600,
      icon: Palette,
      locked: false,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Tournament Entry',
      description: 'Join premium tournaments',
      cost: 800,
      icon: Trophy,
      locked: false,
      color: 'from-amber-500 to-orange-500'
    },
    {
      name: 'VIP Club Access',
      description: 'Elite player community',
      cost: 1000,
      icon: Crown,
      locked: false,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      name: 'Private Rooms',
      description: 'Play with friends only',
      cost: 400,
      icon: Users,
      locked: false,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Pro Training',
      description: 'Learn from the best',
      cost: 700,
      icon: BookOpen,
      locked: false,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Ad-Free Gaming',
      description: 'Remove all advertisements',
      cost: 300,
      icon: ShieldOff,
      locked: false,
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Power-ups Pack',
      description: 'Special in-game abilities',
      cost: 1200,
      icon: Zap,
      locked: true,
      color: 'from-cyan-400 to-blue-500'
    },
  ];

  const nextTier = rewardTiers.find(tier => tier.referrals > stats.successfulReferrals);
  const progress = nextTier ? (stats.successfulReferrals / nextTier.referrals) * 100 : 100;

  const copyToClipboard = (text, setFunc) => {
    navigator.clipboard.writeText(text);
    setFunc(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setFunc(false), 2000);
  };

  const shareUrl = (platform) => {
    const text = `Join me on Potta Pool and earn coins to unlock premium features! Use my code: ${referralCode}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join Potta Pool&body=${encodeURIComponent(text + '\n\n' + referralLink)}`
    };
    window.open(urls[platform], '_blank');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-3 sm:p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-4 md:space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center mb-4 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Target className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Refer & Earn
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
            Invite friends to Potta Pool and unlock premium cues, tables & features!
          </p>
        </motion.div>

        {/* Coin Balance Banner */}
        <motion.div variants={item} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Your Coin Balance</p>
                <p className="text-white text-3xl sm:text-5xl font-bold tracking-tight">{stats.totalCoins}</p>
                <p className="text-cyan-400 text-xs">Use coins to unlock premium features</p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 sm:px-4 py-2 border border-slate-700">
                <Clock className="text-cyan-400 w-4 h-4" />
                <span className="text-white font-semibold text-sm sm:text-base">{stats.pendingCoins} Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral Code Section */}
        <motion.div variants={item} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs sm:text-sm mb-2 block">Your Referral Code</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-cyan-400 font-mono text-sm sm:text-lg border border-cyan-500/30">
                  {referralCode}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(referralCode, setCopied)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-all text-sm sm:text-base"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs sm:text-sm mb-2 block">Your Referral Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-cyan-400 font-mono text-xs sm:text-sm truncate border border-cyan-500/30">
                  {referralLink}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(referralLink, setCopiedLink)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3 sm:px-4 rounded-lg flex items-center gap-2 transition-all text-sm sm:text-base"
                >
                  {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Invites', value: stats.totalInvites, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Successful Referrals', value: stats.successfulReferrals, icon: Award, color: 'from-emerald-500 to-green-500' },
            { label: 'Pending Coins', value: stats.pendingCoins, icon: Clock, color: 'from-orange-500 to-red-500', suffix: ' coins' },
            { label: 'Total Coins Earned', value: stats.totalCoins, icon: Sparkles, color: 'from-purple-500 to-pink-500', suffix: ' coins' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 border border-slate-700 shadow-xl cursor-pointer"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
                {stat.suffix && <span className="text-xs sm:text-sm text-gray-400 ml-1">{stat.suffix}</span>}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <motion.div variants={item} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <h3 className="text-white font-semibold text-sm sm:text-base">Next Bonus Tier</h3>
              </div>
              <div className="flex items-center gap-2 bg-cyan-500/20 rounded-lg px-3 py-1 border border-cyan-500/30">
                <Gift className="text-cyan-400" size={16} />
                <span className="text-cyan-400 font-bold text-sm sm:text-base">{nextTier.bonus} Coins Bonus</span>
              </div>
            </div>
            <div className="bg-slate-950 rounded-full h-4 overflow-hidden mb-2 border border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
              <Target size={14} className="text-cyan-400" />
              {nextTier.referrals - stats.successfulReferrals} more referrals to unlock {nextTier.bonus} bonus coins!
            </p>
          </motion.div>
        )}

        {/* Unlockable Features Grid */}
        <motion.div variants={item} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="text-cyan-400" size={28} />
              Unlock Premium Features
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-slate-950 rounded-xl p-4 border ${feature.locked
                  ? 'border-slate-700 opacity-60'
                  : 'border-slate-600 hover:border-cyan-500/50'
                  } transition-all cursor-pointer relative overflow-hidden group`}
              >
                {feature.locked && (
                  <div className="absolute top-2 right-2 bg-slate-800 rounded-full p-1.5">
                    <ChevronRight className="text-slate-500" size={14} />
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h4 className="text-white font-bold text-base mb-1">{feature.name}</h4>
                <p className="text-gray-400 text-xs mb-3">{feature.description}</p>
                <div className="flex items-center gap-2 bg-cyan-500/20 rounded-lg px-3 py-1.5 border border-cyan-500/30 w-fit">
                  <Sparkles className="text-cyan-400" size={14} />
                  <span className="text-cyan-400 text-sm font-bold">{feature.cost}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Invited Users List */}
          <motion.div variants={item} className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={24} className="text-cyan-400" />
              Your Referrals
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {invitedUsers.map((user, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="bg-slate-950 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <div className="text-white font-medium text-sm sm:text-base">{user.name}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">{user.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${user.status === 'Joined'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                      {user.status === 'Joined' ? (
                        <>
                          <Check size={12} />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>Pending</span>
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-1 bg-cyan-500/20 rounded-lg px-3 py-1 border border-cyan-500/30">
                      <Sparkles className="text-cyan-400" size={14} />
                      <span className="text-cyan-400 font-bold text-sm">
                        {user.coins > 0 ? user.coins : '-'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - How it Works & Share */}
          <motion.div variants={item} className="space-y-4 md:space-y-6">
            {/* How It Works */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-cyan-400" size={24} />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg p-4 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-cyan-400" size={24} />
                    <span className="text-cyan-400 font-bold text-2xl sm:text-3xl">150</span>
                    <span className="text-gray-400 text-sm">coins</span>
                  </div>
                  <div className="text-gray-300 text-xs sm:text-sm">Per successful referral</div>
                </div>
                <div className="text-gray-300 text-xs sm:text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <Share2 size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Share your referral code or link</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Users size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Friend signs up and plays their first game</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Zap size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Both get 150 coins instantly!</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Gift size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Unlock cues, tables & more features</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Share2 size={24} className="text-cyan-400" />
                Share & Invite
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'WhatsApp', color: 'from-green-500 to-emerald-600', icon: MessageCircle, platform: 'whatsapp' },
                  { name: 'Telegram', color: 'from-blue-500 to-cyan-600', icon: Send, platform: 'telegram' },
                  { name: 'Twitter', color: 'from-sky-400 to-blue-500', icon: Twitter, platform: 'twitter' },
                  { name: 'Email', color: 'from-purple-500 to-fuchsia-600', icon: Mail, platform: 'email' }
                ].map((platform, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareUrl(platform.platform)}
                    className={`bg-gradient-to-br ${platform.color} text-white rounded-lg p-3 sm:p-4 flex flex-col items-center gap-2 shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <platform.icon size={24} />
                    <span className="text-xs sm:text-sm font-medium">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReferEarnDashboard;
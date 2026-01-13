import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Gamepad2, Trophy, Target, Zap, CircleDot,
  DollarSign, TrendingUp, Play,
  Users, Clock, ChevronRight, Wallet, History, Settings,
  X, Shuffle, Plus, Lock, ArrowRight, Sword
} from 'lucide-react';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const initialUser = {
  id: '',
  username: 'Guest',
  balance: 0,
  totalGames: 0,
  totalWins: 0,
  currency: 'GH₵'
};

const games = [
  {
    id: 'speed-match',
    name: 'Speed Arena',
    mode: 'speed',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1626336767159-0740106f0e63?w=800&h=400&fit=crop',
    color: 'from-orange-500 to-red-600',
    minBet: 10,
    maxBet: 50000,
    players: 'Active PvP',
    category: '60s Mode',
    winRate: 'Skill-based',
    description: 'A high-pressure mode where each player has exactly 60 seconds to pot all balls. Server-governed timer.',
    type: 'speed'
  },
  {
    id: 'turn-match',
    name: 'Turn Masters',
    mode: 'turn',
    icon: Sword,
    image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&h=400&fit=crop',
    color: 'from-blue-500 to-indigo-600',
    minBet: 10,
    maxBet: 50000,
    players: 'Pro PvP',
    category: 'Classic 8-Ball',
    winRate: 'Pro-level',
    description: 'Standard competitive pool. Players take turns potting balls. Full server-side physics validation.',
    type: 'turn'
  },
  {
    id: 'quick-play',
    name: 'Quick Match',
    mode: 'turn',
    icon: Shuffle,
    image: 'https://images.unsplash.com/photo-1549419137-0105378c437f?w=800&h=400&fit=crop',
    color: 'from-emerald-500 to-green-600',
    minBet: 10,
    maxBet: 50000,
    players: 'Instant Pair',
    category: 'Fast Entry',
    winRate: 'Balanced',
    description: 'A streamlined PvP entry point that matches players instantly based on a shared stake amount.',
    type: 'quick'
  }
];

export default function GameDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [betAmount, setBetAmount] = useState('10');

  // Deposit Logic States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [statsRes, balanceRes, profileRes] = await Promise.all([
        api.get('/game/stats', token),
        api.get('/wallet/balance', token),
        api.get('/auth/profile', token)
      ]);

      const statsData = await statsRes.json();
      const balanceData = await balanceRes.json();
      const profileData = await profileRes.json();

      if (statsRes.ok && balanceRes.ok) {
        setUser(prev => ({
          ...prev,
          balance: parseFloat(balanceData.available) || 0,
          lockedBalance: parseFloat(balanceData.locked) || 0,
          currency: balanceData.currency === 'GHS' ? 'GH₵' : balanceData.currency,
          totalGames: statsData.totalGames,
          totalWins: statsData.wins,
          username: (profileRes.ok && profileData.name) ? profileData.name : (profileData.email || 'Player')
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      showToast('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Verify Payment if returning from Paystack
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    if (reference) {
      verifyPayment(reference);
    }
  }, []);

  const verifyPayment = async (reference) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast('Verifying deposit...', 'info');

    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/payments/verify/${reference}`, token);
      const data = await res.json();

      if (res.ok && (data.status === 'success' || data.status === 'already_processed')) {
        showToast('Deposit confirmed! Balance updated.', 'success');
        fetchUserData();
      } else {
        showToast('Payment verification failed.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to verify payment.', 'error');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!depositAmount || parseFloat(depositAmount) < 10) {
      showToast('Minimum deposit is 10 GH₵', 'error');
      return;
    }

    setDepositLoading(true);
    try {
      const res = await api.post('/payments/deposit/initialize', {
        amount: parseFloat(depositAmount),
        currency: 'GHS',
        email: user?.email || 'user@example.com',
        callbackUrl: window.location.href
      }, token);

      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        showToast(data.message || 'Deposit initiation failed', 'error');
      }
    } catch (err) {
      showToast('Connection error during deposit', 'error');
    } finally {
      setDepositLoading(false);
      setShowDepositModal(false);
    }
  };

  const startMatchmaking = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < 10) {
      showToast('Minimum stake is 10 GH₵', 'error');
      return;
    }
    if (amount > user.balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    const mode = selectedGame.mode === 'any' ? 'turn' : selectedGame.mode;
    navigate(`/quick-match?mode=${mode}&stake=${amount}`);
  };

  if (loading) return <LoadingSpinner text="Entering Arena..." />;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-12 pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12"
        >
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-1 shadow-xl">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-black text-blue-400">{user.username.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black">{user.username}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-xs font-bold text-gray-300">{user.totalWins} Victories</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pro Elite</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <h1 className="text-4xl font-black flex items-center gap-1">
                <span className="text-gray-500">{user.currency}</span>
                <span>{user.balance.toLocaleString()}</span>
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDepositModal(true)}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <Plus size={32} className="text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">PvP Arena</h2>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gray-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{game.players}</span>
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 border border-white/10">
                    <game.icon className="text-white" />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{game.category}</p>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black mb-3 italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed line-clamp-2">{game.description}</p>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Stake From</p>
                    <p className="text-xl font-black">{user.currency} {game.minBet}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedGame(game); setShowBetModal(true); }}
                    className="flex-1 bg-white hover:bg-blue-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span>ENTER ARENA</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stake Modal */}
      <AnimatePresence>
        {showBetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBetModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 w-full max-w-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative z-10"
            >
              <div className={`h-2 bg-gradient-to-r ${selectedGame?.color}`}></div>
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Select Stake</h3>
                    <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">{selectedGame?.name}</p>
                  </div>
                  <button onClick={() => setShowBetModal(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-black/40 rounded-3xl p-8 mb-8 border border-white/5 relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-700 pointer-events-none group-focus-within:text-blue-500/50 transition-colors">
                    {user.currency}
                  </div>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-transparent pl-16 text-5xl font-black focus:outline-none text-white text-center"
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3 mb-10">
                  {[50, 100, 200, 500].map(v => (
                    <button
                      key={v}
                      onClick={() => setBetAmount(v.toString())}
                      className="py-3 bg-white/5 hover:bg-blue-600 rounded-xl font-bold transition-all border border-white/5"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startMatchmaking}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 text-xl transition-all shadow-xl shadow-blue-500/20"
                >
                  <Target size={24} />
                  <span>START MATCH</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 w-full max-w-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-center">Top Up Account</h3>

                <form onSubmit={handleDeposit} className="space-y-8">
                  <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-700 pointer-events-none group-focus-within:text-blue-500/50">
                      {user.currency}
                    </div>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-transparent pl-16 text-4xl font-black focus:outline-none text-white text-center"
                      placeholder="Min 10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[10, 50, 100, 200].map(v => (
                      <button type="button" key={v} onClick={() => setDepositAmount(v.toString())} className="p-3 bg-white/5 rounded-xl font-bold border border-white/5 hover:bg-blue-600/50 transition-all">{v}</button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDepositModal(false)}
                      className="flex-1 border border-white/10 hover:bg-white/5 py-5 rounded-2xl font-bold transition-all"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={depositLoading}
                      className="flex-[2] bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                    >
                      {depositLoading ? 'SECURIING...' : 'CONFIRM DEPOSIT'}
                      {!depositLoading && <ChevronRight size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
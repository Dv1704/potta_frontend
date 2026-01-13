import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Zap, Trophy, Target, Shuffle, Plus, ArrowRight, Sword, Users, X
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
    players: 'Active PvP',
    category: '60s Mode',
    description: 'A high-pressure mode where each player has exactly 60 seconds to pot all balls. Server-governed timer.'
  },
  {
    id: 'turn-match',
    name: 'Turn Masters',
    mode: 'turn',
    icon: Sword,
    image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&h=400&fit=crop',
    color: 'from-blue-500 to-indigo-600',
    minBet: 10,
    players: 'Pro PvP',
    category: 'Classic 8-Ball',
    description: 'Standard competitive pool. Players take turns potting balls. Full server-side physics validation.'
  },
  {
    id: 'quick-play',
    name: 'Quick Match',
    mode: 'turn',
    icon: Shuffle,
    image: 'https://images.unsplash.com/photo-1549419137-0105378c437f?w=800&h=400&fit=crop',
    color: 'from-emerald-500 to-green-600',
    minBet: 10,
    players: 'Instant Pair',
    category: 'Fast Entry',
    description: 'A streamlined PvP entry point that matches players instantly based on a shared stake amount.'
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
          currency: balanceData.currency === 'GHS' ? 'GH₵' : balanceData.currency,
          totalGames: statsData.totalGames,
          totalWins: statsData.wins,
          username: profileData.name || (profileData.email ? profileData.email.split('@')[0] : 'Player')
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
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    if (!depositAmount || parseFloat(depositAmount) < 10) {
      showToast('Min deposit is GH₵ 10', 'error');
      return;
    }

    setDepositLoading(true);
    try {
      const res = await api.post('/payments/deposit/initialize', {
        amount: parseFloat(depositAmount),
        currency: 'GHS',
        callbackUrl: window.location.href
      }, token);

      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        showToast(data.message || 'Deposit failed', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    } finally {
      setDepositLoading(false);
      setShowDepositModal(false);
    }
  };

  const startMatchmaking = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < 10) {
      showToast('Min stake is GH₵ 10', 'error');
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

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-12 pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Trophy size={14} className="text-yellow-500" />
                <span className="text-xs font-bold text-gray-400">{user.totalWins} Wins</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full border border-blue-500/30 ml-2">Pro Level</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
              <h2 className="text-3xl font-black">{user.currency} {user.balance.toLocaleString()}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDepositModal(true)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <Plus size={24} className="text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">PvP Arena</h2>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gray-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-2xl"
            >
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img src={game.image} alt={game.name} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>

                {/* Status Tag */}
                <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/50">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">{game.players}</span>
                </div>

                {/* Professional Icon/Category Header (Consistent for all cards) */}
                <div className="absolute bottom-4 left-6">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center mb-2 border border-white/10">
                    <game.icon className="text-white w-5 h-5" />
                  </div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{game.category}</p>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black mb-2 italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed line-clamp-2">{game.description}</p>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Stake From</p>
                    <p className="text-lg font-black">{user.currency} {game.minBet}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedGame(game); setShowBetModal(true); }}
                    className="flex-1 bg-white hover:bg-blue-400 text-black font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBetModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Select Stake</h3>
                  <button onClick={() => setShowBetModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-6 text-center">
                  <p className="text-4xl font-black">{user.currency} {betAmount}</p>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {[50, 100, 200, 500].map(v => (
                    <button key={v} onClick={() => setBetAmount(v.toString())} className="py-2.5 bg-white/5 hover:bg-blue-600 rounded-lg font-bold transition-all border border-white/5">{v}</button>
                  ))}
                </div>
                <button onClick={startMatchmaking} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20">CONFIRM & SEARCH</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDepositModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
              <div className="p-10 text-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-8">Top Up</h3>
                <form onSubmit={handleDeposit}>
                  <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-black/40 p-6 rounded-2xl text-3xl font-black text-center mb-6 border border-white/5 focus:border-blue-500 outline-none" placeholder="Min 10" />
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 py-4 border border-white/10 rounded-xl font-bold">CANCEL</button>
                    <button type="submit" disabled={depositLoading} className="flex-2 bg-blue-600 py-4 px-8 rounded-xl font-black shadow-lg shadow-blue-600/20">{depositLoading ? '...' : 'DEPOSIT'}</button>
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
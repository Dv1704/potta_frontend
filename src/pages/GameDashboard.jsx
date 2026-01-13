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
  currency: 'GHC'
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
    players: 'ACTIVE PVP',
    category: '60S MODE',
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
    players: 'PRO PVP',
    category: 'CLASSIC 8-BALL',
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
    players: 'INSTANT PAIR',
    category: 'FAST ENTRY',
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
          currency: 'GHC',
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
      showToast('Min deposit is GHC 10', 'error');
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
      showToast('Min stake is GHC 10', 'error');
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
        {/* Premium Profile Banner - Exact implementation from Screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0c111d] p-8 rounded-[2rem] border border-white/[0.05] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 mb-16"
        >
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[1.2rem] border-2 border-blue-500 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-800 rounded-[1rem] flex items-center justify-center">
                <span className="text-4xl font-black text-white">{user.username.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{user.username}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/5">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-xs font-bold text-gray-300">{user.totalWins} Victories</span>
                </div>
                <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/30">
                  PRO ELITE
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">TOTAL BALANCE</p>
              <h2 className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
                <span className="text-gray-500 text-3xl font-bold">GHC</span>
                <span>{user.balance.toLocaleString()}</span>
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDepositModal(true)}
              className="w-16 h-16 bg-blue-500 hover:bg-blue-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
            >
              <Plus size={36} className="text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">PVP ARENA</h2>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-[#0c111d] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all duration-500 shadow-2xl"
            >
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img src={game.image} alt="" className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c111d] via-[#0c111d]/20 to-transparent"></div>

                {/* Status Tag */}
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">{game.players}</span>
                </div>

                {/* Professional Header Icons */}
                <div className="absolute bottom-6 left-8">
                  <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-lg">
                    <game.icon className="text-white w-6 h-6" />
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] font-mono">{game.category}</p>
                </div>
              </div>

              <div className="p-10">
                <h3 className="text-3xl font-black mb-3 italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{game.name}</h3>
                <p className="text-gray-400 text-base mb-10 leading-relaxed font-medium line-clamp-2">{game.description}</p>

                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">STAKE FROM</p>
                    <p className="text-2xl font-black flex items-center gap-1.5">
                      <span className="text-blue-500 text-lg">GHC</span>
                      <span>{game.minBet}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedGame(game); setShowBetModal(true); }}
                    className="flex-1 bg-white hover:bg-blue-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <span className="text-lg">ENTER ARENA</span>
                    <ArrowRight size={20} />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBetModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#0c111d] w-full max-w-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
              <div className="p-12">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">Set Stake</h3>
                  <button onClick={() => setShowBetModal(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                </div>
                <div className="bg-black/40 rounded-3xl p-10 border border-white/5 mb-8 text-center">
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">STAKING AMOUNT</p>
                  <p className="text-6xl font-black tracking-tighter">GHC {betAmount}</p>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-10">
                  {[50, 100, 200, 500].map(v => (
                    <button key={v} onClick={() => setBetAmount(v.toString())} className="py-4 bg-white/5 hover:bg-blue-600 rounded-xl font-black transition-all border border-white/5 active:scale-90">{v}</button>
                  ))}
                </div>
                <button onClick={startMatchmaking} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-blue-600/30 text-xl tracking-wide uppercase italic">CONFIRM & SEARCH</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDepositModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#0c111d] w-full max-w-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
              <div className="p-12 text-center">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10">TOP UP WALLET</h3>
                <form onSubmit={handleDeposit} className="space-y-10">
                  <div className="relative group">
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-black/40 p-8 rounded-3xl text-4xl font-black text-center border border-white/5 focus:border-blue-500/50 outline-none transition-all" placeholder="Min 10" required />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 font-black text-xl pointer-events-none group-focus-within:text-blue-500/30 transition-colors">GHC</div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 py-5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/5 transition-all">CLOSE</button>
                    <button type="submit" disabled={depositLoading} className="flex-[2] bg-blue-600 py-5 px-10 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">{depositLoading ? 'SHIELDING...' : 'CONFIRM DEPOSIT'}</button>
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
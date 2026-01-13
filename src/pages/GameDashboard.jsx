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

  return (
    <div className="min-h-screen bg-[#064e3b] text-white pt-20 px-4 md:px-8 lg:px-12 pb-20">
      {/* Wood Texture/Felt Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{ backgroundImage: 'radial-gradient(circle at center, #065f46 0%, #064e3b 100%)' }}></div>

      {/* Top Banner / Stats */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/30">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center border-2 border-emerald-300 shadow-lg shadow-emerald-500/20">
              <Users className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user.username}</h1>
              <div className="flex items-center gap-3 text-emerald-300 text-sm">
                <span className="flex items-center gap-1"><Trophy size={14} /> {user.totalWins} Wins</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                <span className="flex items-center gap-1 font-bold">PRO LEVEL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-emerald-950/50 px-6 py-3 rounded-2xl border border-emerald-500/20 text-center">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Available</p>
              <p className="text-3xl font-black">{user.currency}{user.balance.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/40"
            >
              <Plus className="w-8 h-8 font-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <CircleDot className="text-emerald-400 w-8 h-8" />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">PvP Arena</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game.id}
              className="group relative bg-[#013220] rounded-[2rem] overflow-hidden border-2 border-emerald-500/20 hover:border-emerald-400 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
            >
              {/* Image Header */}
              <div className="relative h-56 overflow-hidden">
                <img src={game.image} alt={game.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${game.color} mix-blend-multiply opacity-60`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#013220] via-transparent to-transparent"></div>

                <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                  <span className="text-[10px] font-black uppercase text-black tracking-widest">{game.players}</span>
                </div>

                <div className="absolute bottom-4 left-6">
                  <game.icon className="w-12 h-12 text-white/90 drop-shadow-lg mb-2" />
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">{game.category}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-black mb-3 italic uppercase tracking-tighter">{game.name}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed line-clamp-2">
                  {game.description}
                </p>

                <div className="flex items-center justify-between gap-4">
                  <div className="bg-emerald-900/40 px-4 py-2 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Min Stake</p>
                    <p className="text-lg font-black">{user.currency}{game.minBet}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedGame(game); setShowBetModal(true); }}
                    className="flex-1 bg-white hover:bg-emerald-100 text-[#013220] font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all group/btn"
                  >
                    <span>JOIN ARENA</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stake Selection Modal */}
      {showBetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl bg-emerald-950/80">
          <div className="bg-[#013220] w-full max-w-md rounded-[2.5rem] border-2 border-emerald-500/30 overflow-hidden shadow-2xl">
            <div className={`h-3 bg-gradient-to-r ${selectedGame?.color}`}></div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Set Your Stake</h3>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{selectedGame?.name}</p>
                </div>
                <button onClick={() => setShowBetModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-emerald-500/50">{user.currency}</div>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-[#064e3b] p-8 pl-20 rounded-3xl text-5xl font-black focus:outline-none border-2 border-emerald-500/20 focus:border-emerald-400 transition-all font-mono"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-4 gap-3 mb-10">
                {[50, 100, 200, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBetAmount(val.toString())}
                    className="py-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/20 font-black text-sm transition-all active:scale-95"
                  >
                    {val}
                  </button>
                ))}
              </div>

              <button
                onClick={startMatchmaking}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 text-xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-98"
              >
                <Target className="w-6 h-6" />
                <span>CONFIRM & SEARCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl bg-emerald-950/80">
          <div className="bg-[#013220] w-full max-w-md rounded-[2.5rem] border-2 border-emerald-500/30 overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-center w-full">Top Up Wallet</h3>
              </div>

              <form onSubmit={handleDeposit}>
                <div className="relative mb-8">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-emerald-500/50">{user.currency}</div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#064e3b] p-8 pl-16 rounded-3xl text-4xl font-black focus:outline-none border-2 border-emerald-500/20 focus:border-emerald-400 transition-all"
                    placeholder="Min 10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[10, 50, 100, 200].map(v => (
                    <button type="button" key={v} onClick={() => setDepositAmount(v.toString())} className="bg-emerald-900/50 p-4 rounded-xl border border-emerald-500/10 font-black">{v}</button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 border-2 border-emerald-500/20 hover:border-emerald-500/40 font-black py-4 rounded-2xl"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={depositLoading}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {depositLoading ? 'PROCESSING...' : 'DEPOSIT NOW'}
                    {!depositLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <style>{`
        @keyframes fly-plane {
          0% { transform: translate(0, 0) rotate(45deg); }
          50% { transform: translate(100px, -50px) rotate(35deg); }
          100% { transform: translate(200px, -100px) rotate(45deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
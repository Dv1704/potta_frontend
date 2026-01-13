// src/pages/Success.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrophy } from "react-icons/hi2";
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { IoGameControllerSharp } from "react-icons/io5";
import {
  FaWallet,
  FaBolt,
  FaExchangeAlt,
  FaUser,
  FaCoins,
  FaTrophy,
  FaHistory,
  FaCrown,
  FaFire,
  FaArrowUp,
  FaArrowDown,
  FaChartLine
} from 'react-icons/fa';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: location.state?.username || 'Guest',
    wallet: location.state?.wallet || 0,
    currency: 'GH₵',
    role: 'USER'
  });
  const [statsData, setStatsData] = useState({
    gamesPlayed: 0,
    winRate: 0,
    totalWon: 0,
    streak: 0
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Parallel Fetch
        const [profileRes, walletRes, statsRes, historyRes] = await Promise.all([
          fetch(`${apiUrl}/auth/profile`, { headers }),
          fetch(`${apiUrl}/wallet/balance`, { headers }),
          fetch(`${apiUrl}/game/stats`, { headers }),
          fetch(`${apiUrl}/wallet/history`, { headers })
        ]);

        if (profileRes.ok && walletRes.ok && statsRes.ok) {
          const profile = await profileRes.json();
          const wallet = await walletRes.json();
          const stats = await statsRes.json();
          const historyData = await historyRes.json();

          setUserData({
            username: profile.name || profile.email.split('@')[0],
            wallet: wallet.available,
            currency: wallet.currency === 'GHS' ? 'GH₵' : wallet.currency,
            role: profile.role
          });

          setStatsData({
            gamesPlayed: stats.totalGames,
            winRate: Math.round(stats.winRate),
            totalWon: stats.totalEarnings,
            streak: stats.streak
          });

          setHistory(historyData);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        showToast('Failed to load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast, navigate]);

  const stats = [
    { label: 'Games Played', value: statsData.gamesPlayed.toString(), color: 'from-gray-600 to-gray-500' },
    { label: 'Win Rate', value: `${statsData.winRate}%`, color: 'from-green-700 to-green-600' },
    { label: 'Total Won', value: `${userData.currency} ${statsData.totalWon.toLocaleString()}`, color: 'from-purple-700 to-purple-600' },
    { label: 'Current Streak', value: statsData.streak.toString(), color: 'from-orange-700 to-orange-600' },
  ];

  if (loading) return <LoadingSpinner text="Connecting..." />;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="flex-grow pt-28 px-4 pb-12 relative z-10 max-w-6xl mx-auto w-full space-y-8">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Welcome Back, {userData.username}!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">The Arena awaits your next move.</p>
          </div>
          <div className="flex gap-4">
            {userData.role === 'ADMIN' && (
              <Link to="/admin" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black transition-all">ADMIN PANEL</Link>
            )}
            <Link to="/dashboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black shadow-lg shadow-blue-600/20 text-center">PLAY NOW</Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                <FaCoins className="text-white text-sm" />
              </div>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Wallet & Quick Link */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <FaWallet className="text-blue-400 text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Wallet Balance</p>
                <h3 className="text-4xl font-black">{userData.currency} {userData.wallet.toLocaleString()}</h3>
              </div>
            </div>
            <Link to="/wallet" className="w-full md:w-auto px-10 py-4 bg-white hover:bg-blue-400 text-black font-black rounded-xl text-center transition-all">WALLET</Link>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-orange-500/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-600/20">
              <FaFire className="text-white" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">⚡ Quick Match</h3>
            <p className="text-gray-500 text-xs font-medium mb-6">Jump into the arena instantly!</p>
            <Link to="/quick-match" className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 transition-all">FIND OPPONENT</Link>
          </div>
        </div>

        {/* History Area */}
        <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <FaHistory className="text-blue-400" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'PAYOUT' || item.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                    {item.type === 'PAYOUT' ? '🏆' : '💰'}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">{item.type}</p>
                    <p className="text-[10px] text-gray-500 lowercase font-mono">{new Date(item.createdAt).toDateString()}</p>
                  </div>
                </div>
                <p className={`font-black ${item.type === 'PAYOUT' || item.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.type === 'PAYOUT' || item.type === 'DEPOSIT' ? '+' : '-'}{userData.currency} {Math.abs(item.amount).toLocaleString()}
                </p>
              </div>
            ))}
            {history.length === 0 && <p className="text-center text-gray-600 italic">No recent activity found.</p>}
          </div>
        </div>
      </main>

      <footer className="py-12 text-center relative z-10">
        <Link to="/leaderboards" className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase transition-all">
          <FaCrown className="text-yellow-500" />
          <span>View Rankings</span>
        </Link>
      </footer>
    </div>
  );
};

export default Success;
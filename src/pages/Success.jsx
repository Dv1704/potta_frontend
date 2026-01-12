// src/pages/Success.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
        if (!token) return;

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
        showToast('Failed to load dashboard data. Please try refreshing.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const stats = [
    { label: 'Games Played', value: statsData.gamesPlayed.toString(), color: 'from-gray-600 to-gray-500' },
    { label: 'Win Rate', value: `${statsData.winRate}%`, color: 'from-green-700 to-green-600' },
    { label: 'Total Won', value: `${userData.currency}${statsData.totalWon.toLocaleString()}`, color: 'from-purple-700 to-purple-600' },
    { label: 'Current Streak', value: statsData.streak.toString(), color: 'from-orange-700 to-orange-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Dashboard..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-500 rounded-full blur-2xl opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <main className="flex-grow pt-24 px-4 pb-12 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* Welcome Header */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/30 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-600/10 to-gray-700/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <motion.h2
                  className="text-4xl font-black bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  <HiOutlineTrophy /> Welcome Back, {userData.username}!
                </motion.h2>
                <p className="text-gray-400 mt-2 text-lg">
                  Ready to hustle? The arena awaits your skills.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.div
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Hustler ID</p>
                    <p className="font-bold text-white">{userData.username}</p>
                  </div>
                </motion.div>

                {userData.role === 'ADMIN' ? (
                  <motion.div
                    className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                    whileHover={{ scale: 1.05 }}
                  ><Link
                    to="/admin"
                    className="p-3 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-4 py-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 border border-indigo-500/30"
                  >
                      <FaChartLine className="text-lg" />
                      <span className="hidden sm:inline">Admin Panel</span>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                    whileHover={{ scale: 1.05 }}
                  ><Link
                    to="/dashboard"
                    className="p-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 border border-blue-500/30"
                  >
                      <IoGameControllerSharp className="text-lg" />
                      <span className="hidden sm:inline">Play Now</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2`}>
                  <FaCoins className="text-white text-sm" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Wallet Balance & Actions */}
          <motion.div
            variants={itemVariants}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Wallet Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/30 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl">
                    <FaWallet className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Wallet Balance</p>
                    <motion.h3
                      className="text-3xl font-black text-white"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {userData.currency}{userData.wallet.toLocaleString()}
                    </motion.h3>



                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-2">

                <motion.button>
                  <Link
                    to="/wallet"
                    className="flex-1 animate-pulse bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-6 py-3 rounded-xl font-semibold text-white border border-gray-600 transition-all duration-300 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}><IoGameControllerSharp className='text-small' />
                    Wallet</Link>
                </motion.button>

                <motion.button>
                  <Link
                    to="/games"
                    className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-6 py-3 rounded-xl font-semibold text-white border border-gray-600 transition-all duration-300 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}><FaArrowDown className="text-sm" />
                    Small Games</Link>
                </motion.button>
              </div>
            </div>

            {/* Quick Match */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-orange-700/30 shadow-2xl text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3 bg-gradient-to-r from-orange-700 to-orange-800 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <FaFire className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">⚡ Quick Match</h3>
              <p className="text-gray-400 text-sm mb-6">Find opponents instantly and start hustling!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/quick-match"
                  className="inline-block bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-300 w-full"
                >
                  🎯 Find Opponent
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Game Modes */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-yellow-700/20 shadow-2xl hover:border-yellow-600/30 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-yellow-700 to-yellow-800 rounded-lg">
                  <FaBolt className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-bold text-white">⚡ Speed Mode</h4>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Race against time! Pot all balls in under 60 seconds. Fast-paced action where winner takes all stakes.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/speed-mode"
                  className="inline-block w-full bg-gradient-to-r from-yellow-700 to-yellow-800 hover:from-yellow-800 hover:to-yellow-900 px-6 py-3 rounded-xl text-white font-semibold text-center shadow-lg transition-all duration-300"
                >
                  Play Speed Mode
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-green-700/20 shadow-2xl hover:border-green-600/30 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-700 to-green-800 rounded-lg">
                  <FaExchangeAlt className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-bold text-white">🔄 Turn-Turn Mode</h4>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Classic 8-ball strategy. Take turns, outsmart your opponent, and claim victory through skill and precision.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/turn-mode"
                  className="inline-block w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 px-6 py-3 rounded-xl text-white font-semibold text-center shadow-lg transition-all duration-300"
                >
                  Play Turn Mode
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Game History */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <FaHistory className="text-white text-lg" />
              </div>
              <h3 className="text-2xl font-bold text-white">📜 Recent Games</h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {history.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === "PAYOUT" || item.type === "DEPOSIT"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}>
                        {item.type === "PAYOUT" ? "🏆" : item.type === "DEPOSIT" ? "💰" : "📉"}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {item.type}
                        </div>
                        <div className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${(item.type === "PAYOUT" || item.type === "DEPOSIT") ? "text-green-400" : "text-red-400"
                      }`}>
                      {(item.type === "PAYOUT" || item.type === "DEPOSIT") ? "+" : ""}{userData.currency}{Math.abs(item.amount).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Enhanced Footer */}
      <motion.footer
        className="text-center pb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-gray-400 text-sm mb-2">Ready to climb the ranks?</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/leaderboards"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-300"
          >
            <FaCrown className="text-yellow-400" />
            View Leaderboard
          </Link>
        </motion.div>
      </motion.footer>
    </div>
  );
};

export default Success;
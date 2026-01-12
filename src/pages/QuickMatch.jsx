import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { TfiAlignJustify, TfiAlignLeft } from "react-icons/tfi";
import { IoGameControllerSharp } from "react-icons/io5";
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaUser,
  FaWallet,
  FaGamepad,
  FaSignOutAlt,
  FaTrophy,
  FaCrown,
  FaBolt,
  FaFire,
  FaStar,
} from 'react-icons/fa';

const QuickMatch = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchPhase, setSearchPhase] = useState(0);

  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') || 'turn';
  const stake = parseFloat(queryParams.get('stake')) || 10;

  const [waitingTime, setWaitingTime] = useState(0);
  const maxWaitTime = 60; // 60 seconds timeout

  const modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1);

  const searchMessages = [
    `[${modeDisplay}] Scanning the arena...`,
    `[${modeDisplay}] Finding worthy opponents...`,
    `[${modeDisplay}] Checking player skills...`,
    `[${modeDisplay}] Almost there...`,
    `[${modeDisplay}] Match found!`
  ];

  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [profRes, balRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/auth/profile`, { headers }),
          fetch(`${apiUrl}/wallet/balance`, { headers }),
          fetch(`${apiUrl}/game/stats`, { headers })
        ]);

        if (!profRes.ok || !balRes.ok) throw new Error('Failed to load user data');

        const profile = await profRes.json();
        const balance = await balRes.json();
        const stats = await statsRes.json(); // May be empty if fetch failed, handle gracefully if needed

        if (balance.available < stake) {
          showToast(`Insufficient funds! Stake is ₵${stake}.`, 'error');
          navigate('/wallet');
          return;
        }

        // Construct User Object
        const enrichedUser = {
          id: profile.id,
          username: profile.name || profile.email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${profile.name}&background=random`,
          wallet: balance.available,
          currency: balance.currency,
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          winRate: stats.winRate ? Math.round(stats.winRate) : 0,
          rank: (stats.wins > 50) ? 'Diamond' : (stats.wins > 20) ? 'Platinum' : 'Gold',
          level: Math.floor((stats.totalGames || 0) / 5) + 1
        };

        setUserData(enrichedUser);

        // Connect Socket
        connectSocket(enrichedUser.id);

        socket.emit('joinQueue', {
          userId: enrichedUser.id,
          stake: stake,
          mode: mode
        });

      } catch (err) {
        console.error(err);
        showToast('Failed to join matchmaking queue', 'error');
        navigate('/games');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('matchFound', (data) => {
      setOpponent({
        name: data.opponentId, // In real app, we might need to fetch opponent details or backend sends name
        avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
        rank: "Opponent",
        wins: '?',
        winRate: '?'
      });
      setMatchData(data);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        setShowSummary(true);
      }, 2500);
    });

    socket.on('waitingInQueue', (data) => {
      console.log('Waiting...', data.message);
    });

    // Search phase animation
    const phaseInterval = setInterval(() => {
      setSearchPhase(prev => (prev + 1) % searchMessages.length);
    }, 1500);

    // Timer for real-time wait duration
    const timerInterval = setInterval(() => {
      setWaitingTime(prev => {
        if (prev >= maxWaitTime) {
          clearInterval(timerInterval);
          showToast('Matchmaking timeout. Please try again.', 'error');
          navigate('/games');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(timerInterval);
      socket.off('matchFound');
      socket.off('waitingInQueue');
      // Leave queue on unmount
      if (userData?.id) {
        socket.emit('leaveQueue', { userId: userData.id, mode });
      }
    };
  }, [navigate, showToast, mode, stake, userData?.id]);

  if (loading || !userData) return <LoadingSpinner text={`[${modeDisplay}] Entering Arena...`} />;

  // Alias userData to user for existing JSX compatibility
  const user = userData;

  const getRankColor = (rank) => {
    const colors = {
      Diamond: 'from-cyan-400 to-blue-500',
      Platinum: 'from-gray-300 to-gray-500',
      Gold: 'from-yellow-400 to-yellow-600',
    };
    return colors[rank] || 'from-gray-400 to-gray-600';
  };

  const getRankIcon = (rank) => {
    if (rank === 'Diamond') return <FaCrown className="text-cyan-400" />;
    if (rank === 'Platinum') return <FaStar className="text-gray-300" />;
    return <FaTrophy className="text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-black text-white flex pt-20 relative overflow-hidden">

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      {/* Enhanced Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        className={`fixed md:static top-16 md:top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 p-6 flex flex-col justify-between transition-transform z-40 md:translate-x-0`}
      >
        <div className="space-y-8">
          {/* User Profile Card */}
          <motion.div
            className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-xl border border-slate-600/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full ring-2 ring-blue-500" />
                <motion.div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user.username}</h2>
                <div className="flex items-center gap-1">
                  {getRankIcon(user.rank)}
                  <p className="text-xs text-gray-300">{user.rank} • Lvl {user.level}</p>
                </div>
              </div>
            </div>

            {/* Win Rate Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-green-400 font-bold">{user.winRate}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.winRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30"
              whileHover={{ scale: 1.05, borderColor: 'rgb(34 197 94)' }}
            >
              <FaTrophy className="text-green-400 mb-1" />
              <p className="text-2xl font-bold">{user.wins}</p>
              <p className="text-xs text-gray-400">Wins</p>
            </motion.div>
            <motion.div
              className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30"
              whileHover={{ scale: 1.05, borderColor: 'rgb(239 68 68)' }}
            >
              <FaFire className="text-red-400 mb-1" />
              <p className="text-2xl font-bold">{user.losses}</p>
              <p className="text-xs text-gray-400">Losses</p>
            </motion.div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
              whileHover={{ x: 5 }}
            >
              <FaWallet className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Wallet Balance</p>
                <p className="font-bold text-blue-400">{user.currency || '₵'}{user.wallet.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-600/20 border border-blue-500/30"
              whileHover={{ x: 5 }}
            >
              <FaGamepad className="text-blue-400" />
              <p className="font-medium">Quick Match</p>
              <FaBolt className="ml-auto text-yellow-400" />
            </motion.div>
          </div>
        </div>

        <motion.button
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition p-3 rounded-lg hover:bg-red-500/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSignOutAlt /> Logout
        </motion.button>
      </motion.aside>

      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-4 absolute top-4 right-4 z-50 text-white bg-slate-800 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {sidebarOpen ? <TfiAlignLeft /> : <TfiAlignJustify />}
      </motion.button>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center text-center gap-8 relative z-10">
        <AnimatePresence mode="wait">
          {!showSummary && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Animated Radar */}
              <div className="relative w-64 h-64 mx-auto">
                <motion.div
                  className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />

                {/* Center Icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <FaGamepad className="text-6xl text-blue-400" />
                </motion.div>
              </div>

              <motion.div
                key={searchPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {searchMessages[searchPhase]}
                </h2>
              </motion.div>

              <div className="flex items-center justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="bg-slate-800/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-700 shadow-lg shadow-blue-500/10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 text-sm uppercase tracking-widest font-bold">Estimated Wait: ~15s</div>
                  <div className="text-white text-2xl font-black">
                    {waitingTime}s <span className="text-gray-500 text-lg">/ {maxWaitTime}s</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showSummary && opponent && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700/50"
            >
              <motion.h3
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎯 Match Found!
              </motion.h3>

              {/* VS Section */}
              <div className="flex items-center justify-center gap-8 my-8">
                {/* User */}
                <motion.div
                  className="text-center"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.img
                      src={user.avatar}
                      className="w-24 h-24 rounded-full mx-auto ring-4 ring-blue-500 shadow-lg shadow-blue-500/50"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-2">
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                  <p className="text-white mt-3 font-bold text-lg">{user.username}</p>
                  <p className="text-sm text-blue-400">{user.rank}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-400">{user.wins}W • {user.losses}L</p>
                    <p className="text-xs text-green-400 font-semibold">{user.winRate}% WR</p>
                  </div>
                </motion.div>

                {/* VS Badge */}
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center shadow-xl">
                    VS
                  </div>
                </motion.div>

                {/* Opponent */}
                <motion.div
                  className="text-center"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.img
                      src={opponent.avatar}
                      className="w-24 h-24 rounded-full mx-auto ring-4 ring-red-500 shadow-lg shadow-red-500/50"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    />
                    <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-2">
                      {getRankIcon(opponent.rank)}
                    </div>
                  </div>
                  <p className="text-white mt-3 font-bold text-lg">{opponent.name}</p>
                  <p className="text-sm text-red-400">{opponent.rank}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-400">{opponent.wins}W</p>
                    <p className="text-xs text-green-400 font-semibold">{opponent.winRate}% WR</p>
                  </div>
                </motion.div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-3 gap-4 mb-6 mt-8">
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Mode</p>
                  <p className="font-bold">{modeDisplay}</p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Stakes</p>
                  <p className="font-bold text-yellow-400">₵{stake}</p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Best Of</p>
                  <p className="font-bold">3 Games</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={() => {
                    if (matchData) {
                      const path = matchData.mode === 'speed'
                        ? `/speed-mode/arena/${matchData.gameId}`
                        : `/turn-mode/${matchData.gameId}`;
                      navigate(path);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Game</span><IoGameControllerSharp size={25} />

                </motion.button>
                <motion.button
                  className="px-6 py-4 rounded-xl font-bold border-2 border-slate-600 hover:bg-slate-700/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Decline
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Opponent Found Popup */}
      <AnimatePresence>
        {showPopup && opponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/90 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 text-center p-10 rounded-2xl shadow-2xl border border-green-500/30 relative overflow-hidden"
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 relative z-10">
                  Opponent Found!
                </h3>
              </motion.div>

              <motion.img
                src={opponent.avatar}
                alt="opponent"
                className="w-28 h-28 rounded-full mx-auto mt-6 ring-4 ring-green-500 shadow-xl shadow-green-500/50 relative z-10"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "linear" }}
              />

              <p className="text-white mt-4 font-bold text-2xl relative z-10">{opponent.name}</p>
              <p className="text-gray-300 text-sm mt-2 relative z-10 flex items-center justify-center gap-2">
                {getRankIcon(opponent.rank)}
                {opponent.rank} • {opponent.winRate}% Win Rate
              </p>

              <motion.p
                className="text-yellow-400 text-sm mt-4 font-semibold relative z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Entering arena...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickMatch;
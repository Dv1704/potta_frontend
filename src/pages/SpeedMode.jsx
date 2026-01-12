import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCoins, FaBolt, FaClock, FaTrophy, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SpeedMode = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeGames, setActiveGames] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [gamesRes, balanceRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/game/active`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/wallet/balance`, { headers })
        ]);

        if (balanceRes.ok) {
          const balData = await balanceRes.json();
          setBalance(balData.available);
        }

        if (gamesRes.ok) {
          const data = await gamesRes.json();
          // Transform data to match UI needs if necessary, or use as is
          // The endpoint returns { id, player1, player2, bet, timeLeft, mode }
          // We might need to enrich it or add placeholder values for "difficulty", "prizePool"
          const enrichedData = data.map(game => ({
            ...game,
            difficulty: game.bet > 100 ? 'Hard' : (game.bet > 50 ? 'Medium' : 'Easy'),
            prizePool: game.bet * 2, // Simple estimation
            timeLimit: '60s',
            playersWatching: Math.floor(Math.random() * 50) + 1 // Mock watching count
          }));
          setActiveGames(enrichedData);
        } else {
          setActiveGames([]);
        }
      } catch (err) {
        console.error('Failed to load speed mode games:', err);
        showToast('Failed to load active games', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [showToast]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'Hard': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 pt-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Lightning Bolt Decorations */}
      <motion.div
        className="absolute top-20 left-10 text-yellow-400/20 text-6xl"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FaBolt />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-orange-400/20 text-6xl"
        animate={{
          rotate: [0, -10, 10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        <FaBolt />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaBolt className="text-yellow-400 text-4xl" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Speed Mode
            </h1>
            <FaBolt className="text-orange-400 text-4xl" />
          </motion.div>

          <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto">
            Pot all balls in under 60 seconds. Can you handle the pressure? Join a game and test your skills!
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/30">
              <FaFire className="text-yellow-400" />
              <span className="text-sm font-semibold">{activeGames.length} Active Games</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/30">
              <FaUser className="text-blue-400" />
              <span className="text-sm font-semibold">269 Players Online</span>
            </div>
            <div className="flex items-center gap-2 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/30">
              <FaCoins className="text-green-400" />
              <span className="text-sm font-semibold">₵45K Total Pool</span>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <LoadingSpinner text="[Speed] Loading Arena..." />
            </div>
          ) : activeGames.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-gray-600">
              <p className="text-xl text-gray-400 mb-2">No active speed games found.</p>
              <p className="text-sm text-gray-500">Be the first to start a match!</p>
            </div>
          ) : (
            activeGames.map((game, index) => (
              <motion.div
                key={game.id}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Card */}
                <div className="relative bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden">
                  {/* Header with Players */}
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 border-b border-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                          <FaUser className="text-white text-xs" />
                        </div>
                        <span className="font-semibold text-sm">{game.player1}</span>
                      </div>

                      <motion.div
                        className="text-yellow-400 font-bold"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        VS
                      </motion.div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{game.player2}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                          <FaUser className="text-white text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex justify-center">
                      <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(game.difficulty)} font-semibold`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Game Preview Area */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-40 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"></div>
                    <motion.div
                      className="relative z-10 text-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaBolt className="text-yellow-400 text-5xl mx-auto mb-2 drop-shadow-lg" />
                      <p className="text-gray-400 text-sm font-semibold">Speed Challenge</p>
                    </motion.div>

                    {/* Animated lines */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </div>

                  {/* Game Stats */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaClock className="text-blue-400" />
                        <span>Time Limit: <span className="font-semibold text-white">{game.timeLimit}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <FaCoins />
                        <span>₵{game.bet.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaTrophy className="text-yellow-400" />
                        <span>Prize: <span className="font-semibold text-white">₵{game.prizePool.toLocaleString()}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <FaUser />
                        <span className="text-xs">{game.playersWatching} watching</span>
                      </div>
                    </div>

                    {/* Join Button */}
                    <motion.button
                      onClick={() => {
                        if (balance < game.bet) {
                          showToast(`Insufficient funds! Need ₵${game.bet.toLocaleString()}`, 'error');
                          navigate('/wallet');
                        } else {
                          navigate(`/speed-mode/arena/${game.id}`);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Join Game
                    </motion.button>
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4">
                    <motion.div
                      className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/50"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 text-xs font-semibold">LIVE</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-400 mb-4">Don't see a match you like?</p>
          <motion.button
            onClick={() => navigate('/quick-match?mode=speed')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Own Game
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SpeedMode;
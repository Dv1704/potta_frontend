import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Zap, Crown, Medal, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const Leaderboards = () => {
  const [players, setPlayers] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    activePlayers: 0,
    totalWinnings: 0,
    gamesToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/game/leaderboard', token);
        const data = await response.json();

        if (response.ok) {
          // Map backend data to frontend format
          const mappedPlayers = data.topPlayers.map((player, index) => ({
            name: player.name,
            score: `GHC ${player.earnings.toLocaleString()}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=150`,
            streak: player.streak,
            games: player.totalGames
          }));
          setPlayers(mappedPlayers);
          setPlatformStats(data.platformStats);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);
  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (index) => {
    if (index === 0) return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
    if (index === 1) return "from-gray-400/20 to-gray-500/5 border-gray-400/30";
    if (index === 2) return "from-orange-500/20 to-orange-600/5 border-orange-500/30";
    return "from-gray-700/20 to-gray-800/5 border-gray-600/20";
  };

  return (
    <section id="leaders" className="relative bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 text-white px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Live Rankings</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Top Hustlers
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            See who's dominating the tables and making bank in real-time
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Users, label: "Active Players", value: platformStats.activePlayers.toLocaleString() },
            { icon: TrendingUp, label: "Total Winnings", value: `GHC ${platformStats.totalWinnings.toLocaleString()}` },
            { icon: Zap, label: "Games Today", value: platformStats.gamesToday.toString() },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center hover:border-blue-500/50 transition-all"
            >
              <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>

          <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/50">
                    <th className="py-4 px-4 sm:px-6 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">
                      Player
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                      Streak
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                      Games
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
                      Winnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {players.map((player, index) => (
                    <motion.tr
                      key={index}
                      className={`bg-gradient-to-r ${getRankColor(index)} hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.5 }}
                      whileHover={{ x: 5 }}
                    >
                      <td className="py-5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white min-w-[1.5rem]">
                            {index + 1}
                          </span>
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="py-5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-blue-500/50 group-hover:ring-blue-400 transition-all"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm sm:text-base group-hover:text-blue-300 transition-colors">
                              {player.name}
                            </p>
                            <p className="text-xs text-gray-500 sm:hidden">
                              {player.streak} wins • {player.games} games
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 sm:px-6 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">{player.streak}</span>
                          <span className="text-gray-500 text-xs">wins</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 sm:px-6 hidden md:table-cell">
                        <span className="text-gray-400">{player.games}</span>
                      </td>
                      <td className="py-5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="font-bold text-green-400 text-sm sm:text-base">
                            {player.score}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View All Button */}
            <div className="bg-gray-800/30 border-t border-gray-700/30 py-4 text-center">
              <button className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
                View Full Leaderboard →
              </button>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 sm:p-12">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Think you've got what it takes?
            </h3>
            <p className="text-gray-400 text-base sm:text-lg mb-6 max-w-xl mx-auto">
              Join matches, earn cash, and climb the leaderboard to claim your spot among the legends!
            </p>
            <Link
              to="/success"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Enter the Arena
            </Link>
          </div>
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-950/50 to-purple-950/50 backdrop-blur-sm rounded-2xl py-10 px-6 text-center border border-blue-800/30 shadow-xl">
            <Users className="w-10 h-10 text-blue-400 mx-auto mb-4" />
            <h4 className="text-xl sm:text-2xl font-bold text-blue-300 mb-3">
              Join 1,000+ players in the Potta Arena
            </h4>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Build your name, earn real rewards, and let your skills speak louder than luck. The arena awaits your dominance.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">GHC {platformStats.totalWinnings.toLocaleString()}</p>
                <p className="text-gray-500">Paid Out</p>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{platformStats.gamesToday}</p>
                <p className="text-gray-500">Games Today</p>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{platformStats.activePlayers.toLocaleString()}</p>
                <p className="text-gray-500">Active Players</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Leaderboards;
import { useState, useEffect } from 'react';
import { FaUser, FaBolt, FaCoins } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SpeedArenaDashboard = () => {
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/game/active`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setGames(data);
        } else {
          // Fallback to sample data only if offline or error, or keep empty
          // For now, let's keep it empty to encourage real usage
          setGames([]);
        }
      } catch (err) {
        console.error('Failed to load active games:', err);
        showToast('Could not load active games', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();

    // Refresh interval
    const interval = setInterval(fetchGames, 5000); // Poll every 5s

    // Countdown logic for UI effect only (server controls real time)
    const timer = setInterval(() => {
      setGames(prev =>
        prev.map(game => ({
          ...game,
          timeLeft: game.timeLeft > 0 ? game.timeLeft - 1 : 0,
        }))
      );
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [showToast]);

  // ✅ Navigates to arena page with game details
  const handleJoinGame = (game) => {
    navigate(`/speed-mode/arena/${game.id}`, { state: game });
  };

  return (
    // ✅ Added top padding with pt-24 so it doesn't overlap with Navbar
    <div className="min-h-screen bg-slate-900 p-6 text-white pt-24">
      {loading && <LoadingSpinner text="Scanning Arena..." />}

      {/* 🏁 Page Title */}
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
        <FaBolt /> Speed Arena Dashboard
      </h1>

      {/* 🎮 List of active games */}
      {!loading && games.length === 0 && (
        <div className="text-center text-gray-400 py-10 bg-slate-800 rounded-xl border border-slate-700">
          <FaBolt className="mx-auto text-4xl mb-4 text-slate-600" />
          <p>No active speed games currently.</p>
          <p className="text-sm">Create a new match in Quick Match!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <div
            key={game.id}
            className="bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:scale-[1.02] transition"
          >
            {/* 🧑‍🤝‍🧑 Player info */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-green-400" />
                <span className="font-semibold">{game.player1}</span>
                <span className="text-gray-400">vs</span>
                <FaUser className="text-red-400" />
                <span className="font-semibold">{game.player2}</span>
              </div>

              {/* 💰 Bet amount */}
              <span className="text-yellow-400 font-bold">
                <FaCoins className="inline mr-1" /> {game.bet}
              </span>
            </div>

            {/* ⏱️ Time left countdown */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">Time Left:</span>
              <span className="font-bold text-blue-400">{game.timeLeft}s</span>
            </div>

            {/* 🚪 Join button */}
            <button
              onClick={() => handleJoinGame(game)}
              className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg w-full transition"
            >
              Join Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeedArenaDashboard;

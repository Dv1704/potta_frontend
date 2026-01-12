// src/pages/MatchSummary.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${apiUrl}/game/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load match details');

        const data = await res.json();
        setMatchData(data);
      } catch (error) {
        console.error(error);
        showToast('Could not load match summary', 'error');
        // Fallback or redirect might be needed, but staying on page allows user to see error
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatchDetails();
    }
  }, [id, navigate, showToast]);

  if (loading) return <LoadingSpinner text="Loading Match Results..." />;

  if (!matchData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Match not found</p>
          <button onClick={() => navigate('/games')} className="text-blue-400 hover:text-blue-300">Back to Games</button>
        </div>
      </div>
    );
  }

  const { result, opponent, winnings, currency } = matchData;
  // Fallback if opponent is not found (e.g. playing against AI or data issue)
  const opponentName = opponent?.name || opponent?.email || 'Unknown Opponent';
  const opponentAvatar = opponent?.avatar || 'https://via.placeholder.com/150';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 ${result === 'WIN' ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-500 rounded-full blur-2xl opacity-10" />
      </div>

      <div className="relative z-10 bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 w-full max-w-md text-center shadow-2xl">
        <h1 className="text-3xl font-black mb-8 uppercase tracking-wider text-gray-100">Match Summary</h1>

        <div className="space-y-6">
          <div className="relative inline-block">
            <div className={`absolute inset-0 rounded-full blur-md ${result === 'WIN' ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
            <img src={opponentAvatar} alt="opponent" className="w-24 h-24 rounded-full relative z-10 border-4 border-gray-800" />
          </div>

          <div>
            <p className="text-sm text-gray-400 uppercase tracking-widest">Opponent</p>
            <p className="text-2xl font-bold">{opponentName}</p>
          </div>

          <div className="py-6 border-t border-b border-gray-700/50">
            <p className={`text-5xl font-black ${result === 'WIN' ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]'}`}>
              {result === 'WIN' ? 'YOU WON!' : 'YOU LOST'}
            </p>
            {result === 'WIN' && (
              <p className="text-xl text-green-300 mt-2 font-bold">
                +{currency || 'GH₵'}{winnings.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/games')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/leaderboards')}
              className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold text-gray-300 transition-all"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSummary;

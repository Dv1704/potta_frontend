import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaUser, FaStopwatch, FaCoins, FaArrowLeft, FaGamepad } from 'react-icons/fa';
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SpeedArena = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gameState, setGameState] = useState(null);
  const [shotParams, setShotParams] = useState({ angle: 0, power: 100 });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch authenticated user info to establish identity
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to verify user identity');

        const user = await response.json();
        setUserId(user.id);

        // Connect Socket with real ID
        connectSocket(user.id);
        socket.emit('joinGame', { gameId });
        socket.emit('getGameState', { gameId });

      } catch (err) {
        console.error('Game initialization failed:', err);
        showToast('Failed to join game arena', 'error');
        navigate('/dashboard');
      } finally {
        // Keep loading true until we get initial game state to avoid flickering
      }
    };

    initGame();

    const handleGameState = (state) => {
      setGameState(state);
      setLoading(false); // Game state received, ready to show UI
    };

    const handleShotResult = (data) => {
      setGameState(data.gameState);
    };

    const handleGameEnded = (data) => {
      showToast(data.message || 'Game Over', 'info');
      navigate('/dashboard');
    };

    socket.on('gameState', handleGameState);
    socket.on('shotResult', handleShotResult);
    socket.on('gameEnded', handleGameEnded);

    return () => {
      socket.off('gameState');
      socket.off('shotResult');
      socket.off('gameEnded');
    };
  }, [gameId, navigate, showToast]);

  // Derived state that depends on userId being set
  useEffect(() => {
    if (gameState && userId) {
      setIsMyTurn(gameState.turn === userId);
    }
  }, [gameState, userId]);

  const handleTakeShot = () => {
    if (!isMyTurn || !userId) return;
    socket.emit('takeShot', {
      gameId,
      userId,
      angle: parseFloat(shotParams.angle),
      power: parseFloat(shotParams.power),
    });
  };

  if (loading || !gameState) return <LoadingSpinner text="Connecting to Arena..." />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
              <FaBolt className="text-yellow-400" /> SPEED ARENA
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-800 px-6 py-2 rounded-xl flex items-center gap-2 border border-blue-500/20">
              <FaStopwatch className={`${gameState.timer < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
              <span className={`text-2xl font-black ${gameState.timer < 10 ? 'text-red-500' : 'text-white'}`}>{gameState.timer}s</span>
            </div>
            <div className={`px-6 py-2 rounded-xl border-2 transition-all ${isMyTurn ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800'}`}>
              <span className="text-lg font-bold">{isMyTurn ? 'YOUR SHOT' : 'OPPONENT THINKING...'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Simple Visualization of Table */}
            <div className="relative aspect-[2/1] bg-blue-900/20 rounded-3xl p-6 border-4 border-slate-800 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-4 border border-blue-500/10 rounded-2xl" />
              <div className="relative w-full h-full">
                {Object.entries(gameState.balls).map(([num, ball]) => (
                  ball.onTable && (
                    <motion.div
                      key={num}
                      initial={false}
                      animate={{
                        x: (ball.x / 1842) * 100 + '%',
                        y: (ball.y / 3680) * 100 + '%'
                      }}
                      className={`absolute w-4 h-4 rounded-full translate-x-[-50%] translate-y-[-50%] shadow-lg flex items-center justify-center text-[8px] font-bold
                        ${num === '0' ? 'bg-white text-black' : 'bg-blue-500 text-white border border-cyan-300'}`}
                    >
                      {num !== '0' && num}
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Aim & Fire</h3>
              <div className="space-y-6">
                <input
                  type="range" min="0" max="360" value={shotParams.angle}
                  onChange={(e) => setShotParams({ ...shotParams, angle: e.target.value })}
                  className="w-full accent-cyan-500"
                  disabled={!isMyTurn}
                />
                <input
                  type="range" min="10" max="150" value={shotParams.power}
                  onChange={(e) => setShotParams({ ...shotParams, power: e.target.value })}
                  className="w-full accent-blue-500"
                  disabled={!isMyTurn}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-4 rounded-2xl font-black tracking-widest transition-all
                    ${isMyTurn ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-600'}`}
                >
                  FIRE SHOT
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedArena;

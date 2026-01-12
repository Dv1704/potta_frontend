import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCircle, FaUndo, FaArrowLeft, FaGamepad, FaClock, FaBolt, FaTrophy, FaUser } from 'react-icons/fa';
import { socket, connectSocket } from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const TurnMode = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gameState, setGameState] = useState(null);
  const [lastShotResult, setLastShotResult] = useState(null);
  const [shotParams, setShotParams] = useState({ angle: 0, power: 100 });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/quick-match');
      return;
    }

    connectSocket(userId);
    socket.emit('joinGame', { gameId });

    const handleGameState = (state) => {
      setGameState(state);
      setIsMyTurn(state.turn === userId);
    };

    const handleShotResult = (data) => {
      setLastShotResult(data.shotResult);
      setGameState(data.gameState);
      setIsMyTurn(data.gameState.turn === userId);
    };

    const handleGameEnded = (data) => {
      showToast(data.message || 'Game Ended', 'info');
      navigate('/dashboard');
    };

    socket.on('gameState', handleGameState);
    socket.on('shotResult', handleShotResult);
    socket.on('gameEnded', handleGameEnded);

    // Initial fetch
    socket.emit('getGameState', { gameId });

    return () => {
      socket.off('gameState');
      socket.off('shotResult');
      socket.off('gameEnded');
    };
  }, [gameId, userId, navigate, showToast]);

  const handleTakeShot = () => {
    if (!isMyTurn) return;

    socket.emit('takeShot', {
      gameId,
      userId,
      angle: parseFloat(shotParams.angle),
      power: parseFloat(shotParams.power),
      sideSpin: 0,
      backSpin: 0
    });
  };

  if (!gameState) return <LoadingSpinner text="Connecting to Arena..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-4 md:p-8 pt-24 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Stats */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#1e293b]/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-white/5"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">COMPETITIVE ARENA</h2>
              </div>
              <p className="text-xs text-blue-400 font-mono mt-1">MATCH ID: <span className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{gameId?.slice(0, 8)}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-end">
            <motion.div
              animate={{
                borderColor: isMyTurn ? 'rgb(34, 197, 94)' : 'rgb(51, 65, 85)',
                boxShadow: isMyTurn ? '0 0 20px rgba(34, 197, 94, 0.2)' : 'none'
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all bg-slate-900/50`}
            >
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</span>
                <span className={`text-sm font-bold ${isMyTurn ? 'text-green-400' : 'text-slate-400'}`}>
                  {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Table Area */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[2/1] bg-[#1a4731] rounded-[2.5rem] p-4 shadow-2xl border-[16px] border-[#3e2723] shadow-black/50 overflow-hidden ring-1 ring-white/10">
              {/* Table lighting effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10"></div>

              {/* Pockets */}
              <div className="absolute top-0 left-0 w-14 h-14 bg-[#0a0a0a] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />
              <div className="absolute top-0 right-0 w-14 h-14 bg-[#0a0a0a] rounded-full translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />
              <div className="absolute bottom-0 left-0 w-14 h-14 bg-[#0a0a0a] rounded-full -translate-x-1/2 translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />
              <div className="absolute bottom-0 right-0 w-14 h-14 bg-[#0a0a0a] rounded-full translate-x-1/2 translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />
              <div className="absolute top-0 left-1/2 w-14 h-14 bg-[#0a0a0a] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />
              <div className="absolute bottom-0 left-1/2 w-14 h-14 bg-[#0a0a0a] rounded-full -translate-x-1/2 translate-y-1/2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] z-0" />

              {/* Balls */}
              <div className="relative w-full h-full z-20">
                {Object.entries(gameState.balls).map(([num, ball]) => (
                  ball.onTable && (
                    <motion.div
                      key={num}
                      initial={false}
                      animate={{
                        x: (ball.x / 1842) * 100 + '%',
                        y: (ball.y / 3680) * 100 + '%'
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`absolute w-[1.8%] aspect-square rounded-full translate-x-[-50%] translate-y-[-50%] shadow-[2px_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-[min(0.8vw,8px)] font-bold border border-white/20
                        ${num === '0' ? 'bg-gradient-to-br from-white to-gray-200 text-black' :
                          num === '8' ? 'bg-gradient-to-br from-gray-800 to-black text-white' :
                            parseInt(num) <= 7 ? 'bg-gradient-to-br from-red-500 to-red-700 text-white' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'}`}
                    >
                      {num !== '0' && num}
                      <div className="absolute top-1 right-1 w-[20%] h-[20%] bg-white rounded-full opacity-40"></div>
                    </motion.div>
                  )
                ))}
              </div>

              {/* Felt Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 pointer-events-none z-10 mix-blend-overlay" />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1e293b]/90 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white border-b border-gray-700 pb-3">
                <FaGamepad className="text-blue-400" /> SHOT CONTROLS
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Angle</label>
                    <span className="text-xs font-mono text-blue-400 font-bold">{shotParams.angle}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360"
                    value={shotParams.angle}
                    onChange={(e) => setShotParams({ ...shotParams, angle: e.target.value })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Power</label>
                    <span className="text-xs font-mono text-green-400 font-bold">{shotParams.power}%</span>
                  </div>
                  <input
                    type="range" min="10" max="150"
                    value={shotParams.power}
                    onChange={(e) => setShotParams({ ...shotParams, power: e.target.value })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <motion.button
                  whileHover={isMyTurn ? { scale: 1.02 } : {}}
                  whileTap={isMyTurn ? { scale: 0.98 } : {}}
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
                    ${isMyTurn
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 ring-1 ring-white/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                >
                  <FaBolt className={isMyTurn ? "text-yellow-300" : ""} />
                  {isMyTurn ? 'EXECUTE SHOT' : 'WAIT FOR TURN'}
                </motion.button>
              </div>
            </div>

            {/* Event Log */}
            <div className="bg-[#1e293b]/90 p-5 rounded-3xl border border-gray-700/50 backdrop-blur-xl shadow-xl flex flex-col h-64">
              <h3 className="text-xs text-gray-400 uppercase font-bold mb-4 flex items-center gap-2">
                <FaClock className="text-green-400" /> Match Feed
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                <AnimatePresence>
                  {lastShotResult ? (
                    <>
                      {lastShotResult.pocketedBalls.length > 0 && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                          className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                        >
                          <p className="text-sm text-green-400 font-semibold flex items-center gap-2">
                            <FaCircle className="text-[6px]" /> Potted {lastShotResult.pocketedBalls.length} ball(s)
                          </p>
                          <div className="flex gap-1 mt-1">
                            {lastShotResult.pocketedBalls.map(ball => (
                              <span key={ball} className="text-xs bg-green-500/20 px-1.5 rounded">{ball}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {lastShotResult.cueBallScratched && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <p className="text-sm text-red-400 font-bold flex items-center gap-2">
                            <FaCircle className="text-[6px]" /> FOUL: SCRATCH!
                          </p>
                        </motion.div>
                      )}

                      {lastShotResult.pocketedBalls.length === 0 && !lastShotResult.cueBallScratched && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                          className="p-3 bg-slate-800/50 rounded-lg"
                        >
                          <p className="text-sm text-slate-400 italic">No balls potted.</p>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center mt-10">Match started. Waiting for first break...</p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnMode;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCircle, FaArrowLeft, FaGamepad, FaClock,
  FaBolt, FaTrophy, FaUser, FaShieldAlt,
  FaBullseye, FaAdjust
} from 'react-icons/fa';
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
      navigate('/login');
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
      showToast(data.message || 'Game Over', 'info');
      setTimeout(() => navigate('/dashboard'), 3000);
    };

    socket.on('gameState', handleGameState);
    socket.on('shotResult', handleShotResult);
    socket.on('gameEnded', handleGameEnded);

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

  if (!gameState) return <LoadingSpinner text="Connecting to Match..." />;

  const potAmount = gameState.stake * 2 * 0.9;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header HUD */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-blue-400" />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Turn Masters</h2>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Arena // {gameId?.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 text-center">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Prize Pool</p>
              <div className="text-2xl font-black flex items-center gap-1 justify-center">
                <span className="text-blue-500">GHC </span>
                <span>{(potAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <motion.div
              animate={{ borderColor: isMyTurn ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.05)' }}
              className={`px-8 py-4 rounded-2xl bg-black/60 border-2 transition-all flex items-center gap-4`}
            >
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-blue-500 animate-pulse' : 'bg-gray-800'}`}></div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Control</p>
                <p className={`text-xl font-black italic ${isMyTurn ? 'text-blue-400' : 'text-gray-600'}`}>
                  {isMyTurn ? "YOUR MOVE" : "OPPONENT'S TURN"}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Simulation Table Area */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[2/1] bg-slate-900 rounded-[3rem] p-6 shadow-2xl border-[20px] border-gray-950 overflow-hidden box-content max-w-full">
              {/* Table Pockets */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute top-0 right-0 w-16 h-16 bg-black rounded-full translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-black rounded-full -translate-x-1/2 translate-y-1/2 z-0" />
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-black rounded-full translate-x-1/2 translate-y-1/2 z-0" />
              <div className="absolute top-0 left-1/2 w-16 h-16 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute bottom-0 left-1/2 w-16 h-16 bg-black rounded-full -translate-x-1/2 translate-y-1/2 z-0" />

              {/* Table Markings */}
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/5"></div>

              {/* Balls View */}
              <div className="relative w-full h-full">
                {/* Visual Cue Stick for Aiming - Always visible */}
                {gameState.balls['0']?.onTable && (
                  <motion.div
                    animate={{ rotate: shotParams.angle }}
                    transition={{ duration: 0.1 }}
                    className="absolute h-2 bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-500 origin-right rounded-full pointer-events-none z-10 shadow-lg shadow-blue-500/50"
                    style={{
                      width: '50%',
                      top: `${gameState.balls['0'].y}%`,
                      left: `${gameState.balls['0'].x}%`,
                      transform: `translate(-100%, -50%) rotate(${shotParams.angle}deg)`,
                      opacity: isMyTurn ? 1 : 0.3
                    }}
                  />
                )}
                {Object.entries(gameState.balls).map(([num, ball]) => (
                  ball.onTable && (
                    <motion.div
                      key={num}
                      initial={false}
                      animate={{ x: `${ball.x}%`, y: `${ball.y}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                      style={{
                        backgroundColor: num === '0' ? '#fff' : num === '8' ? '#000' : ball.color,
                        transform: 'translate(-50%, -50%)',
                        left: 0,
                        top: 0
                      }}
                    >
                      {num !== '0' && (
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-black text-black">{num}</span>
                        </div>
                      )}
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
                <FaGamepad className="text-blue-500" />
                Cue Controls
              </h3>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                    <span>Angle Control</span>
                    <span className="text-blue-400">{shotParams.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={shotParams.angle}
                    onChange={(e) => setShotParams({ ...shotParams, angle: e.target.value })}
                    disabled={!isMyTurn}
                    className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                    <span>Shot Power</span>
                    <span className="text-red-400">{shotParams.power}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={shotParams.power}
                    onChange={(e) => setShotParams({ ...shotParams, power: e.target.value })}
                    disabled={!isMyTurn}
                    className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <button
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl ${isMyTurn
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <FaBullseye />
                  <span>TAKE SHOT</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-900/40 p-6 rounded-[2.5rem] border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Physics Status</p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black italic">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                SERVER AUTHORITATIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnMode;

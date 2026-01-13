import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBolt, FaUser, FaStopwatch, FaCoins,
  FaArrowLeft, FaGamepad, FaShieldAlt,
  FaBullseye, FaAdjust, FaTrophy
} from 'react-icons/fa';
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
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Auth failed');
        const user = await response.json();
        setUserId(user.id);

        connectSocket(user.id);
        socket.emit('joinGame', { gameId });
        socket.emit('getGameState', { gameId });

      } catch (err) {
        showToast('Arena Link Failure', 'error');
        navigate('/dashboard');
      }
    };

    initGame();

    const handleGameState = (state) => {
      setGameState(state);
      setLoading(false);
    };

    const handleShotResult = (data) => {
      setGameState(data.gameState);
    };

    const handleGameEnded = (data) => {
      showToast(data.message || 'Battle Over', 'info');
      setTimeout(() => navigate('/dashboard'), 2500);
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

  if (loading || !gameState) return <LoadingSpinner text="Connecting to High-Speed Arena..." />;

  const isCritical = (gameState.timer || 60) < 15;

  return (
    <div className="min-h-screen bg-[#450a0a] text-white p-4 md:p-8 pt-24 font-sans relative overflow-hidden">
      {/* Red/Speed Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header HUD */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border-2 border-red-500/20 shadow-2xl"
        >
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all text-red-500"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <FaBolt className="text-yellow-500" />
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Speed Arena</h2>
              </div>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] mt-1">Blitz Payout // ID: {gameId?.slice(0, 6)}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* TIMER HUD */}
            <div className={`relative px-10 py-4 rounded-2xl border-2 transition-all duration-300 ${isCritical ? 'bg-red-600 border-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-black/40 border-red-500/30'}`}>
              <div className="flex items-center gap-4">
                <FaStopwatch size={24} className={isCritical ? 'text-white' : 'text-red-500'} />
                <div className="text-left">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-white/80' : 'text-gray-500'}`}>Clock</p>
                  <p className="text-4xl font-black font-mono leading-none">{gameState.timer || 0}s</p>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border-2 bg-black/40 transition-all ${isMyTurn ? 'border-yellow-500' : 'border-white/5'}`}>
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'bg-gray-700'}`}></div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</p>
                <p className={`text-xl font-black italic ${isMyTurn ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {isMyTurn ? "STRIKE NOW" : "RELOADING..."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Table Area */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[2/1] bg-[#7f1d1d] rounded-[3rem] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[24px] border-[#1a0f0e] overflow-hidden">
              {/* Rails & Felt */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')] opacity-40 mix-blend-overlay pointer-events-none z-10" />
              <div className="absolute inset-0 rounded-[2rem] border-[4px] border-white/5 pointer-events-none z-10"></div>

              {/* Pockets */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-black rounded-full translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black rounded-full -translate-x-1/2 translate-y-1/2 z-0" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black rounded-full translate-x-1/2 translate-y-1/2 z-0" />
              <div className="absolute top-0 left-1/2 w-20 h-20 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
              <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-black rounded-full -translate-x-1/2 translate-y-1/2 z-0" />

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
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute w-[4%] aspect-square rounded-full translate-x-[-50%] translate-y-[-50%] shadow-2xl flex items-center justify-center text-[1vw] font-black border border-white/20
                         ${num === '0' ? 'bg-white text-black' :
                          num === '8' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}
                    >
                      {num !== '0' && num}
                      <div className="absolute top-[10%] right-[10%] w-[25%] h-[25%] bg-white/40 rounded-full blur-[1px]"></div>
                    </motion.div>
                  )
                ))}
              </div>

              {/* Aim Line */}
              {isMyTurn && (
                <motion.div
                  style={{
                    rotate: (shotParams.angle + 180) + 'deg',
                    x: (gameState.balls[0].x / 1842) * 100 + '%',
                    y: (gameState.balls[0].y / 3680) * 100 + '%'
                  }}
                  className="absolute w-1 h-[250px] bg-gradient-to-t from-yellow-400/40 to-transparent origin-top -translate-x-1/2 z-10"
                ></motion.div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-red-500/10 shadow-2xl">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <FaAdjust /> Lightning Controls
              </h3>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Aim</p>
                    <p className="text-3xl font-black italic">{shotParams.angle}°</p>
                  </div>
                  <input
                    type="range" min="0" max="360" value={shotParams.angle}
                    onChange={(e) => setShotParams({ ...shotParams, angle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Power</p>
                    <p className="text-3xl font-black italic text-red-400">{shotParams.power}%</p>
                  </div>
                  <input
                    type="range" min="10" max="150" value={shotParams.power}
                    onChange={(e) => setShotParams({ ...shotParams, power: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <button
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-6 rounded-2xl font-black text-xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-3
                    ${isMyTurn
                      ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95'
                      : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}
                >
                  <FaBolt />
                  <span>Strike</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-red-500/40 text-[8px] font-black uppercase tracking-widest">
                <FaShieldAlt size={10} />
                Real-time Anti-Cheat Active
              </div>
            </div>

            {/* Prize Board */}
            <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-yellow-500/20 shadow-2xl text-center">
              <FaTrophy size={40} className="mx-auto text-yellow-500 mb-4" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Winner Takes All</p>
              <p className="text-3xl font-black text-yellow-500">20.00 GH₵</p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Fee (10%)</span>
                  <span>-2.00 GH₵</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-500 font-black uppercase">
                  <span>Net Gain</span>
                  <span>+18.00 GH₵</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedArena;

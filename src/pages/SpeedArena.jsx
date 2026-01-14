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
  const [localTimer, setLocalTimer] = useState(60);

  // Local Timer Countdown Effect
  useEffect(() => {
    if (!gameState || localTimer <= 0) return;
    const interval = setInterval(() => {
      setLocalTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, localTimer]);

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
      console.log('🎱 Game State Received:', state);
      console.log('🎱 Balls:', state.balls);
      console.log('🎱 White Ball (0):', state.balls?.['0']);
      setGameState(state);
      setLocalTimer(state.timer || 60);
      setLoading(false);
    };

    const handleShotResult = (data) => {
      setGameState(data.gameState);
      setLocalTimer(data.gameState.timer || 60);
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

  const isCritical = localTimer < 15;
  const potAmount = gameState.stake * 2 * 0.9;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 font-sans relative overflow-hidden">

      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-full bg-red-600/5 transition-opacity duration-300 ${isCritical ? 'opacity-20' : 'opacity-10'}`}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-orange-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header HUD */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className={`flex flex-col md:flex-row justify-between items-center mb-8 p-6 rounded-[2rem] border-2 transition-all duration-300 shadow-2xl ${isCritical ? 'bg-red-950/80 border-red-500 shadow-red-500/20' : 'bg-gray-900/60 border-white/10'
            }`}
        >
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-yellow-400 animate-pulse" />
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Speed Arena</h2>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">High-Speed Stakes // ID: {gameId?.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* TIMER HUD */}
            <div className={`px-10 py-4 rounded-2xl border transition-all duration-300 ${isCritical ? 'bg-red-600 border-white animate-pulse' : 'bg-black/40 border-white/10'}`}>
              <div className="flex items-center gap-4">
                <FaStopwatch size={24} className={isCritical ? 'text-white' : 'text-red-500'} />
                <div className="text-left">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isCritical ? 'text-white/80' : 'text-gray-500'}`}>Clock</p>
                  <p className="text-4xl font-black font-mono leading-none">{localTimer}s</p>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all ${isMyTurn ? 'bg-orange-600/20 border-orange-500' : 'bg-black/40 border-white/5'}`}>
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-gray-800'}`}></div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</p>
                <p className={`text-xl font-black italic ${isMyTurn ? 'text-orange-400' : 'text-gray-600'}`}>
                  {isMyTurn ? "STRIKE" : "WAITING"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Battle Table */}
          <div className="lg:col-span-3">
            <div className={`relative aspect-[2/1] bg-slate-900 rounded-[3rem] p-6 shadow-2xl border-[20px] border-gray-950 overflow-hidden box-content transition-colors duration-500 ${isCritical ? 'border-red-900' : ''}`}>
              {/* Pocket holes */}
              {[0, 1, 2].map(i => (
                <React.Fragment key={i}>
                  <div className="absolute top-0 left-0 w-16 h-16 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${i * 50}%` }} />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-black rounded-full -translate-x-1/2 translate-y-1/2" style={{ left: `${i * 50}%` }} />
                </React.Fragment>
              ))}

              <div className="relative w-full h-full">
                {/* Visual Cue Stick for Aiming - ALWAYS VISIBLE */}
                {gameState.balls?.['0']?.onTable ? (
                  <div
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: `${(gameState.balls['0'].x / 1280) * 100}%`,
                      top: `${(gameState.balls['0'].y / 720) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${shotParams.angle}deg)`,
                      width: '0px',
                      height: '0px'
                    }}
                  >
                    {/* Cue Stick Graphic */}
                    <div
                      className="absolute rounded-l-sm shadow-xl flex items-center justify-end"
                      style={{
                        width: '400px',
                        height: '8px',
                        right: '18px', // Tighter gap (Start 18px from center)
                        top: '0px',   // Pivot line
                        transform: 'translateY(-50%)', // Perfect vertical centering
                        background: 'linear-gradient(to right, #271a0c, #78350f, #eab308)', // Dark Oak to Gold wood
                        opacity: isMyTurn ? 1 : 0.6,
                      }}
                    >
                      {/* White Ferrule */}
                      <div className="w-4 h-full bg-slate-200" />
                      {/* Blue Tip */}
                      <div className="w-1.5 h-full bg-blue-500 rounded-r-[1px]" />
                    </div>
                  </div>
                ) : (
                  /* Fallback stick at center if no ball data */
                  <div
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: '25%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div
                      className="absolute h-3 bg-yellow-500 rounded-full shadow-2xl"
                      style={{
                        width: '200px',
                        transformOrigin: 'left center',
                        transform: `rotate(${shotParams.angle}deg)`,
                        opacity: 0.8,
                        boxShadow: '0 0 20px rgba(234, 179, 8, 0.8)'
                      }}
                    />
                    <div className="absolute -top-8 left-0 text-yellow-500 text-xs font-bold whitespace-nowrap">
                      ⚠️ DEBUG: No ball data
                    </div>
                  </div>
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
                        left: 0,
                        top: 0,
                        transform: 'translate(-50%, -50%)'
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

            {/* Prize Display */}
            <div className="mt-8 bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <FaTrophy className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Potential Winnings</p>
                  <h3 className="text-3xl font-black flex items-center gap-1">
                    <span className="text-gray-500">GHC </span>
                    <span>{(potAmount || 0).toLocaleString()}</span>
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Platform Fee (10%)</p>
                <p className="text-xl font-bold text-red-500/50">GHC  {((gameState.stake * 2 * 0.1) || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Side Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center justify-center gap-2">
                <FaAdjust className="text-orange-500" />
                Manual Entry
              </h3>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                    <span>Angle Indicator</span>
                    <span className="text-orange-400">{shotParams.angle}°</span>
                  </div>
                  <input
                    type="range" width="100%" min="0" max="360"
                    value={shotParams.angle}
                    onChange={(e) => setShotParams({ ...shotParams, angle: e.target.value })}
                    disabled={!isMyTurn}
                    className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                    <span>Striking Force</span>
                    <span className="text-yellow-400">{shotParams.power}%</span>
                  </div>
                  <input
                    type="range" width="100%" min="1" max="100"
                    value={shotParams.power}
                    onChange={(e) => setShotParams({ ...shotParams, power: e.target.value })}
                    disabled={!isMyTurn}
                    className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-yellow-600"
                  />
                </div>

                <button
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl ${isMyTurn
                    ? 'bg-gradient-to-r from-orange-600 to-yellow-500 text-white shadow-orange-500/20 hover:scale-102 active:scale-98'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <FaBullseye />
                  <span>SHOOT NOW</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-900/40 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <FaShieldAlt />
              AUTHORITATIVE SYNC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedArena;

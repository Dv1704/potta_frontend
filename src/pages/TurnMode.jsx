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

  if (!gameState) return <LoadingSpinner text="Establishing Secure Match Link..." />;

  const isSpeed = window.location.pathname.includes('/speed');

  return (
    <div className="min-h-screen bg-[#052e16] text-white p-4 md:p-8 pt-24 font-sans relative overflow-hidden">
      {/* Table Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Tournament Style */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 bg-black/40 backdrop-blur-2xl p-6 rounded-[2rem] border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/20 transition-all active:scale-95 text-emerald-400"
            >
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">LIVE PRO</div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Turn Masters</h2>
              </div>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em] mt-1">Global Tournament // Match {gameId?.slice(0, 6)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-emerald-950/50 px-6 py-3 rounded-2xl border border-emerald-500/20 text-center">
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Pot Size</p>
              <p className="text-2xl font-black">20.00 <span className="text-sm font-normal text-gray-400">GH₵</span></p>
            </div>

            <motion.div
              animate={{
                borderColor: isMyTurn ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.05)',
                scale: isMyTurn ? [1, 1.02, 1] : 1
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`flex items-center gap-4 px-8 py-4 rounded-2xl border-2 bg-black/40 shadow-2xl transition-all`}
            >
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-700'}`}></div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Control</p>
                <p className={`text-xl font-black italic ${isMyTurn ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {isMyTurn ? "YOUR TURN" : "WAITING..."}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Table Area */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[2/1] bg-[#065f46] rounded-[3rem] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[24px] border-[#221614] overflow-hidden">
              {/* Pocket holes */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner z-0" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-black rounded-full translate-x-1/2 -translate-y-1/2 shadow-inner z-0" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black rounded-full -translate-x-1/2 translate-y-1/2 shadow-inner z-0" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-black rounded-full translate-x-1/2 translate-y-1/2 shadow-inner z-0" />
              <div className="absolute top-0 left-1/2 w-20 h-20 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner z-0" />
              <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-black rounded-full -translate-x-1/2 translate-y-1/2 shadow-inner z-0" />

              {/* Rails Gloss */}
              <div className="absolute inset-0 rounded-[2rem] border-[4px] border-white/5 pointer-events-none z-10"></div>

              {/* Balls Canvas logic (Simulated via motion.div) */}
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
                      transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      className={`absolute w-[4%] aspect-square rounded-full translate-x-[-50%] translate-y-[-50%] shadow-[4px_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center text-[1vw] font-black border border-white/10
                        ${num === '0' ? 'bg-gray-100 text-black shadow-white/20' :
                          num === '8' ? 'bg-black text-white border-white/20' :
                            parseInt(num) <= 7 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}
                    >
                      {num !== '0' && num}
                      {/* Highlight */}
                      <div className="absolute top-[10%] right-[10%] w-[25%] h-[25%] bg-white/40 rounded-full blur-[1px]"></div>
                    </motion.div>
                  )
                ))}
              </div>

              {/* Cloth Texture */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')] opacity-40 pointer-events-none z-10 mix-blend-soft-light" />

              {/* Cue Line (Simulated) */}
              {isMyTurn && (
                <motion.div
                  style={{
                    rotate: (shotParams.angle + 180) + 'deg',
                    x: (gameState.balls[0].x / 1842) * 100 + '%',
                    y: (gameState.balls[0].y / 3680) * 100 + '%'
                  }}
                  className="absolute w-1 h-[200px] bg-gradient-to-t from-white/40 to-transparent origin-top -translate-x-1/2 z-10"
                ></motion.div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-emerald-500/10 shadow-2xl flex-1">
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <FaAdjust /> Precision Input
              </h3>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Aim Angle</p>
                    <p className="text-3xl font-black italic">{shotParams.angle}°</p>
                  </div>
                  <input
                    type="range" min="0" max="360"
                    value={shotParams.angle}
                    onChange={(e) => setShotParams({ ...shotParams, angle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Shot Force</p>
                    <p className="text-3xl font-black italic text-emerald-400">{shotParams.power}%</p>
                  </div>
                  <input
                    type="range" min="10" max="150"
                    value={shotParams.power}
                    onChange={(e) => setShotParams({ ...shotParams, power: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    disabled={!isMyTurn}
                  />
                </div>

                <button
                  onClick={handleTakeShot}
                  disabled={!isMyTurn}
                  className={`w-full py-6 rounded-2xl font-black text-xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-3
                    ${isMyTurn
                      ? 'bg-white text-emerald-950 hover:bg-emerald-400 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95'
                      : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}
                >
                  <FaBullseye />
                  <span>Execute Shot</span>
                </button>
              </div>

              {/* Anti-Cheat / Auth Badge */}
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-emerald-500/40">
                <FaShieldAlt size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Server-Authoritative Physics Enabled</span>
              </div>
            </div>

            {/* Match Feed */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border-2 border-emerald-500/10 h-72 flex flex-col">
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">Feed_Scanner</p>
              <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs">
                <AnimatePresence>
                  {lastShotResult ? (
                    <>
                      {lastShotResult.pocketedBalls.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400">
                          » Ball(s) {lastShotResult.pocketedBalls.join(', ')} POTTED SUCCESS
                        </motion.div>
                      )}
                      {lastShotResult.cueBallScratched && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500">
                          » ALERT: CUE BALL SCRATCH [FOUL]
                        </motion.div>
                      )}
                      {lastShotResult.pocketedBalls.length === 0 && !lastShotResult.cueBallScratched && (
                        <div className="text-gray-500">» Shot processed. No potted balls.</div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500">» Waiting for break shot...</div>
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

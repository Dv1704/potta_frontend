import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, RotateCcw, X, Users, Play, List, Settings, Volume2, VolumeX, Eye, EyeOff, Sliders } from 'lucide-react';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';

export default function LocalPVP() {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  
  // Settings state (saved in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('potta_sound') !== 'false');
  const [guideLineEnabled, setGuideLineEnabled] = useState(() => localStorage.getItem('potta_guideline') !== 'false');
  const [difficulty, setDifficulty] = useState(() => parseInt(localStorage.getItem('potta_difficulty') || '0'));
  
  // In-Game UI states
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [foulNotification, setFoulNotification] = useState({ show: false, reason: '', description: '' });
  const [pottedToasts, setPottedToasts] = useState([]); // Array of { id, ball }
  
  const [gameState, setGameState] = useState({
    turn: 1,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    player1BallsRemaining: 7,
    player2BallsRemaining: 7,
    groupAssigned: false,
    playerGroups: {},
    foulOccurred: false,
    gameOver: false,
    ballsPocketed: []
  });

  const [shotLogs, setShotLogs] = useState(['Game initialized. waiting for break...']);
  const prevTurnRef = useRef(1);
  const prevGroupAssignedRef = useRef(false);
  const seenPocketedBallsRef = useRef(new Set());
  const logEndRef = useRef(null);
  
  // Reload trigger to restart the iframe easily
  const [gameKey, setGameKey] = useState(0);

  // Scroll shot log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shotLogs]);

  // Sync settings helper
  const applySettingsToIframe = (sound, guide, diff) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'applySettings',
        settings: { sound, guideLine: guide, difficulty: diff }
      }, '*');
    }
  };

  // Handle settings changes
  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    localStorage.setItem('potta_sound', val.toString());
    applySettingsToIframe(val, guideLineEnabled, difficulty);
  };

  const toggleGuideLine = () => {
    const val = !guideLineEnabled;
    setGuideLineEnabled(val);
    localStorage.setItem('potta_guideline', val.toString());
    applySettingsToIframe(soundEnabled, val, difficulty);
  };

  const handleDifficultyChange = (e) => {
    const val = parseInt(e.target.value);
    setDifficulty(val);
    localStorage.setItem('potta_difficulty', val.toString());
    applySettingsToIframe(soundEnabled, guideLineEnabled, val);
  };

  // Handle messages from the HTML5 pool engine iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      // When engine says it is ready, push names and settings down to the canvas
      if (event.data.type === 'engineReady') {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'updatePlayerNames',
            player1Name: p1Name,
            player2Name: p2Name
          }, '*');
          
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: soundEnabled,
              guideLine: guideLineEnabled,
              difficulty: difficulty
            }
          }, '*');
        }
      }

      // Handle local game updates sent by CGame/CTable
      if (event.data.type === 'localGameStateUpdate') {
        const newState = event.data.state;
        setGameState(newState);

        const newLogs = [];
        const activeName = newState.turn === 1 ? newState.player1Name : newState.player2Name;
        const inactiveName = newState.turn === 1 ? newState.player2Name : newState.player1Name;

        // 1. Trigger Potted Toasts & Log pocketed balls
        if (newState.ballsPocketed && newState.ballsPocketed.length > 0) {
          const objectBalls = newState.ballsPocketed.filter(num => num !== 0);
          
          // Check for newly pocketed balls
          const newPotted = objectBalls.filter(num => !seenPocketedBallsRef.current.has(num));
          if (newPotted.length > 0) {
            newPotted.forEach(num => seenPocketedBallsRef.current.add(num));
            
            // Log pocketed
            newLogs.push(`🎱 ${activeName} pocketed ball(s): ${newPotted.join(', ')}`);
            
            // Add custom visual float toasts
            const newToasts = newPotted.map(num => ({
              id: Date.now() + Math.random() + num,
              ball: num
            }));
            setPottedToasts(prev => [...prev, ...newToasts]);
            
            // Clear toast after animation duration
            newToasts.forEach(t => {
              setTimeout(() => {
                setPottedToasts(prev => prev.filter(item => item.id !== t.id));
              }, 2500);
            });
          }
        }

        // 2. Log group assignments
        if (newState.groupAssigned && !prevGroupAssignedRef.current) {
          prevGroupAssignedRef.current = true;
          const p1Group = newState.playerGroups[1];
          const p2Group = newState.playerGroups[2];
          newLogs.push(`📢 Suits assigned! ${newState.player1Name} is ${p1Group.toUpperCase()}s, ${newState.player2Name} is ${p2Group.toUpperCase()}s!`);
        }

        // 3. Log & Notify fouls
        if (newState.foulOccurred) {
          let foulType = 'Foul';
          let desc = 'A table violation occurred.';
          
          if (newState.foulReason === 'scratch') {
            foulType = 'Scratch';
            desc = 'Cue ball was pocketed.';
          } else if (newState.foulReason === 'no_contact') {
            foulType = 'No contact';
            desc = 'Cue ball failed to hit any object balls.';
          } else if (newState.foulReason === 'wrong_ball_first') {
            foulType = 'Wrong ball hit first';
            desc = `First hit must touch own group ball.`;
          }
          
          newLogs.push(`🔴 Foul (${foulType})! ${inactiveName} awarded Ball-in-Hand.`);
          
          // Show HUD banner
          setFoulNotification({
            show: true,
            reason: foulType,
            description: desc
          });
          
          setTimeout(() => {
            setFoulNotification(prev => prev.reason === foulType ? { show: false, reason: '', description: '' } : prev);
          }, 4000);
        }

        // 4. Log turn change
        if (newState.turn !== prevTurnRef.current && !newState.gameOver) {
          prevTurnRef.current = newState.turn;
          newLogs.push(`🔄 Turn passed to ${activeName}`);
        }

        // 5. Log Game Over
        if (newState.gameOver) {
          newLogs.push(`🏆 GAME OVER! ${activeName} WINS!`);
        }

        if (newLogs.length > 0) {
          setShotLogs(prev => [...prev, ...newLogs]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameStarted, p1Name, p2Name, soundEnabled, guideLineEnabled, difficulty]);

  const handleStartGame = (e) => {
    e.preventDefault();
    if (!p1Name.trim()) setP1Name('Player 1');
    if (!p2Name.trim()) setP2Name('Player 2');
    setShotLogs(['🎱 Match Started! Take the break shot.']);
    prevTurnRef.current = 1;
    prevGroupAssignedRef.current = false;
    seenPocketedBallsRef.current.clear();
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
    setGameState({
      turn: 1,
      player1Name: p1Name,
      player2Name: p2Name,
      player1BallsRemaining: 7,
      player2BallsRemaining: 7,
      groupAssigned: false,
      playerGroups: {},
      foulOccurred: false,
      gameOver: false,
      ballsPocketed: []
    });
    prevTurnRef.current = 1;
    prevGroupAssignedRef.current = false;
    seenPocketedBallsRef.current.clear();
    setShotLogs(['🎱 Match restarted! Take the break shot.']);
    setShowPauseMenu(false);
  };

  // Render visual list of 7 balls
  const renderBallsIndicator = (count, suite) => {
    const balls = [];
    for (let i = 0; i < 7; i++) {
      const active = i < count;
      let ballClass = '';
      if (!active) {
        ballClass = 'bg-slate-700/40 border-slate-800 scale-95 opacity-25';
      } else if (!suite) {
        ballClass = 'bg-gradient-to-r from-slate-400 to-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.2)] border-white/20';
      } else if (suite === 'solid') {
        ballClass = 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)] border-red-500/30';
      } else {
        ballClass = 'bg-gradient-to-r from-yellow-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)] border-yellow-400/30 relative after:content-[""] after:absolute after:inset-y-0 after:left-1/3 after:right-1/3 after:bg-white/95 after:border-x after:border-slate-800/10';
      }
      
      balls.push(
        <div 
          key={i} 
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${ballClass}`}
        />
      );
    }
    return <div className="flex gap-1.5 mt-2">{balls}</div>;
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 min-h-screen flex items-center justify-center p-4"
          >
            <div className="bg-[#0c111d]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] w-full max-w-lg p-10 md:p-12 shadow-2xl relative">
              <button 
                onClick={() => navigate('/dashboard')}
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Exit</span>
              </button>

              <div className="text-center mt-6 mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-400/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <Users className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Local 1v1 PVP</h1>
                <p className="text-gray-400 text-sm mt-2 font-medium">Challenge a friend offline on this screen</p>
              </div>

              <form onSubmit={handleStartGame} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-400">Player 1 Name</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl px-6 py-4 outline-none font-bold text-white transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    placeholder="Player 1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-orange-400">Player 2 Name</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 rounded-2xl px-6 py-4 outline-none font-bold text-white transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    placeholder="Player 2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 text-lg uppercase italic tracking-wide flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play size={20} />
                  <span>Start Match</span>
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full h-screen"
          >
            {/* --- TOP HUD OVERLAY --- */}
            
            {/* Player 1 Card - Top Left */}
            <div className="absolute top-4 left-4 z-[9999] pointer-events-none max-w-[280px]">
              <div className={`backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl border transition-all duration-300 ${
                gameState.turn === 1 
                  ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-purple-400 scale-[1.03] shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-900/80 border-white/5 opacity-70'
              }`}>
                <div className="flex items-center gap-3">
                  {gameState.turn === 1 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  )}
                  <div className="text-white font-black text-base truncate uppercase tracking-tight">
                    {gameState.player1Name}
                  </div>
                </div>

                <div className="mt-2 text-xs flex flex-col gap-0.5">
                  <div className="text-white/60 font-semibold flex items-center gap-1.5">
                    Group:{' '}
                    {gameState.groupAssigned ? (
                      <span className={`font-black uppercase tracking-wider ${
                        gameState.playerGroups[1] === 'solid' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {gameState.playerGroups[1]}s
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Open Table</span>
                    )}
                  </div>
                  <div className="text-white/60 font-semibold flex items-baseline gap-1">
                    Remaining: <span className="text-white font-black text-sm">{gameState.player1BallsRemaining}</span>
                  </div>
                  {renderBallsIndicator(gameState.player1BallsRemaining, gameState.playerGroups[1])}
                </div>
              </div>
            </div>

            {/* Header Control Buttons - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex items-center gap-3">
              <button 
                onClick={() => setShowPauseMenu(true)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 font-bold uppercase tracking-wider text-xs"
              >
                <Settings size={14} className="animate-spin-slow" />
                <span>Pause & Settings</span>
              </button>
            </div>

            {/* Player 2 Card - Top Right */}
            <div className="absolute top-4 right-4 z-[9999] pointer-events-none max-w-[280px]">
              <div className={`backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl border transition-all duration-300 ${
                gameState.turn === 2 
                  ? 'bg-gradient-to-r from-orange-600/90 to-red-600/90 border-orange-400 scale-[1.03] shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                  : 'bg-slate-900/80 border-white/5 opacity-70'
              }`}>
                <div className="flex items-center gap-3 justify-end">
                  <div className="text-white font-black text-base truncate uppercase tracking-tight text-right">
                    {gameState.player2Name}
                  </div>
                  {gameState.turn === 2 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  )}
                </div>

                <div className="mt-2 text-xs flex flex-col gap-0.5 text-right items-end">
                  <div className="text-white/60 font-semibold flex items-center gap-1.5">
                    Group:{' '}
                    {gameState.groupAssigned ? (
                      <span className={`font-black uppercase tracking-wider ${
                        gameState.playerGroups[2] === 'solid' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {gameState.playerGroups[2]}s
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Open Table</span>
                    )}
                  </div>
                  <div className="text-white/60 font-semibold flex items-baseline gap-1">
                    Remaining: <span className="text-white font-black text-sm">{gameState.player2BallsRemaining}</span>
                  </div>
                  {renderBallsIndicator(gameState.player2BallsRemaining, gameState.playerGroups[2])}
                </div>
              </div>
            </div>

            {/* Active Turn HUD Indicator - Bottom Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
              <div className={`backdrop-blur-md rounded-full px-8 py-2.5 shadow-2xl border border-white/10 ${
                gameState.turn === 1 
                  ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-purple-100' 
                  : 'bg-gradient-to-r from-orange-600/90 to-red-600/90 text-orange-100'
              }`}>
                <div className="text-xs uppercase tracking-[0.2em] font-black italic text-center">
                  {gameState.turn === 1 ? gameState.player1Name : gameState.player2Name}'S TURN
                </div>
              </div>
            </div>

            {/* Scrollable Turn History / Match Log Drawer - Bottom Left */}
            <div className="absolute bottom-6 left-6 z-[9999] w-72 max-h-48 bg-slate-950/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 pointer-events-auto">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between items-center">
                <span className="flex items-center gap-1.5"><List size={12} /> Match Log</span>
                <span className="text-indigo-400 font-bold tracking-tight">LOCAL 1v1</span>
              </div>
              <div className="overflow-y-auto flex-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10 pr-1 select-text">
                {shotLogs.map((log, idx) => (
                  <div key={idx} className="text-white/90 text-[11px] font-medium leading-relaxed font-sans border-l border-indigo-500/40 pl-2 py-0.5">
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* --- POTTED BALL TOAST FLOATER --- */}
            <div className="absolute inset-0 pointer-events-none z-[1000] flex items-center justify-center">
              <AnimatePresence>
                {pottedToasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1.2, y: -80 }}
                    exit={{ opacity: 0, scale: 0.8, y: -150 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute bg-gradient-to-r from-yellow-500 to-amber-500 border border-yellow-300 text-white font-black font-sans px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl shadow-yellow-500/20"
                  >
                    <span className="text-sm">🎱</span>
                    <span className="text-sm tracking-tight uppercase">Ball {toast.ball} pocketed!</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* --- VISUAL CUE FOR FOULS WITH EXPLANATION --- */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
              <AnimatePresence>
                {foulNotification.show && (
                  <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-red-950/90 border border-red-500/35 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex items-center gap-4 max-w-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold text-lg animate-pulse border border-red-500/30">
                      ⚠️
                    </div>
                    <div>
                      <h4 className="text-red-400 font-black text-sm uppercase tracking-wider">{foulNotification.reason}</h4>
                      <p className="text-red-200/90 text-xs font-semibold mt-0.5 leading-relaxed">{foulNotification.description}</p>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">opponent gets ball-in-hand</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- PAUSE & SETTINGS MODAL --- */}
            <AnimatePresence>
              {showPauseMenu && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPauseMenu(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-[#0c111d]/95 w-full max-w-md rounded-[3rem] border border-white/10 p-10 shadow-2xl relative z-10 overflow-hidden"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Match Paused</h3>
                      <p className="text-gray-400 text-xs font-medium mt-1">Adjust preferences or control the match session</p>
                    </div>

                    {/* Settings Panel */}
                    <div className="space-y-4 bg-black/40 rounded-3xl p-6 border border-white/5 mb-8">
                      <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Settings</h4>
                      
                      {/* Sound Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          {soundEnabled ? <Volume2 size={16} className="text-indigo-400" /> : <VolumeX size={16} className="text-gray-500" />}
                          Sound Effects
                        </span>
                        <button 
                          onClick={toggleSound} 
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${
                            soundEnabled ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
                            soundEnabled ? 'left-6.5' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Guide Line Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          {guideLineEnabled ? <Eye size={16} className="text-indigo-400" /> : <EyeOff size={16} className="text-gray-500" />}
                          Aiming Guide Line
                        </span>
                        <button 
                          onClick={toggleGuideLine} 
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${
                            guideLineEnabled ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
                            guideLineEnabled ? 'left-6.5' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Difficulty Selector */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          <Sliders size={16} className="text-indigo-400" />
                          Difficulty
                        </span>
                        <select
                          value={difficulty}
                          onChange={handleDifficultyChange}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 outline-none font-bold text-xs cursor-pointer text-white focus:border-indigo-500"
                        >
                          <option value="0">Easy</option>
                          <option value="1">Medium</option>
                          <option value="2">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setShowPauseMenu(false)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-sm uppercase italic tracking-wider"
                      >
                        Resume Game
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            if (window.confirm('Restart the match? Current progress will be lost.')) handleRestart();
                          }}
                          className="py-4 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-wider text-gray-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw size={12} /> Restart
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Forfeit and return to menu?')) {
                              setShowPauseMenu(false);
                              navigate('/dashboard');
                            }
                          }}
                          className="py-4 bg-red-950/80 hover:bg-red-900 border border-red-800/30 rounded-2xl font-black text-xs uppercase tracking-wider text-red-400 hover:text-red-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <X size={12} /> Exit Game
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* GameOver Modal */}
            <AnimatePresence>
              {gameState.gameOver && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-[#0c111d] w-full max-w-md rounded-[3rem] border border-white/10 p-12 text-center shadow-2xl relative z-10"
                  >
                    <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 border border-yellow-400/20 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                      <Trophy size={40} className="text-white" />
                    </div>
                    
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">🏆 VICTORY 🏆</h2>
                    
                    <p className="text-2xl font-black text-indigo-400 uppercase tracking-tight mt-6">
                      {gameState.turn === 1 ? gameState.player1Name : gameState.player2Name}
                    </p>
                    <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase mt-1">Has won the match!</p>
                    
                    <div className="flex flex-col gap-3 mt-10">
                      <button 
                        onClick={handleRestart}
                        className="w-full bg-white hover:bg-slate-200 text-black font-black py-5 rounded-2xl transition-all shadow-xl text-lg uppercase italic tracking-wide"
                      >
                        Play Again
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-black py-5 rounded-2xl transition-all text-lg uppercase italic tracking-wide"
                      >
                        Back to Menu
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Embedded game engine */}
            <PoolGameEngineEmbed
              key={gameKey}
              mode="local"
              onStartSession={() => console.log('Local Match started')}
              onEndSession={() => console.log('Local Match ended')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

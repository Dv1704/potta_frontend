import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Eye, EyeOff, Sliders, RotateCcw, X, List, Trophy } from 'lucide-react';

/**
 * PlayerInfoOverlay - Shows player names and game stats on top of the game
 */
const PlayerInfoOverlay = ({ player1, player2, myId, currentTurn, entryFee, timeRemaining, canTakeShot, isAnimating, playerGroups = {}, groupAssigned = false }) => {
  const isMyTurn = currentTurn === myId;

  return (
    <>
      {/* Player 1 Info - Top Left */}
      <div className="absolute top-4 left-4 z-[9999] pointer-events-none">
        <div className={`backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border transition-all duration-300 ${
          currentTurn === player1?.id 
            ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
            : 'bg-slate-800/80 border-slate-700 opacity-80'
        }`}>
          <div className="flex items-center gap-3">
            {currentTurn === player1?.id && (
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            )}
            <div className="text-white font-bold text-sm">
              {player1?.name || 'Player 1'} {player1?.id === myId && '(YOU)'}
            </div>
          </div>
          <div className="mt-2 text-xs flex flex-col gap-1">
            <div className="text-white/80">
              Group:{' '}
              {groupAssigned ? (
                <span className={`font-bold uppercase ${playerGroups[player1?.id] === 'solids' ? 'text-red-400 font-black' : 'text-yellow-400 font-black'}`}>
                  {playerGroups[player1?.id]}
                </span>
              ) : (
                <span className="text-gray-400 font-bold uppercase">Open Table</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player 2 Info - Top Right */}
      <div className="absolute top-4 right-4 z-[9999] pointer-events-none">
        <div className={`backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border transition-all duration-300 ${
          currentTurn === player2?.id 
            ? 'bg-gradient-to-r from-orange-600/90 to-red-600/90 border-orange-400 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
            : 'bg-slate-800/80 border-slate-700 opacity-80'
        }`}>
          <div className="flex items-center gap-3 justify-end">
            <div className="text-white font-bold text-sm text-right">
              {player2?.name || 'Player 2'} {player2?.id === myId && '(YOU)'}
            </div>
            {currentTurn === player2?.id && (
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-xs flex flex-col gap-1 text-right">
            <div className="text-white/80">
              Group:{' '}
              {groupAssigned ? (
                <span className={`font-bold uppercase ${playerGroups[player2?.id] === 'solids' ? 'text-red-400 font-black' : 'text-yellow-400 font-black'}`}>
                  {playerGroups[player2?.id]}
                </span>
              ) : (
                <span className="text-gray-400 font-bold uppercase">Open Table</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Entry Fee Info - Top Center */}
      {entryFee && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-600/90 to-amber-600/90 backdrop-blur-sm rounded-lg px-6 py-2 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="text-yellow-100 text-[10px] font-bold uppercase tracking-wider">PRIZE POOL</div>
              <div className="text-white font-bold text-lg leading-tight">GH₵{(entryFee * 1.8).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Turn Indicator & Timer */}
      {currentTurn && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            {isMyTurn ? (
              <div className={`${isAnimating ? 'bg-yellow-500/90' : canTakeShot ? 'bg-green-500/90 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-500/90'} backdrop-blur-sm rounded-full px-6 py-2 shadow-xl border border-white/30 transition-all duration-300 ${canTakeShot ? 'animate-pulse' : ''}`}>
                <div className="text-white font-bold text-sm">
                  {isAnimating ? '⏳ ANIMATING...' : canTakeShot ? 'YOUR TURN' : 'WAIT...'}
                </div>
              </div>
            ) : (
              <div className={`${isAnimating ? 'bg-yellow-500/90' : 'bg-red-600/90 border-red-500/40'} backdrop-blur-sm rounded-full px-6 py-2 shadow-xl border border-white/30 transition-all duration-300`}>
                <div className="text-white font-bold text-sm">
                  {isAnimating ? '⏳ OPPONENT ANIMATING...' : 'OPPONENT\'S TURN'}
                </div>
              </div>
            )}

            {timeRemaining !== undefined && (
              <div className={`${timeRemaining < 10 ? 'bg-red-500/90 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-blue-600/90 border-blue-400'} backdrop-blur-sm rounded-lg px-4 py-1 shadow-lg border min-w-[80px] text-center transition-all duration-300`}>
                <div className="text-white font-mono font-bold text-lg">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Time Left</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const TurnMode = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Settings state (saved in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('potta_sound') !== 'false');
  const [guideLineEnabled, setGuideLineEnabled] = useState(() => localStorage.getItem('potta_guideline') !== 'false');
  const [difficulty, setDifficulty] = useState(() => parseInt(localStorage.getItem('potta_difficulty') || '0'));

  // In-Game UI states
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [foulNotification, setFoulNotification] = useState({ show: false, reason: '', description: '' });
  const [pottedToasts, setPottedToasts] = useState([]); // Array of { id, ball }

  // Game state
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [shotLogs, setShotLogs] = useState(['Game starting...']);

  // Animation lock state (CRITICAL FIX for turn synchronization)
  const [isEngineAnimating, setIsEngineAnimating] = useState(false);
  const [pendingTurnUpdate, setPendingTurnUpdate] = useState(null);

  // Refs to track match start data and latest game state (avoids stale closures)
  const matchStartReceivedRef = useRef(false);
  const matchStartDataRef = useRef(null);
  const gameStateRef = useRef(null);
  const logEndRef = useRef(null);

  const userId = localStorage.getItem('userId');

  // Computed: who can actually take a shot (blocks during animation)
  const canTakeShot = useMemo(() => {
    if (!gameState || isEngineAnimating) return false;  // Block if animating
    return gameState.turn === userId;
  }, [gameState, isEngineAnimating, userId]);

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

  // Socket connection and event handlers
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    connectSocket(userId);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('joinGame', { gameId });
      // Signal we are ready; backend will call startGame() when both players have signalled
      socket.emit('playerReady', { gameId, userId });
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinGame', { gameId });
      socket.emit('playerReady', { gameId, userId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleStartMatch = (data) => {
      console.log('[TurnMode] Match started!', data);
      matchStartReceivedRef.current = true;
      matchStartDataRef.current = data;
      setGameState(data.gameState);
      gameStateRef.current = data.gameState;
      if (data.gameState?.timer !== undefined) {
        setTimeRemaining(data.gameState.timer);
      }
      setShotLogs(['🎱 Match Started! Take the break shot.']);
      showToast('Game started!', 'success');

      // Forward to game iframe (try immediately + retry after delay for race condition)
      const sendMatchStart = () => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'matchStart', state: data.gameState }, '*');
          iframe.contentWindow.postMessage({ type: 'gameStateUpdate', state: data.gameState }, '*');
          
          // Apply active settings too
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: soundEnabled,
              guideLine: guideLineEnabled,
              difficulty: difficulty
            }
          }, '*');
        }
      };
      sendMatchStart();
      // Retry after 1s and 3s in case iframe wasn't ready
      setTimeout(sendMatchStart, 1000);
      setTimeout(sendMatchStart, 3000);
    };

    const handleGameState = (state) => {
      console.log('[TurnMode] Game state received:', state);
      setIsConnected(true);

      // Check for shot timeout turn-change log
      if (gameStateRef.current && state.turn !== gameStateRef.current.turn && !isEngineAnimating) {
        const player1 = state.players?.[0];
        const player2 = state.players?.[1];
        const oldTurnId = gameStateRef.current.turn;
        const oldPlayer = player1?.id === oldTurnId ? player1 : player2;
        const oldPlayerName = oldTurnId === userId ? 'You' : (oldPlayer?.name || 'Opponent');
        setShotLogs(prev => [...prev, `⏳ ${oldPlayerName} timed out! Turn passed.`]);
      }

      setGameState(state);
      gameStateRef.current = state;

      // Update timer from gameState
      if (state.timer !== undefined) {
        setTimeRemaining(state.timer);
      }

      // Send state to game iframe if needed
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'initUser',
          userId: userId
        }, '*');

        iframe.contentWindow.postMessage({
          type: 'gameStateUpdate',
          state: state
        }, '*');
      }
    };

    const handleShotResult = async (data) => {
      console.log('[TurnMode] Shot result received:', data);
      setIsConnected(true);
      const { gameState: newGameState, shooterId, shotResult } = data;

      // Log shot result to history
      const player1 = gameStateRef.current?.players?.[0] || gameState?.players?.[0];
      const player2 = gameStateRef.current?.players?.[1] || gameState?.players?.[1];
      const shooter = player1?.id === shooterId ? player1 : player2;
      const shooterName = shooterId === userId ? 'You' : (shooter?.name || 'Opponent');

      if (shotResult) {
        let logMsg = '';
        if (shotResult.cueBallScratched) {
          logMsg = `🔴 ${shooterName} scratched! (Foul)`;
        } else if (shotResult.firstBallCollided === null) {
          logMsg = `⚪ ${shooterName} missed all balls! (Foul)`;
        } else {
          const objectBalls = shotResult.pocketedBalls.filter(id => id !== 0);
          if (objectBalls.length > 0) {
            logMsg = `🎱 ${shooterName} pocketed ball(s): ${objectBalls.join(', ')}`;
          } else {
            logMsg = `⚪ ${shooterName} shot (No balls pocketed)`;
          }
        }
        setShotLogs(prev => [...prev, logMsg]);

        // 1. Trigger Potted Toasts
        const objectBalls = shotResult.pocketedBalls.filter(id => id !== 0);
        if (objectBalls.length > 0) {
          const newToasts = objectBalls.map(num => ({
            id: Date.now() + Math.random() + num,
            ball: num
          }));
          setPottedToasts(prev => [...prev, ...newToasts]);
          newToasts.forEach(t => {
            setTimeout(() => {
              setPottedToasts(prev => prev.filter(item => item.id !== t.id));
            }, 2500);
          });
        }

        // 2. Trigger Foul Banner
        const isFoul = shotResult.cueBallScratched || shotResult.firstBallCollided === null || (newGameState && newGameState.foulOccurred);
        if (isFoul) {
          let foulType = 'Foul';
          let desc = 'A table violation occurred.';
          
          if (shotResult.cueBallScratched) {
            foulType = 'Scratch';
            desc = 'Cue ball was pocketed.';
          } else if (shotResult.firstBallCollided === null) {
            foulType = 'No contact';
            desc = 'Cue ball failed to hit any object balls.';
          } else if (gameStateRef.current && !gameStateRef.current.groupAssigned && newGameState && newGameState.foulOccurred) {
            foulType = 'Illegal break scatter';
            desc = 'Minimum cushion hits or pots not met.';
          } else {
            foulType = 'Foul';
            desc = 'Wrong ball hit first or rail contact violation.';
          }

          setFoulNotification({
            show: true,
            reason: foulType,
            description: desc
          });

          setTimeout(() => {
            setFoulNotification(prev => prev.reason === foulType ? { show: false, reason: '', description: '' } : prev);
          }, 4000);
        }
      }

      // Lock input for animation
      console.log('[TurnMode] Locking input for animation');
      setIsEngineAnimating(true);

      // Store pending turn update (don't apply until animation completes)
      setPendingTurnUpdate(newGameState);

      // Send to game engine (starts animation)
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'shotResult',
          data: data
        }, '*');
      }

      if (shooterId !== userId) {
        showToast('Opponent took their shot', 'info');
      }
    };

    const handleOpponentShotStart = (data) => {
      console.log('[TurnMode] Opponent shot start:', data);
      // Relay to game for visualization
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'opponentShot',
          data: data
        }, '*');
      }
    };

    const handleGameEnded = (data) => {
      showToast(data.message || 'Game Over', 'success');
      setTimeout(() => navigate('/dashboard'), 3000);
    };

    const handleError = (error) => {
      showToast(error.message || 'An error occurred', 'error');

      // Notify game iframe to reset state if a shot was rejected
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'error',
          message: error.message
        }, '*');
      }
    };

    socket.on('gameState', handleGameState);
    socket.on('startMatch', handleStartMatch);
    socket.on('shotResult', handleShotResult);
    socket.on('opponentShotStart', handleOpponentShotStart);
    socket.on('gameEnded', handleGameEnded);
    socket.on('error', handleError);

    socket.emit('getGameState', { gameId });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameState');
      socket.off('startMatch');
      socket.off('shotResult');
      socket.off('opponentShotStart');
      socket.off('gameEnded');
      socket.off('error');
    };
  }, [gameId, userId, navigate, showToast]);

  // Listen for messages from the game iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'takeShot') {
        if (!canTakeShot) {
          console.warn('[TurnMode] Blocked shot - not your turn or animating');
          return;
        }

        // Player took a shot in the game, send to server
        console.log('[TurnMode] Sending shot to server:', event.data);
        socket.emit('takeShot', {
          gameId,
          userId,
          ...event.data.shot
        });
      }

      // Handle animation complete from game engine
      if (event.data.type === 'animationComplete') {
        console.log('[TurnMode] Animation complete, unlocking input');

        // Unlock input
        setIsEngineAnimating(false);

        // Apply pending turn update NOW (after animation finished)
        if (pendingTurnUpdate) {
          console.log('[TurnMode] Applying pending turn update:', pendingTurnUpdate);
          setGameState(pendingTurnUpdate);
          setPendingTurnUpdate(null);
        }
      }

      // Sync engine once it is ready
      if (event.data.type === 'engineReady') {
        console.log('[TurnMode] Game engine reported ready, sending initial state');
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'initUser',
            userId: userId
          }, '*');

          // Use the ref to get the latest gameState (avoids stale closure)
          const currentState = gameStateRef.current || gameState;
          if (currentState) {
            console.log('[TurnMode] Forwarding current gameState to newly ready engine:', currentState);
            iframe.contentWindow.postMessage({
              type: 'gameStateUpdate',
              state: currentState
            }, '*');
          }

          // Apply active settings too
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: soundEnabled,
              guideLine: guideLineEnabled,
              difficulty: difficulty
            }
          }, '*');

          // Replay matchStart to newly ready engine
          if (matchStartReceivedRef.current) {
            console.log('[TurnMode] Replaying matchStart to newly ready engine');
            const matchData = matchStartDataRef.current;
            iframe.contentWindow.postMessage({
              type: 'matchStart',
              state: matchData?.gameState || currentState
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, userId, canTakeShot, pendingTurnUpdate, isEngineAnimating, gameState, soundEnabled, guideLineEnabled, difficulty]);

  // Local countdown timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Scroll shot log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shotLogs]);

  if (!gameState) {
    return <LoadingSpinner text="Connecting to match..." />;
  }

  const player1 = gameState.players?.[0];
  const player2 = gameState.players?.[1];
  const entryFee = gameState.stake || gameState.betAmount || 0;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Player Info Overlay */}
      <PlayerInfoOverlay
        player1={player1}
        player2={player2}
        myId={userId}
        currentTurn={gameState.turn}
        entryFee={entryFee}
        timeRemaining={timeRemaining}
        canTakeShot={canTakeShot}
        isAnimating={isEngineAnimating}
        playerGroups={gameState.playerGroups}
        groupAssigned={gameState.groupAssigned}
      />

      {/* Header Menu Button - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex items-center gap-3 mt-14">
        <button 
          onClick={() => setShowPauseMenu(true)}
          className="bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]"
        >
          <Settings size={12} />
          <span>Menu & Settings</span>
        </button>
      </div>

      {/* Turn History / Shot Log Drawer - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[9999] w-64 max-h-40 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-auto">
        <div className="text-white/40 text-[9px] font-black uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between">
          <span>Match Log</span>
          <span className="text-blue-400 font-bold">8-BALL</span>
        </div>
        <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 pr-1">
          {shotLogs.map((log, idx) => (
            <div key={idx} className="text-white/90 text-[10px] font-medium leading-relaxed font-sans border-l border-blue-500/30 pl-1.5 py-0.5">
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

      {/* --- MENU & SETTINGS MODAL --- */}
      <AnimatePresence>
        {showPauseMenu && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPauseMenu(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#0c111d]/95 w-full max-w-md rounded-[3rem] border border-white/10 p-10 shadow-2xl relative z-10"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Match Menu</h3>
                <p className="text-gray-400 text-xs font-medium mt-1">Configure parameters or leave the match session</p>
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
                <button 
                  onClick={() => {
                    if (window.confirm('Forfeit this match and return to the dashboard? This will count as a loss.')) {
                      setShowPauseMenu(false);
                      socket.emit('leaveGame', { gameId });
                      navigate('/dashboard');
                    }
                  }}
                  className="w-full py-4.5 bg-red-950/80 hover:bg-red-900 border border-red-800/30 rounded-2xl font-black text-sm uppercase italic tracking-wide text-red-400 hover:text-red-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xl shadow-red-950/20"
                >
                  <X size={14} /> Forfeit & Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Status */}
      {!isConnected && !gameState && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
            <div className="text-white font-bold text-sm">⚠️ Reconnecting...</div>
          </div>
        </div>
      )}

      {/* Embed the 8 Ball Pro game engine */}
      <PoolGameEngineEmbed
        mode="turn"
        onStartSession={() => console.log('Game started')}
        onEndSession={() => console.log('Game ended')}
        onSaveScore={(score) => console.log('Score:', score)}
      />
    </div>
  );
};

export default TurnMode;

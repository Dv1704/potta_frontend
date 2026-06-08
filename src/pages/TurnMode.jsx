import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';
import { AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Eye, EyeOff, Sliders, RotateCcw, X, List, Trophy, AlertTriangle, CircleDot, MessageSquare, Send } from 'lucide-react';
import '../utils/pvpTestSuite';

/**
 * PlayerInfoOverlay - Shows player names and game stats on top of the game
 */
const PlayerInfoOverlay = ({ player1, player2, currentTurn, entryFee, timeRemaining, isGameStarted, onMenuClick, scores = {} }) => {
  const player1Score = player1?.id ? scores[player1.id] ?? 0 : 0;
  const player2Score = player2?.id ? scores[player2.id] ?? 0 : 0;
  const timerLabel = timeRemaining !== undefined && timeRemaining !== null ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` : '00:00';
  const prizeLabel = entryFee > 0 ? `GH¢${(entryFee * 1.8).toLocaleString()}` : 'FREE MATCH';

  return (
    <>
      {/* Dot indicator at very top */}
      <div className="fixed inset-x-0 top-2 md:top-4 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50"></div>
      </div>

      {/* Player names and scores at top center */}
      <div className="fixed inset-x-0 top-4 md:top-8 z-[9999] flex items-center justify-center pointer-events-none px-4">
        <div className="rounded-2xl bg-slate-950/50 border border-white/10 px-3 md:px-5 py-2 md:py-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.35em] font-semibold text-slate-300">
            <span className={`${isGameStarted && currentTurn === player1?.id ? 'text-white font-black' : 'text-slate-400'}`}>{player1?.name?.toUpperCase() || 'PLAYER 1'} <span className="ml-1">{player1Score}</span></span>
            <span className="text-slate-500">—</span>
            <span className={`${isGameStarted && currentTurn === player2?.id ? 'text-white font-black' : 'text-slate-400'}`}>{player2?.name?.toUpperCase() || 'PLAYER 2'} <span className="ml-1">{player2Score}</span></span>
          </div>
        </div>
      </div>

      {/* Timer and prize at bottom right corner */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/85 border border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/90 shadow-lg shadow-slate-950/50">
          <span>{timerLabel}</span>
          <span className="text-slate-500">|</span>
          <span>{prizeLabel}</span>
        </div>
      </div>

      {/* Settings button at top left beside home icon */}
      <div className="fixed top-3 md:top-6 left-3 md:left-6 z-[9999] pointer-events-auto">
        <button
          onClick={onMenuClick}
          title="Menu & Settings"
          className="flex h-9 md:h-11 w-9 md:w-11 items-center justify-center rounded-full bg-black/70 border border-white/10 text-white shadow-lg shadow-black/50 transition hover:bg-black/90 active:scale-95"
        >
          <span className="text-lg md:text-xl">⚙️</span>
        </button>
      </div>
    </>
  );
};

const toPixels = (balls) => {
  if (!balls) return balls;
  return Object.fromEntries(
    Object.entries(balls).map(([id, pos]) => [
      id,
      {
        x: (pos.x / 100) * 1280,
        y: (pos.y / 100) * 770,
        onTable: pos.onTable
      }
    ])
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
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', sender: 'System', text: 'Match chat is available while you play. Keep it concise.' }
  ]);

  // Game state
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [shotLogs, setShotLogs] = useState(['Game starting...']);

  // Animation lock state (CRITICAL FIX for turn synchronization)
  const [isEngineAnimating, setIsEngineAnimating] = useState(false);
  const [pendingTurnUpdate, setPendingTurnUpdate] = useState(null);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const isEngineReadyRef = useRef(false);

  const isEngineAnimatingRef = useRef(isEngineAnimating);
  useEffect(() => {
    isEngineAnimatingRef.current = isEngineAnimating;
  }, [isEngineAnimating]);

  const settingsRef = useRef({ soundEnabled, guideLineEnabled, difficulty });
  useEffect(() => {
    settingsRef.current = { soundEnabled, guideLineEnabled, difficulty };
  }, [soundEnabled, guideLineEnabled, difficulty]);

  // Refs to track match start data and latest game state (avoids stale closures)
  const matchStartReceivedRef = useRef(false);
  const matchStartDataRef = useRef(null);
  const gameStateRef = useRef(null);
  const logEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatOpenRef = useRef(false);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !userId || !gameId) return;

    const messageId = Date.now().toString();
    socket.emit('gameChat', {
      gameId,
      userId,
      messageId,
      text: trimmed,
    });
    setChatInput('');
  };

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendChat();
    }
  };

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
  };  // Socket connection and event handlers
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    connectSocket(userId);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('joinGame', { gameId });
      // Signal we are ready ONLY if the engine is ready, or if game has already started on the server
      if (isEngineReadyRef.current || gameStateRef.current?.isGameStarted) {
        socket.emit('playerReady', { gameId, userId });
      }
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinGame', { gameId });
      if (isEngineReadyRef.current || gameStateRef.current?.isGameStarted) {
        socket.emit('playerReady', { gameId, userId });
      }
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
      setIsGameStarted(true);
      if (data.gameState?.timer !== undefined) {
        setTimeRemaining(data.gameState.timer);
      }
      setShotLogs(['Match Started! Take the break shot.']);
      showToast('Game started!', 'success');

      // Forward to game iframe (try immediately + retry after delay for race condition)
      const sendMatchStart = () => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          const convertedGameState = data.gameState ? {
            ...data.gameState,
            balls: toPixels(data.gameState.balls)
          } : data.gameState;
          iframe.contentWindow.postMessage({ type: 'matchStart', state: convertedGameState }, '*');
          iframe.contentWindow.postMessage({ type: 'gameStateUpdate', state: convertedGameState }, '*');
          
          // Apply active settings too
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: settingsRef.current.soundEnabled,
              guideLine: settingsRef.current.guideLineEnabled,
              difficulty: settingsRef.current.difficulty
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
      if (gameStateRef.current && state.turn !== gameStateRef.current.turn && !isEngineAnimatingRef.current) {
        const player1 = state.players?.[0];
        const player2 = state.players?.[1];
        const oldTurnId = gameStateRef.current.turn;
        const oldPlayer = player1?.id === oldTurnId ? player1 : player2;
        const oldPlayerName = oldTurnId === userId ? 'You' : (oldPlayer?.name || 'Opponent');
        setShotLogs(prev => [...prev, `${oldPlayerName} timed out! Turn passed.`]);
      }

      setGameState(state);
      gameStateRef.current = state;

      if (state.timer !== undefined) {
        setTimeRemaining(state.timer);
      }
      if (state.isGameStarted) {
        setIsGameStarted(true);
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
          state: state ? {
            ...state,
            balls: toPixels(state.balls)
          } : state
        }, '*');
      }
    };

    const handleGameChat = (data) => {
      setChatMessages((prev) => [...prev, {
        id: data.messageId,
        sender: data.userId === userId ? 'You' : data.senderName,
        text: data.text,
      }] );

      if (!chatOpenRef.current && data.userId !== userId) {
        setUnreadChatCount((count) => Math.min(99, count + 1));
      }
    };

    const handleShotResult = async (data) => {
      console.log('[TurnMode] Shot result received:', data);
      setIsConnected(true);
      const { gameState: newGameState, shooterId, shotResult } = data;

      // Log shot result to history
      const player1 = gameStateRef.current?.players?.[0];
      const player2 = gameStateRef.current?.players?.[1];
      const shooter = player1?.id === shooterId ? player1 : player2;
      const shooterName = shooterId === userId ? 'You' : (shooter?.name || 'Opponent');

      if (shotResult) {
        let logMsg = '';
        if (shotResult.cueBallScratched) {
          logMsg = `${shooterName} scratched! (Foul)`;
        } else if (shotResult.firstBallCollided === null) {
          logMsg = `${shooterName} missed all balls! (Foul)`;
        } else {
          const objectBalls = shotResult.pocketedBalls.filter(id => id !== 0);
          if (objectBalls.length > 0) {
            logMsg = `${shooterName} pocketed ball(s): ${objectBalls.join(', ')}`;
          } else {
            logMsg = `${shooterName} shot (No balls pocketed)`;
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
        const convertedData = {
          ...data,
          gameState: data.gameState ? {
            ...data.gameState,
            balls: toPixels(data.gameState.balls)
          } : data.gameState
        };
        iframe.contentWindow.postMessage({
          type: 'shotResult',
          data: convertedData,
          payload: data.shotResult
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
          data: data.vector || data
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
    socket.on('gameChat', handleGameChat);
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
      socket.off('gameChat');
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

        // Emit animationComplete to backend
        socket.emit('animationComplete', {
          gameId,
          ballPositions: event.data.payload?.ballPositions || event.data.ballPositions
        });

        // Apply pending turn update NOW (after animation finished)
        if (pendingTurnUpdate) {
          console.log('[TurnMode] Applying pending turn update:', pendingTurnUpdate);
          setGameState(pendingTurnUpdate);
          gameStateRef.current = pendingTurnUpdate;
          setPendingTurnUpdate(null);
        }
      }


      // Sync engine once it is ready
      if (event.data.type === 'engineReady') {
        console.log('[TurnMode] Game engine reported ready, sending initial state');
        isEngineReadyRef.current = true;

        // Signal we are ready now that engine is loaded
        socket.emit('playerReady', { gameId, userId });

        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'initUser',
            userId: userId
          }, '*');

          // Use the ref to get the latest gameState (avoids stale closure)
          const currentState = gameStateRef.current;
          if (currentState) {
            console.log('[TurnMode] Forwarding current gameState to newly ready engine:', currentState);
            iframe.contentWindow.postMessage({
              type: 'gameStateUpdate',
              state: {
                ...currentState,
                balls: toPixels(currentState.balls)
              }
            }, '*');
          }

          // Apply active settings too
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: settingsRef.current.soundEnabled,
              guideLine: settingsRef.current.guideLineEnabled,
              difficulty: settingsRef.current.difficulty
            }
          }, '*');

          // Replay matchStart to newly ready engine
          if (matchStartReceivedRef.current) {
            console.log('[TurnMode] Replaying matchStart to newly ready engine');
            const matchData = matchStartDataRef.current;
            const matchState = matchData?.gameState || currentState;
            iframe.contentWindow.postMessage({
              type: 'matchStart',
              state: matchState ? {
                ...matchState,
                balls: toPixels(matchState.balls)
              } : matchState
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, userId, canTakeShot, pendingTurnUpdate]);

  // Local countdown timer effect
  useEffect(() => {
    if (!isGameStarted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, timeRemaining]);

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
  const cueBallPosition = gameState.balls?.['0'];
  const shotTimerProgress = Math.max(0, Math.min(1, (timeRemaining ?? 0) / 15));

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none pointer-events-none">
      {/* Player Info Overlay */}
      <PlayerInfoOverlay
        player1={player1}
        player2={player2}
        currentTurn={gameState.turn}
        entryFee={entryFee}
        timeRemaining={timeRemaining}
        isGameStarted={isGameStarted}
        scores={gameState.scores || {}}
        onMenuClick={() => setShowPauseMenu(true)}
      />

      {isGameStarted && cueBallPosition && timeRemaining !== null && timeRemaining !== undefined && (
        <div className="absolute inset-0 pointer-events-none z-[9997]">
          <div
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${cueBallPosition.x}%`, top: `${cueBallPosition.y}%` }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from -90deg, rgba(59,130,246,0.85) ${shotTimerProgress * 100}%, rgba(255,255,255,0.08) ${shotTimerProgress * 100}% 100%)`
              }}
            />
            <div className="absolute inset-1 rounded-full border border-sky-400/30 bg-slate-950/20" />
          </div>
        </div>
      )}

      {/* --- POTTED BALL TOAST FLOATER --- */}
      <div className="absolute inset-0 pointer-events-none z-[1000] flex items-center justify-center">
        <AnimatePresence>
          {pottedToasts.map((toast) => (
            <div
              key={toast.id}
              className="absolute bg-gradient-to-r from-yellow-500 to-amber-500 border border-yellow-300 text-white font-black font-sans px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl shadow-yellow-500/20"
            >
              <CircleDot className="h-4 w-4" />
              <span className="text-sm tracking-tight uppercase">Ball {toast.ball} pocketed!</span>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- VISUAL CUE FOR FOULS WITH EXPLANATION --- */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
        <AnimatePresence>
          {foulNotification.show && (
            <div className="bg-red-950/90 border border-red-500/35 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold text-lg animate-pulse border border-red-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-red-400 font-black text-sm uppercase tracking-wider">{foulNotification.reason}</h4>
                <p className="text-red-200/90 text-xs font-semibold mt-0.5 leading-relaxed">{foulNotification.description}</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">opponent gets ball-in-hand</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MENU & SETTINGS MODAL --- */}
      <AnimatePresence>
        {showPauseMenu && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div onClick={() => setShowPauseMenu(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <div className="bg-[#0c111d]/95 w-full max-w-md rounded-[3rem] border border-white/10 p-10 shadow-2xl relative z-10">
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
                    setShowPauseMenu(false);
                    socket.emit('leaveGame', { gameId });
                    showToast('Match forfeited. You will lose this game.', 'error');
                    setTimeout(() => navigate('/dashboard'), 2000);
                  }}
                  className="w-full py-4.5 bg-red-950/80 hover:bg-red-900 border border-red-800/30 rounded-2xl font-black text-sm uppercase italic tracking-wide text-red-400 hover:text-red-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xl shadow-red-950/20"
                >
                  <X size={14} /> Forfeit & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Status */}
      {!isConnected && !gameState && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
            <div className="flex items-center gap-2 text-white font-bold text-sm"><AlertTriangle className="h-4 w-4" /> Reconnecting...</div>
          </div>
        </div>
      )}

      {/* In-game Chat Button */}
      <div className="fixed bottom-4 right-4 z-[10001] flex flex-col items-end gap-3">
        <button
          onClick={() => {
            setChatOpen((open) => {
              const nextOpen = !open;
              if (nextOpen) setUnreadChatCount(0);
              return nextOpen;
            });
          }}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 border border-white/10 text-white shadow-2xl shadow-slate-950/40 hover:bg-slate-900 transition-all active:scale-95"
          aria-label="Toggle chat panel"
        >
          <span className="text-lg">💬</span>
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow-lg">
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {chatOpen && (
            <div className="w-[min(100vw-2rem,360px)] bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl shadow-slate-950/50 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/95">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Match Chat</p>
                  <p className="text-sm font-semibold text-white">Quick notes with your opponent</p>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 p-4 text-sm text-slate-200">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl p-3 ${message.sender === 'You' ? 'bg-blue-500/15 self-end text-white' : 'bg-slate-800/70 text-slate-200'}`}
                  >
                    <div className="font-semibold text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">{message.sender}</div>
                    <div>{message.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-white/10 bg-slate-900/95 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                    placeholder="Type a quick note..."
                  />
                  <button
                    onClick={handleSendChat}
                    className="rounded-2xl bg-blue-600 px-3 py-2 text-white text-sm font-bold hover:bg-blue-500 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Embed the 8 Ball Pro game engine - ensure pointer events for interaction */}
      <div className="pointer-events-auto">
        <PoolGameEngineEmbed
          mode="turn"
          onStartSession={() => console.log('Game started')}
          onEndSession={() => console.log('Game ended')}
          onSaveScore={(score) => console.log('Score:', score)}
        />
      </div>

      {/* Waiting Overlay */}
      {!isGameStarted && gameState && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4 animate-bounce">Waiting for opponent...</div>
            <div className="text-white/60">Game starts when both players connect.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnMode;

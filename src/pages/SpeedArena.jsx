import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';
import { AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Eye, EyeOff, Sliders, X, List, Trophy, Zap, AlertTriangle, CircleDot, MessageSquare, Send } from 'lucide-react';

/**
 * PlayerInfoOverlay - Shows player names and game stats on top of the game
 */
const PlayerInfoOverlay = ({ player1, player2, entryFee, overallTimeRemaining = 60, scores = {}, onMenuClick }) => {
  const player1Score = scores[player1?.id] ?? 0;
  const player2Score = scores[player2?.id] ?? 0;
  const mins = Math.floor(overallTimeRemaining / 60);
  const secs = (overallTimeRemaining % 60).toString().padStart(2, '0');
  const isLow = overallTimeRemaining <= 10;
  const prizeLabel = entryFee > 0 ? `GH¢${(entryFee * 1.8).toLocaleString()}` : 'FREE';

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/95 border-b border-white/10 px-3 py-2 backdrop-blur-xl text-white">

        {/* Settings button */}
        <button
          onClick={onMenuClick}
          className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition hover:bg-white/10 active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Player 1 */}
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-black text-sm border border-blue-500/30">
            {(player1?.name || 'P1').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-blue-400/70 leading-none">You</p>
            <p className="text-xs font-black text-white truncate leading-tight">{player1?.name?.toUpperCase() || 'PLAYER 1'}</p>
          </div>
          <p className="ml-auto text-2xl font-black text-blue-400 tabular-nums shrink-0">{player1Score}</p>
        </div>

        {/* Timer + mode */}
        <div className="flex shrink-0 flex-col items-center px-2">
          <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 leading-none mb-0.5">Speed</p>
          <p className={`text-xl font-black tabular-nums leading-none ${isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {mins}:{secs}
          </p>
          {entryFee > 0 && (
            <p className="text-[8px] uppercase tracking-widest text-amber-400/80 leading-none mt-0.5">{prizeLabel}</p>
          )}
        </div>

        {/* Player 2 */}
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 min-w-0 flex-row-reverse">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-black text-sm border border-rose-500/30">
            {(player2?.name || 'P2').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[9px] uppercase tracking-widest text-rose-400/70 leading-none">Opponent</p>
            <p className="text-xs font-black text-white truncate leading-tight">{player2?.name?.toUpperCase() || 'PLAYER 2'}</p>
          </div>
          <p className="mr-auto text-2xl font-black text-rose-400 tabular-nums shrink-0">{player2Score}</p>
        </div>

      </div>
    </div>
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

// Speed Mode: always inject userId as the active turn so the engine never hides the stick
const forSpeed = (state, userId) => state ? { ...state, turn: userId } : state;

const SpeedArena = () => {
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
  const [overallTimeRemaining, setOverallTimeRemaining] = useState(60);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', sender: 'System', text: 'Quick chat is available during gameplay. Keep it short and slick.' }
  ]);
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

  // Animation lock state (same pattern as TurnMode)
  const [isEngineAnimating, setIsEngineAnimating] = useState(false);
  const [pendingTurnUpdate, setPendingTurnUpdate] = useState(null);

  // Refs to track match start data and latest game state (avoids stale closures)
  const matchStartReceivedRef = useRef(false);
  const matchStartDataRef = useRef(null);
  const gameStateRef = useRef(null);
  const isEngineReadyRef = useRef(false);

  const isEngineAnimatingRef = useRef(isEngineAnimating);
  useEffect(() => {
    isEngineAnimatingRef.current = isEngineAnimating;
  }, [isEngineAnimating]);

  const settingsRef = useRef({ soundEnabled, guideLineEnabled, difficulty });
  useEffect(() => {
    settingsRef.current = { soundEnabled, guideLineEnabled, difficulty };
  }, [soundEnabled, guideLineEnabled, difficulty]);

  // Computed: who can actually take a shot (blocks during animation only)
  const canTakeShot = useMemo(() => {
    if (!gameState || isEngineAnimating || !isGameStarted) return false;
    return true;
  }, [gameState, isEngineAnimating, isGameStarted]);

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

    const handleGameState = (state) => {
      console.log('[SpeedArena] Game state received:', state);
      setIsConnected(true);
      setGameState(state);
      gameStateRef.current = state;

      if (state.overallTimeRemaining !== undefined) {
        setOverallTimeRemaining(state.overallTimeRemaining);
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
          state: state ? { ...forSpeed(state, userId), balls: toPixels(state.balls) } : state
        }, '*');

        // Send player names to game engine
        if (state.players && state.players.length >= 2) {
          iframe.contentWindow.postMessage({
            type: 'updatePlayerNames',
            player1Name: state.players[0].name,
            player2Name: state.players[1].name
          }, '*');
        }
      }
    };

    const handleGameChat = (data) => {
      setChatMessages((prev) => [...prev, {
        id: data.messageId,
        sender: data.userId === userId ? 'You' : data.senderName,
        text: data.text,
      }]);

      if (!chatOpenRef.current && data.userId !== userId) {
        setUnreadChatCount((count) => Math.min(99, count + 1));
      }
    };

    const handleShotResult = async (data) => {
      console.log('[SpeedArena] Shot result:', data);
      setIsConnected(true);
      const { gameState: newGameState, shooterId, shotResult } = data;

      if (shotResult) {
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
          } else {
            foulType = 'Foul';
            desc = 'General speed foul or rail contact violation.';
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

      // Lock input during animation
      console.log('[SpeedArena] Locking input for animation');
      setIsEngineAnimating(true);

      // Safety: unlock after 7s if animationComplete never arrives from iframe
      setTimeout(() => {
        if (isEngineAnimatingRef.current) {
          console.warn('[SpeedArena] Animation timeout — force-unlocking cue stick');
          setIsEngineAnimating(false);
        }
      }, 7000);

      // Store pending state (don't apply until animation completes)
      setPendingTurnUpdate(newGameState);

      // Send to game engine (starts animation)
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        const convertedData = {
          ...data,
          gameState: data.gameState ? {
            ...forSpeed(data.gameState, userId),
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
        showToast('Opponent scored!', 'info');
      }
    };

    const handleOpponentShotStart = (data) => {
      console.log('[SpeedArena] Opponent shot start:', data);
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

    const handleStartMatch = (data) => {
      console.log('[SpeedArena] Match Started!', data);
      matchStartReceivedRef.current = true;
      matchStartDataRef.current = data;
      setIsGameStarted(true);
      setGameState(data.gameState);
      gameStateRef.current = data.gameState;
      if (data.gameState.overallTimeRemaining !== undefined) {
        setOverallTimeRemaining(data.gameState.overallTimeRemaining);
      }
      showToast('Start!', 'success');

      // Forward to game iframe (try immediately + retry for race condition)
      const sendMatchStart = () => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          const convertedGameState = data.gameState ? {
            ...forSpeed(data.gameState, userId),
            balls: toPixels(data.gameState.balls)
          } : data.gameState;
          iframe.contentWindow.postMessage({ type: 'matchStart', state: convertedGameState }, '*');
          iframe.contentWindow.postMessage({ type: 'gameStateUpdate', state: convertedGameState }, '*');
          
          // Send settings down
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
      setTimeout(sendMatchStart, 1000);
      setTimeout(sendMatchStart, 3000);
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
        // CRITICAL: Only allow shot if canTakeShot is true
        if (!canTakeShot) {
          console.warn('[SpeedArena] Blocked shot - not your turn or animating');
          return;
        }

        console.log('[SpeedArena] Sending shot to server:', event.data);
        socket.emit('takeShot', {
          gameId,
          userId,
          ...event.data.shot
        });
        
      }

      // Handle animation complete from game engine
      if (event.data.type === 'animationComplete') {
        console.log('[SpeedArena] Animation complete, unlocking input');
        setIsEngineAnimating(false);

        // Emit animationComplete to backend
        socket.emit('animationComplete', {
          gameId,
          ballPositions: event.data.payload?.ballPositions || event.data.ballPositions
        });

        // Apply pending turn update NOW (after animation finished)
        if (pendingTurnUpdate) {
          console.log('[SpeedArena] Applying pending turn update:', pendingTurnUpdate);
          setGameState(pendingTurnUpdate);
          gameStateRef.current = pendingTurnUpdate;
          setPendingTurnUpdate(null);

          // Forward to engine so it can respot cue ball if foulOccurred
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'gameStateUpdate',
              state: { ...forSpeed(pendingTurnUpdate, userId), balls: toPixels(pendingTurnUpdate.balls) }
            }, '*');
          }
        }
      }


      // Sync engine once it is ready
      if (event.data.type === 'engineReady') {
        console.log('[SpeedArena] Game engine reported ready, sending initial state');
        isEngineReadyRef.current = true;

        // Signal we are ready now that engine is loaded
        socket.emit('playerReady', { gameId, userId });

        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'initUser',
            userId: userId
          }, '*');

          const currentState = gameStateRef.current;
          if (currentState) {
            console.log('[SpeedArena] Forwarding current gameState to newly ready engine');
            iframe.contentWindow.postMessage({
              type: 'gameStateUpdate',
              state: { ...forSpeed(currentState, userId), balls: toPixels(currentState.balls) }
            }, '*');
          }

          // Apply settings preference
          iframe.contentWindow.postMessage({
            type: 'applySettings',
            settings: {
              sound: settingsRef.current.soundEnabled,
              guideLine: settingsRef.current.guideLineEnabled,
              difficulty: settingsRef.current.difficulty
            }
          }, '*');

          // Replay matchStart if it was already received before engine was ready
          if (matchStartReceivedRef.current) {
            console.log('[SpeedArena] Replaying matchStart to newly ready engine');
            const matchData = matchStartDataRef.current;
            const matchState = matchData?.gameState || currentState;
            iframe.contentWindow.postMessage({
              type: 'matchStart',
              state: matchState ? { ...forSpeed(matchState, userId), balls: toPixels(matchState.balls) } : matchState
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, userId, canTakeShot, pendingTurnUpdate]);

  // Local countdown timer effect for the overall match clock
  useEffect(() => {
    if (!isGameStarted) return;

    const timer = setInterval(() => {
      setOverallTimeRemaining(prev => Math.max(0, (prev || 0) - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted]);

  if (!gameState) {
    return <LoadingSpinner text="Finding opponent..." />;
  }

  const player1 = gameState.players?.[0];
  const player2 = gameState.players?.[1];
  const entryFee = gameState.stake || gameState.betAmount || 0;
  const cueBallPosition = gameState.balls?.['0'];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none pointer-events-none">
      {/* Player Info Overlay */}
      <PlayerInfoOverlay
        player1={player1}
        player2={player2}
        entryFee={entryFee}
        overallTimeRemaining={overallTimeRemaining}
        scores={gameState?.scores || {}}
        onMenuClick={() => setShowPauseMenu(true)}
      />

      {isGameStarted && cueBallPosition && (
        <div className="absolute inset-0 pointer-events-none z-[9997]">
          <div
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-500/60 bg-sky-500/10"
            style={{ left: `${cueBallPosition.x}%`, top: `${cueBallPosition.y}%` }}
          />
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
              <CircleDot className="w-4 h-4" />
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
              <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 animate-pulse border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-red-400 font-black text-sm uppercase tracking-wider">{foulNotification.reason}</h4>
                <p className="text-red-200/90 text-xs font-semibold mt-0.5 leading-relaxed">{foulNotification.description}</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Opponent gets ball-in-hand</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MENU & SETTINGS MODAL --- */}
      <AnimatePresence>
        {showPauseMenu && (
          <div className="pointer-events-auto fixed inset-0 z-[100000] flex items-center justify-center p-4">
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
          <div className="bg-red-500/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
            <div className="flex items-center gap-2 text-white font-bold text-sm"><AlertTriangle className="w-4 h-4" /> Reconnecting...</div>
          </div>
        </div>
      )}

      {/* In-game Chat Button */}
      <div className="fixed bottom-4 left-4 z-[10001] flex flex-col items-end gap-3 pointer-events-auto">
        <button
          onClick={() => {
            setChatOpen((open) => {
              const nextOpen = !open;
              if (nextOpen) setUnreadChatCount(0);
              return nextOpen;
            });
          }}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 border border-white/10 text-white shadow-2xl shadow-slate-950/40 transition-all hover:bg-slate-900 active:scale-95"
          aria-label="Toggle chat panel"
        >
          <span className="text-base">💬</span>
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
      <div className="pointer-events-auto relative">
        <PoolGameEngineEmbed
          mode="speed"
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

export default SpeedArena;

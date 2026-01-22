import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';

/**
 * PlayerInfoOverlay - Shows player names and game stats on top of the game
 */
const PlayerInfoOverlay = ({ player1, player2, myId, stake, timeRemaining }) => {
  return (
    <>
      {/* Player 1 Info - Top Left */}
      <div className="absolute top-4 left-4 z-[9999] pointer-events-none">
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <div className="text-white font-bold text-sm">
              {player1?.name || 'Player 1'} {player1?.id === myId && '(YOU)'}
            </div>
          </div>
        </div>
      </div>

      {/* Player 2 Info - Top Right */}
      <div className="absolute top-4 right-4 z-[9999] pointer-events-none">
        <div className="bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="text-white font-bold text-sm text-right">
              {player2?.name || 'Player 2'} {player2?.id === myId && '(YOU)'}
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stake Info - Top Center */}
      {
        stake && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-600/90 to-amber-600/90 backdrop-blur-sm rounded-lg px-6 py-2 shadow-xl border border-white/20">
              <div className="text-center">
                <div className="text-yellow-100 text-xs font-semibold">STAKE</div>
                <div className="text-white font-bold text-lg">GH₵{stake.toLocaleString()}</div>
                <div className="text-yellow-200 text-xs">Winner takes: GH₵{(stake * 1.8).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )
      }

      {/* Timer - Bottom Center (for Speed Mode) */}
      {timeRemaining !== undefined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className={`${timeRemaining < 10 ? 'bg-red-500/90 animate-pulse' : 'bg-blue-600/90'} backdrop-blur-sm rounded-lg px-4 py-1 shadow-lg border border-white/20 min-w-[80px] text-center`}>
              <div className="text-white font-mono font-bold text-lg">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Time Left</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SpeedArena = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Game state
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const userId = localStorage.getItem('userId');

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
      // Signal we are ready. If both are ready, game starts.
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

    const handleGameState = (state) => {
      console.log('[SpeedArena] Game state received:', state);
      setIsConnected(true);
      setGameState(state);

      // Update timer from gameState
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
          state: state
        }, '*');
      }
    };

    const handleShotResult = async (data) => {
      console.log('[SpeedArena] Shot result:', data);
      setIsConnected(true);
      const { gameState: newGameState, shooterId } = data;
      setGameState(newGameState);

      // Notify game iframe
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'shotResult',
          data: data
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
          data: data
        }, '*');
      }
    };

    const handleGameEnded = (data) => {
      showToast(data.message || 'Game Over', 'success');
      setTimeout(() => navigate('/dashboard'), 3000);
    };

    const handleStartMatch = (data) => {
      console.log('[SpeedArena] Match Started!', data);
      setIsGameStarted(true);
      setGameState(data.gameState);
      setTimeRemaining(data.gameState.timer);
      showToast('Start!', 'success');

      // Notify iframe
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'matchStart',
          state: data.gameState
        }, '*');
      }
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
        // Player took a shot in the game, send to server
        // GATE: Only allow if it's my turn
        if (gameState && gameState.turn !== userId) {
          console.warn('[SpeedArena] Blocked shot: Not my turn');
          return;
        }

        console.log('[SpeedArena] Sending shot to server:', event.data);
        socket.emit('takeShot', {
          gameId,
          userId,
          ...event.data.shot
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, userId]);

  // Local countdown timer effect
  useEffect(() => {
    if (!isGameStarted) return;
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  if (!gameState) {
    return <LoadingSpinner text="Finding opponent..." />;
  }

  const player1 = gameState.players?.[0];
  const player2 = gameState.players?.[1];
  const stake = gameState.stake || gameState.betAmount || 0;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Player Info Overlay */}
      <PlayerInfoOverlay
        player1={player1}
        player2={player2}
        myId={userId}
        stake={stake}
        timeRemaining={timeRemaining}
      />

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
        mode="speed"
        onStartSession={() => console.log('Game started')}
        onEndSession={() => console.log('Game ended')}
        onSaveScore={(score) => console.log('Score:', score)}
      />

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

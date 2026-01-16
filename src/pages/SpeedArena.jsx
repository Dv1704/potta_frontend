import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PoolTable from '../components/PoolTable';

const PlayerGUI = ({ name, score, isTurn, align = 'left' }) => (
  <div className={`absolute top-4 ${align === 'left' ? 'left-4' : 'right-4'} z-50 flex flex-col items-center pointer-events-none`}>
    <div className="relative w-48 h-16">
      <img
        src="/assets/pool/player_gui.png"
        alt={`Player ${name}`}
        className="w-full h-full object-contain drop-shadow-lg"
      />
      <div className="absolute top-2 left-14 w-32 h-6 flex items-center mb-1">
        <span className="text-white font-bold text-xs truncate max-w-full font-['Montserrat'] drop-shadow-md">{name}</span>
      </div>
      <div className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center">
        <span className={`text-2xl font-black ${isTurn ? 'text-[#FFD700]' : 'text-white'} font-['Montserrat'] drop-shadow-md`}>{score}</span>
      </div>
      {isTurn && (
        <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.4)] pointer-events-none"></div>
      )}
    </div>
  </div>
);

const SpeedArena = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gameState, setGameState] = useState(null);
  const [shotParams, setShotParams] = useState({ angle: 0, power: 50 });
  const [spin, setSpin] = useState({ x: 0, y: 0 });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localTimer, setLocalTimer] = useState(60);
  const [is3D, setIs3D] = useState(true);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Local Timer Countdown
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
      sideSpin: spin.x,
      backSpin: spin.y
    });
  };

  if (loading || !gameState) return <LoadingSpinner text="Connecting..." />;

  const isCritical = localTimer < 15;

  // Determine Names
  const opponentPlayer = gameState.players?.find(p => p.id !== userId);
  const myName = "YOU";
  const opponentName = opponentPlayer?.name?.toUpperCase() || "OPPONENT";

  return (
    <div className="relative w-full h-screen bg-[#121212] overflow-hidden flex flex-col font-sans select-none">

      {/* Mobile Orientation Warning */}
      {isPortrait && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
          <div className="text-6xl mb-4">↻</div>
          <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-gray-400">For the best experience, flip your phone to landscape mode.</p>
        </div>
      )}

      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-[url('/assets/pool/bg_game.jpg')] bg-cover bg-center transition-colors duration-1000 ${isCritical ? 'contrast-125 saturate-150' : ''}`}></div>
      {isCritical && <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay pointer-events-none animate-pulse"></div>}

      {/* HUD Layers */}
      <PlayerGUI
        name={myName}
        score={0} // Speed mode score logic?
        isTurn={isMyTurn}
        align="left"
      />
      <PlayerGUI
        name={opponentName}
        score={0}
        isTurn={!isMyTurn}
        align="right"
      />

      {/* Central Round Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
        <span className={`text-4xl font-black font-['Montserrat'] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] ${isCritical ? 'text-red-500' : 'text-white'}`}>
          {localTimer}
        </span>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative p-0 flex items-center justify-center">
        <PoolTable
          balls={gameState.balls || {}}
          angle={shotParams.angle}
          setAngle={(a) => setShotParams(prev => ({ ...prev, angle: a }))}
          power={shotParams.power}
          setPower={(p) => setShotParams(prev => ({ ...prev, power: p }))}
          spin={spin}
          setSpin={setSpin}
          isMyTurn={isMyTurn}
          onTakeShot={handleTakeShot}
          is3D={is3D}
        />
      </div>

    </div>
  );
};

export default SpeedArena;

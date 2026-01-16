import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import PoolTable from '../components/PoolTable';

const PlayerGUI = ({ name, score, isTurn, align = 'left' }) => (
  <div className={`absolute top-4 ${align === 'left' ? 'left-4' : 'right-4'} z-50 flex flex-col items-center pointer-events-none`}>
    <div className="relative w-48 h-16">
      <img
        src="/assets/pool/player_gui.png"
        alt={`Player ${name}`}
        className="w-full h-full object-contain drop-shadow-lg"
      />
      {/* Name - Approx position based on asset layout */}
      {/* Name - Approx position based on asset layout - CENTERED */}
      <div className="absolute top-2 left-14 w-32 h-6 flex items-center justify-center mb-1">
        <span className="text-white font-bold text-xs truncate max-w-full font-['Montserrat'] drop-shadow-md text-center">{name}</span>
      </div>
      {/* Score */}
      <div className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center">
        <span className={`text-2xl font-black ${isTurn ? 'text-[#FFD700]' : 'text-white'} font-['Montserrat'] drop-shadow-md`}>{score}</span>
      </div>
      {/* Turn Indicator Highlight - Optional Overlay */}
      {isTurn && (
        <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.4)] pointer-events-none"></div>
      )}
    </div>
  </div>
);

const TurnMode = () => {
  // ... State logic (keep mostly same)
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gameState, setGameState] = useState(null);
  const [lastShotResult, setLastShotResult] = useState(null);
  const [shotParams, setShotParams] = useState({ angle: 0, power: 50 });
  const [spin, setSpin] = useState({ x: 0, y: 0 });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const userId = localStorage.getItem('userId');
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... (Keep useEffect logic)
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
      sideSpin: spin.x,
      backSpin: spin.y
    });
  };

  if (!gameState) return <LoadingSpinner text="Connecting..." />;


  // Determine Names
  const myPlayer = gameState.players?.find(p => p.id === userId);
  const opponentPlayer = gameState.players?.find(p => p.id !== userId);

  const myName = "YOU"; // Always show YOU for self
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
      <div className="absolute inset-0 bg-[url('/assets/pool/bg_game.jpg')] bg-cover bg-center"></div>

      {/* HUD Layers */}
      <PlayerGUI
        name={myName}
        score={gameState.player1Score || 0}
        isTurn={isMyTurn}
        align="left"
      />
      <PlayerGUI
        name={opponentName}
        score={gameState.player2Score || 0}
        isTurn={!isMyTurn}
        align="right"
      />

      {/* Main Game Area */}
      <div className="flex-1 relative flex items-center justify-center p-0 md:p-0">
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

      {/* Exit Button (Top Right of Scene usually, or handled by menu) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        {/* Maybe a VS panel or Timer? For now clean. */}
      </div>

    </div>
  );
};

export default TurnMode;

// End of file

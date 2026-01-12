import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCircle, FaUndo, FaUser, FaTrophy, FaBolt, FaBullseye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const TurnMode = () => {
  const { showToast } = useToast();
  const [turn, setTurn] = useState('You');
  const [moves, setMoves] = useState([]);
  const [score, setScore] = useState({ you: 0, opponent: 0 });
  const [gameState, setGameState] = useState('playing'); // playing, won, lost

  // Simulate opponent's turn
  useEffect(() => {
    if (turn === 'Opponent' && gameState === 'playing') {
      const timeout = setTimeout(() => {
        handleShot();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [turn, gameState]);

  const handleShot = () => {
    if (gameState !== 'playing') return;

    // Simulate shot outcome
    const isSuccess = Math.random() > 0.3; // 70% hit rate
    const points = isSuccess ? 1 : 0;

    // Create move log entry
    const action = isSuccess ? 'potted a ball!' : 'missed the shot.';
    const move = `${turn} ${action}`;

    setMoves(prev => [move, ...prev]);

    if (isSuccess) {
      // Update score
      setScore(prev => ({
        ...prev,
        [turn.toLowerCase()]: prev[turn.toLowerCase()] + points
      }));
      showToast(`${turn} ${action}`, 'success');

      // Check win condition (first to 8)
      if (score[turn.toLowerCase()] + 1 >= 8) {
        setGameState(turn === 'You' ? 'won' : 'lost');
        showToast(`${turn} Wins!`, 'success');
      }

      // If success, keep turn (standard pool rules usually, but simplified here)
      // For turn-based challenge, let's alternate unless specified otherwise. 
      // Let's alternate to make it "Turn-Turn" explicitly.
      setTurn(prev => prev === 'You' ? 'Opponent' : 'You');
    } else {
      showToast(`${turn} missed!`, 'error');
      setTurn(prev => prev === 'You' ? 'Opponent' : 'You');
    }
  };

  const resetGame = () => {
    setTurn('You');
    setMoves([]);
    setScore({ you: 0, opponent: 0 });
    setGameState('playing');
    showToast('Game Reset!', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 pt-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <FaUndo className="text-3xl text-green-400" />
            Turn-Based Mode
          </h1>
          <p className="text-gray-400 mt-2">Take turns, pot balls, and outsmart your opponent.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Panel: Player Stats */}
          <div className="space-y-6">
            <PlayerCard
              name="You"
              avatar="https://i.pravatar.cc/100?img=32"
              score={score.you}
              active={turn === 'You'}
              color="green"
            />
            <PlayerCard
              name="Opponent"
              avatar="https://i.pravatar.cc/100?img=15"
              score={score.opponent}
              active={turn === 'Opponent'}
              color="red"
            />
          </div>

          {/* Center Panel: Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pool Table Visualization */}
            <div className="relative bg-[#0d1b2a] rounded-2xl border-8 border-[#3e2723] p-4 shadow-2xl h-80 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-green-800 opacity-80 radial-gradient"></div>
              {/* Pockets */}
              <div className="absolute top-0 left-0 w-8 h-8 bg-black rounded-br-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-black rounded-bl-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-black rounded-tr-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-tl-xl"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-black rounded-b-xl"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-black rounded-t-xl"></div>

              <div className="relative z-10 text-center">
                {gameState === 'playing' ? (
                  <motion.div
                    animate={{ scale: turn === 'You' ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <p className="text-2xl font-bold text-white drop-shadow-md mb-4">
                      {turn}'s Turn
                    </p>
                    {turn === 'You' && (
                      <button
                        onClick={handleShot}
                        className="px-8 py-3 bg-white text-green-700 font-bold rounded-full shadow-lg hover:bg-green-50 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                      >
                        <FaBullseye /> Shoot!
                      </button>
                    )}
                    {turn === 'Opponent' && (
                      <p className="text-gray-300 animate-pulse">Thinking...</p>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">
                      {gameState === 'won' ? '🎉 You Won! 🎉' : '💀 You Lost!'}
                    </h2>
                    <button
                      onClick={resetGame}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Moves Log */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 h-64 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaBolt className="text-yellow-400" /> Match Log
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {moves.map((move, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg text-sm"
                    >
                      <div className={`w-2 h-2 rounded-full ${move.includes('You') ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-gray-300">{move}</span>
                    </motion.div>
                  ))}
                  {moves.length === 0 && (
                    <p className="text-gray-500 text-center italic mt-10">Game started. Waiting for first move...</p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={resetGame}
                className="px-4 py-2 text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <FaUndo /> Reset
              </button>
              <Link
                to="/game/dashboard"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                Exit to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PlayerCard = ({ name, avatar, score, active, color }) => (
  <motion.div
    animate={{
      borderColor: active ? (color === 'green' ? '#4ade80' : '#f87171') : 'transparent',
      scale: active ? 1.02 : 1
    }}
    className={`bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border-2 border-transparent transition-all shadow-xl`}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-1 rounded-full border-2 ${active ? (color === 'green' ? 'border-green-400' : 'border-red-400') : 'border-gray-600'}`}>
        <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />
      </div>
      <div>
        <h3 className={`font-bold text-lg ${active ? 'text-white' : 'text-gray-400'}`}>{name}</h3>
        <p className="text-xs text-gray-500">{active ? 'Taking shot...' : 'Waiting'}</p>
      </div>
    </div>
    <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl">
      <span className="text-gray-400 text-sm">Balls Potted</span>
      <span className={`text-2xl font-bold ${color === 'green' ? 'text-green-400' : 'text-red-400'}`}>{score}/8</span>
    </div>
  </motion.div>
);

export default TurnMode;

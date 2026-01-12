import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Gamepad2, Trophy, Target, Dice5, Puzzle, Zap,
  Sword, Crown, Star, Flame, CircleDot, Brain,
  Heart, DollarSign, TrendingUp, ArrowLeft, Play,
  Users, Clock, ChevronRight, Wallet, History, Settings,
  X, Plane, Shuffle, Plus, Lock
} from 'lucide-react';
import { api } from '../utils/api';

const initialUser = {
  id: '',
  username: 'Guest',
  balance: 0,
  totalGames: 0,
  totalWins: 0,
  currency: 'GH₵'
};

const games = [
  {
    id: 'aviator',
    name: 'Aviator Crash',
    icon: Plane,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop',
    color: 'from-sky-600 to-blue-800',
    minBet: 10,
    maxBet: 50000,
    players: 12847,
    category: 'Crash',
    winRate: '45%',
    description: 'Watch the plane fly! Cash out before it crashes for massive wins!',
    type: 'aviator'
  },
  {
    id: 'dice-game',
    name: 'Dice Battle',
    icon: Dice5,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop',
    color: 'from-red-600 to-red-800',
    minBet: 20,
    maxBet: 5000,
    players: 4521,
    category: 'Instant',
    winRate: '50%',
    description: 'Roll the dice! Highest number wins instantly!',
    type: 'dice'
  },
  {
    id: 'coin-flip',
    name: 'Coin Toss',
    icon: DollarSign,
    image: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&h=400&fit=crop',
    color: 'from-amber-600 to-amber-800',
    minBet: 20,
    maxBet: 10000,
    players: 8932,
    category: 'Instant',
    winRate: '50%',
    description: 'Heads or tails? Classic 50/50 game!',
    type: 'coin'
  },
  {
    id: 'spin-wheel',
    name: 'Lucky Wheel',
    icon: CircleDot,
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=400&fit=crop',
    color: 'from-yellow-600 to-orange-800',
    minBet: 10,
    maxBet: 2000,
    players: 6784,
    category: 'Instant',
    winRate: '42%',
    description: 'Spin to win! Land on your color!',
    type: 'wheel'
  },
  {
    id: 'card-flip',
    name: 'Card Flip',
    icon: Puzzle,
    image: 'https://images.unsplash.com/photo-1571670274306-84265de1e1e2?w=400&h=400&fit=crop',
    color: 'from-green-600 to-green-800',
    minBet: 50,
    maxBet: 8000,
    players: 2156,
    category: 'Cards',
    winRate: '49%',
    description: 'Pick a card, higher card wins!',
    type: 'card'
  },
  {
    id: 'number-guess',
    name: 'Number Rush',
    icon: Brain,
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=400&fit=crop',
    color: 'from-indigo-600 to-indigo-800',
    minBet: 30,
    maxBet: 3000,
    players: 1678,
    category: 'Instant',
    winRate: '46%',
    description: 'Guess the number 1-10!',
    type: 'number'
  },
  {
    id: 'color-match',
    name: 'Color Match',
    icon: Puzzle,
    image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&h=400&fit=crop',
    color: 'from-pink-600 to-pink-800',
    minBet: 25,
    maxBet: 4000,
    players: 3421,
    category: 'Instant',
    winRate: '47%',
    description: 'Match 3 colors to win!',
    type: 'color'
  },
  {
    id: 'pool-8ball',
    name: '8 Ball Pool',
    icon: CircleDot,
    image: 'https://images.unsplash.com/photo-1626336767159-0740106f0e63?w=400&h=400&fit=crop',
    color: 'from-blue-600 to-blue-800',
    minBet: 50,
    maxBet: 10000,
    players: 2847,
    category: 'Classic',
    winRate: '48%',
    description: 'Pot balls! Quick pool game!',
    type: 'pool'
  }
];

export default function GameDashboard() {
  const { showToast } = useToast();
  const [selectedGame, setSelectedGame] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');

      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch User Stats
      const statsRes = await api.get('/game/stats', token);
      const statsData = await statsRes.json();

      // Fetch Wallet Balance
      const balanceRes = await api.get('/wallet/balance', token);
      const balanceData = await balanceRes.json();

      // Fetch User Profile
      const profileRes = await api.get('/auth/profile', token);
      const profileData = await profileRes.json();

      if (statsRes.ok && balanceRes.ok) {
        setUser(prev => ({
          ...prev,
          balance: parseFloat(balanceData.available) || 0,
          lockedBalance: parseFloat(balanceData.locked) || 0,
          currency: balanceData.currency === 'GHS' ? 'GH₵' : balanceData.currency,
          totalGames: statsData.totalGames,
          totalWins: statsData.wins,
          username: (profileRes.ok && profileData.name) ? profileData.name : (profileData.email || 'Player')
        }));
        console.log('Fetched User Data - Available:', balanceData.available, 'Locked:', balanceData.locked);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      showToast('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Verify Payment if returning from Paystack
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');

      if (reference) {
        // Clear params to prevent re-verification on reload
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('Verifying deposit...', 'info');

        try {
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

          const res = await api.get(`/payments/verify/${reference}`, token);

          const data = await res.json();

          if (res.ok && (data.status === 'success' || data.status === 'already_processed')) {
            const msg = data.status === 'success' ? 'Deposit confirmed! Balance updated.' : 'Transaction confirmed. Balance updated.';
            showToast(msg, 'success');

            // Authoritative update from backend (with fallback)
            setUser(prev => ({
              ...prev,
              balance: data.newBalance !== undefined ? data.newBalance : (prev.balance + (parseFloat(data.amount) || 0))
            }));

            // Refresh user data to sync (in case of other changes)
            fetchUserData();
          } else {
            showToast('Payment verification failed.', 'error');
          }
        } catch (error) {
          console.error(error);
          showToast('Failed to verify payment.', 'error');
        }
      }
    };

    verifyPayment();
  }, [showToast]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Deposit Logic States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (!token) {
      showToast('Please log in first', 'error');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) < 10) {
      showToast('Minimum deposit is 10 GH₵', 'error');
      return;
    }

    setDepositLoading(true);
    try {
      const res = await api.post('/payments/deposit/initialize', {
        amount: parseFloat(depositAmount),
        currency: 'GHS',
        email: user?.email || 'user@example.com',
        callbackUrl: window.location.href // Redirect back here after payment
      }, token);

      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        showToast(data.message || 'Deposit initiation failed', 'error');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      showToast('Connection error during deposit', 'error');
    } finally {
      setDepositLoading(false);
      setShowDepositModal(false);
    }
  };

  const [multiplier, setMultiplier] = useState(1.00);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);

  const [userChoice, setUserChoice] = useState(null);
  const [systemChoice, setSystemChoice] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [aviatorGameId, setAviatorGameId] = useState(null);

  const categories = ['all', 'Crash', 'Classic', 'Instant', 'Cards'];

  const filteredGames = activeTab === 'all'
    ? games
    : games.filter(game => game.category.toLowerCase() === activeTab.toLowerCase());

  useEffect(() => {
    let interval;
    if (isPlaying && !crashed && !cashedOut && selectedGame?.type === 'aviator') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          const increase = Math.random() * 0.15 + 0.05;
          const newMultiplier = prev + increase;

          const crashPoint = 1.5 + Math.random() * 13.5;
          if (newMultiplier >= crashPoint) {
            setCrashed(true);
            setGameResult({
              won: false,
              multiplier: newMultiplier,
              amount: 0
            });
            clearInterval(interval);
            return newMultiplier;
          }

          return newMultiplier;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, crashed, cashedOut, selectedGame]);

  const startGame = async (gameType) => {
    if (gameType === 'aviator') {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const res = await api.post('/game/aviator/bet', { stake: parseFloat(betAmount) }, token);

        if (!res.ok) {
          const err = await res.json();
          showToast(err.message || 'Failed to place bet', 'error');
          return;
        }

        const data = await res.json();
        setAviatorGameId(data.gameId);

        // UI Updates
        setIsPlaying(true);
        setGameResult(null);
        setMultiplier(1.00);
        setCrashed(false);
        setCashedOut(false);
        setUser(prev => ({ ...prev, balance: prev.balance - parseFloat(betAmount) }));

      } catch (error) {
        console.error(error);
        showToast('Connection error', 'error');
      }
    } else {
      setIsPlaying(true);
      setGameResult(null);
      setUserChoice(null);
      setSystemChoice(null);
      setSpinning(false);
    }
  };

  const playDiceGame = async () => {
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/dice', { stake: parseFloat(betAmount) }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error playing dice', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      // Authorization sync: Update user with ACTUAL server-side result and balance
      setTimeout(() => {
        setSystemChoice(data.result);
        setSpinning(false);

        if (data.won) {
          showToast(`You won ${user.currency}${data.payout}!`, 'success');
        }

        // Authoritative sync
        fetchUserData();
      }, 1000);

    } catch (e) {
      console.error(e);
      showToast('Connection failed', 'error');
      setSpinning(false);
    }
  };

  const playCoinGame = async (choice) => {
    setUserChoice(choice);
    setSpinning(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/coin', { stake: parseFloat(betAmount), choice }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error playing coin toss', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setSystemChoice(data.result);
        setSpinning(false);

        setGameResult({
          won: data.won,
          userChoice: choice,
          systemChoice: data.result,
          amount: data.payout
        });

        if (data.won) {
          showToast(`Jackpot! You won ${user.currency}${data.payout}!`, 'success');
        }

        // Authoritative sync
        fetchUserData();
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast('Connection failed', 'error');
      setSpinning(false);
    }
  };

  const playNumberGame = async (guess) => {
    setUserChoice(guess);
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/number', { stake: parseFloat(betAmount), guess }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error playing number rush', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setSystemChoice(data.result);
        setSpinning(false);

        setGameResult({
          won: data.won,
          userChoice: guess,
          systemChoice: data.result,
          amount: data.payout
        });

        if (data.won) showToast('Lucky guess!', 'success');
        fetchUserData();
      }, 1500);

    } catch (error) {
      console.error(error);
      showToast('Connection error', 'error');
      setSpinning(false);
    }
  };

  const playWheelGame = async (color) => {
    setUserChoice(color);
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/wheel', { stake: parseFloat(betAmount), choice: color }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error spinning wheel', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setSystemChoice(data.result);
        setSpinning(false);

        setGameResult({
          won: data.won,
          userChoice: color,
          systemChoice: data.result,
          amount: data.payout
        });

        if (data.won) showToast('Wheel jackpot!', 'success');
        fetchUserData();
      }, 2000);

    } catch (error) {
      console.error(error);
      showToast('Connection error', 'error');
      setSpinning(false);
    }
  };

  const playCardGame = async () => {
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/card', { stake: parseFloat(betAmount) }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error flipping card', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setUserChoice(data.userCard);
        setSystemChoice(data.systemCard);
        setSpinning(false);

        setGameResult({
          won: data.won,
          userCard: data.userCard,
          systemCard: data.systemCard,
          amount: data.payout
        });

        if (data.won) showToast('High card win!', 'success');
        fetchUserData();
      }, 1500);

    } catch (error) {
      console.error(error);
      showToast('Connection error', 'error');
      setSpinning(false);
    }
  };

  const playColorGame = async () => {
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/color', { stake: parseFloat(betAmount) }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error matching colors', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setSystemChoice(data.colors);
        setSpinning(false);

        setGameResult({
          won: data.won,
          colors: data.colors,
          amount: data.payout
        });

        if (data.won) showToast('Triple match!', 'success');
        fetchUserData();
      }, 1500);

    } catch (error) {
      console.error(error);
      showToast('Connection error', 'error');
      setSpinning(false);
    }
  };

  const playPoolGame = async () => {
    setSpinning(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await api.post('/game/play/pool', { stake: parseFloat(betAmount) }, token);

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || 'Error potting balls', 'error');
        setSpinning(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        setUserChoice(data.userBalls);
        setSystemChoice(data.opponentBalls);
        setSpinning(false);

        setGameResult({
          won: data.won,
          userBalls: data.userBalls,
          opponentBalls: data.opponentBalls,
          amount: data.payout
        });

        if (data.won) showToast('Pool shark win!', 'success');
        fetchUserData();
      }, 2000);

    } catch (error) {
      console.error(error);
      showToast('Connection error', 'error');
      setSpinning(false);
    }
  };

  const cashOut = async () => {
    if (!crashed && isPlaying && aviatorGameId) {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const res = await api.post('/game/aviator/cashout', {
          gameId: aviatorGameId,
          multiplier: multiplier
        }, token);

        const data = await res.json();

        if (data.won) {
          setCashedOut(true);
          setGameResult({ won: true, multiplier, amount: data.payout });
          setUser(prev => ({ ...prev, balance: prev.balance + data.payout })); // Re-add stake is handled in payout logic? Backend just sent net payout or total?
          // Backend "payout" for win includes stake + profit.
          // Backend "lock" took stake.
          // So pure addition of payout to balance is correct here if local balance was deducted at start.
        } else {
          // Late cashout, server said we crashed
          setCrashed(true);
          setGameResult({ won: false, multiplier, amount: 0 });
          // Balance already deducted at start
        }

        setTimeout(() => {
          setIsPlaying(false);
          setAviatorGameId(null);
        }, 2000);

      } catch (error) {
        console.error(error);
        showToast('Failed to cash out', 'error');
      }
    }
  };

  useEffect(() => {
    if (crashed && isPlaying) {
      setUser(prev => ({ ...prev, balance: prev.balance - parseFloat(betAmount) }));
      setTimeout(() => {
        setIsPlaying(false);
      }, 500);
    }
  }, [crashed, isPlaying, betAmount]);

  const GameCard = ({ game }) => {
    return (
      <button
        onClick={() => setSelectedGame(game)}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-900/50 active:scale-95"
      >
        <div className="relative h-32 overflow-hidden">
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
          <div className={'absolute inset-0 bg-gradient-to-t ' + game.color + ' opacity-60'}></div>
          {game.category === 'Crash' && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              LIVE
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-bold text-white mb-2 text-sm">{game.name}</h3>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 text-gray-400">
              <Users className="w-3 h-3" />
              <span>{game.players.toLocaleString()}</span>
            </div>
            <div className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
              {game.winRate}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg px-2 py-1 text-xs">
            <span className="text-gray-400">Min: </span>
            <span className="text-green-400 font-bold">{user.currency}{game.minBet}</span>
          </div>
        </div>
      </button>
    );
  };

  const renderGameInterface = () => {
    if (!selectedGame) return null;

    const canPlay = betAmount &&
      !isNaN(parseFloat(betAmount)) &&
      parseFloat(betAmount) >= selectedGame.minBet &&
      parseFloat(betAmount) <= selectedGame.maxBet &&
      parseFloat(betAmount) <= user.balance;

    switch (selectedGame.type) {
      case 'aviator':
        return (
          <div className="space-y-4">
            <div className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-8 h-96 overflow-hidden border-2 border-blue-600">
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      animationDelay: Math.random() * 2 + 's'
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center mb-8">
                <div className={crashed ? 'text-6xl font-bold text-red-500' : cashedOut ? 'text-6xl font-bold text-green-400' : 'text-6xl font-bold text-white'}>
                  {multiplier.toFixed(2)}x
                </div>
                {crashed && <div className="text-red-500 text-xl font-bold mt-2">CRASHED!</div>}
                {cashedOut && <div className="text-green-400 text-xl font-bold mt-2">CASHED OUT!</div>}
              </div>

              {isPlaying && !crashed && (
                <div className="absolute bottom-8 left-8" style={{ animation: 'fly-plane 3s linear infinite' }}>
                  <Plane className="w-16 h-16 text-yellow-400 transform rotate-45" />
                </div>
              )}
              {crashed && <div className="absolute bottom-8 left-8 text-6xl animate-bounce">💥</div>}
            </div>

            {!isPlaying ? (
              <div className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700">
                <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">{user.currency}</span>
                  <input
                    type="number"
                    min={selectedGame.minBet}
                    max={selectedGame.maxBet}
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[10, 50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => setBetAmount(amt.toString())} className="bg-gray-700 hover:bg-gray-600 rounded-lg py-2 text-sm font-bold">{amt}</button>
                  ))}
                </div>
                <button
                  onClick={() => startGame('aviator')}
                  disabled={!canPlay}
                  className={canPlay ? 'w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'w-full py-5 rounded-xl font-bold text-lg bg-gray-700 cursor-not-allowed'}
                >
                  {!betAmount ? 'Enter Bet' : parseFloat(betAmount) < selectedGame.minBet ? 'Min: ' + user.currency + selectedGame.minBet : 'Start Flight'}
                </button>
              </div>
            ) : (
              <button
                onClick={cashOut}
                disabled={crashed || cashedOut}
                className={crashed || cashedOut ? 'w-full py-6 rounded-xl font-bold text-xl bg-gray-700' : 'w-full py-6 rounded-xl font-bold text-xl bg-gradient-to-r from-yellow-600 to-orange-600 animate-pulse'}
              >
                {crashed ? 'Lost ' + user.currency + betAmount : cashedOut ? 'Won ' + user.currency + gameResult?.amount.toFixed(2) : 'Cash Out ' + user.currency + (parseFloat(betAmount) * multiplier).toFixed(2)}
              </button>
            )}

            {gameResult && (
              <div className={gameResult.won ? 'bg-green-900/50 border-2 border-green-500 rounded-xl p-4 text-center' : 'bg-red-900/50 border-2 border-red-500 rounded-xl p-4 text-center'}>
                <div className="text-2xl font-bold mb-2">{gameResult.won ? '🎉 YOU WON!' : '💔 YOU LOST!'}</div>
                <div className="text-xl">{gameResult.won ? '+' + user.currency + gameResult.amount.toFixed(2) : '-' + user.currency + betAmount}</div>
              </div>
            )}
          </div>
        );

      case 'dice':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 border-2 border-red-600">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Your Roll</div>
                  <div className="text-6xl font-bold">{spinning ? '🎲' : userChoice || '?'}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Opponent</div>
                  <div className="text-6xl font-bold">{spinning ? '🎲' : systemChoice || '?'}</div>
                </div>
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 YOU WON! +' + user.currency + gameResult.amount.toFixed(2) : '💔 YOU LOST! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <button
                  onClick={playDiceGame}
                  disabled={!canPlay}
                  className={canPlay ? 'w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'w-full py-5 rounded-xl font-bold text-lg bg-gray-700'}
                >
                  Roll Dice
                </button>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'coin':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-2xl p-8 border-2 border-amber-600">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{spinning ? '🪙' : systemChoice ? (systemChoice === 'heads' ? '👑' : '🦅') : '🪙'}</div>
                <div className="text-2xl font-bold">{spinning ? 'Flipping...' : systemChoice || 'Choose Heads or Tails'}</div>
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 YOU WON! +' + user.currency + gameResult.amount.toFixed(2) : '💔 YOU LOST! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => playCoinGame('heads')}
                    disabled={!canPlay}
                    className={canPlay ? 'py-6 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'py-6 rounded-xl font-bold text-lg bg-gray-700'}
                  >
                    👑 Heads
                  </button>
                  <button
                    onClick={() => playCoinGame('tails')}
                    disabled={!canPlay}
                    className={canPlay ? 'py-6 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700' : 'py-6 rounded-xl font-bold text-lg bg-gray-700'}
                  >
                    🦅 Tails
                  </button>
                </div>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 border-2 border-indigo-600">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-4">{spinning ? '🎰' : systemChoice || '?'}</div>
                <div className="text-xl">{spinning ? 'Generating...' : systemChoice ? 'Winning Number: ' + systemChoice : 'Pick a number 1-10'}</div>
                {userChoice && <div className="text-lg text-gray-300 mt-2">Your guess: {userChoice}</div>}
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 PERFECT! +' + user.currency + gameResult.amount.toFixed(2) : '💔 Wrong! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => playNumberGame(num)}
                      disabled={!canPlay}
                      className={canPlay ? 'py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'py-4 rounded-xl font-bold text-lg bg-gray-700'}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'wheel':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-2xl p-8 border-2 border-yellow-600">
              <div className="text-center mb-6">
                <div className={spinning ? 'text-6xl mb-4 animate-spin' : 'text-6xl mb-4'}>
                  {systemChoice === 'red' ? '🔴' : systemChoice === 'blue' ? '🔵' : systemChoice === 'green' ? '🟢' : systemChoice === 'yellow' ? '🟡' : '🎡'}
                </div>
                <div className="text-xl">{spinning ? 'Spinning...' : systemChoice ? 'Landed on: ' + systemChoice : 'Pick a color'}</div>
                {userChoice && <div className="text-lg text-gray-300 mt-2">Your choice: {userChoice}</div>}
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 MATCH! +' + user.currency + gameResult.amount.toFixed(2) : '💔 No Match! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <div className="grid grid-cols-2 gap-3">
                  {[{ c: 'red', e: '🔴' }, { c: 'blue', e: '🔵' }, { c: 'green', e: '🟢' }, { c: 'yellow', e: '🟡' }].map(col => (
                    <button
                      key={col.c}
                      onClick={() => playWheelGame(col.c)}
                      disabled={!canPlay}
                      className={canPlay ? 'py-6 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'py-6 rounded-xl font-bold text-lg bg-gray-700'}
                    >
                      {col.e} {col.c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 border-2 border-green-600">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Your Card</div>
                  <div className="text-6xl font-bold">{spinning ? '🃏' : userChoice || '?'}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Dealer Card</div>
                  <div className="text-6xl font-bold">{spinning ? '🃏' : systemChoice || '?'}</div>
                </div>
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 Higher Card! +' + user.currency + gameResult.amount.toFixed(2) : '💔 Lower Card! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <button
                  onClick={playCardGame}
                  disabled={!canPlay}
                  className={canPlay ? 'w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'w-full py-5 rounded-xl font-bold text-lg bg-gray-700'}
                >
                  🃏 Draw Cards
                </button>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-pink-900 to-pink-800 rounded-2xl p-8 border-2 border-pink-600">
              <div className="text-center mb-6">
                <div className="flex justify-center gap-3 mb-4">
                  {spinning ? (
                    <>
                      <div className="w-20 h-20 bg-gray-600 rounded-xl animate-pulse"></div>
                      <div className="w-20 h-20 bg-gray-600 rounded-xl animate-pulse"></div>
                      <div className="w-20 h-20 bg-gray-600 rounded-xl animate-pulse"></div>
                    </>
                  ) : systemChoice ? (
                    systemChoice.map((c, i) => (
                      <div key={i} className={'w-20 h-20 rounded-xl ' + (c === 'red' ? 'bg-red-600' : c === 'blue' ? 'bg-blue-600' : 'bg-green-600')}></div>
                    ))
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-700 rounded-xl"></div>
                      <div className="w-20 h-20 bg-gray-700 rounded-xl"></div>
                      <div className="w-20 h-20 bg-gray-700 rounded-xl"></div>
                    </>
                  )}
                </div>
                <div className="text-xl">{spinning ? 'Matching...' : systemChoice ? 'Result!' : 'Match 3 colors to win!'}</div>
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 3 MATCH! +' + user.currency + gameResult.amount.toFixed(2) : '💔 No Match! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <button
                  onClick={playColorGame}
                  disabled={!canPlay}
                  className={canPlay ? 'w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'w-full py-5 rounded-xl font-bold text-lg bg-gray-700'}
                >
                  🎨 Match Colors
                </button>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      case 'pool':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 border-2 border-blue-600">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Your Balls</div>
                  <div className="text-6xl font-bold">{spinning ? '🎱' : userChoice ? userChoice + '🎱' : '?'}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">Opponent</div>
                  <div className="text-6xl font-bold">{spinning ? '🎱' : systemChoice ? systemChoice + '🎱' : '?'}</div>
                </div>
              </div>
              {gameResult && (
                <div className={gameResult.won ? 'bg-green-600 rounded-xl p-4 text-center text-xl font-bold' : 'bg-red-600 rounded-xl p-4 text-center text-xl font-bold'}>
                  {gameResult.won ? '🎉 More Balls! +' + user.currency + gameResult.amount.toFixed(2) : '💔 Less Balls! -' + user.currency + betAmount}
                </div>
              )}
            </div>

            {!isPlaying && !gameResult && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <input
                  type="number"
                  min={selectedGame.minBet}
                  max={selectedGame.maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-xl font-bold text-white focus:border-green-500 focus:outline-none mb-4"
                />
                <button
                  onClick={playPoolGame}
                  disabled={!canPlay}
                  className={canPlay ? 'w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700' : 'w-full py-5 rounded-xl font-bold text-lg bg-gray-700'}
                >
                  🎱 Play Pool
                </button>
              </div>
            )}

            {gameResult && (
              <button onClick={() => { setGameResult(null); setUserChoice(null); setSystemChoice(null); }} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                Play Again
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Games..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Unified Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <div className="text-[10px] text-green-100 uppercase tracking-wider font-bold opacity-80">Player</div>
                <div className="text-sm font-bold truncate max-w-[100px]">{user.username}</div>
              </div>

              <div className="h-8 w-[1px] bg-white/20 hidden sm:block" />

              <div>
                <div className="text-[10px] text-green-100 uppercase tracking-wider font-bold opacity-80">Available Balance</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                    {user.currency}{(user.balance || 0).toFixed(2)}
                  </div>
                  <button
                    onClick={fetchUserData}
                    className="p-1 hover:bg-white/20 rounded-full transition-all active:scale-95"
                    title="Sync Balance"
                  >
                    <div className="w-4 h-4 flex items-center justify-center text-white font-bold opacity-80">↻</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowDepositModal(true)}
                className="bg-white text-green-700 px-4 sm:px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition-all transform active:scale-95 flex items-center gap-2 shadow-md text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span>Deposit</span>
              </button>

              <div className="flex gap-1 sm:gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <History className="w-5 h-5 text-white/90" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-white/90" />
                </button>
              </div>
            </div>
          </div>

          {/* Locked Balance Sub-bar - Only shows if funds are locked */}
          {(user.lockedBalance || 0) > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-white/80">
                <Lock className="w-3 h-3 text-yellow-300" />
                <span>Locked in Games</span>
              </div>
              <span className="font-bold text-yellow-300">{user.currency}{(user.lockedBalance || 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {!selectedGame && (
        <>
          {/* Stats Section - below sticky header */}
          <div className="p-4 pt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <div className="text-xs text-gray-400">Total Wins</div>
                <div className="font-bold text-lg">{user.totalWins}</div>
              </div>
              <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
                <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <div className="text-xs text-gray-400">Games Played</div>
                <div className="font-bold text-lg">{user.totalGames}</div>
              </div>
              <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <div className="text-xs text-gray-400">Win Rate</div>
                <div className="font-bold text-lg">{user.totalGames > 0 ? Math.round((user.totalWins / user.totalGames) * 100) : 0}%</div>
              </div>
            </div>

            {/* Category Filters - NOT sticky anymore */}
            <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={activeTab === cat ? 'px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/50' : 'px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Games</h2>
              <span className="text-gray-400 text-sm">{filteredGames.length} games</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-700 text-white">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6 outline-none" />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Wallet className="w-6 h-6 text-green-500" />
              Deposit Funds
            </h3>

            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Amount (GH₵)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">GH₵</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Min 10.00"
                    min="10"
                    step="0.01"
                    required
                    className="w-full pl-14 pr-4 py-4 rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-bold text-white placeholder-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum deposit: 10.00 GH₵</p>
              </div>

              <button
                type="submit"
                disabled={depositLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {depositLoading ? <LoadingSpinner size="sm" color="white" /> : 'Pay Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 pb-32">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setIsPlaying(false);
                  setBetAmount('');
                  setGameResult(null);
                  setUserChoice(null);
                  setSystemChoice(null);
                  setMultiplier(1.00);
                  setCrashed(false);
                  setCashedOut(false);
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-400">Balance</div>
                <div className="text-lg font-bold text-green-400">{user.currency}{(user.balance || 0).toFixed(2)}</div>
                <button
                  onClick={fetchUserData}
                  className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
                >
                  Sync
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedGame.name}</h2>
              <p className="text-gray-400">{selectedGame.description}</p>
            </div>

            {renderGameInterface()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fly-plane {
          0% { transform: translate(0, 0) rotate(45deg); }
          100% { transform: translate(300px, -300px) rotate(45deg); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Zap,
  Target,
  Trophy,
  Users,
  Shield,
  Search,
  Timer,
  ArrowLeft,
  CircleDot,
  Dna,
  Cpu
} from 'lucide-react';

const QuickMatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [searchPhase, setSearchPhase] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [foundTriggered, setFoundTriggered] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') || 'turn';
  const stake = parseFloat(queryParams.get('stake')) || 10;

  const matchedRef = useRef(false);

  const searchMessages = [
    "SCANNING GLOBAL LOBBY...",
    "CALIBRATING SKILL BRACKETS...",
    "MATCHING WITH ACTIVE PROS...",
    "HANDSHAKING ENCRYPTION...",
    "LOCKING STAKES IN ESCROW...",
    "POOL TABLE DETECTED...",
    "READYING CUE STICKS...",
  ];

  useEffect(() => {
    const initMatchmaking = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [profRes, balRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/auth/profile`, { headers }),
          fetch(`${apiUrl}/wallet/balance`, { headers }),
          fetch(`${apiUrl}/game/stats`, { headers })
        ]);

        if (!profRes.ok || !balRes.ok) throw new Error('Auth failed');

        const profile = await profRes.json();
        const balance = await balRes.json();
        const stats = await statsRes.json();

        if (balance.available < stake) {
          showToast(`Insufficient balance! Need GHC ${stake.toLocaleString()}`, 'error');
          navigate('/dashboard');
          return;
        }

        const user = {
          id: profile.id,
          username: profile.name || profile.email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff`,
          wins: stats.wins || 0,
          rank: stats.level || 'Rookie'
        };
        setUserData(user);

        connectSocket(profile.id);

        // DELAYED JOIN: Prove we are "searching"
        setTimeout(() => {
          socket.emit('joinQueue', { userId: profile.id, stake, mode });
        }, 1000);

      } catch (err) {
        showToast('System Error: Matchmaking offline', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initMatchmaking();

    socket.on('matchFound', (data) => {
      if (matchedRef.current) return;
      matchedRef.current = true;

      setMatchData(data);
      // Artificial delay of 3-5 seconds as requested to prove "live" status
      const fakeSearchDelay = 3000 + Math.random() * 2000;

      setTimeout(() => {
        setOpponent({
          name: `Pro_${data.opponentId.slice(0, 4)}`,
          avatar: `https://i.pravatar.cc/100?u=${data.opponentId}`,
          rank: "Pool Elite",
          winRate: "68%"
        });
        setFoundTriggered(true);

        // Auto-redirect to game after 3s exposure of opponent
        setTimeout(() => {
          const path = data.mode === 'speed'
            ? `/speed-mode/arena/${data.gameId}`
            : `/turn-mode/${data.gameId}`;
          navigate(path);
        }, 3500);
      }, fakeSearchDelay);
    });

    const timer = setInterval(() => setWaitingTime(p => p + 1), 1000);
    const phaseTimer = setInterval(() => setSearchPhase(p => (p + 1) % searchMessages.length), 2000);

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
      socket.off('matchFound');
      if (!matchedRef.current && userData?.id) {
        socket.emit('leaveQueue', { userId: userData.id });
      }
    };
  }, [navigate, stake, mode]);

  if (loading || !userData) return <LoadingSpinner text="Connecting to Matchmaker..." />;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest mb-4"
          >
            <Timer size={14} className="animate-pulse" />
            <span>Waiting Time: {formatTime(waitingTime)}</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            {foundTriggered ? "Opponent Found" : "Searching Arena"}
          </h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-[0.2em] h-6">
            {foundTriggered ? "READY FOR COMBAT" : searchMessages[searchPhase]}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative lg:px-20">

          {/* PLAYER 1 */}
          <motion.div
            animate={{ x: foundTriggered ? 0 : 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className={`relative p-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl`}>
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-black">
                <img src={userData.avatar} alt="Me" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 right-4 bg-blue-500 p-2 rounded-xl border-2 border-black">
                <Trophy size={18} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{userData.username}</h2>
              <p className="text-blue-400 font-bold text-xs uppercase mt-1 tracking-widest">{userData.rank}</p>
            </div>
          </motion.div>

          {/* VS CIRCLE */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-gray-700/50 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-black font-black text-2xl italic border-4 ${foundTriggered ? 'border-blue-500' : 'border-gray-800'}`}>
                VS
              </div>
            </div>

            {/* Glowing Lines */}
            <AnimatePresence>
              {!foundTriggered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-40 h-40 border-2 border-blue-500/20 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>

          {/* PLAYER 2 / SEARCHING */}
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {foundTriggered ? (
                <motion.div
                  key="opponent"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className={`relative p-1 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl`}>
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-black">
                      <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 right-4 bg-orange-500 p-2 rounded-xl border-2 border-black">
                      <Shield size={18} />
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{opponent.name}</h2>
                    <p className="text-red-400 font-bold text-xs uppercase mt-1 tracking-widest">{opponent.rank}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="searching"
                  className="flex flex-col items-center gap-6"
                >
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-slate-900 border-4 border-dashed border-gray-700 flex items-center justify-center relative shadow-inner shadow-black overflow-hidden group">
                    <Search className="text-gray-600 animate-pulse" size={48} />
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/0"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-700 uppercase tracking-tighter">FINDING...</h2>
                    <p className="text-blue-500/30 font-bold text-xs mt-1 uppercase tracking-widest">Global Scan</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stake Board */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-16 bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 max-w-lg mx-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <CircleDot size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Tournament Stake</p>
              <p className="text-3xl font-black tracking-tight flex items-center gap-1">
                <span className="text-blue-500">GHGHC </span>
                <span>{stake.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Prize Pool</p>
            <p className="text-3xl font-black text-emerald-400">GHGHC  {(stake * 2 * 0.9).toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Action Controls */}
        {!foundTriggered && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all font-bold flex items-center gap-2 mx-auto border border-white/10"
            >
              <ArrowLeft size={16} />
              <span>CANCEL SEARCH</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuickMatch;
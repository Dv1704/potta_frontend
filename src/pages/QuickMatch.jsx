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
          showToast(`Insufficient funds! Need ${stake} GH₵.`, 'error');
          navigate('/dashboard');
          return;
        }

        const user = {
          id: profile.id,
          username: profile.name || profile.email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${profile.name}&background=random&color=fff`,
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

  return (
    <div className="min-h-screen bg-[#052e16] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.pattern')]"></div>
      </div>

      <AnimatePresence mode="wait">
        {!foundTriggered ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-xl text-center space-y-12 z-10"
          >
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 rounded-full text-emerald-400 text-xs font-black tracking-widest uppercase"
              >
                System Authority: Online
              </motion.div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">
                Finding <span className="text-emerald-500">Opponent</span>
              </h1>
              <p className="text-gray-400 font-mono text-sm tracking-tight">
                MODE: {mode.toUpperCase()} arena // STAKE: {stake} GH₵
              </p>
            </div>

            {/* Radar Animation */}
            <div className="relative w-80 h-80 mx-auto">
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-[ping_3s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border border-emerald-500/20 animate-[ping_3s_linear_infinite_0.5s]"></div>
              <div className="absolute inset-8 rounded-full border border-emerald-500/30 animate-[ping_3s_linear_infinite_1s]"></div>

              {/* Rotating Hub */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="w-1.5 h-full bg-gradient-to-t from-emerald-500 via-transparent to-transparent opacity-50"></div>
              </motion.div>

              {/* Central Point */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="bg-emerald-500 p-6 rounded-full shadow-2xl shadow-emerald-500/50"
                  >
                    <CircleDot size={40} className="text-black" />
                  </motion.div>

                  {/* Orbiting Avatars (Fake Players) */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full border-2 border-emerald-400/50 overflow-hidden"
                      initial={{ rotate: i * 90 }}
                      animate={{ rotate: i * 90 + 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: '0 120px' }}
                    >
                      <img src={`https://i.pravatar.cc/50?u=${i}`} alt="" className="w-full h-full object-cover grayscale" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-6">
              <motion.div
                key={searchPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 font-mono text-xl font-black"
              >
                {searchMessages[searchPhase]}
              </motion.div>

              <div className="flex items-center justify-center gap-6">
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Searching</p>
                  <p className="text-2xl font-black">{waitingTime}s</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Wait</p>
                  <p className="text-2xl font-black text-emerald-500">~14s</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 mx-auto text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="font-bold text-xs uppercase tracking-widest">Abort Matchmaking</span>
            </button>

          </motion.div>
        ) : (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 items-center gap-8 relative z-10"
          >
            {/* Player 1 */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border-2 border-emerald-500/20 text-center"
            >
              <div className="relative inline-block mb-4">
                <img src={userData.avatar} className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">YOU</div>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{userData.username}</h3>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Rank: {userData.rank}</p>
              <div className="flex gap-2 justify-center">
                <div className="bg-emerald-900/40 px-3 py-1 rounded-lg text-xs font-bold">{userData.wins} Wins</div>
              </div>
            </motion.div>

            {/* VS CENTER */}
            <div className="text-center relative py-12 md:py-0">
              <motion.div
                animate={{ scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] }}
                className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 select-none"
              >
                VS
              </motion.div>
              <div className="mt-8 space-y-2">
                <div className="bg-yellow-500 text-black font-black px-6 py-2 rounded-xl text-xl inline-block shadow-lg shadow-yellow-500/50">
                  {stake} GH₵ POT
                </div>
              </div>
            </div>

            {/* Opponent */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border-2 border-red-500/20 text-center"
            >
              <div className="relative inline-block mb-4">
                <img src={opponent.avatar} className="w-32 h-32 rounded-full border-4 border-red-500 shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">LIVE</div>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{opponent.name}</h3>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4">{opponent.rank}</p>
              <div className="flex gap-2 justify-center">
                <div className="bg-red-950/40 px-3 py-1 rounded-lg text-xs font-bold text-red-500">{opponent.winRate} Win Rate</div>
              </div>
            </motion.div>

            {/* Bottom Status */}
            <div className="col-span-1 md:col-span-3 text-center pt-8">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex gap-2">
                  <Shield className="text-emerald-500" />
                  <span className="text-sm font-black uppercase tracking-widest italic">Server Authoritative Syncing...</span>
                </div>
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.5 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickMatch;
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Copy, Check, ArrowLeft, Zap, Target, Link2, Search, ChevronRight } from 'lucide-react';

const MODES = [
  { id: 'turn', label: 'Turn Masters', sub: 'Classic 8-ball', icon: Target, color: 'blue' },
  { id: 'speed', label: 'Speed Arena', sub: '60-second rush', icon: Zap, color: 'amber' },
];

const QUICK_STAKES = [10, 20, 50, 100];

const FriendMatch = () => {
  const navigate = useNavigate();
  // /join/:code puts code in URL — if present we start on join tab with code pre-filled
  const { code: urlCode } = useParams();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);

  // tabs: 'create' | 'join'
  const [tab, setTab] = useState(urlCode ? 'join' : 'create');

  // Create tab state
  const [mode, setMode] = useState('turn');
  const [stake, setStake] = useState('10');
  const [roomCode, setRoomCode] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [waitingForFriend, setWaitingForFriend] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Join tab state
  const [joinCode, setJoinCode] = useState(urlCode || '');
  const [roomInfo, setRoomInfo] = useState(null); // { mode, stake, creatorName }
  const [lookingUp, setLookingUp] = useState(false);

  const matchedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const headers = { Authorization: `Bearer ${token}` };
        const [profRes, balRes] = await Promise.all([
          fetch(`${apiUrl}/auth/profile`, { headers }),
          fetch(`${apiUrl}/wallet/balance`, { headers }),
        ]);
        if (!profRes.ok) throw new Error('Auth failed');
        const profile = await profRes.json();
        const bal = await balRes.json();
        setUserId(profile.id);
        setBalance(bal.available ?? 0);
        connectSocket(profile.id);

        // If arrived via link, auto-lookup the room
        if (urlCode) {
          socket.once('connect', () => socket.emit('lookupRoom', { code: urlCode }));
          if (socket.connected) socket.emit('lookupRoom', { code: urlCode });
        }
      } catch {
        showToast('Authentication failed', 'error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    init();

    socket.on('roomCreated', (data) => {
      setRoomCode(data.code);
      setRoomLink(`${window.location.origin}/join/${data.code}`);
      setWaitingForFriend(true);
    });

    socket.on('roomLookup', (data) => {
      setLookingUp(false);
      if (!data.found) {
        showToast('Room not found. Check the code and try again.', 'error');
        setRoomInfo(null);
      } else {
        setRoomInfo(data);
      }
    });

    socket.on('matchFound', (data) => {
      if (matchedRef.current) return;
      matchedRef.current = true;
      showToast('Friend joined! Starting game...', 'success');
      setTimeout(() => {
        const path = data.mode === 'speed'
          ? `/speed-mode/arena/${data.gameId}`
          : `/turn-mode/${data.gameId}`;
        navigate(path);
      }, 1500);
    });

    socket.on('error', (data) => {
      showToast(data.message || 'Something went wrong', 'error');
      setWaitingForFriend(false);
      setRoomCode('');
      setRoomLink('');
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomLookup');
      socket.off('matchFound');
      socket.off('error');
    };
  }, [navigate, showToast, urlCode]);

  const handleCreateRoom = () => {
    const stakeNum = parseFloat(stake) || 0;
    if (stakeNum > 0 && stakeNum < 10) {
      showToast('Minimum stake is GH₵10', 'error');
      return;
    }
    if (stakeNum > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }
    socket.emit('createPrivateRoom', { mode, stake: stakeNum });
  };

  const handleLookupRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { showToast('Enter a valid room code', 'error'); return; }
    setLookingUp(true);
    setRoomInfo(null);
    socket.emit('lookupRoom', { code });
  };

  const handleJoinRoom = () => {
    if (!roomInfo) return;
    if (roomInfo.stake > balance) {
      showToast(`Insufficient balance. Need GH₵${roomInfo.stake}`, 'error');
      return;
    }
    socket.emit('joinPrivateRoom', { code: roomInfo.code });
  };

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  const cancelRoom = () => {
    setWaitingForFriend(false);
    setRoomCode('');
    setRoomLink('');
    matchedRef.current = false;
  };

  const resetJoin = () => {
    setRoomInfo(null);
    setJoinCode('');
  };

  if (loading) return <LoadingSpinner text="Connecting..." />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Play with Friend</h1>
            <p className="text-gray-500 text-xs font-medium mt-0.5">Private invite — link or code</p>
          </div>
        </div>

        <div className="bg-[#0c111d] rounded-[2rem] border border-white/[0.06] shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {[{ id: 'create', label: 'Create Room' }, { id: 'join', label: 'Join Room' }].map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); cancelRoom(); resetJoin(); }}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${
                  tab === t.id ? 'text-white border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ---- CREATE: configure ---- */}
              {tab === 'create' && !waitingForFriend && (
                <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                  {/* Mode */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3">Game Mode</p>
                    <div className="grid grid-cols-2 gap-3">
                      {MODES.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setMode(m.id)}
                          className={`flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all ${
                            mode === m.id
                              ? m.color === 'blue'
                                ? 'border-blue-500 bg-blue-500/10 text-white'
                                : 'border-amber-500 bg-amber-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          <m.icon size={18} />
                          <span className="text-xs font-black uppercase tracking-wide leading-none">{m.label}</span>
                          <span className="text-[9px] text-gray-500 font-medium">{m.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stake */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3">Entry Stake (GH₵)</p>
                    <div className="flex gap-2 mb-3">
                      {QUICK_STAKES.map(s => (
                        <button
                          key={s}
                          onClick={() => setStake(s.toString())}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${
                            stake === s.toString()
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="10"
                      value={stake}
                      onChange={e => setStake(e.target.value)}
                      placeholder="Custom amount (min 10)"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-bold text-sm outline-none focus:border-blue-500 transition placeholder-gray-700"
                    />
                    <p className="text-[10px] text-gray-600 mt-1.5 font-medium">Balance: GH₵{balance.toLocaleString()} · Each player pays GH₵{parseFloat(stake) || 0}</p>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm uppercase italic tracking-wider flex items-center justify-center gap-2"
                  >
                    <Link2 size={15} />
                    Create Private Room
                  </button>
                </motion.div>
              )}

              {/* ---- CREATE: waiting with code + link ---- */}
              {tab === 'create' && waitingForFriend && (
                <motion.div key="waiting" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-5">

                  <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Users size={24} className="text-blue-400 animate-pulse" />
                  </div>

                  <div className="w-full space-y-3">
                    <p className="text-gray-400 text-sm font-medium">Share the code or link with your friend</p>

                    {/* Code row */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5">
                      <div className="text-left">
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Room Code</p>
                        <p className="text-3xl font-black tracking-[0.25em] text-white">{roomCode}</p>
                      </div>
                      <button
                        onClick={() => copyText(roomCode, setCopiedCode)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-gray-400"
                      >
                        {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copiedCode ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Link row */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5">
                      <div className="text-left min-w-0 flex-1 mr-3">
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Invite Link</p>
                        <p className="text-xs text-gray-400 truncate font-mono">{roomLink}</p>
                      </div>
                      <button
                        onClick={() => copyText(roomLink, setCopiedLink)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-gray-400"
                      >
                        {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Room details pill */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${
                        mode === 'speed' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {mode === 'speed' ? 'Speed Arena' : 'Turn Masters'}
                      </span>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border bg-white/5 border-white/10 text-gray-400">
                        GH₵{parseFloat(stake) || 0} stake
                      </span>
                    </div>
                  </div>

                  {/* Waiting dots */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-500"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold -mt-2">Waiting for friend...</p>

                  <button onClick={cancelRoom} className="text-gray-600 hover:text-gray-400 text-xs font-bold uppercase tracking-widest transition">
                    Cancel Room
                  </button>
                </motion.div>
              )}

              {/* ---- JOIN tab ---- */}
              {tab === 'join' && (
                <motion.div key="join" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                  {/* Code input */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3">Room Code</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={e => { setJoinCode(e.target.value.toUpperCase()); setRoomInfo(null); }}
                        maxLength={6}
                        placeholder="E.G. A1B2C3"
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-black text-xl tracking-[0.3em] text-center outline-none focus:border-blue-500 transition placeholder-gray-700 placeholder:text-base placeholder:tracking-normal placeholder:font-medium uppercase"
                      />
                      <button
                        onClick={handleLookupRoom}
                        disabled={lookingUp}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 font-bold text-sm transition disabled:opacity-50"
                      >
                        {lookingUp ? (
                          <motion.div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        ) : (
                          <Search size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Room info card */}
                  <AnimatePresence>
                    {roomInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Room Found</p>
                          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">● Live</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">Created by</span>
                            <span className="text-white font-black text-sm">{roomInfo.creatorName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">Mode</span>
                            <span className={`font-black text-sm ${roomInfo.mode === 'speed' ? 'text-amber-400' : 'text-blue-400'}`}>
                              {roomInfo.mode === 'speed' ? 'Speed Arena' : 'Turn Masters'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">Stake</span>
                            <span className="text-white font-black text-sm">
                              {roomInfo.stake > 0 ? `GH₵${roomInfo.stake}` : 'Free'}
                            </span>
                          </div>
                          {roomInfo.stake > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <span className="text-gray-500 text-sm font-medium">Your balance</span>
                              <span className={`font-black text-sm ${balance >= roomInfo.stake ? 'text-emerald-400' : 'text-red-400'}`}>
                                GH₵{balance.toLocaleString()} {balance < roomInfo.stake ? '(insufficient)' : '✓'}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleJoinRoom}
                          disabled={roomInfo.stake > balance}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl transition-all text-sm uppercase italic tracking-wider flex items-center justify-center gap-2"
                        >
                          {roomInfo.stake > 0 ? `Join & Pay GH₵${roomInfo.stake}` : 'Join Room'}
                          <ChevronRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!roomInfo && (
                    <p className="text-center text-gray-700 text-xs font-medium">
                      Enter the code your friend shared, then tap search
                    </p>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-gray-700 text-[10px] uppercase tracking-widest font-bold mt-6">
          Room codes expire after 15 minutes
        </p>
      </div>
    </div>
  );
};

export default FriendMatch;

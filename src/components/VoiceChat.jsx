import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { socket } from '../socket';

const VoiceChat = ({ gameId, userId, players }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [error, setError] = useState('');

  const isMutedRef = useRef(isMuted);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const opponentId = useMemo(() => {
    if (!players || !userId) return null;
    const found = players.find((p) => {
      const pid = typeof p === 'string' ? p : p.id;
      return pid && pid !== userId;
    });
    return found ? (typeof found === 'string' ? found : found.id) : null;
  }, [players, userId]);

  // Determine politeness for glare (collision) resolution
  const isPolite = useMemo(() => {
    return !!userId && !!opponentId && userId > opponentId;
  }, [userId, opponentId]);

  const cleanupVoice = () => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setRemoteConnected(false);
    setStatus('idle');
    setError('');
    pendingCandidatesRef.current = [];
  };

  const flushCandidates = async () => {
    if (!peerRef.current || !peerRef.current.remoteDescription) return;
    for (const c of pendingCandidatesRef.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.error('[VoiceChat] Error adding queued ICE candidate:', err);
      }
    }
    pendingCandidatesRef.current = [];
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voiceCandidate', {
          gameId,
          senderId: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        audioRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setStatus(state);
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        setRemoteConnected(false);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    }

    peerRef.current = pc;
    return pc;
  };

  const startVoice = async () => {
    if (!gameId || !userId || !opponentId) {
      setError('Unable to start voice chat until both players are present.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser does not support microphone access.');
      return;
    }

    try {
      setError('');
      setStatus('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMutedRef.current;
      });

      const pc = createPeerConnection();
      
      // Whoever clicks the button initiates the call
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('voiceOffer', {
        gameId,
        senderId: userId,
        offer: pc.localDescription,
      });

      setStatus('waiting');
    } catch (err) {
      console.error('[VoiceChat] Error starting voice:', err);
      setError('Microphone permission denied or unavailable.');
      cleanupVoice();
    }
  };

  const stopVoice = () => {
    socket.emit('voiceHangup', { gameId, senderId: userId });
    cleanupVoice();
    setIsActive(false);
  };

  const toggleVoice = async () => {
    if (isActive) {
      stopVoice();
      return;
    }
    setIsActive(true);
    await startVoice();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      isMutedRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const handleVoiceOffer = async (data) => {
    if (data.gameId !== gameId || data.senderId === userId) return;
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMutedRef.current;
        });
      } catch (err) {
        console.error('[VoiceChat] Error getting local audio for offer:', err);
        return;
      }
    }

    const pc = peerRef.current || createPeerConnection();
    
    // Glare (Collision) Resolution
    const isCollision = pc.signalingState !== 'stable' && pc.signalingState !== 'closed';
    if (isCollision && !isPolite) {
      console.log('[VoiceChat] Glare detected. Ignoring incoming offer.');
      return;
    }

    try {
      if (isCollision) {
        await pc.setLocalDescription({ type: 'rollback' });
      }
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      await flushCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('voiceAnswer', {
        gameId,
        senderId: userId,
        answer: pc.localDescription,
      });
      if (!isActive) setIsActive(true);
      setStatus('connecting');
    } catch (err) {
      console.error('[VoiceChat] Error handling offer:', err);
    }
  };

  const handleVoiceAnswer = async (data) => {
    if (data.gameId !== gameId || data.senderId === userId) return;
    if (!peerRef.current) return;
    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      await flushCandidates();
      setStatus('connecting');
    } catch (err) {
      console.error('[VoiceChat] Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (data) => {
    if (data.gameId !== gameId || data.senderId === userId) return;
    if (!data.candidate) return;

    if (!peerRef.current || !peerRef.current.remoteDescription) {
      pendingCandidatesRef.current.push(data.candidate);
      return;
    }

    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error('[VoiceChat] Error adding ICE candidate:', err);
    }
  };

  const handleVoiceHangup = (data) => {
    if (data.gameId !== gameId || data.senderId === userId) return;
    cleanupVoice();
  };

  useEffect(() => {
    socket.on('voiceOffer', handleVoiceOffer);
    socket.on('voiceAnswer', handleVoiceAnswer);
    socket.on('voiceCandidate', handleIceCandidate);
    socket.on('voiceHangup', handleVoiceHangup);

    return () => {
      socket.off('voiceOffer', handleVoiceOffer);
      socket.off('voiceAnswer', handleVoiceAnswer);
      socket.off('voiceCandidate', handleIceCandidate);
      socket.off('voiceHangup', handleVoiceHangup);
      cleanupVoice();
    };
  }, [gameId, userId, opponentId]);

  useEffect(() => {
    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.play().catch(() => {});
    }
  }, [remoteConnected]);

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={toggleVoice}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-white shadow-2xl transition-all ${isActive ? 'bg-emerald-500/90 border-emerald-300' : 'bg-slate-950/90 border-white/10 hover:bg-slate-900'} `}
        title={isActive ? 'Disable voice chat' : 'Enable voice chat'}
      >
        {isActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        {remoteConnected && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-slate-950">•</span>
        )}
      </button>

      {isActive && (
        <div className="w-[min(100vw-2rem,300px)] rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-3 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Voice Chat</p>
              <p className="text-sm font-semibold text-white">{remoteConnected ? 'Connected' : 'Connecting...'}</p>
            </div>
            <button
              onClick={toggleMute}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-100'}`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {error ? error : `Waiting for opponent audio...`}
          </div>
          <audio ref={audioRef} autoPlay muted={false} />
        </div>
      )}
    </div>
  );
};

export default VoiceChat;

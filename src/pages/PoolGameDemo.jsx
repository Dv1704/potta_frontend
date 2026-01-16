import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PoolTable from '../components/PoolTable';
import useSound from '../hooks/useSound';

const PoolGameDemo = () => {
    const [power, setPower] = useState(50);
    const [spin, setSpin] = useState({ x: 0, y: 0 });
    const [is3D, setIs3D] = useState(true);
    const [angle, setAngle] = useState(-15);
    const [shotCount, setShotCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const { play, SFX } = useSound();

    // Ball positions - stateful so they can be animated
    const [demoBalls, setDemoBalls] = useState({
        '0': { x: 18.6, y: 33.0, onTable: true },
        '1': { x: 47.7, y: 33.0, onTable: true },
        '2': { x: 49.5, y: 34.75, onTable: true },
        '3': { x: 49.5, y: 31.25, onTable: true },
        '4': { x: 51.3, y: 36.5, onTable: true },
        '8': { x: 51.3, y: 33.0, onTable: true },
        '6': { x: 51.3, y: 29.5, onTable: true },
        '7': { x: 53.1, y: 38.25, onTable: true },
        '5': { x: 53.1, y: 34.75, onTable: true },
        '9': { x: 53.1, y: 31.25, onTable: true },
        '10': { x: 53.1, y: 27.75, onTable: true },
        '11': { x: 54.9, y: 40.0, onTable: true },
        '12': { x: 54.9, y: 36.5, onTable: true },
        '13': { x: 54.9, y: 33.0, onTable: true },
        '14': { x: 54.9, y: 29.5, onTable: true },
        '15': { x: 54.9, y: 26.0, onTable: true },
    });

    const handleShoot = async () => {
        if (isAnimating) return;

        console.log(`DEMO SHOT: angle=${angle}°, power=${power}%`);
        play(SFX.STICK_SHOT, 1.0);
        setShotCount(prev => prev + 1);
        setIsAnimating(true);

        try {
            // Call backend physics engine!
            const response = await fetch('/api/game/demo-shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ angle, power, balls: demoBalls })
            });

            if (!response.ok) throw new Error('Backend shot failed');

            const data = await response.json();
            console.log(`[Backend] Received ${data.animationFrames?.length || 0} frames`);

            // Play animation frames from backend
            if (data.animationFrames && data.animationFrames.length > 0) {
                const frames = data.animationFrames;
                let frameIdx = 0;

                const playFrame = () => {
                    if (frameIdx >= frames.length) {
                        // Apply final state
                        if (data.finalBalls) {
                            setDemoBalls(data.finalBalls);
                        }
                        setIsAnimating(false);
                        console.log('[Animation] Complete');
                        return;
                    }

                    const frameBalls = frames[frameIdx];
                    setDemoBalls(prev => {
                        const next = { ...prev };
                        Object.entries(frameBalls).forEach(([num, pos]) => {
                            if (next[num]) {
                                next[num] = { ...next[num], x: pos.x, y: pos.y, onTable: true };
                            }
                        });
                        return next;
                    });

                    frameIdx++;
                    requestAnimationFrame(playFrame);
                };
                playFrame();
            } else {
                // No frames, just apply final state
                if (data.finalBalls) {
                    setDemoBalls(data.finalBalls);
                }
                setIsAnimating(false);
            }
        } catch (error) {
            console.error('Backend physics failed, using fallback:', error);
            // Fallback to simple frontend simulation
            fallbackAnimation();
        }
    };

    // Fallback frontend animation if backend fails
    const fallbackAnimation = () => {
        const radians = (angle * Math.PI) / 180;
        const initialSpeed = (power / 100) * 15;
        let currentSpeed = initialSpeed;
        const friction = 0.98;
        const minSpeed = 0.05;

        const animateMovement = () => {
            if (currentSpeed < minSpeed) {
                setIsAnimating(false);
                return;
            }

            setDemoBalls(prev => {
                const newBalls = { ...prev };
                const cueBall = newBalls['0'];
                if (cueBall && cueBall.onTable) {
                    cueBall.x = Math.max(3, Math.min(97, cueBall.x + Math.cos(radians) * currentSpeed));
                    cueBall.y = Math.max(3, Math.min(97, cueBall.y + Math.sin(radians) * currentSpeed));
                }
                return newBalls;
            });

            currentSpeed *= friction;
            requestAnimationFrame(animateMovement);
        };
        animateMovement();
    };

    return (
        <div className="relative w-full h-screen bg-[#121212] overflow-hidden flex flex-col font-sans select-none">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/assets/pool/bg_game.jpg')] bg-cover bg-center"></div>

            {/* Demo Banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 rounded-full border-2 border-white/20 shadow-lg pointer-events-none">
                <div className="text-white font-bold text-sm text-center flex items-center gap-2">
                    <span className="text-2xl">🎱</span>
                    <span>REAL PHYSICS DEMO - Backend Powered!</span>
                </div>
            </div>

            {/* HUD: Player 1 (Left) */}
            <div className="absolute top-4 left-4 z-50 flex flex-col items-center pointer-events-none">
                <div className="relative w-48 h-16">
                    <img src="/assets/pool/player_gui.png" alt="Player 1" className="w-full h-full object-contain drop-shadow-lg" />
                    <div className="absolute top-2 left-14 w-32 h-6 flex items-center mb-1">
                        <span className="text-white font-bold text-xs truncate font-['Montserrat'] drop-shadow-md">DEMO SHOTS</span>
                    </div>
                    <div className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center">
                        <span className="text-2xl font-black text-[#FFD700] font-['Montserrat'] drop-shadow-md">{shotCount}</span>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 relative p-0 flex items-center justify-center">
                <PoolTable
                    balls={demoBalls}
                    angle={angle}
                    setAngle={setAngle}
                    power={power}
                    setPower={setPower}
                    spin={spin}
                    setSpin={setSpin}
                    isMyTurn={!isAnimating}
                    onTakeShot={handleShoot}
                    is3D={is3D}
                />
            </div>

        </div>
    );
};

export default PoolGameDemo;

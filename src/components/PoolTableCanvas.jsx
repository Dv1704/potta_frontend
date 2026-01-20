/**
 * Canvas-based Pool Table Component
 * Uses the game-engine for physics and Three.js for rendering
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PoolEngine, Constants, MathUtils } from '../game-engine/index.js';

const PoolTableCanvas = ({
    balls = {},
    angle = 0,
    setAngle,
    power = 50,
    setPower,
    spin = { x: 0, y: 0 },
    setSpin,
    isMyTurn = false,
    onTakeShot,
    onBallsUpdate,
    onBallPocketed,
    onBallsStopped,
    opponentShotParams = null, // NEW: For instant opponent shot relay
    gameMode = '8ball'
}) => {
    const containerRef = useRef(null);
    const canvas3DRef = useRef(null);
    const engineRef = useRef(null);

    const [isAiming, setIsAiming] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [isEngineRunning, setIsEngineRunning] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Initialize engine
    useEffect(() => {
        if (!canvas3DRef.current) return;

        const initEngine = async () => {
            engineRef.current = new PoolEngine({
                canvas3D: canvas3DRef.current,
                onPhysicsUpdate: (state) => {
                    if (onBallsUpdate) {
                        onBallsUpdate(state.balls);
                    }
                },
                onBallPocketed: (ballNumber, hole) => {
                    if (onBallPocketed) {
                        onBallPocketed(ballNumber, hole);
                    }
                },
                onBallsStopped: (state) => {
                    setIsEngineRunning(false);
                    if (onBallsStopped) {
                        onBallsStopped(state);
                    }
                }
            });

            // Wait for textures to load
            await new Promise(resolve => setTimeout(resolve, 100));

            // Initialize ball positions
            engineRef.current.initBalls8Ball();
            setIsEngineReady(true);

            // Initial render
            engineRef.current._render();
        };

        initEngine();

        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
            }
        };
    }, []);

    // Sync balls from external state (e.g., server)
    // Only sync if engine is NOT currently running local simulation
    useEffect(() => {
        if (engineRef.current && isEngineReady && balls && Object.keys(balls).length > 0 && !isEngineRunning) {
            engineRef.current.syncBalls(balls);
            engineRef.current._render();
        }
    }, [balls, isEngineReady, isEngineRunning]);

    // Handle instant opponent shot relay
    useEffect(() => {
        if (engineRef.current && isEngineReady && opponentShotParams) {
            console.log('[PoolTableCanvas] Simulating opponent shot locally', opponentShotParams);
            engineRef.current.shoot(
                opponentShotParams.angle,
                opponentShotParams.power,
                opponentShotParams.spin
            );
        }
    }, [opponentShotParams, isEngineReady]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });

                if (engineRef.current) {
                    engineRef.current.resize(rect.width, rect.height);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get cue ball position for aiming
    const getCueBallScreenPos = useCallback(() => {
        if (!containerRef.current || !engineRef.current) return null;

        const cueBall = engineRef.current.getCueBall();
        if (!cueBall) return null;

        const x = (cueBall.getX() / Constants.CANVAS_WIDTH) * 100;
        const y = (cueBall.getY() / Constants.CANVAS_HEIGHT) * 100;

        return { x, y };
    }, []);

    // Aiming handlers - DRAG anywhere to aim
    const handleStartAiming = useCallback((e) => {
        if (!isMyTurn || !engineRef.current || isEngineRunning) return;
        setIsAiming(true);
        handleAimingMove(e);
    }, [isMyTurn, isEngineRunning]);

    const handleAimingMove = useCallback((e) => {
        if (!isAiming || !isMyTurn || !setAngle || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const cueBall = engineRef.current.getCueBall();
        if (!cueBall) return;

        const cueBallScreenX = rect.left + (cueBall.getX() / Constants.CANVAS_WIDTH) * rect.width;
        const cueBallScreenY = rect.top + (cueBall.getY() / Constants.CANVAS_HEIGHT) * rect.height;

        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;

        if (clientX === undefined || clientY === undefined) return;

        const dx = clientX - cueBallScreenX;
        const dy = clientY - cueBallScreenY;

        // Calculate angle
        const deg = Math.atan2(dy, dx) * (180 / Math.PI);
        setAngle(deg);

        // Calculate power based on distance (MOVE across the table)
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(rect.width, rect.height) * 0.3; // Scaling factor

        let newPower = ((dist - 20) / maxDist) * 100;
        newPower = Math.max(0, Math.min(100, newPower));
        if (setPower && isAiming) {
            setPower(newPower);
        }
    }, [isAiming, isMyTurn, setAngle, setPower, getCueBallScreenPos]);

    const handleStopAiming = useCallback(() => {
        setIsAiming(false);
    }, []);

    // Power bar handler
    const handlePowerInteraction = useCallback((e) => {
        if (!isMyTurn || !setPower || isEngineRunning) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;
        const clickY = e.clientY;

        let percentage = ((bottom - clickY) / height) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        setPower(percentage);
    }, [isMyTurn, setPower, isEngineRunning]);

    // Execute shot
    const handleShoot = useCallback(() => {
        if (!isMyTurn || !engineRef.current || isEngineRunning) return;

        // Execute shot in engine
        const success = engineRef.current.shoot(angle, power, spin);

        if (success) {
            setIsEngineRunning(true);
            if (onTakeShot) {
                onTakeShot({ angle, power, spin });
            }
        }
    }, [isMyTurn, angle, power, spin, onTakeShot, isEngineRunning]);

    useEffect(() => {
        if (onBallsStopped) {
            // Keep track of external handler if needed
        }
    }, [onBallsStopped]);

    // Calculate cue ball position and stick placement
    const cueBall = engineRef.current?.getCueBall();
    const cueBallScreenX = cueBall ? (cueBall.getX() / Constants.CANVAS_WIDTH) * 100 : 50;
    const cueBallScreenY = cueBall ? (cueBall.getY() / Constants.CANVAS_HEIGHT) * 100 : 50;
    const showStick = cueBall && cueBall.isBallOnTable() && isMyTurn && !isEngineRunning;

    // Calculate stick position - it orbits around the cue ball
    const angleRad = (angle * Math.PI) / 180;
    const stickDistance = 150 + (power / 100) * 80; // Pulls back with power
    const stickOffsetX = -Math.cos(angleRad) * stickDistance;
    const stickOffsetY = -Math.sin(angleRad) * stickDistance;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center font-['Montserrat'] overflow-hidden"
            onPointerDown={handleStartAiming}
            onPointerMove={handleAimingMove}
            onPointerUp={handleStopAiming}
            onPointerLeave={handleStopAiming}
            style={{ touchAction: 'none' }}
        >
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/assets/all_sprites/bg_game.jpg)' }}
            />

            {/* Main Table Transform Container */}
            <div className="relative w-full max-w-5xl aspect-[1.66/1] flex items-center justify-center">
                {/* Pool Table Background Image */}
                <img
                    src="/assets/all_sprites/pool_table.png"
                    alt="Pool Table"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-0 pointer-events-none"
                />

                {/* 3D Canvas - Three.js renders balls here */}
                <canvas
                    ref={canvas3DRef}
                    width={Constants.CANVAS_WIDTH}
                    height={Constants.CANVAS_HEIGHT}
                    className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                />

                {/* Cue Stick & Aim Line Overlay */}
                {showStick && (
                    <div
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: `calc(${cueBallScreenX}% + ${(stickOffsetX / Constants.CANVAS_WIDTH) * 100}%)`,
                            top: `calc(${cueBallScreenY}% + ${(stickOffsetY / Constants.CANVAS_HEIGHT) * 100}%)`,
                            transform: `rotate(${angle}deg)`,
                            transition: isAiming ? 'none' : 'all 0.15s ease-out'
                        }}
                    >
                        {/* Cue Stick Image */}
                        <div className="relative">
                            <img
                                src="/assets/all_sprites/stick.png"
                                alt="Cue Stick"
                                className="w-[450px] h-16 object-contain"
                                style={{
                                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))',
                                    transformOrigin: 'right center'
                                }}
                            />
                        </div>

                        {/* Aim Line from stick to ball and beyond */}
                        <div
                            className="absolute left-0 top-1/2 h-0 border-t-4 border-white/60"
                            style={{
                                width: `${stickDistance + 300}px`,  // Extends beyond the ball
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))',
                                transform: 'translateY(-50%)',
                                borderStyle: 'dashed'
                            }}
                        />

                        {/* Aiming circle around cue ball for visual feedback */}
                        <div
                            className="absolute rounded-full border-2 border-yellow-400/40"
                            style={{
                                left: `${stickDistance}px`,
                                top: '50%',
                                width: '40px',
                                height: '40px',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 20px rgba(255,215,0,0.4)'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Spin Control UI */}
            <div className="absolute bottom-8 left-4 md:left-8 z-50 pointer-events-auto">
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group transform transition-transform hover:scale-105 active:scale-95">
                    <img
                        src="/assets/all_sprites/ball_spin_gui.png"
                        alt="Spin Control"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
                    />
                    <img
                        src="/assets/all_sprites/ball_spin_token.png"
                        alt="Spin Token"
                        className="absolute w-[20%] h-[20%] object-contain drop-shadow-md"
                        style={{
                            left: `${50 + (spin?.x || 0) / 2}%`,
                            top: `${50 + (spin?.y || 0) / 2}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                </div>
            </div>

            {/* Power Bar */}
            <div
                className={`absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-50 h-64 md:h-[50vh] aspect-[1/10] flex flex-col justify-end group ${isMyTurn ? 'cursor-pointer' : 'opacity-50'}`}
                onClick={handlePowerInteraction}
                onMouseMove={(e) => e.buttons === 1 && handlePowerInteraction(e)}
            >
                <img
                    src="/assets/all_sprites/shot_bar.png"
                    alt="Power Background"
                    className="absolute inset-0 w-full h-full object-contain"
                />
                <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-75 ease-out overflow-hidden"
                    style={{ height: `${power}%` }}
                >
                    <div className="w-full h-full bg-[url('/assets/all_sprites/over_shot_bar.png')] bg-bottom bg-contain bg-no-repeat" />
                </div>
                <div className="absolute -bottom-6 w-full text-[#FFD700] text-[8px] font-bold text-center tracking-widest drop-shadow-md">
                    POWER
                </div>
            </div>

            {/* Shoot Button */}
            {isMyTurn && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                    <button
                        onClick={handleShoot}
                        className="relative w-48 h-16 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <img
                            src="/assets/all_sprites/but_text.png"
                            alt="Shoot"
                            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
                        />
                        <span
                            className="relative z-10 text-white font-black text-2xl tracking-wider"
                            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
                        >
                            SHOOT
                        </span>
                    </button>
                </div>
            )}

            {/* Loading indicator */}
            {!isEngineReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="text-white text-xl font-bold">Loading...</div>
                </div>
            )}
        </div>
    );
};

export default PoolTableCanvas;

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSound from '../hooks/useSound';

const Ball = ({ number, x, y }) => {
    // Sprite Sheet Logic for 2d_balls.png
    // Confirmed dimensions: 448x28 (16 balls in a single horizontal row)
    // Frame 0..15
    const n = parseInt(number);

    // For a horizontal strip of 16 frames:
    // background-size-x = 1600%
    // position-x = (frameIndex / (totalFrames - 1)) * 100%
    const posX = n * (100 / 15);

    return (
        <motion.div
            initial={false}
            animate={{ left: `${x}%`, top: `${y}%` }}
            transition={{ duration: 0.02, ease: "linear" }}
            className="absolute z-10 w-[2.2%] aspect-square flex items-center justify-center" // Realistic size ~2.2%
            style={{ transform: 'translate(-50%, -50%)' }}
        >
            {/* Real Shadow Asset */}
            <img
                src="/assets/pool/ball_shadow.png"
                alt=""
                className="absolute top-[10%] left-[10%] w-full h-full opacity-60 pointer-events-none scale-125"
            />

            {/* Sprite Ball */}
            <div
                className="relative w-full h-full rounded-full bg-no-repeat overflow-hidden"
                style={{
                    backgroundImage: 'url(/assets/pool/2d_balls.png)',
                    backgroundSize: '1600% 100%',
                    backgroundPosition: `${posX}% 0%`,
                    boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3)', // Subtle depth integration
                }}
            />
        </motion.div>
    );
};

const PoolTable = ({
    balls = {},
    angle,
    setAngle,
    power,
    setPower,
    spin,
    setSpin,
    isMyTurn,
    onTakeShot,
    is3D = true
}) => {
    const tableRef = useRef(null);

    // Critical null safety checks
    if (!balls || typeof balls !== 'object') {
        console.warn('[PoolTable] Invalid balls prop received:', balls);
        return null;
    }

    const cueBall = balls['0'];
    const { play, SFX } = useSound();

    // Universal Aiming Handler (Mouse, Trackpad, Touch, Pen)
    const handleAimingMove = (e) => {
        if (!isMyTurn || !cueBall || !tableRef.current) return;

        // Get client coordinates from either pointer or touch event
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;

        if (clientX === undefined || clientY === undefined) return;

        const rect = tableRef.current.getBoundingClientRect();

        // Calculate cue ball center in screen coordinates
        const cueBallX = rect.left + rect.width * (cueBall.x / 100);
        const cueBallY = rect.top + rect.height * (cueBall.y / 100);

        // Calculate angle from cue ball to pointer
        const dx = clientX - cueBallX;
        const dy = clientY - cueBallY;

        let deg = Math.atan2(dy, dx) * (180 / Math.PI);
        setAngle(deg);
    };

    // Handle Power Setting
    const handlePowerInteraction = (e) => {
        if (!isMyTurn) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;
        const clickY = e.clientY;

        let percentage = ((bottom - clickY) / height) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        setPower(percentage);
    };

    // Wrap onTakeShot to play sound
    const handleShoot = () => {
        if (onTakeShot) {
            play(SFX.STICK_SHOT, power / 100); // Volume based on power
            onTakeShot();
        }
    };

    return (
        <div
            className="relative w-full h-full flex items-center justify-center font-['Montserrat']"
            onPointerMove={handleAimingMove}
            onTouchMove={handleAimingMove}
        >
            {/* Spin Control */}
            <div className="absolute bottom-8 left-4 md:left-8 z-50 pointer-events-auto">
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group transform transition-transform hover:scale-105 active:scale-95 aspect-square">
                    {/* Spin GUI Background */}
                    <img
                        src="/assets/pool/ball_spin_gui.png"
                        alt="Spin Control"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
                    />

                    {/* Spin Token */}
                    <img
                        src="/assets/pool/ball_spin_token.png"
                        alt="Spin Token"
                        className="absolute w-[20%] h-[20%] object-contain drop-shadow-md"
                        style={{
                            left: `${50 + (spin?.x || 0) / 2}%`,
                            top: `${50 + (spin?.y || 0) / 2}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                    {/* Interaction Overlay (Invisible but clickable) */}
                    <div className="absolute inset-0 rounded-full cursor-crosshair">
                        {/* Logic to update spin state would go here (onClick/onMouseMove) */}
                    </div>
                </div>
            </div>

            {/* Power Bar (Right Side) */}
            <div
                className={`absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-50 h-64 md:h-[50vh] aspect-[1/10] flex flex-col justify-end group ${isMyTurn ? 'cursor-pointer' : 'opacity-50'}`}
                onClick={handlePowerInteraction}
                onMouseMove={(e) => e.buttons === 1 && handlePowerInteraction(e)}
            >
                {/* Background (Empty) */}
                <img src="/assets/pool/shot_bar.png" alt="Power Background" className="absolute inset-0 w-full h-full object-contain" />

                {/* Foreground (Fill) */}
                <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-75 ease-out overflow-hidden"
                    style={{ height: `${power}%` }}
                >
                    <div
                        className="w-full h-full bg-[url('/assets/pool/over_shot_bar.png')] bg-bottom bg-contain bg-no-repeat"
                    ></div>
                </div>

                {/* Text Label */}
                <div className="absolute -bottom-6 w-full text-[#FFD700] text-[8px] font-bold text-center tracking-widest drop-shadow-md">POWER</div>
            </div>

            {/* Shoot Button */}
            {isMyTurn && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                    <button
                        onClick={handleShoot}
                        className="relative w-48 h-16 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <img
                            src="/assets/pool/but_text.png"
                            alt="Shoot"
                            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
                        />
                        <span className="relative z-10 text-white font-black text-2xl tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] stroke-black" style={{ textShadow: '2px 2px 0 #000' }}>
                            SHOOT
                        </span>
                    </button>
                </div>
            )}

            {/* Main Table Transform Container */}
            <motion.div
                ref={tableRef}
                initial={false}
                animate={{
                    rotateX: is3D ? 30 : 0,
                    scale: is3D ? 0.9 : 1,
                    translateY: is3D ? 40 : 0
                }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                className="relative w-full max-w-5xl aspect-[1.77/1] flex items-center justify-center transform-style-3d select-none"
            >
                {/* 1. REAL TABLE IMAGE */}
                <img
                    src="/assets/pool/pool_table.png"
                    alt="Pool Table"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-0 pointer-events-none"
                />

                {/* 3. Render Balls - MOVED OUTSIDE PLAYABLE AREA */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {Object.entries(balls).map(([num, ball]) => (
                        ball.onTable && (
                            <Ball
                                key={num}
                                number={num}
                                x={(ball.x / 1280) * 100}
                                y={(ball.y / 720) * 100}
                            />
                        )
                    ))}
                </div>

                {/* 2. Playable Surface Debug */}
                <div className="absolute inset-[4.5%] top-[11%] bottom-[11%] left-[5%] right-[5%] z-20 pointer-events-none border border-white/0">
                </div>

                {/* 4. Cue Stick & Aim Line */}
                {cueBall && cueBall.onTable && isMyTurn && (
                    <div
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: `${(cueBall.x / 1280) * 100}%`,
                            top: `${(cueBall.y / 720) * 100}%`,
                            width: 0, height: 0,
                            overflow: 'visible'
                        }}
                    >
                        {/* Rotation Wrapper */}
                        <div
                            className="absolute top-0 left-0 flex items-center justify-center"
                            style={{ transform: `rotate(${angle}deg)` }}
                        >
                            {/* Aim Line (Extends Right) -> Matches 0 deg */}
                            <div
                                className="absolute left-[20px] top-0 h-0 border-t-2 border-dashed border-white/80 origin-left drop-shadow-md"
                                style={{ width: '800px' }}
                            >
                                <div className="absolute right-0 top-1/2 w-4 h-4 border-2 border-white rounded-full transform -translate-y-1/2 translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>

                            {/* Cue Stick (Extends Left) -> Matches 180 deg essentially */}
                            <div
                                className="absolute right-[20px] top-0 w-[400px] md:w-[600px] h-24 origin-right flex items-center justify-end"
                                style={{ transform: 'translateY(-50%)' }}
                            >
                                <img
                                    src="/assets/pool/stick.png"
                                    alt="Cue Stick"
                                    className="w-full h-full object-contain object-right"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    );
};

export default PoolTable;

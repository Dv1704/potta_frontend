import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PoolTable from '../components/PoolTable';

const PoolGameDemo = () => {
    const [power, setPower] = useState(50);
    const [spin, setSpin] = useState({ x: 0, y: 0 });
    const [is3D, setIs3D] = useState(true);
    const [angle, setAngle] = useState(-15);

    // Hardcoded Demo State for Visuals (Mapped from Game Engine settings.js 1920x1080)
    // Adjusted with aggressive spacing to prevent "jampacked" look
    const demoBalls = {
        '0': { x: 18.6, y: 33.0, onTable: true },
        '1': { x: 47.7, y: 33.0, onTable: true }, // Apex

        // Row 2 (X + 1.8)
        '2': { x: 49.5, y: 34.75, onTable: true },
        '3': { x: 49.5, y: 31.25, onTable: true },

        // Row 3 (X + 3.6)
        '4': { x: 51.3, y: 36.5, onTable: true },
        '8': { x: 51.3, y: 33.0, onTable: true }, // 8 Ball
        '6': { x: 51.3, y: 29.5, onTable: true },

        // Row 4 (X + 5.4)
        '7': { x: 53.1, y: 38.25, onTable: true },
        '5': { x: 53.1, y: 34.75, onTable: true },
        '9': { x: 53.1, y: 31.25, onTable: true },
        '10': { x: 53.1, y: 27.75, onTable: true },

        // Row 5 (X + 7.2)
        '11': { x: 54.9, y: 40.0, onTable: true },
        '12': { x: 54.9, y: 36.5, onTable: true },
        '13': { x: 54.9, y: 33.0, onTable: true },
        '14': { x: 54.9, y: 29.5, onTable: true },
        '15': { x: 54.9, y: 26.0, onTable: true },
    };

    return (
        <div className="relative w-full h-screen bg-[#121212] overflow-hidden flex flex-col font-sans select-none">
            {/* Background Ambience: Game Engine Asset */}
            <div className="absolute inset-0 bg-[url('/assets/pool/bg_game.jpg')] bg-cover bg-center"></div>

            {/* HUD: Player 1 (Left) */}
            <div className="absolute top-4 left-4 z-50 flex flex-col items-center pointer-events-none">
                <div className="relative w-48 h-16">
                    <img src="/assets/pool/player_gui.png" alt="Player 1" className="w-full h-full object-contain drop-shadow-lg" />
                    <div className="absolute top-2 left-14 w-32 h-6 flex items-center mb-1">
                        <span className="text-white font-bold text-xs truncate font-['Montserrat'] drop-shadow-md">YOU</span>
                    </div>
                    <div className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center">
                        <span className="text-2xl font-black text-[#FFD700] font-['Montserrat'] drop-shadow-md">0</span>
                    </div>
                </div>
            </div>

            {/* HUD: Player 2 (Right) */}
            <div className="absolute top-4 right-4 z-50 flex flex-col items-center pointer-events-none">
                <div className="relative w-48 h-16">
                    <img src="/assets/pool/player_gui.png" alt="Player 2" className="w-full h-full object-contain drop-shadow-lg" />
                    <div className="absolute top-2 left-14 w-32 h-6 flex items-center mb-1">
                        <span className="text-white font-bold text-xs truncate font-['Montserrat'] drop-shadow-md">PLAYER 2</span>
                    </div>
                    <div className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center">
                        <span className="text-2xl font-black text-white font-['Montserrat'] drop-shadow-md">0</span>
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
                    isMyTurn={true}
                    is3D={is3D}
                />
            </div>

        </div>
    );
};

export default PoolGameDemo;

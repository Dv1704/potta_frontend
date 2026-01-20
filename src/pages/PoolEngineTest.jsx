/**
 * Test page for the new Pool Engine
 */
import React, { useState } from 'react';
import PoolTableCanvas from '../components/PoolTableCanvas';

const PoolEngineTest = () => {
    const [balls, setBalls] = useState({});
    const [angle, setAngle] = useState(0);
    const [power, setPower] = useState(50);
    const [spin, setSpin] = useState({ x: 0, y: 0 });
    const [gameLog, setGameLog] = useState([]);

    const addLog = (message) => {
        setGameLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const handleBallsUpdate = (newBalls) => {
        setBalls(newBalls);
    };

    const handleBallPocketed = (ballNumber, hole) => {
        addLog(`Ball ${ballNumber} pocketed!`);
    };

    const handleBallsStopped = (state) => {
        addLog(`All balls stopped. First hit: ${state.firstBallHit || 'none'}`);
        if (state.pocketedBalls?.length > 0) {
            addLog(`Pocketed: ${state.pocketedBalls.map(b => b.number).join(', ')}`);
        }
    };

    const handleTakeShot = (params) => {
        addLog(`Shot taken: angle=${params.angle.toFixed(1)}°, power=${params.power.toFixed(0)}`);
    };

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
                <h1 className="text-lg font-bold">🎱 Pool Engine Test</h1>
                <div className="text-sm text-gray-400">
                    Angle: <span className="text-green-400 font-mono">{angle.toFixed(1)}°</span> | Power: <span className="text-blue-400 font-mono">{power.toFixed(0)}%</span>
                </div>
            </div>

            {/* Main game area */}
            <div className="flex-1 relative">
                <PoolTableCanvas
                    balls={balls}
                    angle={angle}
                    setAngle={setAngle}
                    power={power}
                    setPower={setPower}
                    spin={spin}
                    setSpin={setSpin}
                    isMyTurn={true}
                    onTakeShot={handleTakeShot}
                    onBallsUpdate={handleBallsUpdate}
                    onBallPocketed={handleBallPocketed}
                    onBallsStopped={handleBallsStopped}
                />
            </div>

            {/* Debug log */}
            <div className="bg-black/80 text-green-400 p-2 font-mono text-xs h-32 overflow-y-auto">
                {gameLog.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
                {gameLog.length === 0 && (
                    <div className="text-gray-500">Click and drag to aim, adjust power, then click SHOOT</div>
                )}
            </div>
        </div>
    );
};

export default PoolEngineTest;

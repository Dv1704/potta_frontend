import React from 'react';
import PoolGameEngineEmbed from '../components/PoolGameEngineEmbed';

/**
 * PlayerInfoOverlay - Mock overlay for testing
 */
const PlayerInfoOverlay = () => {
    return (
        <>
            {/* Player 1 Info - Top Left */}
            <div className="absolute top-4 left-4 z-[9999] pointer-events-none">
                <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <div>
                            <div className="text-white font-bold text-sm">
                                TestPlayer1 (YOU)
                            </div>
                            <div className="text-yellow-300 text-xs font-semibold">
                                Score: 0
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player 2 Info - Top Right */}
            <div className="absolute top-4 right-4 z-[9999] pointer-events-none">
                <div className="bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border border-white/20">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="text-white font-bold text-sm text-right">
                                TestPlayer2
                            </div>
                            <div className="text-yellow-300 text-xs font-semibold text-right">
                                Score: 0
                            </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    </div>
                </div>
            </div>

            {/* Stake Info - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
                <div className="bg-gradient-to-r from-yellow-600/90 to-amber-600/90 backdrop-blur-sm rounded-lg px-6 py-2 shadow-xl border border-white/20">
                    <div className="text-center">
                        <div className="text-yellow-100 text-xs font-semibold">STAKE</div>
                        <div className="text-white font-bold text-lg">GH₵1,000</div>
                        <div className="text-yellow-200 text-xs">Winner takes: GH₵1,900</div>
                    </div>
                </div>
            </div>

            {/* Turn Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-xl border border-white/30 animate-pulse">
                    <div className="text-white font-bold text-sm">YOUR TURN</div>
                </div>
            </div>

            {/* Test Mode Badge */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
                <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/30">
                    <div className="text-white font-bold text-sm">🎱 TEST MODE - PVP Overlay Demo</div>
                </div>
            </div>
        </>
    );
};

/**
 * GameEngineTest - Test page to verify the 8 Ball Pro game engine with PVP overlay
 */
const GameEngineTest = () => {
    const handleStartSession = () => {
        console.log('[Test] Game session started');
    };

    const handleEndSession = () => {
        console.log('[Test] Game session ended');
    };

    const handleSaveScore = (score) => {
        console.log('[Test] Score saved:', score);
    };

    const handleStartLevel = (level) => {
        console.log('[Test] Level started:', level);
    };

    const handleEndLevel = (level) => {
        console.log('[Test] Level ended:', level);
    };

    const handleRestartLevel = (level) => {
        console.log('[Test] Level restarted:', level);
    };

    const handleShareEvent = (score) => {
        console.log('[Test] Share event:', score);
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* PVP Overlay */}
            <PlayerInfoOverlay />

            {/* Embed the 8 Ball Pro game engine */}
            <PoolGameEngineEmbed
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                onSaveScore={handleSaveScore}
                onStartLevel={handleStartLevel}
                onEndLevel={handleEndLevel}
                onRestartLevel={handleRestartLevel}
                onShareEvent={handleShareEvent}
            />
        </div>
    );
};

export default GameEngineTest;

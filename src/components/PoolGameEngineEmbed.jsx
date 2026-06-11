import React, { useEffect, useRef, useState } from 'react';

/**
 * PoolGameEngineEmbed
 * 
 * Embeds the 8 Ball Pro HTML5 game engine in an iframe.
 * Preserves all original physics, UI, and functionality.
 */
const PoolGameEngineEmbed = ({
    mode = 'turn',
    onStartSession,
    onEndSession,
    onSaveScore,
    onStartLevel,
    onEndLevel,
    onRestartLevel,
    onShareEvent
}) => {
    const iframeRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const handleMessage = (event) => {
            // Handle messages from the game iframe if needed
            if (event.data && event.data.type) {
                switch (event.data.type) {
                    case 'start_session':
                        onStartSession?.();
                        break;
                    case 'end_session':
                        onEndSession?.();
                        break;
                    case 'save_score':
                        onSaveScore?.(event.data.score);
                        break;
                    case 'start_level':
                        onStartLevel?.(event.data.level);
                        break;
                    case 'end_level':
                        onEndLevel?.(event.data.level);
                        break;
                    case 'restart_level':
                        onRestartLevel?.(event.data.level);
                        break;
                    case 'share_event':
                        onShareEvent?.(event.data.score);
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [onStartSession, onEndSession, onSaveScore, onStartLevel, onEndLevel, onRestartLevel, onShareEvent]);

    const handleIframeLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className="fixed inset-0 overflow-hidden bg-black pt-10">
            {!isLoaded && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-sans">
                    Loading Game...
                </div>
            )}
            <iframe
                ref={iframeRef}
                src={`/game-engine/index.html?mode=${mode}&userId=${localStorage.getItem('userId') || ''}`}
                className="w-full h-full border-0 block"
                title="8 Ball Pro Game"
                onLoad={handleIframeLoad}
                allow="autoplay; fullscreen"
            />
        </div>
    );
};

export default PoolGameEngineEmbed;

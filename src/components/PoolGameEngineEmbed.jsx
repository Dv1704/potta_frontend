import React, { useEffect, useRef, useState } from 'react';

/**
 * PoolGameEngineEmbed
 * 
 * Embeds the 8 Ball Pro HTML5 game engine in an iframe.
 * Preserves all original physics, UI, and functionality.
 */
const PoolGameEngineEmbed = ({
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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontSize: '24px',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    Loading Game...
                </div>
            )}
            <iframe
                ref={iframeRef}
                src="/game-engine/index.html"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                }}
                title="8 Ball Pro Game"
                onLoad={handleIframeLoad}
                allow="autoplay; fullscreen"
            />
        </div>
    );
};

export default PoolGameEngineEmbed;

import { useRef, useEffect } from 'react';

const SFX = {
    STICK_SHOT: '/assets/sounds/stick_shot.mp3',
    BALL_COLLISION: '/assets/sounds/ball_collision.mp3',
    BALL_IN_HOLE: '/assets/sounds/ball_in_hole.mp3',
    EDGE_COLLISION: '/assets/sounds/edge_collision.mp3',
    GAME_OVER: '/assets/sounds/game_over.mp3',
    LEVEL_WIN: '/assets/sounds/level_win.mp3',
};

export const useSound = () => {
    const audioRefs = useRef({});

    useEffect(() => {
        // Preload sounds
        Object.keys(SFX).forEach(key => {
            const audio = new Audio(SFX[key]);
            audio.preload = 'auto'; // Load immediately
            audioRefs.current[key] = audio;
        });
    }, []);

    const play = (key, volume = 1.0) => {
        const audio = audioRefs.current[key];
        if (audio) {
            // Clone node to allow overlapping sounds (e.g. multiple collisions)
            const clone = audio.cloneNode();
            clone.volume = volume;
            clone.play().catch(e => console.warn("Audio play failed", e));
        }
    };

    return { play, SFX };
};

export default useSound;

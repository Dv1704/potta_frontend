/**
 * Mock Server Bridge for Local PVP Testing
 * 
 * This utility simulates server-side physics and authoritative validation
 * without needing a live backend. Perfect for testing:
 * - Animation lock cycle
 * - Coordinate conversion accuracy
 * - Turn switching logic
 * - Input suppression
 */

/**
 * Simulates server physics calculation and returns authoritative result
 * @param {Object} shotData - Shot parameters from client
 * @param {string} userId - Current player's user ID
 * @param {Object} currentGameState - Current game state before shot
 * @returns {Promise<Object>} - Mock shot result matching server format
 */
export const mockServerProcessShot = async (shotData, userId, currentGameState) => {
    console.log("🛠️ [MockServer] Shot received:", shotData);

    // 1. Simulate network + physics latency (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Calculate mock final ball positions
    // In real server, this would be PoolEngine physics simulation
    const mockFinalBalls = calculateMockBallPositions(shotData, currentGameState);

    // 3. Determine next turn (toggle between players)
    const currentPlayerId = currentGameState?.turn || userId;
    const players = currentGameState?.players || [
        { id: userId, name: 'You' },
        { id: 'mock_opponent', name: 'Mock Opponent' }
    ];
    const nextPlayerId = players.find(p => p.id !== currentPlayerId)?.id || userId;

    // 4. Build authoritative result (matches backend format)
    return {
        shooterId: userId,
        shotResult: {
            finalState: mockFinalBalls,
            ballsPocketed: [],
            isFoul: false,
            animationFrames: [] // Empty = instant snap (good for testing)
        },
        gameState: {
            balls: mockFinalBalls,
            turn: nextPlayerId,
            isGameOver: false,
            winner: null,
            timer: 30,
            players: players,
            stake: currentGameState?.stake || 10
        }
    };
};

/**
 * Calculate mock ball positions after shot
 * For testing, we'll use predictable positions to verify coordinate conversion
 */
function calculateMockBallPositions(shotData, currentGameState) {
    // Test pattern: Move cue ball to specific percentage coordinates
    // This lets us verify percentage-to-pixel conversion accuracy

    const testPositions = {
        // Cue ball moves to center
        0: { x: 50, y: 50, onTable: true },    // Center (should be 900px, 450px)

        // Other balls in predictable positions for visual verification
        1: { x: 25, y: 25, onTable: true },    // Top-left quarter (450px, 225px)
        2: { x: 75, y: 25, onTable: true },    // Top-right quarter (1350px, 225px)
        3: { x: 25, y: 75, onTable: true },    // Bottom-left quarter (450px, 675px)
        4: { x: 75, y: 75, onTable: true },    // Bottom-right quarter (1350px, 675px)

        // Rest stay in rack formation (server would track all)
        5: { x: 60, y: 50, onTable: true },
        6: { x: 65, y: 48, onTable: true },
        7: { x: 65, y: 52, onTable: true },
        8: { x: 70, y: 50, onTable: true },
        9: { x: 70, y: 46, onTable: true },
        10: { x: 70, y: 54, onTable: true },
        11: { x: 75, y: 50, onTable: true },
        12: { x: 75, y: 44, onTable: true },
        13: { x: 75, y: 56, onTable: true },
        14: { x: 80, y: 48, onTable: true },
        15: { x: 80, y: 52, onTable: true }
    };

    return testPositions;
}

/**
 * Simulate opponent's shot (for testing opponentShotStart relay)
 */
export const mockOpponentShot = () => {
    return {
        type: 'opponentShotStart',
        data: {
            vector: {
                angle: 45,      // 45 degrees
                power: 100,     // Medium power
                sideSpin: 0,
                backSpin: 0
            }
        }
    };
};

/**
 * Test coordinate conversion accuracy
 * Run this in browser console to verify percentage → pixel mapping
 */
export const testCoordinateConversion = () => {
    const testCases = [
        { name: 'Center', x: 50, y: 50, expectedX: 900, expectedY: 450 },
        { name: 'Top-Left', x: 0, y: 0, expectedX: 0, expectedY: 0 },
        { name: 'Top-Right', x: 100, y: 0, expectedX: 1800, expectedY: 0 },
        { name: 'Bottom-Left', x: 0, y: 100, expectedX: 0, expectedY: 900 },
        { name: 'Bottom-Right', x: 100, y: 100, expectedX: 1800, expectedY: 900 },
        { name: 'Quarter-Top-Left', x: 25, y: 25, expectedX: 450, expectedY: 225 }
    ];

    const CANVAS_WIDTH = 1800;
    const CANVAS_HEIGHT = 900;

    console.log('🧪 Testing Coordinate Conversion:');
    console.table(testCases.map(tc => ({
        Position: tc.name,
        'Server %': `(${tc.x}%, ${tc.y}%)`,
        'Calculated Pixels': `(${(tc.x / 100) * CANVAS_WIDTH}px, ${(tc.y / 100) * CANVAS_HEIGHT}px)`,
        'Expected Pixels': `(${tc.expectedX}px, ${tc.expectedY}px)`,
        'Match': (tc.x / 100) * CANVAS_WIDTH === tc.expectedX && (tc.y / 100) * CANVAS_HEIGHT === tc.expectedY ? '✅' : '❌'
    })));
};

/**
 * Manual test: Send gameStateUpdate to iframe
 * Run this in browser console to test ball position sync
 */
export const sendMockGameState = (ballPositions = null) => {
    const iframe = document.querySelector('iframe');
    if (!iframe || !iframe.contentWindow) {
        console.error('❌ No iframe found');
        return;
    }

    const defaultPositions = {
        0: { x: 50, y: 50, onTable: true }  // Center
    };

    iframe.contentWindow.postMessage({
        type: 'gameStateUpdate',
        state: {
            balls: ballPositions || defaultPositions,
            turn: 'test_user',
            isGameOver: false
        }
    }, '*');

    console.log('✅ Sent mock game state to iframe');
    console.log('Expected: Ball 0 at (900px, 450px) - center of canvas');
};

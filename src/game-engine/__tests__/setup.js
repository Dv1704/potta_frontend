import { vi } from 'vitest';

// Mock SceneManager to avoid Three.js WebGL issues in tests
vi.mock('../renderer/SceneManager.js', () => {
    return {
        SceneManager: vi.fn().mockImplementation(() => ({
            loadTextures: vi.fn().mockResolvedValue([]),
            create3DBall: vi.fn().mockReturnValue({
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { setScalar: vi.fn() },
                visible: true
            }),
            updateBallPosition: vi.fn(),
            render: vi.fn(),
            resize: vi.fn(),
            dispose: vi.fn()
        }))
    };
});

// Basic THREE mock for other components if needed
vi.mock('three', () => ({
    Vector2: class {
        constructor(x, y) { this.x = x || 0; this.y = y || 0; }
        set(x, y) { this.x = x; this.y = y; return this; }
        clone() { return new this.constructor(this.x, this.y); }
        length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        length2() { return this.x * this.x + this.y * this.y; }
    },
    TextureLoader: vi.fn(),
    WebGLRenderer: vi.fn()
}));

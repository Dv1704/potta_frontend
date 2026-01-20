import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PoolEngine } from '../index.js';
import * as Constants from '../constants.js';

describe('Pool Engine Mechanics', () => {
    let engine;
    let mockCanvas;

    beforeEach(() => {
        mockCanvas = {
            getContext: () => ({}),
            addEventListener: () => { },
            removeEventListener: () => { },
            width: 1280,
            height: 770
        };
        engine = new PoolEngine({ canvas3D: mockCanvas });
    });

    it('should initialize game state correctly', () => {
        engine.initBalls8Ball();
        expect(engine.balls).toHaveLength(16); // 1 cue + 15 object
        expect(engine.isRunning).toBe(false);
    });

    it('should execute a shot and start simulation', () => {
        engine.initBalls8Ball();
        const cueBall = engine.getCueBall();
        const initialPos = cueBall.getPos().clone();

        const success = engine.shoot(0, 50); // Angle 0, Power 50

        expect(success).toBe(true);
        expect(cueBall.getCurForceLength2()).toBeGreaterThan(0);

        // Run a simulation step
        engine._physicsStep();
        expect(cueBall.getX()).not.toBe(initialPos.x);
    });

    it('should stop simulation when all balls stop', () => {
        engine.initBalls8Ball();
        engine.shoot(0, 10);
        expect(engine.isRunning).toBe(true);

        // Force stop all balls
        engine.balls.forEach(b => b.setCurForce(0, 0));

        // Run physics step - it should detect everything stopped
        engine._physicsStep();
        expect(engine.physics.areBallsStopped()).toBe(true);
    });

    it('should correctly report game state', () => {
        engine.initBalls8Ball();
        const state = engine.getGameState();
        expect(state.balls).toBeDefined();
        expect(Object.keys(state.balls)).toHaveLength(16);
        expect(state.allStopped).toBe(true);
    });

    it('should respot cue ball after scratch', () => {
        engine.initBalls8Ball();
        const cueBall = engine.getCueBall();

        // Simulate scratch
        cueBall.setFlagOnTable(false);
        cueBall.setVisible(false);

        engine.respotCueBall(500, 500);

        expect(cueBall.isBallOnTable()).toBe(true);
        expect(cueBall.isVisible()).toBe(true);
        expect(cueBall.getX()).toBe(500);
        expect(cueBall.getY()).toBe(500);
    });

    it('should validate cue ball placement correctly', () => {
        engine.initBalls8Ball();

        // Invalid: outside table
        expect(engine.isValidCueBallPosition(-10, -10)).toBe(false);

        // Invalid: overlapping another ball
        const otherBall = engine.getBall(1);
        expect(engine.isValidCueBallPosition(otherBall.getX(), otherBall.getY())).toBe(false);

        // Valid: center of table
        expect(engine.isValidCueBallPosition(500, 350)).toBe(true);
    });
});

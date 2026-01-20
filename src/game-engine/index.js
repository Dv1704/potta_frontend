/**
 * Pool Game Engine - Main entry point
 * Combines physics, rendering, and game logic
 */
import { Ball } from './entities/Ball.js';
import { PhysicsController } from './physics/PhysicsController.js';
import { SceneManager } from './renderer/SceneManager.js';
import { Vector2 } from './physics/Vector2.js';
import * as MathUtils from './physics/MathUtils.js';
import * as Constants from './constants.js';

export class PoolEngine {
    constructor(options = {}) {
        this.canvas3D = options.canvas3D;
        this.onPhysicsUpdate = options.onPhysicsUpdate;
        this.onBallPocketed = options.onBallPocketed;
        this.onBallsStopped = options.onBallsStopped;
        this.onCollision = options.onCollision;

        // Engine state
        this.balls = [];
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.accumulator = 0;

        // Components
        this.physics = new PhysicsController();
        this.renderer = null;

        // Game state
        this.firstBallHit = null;
        this.pocketedBalls = [];

        this._init();
    }

    async _init() {
        // Initialize 3D renderer if canvas provided
        if (this.canvas3D) {
            try {
                this.renderer = new SceneManager(this.canvas3D);
                await this.renderer.loadTextures();
            } catch (e) {
                console.warn('Failed to initialize 3D renderer, falling back to headless mode', e);
                this.renderer = null;
            }
        }

        // Set up physics event listeners
        this.physics.addEventListener(Constants.ON_BALL_INTO_HOLE, (ball, hole) => {
            const isCueBall = ball.getNumber() === 0;

            this.pocketedBalls.push({
                number: ball.getNumber(),
                hole: hole,
                isFoul: isCueBall || (isCueBall && this.firstBallHit !== null)
            });

            if (isCueBall) {
                this.isScratch = true;
            }

            if (this.onBallPocketed) {
                this.onBallPocketed(ball.getNumber(), hole);
            }
        });

        this.physics.addEventListener(Constants.ON_BALL_WITH_BALL, (ball1, ball2, force) => {
            // Track first ball hit for foul detection
            if (ball1.getNumber() === 0 && this.firstBallHit === null) {
                this.firstBallHit = ball2.getNumber();
            }
            if (this.onCollision) {
                this.onCollision('ball', ball1.getNumber(), ball2.getNumber(), force);
            }
        });

        this.physics.addEventListener(Constants.ON_BALL_WITH_BANK, (ball, edge) => {
            if (this.onCollision) {
                this.onCollision('bank', ball.getNumber(), edge?.getId(), ball.getCurForceLen());
            }
        });

        this.physics.addEventListener(Constants.ON_BALLS_STOPPED, () => {
            if (this.onBallsStopped) {
                this.onBallsStopped(this.getGameState());
            }
        });
    }

    /**
     * Initialize balls in 8-ball rack formation
     */
    initBalls8Ball() {
        this.balls = [];
        this.pocketedBalls = [];
        this.firstBallHit = null;

        // Create cue ball
        const cueBall = new Ball(0);
        cueBall.setPos(Constants.CUE_BALL_POS.x, Constants.CUE_BALL_POS.y);
        cueBall.setFlagOnTable(true);
        this.balls.push(cueBall);

        // Create object balls 1-15
        const rackPositions = Constants.RACK_POS_8BALL;
        for (let i = 0; i < 15; i++) {
            const ball = new Ball(i + 1);
            ball.setPos(rackPositions[i].x, rackPositions[i].y);
            ball.setFlagOnTable(true);
            this.balls.push(ball);
        }

        // Create 3D meshes
        if (this.renderer) {
            for (const ball of this.balls) {
                const mesh = this.renderer.create3DBall(ball.getNumber());
                ball.setMesh3D(mesh);
            }
        }
    }

    /**
     * Sync ball positions from external state (e.g., server)
     */
    syncBalls(ballsData) {
        if (!ballsData || typeof ballsData !== 'object') return;

        for (const [numStr, data] of Object.entries(ballsData)) {
            const num = parseInt(numStr);
            const ball = this.balls.find(b => b.getNumber() === num);

            if (ball && data) {
                ball.setPos(data.x, data.y);
                ball.setFlagOnTable(data.onTable !== false);
                if (data.vx !== undefined && data.vy !== undefined) {
                    ball.setCurForce(data.vx, data.vy);
                }
            }
        }
    }

    /**
     * Execute a shot
     */
    shoot(angleDegrees, power, spin = { x: 0, y: 0 }) {
        const cueBall = this.balls.find(b => b.getNumber() === 0);
        if (!cueBall || !cueBall.isBallOnTable()) return false;

        // Reset shot tracking
        this.firstBallHit = null;
        this.pocketedBalls = [];
        this.isScratch = false;

        // Calculate force from angle and power
        const angleRad = MathUtils.toRadian(angleDegrees);
        const forceMagnitude = MathUtils.linearFunction(
            power,
            0, 100,
            Constants.MIN_POWER_SHOT / 10,
            Constants.MAX_POWER_FORCE_BALL
        );

        const forceX = Math.cos(angleRad) * forceMagnitude;
        const forceY = Math.sin(angleRad) * forceMagnitude;

        console.log(`[PoolEngine] Shooting: angle=${angleDegrees.toFixed(1)}, power=${power.toFixed(1)}, spin=`, spin);
        cueBall.setCurForce(forceX, forceY);

        // Apply spin
        cueBall.setSideEffect(spin.x);
        cueBall.setEffectForceY(spin.y);

        // Start physics simulation
        this.start();

        return true;
    }

    /**
     * Start the physics/rendering loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulator = 0;

        this._gameLoop();
    }

    /**
     * Stop the physics/rendering loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main game loop - runs at 60 FPS fixed timestep
     */
    _gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Fixed timestep physics
        this.accumulator += deltaTime;

        while (this.accumulator >= Constants.FPS_TIME) {
            this._physicsStep();
            this.accumulator -= Constants.FPS_TIME;
        }

        // Render
        this._render();

        // Notify about position updates - CRITICAL: Send latest state
        const state = this.getGameState();
        if (this.onPhysicsUpdate) {
            this.onPhysicsUpdate(state);
        }

        // Check if simulation should continue
        if (state.allStopped) {
            console.log('[PoolEngine] All balls stopped, loop ending');
            this.stop();
        } else {
            this.animationFrameId = requestAnimationFrame(() => this._gameLoop());
        }
    }

    /**
     * Single physics step
     */
    _physicsStep() {
        this.physics.update(this.balls);
    }

    /**
     * Render current state
     */
    _render() {
        if (!this.renderer) return;

        // Update 3D meshes from physics balls
        for (const ball of this.balls) {
            const mesh = ball.getMesh3D();
            if (mesh) {
                this.renderer.updateBallPosition(mesh, ball);
            }
        }

        // Render the scene
        this.renderer.render();
    }

    /**
     * Get current game state (for sync/UI)
     */
    getGameState() {
        const ballsState = {};

        for (const ball of this.balls) {
            ballsState[ball.getNumber()] = {
                x: ball.getX(),
                y: ball.getY(),
                vx: ball.getCurForce().x,
                vy: ball.getCurForce().y,
                onTable: ball.isBallOnTable()
            };
        }

        return {
            balls: ballsState,
            allStopped: this.physics.areBallsStopped(),
            firstBallHit: this.firstBallHit,
            pocketedBalls: this.pocketedBalls
        };
    }

    /**
     * Get specific ball
     */
    getBall(number) {
        return this.balls.find(b => b.getNumber() === number);
    }

    /**
     * Get cue ball
     */
    getCueBall() {
        return this.getBall(0);
    }

    /**
     * Respot cue ball after scratch
     */
    respotCueBall(x = Constants.CUE_BALL_POS.x, y = Constants.CUE_BALL_POS.y) {
        const cueBall = this.getCueBall();
        if (cueBall) {
            cueBall.setPos(x, y);
            cueBall.setCurForce(0, 0);
            cueBall.setTmpForce(0, 0);
            cueBall.setFlagOnTable(true);
            cueBall.setVisible(true);
            cueBall.setInHole(null);
        }
    }

    /**
     * Check if point is valid for cue ball placement
     */
    isValidCueBallPosition(x, y) {
        const testPos = new Vector2(x, y);

        // Must be within table bounds
        const rect = Constants.RECT_COLLISION;
        if (x < rect.x || x > rect.right || y < rect.y || y > rect.bottom) {
            return false;
        }

        // Must not overlap other balls
        for (const ball of this.balls) {
            if (ball.getNumber() === 0) continue;
            if (!ball.isBallOnTable()) continue;

            const dist = MathUtils.distance(testPos, ball.getPos());
            if (dist < Constants.BALL_DIAMETER + 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Resize the renderer
     */
    resize(width, height) {
        if (this.renderer) {
            this.renderer.resize(width, height);
        }
    }

    /**
     * Clean up and destroy engine
     */
    destroy() {
        this.stop();

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        this.balls = [];
        this.physics = null;
    }
}

// Export everything
export { Ball } from './entities/Ball.js';
export { PhysicsController } from './physics/PhysicsController.js';
export { SceneManager } from './renderer/SceneManager.js';
export { Vector2 } from './physics/Vector2.js';
export { Edge } from './physics/Edge.js';
export * as MathUtils from './physics/MathUtils.js';
export * as Constants from './constants.js';

export default PoolEngine;

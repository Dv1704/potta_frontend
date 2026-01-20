/**
 * Physics Controller - Core physics simulation
 * Ported from game_engine CPhysicsController.js
 */
import { Vector2 } from './Vector2.js';
import { Edge } from './Edge.js';
import * as MathUtils from './MathUtils.js';
import * as Constants from '../constants.js';

export class PhysicsController {
    constructor() {
        this.balls = [];
        this.allBallsStopped = true;

        // Event callbacks
        this.callbacks = {
            [Constants.ON_BALL_INTO_HOLE]: null,
            [Constants.ON_BALL_WITH_BALL]: null,
            [Constants.ON_BALL_WITH_BANK]: null,
            [Constants.ON_BALLS_STOPPED]: null
        };

        // Initialize collision geometry
        this._initCollisions();
    }

    /**
     * Initialize table edge collision geometry
     */
    _initCollisions() {
        // Create edges from field points
        this.fieldEdges = [];
        const points = Constants.FIELD_POINTS;

        for (let i = 0; i < points.length - 1; i++) {
            const edge = new Edge(
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y,
                i
            );
            this.fieldEdges.push(edge);
        }

        // Close the loop - connect last point to first
        const lastEdge = new Edge(
            points[points.length - 1].x, points[points.length - 1].y,
            points[0].x, points[0].y,
            points.length - 1
        );
        this.fieldEdges.push(lastEdge);

        // Organize edges by quadrant for optimization
        this._initQuadrantEdges();

        // Initialize hole detection
        this._initHoles();

        // Calculate point normals for corner bouncing
        this._initPointNormals();
    }

    /**
     * Organize edges into quadrants for faster collision detection
     */
    _initQuadrantEdges() {
        const fe = this.fieldEdges;

        this.edgesTopLeft = [fe[21], fe[22], fe[23], fe[0], fe[1], fe[2], fe[3], fe[4]];
        this.edgesTopRight = [fe[3], fe[4], fe[5], fe[6], fe[7], fe[8], fe[9]];
        this.edgesBottomRight = [fe[9], fe[10], fe[11], fe[12], fe[13], fe[14], fe[15], fe[16]];
        this.edgesBottomLeft = [fe[15], fe[16], fe[17], fe[18], fe[19], fe[20], fe[21]];

        // Edges near holes
        this.holeEdges = [
            fe[0], fe[2], fe[3], fe[4],
            fe[8], fe[7], fe[6],
            fe[10], fe[11], fe[12], fe[14], fe[15], fe[16],
            fe[18], fe[19], fe[20], fe[22], fe[23]
        ];
    }

    /**
     * Initialize hole positions
     */
    _initHoles() {
        this.holes = Constants.HOLE_CENTER_POS.map(pos =>
            new Vector2(pos.x, pos.y)
        );

        // Holes by quadrant
        this.holesTopLeft = [this.holes[0], this.holes[1]];
        this.holesTopRight = [this.holes[1], this.holes[2]];
        this.holesBottomRight = [this.holes[3], this.holes[4]];
        this.holesBottomLeft = [this.holes[4], this.holes[5]];
    }

    /**
     * Calculate normals for corner points (for ball-corner bouncing)
     */
    _initPointNormals() {
        const fe = this.fieldEdges;
        const points = Constants.FIELD_POINTS;

        this.pointsNormals = [];

        // First point: average of last and first edge normals
        const firstNormal = new Vector2(
            (fe[0].getNormal().x + fe[23].getNormal().x) / 2,
            (fe[0].getNormal().y + fe[23].getNormal().y) / 2
        );
        firstNormal.normalize();
        this.pointsNormals.push({
            point: new Vector2(points[0].x, points[0].y),
            normal: firstNormal
        });

        // Remaining points: average of adjacent edges
        for (let i = 0; i < 23; i++) {
            const normal = new Vector2(
                (fe[i].getNormal().x + fe[i + 1].getNormal().x) / 2,
                (fe[i].getNormal().y + fe[i + 1].getNormal().y) / 2
            );
            normal.normalize();
            this.pointsNormals.push({
                point: new Vector2(points[i + 1].x, points[i + 1].y),
                normal: normal
            });
        }

        // Organize by quadrant
        this.pointsNormalsTopLeft = [
            this.pointsNormals[1], this.pointsNormals[2],
            this.pointsNormals[5], this.pointsNormals[21]
        ];
        this.pointsNormalsTopRight = [
            this.pointsNormals[2], this.pointsNormals[5],
            this.pointsNormals[6], this.pointsNormals[9]
        ];
        this.pointsNormalsBottomRight = [
            this.pointsNormals[10], this.pointsNormals[13],
            this.pointsNormals[14], this.pointsNormals[17]
        ];
        this.pointsNormalsBottomLeft = [
            this.pointsNormals[14], this.pointsNormals[17],
            this.pointsNormals[18], this.pointsNormals[21]
        ];
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback, owner = null) {
        this.callbacks[event] = { callback, owner };
    }

    /**
     * Trigger event
     */
    _triggerEvent(event, ...args) {
        const cb = this.callbacks[event];
        if (cb && cb.callback) {
            cb.callback.apply(cb.owner, args);
        }
    }

    /**
     * Determine which quadrant a ball is in (0=TL, 1=TR, 2=BR, 3=BL)
     */
    _chooseQuadrant(ball) {
        const x = ball.getX();
        const y = ball.getY();

        if (x < Constants.TABLE_CENTER.x) {
            return y < Constants.TABLE_CENTER.y ? 0 : 3;
        } else {
            return y < Constants.TABLE_CENTER.y ? 1 : 2;
        }
    }

    /**
     * Check if position is within the playable table area
     */
    verifyCollisionBallWithRectArea(pos) {
        const rect = Constants.RECT_COLLISION;
        return pos.x >= rect.x && pos.x <= rect.right &&
            pos.y >= rect.y && pos.y <= rect.bottom;
    }

    /**
     * Check if ball collides with any hole
     */
    collideBallWithHoles(ball, holes) {
        for (const hole of holes) {
            const dist = MathUtils.distance(ball.getPos(), hole);
            if (dist < Constants.POOL_HOLE_RADIUS + 5) { // Slightly larger pocket detection
                this._triggerEvent(Constants.ON_BALL_INTO_HOLE, ball, hole);
                return hole;
            }
        }
        return null;
    }

    /**
     * Handle ball-to-ball collision
     */
    collideBallWithBalls(ball) {
        if (ball.getHole() !== null) return false;

        let minDist = Infinity;
        let closestCollision = null;

        for (const other of this.balls) {
            if (other.getNumber() === ball.getNumber()) continue;
            if (!other.isBallOnTable() || other.getHole() !== null) continue;

            const dist2 = MathUtils.distance2(ball.getPos(), other.getPos());

            if (dist2 <= Constants.BALL_DIAMETER_SQUARED) {
                if (dist2 < minDist) {
                    minDist = dist2;
                    closestCollision = other;
                }
            }
        }

        if (!closestCollision) return false;

        // Calculate collision response
        const rayCollision = ball.getPos().clone().subtract(closestCollision.getPos());
        rayCollision.normalize();

        // Separate balls
        const separationPos = rayCollision.clone()
            .scalarProduct(Constants.BALL_DIAMETER * 1.05)
            .add(closestCollision.getPos());
        ball.setPosV(separationPos);

        // Calculate angle and force transfer
        const dirInvert = ball.getCurForce().clone().invert().normalize();
        const angle = MathUtils.angleBetweenVectors(dirInvert, rayCollision);
        const forceTransfer = angle / MathUtils.HALF_PI;

        const curForce = ball.getCurForceLen();
        const impactForce = curForce * Constants.K_IMPACT_BALL;

        // Reflect ball direction
        // We reflect the CUE BALL velocity over the collision normal (rayCollision)
        rayCollision.normalize();
        const reflected = MathUtils.reflectVector(ball.getCurForce().clone(), rayCollision);

        // Apply backspin if cue ball
        let cueFinalForce;
        if (ball.getNumber() === 0) {
            cueFinalForce = this._addBackSpinEffect(ball, ball.getEffectForceVector().y, rayCollision, dirInvert);
            ball.setCurForceV(reflected);
            ball.normalizeCurForce();
            ball.scalarProductCurForce(cueFinalForce);
        } else {
            cueFinalForce = impactForce;
            ball.setCurForceV(reflected);
            ball.normalizeCurForce();
            ball.scalarProductCurForce((cueFinalForce * 0.8) * forceTransfer + (cueFinalForce * 0.15));
        }

        // Transfer force to other ball - based on IMPACT force, not spin-adjusted force
        rayCollision.invert().normalize().scalarProduct(impactForce * (1 - forceTransfer) + (impactForce * 0.2));
        closestCollision.addForce(rayCollision);

        this._triggerEvent(Constants.ON_BALL_WITH_BALL, ball, closestCollision, impactForce);

        return true;
    }

    /**
     * Collision with corner points
     */
    collideBallWithPointsNormals(ball, pos, pointsNormals) {
        for (const pn of pointsNormals) {
            if (MathUtils.distance2(pn.point, pos) <= Constants.BALL_RADIUS_SQUARED) {
                const curForce = ball.getCurForceLen();
                ball.setCurForceV(pn.normal.clone());
                ball.scalarProductCurForce(curForce);

                if (ball.getHole() !== null) {
                    this._triggerEvent(Constants.ON_BALL_WITH_BANK, ball);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Ball collision with edges (cushions)
     */
    collideBallWithEdges(ball, edges, pointsNormals) {
        const dir = ball.getCurForce().clone().normalize();
        const curForce = ball.getCurForceLen();

        if (curForce === 0) return false;

        const stepSize = 0.2;
        const steps = Math.floor(curForce / stepSize);
        const pos = ball.getPrevPos().clone();

        dir.normalize().scalarProduct(stepSize);

        for (let k = 0; k <= steps; k++) {
            if (k === steps) {
                // Final step with remaining distance
                dir.normalize().scalarProduct(curForce - steps * stepSize);
            }
            pos.add(dir);

            // Check if outside playable area
            if (!this.verifyCollisionBallWithRectArea(pos)) {
                // Check corner collision first
                if (this.collideBallWithPointsNormals(ball, pos, pointsNormals)) {
                    pos.subtract(dir);
                    ball.setPosV(pos);
                    return true;
                }

                // Check edge collision
                for (const edge of edges) {
                    if (MathUtils.collideEdgeWithCircle(edge, pos, Constants.BALL_RADIUS)) {
                        pos.subtract(dir);

                        // Reflect velocity off edge
                        const reflected = MathUtils.reflectVector(ball.getCurForce(), edge.getNormal());
                        reflected.scalarProduct(Constants.K_IMPACT_BANK); // Energy loss on cushion hit

                        // Apply side spin if cue ball
                        if (ball.getNumber() === 0) {
                            this._addSideSpinEffect(reflected, 1, edge.calculateEdgeVector(), ball);
                        }

                        ball.setCurForceV(reflected);
                        ball.setPosV(pos);

                        this._triggerEvent(Constants.ON_BALL_WITH_BANK, ball, edge);
                        ball.increaseEdgeCollisionCount();

                        return true;
                    }
                }
            }

            ball.setPosV(pos);

            // Check ball-ball collision during movement
            // IMPORTANT: If we detect a collision, we stop sub-stepping for this frame
            // to prevent multiple collisions in one frame which causes tunneling
            if (this.collideBallWithBalls(ball)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Apply side spin effect on cushion bounce
     */
    _addSideSpinEffect(reflectedDir, ratio, edgeVector, ball) {
        const sideEffect = ball.getSideEffect();
        if (sideEffect === 0) return;

        ball.setSideEffect(sideEffect * 0.25);

        const factor = sideEffect / Constants.MAX_SPIN_VALUE;
        const ballForce = ball.getCurForceLen();
        const forceRatio = MathUtils.linearFunction(
            ballForce,
            Constants.MAX_POWER_FORCE_BALL, 0,
            0.4, 0.7
        );

        const rotatedDir = reflectedDir.clone();
        MathUtils.rotateVector2D(MathUtils.toRadian(factor * (ratio - forceRatio)), rotatedDir);
        reflectedDir.setV(rotatedDir);
    }

    /**
     * Apply back spin effect on ball-ball collision
     */
    _addBackSpinEffect(ball, backSpinValue, rayCollision, dirInvert) {
        let newForce = ball.getCurForceLen();
        const tmpDir = ball.getCurForce().clone();

        if (backSpinValue === 0) {
            tmpDir.normalize();
            ball.setCurForceV(MathUtils.reflectVector(rayCollision, tmpDir));
        } else {
            const effectForce = MathUtils.linearFunction(
                backSpinValue,
                0, Constants.MAX_SPIN_VALUE,
                0, Constants.MAX_BACK_SPIN_CUE_FORCE
            );
            const forceRatio = ball.getCurForceLen() / Constants.MAX_POWER_FORCE_BALL;
            newForce = ball.getCurForceLen() + effectForce * forceRatio;

            if (backSpinValue < 0) {
                ball.setCurForceV(dirInvert);
            }
        }

        return newForce;
    }

    /**
     * Handle ball going into pocket
     */
    addBallToStack(ball, hole) {
        if (ball.getNumber() === 0) {
            // Cue ball - hide and respot later
            ball.setTmpForce(0, 0);
            ball.setCurForce(0, 0);
            ball.setFlagOnTable(false);
            ball.setVisible(false);
        } else {
            // Object ball - animate into pocket
            ball.setInHole(hole);
            ball.setScale(0.9);
            ball.scalarProductTmpForce(0.9);
        }
    }

    /**
     * Check if all balls have stopped moving
     */
    areBallsStopped() {
        return this.allBallsStopped;
    }

    /**
     * Main physics update loop - call every frame
     */
    update(balls) {
        this.balls = balls;
        this.allBallsStopped = true;

        // Apply accumulated forces first
        for (const ball of balls) {
            ball.addCurForce(ball.getTmpForce());
            ball.setTmpForce(0, 0);
            ball.setPrevPos(ball.getPos());
        }

        for (const ball of balls) {
            if (!ball.isBallOnTable()) {
                ball.addPos(ball.getCurForce());
                continue;
            }

            // Determine quadrant for optimized collision detection
            const quadrant = this._chooseQuadrant(ball);
            let holes, edges, pointsNormals;

            switch (quadrant) {
                case 0: // Top-left
                    holes = this.holesTopLeft;
                    edges = this.edgesTopLeft;
                    pointsNormals = this.pointsNormalsTopLeft;
                    break;
                case 1: // Top-right
                    holes = this.holesTopRight;
                    edges = this.edgesTopRight;
                    pointsNormals = this.pointsNormalsTopRight;
                    break;
                case 2: // Bottom-right
                    holes = this.holesBottomRight;
                    edges = this.edgesBottomRight;
                    pointsNormals = this.pointsNormalsBottomRight;
                    break;
                case 3: // Bottom-left
                    holes = this.holesBottomLeft;
                    edges = this.edgesBottomLeft;
                    pointsNormals = this.pointsNormalsBottomLeft;
                    break;
            }

            if (ball.getHole() === null) {
                // Check pocket collision
                const hole = this.collideBallWithHoles(ball, holes);
                if (hole) {
                    this.addBallToStack(ball, hole);

                    // Move ball toward hole center
                    const dirToHole = new Vector2(
                        hole.x - ball.getX(),
                        hole.y - ball.getY()
                    );
                    dirToHole.normalize();
                    for (let i = 0; i < 5; i++) {
                        ball.addPos(dirToHole);
                    }
                } else {
                    // Check edge collision
                    this.collideBallWithEdges(ball, edges, pointsNormals);
                }
            } else {
                // Ball is in a hole - use hole edges
                this.collideBallWithEdges(ball, this.holeEdges, pointsNormals);
            }

            // Apply friction
            ball.scalarProductCurForce(Constants.K_FRICTION);

            // Check if stopped
            if (ball.getCurForceLength2() < Constants.K_MIN_FORCE) {
                ball.setCurForce(0, 0);
            }
            else if (ball.isBallOnTable()) {
                this.allBallsStopped = false;
            }
        }

        // Trigger stopped event when all balls stop
        if (this.allBallsStopped && this._wasMoving) {
            this._triggerEvent(Constants.ON_BALLS_STOPPED);
        }
        this._wasMoving = !this.allBallsStopped;
    }

    /**
     * Get edges for a specific pocket
     */
    getEdgesByHoleID(holeID) {
        switch (holeID) {
            case 0: return this.edgesTopLeft;
            case 1: return [this.fieldEdges[1], this.fieldEdges[5]];
            case 2: return this.edgesTopRight;
            case 3: return this.edgesBottomRight;
            case 4: return [this.fieldEdges[13], this.fieldEdges[17]];
            case 5: return this.edgesBottomLeft;
            default: return [];
        }
    }
}

export default PhysicsController;

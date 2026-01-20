/**
 * Ball entity for physics simulation
 * Ported from game_engine CBall.js (state only, rendering separate)
 */
import { Vector2 } from '../physics/Vector2.js';
import * as Constants from '../constants.js';

export class Ball {
    constructor(number) {
        this.number = number;
        this.radius = Constants.BALL_RADIUS - 0.5;

        // Position and movement
        this.position = new Vector2(0, 0);
        this.prevPosition = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);      // Current force/velocity
        this.tmpForce = new Vector2(0, 0);       // Accumulated force (applied next frame)

        // Spin/effect forces
        this.effectForce = new Vector2(0, 0);
        this.sideEffectForce = 0;

        // State flags
        this.onTable = false;
        this.isDragging = false;
        this.inHole = null;
        this.edgeCollisionCount = 0;

        // For 3D rendering
        this.mesh3D = null;
        this.visible = true;
        this.scale = 1;
    }

    // Position methods
    setPos(x, y) {
        this.position.set(x, y);
    }

    setPosV(v) {
        this.position.setV(v);
    }

    getPos() {
        return this.position;
    }

    getX() {
        return this.position.x;
    }

    getY() {
        return this.position.y;
    }

    setX(x) {
        this.position.x = x;
    }

    setY(y) {
        this.position.y = y;
    }

    addPos(v) {
        this.position.add(v);
    }

    // Previous position (for collision resolution)
    setPrevPos(v) {
        this.prevPosition.setV(v);
    }

    getPrevPos() {
        return this.prevPosition;
    }

    // Force/velocity methods
    setCurForce(x, y) {
        this.velocity.set(x, y);
    }

    setCurForceV(v) {
        this.velocity.setV(v);
    }

    getCurForce() {
        return this.velocity;
    }

    getCurForceLen() {
        return this.velocity.length();
    }

    getCurForceLength2() {
        return this.velocity.length2();
    }

    addCurForce(v) {
        this.velocity.add(v);
    }

    normalizeCurForce() {
        this.velocity.normalize();
    }

    scalarProductCurForce(value) {
        this.velocity.scalarProduct(value);
    }

    // Temporary force (accumulated, applied next frame)
    setTmpForce(x, y) {
        this.tmpForce.set(x, y);
    }

    getTmpForce() {
        return this.tmpForce;
    }

    addForce(v) {
        this.tmpForce.add(v);
    }

    scalarProductTmpForce(value) {
        this.tmpForce.scalarProduct(value);
    }

    // Effect forces (spin)
    getEffectForceVector() {
        return this.effectForce;
    }

    setEffectForceX(x) {
        this.effectForce.x = x;
    }

    setEffectForceY(y) {
        this.effectForce.y = y;
    }

    getSideEffect() {
        return this.sideEffectForce;
    }

    setSideEffect(value) {
        this.sideEffectForce = value;
    }

    // State methods
    getNumber() {
        return this.number;
    }

    setFlagOnTable(value) {
        this.onTable = value;
    }

    isBallOnTable() {
        return this.onTable;
    }

    setDragging(value) {
        this.isDragging = value;
    }

    getIsDragging() {
        return this.isDragging;
    }

    setInHole(hole) {
        this.inHole = hole;
    }

    getHole() {
        return this.inHole;
    }

    setVisible(value) {
        this.visible = value;
    }

    isVisible() {
        return this.visible;
    }

    setScale(value) {
        this.scale = value;
    }

    getScale() {
        return this.scale;
    }

    // Edge collision tracking
    resetEdgeCollisionCount() {
        this.edgeCollisionCount = 0;
    }

    increaseEdgeCollisionCount() {
        this.edgeCollisionCount++;
    }

    getEdgeCollisionCount() {
        return this.edgeCollisionCount;
    }

    // 3D mesh reference
    setMesh3D(mesh) {
        this.mesh3D = mesh;
    }

    getMesh3D() {
        return this.mesh3D;
    }

    /**
     * Reset ball to initial state
     */
    reset() {
        this.velocity.set(0, 0);
        this.tmpForce.set(0, 0);
        this.effectForce.set(0, 0);
        this.sideEffectForce = 0;
        this.inHole = null;
        this.edgeCollisionCount = 0;
        this.scale = 1;
        this.visible = true;
    }

    /**
     * Serialize ball state for network sync
     */
    serialize() {
        return {
            number: this.number,
            x: this.position.x,
            y: this.position.y,
            vx: this.velocity.x,
            vy: this.velocity.y,
            onTable: this.onTable,
            inHole: this.inHole ? this.inHole.id : null
        };
    }

    /**
     * Deserialize ball state from network
     */
    deserialize(data) {
        this.position.set(data.x, data.y);
        this.velocity.set(data.vx || 0, data.vy || 0);
        this.onTable = data.onTable;
        // inHole handled separately
    }

    /**
     * Check if ball has stopped moving
     */
    isStopped() {
        return this.velocity.length2() < Constants.K_MIN_FORCE;
    }

    /**
     * Apply friction to slow ball down
     */
    applyFriction() {
        this.velocity.scalarProduct(Constants.K_FRICTION);

        // Stop completely if below threshold
        if (this.velocity.length2() < Constants.K_MIN_FORCE) {
            this.velocity.set(0, 0);
        }
    }

    // Getters/Setters
    getNumber() {
        return this.number;
    }

    isVisible() {
        return this.visible;
    }

    setVisible(v) {
        this.visible = v;
    }

    setFlagOnTable(v) {
        this.onTable = v;
    }

    isBallOnTable() {
        return this.onTable;
    }

    setHole(hole) {
        this.inHole = hole;
    }

    getHole() {
        return this.inHole;
    }
}

export default Ball;

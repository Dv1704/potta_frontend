/**
 * Edge class for collision detection
 * Ported from game_engine CEdge.js
 */
import { Vector2 } from './Vector2.js';

export class Edge {
    constructor(x1, y1, x2, y2, id = 0) {
        this.id = id;
        this.pointA = new Vector2(x1, y1);
        this.pointB = new Vector2(x2, y2);

        // Calculate edge vector and normal
        this._edgeVector = new Vector2(x2 - x1, y2 - y1);
        this._normal = this._calculateNormal();
    }

    _calculateNormal() {
        // Get perpendicular vector (rotated 90° counter-clockwise)
        const normal = new Vector2(-this._edgeVector.y, this._edgeVector.x);
        normal.normalize();
        return normal;
    }

    getPointA() {
        return this.pointA;
    }

    getPointB() {
        return this.pointB;
    }

    getNormal() {
        return this._normal;
    }

    calculateEdgeVector() {
        return this._edgeVector.clone().normalize();
    }

    getLength() {
        return this._edgeVector.length();
    }

    getId() {
        return this.id;
    }

    /**
     * Check if a point is on this edge
     */
    containsPoint(point, tolerance = 0.001) {
        const d1 = new Vector2(point.x - this.pointA.x, point.y - this.pointA.y);
        const d2 = new Vector2(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);

        const cross = d1.x * d2.y - d1.y * d2.x;
        if (Math.abs(cross) > tolerance) return false;

        const dot = d1.x * d2.x + d1.y * d2.y;
        const len2 = d2.x * d2.x + d2.y * d2.y;

        return dot >= 0 && dot <= len2;
    }

    /**
     * Get the closest point on this edge to a given point
     */
    closestPointTo(point) {
        const v = new Vector2(
            this.pointB.x - this.pointA.x,
            this.pointB.y - this.pointA.y
        );
        const w = new Vector2(
            point.x - this.pointA.x,
            point.y - this.pointA.y
        );

        const c1 = w.x * v.x + w.y * v.y;
        if (c1 <= 0) return this.pointA.clone();

        const c2 = v.x * v.x + v.y * v.y;
        if (c2 <= c1) return this.pointB.clone();

        const t = c1 / c2;
        return new Vector2(
            this.pointA.x + t * v.x,
            this.pointA.y + t * v.y
        );
    }

    /**
     * Get the distance from a point to this edge
     */
    distanceToPoint(point) {
        const closest = this.closestPointTo(point);
        const dx = point.x - closest.x;
        const dy = point.y - closest.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export default Edge;

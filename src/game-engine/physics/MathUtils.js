/**
 * Physics and collision math utilities
 * Ported from game_engine CMath.js
 */
import { Vector2 } from './Vector2.js';

// Constants
export const DOUBLE_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;

/**
 * Calculate angle between two vectors
 */
export function angleBetweenVectors(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const lenProduct = v1.length() * v2.length();
    if (lenProduct === 0) return 0;
    const angle = Math.acos(dot / lenProduct);
    return isNaN(angle) ? 0 : angle;
}

/**
 * Get center point between two vectors
 */
export function centerBetweenPoints(v1, v2) {
    return new Vector2(
        (v1.x + v2.x) / 2,
        (v1.y + v2.y) / 2
    );
}

/**
 * Squared distance between two points (faster than distance)
 */
export function distance2(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return dx * dx + dy * dy;
}

/**
 * Distance between two points
 */
export function distance(v1, v2) {
    return Math.sqrt(distance2(v1, v2));
}

/**
 * Dot product of two vectors
 */
export function dotProductV2(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Perpendicular (cross) product of two vectors
 */
export function perpProductV2(u, v) {
    return u.x * v.y - u.y * v.x;
}

/**
 * Reflect vector v over normal n
 */
export function reflectVector(v, n) {
    const dotP = dotProductV2(v, n);
    return new Vector2(
        v.x - 2 * dotP * n.x,
        v.y - 2 * dotP * n.y
    );
}

/**
 * Rotate a vector by angle (in radians)
 */
export function rotateVector2D(angle, v) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = v.x * cos + v.y * sin;
    const newY = v.x * (-sin) + v.y * cos;
    v.x = newX;
    v.y = newY;
}

/**
 * Convert degrees to radians
 */
export function toRadian(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegree(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Alias for toDegree (compatibility)
 */
export function radiantsToDegrees(radians) {
    return toDegree(radians);
}

/**
 * Find the plane distance for collision detection
 */
export function planeDistance(vNormal, vPoint) {
    return -(vNormal.x * vPoint.x + vNormal.y * vPoint.y);
}

/**
 * Classify sphere position relative to plane
 */
export function classifySphere(vCenter, vNormal, vPoint, iRadius) {
    const iDistance = vNormal.x * vCenter.x + vNormal.y * vCenter.y + planeDistance(vNormal, vPoint);

    if (Math.abs(iDistance) < iRadius) {
        return iDistance >= 0 ? 'INTERSECT_FRONT' : 'INTERSECT_BEHIND';
    } else if (iDistance >= iRadius) {
        return 'FRONT';
    }
    return 'BEHIND';
}

/**
 * Generate random integer in range [min, max]
 */
export function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float in range [min, max]
 */
export function randRangeReal(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Find closest point on line segment to a given point
 */
export function closestPointOnLine(vA, vB, vPoint) {
    const v1 = vPoint.clone().subtract(vA);
    const v2 = vB.clone().subtract(vA);
    v2.normalize();

    const t = dotProductV2(v2, v1);

    if (t <= 0) return vA.clone();

    const lineLength = distance(vA, vB);
    if (t >= lineLength) return vB.clone();

    return v2.scalarProduct(t).add(vA);
}

/**
 * Check if circle collides with edge (line segment)
 */
export function collideEdgeWithCircle(edge, center, radius, objData = null) {
    const closestPt = closestPointOnLine(edge.pointA, edge.pointB, center);
    const dist = distance(center, closestPt);

    if (objData) {
        objData.distance = dist;
        objData.closestPoint = closestPt;
    }

    return dist <= radius;
}

/**
 * Check if two edges (line segments) intersect
 */
export function collideEdgeWithEdge(edge1, edge2, outPoint = null) {
    const pA = edge1.pointA;
    const pB = edge1.pointB;
    const pC = edge2.pointA;
    const pD = edge2.pointB;

    const denom = pA.x * (pD.y - pC.y) +
        pB.x * (pC.y - pD.y) +
        pD.x * (pB.y - pA.y) +
        pC.x * (pA.y - pB.y);

    if (denom === 0) return false;

    const numS = pA.x * (pD.y - pC.y) +
        pC.x * (pA.y - pD.y) +
        pD.x * (pC.y - pA.y);
    const s = numS / denom;

    const numT = -(pA.x * (pC.y - pB.y) +
        pB.x * (pA.y - pC.y) +
        pC.x * (pB.y - pA.y));
    const t = numT / denom;

    if (outPoint) {
        outPoint.set(
            pA.x + s * (pB.x - pA.x),
            pA.y + s * (pB.y - pA.y)
        );
    }

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a, b, t) {
    return a + t * (b - a);
}

/**
 * Linear function mapping (like linearFunction in original)
 * Maps value from range [inMin, inMax] to [outMin, outMax]
 */
export function linearFunction(value, inMin, inMax, outMin, outMax) {
    const t = (value - inMin) / (inMax - inMin);
    return outMin + t * (outMax - outMin);
}

/**
 * Interpolate between two vectors
 */
export function tweenVectors(vStart, vEnd, t) {
    return new Vector2(
        vStart.x + t * (vEnd.x - vStart.x),
        vStart.y + t * (vEnd.y - vStart.y)
    );
}

/**
 * Check point collision with circle
 */
export function detectCollisionPointCircle(point1, point2, radius) {
    return distance(point1, point2) <= radius;
}

// Easing functions
export function easeQuintIn(t, b, c, d) {
    t /= d;
    return c * t * t * t * t * t + b;
}

export function easeCubicInOut(t, b, c, d) {
    if (t > d) return b + c;
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
}

export function easeBackIn(t, b, c, d, s = 1.70158) {
    t /= d;
    return c * t * t * ((s + 1) * t - s) + b;
}

export function easeElasticIn(t, b, c, d, a, p) {
    if (t === 0) return b;
    t /= d;
    if (t === 1) return b + c;
    if (!p) p = d * 0.3;

    let s;
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = p / DOUBLE_PI * Math.asin(c / a);
    }

    t -= 1;
    return -(a * Math.pow(2, 10 * t) * Math.sin((t * d - s) * DOUBLE_PI / p)) + b;
}

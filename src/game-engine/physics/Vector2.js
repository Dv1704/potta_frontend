/**
 * 2D Vector class for physics calculations
 * Ported from game_engine CVector2.js
 */
export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scalarProduct(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    scalarDivision(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    invert() {
        this.x *= -1;
        this.y *= -1;
        return this;
    }

    dotProduct(v) {
        return this.x * v.x + this.y * v.y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    setV(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    length2() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    getNormalized() {
        const result = new Vector2(this.x, this.y);
        return result.normalize();
    }

    angleBetween(v2) {
        const dot = this.dotProduct(v2);
        const lenProduct = this.length() * v2.length();
        if (lenProduct === 0) return 0;
        const angle = Math.acos(dot / lenProduct);
        return isNaN(angle) ? 0 : angle;
    }

    rot90CCW() {
        const temp = this.x;
        this.x = -this.y;
        this.y = temp;
        return this;
    }

    rot90CW() {
        const temp = this.x;
        this.x = this.y;
        this.y = -temp;
        return this;
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos + this.y * sin;
        const newY = this.x * (-sin) + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // Getters for compatibility with original CVector2 interface
    getX() { return this.x; }
    getY() { return this.y; }
}

export default Vector2;

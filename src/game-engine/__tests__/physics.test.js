import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsController } from '../physics/PhysicsController.js';
import { Ball } from '../entities/Ball.js';
import { Vector2 } from '../physics/Vector2.js';
import * as Constants from '../constants.js';

describe('Pool Physics Engine', () => {
    let physics;

    beforeEach(() => {
        physics = new PhysicsController();
    });

    it('should handle ball-to-ball collision response', () => {
        const ball1 = new Ball(0);
        const ball2 = new Ball(1);
        ball1.setFlagOnTable(true);
        ball2.setFlagOnTable(true);
        // Place in center of table to avoid rail interference
        ball1.setPos(500, 350);
        ball2.setPos(500 + Constants.BALL_DIAMETER - 2, 350);
        ball1.setCurForce(10, 0);

        physics.update([ball1, ball2]);
        expect(ball2.getTmpForce().x).toBeGreaterThan(0);

        physics.update([ball1, ball2]);
        expect(ball2.getCurForceLength2()).toBeGreaterThan(0);
    });

    it('should detect balls in holes', () => {
        const ball = new Ball(1);
        const hole = Constants.HOLE_CENTER_POS[0];
        ball.setFlagOnTable(true);
        ball.setPos(hole.x, hole.y);
        ball.setCurForce(1, 1);

        let ballPotted = false;
        physics.addEventListener(Constants.ON_BALL_INTO_HOLE, () => ballPotted = true);

        physics.update([ball]);
        expect(ballPotted).toBe(true);
        expect(ball.getHole()).not.toBe(null);
    });
});

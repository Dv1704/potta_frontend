import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsController } from '../physics/PhysicsController.js';
import { Ball } from '../entities/Ball.js';
import { Vector2 } from '../physics/Vector2.js';
import * as Constants from '../constants.js';

describe('Pool Physics Engine - Deep Tests', () => {
    let physics;

    beforeEach(() => {
        physics = new PhysicsController();
    });

    describe('1. Cushion Bounce', () => {
        it('should reflect at correct angle', () => {
            const ball = new Ball(1);
            ball.setFlagOnTable(true);
            ball.setPos(1185, Constants.TABLE_CENTER.y);
            ball.setCurForce(20, 0);
            physics.update([ball]);
            expect(ball.getCurForce().x).toBeLessThan(0);
        });
    });

    describe('2. Collision', () => {
        it('should transfer force', () => {
            const cueBall = new Ball(0);
            const objBall = new Ball(1);
            cueBall.setFlagOnTable(true);
            objBall.setFlagOnTable(true);
            cueBall.setPos(400, 400);
            objBall.setPos(410, 400); // Decisive overlap
            cueBall.setCurForce(10, 0);
            physics.update([cueBall, objBall]);
            expect(objBall.getTmpForce().x).toBeGreaterThan(0);
        });
    });

    describe('6. Spin Mechanics', () => {
        it('should apply backspin', () => {
            const cueBall = new Ball(0);
            const objBall = new Ball(1);
            cueBall.setFlagOnTable(true);
            objBall.setFlagOnTable(true);
            cueBall.setPos(400, 400);
            objBall.setPos(430, 400);
            cueBall.setCurForce(20, 0);
            cueBall.setEffectForceY(-50);
            physics.update([cueBall, objBall]);
            expect(cueBall.getCurForce().x).toBeLessThan(0);
        });
    });
});

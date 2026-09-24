'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { easeInOut, pickWanderTarget, createWanderController } = require('../src/desk/windowMotion');

test('wander easing starts and ends without a jump', () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(easeInOut(0.5), 0.5);
  assert.ok(easeInOut(0.1) < 0.1);
  assert.ok(easeInOut(0.9) > 0.9);
});

test('wander targets stay inside the current display work area', () => {
  const bounds = { x: 1300, y: 700, width: 260, height: 300 };
  const workArea = { x: 1000, y: 200, width: 600, height: 700 };
  assert.deepEqual(pickWanderTarget(bounds, workArea, () => 1), { x: 1340, y: 600 });
  assert.deepEqual(pickWanderTarget(bounds, workArea, () => 0), { x: 1120, y: 520 });
});

test('wander moves in small steps and pauses at the current position', async (t) => {
  const bounds = { x: 100, y: 100, width: 260, height: 300 };
  let moves = 0;
  const win = {
    isDestroyed: () => false,
    isVisible: () => true,
    isFocused: () => false,
    getBounds: () => ({ ...bounds }),
    setPosition(x, y) { bounds.x = x; bounds.y = y; moves += 1; },
  };
  const controller = createWanderController(
    win, () => ({ x: 0, y: 0, width: 1000, height: 800 }), () => {}, () => 1,
  );
  t.after(() => controller.stop());
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 2600));
  assert.ok(moves > 2);
  assert.ok(bounds.x > 100 && bounds.x < 280);
  assert.ok(bounds.y > 100 && bounds.y < 280);
  controller.pause();
  const paused = { ...bounds };
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepEqual(bounds, paused);
});

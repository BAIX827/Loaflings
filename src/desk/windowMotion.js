'use strict';

const TRAVEL_RADIUS = 180;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOut(progress) {
  const t = clamp(progress, 0, 1);
  return t * t * (3 - 2 * t);
}

function pickWanderTarget(bounds, workArea, random = Math.random) {
  const maxX = Math.max(workArea.x, workArea.x + workArea.width - bounds.width);
  const maxY = Math.max(workArea.y, workArea.y + workArea.height - bounds.height);
  return {
    x: Math.round(clamp(bounds.x + (random() * 2 - 1) * TRAVEL_RADIUS, workArea.x, maxX)),
    y: Math.round(clamp(bounds.y + (random() * 2 - 1) * TRAVEL_RADIUS, workArea.y, maxY)),
  };
}

function createWanderController(win, getWorkArea, onSettled, random = Math.random) {
  let timeout = null;
  let interval = null;
  let moving = false;
  let active = false;

  function clearTimers() {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
    timeout = null;
    interval = null;
  }

  function schedule(delay = 2500) {
    clearTimers();
    if (!active || win.isDestroyed()) return;
    timeout = setTimeout(beginLeg, delay);
  }

  function beginLeg() {
    timeout = null;
    if (!active || win.isDestroyed()) return;
    if (!win.isVisible() || win.isFocused()) {
      schedule(1500);
      return;
    }
    const bounds = win.getBounds();
    const target = pickWanderTarget(bounds, getWorkArea(bounds), random);
    if (target.x === bounds.x && target.y === bounds.y) {
      schedule(1500);
      return;
    }
    const started = Date.now();
    const duration = 3000 + Math.round(Math.random() * 1500);
    moving = true;
    interval = setInterval(() => {
      if (!active || win.isDestroyed() || win.isFocused()) {
        pause();
        return;
      }
      const progress = Math.min(1, (Date.now() - started) / duration);
      const eased = easeInOut(progress);
      win.setPosition(
        Math.round(bounds.x + (target.x - bounds.x) * eased),
        Math.round(bounds.y + (target.y - bounds.y) * eased),
      );
      if (progress >= 1) {
        moving = false;
        clearTimers();
        onSettled();
        schedule(3500 + Math.round(Math.random() * 3500));
      }
    }, 32);
  }

  function pause() {
    const wasMoving = moving;
    moving = false;
    clearTimers();
    if (wasMoving && !win.isDestroyed()) onSettled();
  }

  return {
    start() { active = true; schedule(1800); },
    pause,
    resume() { if (active) schedule(1200); },
    stop() { active = false; pause(); },
    isMoving() { return moving; },
  };
}

module.exports = { easeInOut, pickWanderTarget, createWanderController };

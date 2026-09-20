'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { LiveSensor } = require('../src/sense/liveSensor.js');

test('live sensor stays usable in idle-only mode without starting the native input hook', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-sense-'));
  const persistPath = path.join(directory, 'profile.json');
  const sensor = new LiveSensor({
    persistPath,
    seedKey: 'test',
    enableInputHook: false,
    powerMonitor: { getSystemIdleTime: () => 0 },
  });

  try {
    const started = await sensor.start();
    assert.equal(started.ok, true);
    assert.equal(started.backend, 'idle-only');
    assert.match(started.permissionHint, /Accessibility/);
    assert.equal(sensor.getStatus().running, true);
    assert.equal(sensor.getStatus().backend, 'idle-only');
  } finally {
    sensor.stop();
    if (fs.existsSync(persistPath)) fs.unlinkSync(persistPath);
    fs.rmdirSync(directory);
  }
});

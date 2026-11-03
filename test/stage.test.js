import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stage, createHotspots } from '../src/index.js';

test('stage: idle clips rotate in order and wrap', () => {
  const stage = new Stage({ idleClips: ['idle-a.mp4', 'idle-b.mp4'] });
  assert.equal(stage.currentClip(), 'idle-a.mp4');
  assert.equal(stage.advance(), 'idle-b.mp4');
  assert.equal(stage.advance(), 'idle-a.mp4');
});

test('stage: a reaction interrupts idle, plays once, then idle resumes where it left off', () => {
  const stage = new Stage({
    idleClips: ['idle-a.mp4', 'idle-b.mp4'],
    reactions: { wave: 'wave.mp4' },
  });
  stage.advance(); // now on idle-b
  assert.equal(stage.react('wave'), true);
  assert.equal(stage.currentClip(), 'wave.mp4');
  assert.equal(stage.advance(), 'idle-b.mp4');
  assert.equal(stage.mode, 'idle');
});

test('stage: unknown reactions are ignored; queued reactions play in order', () => {
  let t = 0;
  const stage = new Stage({
    idleClips: ['idle.mp4'],
    reactions: { wave: 'wave.mp4', laugh: 'laugh.mp4' },
    now: () => t,
  });
  assert.equal(stage.react('nope'), false);
  assert.equal(stage.currentClip(), 'idle.mp4');
  stage.react('wave');
  stage.react('laugh', { interrupt: false });
  assert.equal(stage.currentClip(), 'wave.mp4');
  assert.equal(stage.advance(), 'laugh.mp4');
  assert.equal(stage.advance(), 'idle.mp4');
});

test('stage: interrupt cooldown queues instead of strobing', () => {
  let t = 10000;
  const stage = new Stage({
    idleClips: ['idle.mp4'],
    reactions: { a: 'a.mp4', b: 'b.mp4' },
    interruptCooldownMs: 1500,
    now: () => t,
  });
  stage.react('a');
  t += 100; // frantic second click
  stage.react('b');
  assert.equal(stage.currentClip(), 'a.mp4');
  assert.equal(stage.advance(), 'b.mp4');
});

test('hotspots: hit testing respects bounds, z-order, and definition order', () => {
  const hotspots = createHotspots([
    { id: 'face', x: 0.4, y: 0.05, w: 0.2, h: 0.25, action: 'pat' },
    { id: 'body', x: 0.3, y: 0.2, w: 0.4, h: 0.7, action: 'poke', z: -1 },
    { id: 'hand', x: 0.6, y: 0.5, w: 0.1, h: 0.1, action: 'highfive' },
  ]);
  assert.equal(hotspots.hitTest(0.5, 0.1).action, 'pat');
  assert.equal(hotspots.hitTest(0.5, 0.6).action, 'poke');
  assert.equal(hotspots.hitTest(0.65, 0.55).action, 'highfive');
  assert.equal(hotspots.hitTest(0.05, 0.05), null);
});

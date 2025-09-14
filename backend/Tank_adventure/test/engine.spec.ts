import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine } from '../src/engine.js';

test('engine tick moves player', ()=>{
  const e = new Engine(10);
  e.join('m1','u1');
  e.input('m1','u1','ArrowRight', true);
  const before = e.snapshot('m1').players[0].x;
  e.stepAll();
  const after = e.snapshot('m1').players[0].x;
  assert.ok(after > before);
});

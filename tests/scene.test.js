'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Scene = require('../scene.js');

test('five independent text blocks can be selected, reordered and removed', () => {
  const scene = Scene.createScene();
  const items = Array.from({ length: 5 }, () => Scene.addText(scene));
  assert.equal(new Set(items.map((x) => x.id)).size, 5);
  items[0].text = 'Привет\nмир';
  scene.selectedId = items[0].id;
  assert.equal(Scene.selected(scene).text, 'Привет\nмир');
  assert.equal(Scene.moveLayer(scene, 'front'), true);
  assert.equal(scene.texts.at(-1).id, items[0].id);
  assert.equal(Scene.moveLayer(scene, 'back'), true);
  assert.equal(scene.texts[0].id, items[0].id);
  assert.equal(Scene.removeSelected(scene), true);
  assert.equal(scene.texts.length, 4);
  assert.ok(scene.texts.every((x) => x.id !== items[0].id));
});

test('history restores 20 operations and clears redo after a new change', () => {
  let scene = Scene.createScene();
  const image = { reference: 'image' };
  scene.image = image;
  const history = new Scene.History(scene);
  for (let i = 0; i < 20; i += 1) { Scene.addText(scene); history.record(scene); }
  assert.equal(scene.texts.length, 20);
  for (let i = 0; i < 20; i += 1) scene = history.undo();
  assert.equal(scene.texts.length, 0);
  assert.equal(scene.image, image);
  assert.equal(history.canUndo, false);
  for (let i = 0; i < 20; i += 1) scene = history.redo();
  assert.equal(scene.texts.length, 20);
  scene = history.undo();
  Scene.addText(scene); history.record(scene);
  assert.equal(history.canRedo, false);
  history.reset(Scene.createScene());
  assert.equal(history.canUndo, false);
});

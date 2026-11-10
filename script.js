'use strict';
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const sizeLabel = document.getElementById('canvas-size');
const backgroundInput = document.getElementById('background-color');
const message = document.getElementById('message');
let scene = MemeScene.createScene();
function render() {
  canvas.width = scene.width;
  canvas.height = scene.height;
  context.fillStyle = scene.background;
  context.fillRect(0, 0, scene.width, scene.height);
  sizeLabel.textContent = `${scene.width} × ${scene.height}`;
  backgroundInput.value = scene.background;
}
document.getElementById('new-project').addEventListener('click', () => {
  scene = MemeScene.createScene();
  message.textContent = '';
  render();
});
backgroundInput.addEventListener('input', () => { scene.background = backgroundInput.value; render(); });
render();

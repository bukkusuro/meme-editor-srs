'use strict';
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const context = canvas.getContext('2d');
const message = $('message');
const backgroundInput = $('background-color');
const objectSelect = $('objects');
const settings = $('text-settings');
const fields = { text: $('text-content'), font: $('text-font'), size: $('text-size'), color: $('text-color'), align: $('text-align'), strokeWidth: $('stroke-width'), stroke: $('stroke-color'), bold: $('text-bold') };
let scene = MemeScene.createScene();
let history = new MemeScene.History(scene);
let loadGeneration = 0;
let drag = null;

function fontFor(item) { return `${item.bold ? 'bold ' : ''}${item.size}px ${item.font}`; }
function bounds(ctx, item) {
  ctx.font = fontFor(item);
  const lines = item.text.split('\n');
  const width = Math.max(30, ...lines.map((line) => ctx.measureText(line).width));
  const x = item.align === 'left' ? item.x : item.align === 'right' ? item.x - width : item.x - width / 2;
  return { x: x - 10, y: item.y - 10, width: width + 20, height: item.size * 1.2 * lines.length + 20 };
}
function paint(target, state, showSelection) {
  target.fillStyle = state.background;
  target.fillRect(0, 0, state.width, state.height);
  if (state.image) target.drawImage(state.image, 0, 0, state.width, state.height);
  for (const item of state.texts) {
    target.font = fontFor(item); target.textAlign = item.align; target.textBaseline = 'top';
    target.lineJoin = 'round'; target.fillStyle = item.color; target.strokeStyle = item.stroke; target.lineWidth = item.strokeWidth;
    item.text.split('\n').forEach((line, index) => {
      const y = item.y + index * item.size * 1.2;
      if (item.strokeWidth > 0) target.strokeText(line, item.x, y);
      target.fillText(line, item.x, y);
    });
    if (showSelection && item.id === state.selectedId) {
      const box = bounds(target, item); target.save(); target.strokeStyle = '#e45b4b';
      target.lineWidth = Math.max(2, state.width / 400); target.setLineDash([12, 8]);
      target.strokeRect(box.x, box.y, box.width, box.height); target.restore();
    }
  }
}
function render() {
  if (canvas.width !== scene.width || canvas.height !== scene.height) { canvas.width = scene.width; canvas.height = scene.height; }
  paint(context, scene, true);
  $('canvas-size').textContent = `${scene.width} × ${scene.height}`;
  backgroundInput.value = scene.background;
  $('undo').disabled = !history.canUndo;
  $('redo').disabled = !history.canRedo;
  const item = MemeScene.selected(scene);
  objectSelect.replaceChildren();
  if (!scene.texts.length) objectSelect.add(new Option('Нет надписей', ''));
  for (const text of scene.texts) objectSelect.add(new Option(`Надпись ${text.id}: ${text.text.replace(/\s+/g, ' ').slice(0, 24) || 'пустая'}`, String(text.id)));
  objectSelect.disabled = !scene.texts.length;
  objectSelect.value = item ? String(item.id) : '';
  settings.disabled = !item;
  if (item) for (const [key, element] of Object.entries(fields)) {
    if (element.type === 'checkbox') element.checked = item[key];
    else if (document.activeElement !== element) element.value = item[key];
  }
}
function changed() { message.textContent = ''; history.record(scene); render(); }
$('new-project').addEventListener('click', () => {
  if ((scene.image || scene.texts.length || scene.background !== '#ffffff') && !window.confirm('Начать новый проект? Текущие изменения будут удалены.')) return;
  loadGeneration += 1; scene = MemeScene.createScene(); history.reset(scene); message.textContent = ''; render();
});
backgroundInput.addEventListener('input', () => { scene.background = backgroundInput.value; changed(); });
$('add-text').disabled = false;
$('add-text').addEventListener('click', () => { MemeScene.addText(scene); changed(); });
objectSelect.addEventListener('change', () => { scene.selectedId = Number(objectSelect.value); render(); });
for (const [key, element] of Object.entries(fields)) element.addEventListener('input', () => {
  const item = MemeScene.selected(scene); if (!item) return;
  let value = element.type === 'checkbox' ? element.checked : element.value;
  if (key === 'size' || key === 'strokeWidth') {
    const n = Number(value); if (!Number.isFinite(n) || value === '') return;
    value = Math.max(key === 'size' ? 8 : 0, Math.min(key === 'size' ? 400 : 30, n));
  }
  item[key] = value; changed();
});
$('delete-text').addEventListener('click', () => { if (MemeScene.removeSelected(scene)) changed(); });
$('bring-front').addEventListener('click', () => { if (MemeScene.moveLayer(scene, 'front')) changed(); });
$('send-back').addEventListener('click', () => { if (MemeScene.moveLayer(scene, 'back')) changed(); });
function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * scene.width / rect.width, y: (event.clientY - rect.top) * scene.height / rect.height };
}
canvas.addEventListener('pointerdown', (event) => {
  const point = pointerPosition(event);
  const item = [...scene.texts].reverse().find((text) => { const b = bounds(context, text); return point.x >= b.x && point.x <= b.x + b.width && point.y >= b.y && point.y <= b.y + b.height; });
  scene.selectedId = item ? item.id : null;
  if (item) { drag = { id: item.id, x: point.x, y: point.y, startX: item.x, startY: item.y }; canvas.setPointerCapture(event.pointerId); }
  canvas.focus(); render();
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = pointerPosition(event), item = scene.texts.find((text) => text.id === drag.id);
  if (!item) return;
  item.x = drag.startX + point.x - drag.x; item.y = drag.startY + point.y - drag.y; render();
});
canvas.addEventListener('pointerup', () => { if (drag) { const item = scene.texts.find((text) => text.id === drag.id); if (item && (item.x !== drag.startX || item.y !== drag.startY)) changed(); } drag = null; });
canvas.addEventListener('pointercancel', () => { if (drag) { const item = scene.texts.find((text) => text.id === drag.id); if (item) { item.x = drag.startX; item.y = drag.startY; } drag = null; render(); } });
canvas.addEventListener('keydown', (event) => {
  const item = MemeScene.selected(scene); if (!item) return;
  const movements = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (!movements[event.key]) return;
  event.preventDefault(); const step = event.shiftKey ? 10 : 1;
  item.x += movements[event.key][0] * step; item.y += movements[event.key][1] * step; changed();
});
$('undo').addEventListener('click', () => { const previous = history.undo(); if (previous) { scene = previous; message.textContent = ''; render(); } });
$('redo').addEventListener('click', () => { const next = history.redo(); if (next) { scene = next; message.textContent = ''; render(); } });
const imageFile = $('image-file');
imageFile.disabled = false;
imageFile.addEventListener('change', () => {
  const file = imageFile.files[0];
  if (!file) return;
  const run = ++loadGeneration;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    message.textContent = 'Выберите изображение PNG, JPEG или WebP.'; imageFile.value = ''; return;
  }
  if (file.size > 10000000) {
    message.textContent = 'Размер изображения не должен превышать 10 МБ.'; imageFile.value = ''; return;
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    if (run !== loadGeneration) return;
    if (!image.naturalWidth || !image.naturalHeight) { message.textContent = 'Не удалось прочитать изображение.'; return; }
    scene.image = image; scene.width = image.naturalWidth; scene.height = image.naturalHeight;
    imageFile.value = ''; changed();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    if (run === loadGeneration) { message.textContent = 'Не удалось прочитать изображение. Выберите другой файл.'; imageFile.value = ''; }
  };
  image.src = url;
});
$('download').disabled = false;
$('download').addEventListener('click', async () => {
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const output = document.createElement('canvas'); output.width = scene.width; output.height = scene.height;
    const ctx = output.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
    paint(ctx, scene, false);
    const blob = await new Promise((resolve) => output.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG unavailable');
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'meme.png'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = '';
  } catch (_) { message.textContent = 'Не удалось сохранить мем. Попробуйте ещё раз.'; }
});
render();

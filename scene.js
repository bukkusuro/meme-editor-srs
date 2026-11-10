(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MemeScene = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function createScene() {
    return { width: 1200, height: 1200, background: '#ffffff', image: null, texts: [], selectedId: null, nextId: 1 };
  }
  function addText(scene) {
    const index = scene.texts.length;
    const item = { id: scene.nextId++, text: 'Ваша надпись', x: scene.width / 2, y: Math.min(scene.height - 60, 80 + index * 90), font: 'Impact', size: 64, color: '#ffffff', align: 'center', stroke: '#000000', strokeWidth: 3, bold: true };
    scene.texts.push(item); scene.selectedId = item.id; return item;
  }
  function selected(scene) { return scene.texts.find((item) => item.id === scene.selectedId) || null; }
  function removeSelected(scene) {
    const index = scene.texts.findIndex((item) => item.id === scene.selectedId);
    if (index < 0) return false;
    scene.texts.splice(index, 1);
    scene.selectedId = scene.texts.length ? scene.texts[Math.min(index, scene.texts.length - 1)].id : null;
    return true;
  }
  function moveLayer(scene, where) {
    const index = scene.texts.findIndex((item) => item.id === scene.selectedId);
    if (index < 0 || (where === 'front' && index === scene.texts.length - 1) || (where === 'back' && index === 0)) return false;
    const [item] = scene.texts.splice(index, 1);
    if (where === 'front') scene.texts.push(item); else scene.texts.unshift(item);
    return true;
  }
  return { createScene, addText, selected, removeSelected, moveLayer };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MemeScene = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function createScene() {
    return { width: 1200, height: 1200, background: '#ffffff', image: null, texts: [], selectedId: null };
  }
  return { createScene };
});

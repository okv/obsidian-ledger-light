var ObsidianPlugin = (function() {
  'use strict';

  class BratTestPlugin {
    constructor(app, manifest) {
      this.app = app;
      this.manifest = manifest;
    }

    async onload() {
      console.log('BRAT Test Plugin loaded!');
    }

    onunload() {
      console.log('BRAT Test Plugin unloaded');
    }
  }

  return BratTestPlugin;
})();

module.exports = ObsidianPlugin;

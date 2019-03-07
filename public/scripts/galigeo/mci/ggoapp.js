(function() {
  'use strict';
  GGO.GGOApp = function(options) {
    this._options = options || {};
    this._init();
  };

  GGO.GGOApp.prototype = {
    _init: function() {
      var self = this;

      var modulesOptions = {
        app: this
      };

      this._mapManager = new GGO.MapManager(modulesOptions);
      //this._dataManager = new GGO.DataManager(modulesOptions);
      GGO.EventBus.dispatch(GGO.EVENTS.APPISREADY);
    },
  };
})();

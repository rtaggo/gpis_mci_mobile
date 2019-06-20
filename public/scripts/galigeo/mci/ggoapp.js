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

      this._mapManager = new GGO.MapManagerSingleton.getInstance(modulesOptions);
      this._missionManager = new GGO.MissionManagerSingleton.getInstance(modulesOptions);
      GGO.EventBus.dispatch(GGO.EVENTS.APPISREADY);
    }
  };
})();

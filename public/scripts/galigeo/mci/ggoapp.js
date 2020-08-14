(function () {
  'use strict';
  GGO.GGOApp = function (options) {
    this._options = options || {};
    this._init();
  };

  GGO.GGOApp.prototype = {
    _init: function () {
      var self = this;

      var modulesOptions = {
        app: this,
        patrouille: this._options.patrouille,
        immatriculation: this._options.immatriculation,
        secteurs: this._options.secteurs,
        userName: this._options.userName,
        userRole: this._options.userRole,
        chefsGroupe: this._options.chefsGroupe,
        chefGroupeId: this._options.chefGroupeId,
      };
      GGO.UIManagerSingleton.getInstance({});
      this._mapManager = new GGO.MapManagerSingleton.getInstance(modulesOptions);
      this._missionManager = new GGO.MissionManagerSingleton.getInstance(modulesOptions);
      this._neighborhoodMapManager = new GGO.NeighborhoodMapManagerSingleton.getInstance(modulesOptions);
      GGO.CrisisCheckerSingleton.getInstance(modulesOptions);
      GGO.ForbiddenCheckerSingleton.getInstance(modulesOptions);
      GGO.EventBus.dispatch(GGO.EVENTS.APPISREADY);
    },
    getPatrouille: function () {
      return this._options.patrouille;
    },
    getVehicule: function () {
      return this._options.immatriculation;
    },
    getChef: function () {
      return this._options.chefGroupeId;
    },
    getUserLogin: function () {
      return this._options.userName;
    },
    getUserRole: function () {
      return this._options.userRole;
    },
    getChefsGroupe: function () {
      return this._options.chefsGroupe;
    },
  };
})();

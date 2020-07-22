const GGO = require('../galigeo');

(function () {
  'use strict';
  GGO.ForbiddenChecker = function (options) {
    this.init();
  };

  GGO.ForbiddenChecker.prototype = {
    init: function () {
      this.check_forbidden();
    },
    check_forbidden: function () {
      let self = this;
      // faire appel ajax
      // gestion cookie, etc....
    },
    await_before_recall: function () {
      setTimeout(() => {
        this.check_forbidden();
      }, 30000);
    },
  };

  GGO.ForbiddenCheckerSingleton = (function () {
    let instance;
    function createInstance(options) {
      let fChecker = new GGO.ForbiddenChecker(options);
      return fChecker;
    }
    return {
      getInstance: function (options) {
        if (!instance) {
          instance = createInstance(options);
        }
        return instance;
      },
    };
  })();
})();

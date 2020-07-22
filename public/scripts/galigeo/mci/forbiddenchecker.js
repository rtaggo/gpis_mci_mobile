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

      let the_url = 'http//toto.com';
      $.ajax({
        type: 'GET',
        url: the_url,
        //dataType: 'json',
        success: function (response) {
          if (response.code === 200) {
            // filtrer en fonction de ce qui est dans le cookie
            // voir les etapes du fichier de ce matin
          }
          self.await_before_recall();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${vacationUrl} Request aborted`);
          } else {
            console.error(`Error for ${vacationUrl} request: ${textStatus}`, errorThrown);
          }
          self.await_before_recall();
        },
      });
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

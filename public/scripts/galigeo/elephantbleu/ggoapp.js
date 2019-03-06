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

      var docURL = new URL(document.URL);
      var search_params = new URLSearchParams(docURL.search);
      modulesOptions.userLocated  = search_params.has('lat') && search_params.has('lng');
      if (modulesOptions.userLocated) {
        modulesOptions.userLocation = {
          lat : parseFloat(search_params.get('lat')),
          lng : parseFloat(search_params.get('lng')),
        }
      }
      modulesOptions.windowHeight = this._options.windowHeight;
      //alert('userLocated: ' + modulesOptions.userLocated + '. User location: ' + JSON.stringify(modulesOptions.userLocation));
      this._uiManager = new GGO.UIManager(modulesOptions);
      this._mapManager = new GGO.MapManager(modulesOptions);
      this._dataManager = new GGO.DataManager(modulesOptions);

      this.wakeupApp();
    },
    wakeupApp: function() {
      var self = this;
      var wakeupUrl = '/services/rest/elephantbleu';
      $.ajax({
        type: 'GET',
        url: wakeupUrl,
        success: function(data) {
          console.log(' WakeUp Response : ', data);
          self.handleWakeupApp(data);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
            console.warn('WakeUp Request aborted');
          } else {
            console.error('Error for WakeUp request: ' + textStatus, errorThrown);
          }
        }
      });
    },
    handleWakeupApp: function(data) {
      var self = this;
      if (data.code === 200) {
        setTimeout(function(e){
          $('#appLauncher').fadeOut(1000, function(e){
            console.log('fade out completed');
            $('#appLauncher').remove();
            $('#mainAppContainer').removeClass('slds-hide');
            GGO.EventBus.dispatch(GGO.EVENTS.APPISREADY);

            $('#map').show();
            self._mapManager.invalidateMapSize();
          });
        }, 3000);
      }
    }
  };
})();

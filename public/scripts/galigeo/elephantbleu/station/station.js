(function() {
  'use strict';
  GGO.Station = function(data) {

  };
  GGO.Station.prototype = {
    getDetails: function(){
      console.warn('GGO.Station.getDetails need to be implemented');
    },
    renderHTML: function(){
      console.warn('GGO.Station.renderHTML need to be implemented');
    },
    buildDetailsView: function(container){
      console.warn('GGO.Station.buildDetailsView need to be implemented');
    },
    getId: function(){
      console.warn('GGO.Station.getId need to be implemented');
      return null;
    }
  };
})();
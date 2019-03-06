(function() {
	'use strict';
	GGO.DataManager = function(options){
		this._options = options || {};
		this._options.elephantbleuurl = '/services/rest/elephantbleu';
		this._init();
	};

	GGO.DataManager.prototype = {
    _init:function() {
			this.setupListeners();
		}, 
		setupListeners: function() {
			var self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.FETCHSTATIONS, function(e) {
        var data = e.target;
        if (data.layer === 'elephantbleu') {
          self._fetchStations(data);
        } else if (data.layer === 'concurrence') {
          // TODO: fetch concurrent
          self._fetchConcurrence(data);
        }        
      });
    },
    _fetchConcurrence: function(data) {
      var self = this;
      var sUrl = self._options.elephantbleuurl + '/concurrence';
      if (typeof(data.coordinates) !== 'undefined') {
        sUrl += '?lat=' + data.coordinates.lat + '&lng=' + data.coordinates.lng;
      }
      $.ajax({
        type: 'GET',
        url: sUrl,
        success: function(response) {
          console.log('/concurrence Response : ', response);
          self._handleStationsResponse(response, data);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
          console.warn('Fetch Competitors request aborted');
          } else {
            console.error('Error for Competitors request: ' + textStatus, errorThrown);
          }
        }
			});
    },
    
    _fetchStations: function(data) {
      var self = this;
      var sUrl = self._options.elephantbleuurl + '/stations';
      if (typeof(data.coordinates) !== 'undefined') {
        sUrl += '?lat=' + data.coordinates.lat + '&lng=' + data.coordinates.lng;
      }
      $.ajax({
        type: 'GET',
        url: sUrl,
        success: function(response) {
          console.log('/stations Response : ', response);
          self._handleStationsResponse(response, data);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
          console.warn('Fetch Elephant Bleu Stations request aborted');
          } else {
            console.error('Error for Elephant Bleu Stations request: ' + textStatus, errorThrown);
          }
        }
			});
    },
    _handleStationsResponse: function(response, data){
      console.log('Stations response: ' + response.features.length + ' station(s) for data ' + JSON.stringify(data));
      var dataToSend = {
        request_parameters : data,
        geojson : response,
        stations: []
      };
      $.each(response.features, function(idxS, valS){
        if (data.layer === 'elephantbleu') {
          dataToSend.stations.push(new GGO.StationElephantBleu(valS.properties,valS.geometry.coordinates));
        } else if (data.layer === 'concurrence') {
          dataToSend.stations.push(new GGO.StationConcurrence(valS.properties,valS.geometry.coordinates));
        }
      });
      GGO.EventBus.dispatch(GGO.EVENTS.FETCHEDSTATIONS, dataToSend);
    }	
  };
})();
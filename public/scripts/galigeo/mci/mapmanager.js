(function() {
	'use strict';
	GGO.MapManager = function(options){
		this._options = options || {};
		this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
		this._options.mapDivId = this._options.mapDivId || 'map';
		L.mapbox.accessToken = this._options.mapboxAccessToken;
		
		this._secteurDrawingProperties = {
			"stroke": "#FF00FF",
			"stroke-width": 1,
			"stroke-opacity": 1,
			"fill": "#FF00FF",
			"fill-opacity": 0.2,
		};
	
		this.init();
	};

	GGO.MapManager.prototype = {
		init:function(){
			this.setupListeners();
			this.setupMap();
		},
		setupListeners:function(){
			var self = this;
			GGO.EventBus.addEventListener(GGO.EVENTS.APPISREADY, function(e) {
				console.log('Received GGO.EVENTS.APPISREADY');
				self.fetchSecteur();
			});
		},
		getMap: function() {
			return this._map;
		},
		setupMap: function() {
			var self = this;
      
      self._basemaps = {
        'streets' : L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: "",
          minZoom: 1,
          maxZoom: 19,    
        }),
        'grey' : L.tileLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: "",
          minZoom: 1,
          maxZoom: 15,    
        }), 
        'osm' : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      };
			this._currentBasemap = 'streets';
			var mapDivId = this._options.mapDivId || 'map';
			this._map = L.map(mapDivId, {
				attributionControl: false,
				preferCanvas: true,
				zoomControl: false,
				contextmenu: true,
				contextmenuWidth: 140,						
				layers: [self._basemaps['streets']]
			}).setView([0, 0], 2);
    },
		fetchSecteur: function() {
			var self = this;
      var wakeupUrl = '/services/rest/mci/secteur';
      $.ajax({
        type: 'GET',
        url: wakeupUrl,
        success: function(response) {
          console.log('/rest/mci/secteur Response : ', response);
          self.handleSectorFetched(response);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
            console.warn('/rest/mci/secteur Request aborted');
          } else {
            console.error('Error for /rest/mci/secteur request: ' + textStatus, errorThrown);
          }
        }
      });
		},
		handleSectorFetched: function(geojson) {
			this._secteurLayer = L.mapbox.featureLayer().addTo(this._map);
			$.extend(geojson.features[0].properties, this._secteurDrawingProperties);
			this._secteurLayer.setGeoJSON(geojson);
			this._map.fitBounds(this._secteurLayer.getBounds());
		},
		updateMapSize: function() {
			$('#map').addClass('halfheight_map');
			this._map.invalidateSize(false);					
		},
		invalidateMapSize: function() {
			this._map.invalidateSize(false);					
		},
	};
})();
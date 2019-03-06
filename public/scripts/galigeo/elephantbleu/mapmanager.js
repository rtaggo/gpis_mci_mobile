(function() {
	'use strict';
	GGO.MapManager = function(options){
		this._options = options || {};
		this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
		this._options.mapDivId = this._options.mapDivId || 'map';
		L.mapbox.accessToken = this._options.mapboxAccessToken;

		this._defaultIcon = {
			iconUrl: '/images/logo_elephantbleu.png',
			iconSize: [32, 32], // size of the icon
			iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
			className: 'dot'
		};
		this._currentRadius = 70;
		this._stationsFetched = false;
		this._userLocation = {
			orientation: 0
    }
    this._flyZoomToOptions = {
      maxZoom : 13
    };
    this._stationLayers = {
      elephantbleu : {},
      concurrence: {}
    };

    this._defaultEBIcon = {
			iconUrl: '/images/elephant_marker.png',
			iconSize: [32, 36], // size of the icon
			iconAnchor: [16, 36], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
			className: 'dot'
		};
    this._defaultConcurrenceIcon = {
			iconUrl: '/images/concurrence_marker.png',
			iconSize: [32, 30], // size of the icon
			iconAnchor: [16, 30], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -15], // point from which the popup should open relative to the iconAnchor
			className: 'dot'
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
				self.locateUser();
			});

      GGO.EventBus.addEventListener(GGO.EVENTS.ZOOMTOUSERLOCATION, function(e) {
				console.log('Received GGO.EVENTS.ZOOMTOUSERLOCATION');
        self.zommToUserLocation();
			});

      GGO.EventBus.addEventListener(GGO.EVENTS.SWITCHBASEMAP, function(e) {
				var basemap = e.target;
        console.log('Received GGO.EVENTS.SWITCHBASEMAP', basemap);
        self._switchBasemap(basemap);
			});
 
			GGO.EventBus.addEventListener(GGO.EVENTS.CLICKEDSTATION, function(e) {
				var tgt = e.target;
				console.log('Received GGO.EVENTS.CLICKEDSTATION', tgt);
				//self.routeToStation(tgt);
			});
			GGO.EventBus.addEventListener(GGO.EVENTS.ZOOMTOSTATION, function(e) {
				var stationData = e.target;
				console.log('Received GGO.EVENTS.ZOOMTOSTATION', stationData);
				self.doZoomToStation(stationData);
			});
      // ZOOMTOSTATION

			GGO.EventBus.addEventListener(GGO.EVENTS.FETCHEDSTATIONS, function(e) {
				var data = e.target;
        console.log('Received GGO.EVENTS.FETCHEDSTATIONS', data);
        self.handleFetchedStationsResponse(data);
      });

      GGO.EventBus.addEventListener(GGO.EVENTS.TOGGLELAYER, function(e) {
        var data = e.target;
        console.log('Received GGO.EVENTS.TOGGLELAYER', data);
        self.doToggleLayer(data);
      });
      
    },
    doZoomToStation: function(stationData){
      var self = this;
      if (stationData.layer === 'elephantbleu') {
        this._stationLayers.elephantbleu.layer.eachLayer(function(lyr){
          if (lyr.feature.properties.id === stationData.stationId) {
            self._map.setView(lyr.getLatLng(),14);
            return false;
          }
        });
      } else if (stationData.layer === 'concurrence') {
        this._stationLayers.concurrence.layer.eachLayer(function(lyr){
          if (lyr.feature.properties.id === stationData.stationId) {
            self._map.setView(lyr.getLatLng(),14);
            return false;
          }
        });
      }
    },
    doToggleLayer: function(data) {
      if (data.visible) {
        GGO.EventBus.dispatch(GGO.EVENTS.FETCHSTATIONS, {coordinates: this._userLocation.coordinates, layer: data.layer});        
      } else {
        if (data.layer === 'elephantbleu') {
          if ((typeof(this._stationLayers.elephantbleu.layer) !== 'undefined') && (this._stationLayers.elephantbleu.layer !== null)) {
            this._stationLayers.elephantbleu.layer.clearLayers();
          }
        } else if (data.layer === 'concurrence') {
          if ((typeof(this._stationLayers.concurrence.layer) !== 'undefined') && (this._stationLayers.concurrence.layer !== null)) {
            this._stationLayers.concurrence.layer.clearLayers();
          }
        }
      }
    },
    handleFetchedStationsResponse: function(data){
      if (data.request_parameters.layer === 'elephantbleu') {
        this.handleEBStations(data);    
      } else if (data.request_parameters.layer === 'concurrence') {
        this.handleConcurrenceStations(data);    
      }
    },
    handleEBStations: function(data){
      var self = this;
      if ((typeof(this._stationLayers.elephantbleu.layer) !== 'undefined') && (this._stationLayers.elephantbleu.layer !== null)) {
        this._stationLayers.elephantbleu.layer.clearLayers();
      } else {
				this._stationLayers.elephantbleu.layer = L.mapbox.featureLayer().addTo(this._map);
				this._stationLayers.elephantbleu.layer.off()
					.on('click', function(e){
						console.log('Clicked on a marker elephant bleu');
						GGO.EventBus.dispatch(GGO.EVENTS.MAPMARKERCLICKED, {
							stationId : e.layer.feature.properties.id, 
							layerType: 'elephantbleu'
						});
					});

      }
      this._stationLayers.elephantbleu.geojson = data.geojson;
      this._stationLayers.elephantbleu.layer.setGeoJSON(this._stationLayers.elephantbleu.geojson);
      this._stationLayers.elephantbleu.layer.eachLayer(function(lyr){
        lyr.setIcon(L.icon(self._defaultEBIcon));
      });
      GGO.EventBus.dispatch(GGO.EVENTS.RENDERSTATIONS, data);
    }, 
    handleConcurrenceStations: function(data){
      var self = this;
      if ((typeof(this._stationLayers.concurrence.layer) !== 'undefined') && (this._stationLayers.concurrence.layer !== null)) {
        this._stationLayers.concurrence.layer.clearLayers();
      } else {
				this._stationLayers.concurrence.layer = L.mapbox.featureLayer().addTo(this._map);
				this._stationLayers.concurrence.layer.off()
					.on('click', function(e){
						console.log('Clicked on a marker elephant bleu');
						GGO.EventBus.dispatch(GGO.EVENTS.MAPMARKERCLICKED, {
							stationId : e.layer.feature.properties.id, 
							layerType: 'concurrence'
						});
					});
      }
      this._stationLayers.concurrence.geojson = data.geojson;
      this._stationLayers.concurrence.layer.setGeoJSON(this._stationLayers.concurrence.geojson);
      this._stationLayers.concurrence.layer.eachLayer(function(lyr){
        lyr.setIcon(L.icon(self._defaultConcurrenceIcon));
      });
      GGO.EventBus.dispatch(GGO.EVENTS.RENDERSTATIONS, data);
    },
    _switchBasemap: function(basemap) {
      console.log('_switchBasemap(' + basemap+')');
      if (typeof(this._basemaps[basemap]) !== 'undefined') {
        this._map.removeLayer(this._basemaps[this._currentBasemap]);
        this._map.addLayer(this._basemaps[basemap]);
        this._currentBasemap = basemap;
      }
    },
		formatDistance: function(distanceKM){
			if (distanceKM<1) {
				return (distanceKM * 1000).toFixed(0) + ' m'; 
			} else {
				return distanceKM.toFixed(2) + ' km';
			}
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
			/*
			new L.control.zoom({
				position:'topright'
			}).addTo(this._map);
			*/
			var onLocationFound  = function(e) {
				self.handleUserLocationFound(e);
			};
			var onLocationError = function(e) {
				self.handleUserLocationError(e);
			};
			this._map.on('locationfound', onLocationFound);
			this._map.on('locationerror', onLocationError);
    },
    zommToUserLocation: function() {
      if (typeof(this._userLocation) !== 'undefined' && typeof(this._userLocation.coordinates)!=='undefined'){
        this._map.setView(this._userLocation.coordinates, this._flyZoomToOptions.maxZoom);
      }
    }, 
		locateUser: function() {
      if (this._options.userLocated){
        var dataLoc = {
          latlng : this._options.userLocation,
          accuracy: 10
        };
        this.handleUserLocationFound(dataLoc);
        this._map.setView(dataLoc.latlng,this._flyZoomToOptions.maxZoom);
      } else {
        this._map.locate({setView: true, maxZoom: this._flyZoomToOptions.maxZoom,enableHighAccuracy: true});
      }
		},
		handleUserLocationFound: function(e) {
			console.log('>> handleUserLocationFound', e);
			var obj = {
				id: 1, 
				name: 'Current position', 
				position: { lat: e.latlng.lat, lng: e.latlng.lng }
			};
			var data2Send = {
				lat: e.latlng.lat, 
				lng: e.latlng.lng 
			};
			this._userLocation.coordinates = data2Send;
			this._userLocation.accuracy =  e.accuracy;
			GGO.EventBus.dispatch(GGO.EVENTS.USERLOCATIONCHANGED, data2Send);
			if (!this._stationsFetched) {
				GGO.EventBus.dispatch(GGO.EVENTS.FETCHSTATIONS, {coordinates: this._userLocation.coordinates, layer: 'elephantbleu'});
			}
			this.displayUserLocation();
		}, 
		handleUserLocationError: function(e) {
      console.log('>> handleUserLocationError', e);
      this._userLocation.coordinates = {
        lat: 48.673412,
        lng: 7.783549
      };
      this._userLocation.accuracy = 1;
      if (!this._stationsFetched) {
        GGO.EventBus.dispatch(GGO.EVENTS.FETCHSTATIONS, {coordinates: this._userLocation.coordinates, layer: 'elephantbleu'});
      }
      this.displayUserLocation();
      this._map.setView(this._userLocation.coordinates,13);
		},
		displayUserLocation: function() {
			var self = this;
			if (typeof(this._userLocation.layer) === 'undefined') {
				this._userLocation.layer = L.mapbox.featureLayer().addTo(this._map);
			}
			/*
			else if (this._map.hasLayer(this._userLocation.layer)) {
				this._map.removeLayer(this._userLocation.layer);
			} 
			*/
			var center = [this._userLocation.coordinates.lng, this._userLocation.coordinates.lat];
			var radius = this._userLocation.accuracy / 1000;
			var options = {steps: 240, units: 'kilometers', 
				properties: {
					"stroke": "#73cfff",
					"stroke-width": 1,
					"stroke-opacity": 0.4,
					"fill": "#73cfff",
					"fill-opacity": 0.1,
    			}
			};
			var locationAccuracy = turf.circle(center, radius, options);
			var locationMarker = turf.point(center, {'name': 'user_location'});

			this._userLocation.layer.setGeoJSON(turf.featureCollection([locationAccuracy,locationMarker]));
			this._userLocation.layer.eachLayer(function(lyr){
				console.log('_userLocation.layer', lyr);
				if (lyr.feature.properties.name === 'user_location') {
					var circleM = L.divIcon({
						className: 'userLocationMarker',
						iconSize : [10,10],
						iconAnchor: [4, 6]
					});
					lyr.setIcon(circleM);
				}
			});
		},
		updateMapSize: function() {
			$('#map').addClass('halfheight_map');
			this._map.invalidateSize(false);					
		},
		invalidateMapSize: function() {
			this._map.invalidateSize(false);					
		},
		getBuffer: function(center, radius, units, resolution) {
			var options = {steps: resolution, units: units};
			var circle = turf.circle(center, radius, options);
			return circle;
		},

	};
})();
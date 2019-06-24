(function() {
  'use strict';
  GGO.MapManager = function(options) {
    this._options = options || {};
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
    this._options.mapDivId = this._options.mapDivId || 'map';
    L.mapbox.accessToken = this._options.mapboxAccessToken;

    this._secteurDrawingProperties = {
      stroke: '#FF00FF',
      'stroke-width': 1,
      'stroke-opacity': 1,
      fill: '#FF00FF',
      'fill-opacity': 0.1
    };

    this.init();
  };

  GGO.MapManager.prototype = {
    init: function() {
      this.setupListeners();
      this.setupMap();
    },
    setupListeners: function() {
      var self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.APPISREADY, function(e) {
        console.log('Received GGO.EVENTS.APPISREADY');
        self.fetchPatrimoine_SousSecteurs();
      });
      GGO.EventBus.addEventListener(GGO.EVENTS.SHOWMISSIONMLOCATION, function(e) {
        console.log('Received GGO.EVENTS.SHOWMISSIONMLOCATION');
        let mission = e.target;
        self.displayMission(mission);
      });
      // MISSIONCOMPLETED
      GGO.EventBus.addEventListener(GGO.EVENTS.MISSIONCOMPLETED, function(e) {
        console.log('Received GGO.EVENTS.MISSIONCOMPLETED');
        self.clearMission();
      });

      // INVALIDATEMAPSIZE
      GGO.EventBus.addEventListener(GGO.EVENTS.INVALIDATEMAPSIZE, function(e) {
        console.log('Received GGO.EVENTS.INVALIDATEMAPSIZE');
        self.invalidateMapSize();
      });
    },
    getMap: function() {
      return this._map;
    },
    setupMap: function() {
      var self = this;

      self._basemaps = {
        streets: L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: '',
          minZoom: 1,
          maxZoom: 19
        }),
        grey: L.tileLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '',
          minZoom: 1,
          maxZoom: 15
        }),
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    fetchPatrimoine_SousSecteurs: function() {
      var self = this;
      var restURL = `${this._options.baseRESTServicesURL}/patrimoine_sous_secteur.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map(s => s.id).join(',')}`;
      $.ajax({
        type: 'GET',
        url: restURL,
        success: function(response) {
          console.log(`${restURL} Response : `, response);
          self.handleSectorFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${restURL} Request aborted`);
          } else {
            console.error(`${restURL} Error request: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    handleSectorFetched: function(response) {
      if (response.code === 200) {
        let patrimoineGgeoJSON = response['patrimoine'];
        if (typeof patrimoineGgeoJSON !== 'undefined') {
          this._classifyPatrimoine(patrimoineGgeoJSON);
          this._patrimoineLayer = L.mapbox.featureLayer().addTo(this._map);
          //this._patrimoineLayer.on('layeradd', this.onFeatureAddedToPatrimoineLayer.bind(this));
          this._patrimoineLayer.setGeoJSON(patrimoineGgeoJSON);
          this._buildLegend();
        }

        let sous_secteursGeoJSON = response['sous-secteur'];
        if (typeof sous_secteursGeoJSON !== 'undefined') {
          this._secteurLayer = L.mapbox.featureLayer().addTo(this._map);

          //$.extend(sous_secteurs.features[0].properties, this._secteurDrawingProperties);
          this._secteurLayer.setGeoJSON(sous_secteursGeoJSON);
          this._map.fitBounds(this._secteurLayer.getBounds());
        }
      } else {
      }
    },
    _buildLegend: function() {
      const colorPalette = GGO.getDefaultColorPalette();
      let self = this;
      let lgdContent = $(`
        <div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[0]};" data-no="0"></div><div class="legend-label"> Niveau opérationnel 0</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[1]};" data-no="1"></div><div class="legend-label"> Niveau opérationnel 1</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[2]};" data-no="2"></div><div class="legend-label"> Niveau opérationnel 2</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[3]};" data-no="3"></div><div class="legend-label"> Niveau opérationnel 3</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[4]};" data-no="4"></div><div class="legend-label"> Niveau opérationnel 4</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[5]};" data-no="5"></div><div class="legend-label"> Niveau opérationnel 5</div></div>
        </div>
      `);

      lgdContent.find('.slds-badge').click(function(e) {
        $(this)
          .parent()
          .toggleClass('disabled-legend-item');
        $(this).toggleClass('filtered_no');
        self._filterPatrimoineLayer();
      });
      $('#dialog-body-legend')
        .empty()
        .append(lgdContent);
    },
    _filterPatrimoineLayer: function() {
      let filteredNO = $('#dialog-body-legend .filtered_no');
      const filteredNOValues = new Set(filteredNO.toArray().map(b => $(b).attr('data-no')));
      this._patrimoineLayer.setFilter(function(f) {
        return !filteredNOValues.has(f.properties.niveau_operationnel);
      });
    },
    _getColorForNiveauOpe: function(no) {
      const rdYlBu = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
      //const colorPalette = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'];
      const colorPalette = GGO.getDefaultColorPalette(); //rdYlBu;
      let noInt = parseInt(no);
      noInt = noInt % colorPalette.length;
      return colorPalette[noInt];
    },
    _classifyPatrimoine: function(geojson) {
      geojson.features.forEach(f => {
        f.properties['marker-size'] = 'small';
        f.properties['marker-symbol'] = f.properties['niveau_operationnel'];
        f.properties['marker-color'] = this._getColorForNiveauOpe(f.properties['niveau_operationnel']);
      });
    },
    onFeatureAddedToPatrimoineLayer: function(e) {
      let marker = e.layer;
      let feature = marker.feature;
      let props = feature.properties;
    },
    displayMission: function(missionGeoJSON) {
      if (typeof this._missionLayer === 'undefined' || this._missionLayer === null) {
        this._missionLayer = L.mapbox.featureLayer().addTo(this._options.app._mapManager._map);
      }
      let mission = missionGeoJSON.features[0];
      let markerProperties = {
        'marker-color': mission.statut === 'En attente' ? '#FF0000' : mission.statut === 'En direction' ? '#00FF00' : '#0000FF',
        'marker-size': 'small'
      };
      /*
      let missionGeoJSON = turf.point(mission.coordinates);
      $.extend(missionGeoJSON.properties, markerProperties);
      this._missionLayer.setGeoJSON(missionGeoJSON);
      this._map.fitBounds(this._missionLayer.getBounds(), { maxZoom: 14 });
      */
      $.extend(mission.properties, markerProperties);
      this._missionLayer.setGeoJSON(missionGeoJSON);
      this._map.fitBounds(this._missionLayer.getBounds(), { maxZoom: 14 });
    },
    clearMission: function() {
      if (typeof this._missionLayer !== 'undefined' && this._missionLayer !== null) {
        this._missionLayer.clearLayers();
      }

      if (typeof this._secteurLayer !== 'undefined' && this._secteurLayer !== null) {
        this._map.fitBounds(this._secteurLayer.getBounds());
      }
    },
    updateMapSize: function() {
      $('#map').addClass('halfheight_map');
      this._map.invalidateSize(false);
    },
    invalidateMapSize: function() {
      this._map.invalidateSize(false);
    }
  };

  GGO.MapManagerSingleton = (function() {
    let instance;
    function createInstance(options) {
      let mapMgr = new GGO.MapManager(options);
      return mapMgr;
    }
    return {
      getInstance: function(options) {
        if (!instance) {
          instance = createInstance(options);
        }
        return instance;
      }
    };
  })();
})();

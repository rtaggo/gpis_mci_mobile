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
      'fill-opacity': 0.2
    };
    this._basemaps = {
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
      imagery: L.tileLayer('//services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        minZoom: 1,
        maxZoom: 19
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
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

      this._currentBasemap = 'streets';
      var mapDivId = this._options.mapDivId || 'map';
      this._map = L.map(mapDivId, {
        attributionControl: false,
        preferCanvas: true,
        zoomControl: false,
        contextmenu: true,
        contextmenuWidth: 140,
        layers: [this._basemaps['streets']]
      }).setView([48.853507, 2.348015], 12);
      new L.control.zoom({
        position: 'bottomright'
      }).addTo(this._map);
      this._map.on('moveend', function(e) {
        console.log('[TODO] zoom end');
        self.updateActivite(JSON.parse(sessionStorage.patrouille).id);
      });
    },
    updateActivite: function(patrouille_id) {
      let self = this;
      let activiteUrl = `/services/rest/mci/activite_map.php`;
      let reqBody = {
        patrouille_id: patrouille_id
      };
      $.ajax({
        type: 'POST',
        url: activiteUrl,
        data: JSON.stringify(reqBody),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
          console.log(`Response`, response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`Request aborted`);
          } else {
            console.error(`Error request: ${textStatus}`, errorThrown);
          }
        }
      });
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
      var self = this;
      if (response.code === 200) {
        let patrimoineGgeoJSON = response['patrimoine'];
        if (typeof patrimoineGgeoJSON !== 'undefined') {
          this._classifyPatrimoine(patrimoineGgeoJSON);
          this._patrimoineLayer = L.mapbox
            .featureLayer(patrimoineGgeoJSON)
            .addTo(this._map)
            .on('click', function(e) {
              self.updateActivite(JSON.parse(sessionStorage.patrouille).id);
            });
          //this._patrimoineLayer.on('layeradd', this.onFeatureAddedToPatrimoineLayer.bind(this));

          //this._patrimoineLayer.setGeoJSON(patrimoineGgeoJSON);
          this._buildLegend();
          this._buildBasemapList();
          this._patrimoineLayer.setFilter(function(f) {
            //if (parseInt(f.properties.niveau_operationnel) !== 0) return f;
            return parseInt(f.properties.niveau_operationnel) !== 0;
          });
        }

        let sous_secteursGeoJSON = response['sous-secteur'];
        if (typeof sous_secteursGeoJSON !== 'undefined') {
          this._classifySecteurs(sous_secteursGeoJSON);
          this._secteurLayer = L.mapbox.featureLayer(sous_secteursGeoJSON).addTo(this._map);
          //$.extend(sous_secteurs.features[0].properties, this._secteurDrawingProperties);
          //this._secteurLayer.setGeoJSON(sous_secteursGeoJSON);
          this._map.fitBounds(this._secteurLayer.getBounds());
        }
      } else {
      }
    },
    _buildBasemapList: function() {
      let self = this;
      /*
      let listContent = $(`
        <div id = "radioButtonContainerId" >
          <input type="radio" class="slds-badge legend-badge" name="basemap" value="streets" checked>World Street Map<br>
          <input type="radio" class="slds-badge legend-badge" name="basemap" value="imagery">World Imagery<br>
        </div>
      `);
      */
      let listContent = $(`
        <div class="slds-form-element__control" id="radioButtonContainerId" >
          <span class="slds-radio">
            <input type="radio" id="basempradio_streets" value="streets" name="basemap" checked="" />
            <label class="slds-radio__label" for="basempradio_streets">
              <span class="slds-radio_faux"></span>
              <span class="slds-form-element__label">Rues et avenues</span>
            </label>
          </span>
          <span class="slds-radio">
            <input type="radio" id="basemapradion_imagery" value="imagery" name="basemap" />
            <label class="slds-radio__label" for="basemapradion_imagery">
              <span class="slds-radio_faux"></span>
              <span class="slds-form-element__label">Satellite</span>
            </label>
          </span>
        </div>
      `);
      //
      listContent.find('input').click(function(e) {
        self._map.removeLayer(self._basemaps['streets']);
        self._map.removeLayer(self._basemaps['imagery']);
        self._map.addLayer(self._basemaps[$(this).val()]);
      });

      $('#dialog-body-basemap')
        .empty()
        .append(listContent);
    },
    _buildLegend: function() {
      const colorPalette = GGO.getDefaultColorPalette();
      let self = this;
      let lgdContent = $(`
        <div class="legend-label"> Niveau Opérationnel (NO) </div></div>
          <div class="slds-p-around_xx-small disabled-legend-item"><div class="slds-badge legend-badge filtered_no" style="background-color: ${colorPalette[0]};" data-no="0"></div><div class="legend-label">0</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[1]};" data-no="1"></div><div class="legend-label">1</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[2]};" data-no="2"></div><div class="legend-label">2</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[3]};" data-no="3"></div><div class="legend-label">3</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[4]};" data-no="4"></div><div class="legend-label">4</div></div>
          <div class="slds-p-around_xx-small"><div class="slds-badge legend-badge" style="background-color: ${colorPalette[5]};" data-no="5"></div><div class="legend-label">5</div></div>
        </div>
      `);

      lgdContent.find('.slds-badge[data-no="0"]').click(function(e) {
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
      if (typeof this._patrimoineLayer !== 'undefined') {
        this._patrimoineLayer.setFilter(function(f) {
          return !filteredNOValues.has(f.properties.niveau_operationnel);
        });
      }
    },
    _getColorForNiveauOpe: function(no) {
      const rdYlBu = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
      //const colorPalette = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'];
      const colorPalette = GGO.getDefaultColorPalette(); //rdYlBu;
      let noInt = parseInt(no);
      noInt = noInt % colorPalette.length;
      return colorPalette[noInt];
    },
    _getColorForRondesFin: function() {
      //const rdYlBu = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
      //const colorPalette = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'];
      const colorPalette = GGO.getColorPalette('rondes_fin'); //gris;
      return colorPalette;
    },
    _classifySecteurs: function(geojson) {
      let colors = GGO.getColorPalette('secteurs');
      geojson.features.forEach((f, i) => {
        let col = colors[i];
        $.extend(f.properties, this._secteurDrawingProperties, { fill: col, stroke: col });
      });
    },
    _classifyPatrimoine: function(geojson) {
      geojson.features.forEach(f => {
        f.properties['marker-size'] = 'small';
        f.properties['marker-symbol'] = f.properties['niveau_operationnel'];
        if (f.properties['ronde_finalisee'] == 't'){
          f.properties['marker-color'] = this._getColorForRondesFin();
        }
        else f.properties['marker-color'] = this._getColorForNiveauOpe(f.properties['niveau_operationnel']);
        f.properties['description'] = f.properties.codesite;
      });
    },
    onFeatureAddedToPatrimoineLayer: function(e) {
      let marker = e.layer;
      let feature = marker.feature;
      let props = feature.properties;
    },
    displayMission: function(missionGeoJSON) {
      if ((missionGeoJSON.features[0].properties.codesite !== 'BASE') & (missionGeoJSON.features[0].geometry.coordinates[0] == 2.312445) & (missionGeoJSON.features[0].geometry.coordinates[1] == 48.89391)) {
      } else {
        if (typeof this._missionLayer === 'undefined' || this._missionLayer === null) {
          this._missionLayer = L.mapbox
            .featureLayer()
            .addTo(this._map)
            .on('layeradd', function(l) {
              console.log('Layer added to mission layer', l);
              l.layer.options.zIndexOffset = 1000;
            });
        }

        let mission = missionGeoJSON.features[0];
        let markerProperties = {
          'marker-color': GGO.shadeHexColor(this._getColorForNiveauOpe(mission.properties['niveau_operationnel']), -0.15),
          'marker-symbol': mission.properties['niveau_operationnel'] || '',
          'marker-size': 'large'
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
      }
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

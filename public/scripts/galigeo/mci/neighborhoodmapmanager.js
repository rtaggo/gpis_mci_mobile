//const { getImmatPatCouple } = require('../../../../api/mci/dev-rest');

(function () {
  'use strict';
  GGO.NeighborhoodMapManager = function (options) {
    this._options = options || {};
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
    this._mapDivId = 'neightborhoodmap';
    L.mapbox.accessToken = this._options.mapboxAccessToken;
    this._token_ocean;

    this._secteurDrawingProperties = {
      stroke: '#FF00FF',
      'stroke-width': 1,
      'stroke-opacity': 1,
      fill: '#FF00FF',
      'fill-opacity': 0.7,
    };

    this.init();
  };

  GGO.NeighborhoodMapManager.prototype = {
    init: function () {
      this.setupListeners();
    },
    setupListeners: function () {
      let self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.NEIGHBORHOOD, function (e) {
        console.log('[GGO.NeighborhoodMapManager] Received GGO.EVENTS.NEIGHBORHOOD');
        self.buildPanel();
      });
    },
    buildPanel: function () {
      console.log(`buildPanel`);
      let panelContent = $(`
      <div id="neighborhoodMapPanel" class="slds-panel slds-panel_docked slds-panel_docked-left slds-is-open" aria-hidden="false" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;z-index:10000; overflow: hidden;">
        <div class="slds-panel__header">
          <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate">Où sont mes amis ?</h2>
          <button class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Panel Header">
            <svg class="slds-button__icon" aria-hidden="true">
              <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
            </svg>
            <span class="slds-assistive-text">Collapse Panel Header</span>
          </button>
        </div>
        <div class="slds-panel__body" style="height:calc(100% - 49px);position:relative;">
          <div id="neightborhoodmap" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0px;"></div>
        </div>
      </div>
      `);
      panelContent.find('.slds-panel__header button.slds-panel__close').click(function (e) {
        $('#neighborhoodMapPanel').remove();
      });
      $('#appContainer').append(panelContent);
      this.setupMap();
    },
    setupMap: function () {
      let streetsTL = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        minZoom: 1,
        maxZoom: 19,
      });
      this._map = L.map(this._mapDivId, {
        attributionControl: false,
        preferCanvas: true,
        zoomControl: false,
        contextmenu: true,
        contextmenuWidth: 140,
        layers: [streetsTL],
      }).setView([48.853507, 2.348015], 12);
      this.fetchNeighborhood();
      this.await_refresh_vehicles();
    },

    _getNeighborhoodURL: function () {
      console.log(this._options);
      if (this._options.userRole === 'india') {
        /*console.log(`Build neighborhood url for patrouille  ${JSON.stringify(this._options.patrouille)} with sectors ${JSON.stringify(this._options.secteurs)}`);*/
        return `${this._options.baseRESTServicesURL}/voisinage.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map((s) => s.id).join(',')}`;
      } else {
        /* case of charly or alpha */
        return `${this._options.baseRESTServicesURL}/voisinage.php?chefs_groupe=${this._options.chefsGroupe}&secteurs=${this._options.secteurs.join(',')}`;
      }
    },
    authenticateOcean: function () {
      let self = this;
      let restAuthURL = 'https://v3.oceansystem.com/ocean-3.0.0/restapi/auth/authenticate?login=galigeo1&password=GPIS03';
      $.ajax({
        type: 'POST',
        url: restAuthURL,
        success: function (response) {
          console.log(`${restAuthURL} token : `, response);
          self.fetchNeighborhoodVehicles(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${restAuthURL} Request aborted`);
          } else {
            console.error(`${restAuthURL} Error request: ${textStatus}`, errorThrown);
          }
        },
      });
    },

    getToken: function (callback) {
      let self = this;
      let restAuthURL = 'https://v3.oceansystem.com/ocean-3.0.0/restapi/auth/authenticate?login=galigeo1&password=GPIS03';
      $.ajax({
        type: 'POST',
        url: restAuthURL,
        success: function (response) {
          self._token_ocean = response.token;
          callback(self._token_ocean);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${restAuthURL} Request aborted`);
          } else {
            console.error(`${restAuthURL} Error request: ${textStatus}`, errorThrown);
          }
        },
      });
    },

    await_refresh_vehicles: function () {
      var self = this;
      self.refresh_vehicles();
      setInterval(function () {
        self.refresh_vehicles();
      }, GGO.CHECK_VEHICULES_INTERVALLE);
    },
    refresh_vehicles: function () {
      let self = this;

      this.getToken(function (token) {
        let positionsURL = `https://v3.oceansystem.com/ocean-3.0.0/restapi/mobility/v1/vehiclePositions?token=${token}`;
        $.ajax({
          type: 'GET',
          url: positionsURL,
          success: function (response) {
            if (response.vehicles) {
              console.log(`Refresh vehicles Response : `, response);
              self.convertVehiclePositionstoGEOJSON(response);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus === 'abort') {
              console.warn(`${positionsURL} Request aborted`);
            } else {
              console.error(`${positionsURL} Error request: ${textStatus}`, errorThrown);
            }
          },
        });
      });
    },
    fetchNeighborhoodVehicles: function (response) {
      let self = this;
      let token = response.token;
      let positionsURL = `https://v3.oceansystem.com/ocean-3.0.0/restapi/mobility/v1/vehiclePositions?token=${token}`;
      $.ajax({
        type: 'GET',
        url: positionsURL,
        success: function (response) {
          console.log(`${positionsURL} positions : `, response);
          self.convertVehiclePositionstoGEOJSON(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${positionsURL} Request aborted`);
          } else {
            console.error(`${positionsURL} Error request: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    convertVehiclePositionstoGEOJSON: function (response) {
      let self = this;
      var vehicles2 = response.vehicles;
      var vehiclesGgeoJSON = {};
      vehiclesGgeoJSON.type = 'FeatureCollection';
      vehiclesGgeoJSON.features = [];
      self.getImmatPatCouple(function (liste_immat_pat) {
        //const liste_immat = [...new Set(liste_immat_pat.map((s) => s.immatriculation_libelle))];
        var vehiclesGgeoJSON = {};
        vehiclesGgeoJSON.type = 'FeatureCollection';
        vehiclesGgeoJSON.features = [];
        for (var k in vehicles2) {
          if (vehicles2[k].position && vehicles2[k].position.latitudeY !== 85 && vehicles2[k].position.latitudeY !== 0) {
            //let patrouille_lib = liste_immat_pat.find((m) => m.immatriculation_libelle === vehicles2[k].imat);
            let vehicule = liste_immat_pat.immat_patrouilles.filter((s) => s.immatriculation_libelle === vehicles2[k].immat);
            //if (vehicule[0]) {let patrouille_lib = vehicule[0].patrouille_libelle};

            if (vehicule[0] && vehicule[0].patrouille_libelle) {
              let patrouille_lib = vehicule[0].patrouille_libelle;
              var newFeature = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [parseFloat(vehicles2[k].position.longitudeX), parseFloat(vehicles2[k].position.latitudeY)],
                },
                properties: {
                  immat: vehicles2[k].immat,
                  etat: vehicles2[k].position.etat,
                  patrouille: patrouille_lib,
                },
              };
            } else {
              var newFeature = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [parseFloat(vehicles2[k].position.longitudeX), parseFloat(vehicles2[k].position.latitudeY)],
                },
                properties: {
                  immat: vehicles2[k].immat,
                  etat: vehicles2[k].position.etat,
                },
              };
            }
            vehiclesGgeoJSON.features.push(newFeature);
          }
        }
        self.handleNeighborhoodVehiclesFetched(vehiclesGgeoJSON);
      });
    },
    fetchNeighborhood: function () {
      let self = this;
      //var restURL = `${this._options.baseRESTServicesURL}/voisinage.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map(s => s.id).join(',')}`;
      let restURL = this._getNeighborhoodURL();
      $.ajax({
        type: 'GET',
        url: restURL,
        success: function (response) {
          console.log(`${restURL} Response : `, response);
          self.handleNeighborhoodFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${restURL} Request aborted`);
          } else {
            console.error(`${restURL} Error request: ${textStatus}`, errorThrown);
          }
        },
      });
      /* if (callback) {
        callback();
      } */
    },
    handleNeighborhoodVehiclesFetched: function (response) {
      console.log('handleNeighborhoodVehiclesFetched', response);
      //console.log(response);
      response.features.forEach((f) => {
        f.properties['marker-size'] = 'small';
        //f.properties['marker-color'] = GGO.getColorForEtatVehicule(f.properties['etat']);
        f.properties['marker-color'] = '#000000';
        f.properties['marker-symbol'] = 'car';
        f.properties['description'] = f.properties.immat;
        //console.log(f.properties.statut_mission);
        //f.properties['description'] = `${f.properties.patrouille_id}`;
      });
      //this._map.removeLayer(this._vehiclesLayer);
      //map.removeLayer(marker);
      if (this._vehiclesLayer) {
        this._map.removeLayer(this._vehiclesLayer);
      }
      this._vehiclesLayer = L.mapbox.featureLayer().on('layeradd', this.onVehiclesAdded.bind(this)).addTo(this._map).setGeoJSON(response);
    },
    getImmatPatCouple: function (callback) {
      //let patrouille = this._selectedPatrouille;
      //let immatriculation = this._selectedImmatriculation;
      const self = this;
      const getImmatPatUrl = `${this._options.baseRESTServicesURL}/immat_patrouilles.php`;
      $.ajax({
        type: 'GET',
        url: getImmatPatUrl,
        success: function (response) {
          console.log(`${getImmatPatUrl} Get Liste Correspondance Patrouille-Vehicule: `, response);
          if (callback) {
            callback(response);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`Get Correspondance Patrouille-Vehicule  ${getImmatPatUrl} Request aborted`);
          } else {
            console.error(`Get Correspondance Patrouille-Vehicule ${getImmatPatUrl} request: ${textStatus}`, errorThrown);
          }
        },
      });
      //self.handleNeighborhoodVehiclesFetched(vehiclesGgeoJSON);
    },

    handleNeighborhoodFetched: function (response) {
      console.log('handleNeighborhoodFetched', response);
      let zoomDone = false;
      /*
        on pourrait faire: 
        let colors = [...GGO.getColorPalette('secteurs')].reverse()
        [...GGO.getColorPalette('secteurs')] : clone du tableau (car reverse affecte le tableau source)
      */
      let colors = GGO.getColorPalette('secteurs_voisinages');
      if (typeof response.sous_secteur !== 'undefined') {
        response.sous_secteur.features.forEach((f, i) => {
          f.properties['description'] = `Sous-Secteur ${f.properties.name_sous_secteur}`;
          let col = colors[i];
          $.extend(f.properties, this._secteurDrawingProperties, { fill: col, stroke: col });
        });
        this._secteurLayer = L.mapbox.featureLayer().addTo(this._map).setGeoJSON(response.sous_secteur);
        //this._map.fitBounds(this._secteurLayer.getBounds());
        zoomDone = true;
      }
      if (typeof response.secteur !== 'undefined') {
        response.secteur.features.forEach((f, i) => {
          f.properties['description'] = `Secteur ${f.properties.name_sous_secteur}`;
          let col = colors[i];
          $.extend(f.properties, this._secteurDrawingProperties, { fill: col, stroke: col });
        });
        this._secteurLayer = L.mapbox.featureLayer().addTo(this._map).setGeoJSON(response.secteur);
        //this._map.fitBounds(this._secteurLayer.getBounds());
        zoomDone = true;
      }
      if (typeof response.chef_groupe !== 'undefined') {
        // response.chef_groupe.features.forEach((f, i) => {
        //   f.properties['marker-size'] = 'small';
        // });
        this._secteurLayer = L.mapbox
          .featureLayer(response.chef_groupe, {
            pointToLayer: function (feature, latlng) {
              let geojsonMarkerOptions = {
                radius: 6,
                fillColor: feature.properties['marker-color'],
                color: '#808080',
                weight: 1,
                opacity: 0,
                fillOpacity: 0,
              };
              let lyr = L.circleMarker(latlng, geojsonMarkerOptions);
              return lyr;
            },
          })
          .addTo(this._map)
          .on('layeradd', this.onChefGroupeAdded.bind(this))
          .setGeoJSON(response.chef_groupe);
        zoomDone = true;
      }
      if (typeof response.mission_ronde !== 'undefined') {
        response.mission_ronde.features.forEach((f) => {
          f.properties['marker-size'] = 'small';
          if (parseInt(f.properties.type_mission_id) == 6) {
            if (parseInt(f.properties.motif_id) == 1) {
              f.properties['marker-symbol'] = 'music';
            } else if (parseInt(f.properties.motif_id) == 2) {
              f.properties['marker-symbol'] = 'pitch';
            } else f.properties['marker-symbol'] = 'fire-station';
          }
          f.properties['marker-color'] = GGO.getColorForStatutMission(parseInt(f.properties.statut_mission));
          f.properties['description'] = f.properties.codesite;
          //console.log(f.properties.statut_mission);
          //f.properties['description'] = `${f.properties.patrouille_id}`;
        });
        this._lastMissionsLayer = L.mapbox.featureLayer().addTo(this._map).on('layeradd', this.onMissionsAdded.bind(this)).setGeoJSON(response.mission_ronde);
        if (!zoomDone) {
          //this._map.fitBounds(this._lastMissionsLayer.getBounds());
        }
      }
    },
    /* J'ai déplacé la méthode dans galigeo.js ==> GGO.getColorForStatutMission
    _getColorForStatutMission: function(statut) {
      if (statut == 1) {
        return '#FFC100';
      } else if (statut == 2) {
        return '#0070d2';
      } else if (statut == 5) {
        return '#4bca81';
      }
    },
    */
    onMissionsAdded: function (e) {
      let marker = e.layer;
      marker
        .bindTooltip(`${marker.feature.properties['name_patrouille']}`, {
          offset: L.point(0, -22),
          direction: 'top',
          noHide: true,
          permanent: true,
          className: 'class-tooltip',
        })
        .openTooltip();
    },
    onChefGroupeAdded: function (e) {
      let marker = e.layer;
      marker
        .bindTooltip(`${marker.feature.properties['libelle']}`, {
          offset: L.point(0, 0),
          direction: 'top',
          noHide: true,
          permanent: true,
          className: 'class-tooltip-ChefGroupe',
        })
        .openTooltip();
    },
    onVehiclesAdded: function (e) {
      let marker = e.layer;
      //marker(marker, { zIndexOffset: 150 });
      marker.setZIndexOffset(-100);
      if (marker.feature.properties['patrouille']) {
        marker.bindTooltip(`${marker.feature.properties['patrouille']}`, {
          offset: L.point(0, 3),
          direction: 'bottom',
          noHide: true,
          permanent: true,
          className: 'class-tooltip-vehicle',
        });
        marker.openTooltip();
      } /*else {
        marker.bindTooltip(`${marker.feature.properties['immat']}`, {
          offset: L.point(0, 3),
          direction: 'bottom',
          noHide: true,
          permanent: true,
          className: 'class-tooltip-Vehicle',
        });
      } 
      marker.openTooltip();*/
    },
  };

  GGO.NeighborhoodMapManagerSingleton = (function () {
    let instance;
    function createInstance(options) {
      let missionMgr = new GGO.NeighborhoodMapManager(options);
      return missionMgr;
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

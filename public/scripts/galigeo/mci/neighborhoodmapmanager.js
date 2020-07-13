(function() {
  'use strict';
  GGO.NeighborhoodMapManager = function(options) {
    this._options = options || {};
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
    this._mapDivId = 'neightborhoodmap';
    L.mapbox.accessToken = this._options.mapboxAccessToken;

    this._secteurDrawingProperties = {
      stroke: '#FF00FF',
      'stroke-width': 1,
      'stroke-opacity': 1,
      fill: '#FF00FF',
      'fill-opacity': 0.7
    };

    this.init();
  };

  GGO.NeighborhoodMapManager.prototype = {
    init: function() {
      this.setupListeners();
    },
    setupListeners: function() {
      let self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.NEIGHBORHOOD, function(e) {
        console.log('[GGO.NeighborhoodMapManager] Received GGO.EVENTS.NEIGHBORHOOD');
        self.buildPanel();
      });
    },
    buildPanel: function() {
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
      panelContent.find('.slds-panel__header button.slds-panel__close').click(function(e) {
        $('#neighborhoodMapPanel').remove();
      });
      $('#appContainer').append(panelContent);
      this.setupMap();
    },
    setupMap: function() {
      let streetsTL = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        minZoom: 1,
        maxZoom: 19
      });
      this._map = L.map(this._mapDivId, {
        attributionControl: false,
        preferCanvas: true,
        zoomControl: false,
        contextmenu: true,
        contextmenuWidth: 140,
        layers: [streetsTL]
      }).setView([48.853507, 2.348015], 12);
      this.fetchNeighborhood();
    },
    _getNeighborhoodURL: function() {
      console.log(this._options);
      if (this._options.userRole === 'india') {
        /*console.log(`Build neighborhood url for patrouille  ${JSON.stringify(this._options.patrouille)} with sectors ${JSON.stringify(this._options.secteurs)}`);*/
        return `${this._options.baseRESTServicesURL}/voisinage.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map(s => s.id).join(',')}`;
      } else {
        /* case of charly or alpha */
        return `${this._options.baseRESTServicesURL}/voisinage.php?chefs_groupe=${this._options.chefsGroupe}&secteurs=${this._options.secteurs.join(',')}`;
      }
    },
    fetchNeighborhood: function() {
      let self = this;
      //var restURL = `${this._options.baseRESTServicesURL}/voisinage.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map(s => s.id).join(',')}`;
      let restURL = this._getNeighborhoodURL();
      $.ajax({
        type: 'GET',
        url: restURL,
        success: function(response) {
          console.log(`${restURL} Response : `, response);
          self.handleNeighborhoodFetched(response);
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
    handleNeighborhoodFetched: function(response) {
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
        this._secteurLayer = L.mapbox
          .featureLayer()
          .addTo(this._map)
          .setGeoJSON(response.sous_secteur);
        //this._map.fitBounds(this._secteurLayer.getBounds());
        zoomDone = true;
      }
      if (typeof response.secteur !== 'undefined') {
        response.secteur.features.forEach((f, i) => {
          f.properties['description'] = `Secteur ${f.properties.name_sous_secteur}`;
          let col = colors[i];
          $.extend(f.properties, this._secteurDrawingProperties, { fill: col, stroke: col });
        });
        this._secteurLayer = L.mapbox
          .featureLayer()
          .addTo(this._map)
          .setGeoJSON(response.secteur);
        //this._map.fitBounds(this._secteurLayer.getBounds());
        zoomDone = true;
      }
      if (typeof response.chef_groupe !== 'undefined') {
        // response.chef_groupe.features.forEach((f, i) => {
        //   f.properties['marker-size'] = 'small';
        // });
        this._secteurLayer = L.mapbox
          .featureLayer(response.chef_groupe, {
            pointToLayer: function(feature, latlng) {
              let geojsonMarkerOptions = {
                radius: 6,
                fillColor: feature.properties['marker-color'],
                color: '#808080',
                weight: 1,
                opacity: 0,
                fillOpacity: 0
              };
              let lyr = L.circleMarker(latlng, geojsonMarkerOptions);
              return lyr;
            }
          })
          .addTo(this._map)
          .on('layeradd', this.onChefGroupeAdded.bind(this))
          .setGeoJSON(response.chef_groupe);
        zoomDone = true;
      }
      if (typeof response.mission_ronde !== 'undefined') {
        response.mission_ronde.features.forEach(f => {
          f.properties['marker-size'] = 'small';
          if (parseInt(f.properties.type_mission_id) == 6) {
            if (parseInt(f.properties.motif_id) == 1) {
              f.properties['marker-symbol'] = 'music'; 
            }
            else f.properties['marker-symbol'] = 'warehouse';
          }
          f.properties['marker-color'] = GGO.getColorForStatutMission(parseInt(f.properties.statut_mission));
          f.properties['description'] = f.properties.codesite;
          console.log(f.properties.statut_mission);
          //f.properties['description'] = `${f.properties.patrouille_id}`;
        });
        this._lastMissionsLayer = L.mapbox
          .featureLayer()
          .addTo(this._map)
          .on('layeradd', this.onMissionsAdded.bind(this))
          .setGeoJSON(response.mission_ronde);
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
    onMissionsAdded: function(e) {
      let marker = e.layer;
      marker
        .bindTooltip(`${marker.feature.properties['name_patrouille']}`, {
          offset: L.point(0, -22),
          direction: 'top',
          noHide: true,
          permanent: true,
          className: 'class-tooltip'
        })
        .openTooltip();
    },
    onChefGroupeAdded: function(e) {
      let marker = e.layer;
      marker
        .bindTooltip(`${marker.feature.properties['libelle']}`, {
          offset: L.point(0, 0),
          direction: 'top',
          noHide: true,
          permanent: true,
          className: 'class-tooltip-ChefGroupe'
        })
        .openTooltip();
    }
  };

  GGO.NeighborhoodMapManagerSingleton = (function() {
    let instance;
    function createInstance(options) {
      let missionMgr = new GGO.NeighborhoodMapManager(options);
      return missionMgr;
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

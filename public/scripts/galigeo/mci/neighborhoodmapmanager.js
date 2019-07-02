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
          <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate">Où sont mes amis?</h2>
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
    fetchNeighborhood: function() {
      console.warn(`TODO: fetch neighborhood for patrouille  ${JSON.stringify(this._options.patrouille)} with sectors ${JSON.stringify(this._options.secteurs)}`);
      let self = this;
      var restURL = `${this._options.baseRESTServicesURL}/voisinage.php?patrouille=${this._options.patrouille.id}&sssecteurs=${this._options.secteurs.map(s => s.id).join(',')}`;
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
      if (typeof response.mission_ronde !== 'undefined') {
        response.mission_ronde.features.forEach(f => {
          f.properties['marker-size'] = 'small';
          //f.properties['description'] = `Patrouille ${f.properties.patrouille_id}`;
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
    onMissionsAdded: function(e) {
      let marker = e.layer;
      marker
        .bindTooltip(`Patrouille ${marker.feature.properties['name_patrouille']}`, {
          offset: L.point(0, -22),
          direction: 'top',
          noHide: true,
          permanent: true
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

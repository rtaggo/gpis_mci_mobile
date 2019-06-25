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
      'fill-opacity': 0.1
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
      <div id="neighborhoodMapPanel" class="slds-panel slds-panel_docked slds-panel_docked-left slds-is-open" aria-hidden="false" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;z-index:10000;">
        <div class="slds-panel__header">
          <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate">Voisinage</h2>
          <button class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Panel Header">
            <svg class="slds-button__icon" aria-hidden="true">
              <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
            </svg>
            <span class="slds-assistive-text">Collapse Panel Header</span>
          </button>
        </div>
        <div class="slds-panel__body" style="height:100%;position:relative;">
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
      }).setView([0, 0], 2);
      this.fetchNeighborhood();
    },
    fetchNeighborhood: function() {
      console.warn(`TODO: fetch neighborhood for patrouille  ${JSON.stringify(this._options.patrouille)} with sectors ${JSON.stringify(this._options.secteurs)}`);
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

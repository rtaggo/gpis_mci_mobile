(function() {
	'use strict';
  GGO.UIManager = function(options) {
    this._options = options || {};
    this._stations = {
      elephantbleu : {
        stations: []
      },
      concurrence : {
        stations: []
      }
    };
		this._init();
	};

  GGO.UIManager.prototype = {
    _init: function() {

      this._viewSize = {
        width: $(window).width(),
        height: this._options.windowHeight || $(window).height()
      };
      this._viewSize.halfHeight = (this._viewSize.height/2);
      this._viewSize.thirdHeight = (this._viewSize.height/3);
      this._viewSize.heightThreshold = (this._viewSize.height/7);
      $('#dataExplorerCard').css({
        'max-height' : (this._viewSize.thirdHeight) + 'px'
      });
      $('#dataExplorerCard .slds-card__body').css({
        'height' :  (this._viewSize.thirdHeight-20) + 'px',
        'max-height' :  (this._viewSize.thirdHeight-20) + 'px'
      });
      this._setupListeners();
    },
    _setupListeners: function() {
      var self = this;
      $('#swiper_handle').swipe( {
        swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
          if (phase !== "cancel" && phase !== "end") {
            if (fingerData[0].end.y < (self._viewSize.height - 20)) {
              var tempCardHeight = (self._viewSize.height - fingerData[0].end.y);
              $('#dataExplorerCard').css({
                'height': (tempCardHeight),
                'max-height': (tempCardHeight),
              });
              tempCardHeight -= 20;
              $('#dataExplorerCard .slds-card__body').css({
                'height' : tempCardHeight + 'px',
                'max-height' : tempCardHeight + 'px'
              });
            } 
            if (fingerData[0].end.y < (self._viewSize.halfHeight)) {
              $('#locateuser_container').addClass('slds-hide');
            } else {
              $('#locateuser_container').removeClass('slds-hide');
            }
          } else if ( phase === "end") {
            console.log('ENDED fingerData: ' + JSON.stringify(fingerData[0]));
            self._handleSwipeUpDownEnd(direction, fingerData[0]);
          }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:0
      });
      $('#layerSwitcherIcon').click(function(e){
        $('#layerSwitcherCard').toggleClass('slds-hide');
      });
      $('#locateUserIcon').click(function(e){
        GGO.EventBus.dispatch(GGO.EVENTS.ZOOMTOUSERLOCATION);
      });
      $('#layerSwitcherCard .slds-card__header button').click(function(e){
        $('#layerSwitcherCard').addClass('slds-hide');
      });
      $('#layerSwitcherCard').css('height', this._viewSize.thirdHeight + 'px');
      $('.basemap_icons_container .basemap_icon').click(function(e){
        var basemapClicked = $(this).attr('data-basemap');
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        console.log('Basemap to display: ' + basemapClicked);
        GGO.EventBus.dispatch(GGO.EVENTS.SWITCHBASEMAP, basemapClicked);
      });

      $('.map_details_container .layer_details').click(function(e){
        var layerClicked = $(this).attr('data-layer');
        $(this).toggleClass('selected');
        var isVisible = $(this).hasClass('selected');
        console.log('Layer ' + layerClicked + ' is toggled to ' + (isVisible?'visible': 'hidden'));
        if (!isVisible) {
          //self._stations[layerClicked].stations = [];
          self.renderStations({
            request_parameters: {
              layer : layerClicked
            }, 
            stations: []
          });
        }
        var dataToSend = {
          layer : layerClicked,
          visible : isVisible
        };
        GGO.EventBus.dispatch(GGO.EVENTS.TOGGLELAYER, dataToSend);
        $('#layerSwitcherCard .slds-card__header button').trigger('click');
      });
      // RENDERSTATIONS
      GGO.EventBus.addEventListener(GGO.EVENTS.RENDERSTATIONS, function(e) {
        var data = e.target;
        console.log('UIManager Received GGO.EVENTS.RENDERSTATIONS', data);
        self.renderStations(data);
      });
      // RENDERSTATIONS
      GGO.EventBus.addEventListener(GGO.EVENTS.MAPMARKERCLICKED, function(e) {
        var data = e.target;
        console.log('UIManager Received GGO.EVENTS.MAPMARKERCLICKED', data);
        self.scrollToCarWash(data);
      });
    },
    scrollToCarWash: function(data) {
      console.log('scrollToCarWash', data);
      $('#elephantbleuStations_Container > ul > li.slds-item').removeClass('selected');
      var tgtElt = $('#elephantbleuStations_Container > ul > li .station-title_container[data-stationid="'+data.stationId+'"]').parent().parent().addClass('selected');
      var targetOffset = tgtElt.offset().top;
      $('#elephantbleuStations_Container').scrollTo(tgtElt);
    },
    renderStations: function(data){
      var self = this;    
      var ctnr = $('#elephantbleuStations_Container').empty();
      var theUL = $('<ul class="slds-has-dividers_bottom-space"></ul>');
      if (data.request_parameters.layer === 'elephantbleu') {
        this._stations.elephantbleu.stations = data.stations;
      } else if (data.request_parameters.layer === 'concurrence') {
        this._stations.concurrence.stations = data.stations;
      }
      var allStations =  this._stations.elephantbleu.stations.concat( this._stations.concurrence.stations);
      allStations.sort(function(a, b){
        return a.getDistance() - b.getDistance();
      })
      $.each(allStations, function(idx, val){
        theUL.append($('<li class="slds-item"></li>').append(val.renderHTML()));
      });
      theUL.find('.station-title_container').click(function(e){
        var stationId = $(this).attr('data-stationid');
        var layerType = $(this).attr('data-layertype');
        console.log('Click on on title for station id = ' + stationId + ' ==> TODO: zoom to it');
        var ggparent = $(e.currentTarget).parent().parent();
        ggparent.siblings().removeClass('selected');
        ggparent.addClass('selected');        
        GGO.EventBus.dispatch(GGO.EVENTS.ZOOMTOSTATION, {stationId: stationId, layer: layerType});
      });
      theUL.find('.station-title_container .slds-icon').click(function(e){
        var stationId = $(this).attr('data-stationid');
        var layerType = $(this).attr('data-layertype');
        console.log('Click on icon to display information for station id = ' + stationId);
        self.findStationForDetails(stationId, layerType);
      });
      /*
      theUL.find('.station-title_container .station-title').click(function(e){
        var stationId = $(this).attr('data-stationid');
        console.log('Click on on title for station id = ' + stationId + ' ==> TODO: zoom to it');
        GGO.EventBus.dispatch(GGO.EVENTS.ZOOMTOSTATION, {stationId: stationId, layer: 'elephantbleu'});
      });
      */
      ctnr.append(theUL);
    },
    findStationForDetails: function(stationId, layer){
      try {
        var stations = this._stations[layer].stations;
        var nbStations = stations.length;
        var s, station;
        for (s = 0; s<nbStations; s++) {
          station = stations[s];
          if (station.getId() === stationId){
            this.showStationDetails(station);
            break;
          } 
        }
      } catch (e){
        console.error('Error in findStationForDetails method', e);
      }
    },
    showStationDetails: function(station){
      console.log('showStationDetails', station);
      var self = this;
      this._currentStation = station;
      this._detailsPanel = $('<div class="slds-panel slds-is-open slds-size_full station-details_panel" aria-hidden="false"></div>');
      var backBtn = $('<button class="slds-button slds-button_icon slds-button_icon-small slds-panel__back" title="Collapse Panel Header"></button>')
        .append($('<svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#back"></use></svg>'));
      var editBtn = $('<button class="slds-button slds-button_icon slds-button_icon-small slds-panel__back" title="Collapse Panel Header"></button>')
        .append($('<svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#edit"></use></svg>'));
      this._detailsPanel
        .append($('<div class="slds-panel__header"></div>')
          .append(backBtn)
          .append($('<h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Station de '+this._currentStation.getTitle()+'</h2>'))
          .append(editBtn)
      );
      backBtn.click(function(e){
        self._detailsPanel.remove();
      });
      editBtn.click(function(e){
        self.displayEditForm();
      });
      
      var panelBody = $('<div class="slds-panel__body"></div>');
      // TODO: append station details in panelBody
      this._currentStation.buildDetailsView(panelBody);
      this._detailsPanel.append(panelBody);
      $('#mainAppContainer').prepend(this._detailsPanel);
    },
    displayEditForm: function() {
      var self = this;
      this._editPanel = $('<div id="edit_panel" class="slds-panel slds-is-open slds-size_full station-details_panel" aria-hidden="false"></div>').css('z-index', '10');
      var cancelBtn = $('<button class="slds-button slds-button_neutral">Annuler</button>');
      var okBtn = $('<button class="slds-button slds-button_neutral">Valider</button>');
      this._editPanel
        .append($('<div class="slds-panel__header"></div>')
          .append(cancelBtn)
          .append($('<h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header"></h2>'))
          .append(okBtn)
      );
      cancelBtn.click(function(e){
        self._editPanel.remove();
      });      
      okBtn.click(function(e){
        //self.displayEditForm();
        //alert('TODO: save action...');
        var notifyContainer = $('<div class="slds-region_narrow slds-is-relative"></div>')
          .append($('<div class="slds-notify_container slds-is-absolute"></div>')
            .append($('<div class="slds-notify slds-notify_toast slds-theme_info" role="status"></div>')
              .append($('<div class="slds-notify__content"></div>')
                .append($('<div role="status" class="slds-spinner slds-spinner_x-small slds-spinner_inline" style="display: inline-block; top: 10px;"></div>')
                  .append($('<span class="slds-assistive-text">Loading</span>'))
                  .append($('<div class="slds-spinner__dot-a"></div>'))
                  .append($('<div class="slds-spinner__dot-b"></div>')))
                .append($('<h2 class="slds-text-heading_small" style="display: inline-block; margin-left: 10px;">Enregistrement en cours ...</h2>'))
              )
            )
          );

        $('#mainAppContainer').append(notifyContainer);
        setTimeout(function(e){
          self.onSaveCompleted();     
          self._editPanel.remove();
        }, 2000);
      });
      
      var panelBody = $('<div class="slds-panel__body"></div>');
      this._currentStation.buildEditView(panelBody);
      this._editPanel.append(panelBody);
      $('#mainAppContainer').prepend(this._editPanel);
    },
    onSaveCompleted: function() {
      $('.slds-region_narrow').remove();
        var notifySuccessContainer = $('<div class="slds-region_narrow slds-is-relative"></div>')
        .append($('<div class="slds-notify_container slds-is-absolute"></div>')
          .append($('<div class="slds-notify slds-notify_toast slds-theme_success" role="status"></div>')
            .append($('<span class="slds-icon_container slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top" title="Description of icon when needed">')
              .append($('<svg class="slds-icon slds-icon_small" aria-hidden="true"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#success" /></svg>'))
            )
            .append($('<div class="slds-notify__content"></div>')
              .append($('<h2 class="slds-text-heading_small" style="display: inline-block; margin-left: 10px;">'+this._currentStation.getTitle() + ' mis à jour.</h2>'))
            )
          )
        );
        $('#mainAppContainer').append(notifySuccessContainer);
        setTimeout(function(e){
          $('.slds-region_narrow').remove();
        }, 1000);
    }, 
    _handleSwipeUpDownEnd: function(direction, data) {
      var self = this;
      var bCardHeight = 24;
      switch (direction) {
        case 'up' : 
          bCardHeight = (data.end.y < (this._viewSize.halfHeight - this._viewSize.heightThreshold)) ? this._viewSize.height : this._viewSize.thirdHeight;
          break;
        case 'down' : 
          bCardHeight = (data.end.y > (this._viewSize.thirdHeight + 2*this._viewSize.heightThreshold)) ? bCardHeight : this._viewSize.thirdHeight;
          break;
        default:
          console.log('Direction \''+direction+'\' not supported');
          bCardHeight = this._viewSize.thirdHeight;
      }
      $('#dataExplorerCard').css({
        'height' : bCardHeight + 'px',
        'max-height' : bCardHeight + 'px'
      });
      bCardHeight -= 20;
      $('#dataExplorerCard .slds-card__body').css({
        'height' : bCardHeight + 'px',
        'max-height' : bCardHeight + 'px'
      });
    },
    registerSwipes: function() {
      
    }
  };
})();

(function() {
  'use strict';
  GGO.UIManager = function(options) {
    this._options = options || {};
    this._init();
  };

  GGO.UIManager.prototype = {
    _init: function() {
      this._viewSize = {
        width: $(window).width(),
        height: this._options.windowHeight || $(window).height()
      };
      this._viewSize.halfHeight = this._viewSize.height / 2;
      this._viewSize.twothirdHeight = this._viewSize.height * (2 / 3);
      this._viewSize.thirdHeight = this._viewSize.height / 3;
      this._viewSize.heightThreshold = this._viewSize.height / 7;
      $('#map').css({
        height: this._viewSize.thirdHeight + 'px'
      });
      $('#mission-card-Container').css({
        'max-height': this._viewSize.twothirdHeight + 'px'
      });
      $('#mission-card-Container .slds-card__body').css({
        height: this._viewSize.twothirdHeight - 20 + 'px',
        'max-height': this._viewSize.twothirdHeight - 20 + 'px'
      });
      this._setupListeners();
    },
    _setupListeners: function() {
      let self = this;
      $('#neighborhoodIcon').click(function(e) {
        GGO.EventBus.dispatch(GGO.EVENTS.NEIGHBORHOOD);
      });
      $('#legendIcon').click(function(e) {
        if ($('#legend_popover').hasClass('slds-hide')) {
          $('#topleft_container .slds-popover').addClass('slds-hide');
        }
        $('#legend_popover').toggleClass('slds-hide');
        self.updateActivite(JSON.parse(sessionStorage.patrouille).id);
      });
      $('#basemapIcon').click(function(e) {
        if ($('#basemap_popover').hasClass('slds-hide')) {
          $('#topleft_container .slds-popover').addClass('slds-hide');
        }
        $('#basemap_popover').toggleClass('slds-hide');
        self.updateActivite(JSON.parse(sessionStorage.patrouille).id);
      });
      $('#swiper_handle').swipe({
        swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
          if (phase !== 'cancel' && phase !== 'end') {
            //$('#legend_popover').addClass('slds-hide');
            $('#topleft_container .slds-popover').addClass('slds-hide');

            if (fingerData[0].end.y < self._viewSize.height - 20) {
              var tempCardHeight = self._viewSize.height - fingerData[0].end.y;
              $('#mission-card-Container').css({
                height: tempCardHeight,
                'max-height': tempCardHeight
              });
              tempCardHeight -= 20;
              $('#mission-card-Container .slds-card__body').css({
                height: tempCardHeight + 'px',
                'max-height': tempCardHeight + 'px'
              });
            }
          } else if (phase === 'end') {
            console.log('ENDED fingerData: ' + JSON.stringify(fingerData[0]));
            self._handleSwipeUpDownEnd(direction, fingerData[0]);
          }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold: 0
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
    _handleSwipeUpDownEnd: function(direction, data) {
      var self = this;
      var bCardHeight = 24;
      switch (direction) {
        case 'up':
          //bCardHeight = data.end.y < this._viewSize.halfHeight - this._viewSize.heightThreshold ? this._viewSize.height : this._viewSize.twothirdHeight;
          /*
          if (data.end.y < this._viewSize.thirdHeight - this._viewSize.heightThreshold) {
            bCardHeight = this._viewSize.height;
          } else if ((data.end.y > this._viewSize.thirdHeight - this._viewSize.heightThreshold && data.end.y > this._viewSize.thirdHeight + this._viewSize.heightThreshold) || data.end.y >= this._viewSize.halfHeight) {
            bCardHeight = this._viewSize.twothirdHeight;
          } else {
            bCardHeight = this._viewSize.thirdHeight;
          }
          */
          if (data.end.y < this._viewSize.halfHeight) {
            if (data.end.y < this._viewSize.thirdHeight - this._viewSize.heightThreshold) {
              bCardHeight = this._viewSize.height;
            } else {
              bCardHeight = this._viewSize.twothirdHeight;
            }
          } else {
            bCardHeight = this._viewSize.thirdHeight;
            /*
            if (data.end.y < this._viewSize.twothirdHeight - this._viewSize.heightThreshold) {
              bCardHeight = this._viewSize.height;
            } else {
              bCardHeight = this._viewSize.twothirdHeight;
            }
            */
          }
          break;
        case 'down':
          //bCardHeight = data.end.y > this._viewSize.thirdHeight + 2 * this._viewSize.heightThreshold ? bCardHeight : this._viewSize.thirdHeight;
          /*
          if (data.end.y < this._viewSize.halfHeight) {
            bCardHeight = this._viewSize.twothirdHeight;
          } else {
            if (data.end.y < this._viewSize.twothirdHeight) {
              bCardHeight = this._viewSize.thirdHeight;
            }
          }
          */
          if (data.end.y < this._viewSize.thirdHeight) {
            bCardHeight = this._viewSize.twothirdHeight;
          } else {
            if (data.end.y < this._viewSize.twothirdHeight) {
              bCardHeight = this._viewSize.thirdHeight;
            }
          }
          break;
        default:
          console.log("Direction '" + direction + "' not supported");
          bCardHeight = this._viewSize.twothirdHeight;
      }
      if (bCardHeight < 72) {
        bCardHeight = 72;
      }
      $('#mission-card-Container').css({
        height: bCardHeight + 'px',
        'max-height': bCardHeight + 'px'
      });
      bCardHeight -= 20;
      $('#mission-card-Container .slds-card__body').css({
        height: bCardHeight + 'px',
        'max-height': bCardHeight + 'px'
      });
      /*
      if (bCardHeight < 32) {
        $('#missionFooter').addClass('slds-hide');
      } else {
        $('#missionFooter').removeClass('slds-hide');
      }
      */
      $('#map').css({
        height: this._viewSize.height - bCardHeight + 'px'
      });
      GGO.EventBus.dispatch(GGO.EVENTS.INVALIDATEMAPSIZE);
    }
  };

  GGO.UIManagerSingleton = (function() {
    let instance;
    function createInstance(options) {
      let uiMgr = new GGO.UIManager(options);
      return uiMgr;
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

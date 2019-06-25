/* START GGO: put code below in galigeo.js */
(function() {
  'use strict';
  var GGO = {
    version: 'GGO.0.0.1'
  };

  function expose() {
    var oldGGO = window.GGO;

    GGO.noConflict = function() {
      window.GGO = oldGGO;
      return this;
    };

    window.GGO = GGO;
  }

  /* define GGO for Node module pattern loaders, including Browserify */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = GGO;

    /* define GGO as an AMD module */
  } else if (typeof define === 'function' && define.amd) {
    define(GGO);
  }

  /* define GGO as a global GGO variable, saving the original GGO to restore later if needed */
  if (typeof window !== 'undefined') {
    expose();
  }

  GGO.SessionIssuePrompt = function(title, message, container) {
    container.empty().append(`
        <section role="alertdialog" tabindex="0" aria-labelledby="prompt-heading-id" aria-describedby="prompt-message-wrapper" class="slds-modal slds-fade-in-open slds-modal_prompt" aria-modal="true">
          <div class="slds-modal__container">
            <header class="slds-modal__header slds-theme_error slds-theme_alert-texture">
              <h2 class="slds-text-heading_medium" id="prompt-heading-id">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_medium" id="prompt-message-wrapper">
              <p>${message}</p>
            </div>
            <footer class="slds-modal__footer slds-theme_default">
              <button class="slds-button slds-button_neutral">Reconnection</button>
            </footer>
          </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open"></div>
    `);
    $('#appContainer footer > button.slds-button').click(function(e) {
      GGO.disconnect();
      /*
      sessionStorage.clear();
      var logoutForm = $('<form action="/logout" />');

      $('body').append(logoutForm);
      logoutForm.submit();
      */
    });
  };

  GGO.getRandomInteger = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };
  GGO.invertColor = function(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xffffff ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ('000000' + color).slice(-6); // pad with leading zeros
    color = '#' + color; // prepend #
    return color;
  };

  GGO.formatDistance = function(distanceKM) {
    if (distanceKM < 1) {
      return (distanceKM * 1000).toFixed(0) + ' m';
    } else {
      return distanceKM.toFixed(2) + ' km';
    }
  };

  GGO.CHECK_MISSION_INTERVALLE = 4000;
  GGO.COLORPALETTES = {
    rdYlBu: ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'],
    secteurs: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'],
    secteurs_voisinages: ['#d9d9d9', '#fccde5', '#b3de69', '#fdb462', '#80b1d3', '#fb8072', '#bebada', '#ffffb3', '#8dd3c7']
  };

  GGO.getDefaultColorPalette = function() {
    return GGO.COLORPALETTES['rdYlBu'];
  };

  GGO.getColorPalette = function(paletteName) {
    return GGO.COLORPALETTES[paletteName] || GGO.getDefaultColorPalette();
  };

  GGO.revokePatrouille = function(patrouilleId, options) {
    if (typeof patrouilleId !== 'undefined') {
      const patrouillesUrl = `${options.baseRESTServicesURL}/liberer_patrouille.php?patrouille=${patrouilleId}`;
      $.ajax({
        type: 'GET',
        url: patrouillesUrl,
        success: function(response) {
          if (typeof options.callback === 'function') {
            options.callback.apply(options.context);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`REVOKEPATROUILLE  ${patrouillesUrl} Request aborted`);
          } else {
            console.error(`REVOKEPATROUILLE Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
          }
          if (typeof options.callback === 'function') {
            options.callback.apply(options.context);
          }
        }
      });
    }
  };

  GGO.disconnect = function(patrouilleId, options) {
    sessionStorage.clear();
    if (typeof patrouilleId !== 'undefined') {
      const patrouillesUrl = `${options.baseRESTServicesURL}/liberer_patrouille.php?patrouille=${patrouilleId}`;
      $.ajax({
        type: 'GET',
        url: patrouillesUrl,
        success: function(response) {
          console.log(`Revoke Patrouille response: `, response);
          GGO.postLogoutForm();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${patrouillesUrl} Request aborted`);
          } else {
            console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
          }
          GGO.postLogoutForm();
        }
      });
    } else {
      GGO.postLogoutForm();
    }
  };

  GGO.postLogoutForm = function() {
    var logoutForm = $('<form action="/logout" />');
    $('body').append(logoutForm);
    logoutForm.submit();
  };

  GGO.EVENTS = {
    APPISREDAY: 'appisready',
    MAPISREADY: 'mapisready',
    MAPMARKERCLICKED: 'mapmarkerclicked',
    SHOWMISSIONMLOCATION: 'showmissionlocation',
    MISSIONCOMPLETED: 'missioncompleted',
    INVALIDATEMAPSIZE: 'invalidemapsize',
    NEIGHBORHOOD: 'neighborhood'
  };
})();
/* end GGO: put code below in galigeo.js */

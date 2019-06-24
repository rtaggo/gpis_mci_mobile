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
      sessionStorage.clear();
      var logoutForm = $('<form action="/logout" />');

      $('body').append(logoutForm);
      logoutForm.submit();
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

  GGO.CHECK_MISSION_INTERVALLE = 10000;
  GGO.COLORPALETTES = {
    rdYlBu: ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4']
  };

  GGO.getDefaultColorPalette = function() {
    return GGO.COLORPALETTES['rdYlBu'];
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

(function() {
	'use strict';
	GGO.MissionManager = function(options){
		this._options = options || {};
		this._options.mciurl = '/services/rest/mci';
		this._init();
	};

	GGO.MissionManager.prototype = {
    _init:function() {
			this.setupListeners();
		},
		setupListeners: function() {
      let self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.APPISREADY, function(e) {
				console.log('Received GGO.EVENTS.APPISREADY');
				self.fakeTimeOutbeforeFetchingMission();
      });
      $('#btnMissionEnRoute').click(function(e){

      });
      $('#btnMissionDebut').click(function(e){
        
      });
      $('#btnMissionFin').click(function(e){
        $('#missionContent').addClass('slds-hide');
        $('#missionFooter').addClass('slds-hide');
        $('#waiting4Mission').removeClass('slds-hide');
        self.fakeTimeOutbeforeFetchingMission();
      });
      $('#btnMissionSignalement').click(function(e){
        self.openSignalementModal();
      });
    },
    openSignalementModal: function() {
      let self = this;
      let modal = `
      <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open">
      <div class="slds-modal__container">
        <header class="slds-modal__header">
          <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Signalement</h2>
        </header>
        <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
          <p>Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis. Cillum sunt ad dolore
            quis aute consequat ipsum magna exercitation reprehenderit magna. Tempor cupidatat consequat elit dolor adipisicing.</p>
          <p>Dolor eiusmod sunt ex incididunt cillum quis nostrud velit duis sit officia. Lorem aliqua enim laboris do dolor eiusmod officia. Mollit incididunt nisi consectetur esse laborum eiusmod pariatur proident. Eiusmod et adipisicing culpa deserunt nostrud
            ad veniam nulla aute est. Labore esse esse cupidatat amet velit id elit consequat minim ullamco mollit enim excepteur ea.</p>
        </div>
        <footer class="slds-modal__footer">
          <button id="btnSignalementCancel" class="slds-button slds-button_neutral">Annuler</button>
          <button id="btnSignalementOk" class="slds-button slds-button_brand">Valider</button>
        </footer>
      </div>
      </section>
      `;

      $('body').append($('<div id="signalement-modal" class="ggoslds"></div>')
        .append($(modal))
        .append($('<div class="slds-backdrop slds-backdrop_open"></div>'))
      );
      $('#btnSignalementCancel').click(function(e){
        $('#signalement-modal').remove();
      });
      $('#btnSignalementOk').click(function(e){
        $('#signalement-modal').remove();
        $('#missionContent').addClass('slds-hide');
        $('#missionFooter').addClass('slds-hide');
        $('#waiting4Mission').removeClass('slds-hide');
        self.fakeTimeOutbeforeFetchingMission();
      });

    }, 
    fakeTimeOutbeforeFetchingMission: function() {
      var self = this;
      setTimeout(function() {
        self.fetchMission();
      }, 5000);
    },
    fetchMission: function() {
      let self = this;
      let missionUrl = 	this._options.mciurl + '/mission';
      $.ajax({
        type: 'GET',
        url: missionUrl,
        success: function(response) {
          console.log('/rest/mci/mission Response : ', response);
          self.handleMissionFetched(response);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
            console.warn('/rest/mci/mission Request aborted');
          } else {
            console.error('Error for /rest/mci/mission request: ' + textStatus, errorThrown);
          }
        }
      });
    },
    handleMissionFetched: function(mission) {
      var self = this;
      self._currentMission = mission;

      $('#waiting4Mission').addClass('slds-hide');
      $('#missionContent').removeClass('slds-hide');
      $('#missionFooter').removeClass('slds-hide');
    },

  };
})();
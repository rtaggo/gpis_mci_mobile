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
        self._currentMission.statut = 'En direction';
        $('#mainContainer-card-body').prepend($(`<div id="udpate-mission-spinner" class="slds-spinner_container">
        <div role="status" class="slds-spinner slds-spinner_medium">
        <span class="slds-assistive-text">Loading</span>
        <div class="slds-spinner__dot-a"></div>
        <div class="slds-spinner__dot-b"></div>
        </div>
        </div>`));
        setTimeout(function(e){
          self.renderMissionViewMode();
          $('#udpate-mission-spinner').remove();
        }, 1000);
      });
      $('#btnMissionDebut').click(function(e){
        self._currentMission.statut = 'Début';
        $('#mainContainer-card-body').prepend($(`<div id="udpate-mission-spinner" class="slds-spinner_container">
        <div role="status" class="slds-spinner slds-spinner_medium">
        <span class="slds-assistive-text">Loading</span>
        <div class="slds-spinner__dot-a"></div>
        <div class="slds-spinner__dot-b"></div>
        </div>
        </div>`));
        setTimeout(function(e){
          self.renderMissionViewMode();
          $('#udpate-mission-spinner').remove();
        }, 1000);
      });
      $('#btnMissionFin').click(function(e){
        GGO.EventBus.dispatch(GGO.EVENTS.MISSIONCOMPLETED);

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
      <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-signalement-content" class="slds-modal slds-fade-in-open">
      <div class="slds-modal__container">
        <header class="slds-modal__header">
          <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Signalement</h2>
        </header>
        <div class="slds-modal__content slds-p-around_medium" id="modal-signalement-content">
          <div class="slds-form" role="list">
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-categorie">Catégorie</label>
                <div class="slds-form-element__control">
              <div class="slds-select_container">
                <select class="slds-select" id="signalement-input-categorie">
                <option value="">Choisir une catégorie</option>
                <option>Catégorie 1</option>
                <option>Catégorie 2</option>
                <option>Catégorie 3</option>
                </select>
              </div>
                </div>
              </div>
            </div>
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-souscategorie">Sous-Catégorie</label>
                <div class="slds-form-element__control">
              <div class="slds-select_container">
                <select class="slds-select" id="signalement-input-souscategorie">
                <option value="">Choisir une sous-catégorie</option>
                <option>Sous-Catégorie 1</option>
                <option>Sous-Catégorie 2</option>
                <option>Sous-Catégorie 3</option>
                </select>
              </div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-categorie2nd">Catégorie 2nd</label>
                <div class="slds-form-element__control">
              <div class="slds-select_container">
                <select class="slds-select" id="signalement-input-categorie2nd">
                <option value="">Choisir une catégorie</option>
                <option>Catégorie 2nd 1</option>
                <option>Catégorie 2nd 2</option>
                <option>Catégorie 2nd 3</option>
                </select>
              </div>
                </div>
              </div>
            </div>
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-typelieu">Type de lieu</label>
                <div class="slds-form-element__control">
              <div class="slds-select_container">
                <select class="slds-select" id="signalement-input-typelieu">
                <option value="">Choisir un type</option>
                <option>Type 1</option>
                <option>Type 2</option>
                <option>Type 3</option>
                </select>
              </div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-niveau">Niveau</label>
                <div class="slds-form-element__control">
              <div class="slds-select_container">
                <select class="slds-select" id="signalement-input-niveau">
                <option value="">Choisir un niveau</option>
                <option>Niveau 1</option>
                <option>Niveau 2</option>
                <option>Niveau 3</option>
                </select>
              </div>
                </div>
              </div>
            </div>
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing">
                <label class="slds-form-element__label" for="signalement-input-niveau">Image</label>
                <div class="slds-form-element__control">
              <div class="snapshotdiv">
                <svg class="slds-icon slds-icon_large slds-icon-text-default slds-shrink-none" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#photo"></use></svg>
              </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col">
                <label class="slds-form-element__label" for="signalement-input-observation">Observations / Caractéristique</label>
                <div class="slds-form-element__control">
                  <textarea id="signalement-input-observation" class="slds-textarea" placeholder="Renseigner Observations / Caractéristiques"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        GGO.EventBus.dispatch(GGO.EVENTS.MISSIONCOMPLETED);
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
      self.renderMissionViewMode();
      $('#waiting4Mission').addClass('slds-hide');
      $('#missionContent').removeClass('slds-hide');
      $('#missionFooter').removeClass('slds-hide');
    },
    renderMissionViewMode: function() {
      GGO.EventBus.dispatch(GGO.EVENTS.SHOWMISSIONMLOCATION, this._currentMission);
      let mission = this._currentMission;
      let content = `
      <div class="slds-form" role="list">
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  <div class="">Mission ${mission.id}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Code Site</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  ${mission.code_site}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent slds-form-element_1-col">
              <span class="slds-form-element__label">Adresse</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static slds-text-longform">${mission.address}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Type de lieu</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            Type de lieu
            </div>
              </div>
            </div>
          </div>
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Type de lieu secondaire</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            Type de lieu 2
            </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Code d'accès Hall</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            9876
            </div>
              </div>
            </div>
          </div>
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Code d'accès Grille</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            1234
            </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent slds-form-element_1-col">
              <span class="slds-form-element__label">Motif</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static slds-text-longform">Le motif de la mission</div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Moyen d'accès</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  <span class="slds-icon_container slds-icon-utility-steps slds-current-color" title="False">
                    <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                      <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#steps"></use>
                    </svg>
                    <span class="slds-assistive-text">False</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Vigil GPIS</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  <span class="slds-icon_container slds-icon-utility-steps slds-current-color" title="False">
                    <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                      <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                    </svg>
                    <span class="slds-assistive-text">True</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Status</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            ${mission.statut}
            </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Derniers signalements</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            <ul class="slds-list_dotted">
              <li>xx/03/2019: Signalement du jour xx</li>
              <li>yy/02/2019: Signalement du jour yy</li>
              <li>zz/01/2019: Signalement du jour zz</li>
            </ul>
            </div>
              </div>
            </div>
          </div>
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Dernières observations</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
            <ul class="slds-list_dotted">
              <li>xx/03/2019: observation du jour</li>
              <li>xx/02/2019: observation du jour</li>
              <li>xx/01/2019: observation du jour</li>
            </ul>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
      $('#missionContent').empty().append($(content));
    }
  };
})();
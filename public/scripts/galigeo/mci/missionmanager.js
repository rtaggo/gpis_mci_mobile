(function() {
  'use strict';
  GGO.MissionManager = function(options) {
    this._options = options || {};
    //this._options.mciurl = '/services/rest/mci';
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._useBlob = false; // && window.URL;

    this._init();
  };

  GGO.MissionManager.prototype = {
    _init: function() {
      this.setupListeners();
    },
    setupListeners: function() {
      let self = this;
      GGO.EventBus.addEventListener(GGO.EVENTS.APPISREADY, function(e) {
        console.log('Received GGO.EVENTS.APPISREADY');
        self.checkMission();
      });
      $('#btnMissionEnRoute').click(function(e) {
        let theMission = self._currentMission.features[0];
        self._currentMission.statut = 'En direction';
        $('#mainContainer-card-body').prepend(
          $(`
          <div id="udpate-mission-spinner" class="slds-spinner_container">
            <div role="status" class="slds-spinner slds-spinner_medium">
              <span class="slds-assistive-text">Loading</span>
              <div class="slds-spinner__dot-a"></div>
              <div class="slds-spinner__dot-b"></div>
            </div>
          </div>
          `)
        );
        self.updateMissionStatus(
          self._currentMission.features[0].properties.mission_id,
          1,
          function(response) {
            console.log('>> En route callback', response, self);
            if (response.code === 200) {
              $('#udpate-mission-spinner').remove();
              let theMission = self._currentMission.features[0];
              theMission.properties.statut = 'En direction';
              this.renderMissionViewMode();
            }
          }.bind(self)
        );
        /*
        setTimeout(function(e) {
          self.renderMissionViewMode();
          $('#udpate-mission-spinner').remove();
        }, 1000);
        */
      });
      $('#btnMissionDebut').click(function(e) {
        self._currentMission.statut = 'Début';
        $('#mainContainer-card-body').prepend(
          $(`
          <div id="udpate-mission-spinner" class="slds-spinner_container">
            <div role="status" class="slds-spinner slds-spinner_medium">
              <span class="slds-assistive-text">Loading</span>
              <div class="slds-spinner__dot-a"></div>
              <div class="slds-spinner__dot-b"></div>
            </div>
          </div>
        `)
        );
        self.updateMissionStatus(
          self._currentMission.features[0].properties.mission_id,
          2,
          function(response) {
            console.log('>> En route callback', response, self);
            if (response.code === 200) {
              $('#udpate-mission-spinner').remove();
              let theMission = self._currentMission.features[0];
              theMission.properties.statut = 'Début';
              this.renderMissionViewMode();
            }
          }.bind(self)
        );
        /*
        setTimeout(function(e) {
          self.renderMissionViewMode();
          $('#udpate-mission-spinner').remove();
        }, 1000);
        */
      });

      $('#btnMissionFin').click(function(e) {
        self.updateMissionStatus(
          self._currentMission.features[0].properties.mission_id,
          5,
          function(response) {
            console.log('>> En route callback', response, self);
            if (response.code === 200) {
              $('#udpate-mission-spinner').remove();
              this.finishCurrentMission();
            }
          }.bind(self)
        );
        /*
        GGO.EventBus.dispatch(GGO.EVENTS.MISSIONCOMPLETED);

        $('#missionContent').addClass('slds-hide');
        $('#missionFooter').addClass('slds-hide');
        $('#waiting4Mission').removeClass('slds-hide');
        //self.fakeTimeOutbeforeFetchingMission();
        self.checkMission();
        */
      });
      $('#btnMissionSignalement').click(function(e) {
        self.openSignalementModal();
        self.fetchTypeSignalements();
      });
    },
    finishCurrentMission: function() {
      this._currentMission = null;
      GGO.EventBus.dispatch(GGO.EVENTS.MISSIONCOMPLETED);

      $('#missionContent').addClass('slds-hide');
      $('#missionFooter').addClass('slds-hide');
      $('#waiting4Mission').removeClass('slds-hide');
      //self.fakeTimeOutbeforeFetchingMission();
      this.checkMission();
    },
    updateMissionStatus: function(missionId, statusCode, callback) {
      let self = this;
      let updateStatusUrl = `${this._options.baseRESTServicesURL}/maj_mission.php`;
      let reqBody = {
        mission_id: missionId,
        code: statusCode
      };
      $.ajax({
        type: 'POST',
        url: updateStatusUrl,
        data: JSON.stringify(reqBody),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
          console.log(`Response`, response);
          if (typeof callback === 'function') {
            callback(response);
          }
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
    openSignalementModal: function() {
      let self = this;
      let modal = `
      <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-signalement-content" class="slds-modal slds-fade-in-open slds-modal_large">
        <!-- Start Modal Container -->
        <div class="slds-modal__container" style="margin: 0px; padding: 0px;">
          <header class="slds-modal__header">
            <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Signalement</h2>
          </header>
          <!-- Start Modal Content -->
          <div class="slds-modal__content slds-p-around_medium" id="modal-signalement-content">
            <div class="slds-form" role="list">
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem" >
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-type-signalement"><abbr class="slds-required" title="required">* </abbr>Type de signalement</label>
                    <div class="slds-form-element__control" >
                      <div class="slds-select_container">
                        <select class="slds-select" id="select-type-signalement" required=""></select>
                      </div>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-type-signalement_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div id="parent_categorie" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-categorie"><abbr class="slds-required" title="required">* </abbr>Catégorie</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="select-categorie" required=""></select>
                      </div>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-categorie_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div id="parent_sous_categorie" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-sous-categorie">Sous-Catégorie</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="select-sous-categorie" required=""></select>
                      </div>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-sous-categorie_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div id="parent_categorie2s" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-categorie2s">Catégorie 2nd</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="select-categorie2s" required=""></select>
                      </div>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-categorie2s_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-type-lieu">Type de lieu</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="select-type-lieu" required=""></select>
                      </div>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-type-lieu_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div id="parent_niveau" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="select-niveau">Niveau</label>
                    <div class="slds-form-element__control" style="width:20%">
                      <select class="slds-select" id="select-niveau" required=""></select>
                    </div>
                    <div class="slds-form-element__help slds-hide" id="select-niveau_error">Champ obligatoire</div>
                  </div>
                </div>
              </div>
              <div class="slds-form__row ">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label">Image</label>
                    <div class="slds-form-element__control">
                      <div class="snapshotdiv">
                        <svg class="slds-icon slds-icon_large slds-icon-text-default slds-shrink-none slds-m-around_small" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#photo"></use></svg>
                      </div>
                      <input id="snapshot_input" type="file" accept="image/*" style="display:none;">
                    </div>
                  </div>
                </div>
              </div>            
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing slds-form-element_1-col">
                    <label class="slds-form-element__label" for="signalement-input-observation">Observations / Caractéristique</label>
                    <div class="slds-form-element__control">
                      <textarea id="signalement-input-observation" class="slds-textarea" placeholder="Renseigner Observations / Caractéristiques"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>           
            <footer class="slds-modal__footer">
              <button id="btnSignalementOk" class="slds-button slds-button_brand">Valider</button>
              <button id="btnSignalementCancel" class="slds-button slds-button_neutral">Annuler</button>
            </footer>
          </div>
          <!-- End Modal Content -->
        </div>
        <!-- End Modal Container -->
      </section>
      `;

      let theModal = $(modal);

      theModal.find('#select-type-signalement').change(function() {
        $('#modal-signalement-content .slds-form-element__help').addClass('slds-hide');
        $('#modal-signalement-content .slds-has-error').removeClass('slds-has-error');

        self.handleClickChooseTypeSignalement();
      });

      theModal.find('#select-type-lieu').change(function() {
        $('#modal-signalement-content .slds-form-element__help').addClass('slds-hide');
        $('#modal-signalement-content .slds-has-error').removeClass('slds-has-error');
        const niveauOK = $(this)
          .find(':selected')
          .data('niveau');
        self.handleClickChooseTypeLieu(niveauOK);
      });

      theModal.find('.snapshotdiv').click(function(e) {
        $('#snapshot_input').trigger('click');
      });

      theModal.find('input[type="file"]').on('change', function(e) {
        console.log('input file changed');
        var files = this.files,
          errors = '';

        if (!files) {
          errors += 'File upload not supported by your browser.';
        }

        if (files && files[0]) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (/\.(png|jpeg|jpg|gif)$/i.test(file.name)) {
              self.readImage(file);
            } else {
              errors += file.name + ' Unsupported Image extension\n';
            }
          }
        }
        // Handle errors
        if (errors) {
          alert(errors);
        }
      });

      $('body').append(
        $('<div id="signalement-modal" class="ggoslds"></div>')
          .append(theModal)
          .append($('<div class="slds-backdrop slds-backdrop_open"></div>'))
      );
      $('#btnSignalementCancel').click(function(e) {
        $('#signalement-modal').remove();
      });
      $('#btnSignalementOk').click(function(e) {
        //self.saveSignalement();
        //$('#signalement-modal').remove();
        self.checkBeforeSaveSignalement();
      });
    },
    readImage: function(file) {
      let self = this;
      let reader = new FileReader();
      let elPreview = $('.snapshotdiv').empty();
      let removeImgLink = $('<a href="">Supprimer</a>');
      removeImgLink.click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        self._snapshotBase64 = null;
        $('.snapshotdiv')
          .empty()
          .append(`<svg class="slds-icon slds-icon_large slds-icon-text-default slds-shrink-none slds-m-around_small" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#photo"></use></svg>`);
      });
      elPreview.append(removeImgLink);
      reader.addEventListener('load', function() {
        var image = new Image();

        image.addEventListener('load', function() {
          var imageInfo = file.name + ' ' + image.width + '×' + image.height + ' ' + file.type + ' ' + Math.round(file.size / 1024) + 'KB';
          // Show image
          elPreview.prepend($('<div class="snapshotImgDiv slds-p-around_small"></div>').append(this));

          if (self._useBlob) {
            // Free some memory
            window.URL.revokeObjectURL(image.src);
          }
        });
        image.src = self._useBlob ? window.URL.createObjectURL(file) : reader.result;
        self._snapshotBase64 = reader.result;
      });

      reader.readAsDataURL(file);
    },
    openReaffectationModal: function() {
      let self = this;
      let modal = `
      <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true" aria-describedby="modal-signalement-content" class="slds-modal slds-fade-in-open slds-modal_large">
        <!-- Start Modal Container -->
        <div class="slds-modal__container" style="margin: 0px; padding: 0px;">
          <header class="slds-modal__header">
            <h2 id="modal-heading-01" class="slds-text-heading_medium slds-hyphenate">Signalement</h2>
          </header>
          <!-- Start Modal Content -->
          <div class="slds-modal__content slds-p-around_medium" id="modal-signalement-content">
            <div class="slds-form" role="list">
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem" >
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-type"><abbr class="slds-required" title="required">* </abbr>Type de signalement</label>
                    <div class="slds-form-element__control" >
                      <div class="slds-select_container">
                        <select class="slds-select" id="type_signalement" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>          
              <div id="parent_categorie" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-categorie">Catégorie</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="categorie" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="parent_sous_categorie" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-souscategorie">Sous-Catégorie</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="sous-categorie" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="parent_categorie2s" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-categorie2nd">Catégorie 2nd</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="categorie2s" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-typelieu">Type de lieu</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="type-lieu" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="parent_niveau" class="slds-form__row slds-hide">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-is-editing">
                    <label class="slds-form-element__label" for="signalement-input-niveau">Niveau</label>
                    <div class="slds-form-element__control">
                      <div class="slds-select_container">
                        <select class="slds-select" id="niveau" required="" disabled></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="slds-form__row ">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked">
                    <label class="slds-form-element__label">Image</label>
                    <div class="slds-form-element__control">
                      <div class="snapshotdiv">
                        <svg class="slds-icon slds-icon_large slds-icon-text-default slds-shrink-none slds-m-around_small" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#photo"></use></svg>
                      </div>
                      <input id="snapshot_input" type="file" accept="image/*" style="display:none;">
                    </div>
                  </div>
                </div>
              </div>
              <div class="slds-form__row">
                <div class="slds-form__item" role="listitem">
                  <div class="slds-form-element slds-form-element_stacked slds-form-element_readonly slds-form-element_1-col">
                    <label class="slds-form-element__label" for="signalement-input-observation">Observations / Caractéristique</label>
                    <div class="slds-form-element__control">
                      <textarea id="observation" class="slds-textarea" disabled></textarea>
                    </div>
                  </div>
                </div>
              </div>           
              <footer class="slds-modal__footer">
                <button id="btnReaffecter" value="" class="slds-button slds-button_brand">Reaffecter</button>
                <button id="btnReaffectationCancel" class="slds-button slds-button_neutral">Annuler</button>
              </footer>
            </div>
            <div class="slds-spinner_container">
              <div role="status" class="slds-spinner slds-spinner_x-small">
                <span class="slds-assistive-text">Loading</span>
                <div class="slds-spinner__dot-a"></div>
                <div class="slds-spinner__dot-b"></div>
              </div>
            </div>
          </div>
          <!-- End Modal Content -->
        </div>
        <!-- End Modal Containter -->
      </section>
      `;

      let theModal = $(modal);
      theModal.find('.snapshotdiv').click(function(e) {
        $('#snapshot_input').trigger('click');
      });

      theModal.find('input[type="file"]').on('change', function(e) {
        console.log('input file changed');
        var files = this.files,
          errors = '';

        if (!files) {
          errors += 'File upload not supported by your browser.';
        }

        if (files && files[0]) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (/\.(png|jpeg|jpg|gif)$/i.test(file.name)) {
              self.readImage(file);
            } else {
              errors += file.name + ' Unsupported Image extension\n';
            }
          }
        }
        // Handle errors
        if (errors) {
          alert(errors);
        }
      });
      $('body').append(
        $('<div id="reaffectation-signalement-modal" class="ggoslds"></div>')
          .append(theModal)
          .append($('<div class="slds-backdrop slds-backdrop_open"></div>'))
      );
      $('#btnReaffectationCancel').click(function(e) {
        $('#reaffectation-signalement-modal').remove();
      });
      $('#btnReaffecter').click(function(e) {
        self.validateReacffectation();
        $('#reaffectation-signalement-modal').remove();
      });
    },
    validateSignalementInput: function(value2Check, containerId, errorHelperId) {
      let allGood = true;
      if (value2Check === '') {
        $(`#${containerId}`)
          .parent()
          .parent()
          .parent()
          .addClass('slds-has-error');
        $(`#${errorHelperId}`).removeClass('slds-hide');
        allGood = false;
      } else {
        $(`#${containerId}`)
          .parent()
          .parent()
          .parent()
          .removeClass('slds-has-error');
        $(`#${errorHelperId}`).addClass('slds-hide');
      }
      return allGood;
    },
    checkBeforeSaveSignalement: function() {
      let self = this;
      let allGood = false;

      const type_signalement_id = $('#select-type-signalement').val();
      const type_lieu_id = $('#select-type-lieu').val();
      const categorie_id = $('#select-categorie').val();
      const categorie_2s_id = $('#select-categorie2s').val();
      const sous_categorie_id = $('#select-sous-categorie').val();
      const niveauVal = $('#select-niveau').val();
      const observationVal = $('#signalement-input-observation').val();

      allGood = this.validateSignalementInput(type_signalement_id, 'select-type-signalement', 'select-type-signalement_error') && allGood;
      allGood = this.validateSignalementInput(categorie_id, 'select-categorie', 'select-categorie_error') && allGood;
      if (!$('#parent_categorie2s').hasClass('slds-hide')) {
        allGood = this.validateSignalementInput(categorie_2s_id, 'select-categorie2s', 'select-categorie2s_error') && allGood;
      }
      if (!$('#parent_sous_categorie').hasClass('slds-hide')) {
        allGood = this.validateSignalementInput(sous_categorie_id, 'select-sous-categorie', 'select-sous-categorie_error') && allGood;
      }
      allGood = this.validateSignalementInput(type_lieu_id, 'select-type-lieu', 'select-type-lieu_error') && allGood;
      if (!$('#parent_niveau').hasClass('slds-hide')) {
        allGood = this.validateSignalementInput(niveauVal, 'select-niveau', 'select-niveau_error') && allGood;
      }

      /*
      if (type_signalement_id === '') {
        $('#select-type-signalement')
          .parent()
          .parent()
          .parent()
          .addClass('slds-has-error');
        allGood = false;
      }

      if (type_lieu_id === '') {
        $('#select-type-lieu')
          .parent()
          .parent()
          .parent()
          .addClass('slds-has-error');
        allGood = false;
      }
      */
      let formSignalement = {
        mission_id: self._currentMission.features[0].properties.mission_id,
        type_signalement: type_signalement_id,
        type_lieu: type_lieu_id,
        categorie: categorie_id,
        categorie_2s: categorie_2s_id,
        sous_categorie: sous_categorie_id,
        niveau: niveauVal,
        observation: observationVal,
        photo: this._snapshotBase64 || null
      };
      if (allGood) {
        this.saveSignalement(formSignalement);
      }
    },
    saveSignalement: function(formSignalement) {
      let self = this;
      const saveSignalementUrl = `${this._options.baseRESTServicesURL}/signalement.php`;
      $.ajax({
        type: 'POST',
        url: saveSignalementUrl,
        data: JSON.stringify(formSignalement),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
          console.log(`Response`, response);
          self._snapshotBase64 = null;
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
    saveSignalement_old: function() {
      let self = this;

      const id_mission = self._currentMission.features[0].properties.mission_id; //mission[0].innerHTML;
      const type_signalement_id = $('#select-type-signalement').val();
      const type_lieu_id = $('#select-type-lieu').val();
      const categorie_id = $('#select-categorie').val();
      const categorie_2s_id = $('#select-categorie2s').val();
      const sous_categorie_id = $('#select-sous-categorie').val();
      const niveauVal = $('#select-niveau').val();
      const observationVal = $('#signalement-input-observation').val();

      let formSignalement = {
        mission_id: id_mission,
        type_signalement: type_signalement_id,
        type_lieu: type_lieu_id,
        categorie: categorie_id,
        categorie_2s: categorie_2s_id,
        sous_categorie: sous_categorie_id,
        niveau: niveauVal,
        observation: observationVal,
        photo: this._snapshotBase64 || null
      };
      console.log(formSignalement);
      const saveSignalementUrl = `${this._options.baseRESTServicesURL}/signalement.php`;
      console.log(JSON.stringify(formSignalement));

      $.ajax({
        type: 'POST',
        url: saveSignalementUrl,
        data: JSON.stringify(formSignalement),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
          console.log(`Response`, response);
          self._snapshotBase64 = null;
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
    validateReacffectation: function() {
      let self = this;
      let formReaffectation = {
        signalement_id: $('#btnReaffecter').attr('data-signalementid'), // $('#btnReaffecter')[0].value,
        photo: this._snapshotBase64 || null
      };

      const reaffecctationUrl = `${this._options.baseRESTServicesURL}/reaffectation.php`;

      $.ajax({
        type: 'POST',
        url: reaffecctationUrl,
        data: JSON.stringify(formReaffectation),
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
    fetchFormSignalements: function(signalement_id) {
      let self = this;
      const reaffectationSignalementUrl = `${this._options.baseRESTServicesURL}/reaffectation.php?signalement_id=${signalement_id}&photo=`;
      $.ajax({
        type: 'GET',
        url: reaffectationSignalementUrl,
        success: function(response) {
          console.log(`${reaffectationSignalementUrl}`, response);
          self.handleFormSignalementFetched(response, signalement_id);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${reaffectationSignalementUrl} Request aborted`);
          } else {
            console.error(`Error for ${reaffectationSignalementUrl} request: ${textStatus}`, errorThrown);
          }
        }
      });
    },

    handleFormSignalementFetched: function(response, signalement_id) {
      console.log(`>> handleTypeSignalementFetched`, response);
      const self = this;

      let selectTypeSignalement = $('#type_signalement').empty();
      selectTypeSignalement.append($(`<option value="">${response.signalement[0].type_signalement}</option>`));
      if (response.signalement[0].categorie) {
        $('#parent_categorie').removeClass('slds-hide');
        let selectCategorie = $('#categorie').empty();
        selectCategorie.append($(`<option value="">${response.signalement[0].categorie}</option>`));
      }
      let selectTypeLieu = $('#type-lieu').empty();
      selectTypeLieu.append($(`<option value="">${response.signalement[0].type_lieu}</option>`));
      if (response.signalement[0].sous_categorie) {
        $('#parent_sous_categorie').removeClass('slds-hide');
        let selectSousCategorie = $('#sous-categorie').empty();
        selectSousCategorie.append($(`<option value="">${response.signalement[0].sous_categorie}</option>`));
      }
      if (response.signalement[0].categorie_2s) {
        $('#parent_categorie2s').removeClass('slds-hide');
        let selectCategorie2s = $('#categorie2s').empty();
        selectCategorie2s.append($(`<option value="">${response.signalement[0].categorie_2s}</option>`));
      }
      if (response.signalement[0].niveau) {
        $('#parent_niveau').removeClass('slds-hide');
        $('#niveau')[0].value = response.signalement[0].niveau;
      }
      //$('#observation')[0].value = response.signalement[0].observations;
      // $('#btnReaffecter')[0].value = signalement_id;

      $('#observation').val(response.signalement[0].observations);
      $('#btnReaffecter').attr('data-signalementid', signalement_id);

      $('#modal-signalement-content .slds-spinner_container').remove();
    },
    fetchTypeSignalements: function() {
      let self = this;
      const typeSignalementUrl = `${this._options.baseRESTServicesURL}/signalement.php?type_signalement=&categorie=`;
      $.ajax({
        type: 'GET',
        url: typeSignalementUrl,
        success: function(response) {
          console.log(`${typeSignalementUrl}`, response);
          self.handleTypeSignalementFetched(response);
          self.handleTypeLieuFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${typeSignalementUrl} Request aborted`);
          } else {
            console.error(`Error for ${typeSignalementUrl} request: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    handleTypeSignalementFetched: function(response) {
      console.log(`>> handleTypeSignalementFetched`, response);
      const self = this;
      let selectCtnr = $('#select-type-signalement').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner un type de signalement</option> 
        ${response.type_signalement.map(p => `<option value="${p.id}" >${p.libelle}</option>`).join('')}
      `)
      );
      /*
      $('#select-type-signalement').change(function() {
        $('#modal-signalement-content .slds-has-error').removeClass('slds-has-error');
        self.handleClickChooseTypeSignalement();
      });
      */
    },
    handleTypeLieuFetched: function(response) {
      console.log(`>> handleTypeLieuFetched`, response);
      const self = this;
      let selectCtnr = $('#select-type-lieu').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner un type de lieu</option> 
        ${response.type_lieu.map(p => `<option value="${p.id}" data-niveau="${p.niveau}" >${p.libelle}</option>`).join('')}
      `)
      );
      /*
      $('#select-type-lieu').change(function() {
        $('#modal-signalement-content .slds-has-error').removeClass('slds-has-error');
        const niveauOK = $(this)
          .find(':selected')
          .data('niveau');
        self.handleClickChooseTypeLieu(niveauOK);
      });
      */
    },
    handleCategorieFetched: function(response) {
      console.log(`>> handleCategorieFetched`, response);
      const self = this;
      $('#parent_categorie').removeClass('slds-hide');
      let selectCtnr = $('#select-categorie').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner une catégorie</option> 
        ${response.categorie.map(p => `<option value="${p.id}" >${p.libelle}</option>`).join('')}
      `)
      );
      $('#select-categorie')
        .off()
        .change(function() {
          $('#modal-signalement-content .slds-has-error').removeClass('slds-has-error');
          self.handleClickChooseCategorie();
        });
    },
    handleSousCategorieFetched: function(response) {
      console.log(`>> handleSousCategorieFetched`, response);
      const self = this;
      let selectCtnr2 = $('#select-sous-categorie').empty();
      selectCtnr2.append(
        $(`
        <option value="">Sélectionner une sous-categorie</option> 
        ${response.sous_categorie.map(p => `<option value="${p.id}" >${p.libelle}</option>`).join('')}
      `)
      );
      if (`${response.sous_categorie}` != '') {
        $('#parent_sous_categorie').removeClass('slds-hide');
      }
    },
    handleCategorie2sFetched: function(response) {
      console.log(`>> handleCategorie2sFetched`, response);
      const self = this;
      let selectCtnr2 = $('#select-categorie2s').empty();
      selectCtnr2.append(
        $(`
        <option value="">Sélectionner une catégorie secondaire</option> 
        ${response.categorie_2s.map(p => `<option value="${p.id}" >${p.libelle}</option>`).join('')}
      `)
      );
      if (`${response.categorie_2s}` != '') {
        $('#parent_categorie2s').removeClass('slds-hide');
      }
    },
    handleClickChooseCategorie: function() {
      const selectCtnr = $('#select-categorie');
      let catgorieId = selectCtnr.val();
      let selectedOption = $(selectCtnr[0].selectedOptions[0]);

      let selectedCategorie = {
        id: catgorieId
      };
      console.log(selectedCategorie);
      this.fetchSousCategorie(selectedCategorie);
    },
    handleClickChooseTypeSignalement: function() {
      const selectCtnr = $('#select-type-signalement');
      let typeSignalementId = selectCtnr.val();
      if (typeSignalementId === '' || selectCtnr[0].selectedOptions.length === 0) {
        return;
      }
      typeSignalementId = parseInt(typeSignalementId);
      let selectedOption = $(selectCtnr[0].selectedOptions[0]);

      let selectedTypeSignalement = {
        id: typeSignalementId
      };
      console.log(selectedTypeSignalement);
      this.fetchCategorie(selectedTypeSignalement);
    },
    handleClickChooseTypeLieu: function(niveauOK) {
      const selectCtnr = $('#select-type-lieu');
      let typeLieuId = selectCtnr.val();
      if (typeLieuId === '' || selectCtnr[0].selectedOptions.length === 0) {
        return;
      }
      typeLieuId = parseInt(typeLieuId);
      let selectedOption = $(selectCtnr[0].selectedOptions[0]);

      let selectedTypeLieu = {
        id: typeLieuId
      };
      if (niveauOK) {
        $('#parent_niveau').removeClass('slds-hide');

        let selectNiveau = $('#select-niveau').empty();
        var list_niveau = [];
        for (var i = -10; i <= 100; i += 1) {
          list_niveau.push(i);
        }
        selectNiveau.append(
          $(`
        <option value=""> </option> 
        ${list_niveau.map(p => `<option value="${p}" >${p}</option>`).join('')}
      `)
        );
      }
    },

    fetchCategorie: function(type_signalement) {
      const self = this;
      const categorieUrl = `${this._options.baseRESTServicesURL}/signalement.php?type_signalement=${type_signalement.id}&categorie=`;
      $.ajax({
        type: 'GET',
        url: categorieUrl,
        success: function(response) {
          console.log(`${categorieUrl}: `, response);
          self.handleCategorieFetched(response);
          self.handleCategorie2sFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`[GET] ${categorieUrl} Request aborted`);
          } else {
            console.error(`[GET] ${categorieUrl} ERROR: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    fetchSousCategorie: function(categorie) {
      const self = this;
      const sousCategorieUrl = `${this._options.baseRESTServicesURL}/signalement.php?type_signalement=&categorie=${categorie.id}`;
      $.ajax({
        type: 'GET',
        url: sousCategorieUrl,
        success: function(response) {
          console.log(`${sousCategorieUrl}: `, response);
          self.handleSousCategorieFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`[GET] ${sousCategorieUrl} Request aborted`);
          } else {
            console.error(`[GET] ${sousCategorieUrl} ERROR: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    checkMissionStatut: function() {
      let self = this;
      if (this._currentMission !== null) {
        let self = this;
        let statutMissionUrl = `${this._options.baseRESTServicesURL}/statut_mission.php?patrouille=${this._options.patrouille.id}&mission=${self._currentMission.features[0].properties.mission_id}`;
        $.ajax({
          type: 'GET',
          url: statutMissionUrl,
          success: function(response) {
            console.log(`${statutMissionUrl}: `, response);
            if (response.code === 200) {
              if (response.statut === 'Fin' || response.statut === 'Nouvelle mission') {
                self.finishCurrentMission();
              } else {
                setTimeout(function() {
                  self.checkMissionStatut();
                }, GGO.CHECK_MISSION_INTERVALLE);
              }
            } else {
              setTimeout(function() {
                self.checkMissionStatut();
              }, GGO.CHECK_MISSION_INTERVALLE);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            if (textStatus === 'abort') {
              console.warn(`[GET] ${missionUrl} Request aborted`);
            } else {
              console.error(`${missionUrl} request error : ${textStatus}`, errorThrown);
            }
          }
        });
      }
    },
    checkMission: function() {
      let self = this;
      setTimeout(function() {
        self.fetchMission();
      }, GGO.CHECK_MISSION_INTERVALLE);
    },
    fetchMission: function() {
      let self = this;
      let missionUrl = `${this._options.baseRESTServicesURL}/mission_sous_secteur.php?patrouille=${this._options.patrouille.id}`;
      $.ajax({
        type: 'GET',
        url: missionUrl,
        success: function(response) {
          console.log(`${missionUrl}: `, response);
          self.handleMissionFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`[GET] ${missionUrl} Request aborted`);
          } else {
            console.error(`${missionUrl} request error : ${textStatus}`, errorThrown);
          }
        }
      });
    },
    handleMissionFetched: function(response) {
      switch (response.code) {
        case 200:
          this.handleMissionResponseOK(response);
          break;
        case 300:
          $('#waiting4Mission h2').text(response.message);
          this.checkMission();
          break;
        default:
          console.error(`Unhandled code error ${response.code}: ${JSON.stringify(response)}`);
          const errMsg = response.message || 'Erreur non reconnue';
          $('#waiting4Mission h2').text(response.message);
      }
    },
    handleMissionResponseOK: function(response) {
      if (response.features.length > 0) {
        this._currentMission = {
          type: 'FeatureCollection',
          features: response.features
        };
        this.renderMissionViewMode();
        $('#waiting4Mission').addClass('slds-hide');
        $('#missionContent').removeClass('slds-hide');
        $('#missionFooter').removeClass('slds-hide');
        this.checkMissionStatut();
      } else {
        console.warn(`TODO: treat case of no mission`);
        $('#waiting4Mission h2').text(response.message);
        this.checkMission();
      }
    },

    renderMissionViewMode: function() {
      GGO.EventBus.dispatch(GGO.EVENTS.SHOWMISSIONMLOCATION, this._currentMission);
      let mission = this._currentMission.features[0];
      let content = $(`<div class="slds-form" role="list"></div>`);
      let self = this;
      content.append(
        $(`
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Type de mission</span>
                <div class="slds-form-element__control">
                  <div class="slds-form-element__static">
                    ${mission.properties.type_mission || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Motif de mission</span>
                <div class="slds-form-element__control">
                  <div class="slds-form-element__static">
                    ${mission.properties.motif_nom || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Code Site</span>
                <div class="slds-form-element__control">
                  <div class="slds-form-element__static">
                    ${mission.properties.codesite}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Adresse</span>
                <div class="slds-form-element__control">
                  <div class="slds-form-element__static">
                    ${mission.properties.adresse}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)
      );

      content.append(
        $(`
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Type de lieu</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  ${mission.properties.type_lieu || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
      );
      content.append(
        $(`
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Type de lieu secondaire</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  ${mission.properties.type_lieu_sec || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
      );
      if (mission.properties.type_lieu !== null) {
        if (mission.properties.type_lieu_sec !== null) {
        }
      }

      content.append(
        $(`
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Code d'accès Hall</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">${mission.properties.codeacces_hall}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="slds-form__row">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <span class="slds-form-element__label">Code d'accès Grille</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">${mission.properties.codeacces_grille}</div>
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
                      <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#${mission.properties.access ? 'check' : 'steps'}"></use>
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
              <span class="slds-form-element__label">Vigik GPIS</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  <span class="slds-icon_container slds-icon-utility-steps slds-current-color" title="False">
                    <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                      <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#${mission.properties.vigik_gpis ? 'check' : 'steps'}"></use>
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
              <span class="slds-form-element__label">Statut</span>
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">${mission.properties.statut}</div>
              </div>
            </div>
          </div>
        </div>
       <div class="slds-form__row slds-hide"">
          <div class="slds-form__item" role="listitem">
            <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
              <div class="slds-form-element__control">
                <div class="slds-form-element__static">
                  <div id="mission_id_form" >${mission.properties.mission_id}</div>
                </div>
        </div>
      `)
      );

      // incidentes
      let incidContent = '<div class="slds-form-element__static"><p>Aucune incidente</p></div>';
      if (typeof mission.properties.incidente !== 'undefined' && Array.isArray(mission.properties.incidente) && mission.properties.incidente.length > 0) {
        incidContent = `
        <div class="slds-form-element__static">
          <ul class="slds-list_dotted">
            ${mission.properties.incidente
              .map(s => {
                return `
                <li>${moment(s.date).format('DD/MM/YYYY')} : ${s.libelle}
                  <span class="incidente-observation">${s.observations}</span>
                </li>`;
              })
              .join('')}
          </ul>
        </div>
        `;
      }
      content.append(
        $(`
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Dernières incidentes</span>
                <div class="slds-form-element__control">
                  ${incidContent}
                </div>
              </div>
            </div>
          </div>
        `)
      );

      // signalements
      let signalementContent = '<div class="slds-form-element__static"><p>Aucun signalement</p></div>';
      if (typeof mission.properties.signalement !== 'undefined' && Array.isArray(mission.properties.signalement) && mission.properties.signalement.length > 0) {
        signalementContent = `
        <div class="slds-form-element__static" id="signalements">
          <ul class="slds-list_dotted" id = "parent-list">
            ${mission.properties.signalement
              .map(s => {
                return `<li id='signalement_list_${s.id}' value=${s.id}>${moment(s.date).format('DD/MM/YYYY')} : ${s.libelle}</li>`;
              })
              .join('')}
          </ul>
        </div>
        `;
      }

      content.append(
        $(`
          <div class="slds-form__row">
            <div class="slds-form__item" role="listitem">
              <div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent">
                <span class="slds-form-element__label">Derniers signalements</span>
                <div class="slds-form-element__control">
                  ${signalementContent}
                </div>
              </div>
            </div>
          </div>
        `)
      );

      if (mission.properties.renfort) {
        $('#mission-btn-list').addClass('slds-hide');
        $('#mission-renfort-info').removeClass('slds-hide');
      } else {
        $('#mission-renfort-info').addClass('slds-hide');
        $('#mission-btn-list').removeClass('slds-hide');
      }
      $('#missionContent')
        .empty()
        .append(content);
      /*
      TODO: refactor
      $('#signalement_list li').click(function(e) { console.log($(this).val()); }) 
      */
      $('#signalements li')
        .off()
        .click(function(e) {
          self.openReaffectationModal();
          self.fetchFormSignalements($(this).val());
        });

      /*
      if (typeof $('#signalement_list') !== 'undefined') {
        var list_signalements = document.getElementById('signalements').getElementsByTagName('li');
        for (var i = 0; i < list_signalements.length; i++) {
          list_signalements[i].onclick = function(e) {
            self.openReaffectationModal();
            self.fetchFormSignalements($(this)[0].value);
          };
        }
      }
      */
    }
  };
  GGO.MissionManagerSingleton = (function() {
    let instance;
    function createInstance(options) {
      let missionMgr = new GGO.MissionManager(options);
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

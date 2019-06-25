(function() {
  'use strict';
  GGO.SessionManager = function(options) {
    this._options = options || {};
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._init();
  };

  GGO.SessionManager.prototype = {
    _init: function() {
      this._setupListeners();
    },
    _setupListeners: function() {
      let self = this;
      $(document).on('keypress', function(e) {
        let code = e.keyCode || e.which;
        if (code === 13) {
          $('#login-btn').trigger('click');
        }
      });
      $('#login-btn').click(function(e) {
        let loginVal = $('#user-login-input').val();
        let pwdVal = $('#user-password-input').val();
        let allFilled = true;
        if (loginVal.trim() === '') {
          allFilled = false;
          $('#user-login-input')
            .parent()
            .parent()
            .addClass('slds-has-error');
        }
        if (pwdVal.trim() === '') {
          allFilled = false;
          $('#user-password-input')
            .parent()
            .parent()
            .addClass('slds-has-error');
        }
        if (allFilled) {
          $('#error-message').addClass('slds-hide');
          let loginRequest = {
            login: loginVal,
            password: pwdVal
          };
          self.authenticateUser(loginRequest);
        } else {
          $('#error-message > .slds-form-element__help').text('Login et mot de passe doivent être renseignés.');
          $('#error-message').removeClass('slds-hide');
        }
      });
    },
    /**
     * Authentification de l'utilisateur
     * @param {Object} loginRequest User credentials object (login/password)
     * Ex.:
     *  Méthode: POST
     *  Request body: { user: 'john', password: 'doe'}
     *  Request response:
     *    {
     *      authentification : true | false
     *      role: 'india' | 'charly' | 'alpha'
     *    }
     */
    authenticateUser: function(loginRequest) {
      let self = this;
      $.ajax({
        type: 'POST',
        url: `${this._options.baseRESTServicesURL}/connexion.php`,
        data: JSON.stringify(loginRequest),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
          console.log(`Response`, response);
          self.handleUserAuthentication(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          const errResponse = jqXHR.responseJSON;
          let errMsg = errResponse.message || 'Une erreur est survenue, veuillez contacter votre administrateur';
          $('#error-message > .slds-form-element__help').text(errMsg);
          $('#error-message').removeClass('slds-hide');
        }
      });
    },
    handleUserAuthentication: function(authResponse) {
      $('#error-message').addClass('slds-hide');
      if (!authResponse.authentification) {
        let errMsg = authResponse.message || 'Une erreur est survenue, veuillez contacter votre administrateur';
        $('#error-message > .slds-form-element__help').text(errMsg);
        $('#error-message').removeClass('slds-hide');
        return;
      }
      $('#user-login-input').attr('disabled', true);
      $('#user-login-input')
        .parent()
        .parent()
        .removeClass('slds-has-error');
      $('#user-password-input').attr('disabled', true);
      $('#user-password-input')
        .parent()
        .parent()
        .removeClass('slds-has-error');
      $('#login-btn').addClass('slds-hide');
      this._currentRole = authResponse.role;
      switch (authResponse.role) {
        case 'india':
          this.fetchPatrouilles();
          break;
        case 'charly':
        case 'alpha':
          GGO.SessionIssuePrompt('Rôle utilisateur non disponible', `Le rôle '<b>${authResponse.role}</b>' n\'est pas disponible pour le moment.<br /> Veuillez vous reconnecter.`, $('#appContainer').empty());
          break;
        default:
          $('#error-message > .slds-form-element__help').text(`Le rôle ${authResponse.role} n'est pas un rôle valide.`);
          $('#error-message').removeClass('slds-hide');
      }
    },
    /**
     * Récupération de la liste des patrouilles
     * Ex.:
     *  Méthode: GET
     *  Request response:
     *    {
     *      "patrouille": [
     *        {"name": "GOLF 03", "id": 3 },
     *        {"name": "GOLF 11", "id": 11},
     *        {"name": "GOLF 14", "id": 14 }
     *      ]
     *    }
     */
    fetchPatrouilles: function() {
      let self = this;
      $('#patrouille-form-element').removeClass('slds-hide');
      const patrouillesUrl = `${this._options.baseRESTServicesURL}/patrouilles.php`;
      $.ajax({
        type: 'GET',
        url: patrouillesUrl,
        success: function(response) {
          console.log(`${patrouillesUrl}`, response);
          self.handlePatrouillesFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${patrouillesUrl} Request aborted`);
          } else {
            console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    /**
     * Handle Patrouilles fetch response
     * @param {Object} response Request response
     */
    handlePatrouillesFetched: function(response) {
      console.log(`>> handlePatrouillesFetched`, response);
      const self = this;
      let selectCtnr = $('#select-patrouille').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner une patrouille</option> 
        ${response.patrouilles.map(p => `<option value="${p.id}" data-patrouilleid="${p.id}" data-patrouillename="${p.name}">${p.name}</option>`).join('')}
      `)
      );
      $('#patrouille-validate-btn')
        .off()
        .click(function(e) {
          e.preventDefault();
          self.handleClickChoosePatrouille();
        })
        .removeClass('slds-hide');
    },
    handleClickChoosePatrouille: function() {
      const selectCtnr = $('#select-patrouille');
      let patrouilleId = selectCtnr.val();
      if (patrouilleId === '' || selectCtnr[0].selectedOptions.length === 0) {
        return;
      }
      patrouilleId = parseInt(patrouilleId);
      let selectedOption = $(selectCtnr[0].selectedOptions[0]);
      let patrouilleName = selectedOption.attr('data-patrouillename');
      this._selectedPatrouille = {
        id: patrouilleId,
        name: patrouilleName
      };
      $('#patrouille-form-element').addClass('slds-hide');
      $('#patrouille-validate-btn').addClass('slds-hide');
      $('#patrouille_name')
        .text(this._selectedPatrouille.name)
        .removeClass('slds-hide');

      this.fetchSousSecteurs(this._selectedPatrouille);
    },
    /**
     * Récupération des sous-secteurs d'une patrouille
     * @param {Object} patrouille Objet definissant une patrouille
     * Ex.:
     *  Méthode: GET
     *  Request params: patrouilleid=un_identification
     *  Request response:
     *    {
     *      "patrouille": [
     *        {"name": "GOLF 03", "id": 3 },
     *        {"name": "GOLF 11", "id": 11},
     *        {"name": "GOLF 14", "id": 14 }
     *      ]
     *    }
     */

    fetchSousSecteurs: function(patrouille) {
      const self = this;
      //const sousSecteursUrl = `/services/rest/mci/patrouilles/soussecteurs?patrouille=${patrouille.id}`;
      const sousSecteursUrl = `${this._options.baseRESTServicesURL}/sous_secteurs.php?patrouille=${patrouille.id}`;
      $.ajax({
        type: 'GET',
        url: sousSecteursUrl,
        success: function(response) {
          console.log(`${sousSecteursUrl}: `, response);
          self.handleSousSecteursFetched(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`[GET] ${sousSecteursUrl} Request aborted`);
          } else {
            console.error(`[GET] ${sousSecteursUrl} ERROR: ${textStatus}`, errorThrown);
          }
        }
      });
    },
    /**
     * Handle Sous-Secteurs fetch response
     * @param {Object} response Request response
     */
    handleSousSecteursFetched: function(response) {
      console.log(`>> handleSousSecteursFetched`, response);
      const self = this;
      if (response.code !== 200) {
        $('#error-message > .slds-form-element__help').text(`${response.message}`);
        $('#error-message').removeClass('slds-hide');

        $('#sous-secteurs-cancel-btn')
          .off()
          .click(function(e) {
            self.handleClickCancelSubSectors();
          })
          .removeClass('slds-hide');
        return;
      }
      let ssUL = $('<ul class="slds-listbox slds-listbox_vertical" role="presentation"></ul>');
      ssUL.append(
        $(`
          ${response['sous-secteurs']
            .map(
              ss => `
            <li role="presentation" class="slds-listbox__item">
              <div id="listbox-option-unique-id-${ss.id}" class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center" role="option" data-secteurid="${ss.id}" data-secteurname="${ss.name}">
                <span class="slds-media__figure">
                  <svg class="slds-icon slds-icon_x-small slds-listbox__icon-selected" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                  </svg>
                </span>
                <span class="slds-media__body">
                  <span class="slds-truncate" title="${ss.name}"> ${ss.name}</span>
                </span>
              </div>
            </li>
          `
            )
            .join('')}
        `)
      );
      ssUL.find('.slds-listbox__option').click(function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        $('#sous-secteurs-form-element div.slds-combobox').removeClass('slds-has-error');
        $('#error-message').addClass('slds-hide');

        $(this).toggleClass('slds-is-selected');
        self.updateSelectedSecteursInput();
      });
      $('#listbox-soussecteurs')
        .empty()
        .append(ssUL);
      $('#combobox-soussecteurs')
        .off()
        .focusin(function(e) {
          e.preventDefault();
          $('#sous-secteurs-form-element div.slds-combobox')
            //.removeClass('slds-combobox-picklist')
            .addClass('slds-is-open')
            .attr('aria-expanded', true);
          $('#listbox-soussecteurs').mouseleave(function(e) {
            $('#sous-secteurs-form-element div.slds-combobox')
              .removeClass('slds-is-open')
              //.addClass('slds-combobox-picklist')
              .attr('aria-expanded', false);
            $('#listbox-soussecteurs').off();
            self.updateSelectedSecteurs();
          });
        });
      $('#sous-secteurs-form-element').removeClass('slds-hide');
      $('#sous-secteurs-validate-btn')
        .off()
        .click(function(e) {
          self.handleClickValidateSubSectors();
        })
        .removeClass('slds-hide');
      $('#sous-secteurs-cancel-btn')
        .off()
        .click(function(e) {
          self.handleClickCancelSubSectors();
        })
        .removeClass('slds-hide');
    },
    updateSelectedSecteursInput: function() {
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected');
      if (selectedSecteurs.length === 0) {
        $('#combobox-soussecteurs').val('');
      } else if (selectedSecteurs.length === 1) {
        $('#combobox-soussecteurs').val($(selectedSecteurs[0]).attr('data-secteurname'));
      } else {
        $('#combobox-soussecteurs').val(`${selectedSecteurs.length} secteurs sélectionnés`);
      }
    },
    updateSelectedSecteurs: function() {
      const self = this;
      let listSelects = $('#listbox-selections-secteurs').empty();
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected');
      const nbSelected = selectedSecteurs.length;
      if (nbSelected > 1) {
        let ssUL = $('<ul class="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Options:"></ul>').append(
          $(`
            ${selectedSecteurs
              .toArray()
              .map(s => {
                const secteurName = $(s).attr('data-secteurname');
                const secteurId = $(s).attr('data-secteurid');
                return `
                  <li role="presentation" class="slds-listbox__item">
                    <span class="slds-pill" role="option" aria-selected="true">
                      <span class="slds-pill__label" title="${secteurName}" data-secteurid="${secteurId}" data-secteurname="${secteurName}">${secteurName}</span>
                      <span class="slds-icon_container slds-pill__remove" title="Retirer">
                        <svg class="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                          <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                        </svg>
                        <span class="slds-assistive-text">Press delete or backspace to remove</span>
                      </span>
                    </span>
                  </li>`;
              })
              .join('')}
          `)
        );
        ssUL.find('.slds-pill__remove').click(function(e) {
          const siblingSpan = $(this).siblings();
          const secteurId = siblingSpan.attr('data-secteurid');
          $(`#listbox-soussecteurs div.slds-listbox__option.slds-is-selected[data-secteurid="${secteurId}"]`).removeClass('slds-is-selected');
          self.updateSelectedSecteursInput();
          self.updateSelectedSecteurs();
        });
        listSelects.append(ssUL);
        listSelects.removeClass('slds-hide');
      } else {
        listSelects.addClass('slds-hide');
      }
    },
    handleClickValidateSubSectors: function() {
      console.warn('TODO: click validate selected sectors');
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected').toArray();
      if (selectedSecteurs.length === 0 || selectedSecteurs.length > 3) {
        $('#sous-secteurs-form-element div.slds-combobox').addClass('slds-has-error');
        $('#error-message > .slds-form-element__help').text(`Sélection d'un à trois sous-secteurs obligatoire.`);
        $('#error-message').removeClass('slds-hide');
        return;
      }
      $('#error-message').addClass('slds-hide');
      $('#sous-secteurs-form-element div.slds-combobox').removeClass('slds-has-error');
      const secteurs = selectedSecteurs.map(s => {
        let secteurId = $(s).attr('data-secteurid');
        let secteurName = $(s).attr('data-secteurname');
        console.log(`Secteur ${secteurName} (${secteurId})`);
        return { id: secteurId, name: secteurName };
      });
      let mapUrl = `/map.html`;
      sessionStorage.soussecteurs = JSON.stringify(secteurs);
      sessionStorage.role = this._currentRole;
      sessionStorage.patrouille = JSON.stringify(this._selectedPatrouille);
      location.href = mapUrl;
    },
    handleClickCancelSubSectors: function() {
      GGO.revokePatrouille(this._selectedPatrouille.id, {
        baseRESTServicesURL: this._options.baseRESTServicesURL,
        callback: this.fetchPatrouilles.bind(this),
        context: this
      });
      $('#sous-secteurs-form-element').addClass('slds-hide');
      $('#sous-secteurs-validate-btn')
        .off()
        .addClass('slds-hide');
      $('#sous-secteurs-cancel-btn')
        .off()
        .addClass('slds-hide');
      $('#error-message').addClass('slds-hide');
      /*
      $('#patrouille-form-element').removeClass('slds-hide');
      $('#patrouille-validate-btn').removeClass('slds-hide');
      */
    }
  };

  GGO.SessionManagerSingleton = (function() {
    let instance;
    function createInstance(options) {
      let sessionMgr = new GGO.SessionManager(options);
      return sessionMgr;
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

(function () {
  'use strict';
  GGO.SessionManager = function (options) {
    this._options = options || {};
    this._options.baseRESTServicesURL = this._options.baseRESTServicesURL || '/services/rest/mci';
    this._init();
  };

  GGO.SessionManager.prototype = {
    _init: function () {
      this._setupListeners();
    },
    _setupListeners: function () {
      let self = this;
      $(document).on('keypress', function (e) {
        let code = e.keyCode || e.which;
        if (code === 13) {
          $('#login-btn').trigger('click');
        }
      });
      $('#login-btn').click(function (e) {
        let loginVal = $('#user-login-input').val();
        let pwdVal = $('#user-password-input').val();
        let allFilled = true;
        if (loginVal.trim() === '') {
          allFilled = false;
          $('#user-login-input').parent().parent().addClass('slds-has-error');
        }
        if (pwdVal.trim() === '') {
          allFilled = false;
          $('#user-password-input').parent().parent().addClass('slds-has-error');
        }
        if (allFilled) {
          $('#error-message').addClass('slds-hide');
          let loginRequest = {
            login: loginVal,
            password: pwdVal,
          };
          self.authenticateUser(loginRequest);
        } else {
          $('#error-message > .slds-form-element__help').text('Login et mot de passe doivent être renseignés.');
          $('#error-message').removeClass('slds-hide');
        }
      });
      $('#login-btn-new').click(function (e) {
        let loginVal = $('#user-login-input').val();
        let pwdVal = $('#user-newpassword-input').val();
        let allFilled = true;
        if (pwdVal.trim() === '') {
          allFilled = false;
          $('#user-password-input').parent().parent().addClass('slds-has-error');
        }
        if (allFilled) {
          $('#error-message').addClass('slds-hide');
          let loginRequest = {
            login: loginVal,
            password: pwdVal,
          };
          self.newPassword(loginRequest);
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
    authenticateUser: function (loginRequest) {
      let self = this;
      $.ajax({
        type: 'POST',
        url: `${this._options.baseRESTServicesURL}/connexion.php`,
        data: JSON.stringify(loginRequest),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
          console.log(`Response`, response);
          self.handleUserAuthentication(response, loginRequest.login);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          const errResponse = jqXHR.responseJSON;
          let errMsg = errResponse.message || 'Une erreur est survenue, veuillez contacter votre administrateur';
          $('#error-message > .slds-form-element__help').text(errMsg);
          $('#error-message').removeClass('slds-hide');
        },
      });
    },
    handleUserAuthentication: function (authResponse, username) {
      $('#error-message').addClass('slds-hide');
      if (!authResponse.authentification & authResponse.structure) {
        let errMsg = authResponse.message || 'Une erreur est survenue, veuillez contacter votre administrateur';
        $('#error-message > .slds-form-element__help').text(errMsg);
        $('#error-message').removeClass('slds-hide');
        return;
      } else if (!authResponse.authentification & !authResponse.structure) {
        let errMsg = authResponse.message || 'Une erreur est survenue, le mot de passe doit avoir 8 caractères comprenant majuscules, minuscules, chiffres et caractères spéciaux.';
        $('#error-message > .slds-form-element__help').text(errMsg);
        $('#error-message').removeClass('slds-hide');
        return;
      }
      $('#user-login-input').attr('disabled', true);
      $('#user-login-input').parent().parent().removeClass('slds-has-error');
      $('#user-password-input').attr('disabled', true);
      $('#user-password-input').parent().parent().removeClass('slds-has-error');
      $('#login-btn').addClass('slds-hide');
      $('#login-btn-new').addClass('slds-hide');
      this._currentRole = authResponse.role;
      if (authResponse.first_connexion) {
        $('#new-password-form-element').removeClass('slds-hide');
        $('#login-btn').addClass('slds-hide');
        $('#login-btn-new').removeClass('slds-hide');
      } else {
        switch (authResponse.role) {
          case 'india':
            this.fetchPatrouilles();
            break;
          case 'charly':
          case 'alpha':
            //GGO.SessionIssuePrompt('Rôle utilisateur non disponible', `Le rôle '<b>${authResponse.role}</b>' n\'est pas disponible pour le moment.<br /> Veuillez vous reconnecter.`, $('#appContainer').empty());
            this._currentUserName = username;
            this.fetchChefsGroup(this._currentUserName);
            break;
          default:
            $('#error-message > .slds-form-element__help').text(`Le rôle ${authResponse.role} n'est pas un rôle valide.`);
            $('#error-message').removeClass('slds-hide');
        }
      }
      $('#patrouille_name').text(username.toUpperCase()).removeClass('slds-hide');
    },
    newPassword: function (newLoginRequest) {
      let self = this;
      $.ajax({
        type: 'POST',
        url: `${this._options.baseRESTServicesURL}/save_password.php`,
        data: JSON.stringify(newLoginRequest),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
          console.log(`Response`, response);
          self.handleUserAuthentication(response, newLoginRequest.login);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          const errResponse = jqXHR.responseJSON;
          let errMsg = errResponse.message || 'Une erreur est survenue, veuillez contacter votre administrateur';
          $('#error-message > .slds-form-element__help').text(errMsg);
          $('#error-message').removeClass('slds-hide');
        },
      });
    },
    fetchSecteursChefGroup: function () {
      $('#chefs_groupe-validate-btn').addClass('slds-hide');
      $('#chefs_groupe-cancel-btn').addClass('slds-hide');
      $('#combobox-chefs-groupe').attr('disabled', true);
      $('.slds-icon_container.slds-pill__remove').addClass('slds-hide');
      let self = this;
      const secteursUrl = `${this._options.baseRESTServicesURL}/secteurs.php`;
      $.ajax({
        type: 'GET',
        url: secteursUrl,
        success: function (response) {
          console.log(`${secteursUrl}`, response);
          self.handleSecteursFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${secteursUrl} Request aborted`);
          } else {
            console.error(`Error for ${secteursUrl} request: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    fetchChefsGroup: function (chefGroupeConnected) {
      let self = this;
      const chefsGroupeUrl = `${this._options.baseRESTServicesURL}/chefs_groupe.php?chef_connected=${chefGroupeConnected}`;
      $.ajax({
        type: 'GET',
        url: chefsGroupeUrl,
        success: function (response) {
          console.log(`${chefsGroupeUrl}`, response);
          self.handleChefsGroupeFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${chefsGroupeUrl} Request aborted`);
          } else {
            console.error(`Error for ${chefsGroupeUrl} request: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    handleChefsGroupeFetched: function (response) {
      console.log(`>> handleChefsGroupeFetched`, response);
      if (response.code !== 200) {
        $('#error-message > .slds-form-element__help').text(`${response.message}`);
        $('#error-message').removeClass('slds-hide');

        $('#chefs_groupe-cancel-btn')
          .off()
          .click(function (e) {
            self.handleClickCancelSectors();
          })
          .removeClass('slds-hide');
        return;
      }
      let self = this;
      $('#combobox-chefs-groupe').attr('placeholder', 'Choisir les chefs de groupe');
      let ssUL = $('<ul class="slds-listbox slds-listbox_vertical" role="presentation"></ul>');
      let uniqueChefsGroupeValues = Array.from(new Set(response.chefs_groupe.map((s) => s.name)));
      ssUL.append(
        $(`
            ${uniqueChefsGroupeValues
              .map(
                (ss) => `
              <li role="presentation" class="slds-listbox__item">
                <div id="listbox-option-unique-id-${ss}" class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center" role="option" data-chefgroupeid="${ss}" data-chefsgroupename="${ss}">
                  <span class="slds-media__figure">
                    <svg class="slds-icon slds-icon_x-small slds-listbox__icon-selected" aria-hidden="true">
                      <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                    </svg>
                  </span>
                  <span class="slds-media__body">
                    <span class="slds-truncate" title="${ss}"> ${ss}</span>
                  </span>
                </div>
              </li>
            `
              )
              .join('')}
          `)
      );
      ssUL.find('.slds-listbox__option').click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        $('#chefs-groupe-form-element div.slds-combobox').removeClass('slds-has-error');
        $('#error-message').addClass('slds-hide');

        $(this).toggleClass('slds-is-selected');
        self.updateSelectedChefsGroupeInput();
      });
      $('#listbox-chefs-groupe').empty().append(ssUL);
      $('#combobox-chefs-groupe')
        .off()
        .focusin(function (e) {
          e.preventDefault();
          $('#chefs-groupe-form-element div.slds-combobox')
            //.removeClass('slds-combobox-picklist')
            .addClass('slds-is-open')
            .attr('aria-expanded', true);
          $('#listbox-chefs-groupe').mouseleave(function (e) {
            $('#chefs-groupe-form-element div.slds-combobox')
              .removeClass('slds-is-open')
              //.addClass('slds-combobox-picklist')
              .attr('aria-expanded', false);
            $('#listbox-chefs-groupe').off();
            self.updateSelectedChefsGroupe();
          });
        });
      $('#chefs-groupe-form-element').removeClass('slds-hide');
      $('#chefs_groupe-validate-btn')
        .off()
        .click(function (e) {
          self.handleClickValidateChefsGroupe();
        })
        .removeClass('slds-hide');
      $('#chefs_groupe-cancel-btn')
        .off()
        .click(function (e) {
          self.handleClickCancelSectors();
        })
        .removeClass('slds-hide');
    },
    handleSecteursFetched: function (response) {
      console.log(`>> handleSecteursFetched`, response);
      if (response.code !== 200) {
        $('#error-message > .slds-form-element__help').text(`${response.message}`);
        $('#error-message').removeClass('slds-hide');

        $('#sous-secteurs-cancel-btn')
          .off()
          .click(function (e) {
            self.handleClickCancelSectors();
          })
          .removeClass('slds-hide');
        return;
      }
      switch (this._currentRole) {
        case 'charly':
          this.handleSecteursFetchedCharly(response);
          break;
        case 'alpha':
          let uniqueSecteursValues = Array.from(new Set(response.secteurs.map((s) => s.name)));
          this.validateChefGroupLoginSteps(uniqueSecteursValues);
          break;
        default:
          GGO.SessionIssuePrompt('Rôle utilisateur non disponible', `Le rôle '<b>${this._currentRole}</b>' n\'est pas disponible pour le moment.<br /> Veuillez vous reconnecter.`, $('#appContainer').empty());
      }
    },
    handleClickCancelSectors: function () {
      GGO.disconnect(undefined, {
        userName: this._currentUserName,
        userRole: this._currentRole,
        baseRESTServicesURL: '/services/rest/mci',
      });
    },
    handleSecteursFetchedCharly: function (response) {
      let self = this;
      $('#combobox-soussecteurs').attr('placeholder', 'Choisir 1 à 3 secteurs');
      $('#sous-secteurs-form-element')[0].firstElementChild.innerHTML = '<abbr class="slds-required" title="required">* </abbr>Secteurs';
      let ssUL = $('<ul class="slds-listbox slds-listbox_vertical" role="presentation"></ul>');
      let uniqueSecteursValues = Array.from(new Set(response.secteurs.map((s) => s.name)));
      ssUL.append(
        $(`
          ${uniqueSecteursValues
            .map(
              (ss) => `
            <li role="presentation" class="slds-listbox__item">
              <div id="listbox-option-unique-id-${ss}" class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center" role="option" data-secteurid="${ss}" data-secteurname="${ss}">
                <span class="slds-media__figure">
                  <svg class="slds-icon slds-icon_x-small slds-listbox__icon-selected" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                  </svg>
                </span>
                <span class="slds-media__body">
                  <span class="slds-truncate" title="${ss}"> ${ss}</span>
                </span>
              </div>
            </li>
          `
            )
            .join('')}
        `)
      );
      ssUL.find('.slds-listbox__option').click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        $('#sous-secteurs-form-element div.slds-combobox').removeClass('slds-has-error');
        $('#error-message').addClass('slds-hide');

        $(this).toggleClass('slds-is-selected');
        self.updateSelectedSecteursInput();
      });
      $('#listbox-soussecteurs').empty().append(ssUL);
      $('#combobox-soussecteurs')
        .off()
        .focusin(function (e) {
          e.preventDefault();
          $('#sous-secteurs-form-element div.slds-combobox')
            //.removeClass('slds-combobox-picklist')
            .addClass('slds-is-open')
            .attr('aria-expanded', true);
          $('#listbox-soussecteurs').mouseleave(function (e) {
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
        .click(function (e) {
          self.handleClickValidateSectors();
        })
        .removeClass('slds-hide');
      $('#sous-secteurs-cancel-btn')
        .off()
        .click(function (e) {
          self.handleClickCancelSectors();
        })
        .removeClass('slds-hide');
    },
    handleClickValidateSectors: function () {
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
      const secteurs = selectedSecteurs.map((s) => {
        let secteurId = $(s).attr('data-secteurid');
        return secteurId;
      });
      this.validateChefGroupLoginSteps(secteurs);
    },
    handleClickValidateChefsGroupe: function () {
      console.warn('TODO: click validate selected sectors');
      const selectedChefsGroupe = $('#listbox-chefs-groupe div.slds-listbox__option.slds-is-selected').toArray();
      if (selectedChefsGroupe.length === 0 || selectedChefsGroupe.length > 3) {
        $('#chefs-groupe-form-element div.slds-combobox').addClass('slds-has-error');
        $('#error-message > .slds-form-element__help').text(`Sélection d'un à trois chefs de groupe obligatoire.`);
        $('#error-message').removeClass('slds-hide');
        return;
      }
      $('#error-message').addClass('slds-hide');
      $('#chefs-groupe-form-element div.slds-combobox').removeClass('slds-has-error');
      const chefsGroupe = selectedChefsGroupe.map((s) => {
        let chefsGroupeId = $(s).attr('data-chefgroupeid');
        return chefsGroupeId;
      });

      sessionStorage.chefsGroupe = chefsGroupe;
      this.fetchSecteursChefGroup();
    },
    validateChefGroupLoginSteps: function (selectedSecteurs) {
      let mapUrl = `/chefgroup.html`;
      sessionStorage.secteurs = JSON.stringify(selectedSecteurs);
      sessionStorage.role = this._currentRole;
      sessionStorage.username = this._currentUserName;
      location.href = mapUrl;
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
    fetchPatrouilles: function () {
      let self = this;
      $('#patrouille-form-element').removeClass('slds-hide');
      $('#new-password-form-element').addClass('slds-hide');
      const patrouillesUrl = `${this._options.baseRESTServicesURL}/patrouilles.php`;
      $.ajax({
        type: 'GET',
        url: patrouillesUrl,
        success: function (response) {
          console.log(`${patrouillesUrl}`, response);
          self.handlePatrouillesFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${patrouillesUrl} Request aborted`);
          } else {
            console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    /**
     * Handle Patrouilles fetch response
     * @param {Object} response Request response
     */
    handlePatrouillesFetched: function (response) {
      console.log(`>> handlePatrouillesFetched`, response);
      const self = this;
      let selectCtnr = $('#select-patrouille').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner une patrouille</option> 
        ${response.patrouilles.map((p) => `<option value="${p.id}" data-patrouilleid="${p.id}" data-patrouillename="${p.name}">${p.name}</option>`).join('')}
      `)
      );
      $('#patrouille-validate-btn')
        .off()
        .click(function (e) {
          e.preventDefault();
          self.handleClickChoosePatrouille();
        })
        .removeClass('slds-hide');
    },
    handleClickChoosePatrouille: function () {
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
        name: patrouilleName,
      };
      $('#patrouille-form-element').addClass('slds-hide');
      $('#patrouille-validate-btn').addClass('slds-hide');
      $('#patrouille_name').text(this._selectedPatrouille.name).removeClass('slds-hide');

      //this.fetchSousSecteurs(this._selectedPatrouille);
      this.fetchImmatriculations();
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
    fetchImmatriculations: function () {
      let self = this;
      $('#immatriculation-form-element').removeClass('slds-hide');
      const immatriculationsURL = `${this._options.baseRESTServicesURL}/immatriculations.php`;
      $.ajax({
        type: 'GET',
        url: immatriculationsURL,
        success: function (response) {
          console.log(`${immatriculationsURL}`, response);
          self.handleImmatriculationsFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${immatriculationsURL} Request aborted`);
          } else {
            console.error(`Error for ${immatriculationsURL} request: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    /**
     * Handle Patrouilles fetch response
     * @param {Object} response Request response
     */
    handleImmatriculationsFetched: function (response) {
      console.log(`>> handleImmatriculationsFetched`, response);
      const self = this;
      let selectCtnr = $('#select-immatriculation').empty();
      selectCtnr.append(
        $(`
        <option value="">Sélectionner un véhicule</option> 
        ${response.immatriculations.map((p) => `<option value="${p.id}" data-immatriculationid="${p.id}" data-immatriculationname="${p.name}">${p.name}</option>`).join('')}
      `)
      );
      $('#immatriculation-validate-btn')
        .off()
        .click(function (e) {
          e.preventDefault();
          self.handleClickChooseImmatriculation();
        })
        .removeClass('slds-hide');
      $('#immatriculation-cancel-btn')
        .off()
        .click(function (e) {
          self.handleClickCancelImmatriculation();
        })
        .removeClass('slds-hide');
    },
    handleClickCancelImmatriculation: function () {
      GGO.revokePatrouille(this._selectedPatrouille.id, {
        baseRESTServicesURL: this._options.baseRESTServicesURL,
        callback: this.fetchPatrouilles.bind(this),
        context: this,
      });
      $('#immatriculation-form-element').addClass('slds-hide');
      $('#immatriculation-validate-btn').off().addClass('slds-hide');
      $('#immatriculation-cancel-btn').off().addClass('slds-hide');
      $('#error-message').addClass('slds-hide');
      /*
      $('#patrouille-form-element').removeClass('slds-hide');
      $('#patrouille-validate-btn').removeClass('slds-hide');
      */
    },
    handleClickChooseImmatriculation: function () {
      const selectCtnr = $('#select-immatriculation');
      let immatriculationId = selectCtnr.val();
      if (immatriculationId === '' || selectCtnr[0].selectedOptions.length === 0) {
        return;
      }
      immatriculationId = parseInt(immatriculationId);
      let selectedOption = $(selectCtnr[0].selectedOptions[0]);
      let immatriculationName = selectedOption.attr('data-immatriculationname');
      this._selectedImmatriculation = {
        id: immatriculationId,
        name: immatriculationName,
      };
      $('#immatriculation-form-element').addClass('slds-hide');
      $('#immatriculation-validate-btn').addClass('slds-hide');
      $('#immatriculation_name').text(this._selectedImmatriculation.name).removeClass('slds-hide');
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

    fetchSousSecteurs: function (patrouille) {
      const self = this;
      //const sousSecteursUrl = `/services/rest/mci/patrouilles/soussecteurs?patrouille=${patrouille.id}`;
      const sousSecteursUrl = `${this._options.baseRESTServicesURL}/sous_secteurs.php?patrouille=${patrouille.id}`;
      $.ajax({
        type: 'GET',
        url: sousSecteursUrl,
        success: function (response) {
          console.log(`${sousSecteursUrl}: `, response);
          self.handleSousSecteursFetched(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`[GET] ${sousSecteursUrl} Request aborted`);
          } else {
            console.error(`[GET] ${sousSecteursUrl} ERROR: ${textStatus}`, errorThrown);
          }
        },
      });
    },
    /**
     * Handle Sous-Secteurs fetch response
     * @param {Object} response Request response
     */
    handleSousSecteursFetched: function (response) {
      console.log(`>> handleSousSecteursFetched`, response);
      const self = this;
      if (response.code !== 200) {
        $('#error-message > .slds-form-element__help').text(`${response.message}`);
        $('#error-message').removeClass('slds-hide');

        $('#sous-secteurs-cancel-btn')
          .off()
          .click(function (e) {
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
              (ss) => `
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
      ssUL.find('.slds-listbox__option').click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        $('#sous-secteurs-form-element div.slds-combobox').removeClass('slds-has-error');
        $('#error-message').addClass('slds-hide');

        $(this).toggleClass('slds-is-selected');
        self.updateSelectedSecteursInput();
      });
      $('#listbox-soussecteurs').empty().append(ssUL);
      $('#combobox-soussecteurs')
        .off()
        .focusin(function (e) {
          e.preventDefault();
          $('#sous-secteurs-form-element div.slds-combobox')
            //.removeClass('slds-combobox-picklist')
            .addClass('slds-is-open')
            .attr('aria-expanded', true);
          $('#listbox-soussecteurs').mouseleave(function (e) {
            $('#sous-secteurs-form-element div.slds-combobox')
              .removeClass('slds-is-open')
              //.addClass('slds-combobox-picklist')
              .attr('aria-expanded', false);
            $('#listbox-soussecteurs').off();
            self.updateSelectedSecteurs();
          });
        });
      $('#immatriculation-cancel-btn').addClass('slds-hide');
      $('#sous-secteurs-form-element').removeClass('slds-hide');
      $('#sous-secteurs-validate-btn')
        .off()
        .click(function (e) {
          self.handleClickValidateSubSectors();
        })
        .removeClass('slds-hide');
      $('#sous-secteurs-cancel-btn')
        .off()
        .click(function (e) {
          self.handleClickCancelSubSectors();
        })
        .removeClass('slds-hide');
    },
    updateSelectedSecteursInput: function () {
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected');
      if (selectedSecteurs.length === 0) {
        $('#combobox-soussecteurs').val('');
      } else if (selectedSecteurs.length === 1) {
        $('#combobox-soussecteurs').val($(selectedSecteurs[0]).attr('data-secteurname'));
      } else {
        $('#combobox-soussecteurs').val(`${selectedSecteurs.length} secteurs sélectionnés`);
      }
    },
    updateSelectedChefsGroupeInput: function () {
      const selectedSecteurs = $('#listbox-chefs-groupe div.slds-listbox__option.slds-is-selected');
      if (selectedSecteurs.length === 0) {
        $('#combobox-chefs-groupe').val('');
      } else if (selectedSecteurs.length === 1) {
        $('#combobox-chefs-groupe').val($(selectedSecteurs[0]).attr('data-Chefsgroupename'));
      } else {
        $('#combobox-chefs-groupe').val(`${selectedSecteurs.length} chefs de groupe sélectionnés`);
      }
    },
    updateSelectedChefsGroupe: function () {
      const self = this;
      let listSelects = $('#listbox-selections-chefs-groupe').empty();
      const selectedChefsGroupe = $('#listbox-chefs-groupe div.slds-listbox__option.slds-is-selected');
      const nbSelected = selectedChefsGroupe.length;
      if (nbSelected > 1) {
        let ssUL = $('<ul class="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Options:"></ul>').append(
          $(`
            ${selectedChefsGroupe
              .toArray()
              .map((s) => {
                const ChefGroupeName = $(s).attr('data-Chefsgroupename');
                const ChefGroupeId = $(s).attr('data-chefgroupeid');
                return `
                  <li role="presentation" class="slds-listbox__item">
                    <span class="slds-pill" role="option" aria-selected="true">
                      <span class="slds-pill__label" title="${ChefGroupeName}" data-chefgroupeid="${ChefGroupeId}" data-chefgroupename="${ChefGroupeName}">${ChefGroupeName}</span>
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
        ssUL.find('.slds-pill__remove').click(function (e) {
          const siblingSpan = $(this).siblings();
          const ChefGroupeId = siblingSpan.attr('data-chefgroupeid');
          $(`#listbox-chefs-groupe div.slds-listbox__option.slds-is-selected[data-chefgroupeid="${ChefGroupeId}"]`).removeClass('slds-is-selected');
          self.updateSelectedChefsGroupeInput();
          self.updateSelectedChefsGroupe();
        });
        listSelects.append(ssUL);
        listSelects.removeClass('slds-hide');
      } else {
        listSelects.addClass('slds-hide');
      }
    },
    updateSelectedSecteurs: function () {
      const self = this;
      let listSelects = $('#listbox-selections-secteurs').empty();
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected');
      const nbSelected = selectedSecteurs.length;
      if (nbSelected > 1) {
        let ssUL = $('<ul class="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Options:"></ul>').append(
          $(`
            ${selectedSecteurs
              .toArray()
              .map((s) => {
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
        ssUL.find('.slds-pill__remove').click(function (e) {
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
    handleClickValidateSubSectors: function () {
      console.warn('TODO: click validate selected sectors');
      const selectedSecteurs = $('#listbox-soussecteurs div.slds-listbox__option.slds-is-selected').toArray();
      if (selectedSecteurs.length === 0 || selectedSecteurs.length > 5) {
        $('#sous-secteurs-form-element div.slds-combobox').addClass('slds-has-error');
        $('#error-message > .slds-form-element__help').text(`Sélection d'un à cinq sous-secteurs obligatoire.`);
        $('#error-message').removeClass('slds-hide');
        return;
      }
      $('#error-message').addClass('slds-hide');
      $('#sous-secteurs-form-element div.slds-combobox').removeClass('slds-has-error');
      const secteurs = selectedSecteurs.map((s) => {
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
    handleClickCancelSubSectors: function () {
      GGO.revokeVehicle(this._selectedImmatriculation.id, {
        baseRESTServicesURL: this._options.baseRESTServicesURL,
        callback: this.fetchImmatriculations.bind(this),
        context: this,
      });
      $('#sous-secteurs-form-element').addClass('slds-hide');
      $('#sous-secteurs-validate-btn').off().addClass('slds-hide');
      $('#sous-secteurs-cancel-btn').off().addClass('slds-hide');
      $('#error-message').addClass('slds-hide');
      /*GGO.revokePatrouille(this._selectedPatrouille.id, {
        baseRESTServicesURL: this._options.baseRESTServicesURL,
        callback: this.fetchPatrouilles.bind(this),
        context: this,
      });
      $('#sous-secteurs-form-element').addClass('slds-hide');
      $('#sous-secteurs-validate-btn').off().addClass('slds-hide');
      $('#sous-secteurs-cancel-btn').off().addClass('slds-hide');
      $('#error-message').addClass('slds-hide');
      */

      $('#immatriculation-form-element').removeClass('slds-hide');
      $('#immatriculation-validate-btn').removeClass('slds-hide');
    },
  };

  GGO.SessionManagerSingleton = (function () {
    let instance;
    function createInstance(options) {
      let sessionMgr = new GGO.SessionManager(options);
      return sessionMgr;
    }
    return {
      getInstance: function (options) {
        if (!instance) {
          instance = createInstance(options);
        }
        return instance;
      },
    };
  })();
})();

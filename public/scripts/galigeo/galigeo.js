/* START GGO: put code below in galigeo.js */
(function () {
  'use strict';
  var GGO = {
    version: 'GGO.0.0.1',
  };

  function expose() {
    var oldGGO = window.GGO;

    GGO.noConflict = function () {
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

  GGO.SessionIssuePrompt = function (title, message, container) {
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
    $('#appContainer footer > button.slds-button').click(function (e) {
      GGO.disconnect();
      /*
      sessionStorage.clear();
      var logoutForm = $('<form action="/logout" />');

      $('body').append(logoutForm);
      logoutForm.submit();
      */
    });
  };

  GGO.SessionSummaryPrompt = function (title, container, options) {
    container.append(`
        <section role="alertdialog" tabindex="0" aria-labelledby="prompt-heading-id" aria-describedby="prompt-message-wrapper" class="slds-modal slds-fade-in-open slds-modal_prompt" aria-modal="true" style="z-index: 10000;">
          <div class="slds-modal__container">
            <header class="slds-modal__header slds-theme_alt-inverse slds-theme_alert-texture">
              <h2 class="slds-text-heading_medium" id="prompt-heading-id">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_medium" id="prompt-message-wrapper">
            </div>
            <footer class="slds-modal__footer slds-theme_default">
            <button class="slds-button slds-button_neutral" data-what="return">Retour</button>
              <button class="slds-button slds-button_destructive" data-what="end">Fin de vacation</button>
            </footer>
          </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open"></div>
    `);
    $('#appContainer footer > button.slds-button').click(function (e) {
      const what = $(this).data('what');
      switch (what) {
        case 'end':
          let patrouille = self.galigeo.getPatrouille();
          let immatriculation = self.galigeo.getVehicule();
          GGO.disconnect(patrouille ? patrouille.id : undefined, immatriculation ? immatriculation.id : undefined, {
            baseRESTServicesURL: '/services/rest/mci',
            fonction: 'fin',
          });
          break;
        case 'return':
          $('.slds-modal').remove();
          $('.slds-backdrop').remove();
          break;

        default:
          break;
      }
    });
    /* TODO:
      1. appel REST pour recupérer les infos
      2. afficher les infos dans 'prompt-message-wrapper' $('#prompt-message-wrapper').empty()
      */
    let paramsArr = [];
    if (options.patrouilleId) {
      paramsArr.push(`patrouille_id=${options.patrouilleId}`);
    } else {
      paramsArr.push(`chef_groupe=${options.userName}`);
      paramsArr.push(`chefs_groupe=${options.chefsGroupe}`);
    }
    const vacationUrl = `${options.baseRESTServicesURL}/bilan_vacation.php?${paramsArr.join('&')}`;
    $.ajax({
      type: 'GET',
      url: vacationUrl,
      //dataType: 'json',
      success: function (response) {
        console.log(`Resume Patrouille Vacation response: `, response);
        let type_cat_missions = [
          {
            type_cat: 1,
            label: 'Rondes',
            nb: 0,
          },
          {
            type_cat: 2,
            label: 'Interventions',
            nb: 0,
          },
          {
            type_cat: 3,
            label: 'Activités dirigées',
            nb: 0,
          },
          {
            type_cat: 4,
            label: 'OPC',
            nb: 0,
          },
        ];

        if (response.code === 200) {
          response.bilan_vacation.forEach((b) => {
            let cat_miss = type_cat_missions.find((m) => m.type_cat === b.type_categorie_mission);
            if (cat_miss) {
              cat_miss.nb = b.nb_missions;
            }
          });
          $('#prompt-message-wrapper')
            .empty()
            .append(
              $(`
            <div class="slds-region_narrow" style="width:100%;">
              <dl class="slds-dl_horizontal">
                ${type_cat_missions
                  //.filter(m => m.nb > 0) /* Si besoin de filtrage */
                  .map((b) => {
                    return `<dt class="slds-dl_horizontal__label" style="width:50%;"><b>${b.label}</b>:</dt>
                  <dd class="slds-dl_horizontal__detail" style="width:50%;">${b.nb}</dd>`;
                  })
                  .join('')}
              </dl>
            </div>`)
            );
        } else {
          // mettre message d'erreur
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (textStatus === 'abort') {
          console.warn(`${vacationUrl} Request aborted`);
        } else {
          console.error(`Error for ${vacationUrl} request: ${textStatus}`, errorThrown);
        }
      },
    });
  };

  GGO.getRandomInteger = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };
  GGO.invertColor = function (hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xffffff ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ('000000' + color).slice(-6); // pad with leading zeros
    color = '#' + color; // prepend #
    return color;
  };

  GGO.formatDistance = function (distanceKM) {
    if (distanceKM < 1) {
      return (distanceKM * 1000).toFixed(0) + ' m';
    } else {
      return distanceKM.toFixed(2) + ' km';
    }
  };

  GGO.CHECK_MISSION_INTERVALLE = 7000;
  GGO.CHECK_PAUSE_INTERVALLE = 10000 * 6 * 5;
  GGO.CHECK_RESTRICTIONS_INTERVALLE = 20000;
  GGO.CHECK_PATRIMOINE_INTERVALLE = 120000;
  GGO.CHECK_CRISES_INTERVALLE = 20000;
  GGO.CHECK_VEHICULES_INTERVALLE = 20000;
  GGO.COLORPALETTES = {
    rdYlBu: ['#4874bf', '#228714', '#edeb2a', '#f99e38', '#ff0000', '#000000'],
    secteurs: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'],
    secteurs_voisinages: ['#d9d9d9', '#fccde5', '#b3de69', '#fdb462', '#80b1d3', '#fb8072', '#bebada', '#ffffb3', '#8dd3c7'],
    rondes_fin: ['#808080'],
  };

  GGO.notifyNewMissionSound = function (code) {
    let name_music = null;
    /*
    if (code === 1) {
      var name_music = '/sounds/new_mission.mp3'; // new mission
    } else if (code === 2) {
      var name_music = '/sounds/kaxon_velo.mp3'; // fin de pause
    } else if (code === 3) {
      var name_music = '/sounds/new_alert.mp3'; // fin de pause
    }
    */
    switch (code) {
      case 1:
        name_music = '/sounds/new_mission.mp3';
        break;
      case 2:
        name_music = '/sounds/kaxon_velo.mp3';
        break;
      case 3:
        name_music = '/sounds/new_restriction.mp3';
        break;
      case 4:
        name_music = '/sounds/new_crisis.mp3';
        break;
      default:
        console.war(`code ${code} non supporté`);
    }
    if (name_music) {
      try {
        var music = new Audio(name_music);
        var p = music.play();
        p.then((event) => {
          console.log(event);
        }).catch((err) => {
          console.log(err.message);
        });
      } catch (error) {
        console.error(`Error while playing sound`, error);
      }
    }
  };

  GGO.getDefaultColorPalette = function () {
    return GGO.COLORPALETTES['rdYlBu'];
  };

  GGO.getColorPalette = function (paletteName) {
    return GGO.COLORPALETTES[paletteName] || GGO.getDefaultColorPalette();
  };

  GGO.getColorForStatutMission = function (statut) {
    if (statut === 1) {
      return '#FFC100';
    } else if (statut === 2) {
      return '#0070d2';
    } else if (statut === 5) {
      return '#4bca81';
    }
  };

  GGO.getColorForStatutMissionLabel = function (statut) {
    if (statut === 'En direction') {
      return '#FFC100';
    } else if (statut === 'Début') {
      return '#0070d2';
    } else if (statut === 'Fin') {
      return '#4bca81';
    }
  };

  GGO.getColorForEtatVehicule = function (etat) {
    if (etat === 'a') {
      return '#000000';
    } else if (etat === 'A') {
      return '#ff0000';
    } else if (etat === 'R') {
      return '#0EC516';
    } else if (etat === 'T') {
      return '#FFE800';
    }
  };

  GGO.shadeHexColor = function (color, percent) {
    /* 
      Percent: 
        > 0 => lighter
        < 0 => darker
    */
    var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
    return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  };

  GGO.revokePatrouille = function (patrouilleId, options) {
    if (typeof patrouilleId !== 'undefined') {
      const patrouillesUrl = `${options.baseRESTServicesURL}/liberer_patrouille.php?patrouille=${patrouilleId}`;
      $.ajax({
        type: 'GET',
        url: patrouillesUrl,
        success: function (response) {
          console.log(`Patrouille ${patrouilleId} libérée !`);
          if (typeof options.callback === 'function') {
            options.callback.apply(options.context);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`REVOKEPATROUILLE  ${patrouillesUrl} Request aborted`);
          } else {
            console.error(`REVOKEPATROUILLE Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
          }
          if (typeof options.callback === 'function') {
            options.callback.apply(options.context);
          }
        },
      });
    }
  };

  GGO.revokeVehicle = function (immatriculationId, patrouilleId, options) {
    if (typeof immatriculationId !== 'undefined') {
      const vehiculesUrl = `${options.baseRESTServicesURL}/liberer_vehicule.php?immatriculation=${immatriculationId}&patrouille=${patrouilleId}`;
      $.ajax({
        type: 'GET',
        url: vehiculesUrl,
        success: function (response) {
          console.log('VEHICULE REVOKED');
          if (typeof options.callback === 'function') {
            console.log('VEHICLE REVOKED');
            options.callback.apply(options.context);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`REVOKEPATROUILLE  ${vehiculesUrl} Request aborted`);
          } else {
            console.error(`REVOKEPATROUILLE Error for ${vehiculesUrl} request: ${textStatus}`, errorThrown);
          }
          if (typeof options.callback === 'function') {
            options.callback.apply(options.context);
          }
        },
      });
    }
  };

  GGO.disconnect = function (patrouilleId, immatriculationId, options) {
    sessionStorage.clear();
    if (typeof patrouilleId !== 'undefined') {
      if (options.fonction == 'deconnexion') {
        const patrouillesUrl = `${options.baseRESTServicesURL}/liberer_patrouille.php?patrouille=${patrouilleId}&immatriculation=${immatriculationId}`;
        const vehiculesUrl = `${options.baseRESTServicesURL}/liberer_vehicule.php?immatriculation=${immatriculationId}&patrouille=${patrouilleId}`;
        $.ajax({
          type: 'GET',
          url: patrouillesUrl,
          success: function (response) {
            console.log(`Revoke Patrouille response: `, response);
            GGO.revokeVehicle(immatriculationId, patrouilleId, {
              baseRESTServicesURL: '/services/rest/mci',
              fonction: 'deconnexion',
            });
            GGO.postLogoutForm();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus === 'abort') {
              console.warn(`${patrouillesUrl} Request aborted`);
            } else {
              console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
            }
            GGO.revokeVehicle(immatriculationId, patrouilleId, {
              baseRESTServicesURL: '/services/rest/mci',
              fonction: 'deconnexion',
            });
            GGO.postLogoutForm();
          },
        });
        /*$.ajax({
          type: 'GET',
          url: vehiculesUrl,
          success: function (response) {
            console.log(`Revoke Vehicule response: `, response);
            GGO.postLogoutForm();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus === 'abort') {
              console.warn(`${vehiculesUrl} Request aborted`);
            } else {
              console.error(`Error for ${vehiculesUrl} request: ${textStatus}`, errorThrown);
            }
            GGO.postLogoutForm();
          },
        }); */
      } else if (options.fonction === 'fin') {
        const patrouillesUrl = `${options.baseRESTServicesURL}/fin_vacation.php?patrouille=${patrouilleId}&immatriculation=${immatriculationId}`;
        $.ajax({
          type: 'GET',
          url: patrouillesUrl,
          success: function (response) {
            console.log(`Revoke Patrouille response: `, response);
            GGO.revokeVehicle(immatriculationId, patrouilleId, {
              baseRESTServicesURL: '/services/rest/mci',
              fonction: 'deconnexion',
            });
            GGO.postLogoutForm();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus === 'abort') {
              console.warn(`${patrouillesUrl} Request aborted`);
            } else {
              console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
            }
            GGO.revokeVehicle(immatriculationId, patrouilleId, {
              baseRESTServicesURL: '/services/rest/mci',
              fonction: 'deconnexion',
            });
            GGO.postLogoutForm();
          },
        });
      }
    } else if (typeof patrouilleId === 'undefined') {
      if (typeof options !== 'undefined') {
        if (options.fonction === 'fin') {
          const patrouillesUrl = `${options.baseRESTServicesURL}/fin_vacation.php?patrouille=${options.userName}&immatriculation=${immatriculationId}`;
          $.ajax({
            type: 'GET',
            url: patrouillesUrl,
            success: function (response) {
              console.log(`Revoke Patrouille response: `, response);
              GGO.revokeVehicle(immatriculationId, patrouilleId, {
                baseRESTServicesURL: '/services/rest/mci',
                fonction: 'deconnexion',
              });
              GGO.postLogoutForm();
            },
            error: function (jqXHR, textStatus, errorThrown) {
              if (textStatus === 'abort') {
                console.warn(`${patrouillesUrl} Request aborted`);
              } else {
                console.error(`Error for ${patrouillesUrl} request: ${textStatus}`, errorThrown);
              }
              GGO.revokeVehicle(immatriculationId, patrouilleId, {
                baseRESTServicesURL: '/services/rest/mci',
                fonction: 'deconnexion',
              });
              GGO.postLogoutForm();
            },
          });
        } else {
          GGO.postLogoutForm();
        }
      } else {
        GGO.postLogoutForm();
      }
    } else if (typeof options.userRole !== 'undefined' && (options.userRole === 'charly' || options.userRole === 'alpha')) {
      console.warn(`Might be usefull to disconnect the user ${options.userName} with role ${options.role} from the system`);
      GGO.postLogoutForm();
    } else {
      GGO.postLogoutForm();
    }
  };

  GGO.postLogoutForm = function () {
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
    NEIGHBORHOOD: 'neighborhood',
    CLEARMISSIONMLOCATION: 'clearmissionlocation',
  };

  GGO.docCookies = {
    getItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) {
        return null;
      }
      return unescape(document.cookie.replace(new RegExp('(?:^|.*;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'), '$1'));
    },
    /**
     * docCookies.setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure)
     *
     * @argument sKey (String): the name of the cookie;
     * @argument sValue (String): the value of the cookie;
     * @optional argument vEnd (Number, String, Date Object or null): the max-age in seconds (e.g., 31536e3 for a year) or the
     *  expires date in GMTString format or in Date Object format; if not specified it will expire at the end of session;
     * @optional argument sPath (String or null): e.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location;
     * @optional argument sDomain (String or null): e.g., "example.com", ".example.com" (includes all subdomains) or "subdomain.example.com"; if not
     * specified, defaults to the host portion of the current document location;
     * @optional argument bSecure (Boolean or null): cookie will be transmitted only over secure protocol as https;
     * @return undefined;
     **/

    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) {
        return;
      }
      var sExpires = '';
      if (vEnd) {
        switch (typeof vEnd) {
          case 'number':
            sExpires = '; max-age=' + vEnd;
            break;
          case 'string':
            sExpires = '; expires=' + vEnd;
            break;
          case 'object':
            if (vEnd.hasOwnProperty('toGMTString')) {
              sExpires = '; expires=' + vEnd.toGMTString();
            }
            break;
        }
      }
      document.cookie = escape(sKey) + '=' + escape(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '') + ';SameSite=Lax';
    },
    removeItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) {
        return;
      }
      var oExpDate = new Date();
      oExpDate.setDate(oExpDate.getDate() - 1);
      document.cookie = escape(sKey) + '=; expires=' + oExpDate.toGMTString() + '; path=/';
    },
    hasItem: function (sKey) {
      return new RegExp('(?:^|;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(document.cookie);
    },
  };
})();
/* end GGO: put code below in galigeo.js */

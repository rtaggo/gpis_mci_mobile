//const GGO = require('../galigeo');

(function () {
  'use strict';
  GGO.ForbiddenChecker = function (options) {
    this.init();
  };

  GGO.ForbiddenChecker.prototype = {
    init: function () {
      this.check_forbidden();
    },
    check_forbidden: function (options) {
      let self = this;
      // faire appel ajax

      let the_url = `/services/rest/mci/cookie_restrictions.php`;
      $.ajax({
        type: 'GET',
        url: the_url,
        //dataType: 'json',
        success: function (response) {
          //console.log(`Restrictions response: `, response);
          if (response.code === 200) {
            // filtrer en fonction de ce qui est dans le cookie
            // voir les etapes du fichier de ce matin
            // on recupere le cookie
            let f_sites_cookies = GGO.docCookies.getItem('gpis_forbidden_sites');
            let sites_set = new Set();

            if (f_sites_cookies) {
              sites_set = new Set(JSON.parse(f_sites_cookies));
            }

            // Liste de site recu
            // Warning: changer id si besoin
            let sites = response.restrictions;
            sites = sites.filter((s) => !sites_set.has(s.id));

            if (sites.length > 0) {
              console.log(`Nouvelles Restrictions response: `, response);
              // update du cookie
              GGO.docCookies.setItem('gpis_forbidden_sites', JSON.stringify([...sites.map((s) => s.id), ...sites_set]), 31536e3, '/', null);
              // afficher la popup
              GGO.AlertRestrictionsPrompt = function (title, container, options) {
                container.append(`
                    <section role="alertdialog" tabindex="0" aria-labelledby="prompt-heading-id" aria-describedby="prompt-message-wrapper" class="slds-modal slds-fade-in-open slds-modal_prompt" aria-modal="true" style="z-index: 10000;">
                      <div class="slds-modal__container">
                        <header class="slds-modal__header slds-theme_error slds-theme_alert-texture">
                          <h2 class="slds-text-heading_medium" id="prompt-heading-id">${title}</h2>
                        </header>
                        <div class="slds-modal__content slds-p-around_medium" id="prompt-message-wrapper">
                        </div>
                        <footer class="slds-modal__footer slds-theme_default">
                          <button class="slds-button slds-button_neutral" data-what="return">Fermer</button>
                        </footer>
                      </div>
                    </section>
                    <div class="slds-backdrop slds-backdrop_open"></div>
                `);
                $('#appContainer footer > button.slds-button').click(function (e) {
                  $('.slds-modal').remove();
                  $('.slds-backdrop').remove();
                });
                let type_lieu_restriction = [
                  {
                    type_cat: 'Site',
                    label: 'Sites',
                    nom: '',
                  },
                  {
                    type_cat: 'Arrondissement',
                    label: 'Arrondissements',
                    nom: '',
                  },
                  {
                    type_cat: 'Sous-Secteur',
                    label: 'Sous-secteurs',
                    nom: '',
                  },
                ];
                sites.forEach((b) => {
                  let cat_restr = type_lieu_restriction.find((m) => m.type_cat === b.type);
                  if (cat_restr) {
                    cat_restr.nom = b.nom;
                  }
                });
                $('#prompt-message-wrapper')
                  .empty()
                  .append(
                    $(`<div id="general">
                      <div id="interdits" style="width:50%; float:left">
                        <ul >
                          <li style="font-size :large" >Interdits<br></li> 
                          ${sites
                            //.filter(m => m.nb > 0) /* Si besoin de filtrage */
                            .map((b) => {
                              if (b.type_restriction_id === 2) {
                                return `<li >${b.nom}</li>`;
                              }
                            })
                            .join('')}
                        </ul>
                      </div>
                      <div id="renforces" style="width:50% ; float:right">
                        <ul>
                          <li style="font-size :large">Renforcés<br></li>
                          ${sites
                            //.filter(m => m.nb > 0) /* Si besoin de filtrage */
                            .map((b) => {
                              if (b.type_restriction_id === 3) {
                                return `<li >${b.nom}</li>`;
                              }
                            })
                            .join('')}
                        </ul>
                      </div>
                    </div>`)
                  );
              };
              GGO.AlertRestrictionsPrompt('Nouvelles restrictions', $('#appContainer'));
            }
          }
          self.await_before_recall();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${the_url} Request aborted`);
          } else {
            console.error(`Error for ${the_url} request: ${textStatus}`, errorThrown);
          }
          self.await_before_recall();
        },
      });
    },
    await_before_recall: function () {
      setTimeout(() => {
        this.check_forbidden();
      }, GGO.CHECK_RESTRICTIONS_INTERVALLE);
    },
  };

  GGO.ForbiddenCheckerSingleton = (function () {
    let instance;
    function createInstance(options) {
      let fChecker = new GGO.ForbiddenChecker(options);
      return fChecker;
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

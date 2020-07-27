//const GGO = require('../galigeo');

(function () {
  'use strict';
  GGO.CrisisChecker = function (options) {
    this.init();
  };

  GGO.CrisisChecker.prototype = {
    init: function () {
      this.check_crisis();
    },
    check_crisis: function (options) {
      let self = this;
      // faire appel ajax

      let the_url = `/services/rest/mci/crise.php`;
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
            let f_sites_crise = GGO.docCookies.getItem('gpis_crisis');
            let sites_crise_set = new Set();

            if (f_sites_crise) {
              sites_crise_set = new Set(JSON.parse(f_sites_crise));
            }

            // Liste de site recu
            // Warning: changer id si besoin
            let sites = response.sites_crise;
            sites = sites.filter((s) => !sites_crise_set.has(s.id));

            if (sites.length > 0) {
              console.log(`Nouvelles Gestions de Crise response: `, response);
              GGO.notifyNewMissionSound(3);
              // update du cookie
              GGO.docCookies.setItem('gpis_crisis', JSON.stringify([...sites.map((s) => s.id), ...sites_crise_set]), 31536e3, '/', null);
              //affichage de la popup
              self.alertCrisesPrompt('Nouvelle Gestion de Crise', $('#appContainer'), sites, options);
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
    alertCrisesPrompt: function (title, container, sites, options) {
      if ($('#popup_crises').length > 0) {
        $('#popup_crises').remove();
        $('.slds-backdrop').remove();
      }

      container.append(`
        <section id="popup_crises" role="alertdialog" tabindex="0" aria-labelledby="prompt-heading-id" aria-describedby="prompt-message-wrapper" class="slds-modal slds-fade-in-open slds-modal_prompt" aria-modal="true" style="z-index: 10000;">
          <div class="slds-modal__container">
            <header class="slds-modal__header slds-theme_error slds-theme_alert-texture">
              <h2 class="slds-text-heading_medium" id="prompt-heading-id">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_small slds-scrollable_y" style="padding-left : 1rem ; padding-right : 1rem" id="prompt-message-wrapper">
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

      //const code_noir = [...new Set(sites.filter((s) => s.type_urgence === 1).map((s) => s.site_libelle))];
      const code_noir = [...new Set(sites.filter((s) => s.type_urgence === 1))];
      //const code_rouge = [...new Set(sites.filter((s) => s.type_urgence === 2).map((s) => s.libelle))];
      const code_rouge = [...new Set(sites.filter((s) => s.type_urgence === 2))];
      $('#prompt-message-wrapper')
        .empty()
        .append(
          $(`<div id="general">
          ${
            code_noir.length > 0
              ? `
              <div id="code_noir" style="width:33%; float:left; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-close" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_xx-small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#close"></use>
                  </svg>
                </span>
                <ul >
                  <li style="font-size :large" >Code noir<br></li> 
                  ${code_noir
                    .map((b) => {
                      return `<li >${b.site_libelle}</li>`;
                    })
                    .join('')}
                </ul>
              </div>`
              : ''
          }
            ${
              code_rouge.length > 0
                ? `
              <div id="code_rouge" style="width:33%; display:inline-block; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-new-group" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_xx-small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#new_group"></use>
                  </svg>
                </span>
                <ul>
                  <li style="font-size :large">Renforcés<br></li>
                  ${code_rouge
                    .map((b) => {
                      return `<li >${b.site_libelle}</li>`;
                    })
                    .join('')}
                </ul>
              </div>`
                : ''
            }`)
        );
    },
    await_before_recall: function () {
      setTimeout(() => {
        this.check_crisis();
      }, GGO.CHECK_CRISES_INTERVALLE);
    },
    /* display_crisis: function () {
      let panelContent = $(`
      <div id="crisisPanel" class="slds-panel slds-panel_docked slds-panel_docked-left slds-is-open" aria-hidden="false" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;z-index:10000; overflow: hidden;">
        <div class="slds-panel__header">
          <h2 class="slds-panel__header-title slds-text-heading_small slds-truncate">Restrictions</h2>
          <button class="slds-button slds-button_icon slds-button_icon-small slds-panel__close" title="Collapse Panel Header">
            <svg class="slds-button__icon" aria-hidden="true">
              <use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
            </svg>
            <span class="slds-assistive-text">Collapse Panel Header</span>
          </button>
        </div>
        <div class="slds-panel__body" style="height:calc(100% - 49px);position:relative;">
          <div id="forbiddens_content" class="slds-scrollable_y" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0px;"></div>
        </div>
      </div>
      `);
      panelContent.find('.slds-panel__header button.slds-panel__close').click(function (e) {
        $('#forbiddensPanel').remove();
      });
      $('#appContainer').append(panelContent);
      // appel ajax pour avoir les restrictions
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
            let sites = response.restrictions;

            if (sites.length > 0) {
              console.log(`Restrictions response: `, response);

              const interdits = [...new Set(sites.filter((s) => s.type_restriction_id === 2).map((s) => s.nom))];
              const renforces = [...new Set(sites.filter((s) => s.type_restriction_id === 3).map((s) => s.nom))];
              const restreints = [...new Set(sites.filter((s) => s.type_restriction_id === 4).map((s) => s.nom))];
              $('#forbiddens_content')
                .empty()
                .append(
                  $(`<div id="general" class="slds-p-around_x-small">
          ${
            interdits.length > 0
              ? `
              <div id="interdits" style="width:33%; float:left ; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-close" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_xx-small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#close"></use>
                  </svg>
                </span>
                <ul >
                  <li style="font-size :large" >Interdits<br></li> 
                  ${interdits
                    .map((b) => {
                      return `<li >${b}</li>`;
                    })
                    .join('')}
                </ul>
              </div>`
              : ''
          }
            ${
              renforces.length > 0
                ? `
              <div id="renforces" style="width:33% ; display:inline-block; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-new-group" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_xx-small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#new_group"></use>
                  </svg>
                </span>
                <ul>
                  <li style="font-size :large">Renforcés<br></li>
                  ${renforces
                    .map((b) => {
                      return `<li >${b}</li>`;
                    })
                    .join('')}
                </ul>
              </div>`
                : ''
            }
            ${
              restreints.length > 0
                ? `
              <div id="renforces" style="width:33% ; float:right ; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-share-link" style="background-color:#fba70e" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_xx-small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#share_link"></use>
                  </svg>
                </span>
                <ul>
                  <li style="font-size :large">Restreints<br></li>
                  ${restreints
                    .map((b) => {
                      return `<li >${b}</li>`;
                    })
                    .join('')}
                </ul>
              </div>
            </div>`
                : ''
            }`)
                );
            }
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (textStatus === 'abort') {
            console.warn(`${the_url} Request aborted`);
          } else {
            console.error(`Error for ${the_url} request: ${textStatus}`, errorThrown);
          }
        },
      });
    },*/

    // s nb sites > 0
    // mettre liste dans forbiddens_content
    // $('#forbiddens_content').empty().append(...)
  };

  GGO.CrisisCheckerSingleton = (function () {
    let instance;
    function createInstance(options) {
      let cChecker = new GGO.CrisisChecker(options);
      return cChecker;
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

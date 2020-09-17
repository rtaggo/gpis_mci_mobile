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
      console.log('check crisis');
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
            let sites = response.crise;
            sites = sites.filter((s) => !sites_crise_set.has(s.id));

            if (sites.length > 0) {
              console.log(`Nouvelles Gestions de Crise response: `, response);
              GGO.notifyNewMissionSound(4);
              // update du cookie
              GGO.docCookies.setItem('gpis_crisis', JSON.stringify([...sites.map((s) => s.id), ...sites_crise_set]), 31536e3, '/', null);
              //affichage de la popup
              self.alertCrisesPrompt('Situation de crise en cours', $('#appContainer'), sites, options);
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
        <section id="popup_crises" role="alertdialog" tabindex="0" aria-labelledby="prompt-heading-id" aria-describedby="prompt-message-wrapper-crisis" class="slds-modal slds-fade-in-open slds-modal_prompt" aria-modal="true" style="z-index: 10000;">
          <div class="slds-modal__container">
            <header class="slds-modal__header slds-theme_error slds-theme_alert-texture">
              <h2 class="slds-text-heading_medium" id="prompt-heading-id">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_small slds-scrollable" style="padding-left : 1rem ; padding-right : 1rem" id="prompt-message-wrapper-crisis">
            </div>
            <footer class="slds-modal__footer slds-theme_default">
              <button class="slds-button slds-button_neutral" data-what="return">Fermer</button>
            </footer>
          </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open" id="backdrop_crisis"></div>
      `);
      $('#appContainer footer > button.slds-button').click(function (e) {
        $('#popup_crises').remove();
        $('#backdrop_crisis').remove();
      });

      //const code_noir = [...new Set(sites.filter((s) => s.type_urgence === 1).map((s) => s.site_libelle))];
      const code_noir = [...new Set(sites.filter((s) => s.type_urgence === 1))];
      const code_noir_bis = code_noir;
      code_noir_bis.forEach(function (v) {
        delete v.id;
      });
      const code_noir_ter = Array.from(new Set(code_noir_bis.map((a) => a.chrono_id))).map((id) => {
        return code_noir_bis.find((a) => a.chrono_id === id);
      });
      console.log(code_noir_ter);
      //const code_rouge = [...new Set(sites.filter((s) => s.type_urgence === 2).map((s) => s.libelle))];
      const code_rouge = [...new Set(sites.filter((s) => s.type_urgence === 2))];
      const code_rouge_bis = code_rouge;
      code_rouge_bis.forEach(function (v) {
        delete v.id;
      });
      const code_rouge_ter = Array.from(new Set(code_rouge_bis.map((a) => a.chrono_id))).map((id) => {
        return code_rouge_bis.find((a) => a.chrono_id === id);
      });
      $('#prompt-message-wrapper-crisis')
        .empty()
        .append(
          $(`<div id="general">
          ${
            code_noir.length > 0
              ? `
              <div id="code_noir" style="float:center; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-fallback" style="background-color:#000000" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#fallback"></use>
                  </svg>
                </span>
                
                  <div style="font-size :large ; font-weight : bold " >Code noir<br></div> 
                  ${code_noir_ter
                    .map((b) => {
                      return `<div style="font-size :medium">${b.secteur_libelle} - ${b.site_libelle} ( ${b.patrouilles_libelle} )</div>`;
                    })
                    .join('')}
                
              </div>`
              : ''
          }
            ${
              code_rouge.length > 0
                ? `
              <div id="code_rouge" style="float:center; text-align:center">
                <span class="slds-icon_container slds-icon_container_circle  slds-icon-action-new" style="background-color:#ff0000" title="Description of icon when needed">
                  <svg class="slds-icon slds-icon_small .slds-icon-text-error" aria-hidden="true">
                    <use xlink:href="/styles/slds/assets/icons/action-sprite/svg/symbols.svg#new"></use>
                  </svg>
                </span>
                
                  <div style="font-size :large ; font-weight : bold  ; color : #ff0000 ">Code Rouge<br></div>
                  ${code_rouge_ter
                    .map((b) => {
                      return `<div style="font-size :medium">${b.secteur_libelle} - ${b.site_libelle} ( ${b.patrouilles_libelle} )</div>`;
                    })
                    .join('')}
                
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
  };

  /* $('.slds-modal').on('shown.bs.slds-modal', function () {
    if ($('.slds-modal').length > 1) {
      $('.slds-backdrop').not(':first').remove();
    }
  });
  $(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function() {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
}); */

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

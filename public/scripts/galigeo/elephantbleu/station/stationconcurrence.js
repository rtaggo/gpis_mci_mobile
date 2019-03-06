(function() {
    'use strict';
    GGO.StationConcurrence = function(data, coordinates) {
      this._data = data;
      this._coordinates = coordinates;
      this._useBlob = false && window.URL; 		
    };
    GGO.StationConcurrence.prototype = {
      getDetails: function(){
        console.warn('GGO.StationConcurrence.getDetails need to be implemented');
      },
      renderHTML: function(){
        var content = $('<div data-stationid="'+this._data.id+'" data-layertype="concurrence"></div>');
        content
          .append($('<div class="station-title_container" data-stationid="'+this._data.id+'" data-layertype="concurrence"></div>')
          .append($('<span class="station-icon"></span>').append($('<img src="/images/pictos/picto_concurrence.png" />')))
          .append($('<span class="station-title" data-stationid="'+this._data.id+'" data-layertype="concurrence"></span>').text('Station ' + this._data.nom))
            .append($('<span class="station-distance"></span>').text(GGO.formatDistance(this._data.distance)))
            .append($('<svg class="slds-icon slds-icon_x-small slds-icon-text-default slds-m-left_small slds-shrink-none" aria-hidden="true" data-stationid="'+this._data.id+'" data-layertype="concurrence"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use></svg>')));
        var hasServices = false;            
        var servicesContent = $('<div class="services-content"></div>');
        var picto_hp_src = './images/pictos/picto_hp.png';
        var picto_portique_src = './images/pictos/picto_portique.png';
        var picto_aspi_src = './images/pictos/picto_aspirateur.png';
        var picto_gonfleur_src = './images/pictos/picto_gonfleur.png';
        var hasHP = false;
        if (this._data.piste_hp !== null && this._data.piste_hp>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>' + this._data.piste_hp + ' Piste(s) Haute pression</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.piste_pl) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>Piste Utiliraire</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.rouleau_lavage !== null && this._data.rouleau_lavage>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_portique_src +'"/>'))
              .append($('<div>' + this._data.rouleau_lavage + ' Rouleau(x) de lavage</div>')));
          hasServices = true;
        }
        if (this._data.gonfleur) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_gonfleur_src +'"/>'))
              .append($('<div>Gonfleur</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.aspirateur !== null && this._data.aspirateur>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_aspi_src +'"/>'))
              .append($('<div>' + this._data.aspirateur + ' Aspirateur(s)</div>')));
          hasServices = true;
        }
        
        if (hasServices) {
          content.append(servicesContent);
        }
        return content;
      },
      buildEditView: function(container) {
        var self = this;
        var editForm = $('<div class="slds-form" role="list"></div>');
        var imgSnapShotDiv = $('<div id="station_snapshot_div" class="station-edition_snapshotdiv"></div>');
        imgSnapShotDiv
          .append($('<svg class="slds-icon slds-icon_large slds-icon-text-default slds-shrink-none" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#photo"></use></svg>'));

        imgSnapShotDiv.click(function(e){
          self._imgInput.trigger('click');
        });
        this._imgInput = $('<input type="file" accept="image/*" style="display:none;">')
          .on('change', function(e){
            console.log('input file changed');
            var files = this.files, errors = "";

            if (!files) {
              errors += "File upload not supported by your browser.";
            }

            if (files && files[0]) {
              for(var i=0; i<files.length; i++) {
                var file = files[i];
                if ( (/\.(png|jpeg|jpg|gif)$/i).test(file.name) ) {
                  self.readImage( file ); 
                } else {
                  errors += file.name +" Unsupported Image extension\n";  
                }
              }
            }
            // Handle errors
            if (errors) {
              alert(errors);
            }
          });

        //imgSnapShotDiv.append(this._imgInput);
        editForm
          .append($('<div class="slds-form__row"></div>')
            .append($('<div class="slds-form__item" role="listitem"></div>')
              .append($('<div class="slds-form-element slds-form-element_stacked slds-is-editing"></div>')
                .append($('<label class="slds-form-element__label" for="stacked-form-element-station-name">Station de lavage</label>'))
                .append($('<div class="slds-form-element__control"></div>')
                  .append($('<input type="text" id="stacked-form-element-station-name" readonly="" required="" class="slds-input" value="' + this.getTitle() + '" />'))
                )
              )
              .append(imgSnapShotDiv)
            )
          );
        
        var addrRow = $('<div class="slds-form__row"></div>')
          .append(this.getEditAddressFieldSet());

        editForm.append(addrRow);

        var hpRow = $('<div class="slds-form__row"></div>')
          .append(this.getEditHPFieldSet());

        editForm.append(hpRow);

        var portiqueRow = $('<div class="slds-form__row"></div>')
          .append(this.getEditPortiqueFieldSet());
        editForm.append(portiqueRow);
        
        var diversRow = $('<div class="slds-form__row"></div>')
          .append(this.getDiversFieldSet());
        editForm.append(diversRow);
        var commentFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="comment_userinput">Commentaire</label>'))
          .append($('<div class="slds-form-element__control"></div>')
            .append($('<textarea id="comment_userinput" class="slds-textarea" placeholder="Commentaire"></textarea>')));
        editForm.append(commentFormElt);
        
        var ancienneteFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="hp_anciennete" style="width:33%;">Ancienneté</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<input type="number" id="hp_anciennete" placeholder="ancienneté" class="slds-input" />')));
        editForm.append(ancienneteFormElt);
       
        var reseauxFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
        .append($('<label class="slds-form-element__label" style="width:33%;vertical-align:top;">Réseaux</label>'))
        .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-eau" value="Eau" />'))
            .append($('<label class="slds-checkbox__label" for="portique_reseaux-eau"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Eau</span>'))
            )
          )
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-gaz" value="Gaz" />'))
            .append($('<label class="slds-checkbox__label" for="portique_reseaux-gaz"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Gaz</span>'))
            )
          )
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-telephone" value="Téléphone" />'))
            .append($('<label class="slds-checkbox__label" for="portique_reseaux-telephone"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Téléphone</span>'))
            )
          )
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-electricite" value="Electricité" />'))
            .append($('<label class="slds-checkbox__label" for="portique_reseaux-electricite"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Electricité</span>'))
            )
          )
        );
        editForm.append(reseauxFormElt);

        container.append(editForm);
      },
      getDiversFieldSet: function() {
        var formItem = $('<div class="slds-form__item" role="listitem"></div');
        var formFieldSet = $('<fieldset class="slds-form-element slds-form-element_compound slds-is-editing slds-form-element_stacked"></fieldset>');
        formFieldSet.append($('<legend class="slds-form-element__legend slds-form-element__label">Services divers</label>'));
        var formEltCtrl = $('<div class="slds-form-element__control"></div>');
        var reseauxFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
        .append($('<label class="slds-form-element__label" style="width:33%;vertical-align:top;"></label>'))
        .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="CartePro" value="Yes" />'))
            .append($('<label class="slds-checkbox__label" for="CartePro"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Carte Pro</span>'))
            )
          )
          .append($('<div class="slds-checkbox"></div>')
            .append($('<input type="checkbox" name="reseaux" id="gonfleur" value="yes" />'))
            .append($('<label class="slds-checkbox__label" for="gonfleur"></label>')
              .append($('<span class="slds-checkbox_faux"></span>'))
              .append($('<span class="slds-form-element__label">Gonfleur</span>'))
            )
          ));
        formEltCtrl.append(reseauxFormElt);
        formFieldSet.append(formEltCtrl);
        formItem.append(formFieldSet);
        return formItem;
      },
      getEditHPFieldSet: function() {
        var formItem = $('<div class="slds-form__item" role="listitem"></div');
        var formFieldSet = $('<fieldset class="slds-form-element slds-form-element_compound slds-is-editing slds-form-element_stacked"></fieldset>');
        formFieldSet.append($('<legend class="slds-form-element__legend slds-form-element__label">Haute Pression</label>'));
        var formEltCtrl = $('<div class="slds-form-element__control"></div>');
        var nbPisteFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="hp_nb_piste" style="width:33%;">Nombre de piste(s)</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<input type="number" id="hp_nb_piste" placeholder="#" class="slds-input" />').val(this._data.piste_hp)));
        var ancienneteFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="hp_anciennete" style="width:33%;">Ancienneté</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<input type="number" id="hp_anciennete" placeholder="ancienneté" class="slds-input" />')));
        
        var reseauxFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" style="width:33%;vertical-align:top;">Réseaux</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="hp_reseaux-eau" value="Eau" />'))
              .append($('<label class="slds-checkbox__label" for="hp_reseaux-eau"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Eau</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="hp_reseaux-gaz" value="Gaz" />'))
              .append($('<label class="slds-checkbox__label" for="hp_reseaux-gaz"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Gaz</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="hp_reseaux-telephone" value="Téléphone" />'))
              .append($('<label class="slds-checkbox__label" for="hp_reseaux-telephone"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Téléphone</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="hp_reseaux-electricite" value="Electricité" />'))
              .append($('<label class="slds-checkbox__label" for="hp_reseaux-electricite"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Electricité</span>'))
              )
            )
          );

        var pistePLFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" style="width:33%;vertical-align:top;">Piste PL</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" id="hp_piste_pl" value="piste_pl" />'))
              .append($('<label class="slds-checkbox__label" for="hp_piste_pl"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label"></span>'))
              )
            )
          );

        var optionsFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="hp_options" style="width:33%;vertical-align:top;">Options</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<textarea id="hp_options" class="slds-textarea" placeholder="Options ..."></textarea>')
            ));

        formEltCtrl.append(nbPisteFormElt)
          //.append(ancienneteFormElt)
          //.append(reseauxFormElt)
          .append(pistePLFormElt);
          //.append(optionsFormElt);
        formFieldSet.append(formEltCtrl);
        formItem.append(formFieldSet);
        return formItem;
      },
      getEditPortiqueFieldSet: function() {
        var formItem = $('<div class="slds-form__item" role="listitem"></div');
        var formFieldSet = $('<fieldset class="slds-form-element slds-form-element_compound slds-is-editing slds-form-element_stacked"></fieldset>');
        formFieldSet.append($('<legend class="slds-form-element__legend slds-form-element__label">Portique</label>'));
        var formEltCtrl = $('<div class="slds-form-element__control"></div>');
        var nbPisteFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="portique_nb_piste" style="width:33%;">Nombre de piste(s)</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<input type="number" id="portique_nb_piste" placeholder="#" class="slds-input" />').val(this._data.rouleau_lavage)));
        var ancienneteFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="portique_anciennete" style="width:33%;">Ancienneté</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<input type="number" id="portique_anciennete" placeholder="ancienneté" class="slds-input" />')));
        
        var reseauxFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" style="width:33%;vertical-align:top;">Réseaux</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-eau" value="Eau" />'))
              .append($('<label class="slds-checkbox__label" for="portique_reseaux-eau"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Eau</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-gaz" value="Gaz" />'))
              .append($('<label class="slds-checkbox__label" for="portique_reseaux-gaz"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Gaz</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-telephone" value="Téléphone" />'))
              .append($('<label class="slds-checkbox__label" for="portique_reseaux-telephone"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Téléphone</span>'))
              )
            )
            .append($('<div class="slds-checkbox"></div>')
              .append($('<input type="checkbox" name="reseaux" id="portique_reseaux-electricite" value="Electricité" />'))
              .append($('<label class="slds-checkbox__label" for="portique_reseaux-electricite"></label>')
                .append($('<span class="slds-checkbox_faux"></span>'))
                .append($('<span class="slds-form-element__label">Electricité</span>'))
              )
            )
          );

        var optionsFormElt = $('<div class="slds-form-element slds-form-element_horizontal slds-is-editing slds-form-element_1-col"></div>')
          .append($('<label class="slds-form-element__label" for="portique_options" style="width:33%;vertical-align:top;">Options</label>'))
          .append($('<div class="slds-form-element__control" style="width:66%;display:inline-block;"></div>')
            .append($('<textarea id="portique_options" class="slds-textarea" placeholder="Options"></textarea>')
            ));
        formEltCtrl.append(nbPisteFormElt);
          //.append(ancienneteFormElt);
          //.append(reseauxFormElt)
          //.append(optionsFormElt);
        formFieldSet.append(formEltCtrl);
        formItem.append(formFieldSet);
        return formItem;
      },
      getEditAddressFieldSet: function() {
        var formItem = $('<div class="slds-form__item" role="listitem"></div');
        var formFieldSet = $('<fieldset class="slds-form-element slds-form-element_compound slds-form-element_address slds-is-required slds-is-editing slds-form-element_stacked"></fieldset>');
        formFieldSet.append($('<legend class="slds-form-element__legend slds-form-element__label">Coordonnées</label>'));
        var formEltCtrl = $('<div class="slds-form-element__control"></div>');
        formEltCtrl
          .append($('<div class="slds-form-element__row"></div>')
            .append($('<div class="slds-size_1-of-1"></div>')
              .append($('<div class="slds-form-element"></div>')
                .append($('<label class="slds-form-element__label" for="addr_input-street">Rue</label>'))
                .append($('<input type="text" id="addr_input-street" required="" class="slds-input" value="'+this._data.adresse+'" />'))
              )
            )
          )
          .append($('<div class="slds-form-element__row"></div>')
            .append($('<div class="slds-size_2-of-6"></div>')
              .append($('<div class="slds-form-element"></div>')
                .append($('<label class="slds-form-element__label" for="addr_input-postalcode">Code Postal</label>'))
                .append($('<div class="slds-form-element__control"></div>')
                  .append($('<input type="text" id="addr_input-postalcode" required="" class="slds-input" value="'+this._data.code_postal+'" />')))
              )
            )
            .append($('<div class="slds-size_4-of-6"></div>')
              .append($('<div class="slds-form-element"></div>')
                .append($('<label class="slds-form-element__label" for="addr_input-city">Ville</label>'))
                .append($('<div class="slds-form-element__control"></div>')
                  .append($('<input type="text" id="addr_input-city" required="" class="slds-input" value="'+this._data.ville+'" />')))
              )
            )
          );
        formFieldSet.append(formEltCtrl);
        formItem.append(formFieldSet);
        return formItem;
      },
      buildDetailsView: function(container){
        var viewForm = $('<div class="slds-form" role="list"></div>');
        var locationRow = $('<div class="slds-form__row"></div>')
          .append($('<div class="slds-form__item" role="listitem"></div>')
            .append($('<div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_stacked slds-hint-parent"></div>')
              .append($('<div class="slds-form-element__label" style="display:inline-block;width:100%">Coordonnées</div>'))
              .append($('<div class="slds-form-element__control" style="width: 48%; display: inline-block;">'+this.getFormattedAddress()+'</div>'))
              .append($('<div class="slds-form-element__control" style="width: 48%; display: inline-block;text-align: right; vertical-align:top;"></div>')
                .append($('<img width="100" src="https://api.mapbox.com/v4/mapbox.streets/url-http%3A%2F%2Felephantbleubygaligeo.herokuapp.com%2Fimages%2Fconcurrence_marker.png('+this._coordinates.join(',')+')/'+this._coordinates.join(',')+',16/200x200.png64?access_token=pk.eyJ1IjoicnRhZ2dvIiwiYSI6ImNqc2s0bXEyZzJoZHczeXRiZDBwY2xramsifQ.XHY28Og6-Jx6KGLYeXKcxg" alt="Elephant bleu">'))
                )
              )
            );
        
        var servicesRow =  $('<div class="slds-form__row"></div>');
        var hasServices = false;            
        var servicesContent = $('<div class="services-content"></div>');
        var picto_hp_src = './images/pictos/picto_hp.png';
        var picto_portique_src = './images/pictos/picto_portique.png';
        var picto_aspi_src = './images/pictos/picto_aspirateur.png';
        var picto_gonfleur_src = './images/pictos/picto_gonfleur.png';
        var hasHP = false;
        if (this._data.piste_hp !== null && this._data.piste_hp>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>' + this._data.piste_hp + ' Piste(s) Haute pression</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.piste_pl) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>Piste Utiliraire</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.rouleau_lavage !== null && this._data.rouleau_lavage>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_portique_src +'"/>'))
              .append($('<div>' + this._data.rouleau_lavage + ' Rouleau(x) de lavage</div>')));
          hasServices = true;
        }
        if (this._data.gonfleur) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_gonfleur_src +'"/>'))
              .append($('<div>Gonfleur</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.aspirateur !== null && this._data.aspirateur>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_aspi_src +'"/>'))
              .append($('<div>' + this._data.aspirateur + ' Aspirateur(s)</div>')));
          hasServices = true;
        }

        if (hasServices) {
          servicesRow.append($('<div class="slds-form__item" role="listitem"></div>')
            .append($('<div class="slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_stacked slds-hint-parent"></div>')
              .append($('<span class="slds-form-element__label">Services proposés</span>'))
              .append($('<div class="slds-form-element__control"></div>').append(servicesContent))));
        }
        viewForm.append(locationRow).append(servicesRow);
        container.append(viewForm);        
      },
      getFormattedAddress: function() {
        return this._data.adresse + '<br />' + this._data.code_postal + ' - ' + this._data.ville;
      },
      getId: function(){
        return this._data.id;
      },
      getTitle: function(){
        return this._data.nom;
      },
      readImage: function (file) {
        var self = this;
        var reader = new FileReader();
        var elPreview = $('#station_snapshot_div').empty();
        reader.addEventListener("load", function () {
          var image  = new Image();
  
          image.addEventListener("load", function () {
            var imageInfo = file.name +' '+ image.width +'×'+ image.height +' '+ file.type +' '+ Math.round(file.size/1024) +'KB';
  
            // Show image and info
            elPreview.append( this );
            //elPreview.prepend($('<p></p>').text(imageInfo).addClass('imageInfo'));
  
            if (self._useBlob) {
              // Free some memory
              window.URL.revokeObjectURL(image.src);
            }
          });
          image.src = self._useBlob ? window.URL.createObjectURL(file) : reader.result;
        });
  
        reader.readAsDataURL(file);  
      },
      getDistance : function(){
        return this._data.distance;
      }
    };
    GGO.StationElephantBleu.prototype = $.extend(true, {}, GGO.Station.prototype, GGO.StationElephantBleu.prototype);
  })();
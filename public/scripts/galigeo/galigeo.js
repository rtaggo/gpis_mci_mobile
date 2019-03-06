/* START GGO: put code below in galigeo.js */
(function () {
    'use strict';
    var GGO = {
        version: 'GGO.0.0.1'
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
    if ((typeof(module) === 'object') && (typeof(module.exports) === 'object')) {
        module.exports = GGO;
        
    /* define GGO as an AMD module */
    } else if ((typeof(define) === 'function') && define.amd) {
        define(GGO);
    }

    /* define GGO as a global GGO variable, saving the original GGO to restore later if needed */
    if (typeof(window) !== 'undefined') {
        expose();
    }

    GGO.getRandomInteger = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };
    GGO.invertColor = function(hexTripletColor) {
        var color = hexTripletColor;
        color = color.substring(1); // remove #
        color = parseInt(color, 16); // convert to integer
        color = 0xFFFFFF ^ color; // invert three bytes
        color = color.toString(16); // convert to hex
        color = ("000000" + color).slice(-6); // pad with leading zeros
        color = "#" + color; // prepend #
        return color;
    };

    GGO.formatDistance = function(distanceKM){
        if (distanceKM<1) {
            return (distanceKM * 1000).toFixed(0) + ' m'; 
        } else {
            return distanceKM.toFixed(2) + ' km';
        }
    };

    GGO.EVENTS = {
        APPISREDAY: 'appisready',
        MAPISREADY: 'mapisready',
        SWITCHBASEMAP: 'switchbasemap',
        ZOOMTOUSERLOCATION: 'zoomtouserlocation',
        USERLOCATIONCHANGED: 'userlocationchanged',
        TOGGLELAYER : 'togglelayer',
        FETCHSTATIONS : 'fetchstations',
        FETCHEDSTATIONS : 'fetchedstations',
        RENDERSTATIONS : 'renderstations',
        STATIONSFILTERED : 'stationsfiltered',			
        CLICKEDSTATION : 'clickedstation',			
        MAPMARKERCLICKED : 'mapmarkerclicked',			
        ZOOMTOSTATION : 'zoomtostation',

    }
})();
/* end GGO: put code below in galigeo.js */
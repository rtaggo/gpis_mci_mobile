'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const router = express.Router();

const maxRadiusFiltering = 30; // max radius in KM when results need to be filtered i.e when sending coordinates

const missions = [
  {
    id : 1,
    code_site : 'SITE_XXX',
    statut: 'En attente',
    address : '19 Boulevard Ornano 75018 Paris',
    coordinates : [2.348840, 48.892740],
  },
  {
    id : 2,
    code_site : 'SITE_YYY',
    statut: 'En attente',
    address : '33-25 Rue Doudeauville, 75018 Paris',
    coordinates : [2.355469, 48.888709],
  },
  {
    id : 3,
    code_site : 'SITE_ZZZ',
    statut: 'En attente',
    address : '7-1 Rue Tristan Tzara, 75018 Paris',
    coordinates : [2.365813, 48.894646],
  }
]

let idxMission = 0;
let currentMission = {
  id : 0,
  code_site : 'SITE_XXX',
  statut: 'En attente',
  address : '19 Boulevard Ornano 75018 Paris',
  coordinates : [2.348840, 48.892740],
}

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
	res.header('Content-Type', 'application/json'); 
	res.json({message: 'GPIS MCI Mobile services are running ...', code:200}); 
});

router.get('/secteur', (req, res, next) => {
  console.log(`/[MCI_REST_API]/secteur' + ${JSON.stringify(req.query)}`);
  let secteurs = JSON.parse(fs.readFileSync('./data/secteurs.geojson'));
  secteurs.features = secteurs.features.filter(f=>f.properties.secteur_id === 0)
  res.header('Content-Type', 'application/json'); 
	res.json(secteurs); 
});


router.get('/mission', (req, res, next) => {
  idxMission++;
  if (idxMission >= missions.length) {
    idxMission=0;
  }
  let mission = missions[idxMission];
  res.header('Content-Type', 'application/json'); 
	res.json(mission); 
});

/*
router.get('/concurrence', (req, res, next) => {
  console.log(`/[ELEPHANTBLEU_REST_API]/concurrence' + ${JSON.stringify(req.query)}`);
  let stations = JSON.parse(fs.readFileSync('./data/concurrence.geojson'));
  let lat = req.query.lat;
	let lng = req.query.lng;
  console.log(`lat: ${lat} , lng: ${lng}`);
  if (lat && lng) {
    console.log(`Coordinates are defined ==> let filtering results. Actually ${stations.features.length} stations.`);
    let coord = [lng,lat];
    let tstations = turf.featureCollection(stations.features.filter(function(station){
        var dist = turf.distance(station, coord, {units: 'kilometers'});
        if (dist <= maxRadiusFiltering) {
          station.properties.distance = dist;
          return true;
        }
    }));
    console.log(`Filtered has ${tstations.features.length} stations`);
    tstations.features.sort(function(a, b){
      return (a.properties.distance - b.properties.distance);
    });
    stations = tstations;
  }
  res.header('Content-Type', 'application/json'); 
	res.json(stations); 
});
*/


/**
 * Errors on "/elephantbleu/*" routes.
 */
router.use((err, req, res, next) => {
	// Format error and forward to generic error handler for logging and
	// responding to the request
	err.response = err.message;
	next(err);
});

module.exports = router;

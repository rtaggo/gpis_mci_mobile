'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const router = express.Router();

const maxRadiusFiltering = 30; // max radius in KM when results need to be filtered i.e when sending coordinates

const fakeUsers = [{ id: 1, username: 'mana', password: 'mana', role: 'india' }, { id: 2, username: 'laura', password: 'laura', role: 'charly' }, { id: 3, username: 'pdx', password: 'pdx', role: 'alpha' }];

const fakePatrouilles = [
  {
    name: 'GOLF 03',
    id: 3
  },
  {
    name: 'GOLF 11',
    id: 11
  },
  {
    name: 'GOLF 14',
    id: 14
  }
];

const fakeSecteurs = ['Nord', 'Sud', 'Est'];

const fakeSousSecteurs = [{ name: 'EST-01', id: 1 }, { name: 'EST-02', id: 2 }, { name: 'EST-03', id: 3 }, { name: 'NORD-01', id: 4 }, { name: 'NORD-02', id: 5 }, { name: 'NORD-03', id: 6 }, { name: 'SUD-01', id: 7 }, { name: 'SUD-02', id: 8 }, { name: 'SUD-03', id: 9 }];

const missions = [
  {
    id: 1,
    code_site: 'SITE_XXX',
    statut: 'En attente',
    address: '19 Boulevard Ornano 75018 Paris',
    coordinates: [2.34884, 48.89274]
  },
  {
    id: 2,
    code_site: 'SITE_YYY',
    statut: 'En attente',
    address: '33-25 Rue Doudeauville, 75018 Paris',
    coordinates: [2.355469, 48.888709]
  },
  {
    id: 3,
    code_site: 'SITE_ZZZ',
    statut: 'En attente',
    address: '7-1 Rue Tristan Tzara, 75018 Paris',
    coordinates: [2.365813, 48.894646]
  }
];

let idxMission = 0;
let currentMission = {
  id: 0,
  code_site: 'SITE_XXX',
  statut: 'En attente',
  address: '19 Boulevard Ornano 75018 Paris',
  coordinates: [2.34884, 48.89274]
};

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.json({ message: 'GPIS MCI Mobile services are running ...', code: 200 });
});

router.post('/connexion.php', (req, res, next) => {
  console.log(`/login ${JSON.stringify(req.body)}`);
  const username = req.body.username;
  const password = req.body.password;
  let filteredUsers = fakeUsers.filter(u => {
    return u.name === username && u.password === password;
  });
  console.log(`Filtered users: ${filteredUsers.length}`);
  if (filteredUsers.length === 0) {
    return res.status(500).json({
      code: 5001,
      message: "Nom d'utilisateur et mot de passe ne correspondent pas"
    });
  }
  req.session.loggedin = true;
  req.session.username = username;

  return res.status(200).json({
    authentification: true,
    role: filteredUsers[0].role
  });
});

router.get('/patrouilles.php', (req, res, next) => {
  console.log(`[MCI API] /patrouilles ${JSON.stringify(fakePatrouilles)}`);
  res.header('Content-Type', 'application/json');
  res.json({ patrouille: fakePatrouilles, code: 200 });
});

router.get('/sous_secteurs.php', (req, res, next) => {
  console.log(`[MCI API] /sous_secteurs.php`);
  res.header('Content-Type', 'application/json');
  res.json({
    'sous-secteurs': fakeSousSecteurs
  });
});

router.get('/secteurs.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/secteurs`);
  res.header('Content-Type', 'application/json');
  res.json({
    secteurs: fakeSecteurs
  });
});

// patrimoine_sous_secteur.php
router.get('/patrimoine_sous_secteur.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/patrimoine_sous_secteur.php ${JSON.stringify(req.query)}`);
  const patrimoine_file = './data/mock/patrimoine.json';
  // old: './data/secteurs.geojson'
  let patrimoine_sssecteurs = JSON.parse(fs.readFileSync(patrimoine_file));
  let patrimoine = patrimoine_sssecteurs['patrimoine'];
  const no_min = 0;
  const no_max = 5;

  patrimoine.features.forEach(f => {
    f.properties.niveau_operationnel = (Math.floor(Math.random() * (no_max - no_min + 1)) + no_min).toFixed(0);
  });
  res.header('Content-Type', 'application/json');
  res.json({
    code: 200,
    'sous-secteur': patrimoine_sssecteurs['sous_secteur'],
    patrimoine: patrimoine
  });
});

/*
router.get('/secteur', (req, res, next) => {
  console.log(`/[MCI_REST_API]/secteur' + ${JSON.stringify(req.query)}`);
  let secteurs = JSON.parse(fs.readFileSync('./data/secteurs.geojson'));
  secteurs.features = secteurs.features.filter(f => f.properties.secteur_id === 0);
  res.header('Content-Type', 'application/json');
  res.json(secteurs);
});
*/

router.get('/mission_sous_secteur.php', (req, res, next) => {
  idxMission++;
  if (idxMission >= missions.length) {
    idxMission = 0;
  }
  let mission = missions[idxMission];
  res.header('Content-Type', 'application/json');
  const mision_file = './data/mock/mission.json';
  let missionGeoJSON = JSON.parse(fs.readFileSync(mision_file));

  res.json(missionGeoJSON);
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

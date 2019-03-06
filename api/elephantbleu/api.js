'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const router = express.Router();

const maxRadiusFiltering = 30; // max radius in KM when results need to be filtered i.e when sending coordinates

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
	res.header('Content-Type', 'application/json'); 
	res.json({message: 'elephantbleu services are running ...', code:200}); 
});

router.get('/stations', (req, res, next) => {
  console.log(`/[ELEPHANTBLEU_REST_API]/stations' + ${JSON.stringify(req.query)}`);
  let stations = JSON.parse(fs.readFileSync('./data/elephantbleu.geojson'));
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

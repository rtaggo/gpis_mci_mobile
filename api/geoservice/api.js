'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

function getGeoservice() {
  return require(`./geoservice-${require('../../config').get('GEOSERVICE')}`);
}

// Automatically parse request body as JSON
router.use(bodyParser.json());


router.get('/', (req, res, next) => {
	let geoserviceAPI = require('../../config').get('GEOSERVICE');
	console.log(`GEOSERVICE: ./geoservice-${geoserviceAPI}`);
	res.header('Content-Type', 'application/json'); 
	res.json({'message': '[GET] /rest/geoservice', 'api': geoserviceAPI}); 
});

router.get('/geocode/search', (req, res) => {
	const request = require("request-promise");
	console.log('/geocode/search' + JSON.stringify(req.query));
	var q = encodeURI(req.query.q);
	/*
	if (q.indexOf('france') < 0) {
		q += ', France';
	}
	*/
	const geoserviceAPI = getGeoservice();
	geoserviceAPI.geocodesearch(q).then(features =>{
		res.header('Content-Type', 'application/json'); 
		res.json(features);
	});
});


router.get('/geocode/reverse', (req, res) => {
	const request = require("request-promise");
	console.log('/geocoder/reverse' + JSON.stringify(req.query));
	var lat = encodeURI(req.query.lat);
	var lng = encodeURI(req.query.lng);

	const geoserviceAPI = getGeoservice();
	geoserviceAPI.geocodereverse(lat, lng).then(features =>{
		res.header('Content-Type', 'application/json'); 
		res.json(features);
	});
});


router.get('/direction/isochrone', (req, res) => {
	console.log('/direction/ischrone' + JSON.stringify(req.query));
	let center = req.query.center;
	let timeLimits = req.query.time_limits.split(',');
	console.log(`center: ${center}`);
	console.log(`time limits: ${timeLimits}`);
	const geoserviceAPI = getGeoservice();
	
	geoserviceAPI.computeIsochrones(center, timeLimits).then(features => {
		res.header('Content-Type', 'application/json'); 
		res.json(features);
	});
});


/**
 * Errors on "/geoservice/*" routes.
 */
router.use((err, req, res, next) => {
	// Format error and forward to generic error handler for logging and
	// responding to the request
	err.response = err.message;
	next(err);
});

module.exports = router;

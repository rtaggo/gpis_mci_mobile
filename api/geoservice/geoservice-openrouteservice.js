'use strict';

const logging = require('../../lib/logging');
const request = require("request-promise");
const turf = require('@turf/turf');

const oprServiceConfig = {
	api_key : '5b3ce3597851110001cf62486ea13cac35484ccdba928d7fd51c518e',
	baseurl: 'https://api.openrouteservice.org'
};

const queryIsochrone = async (url) => {
	let res = await request(url);
	var isoRes = (typeof(res) === 'string'?JSON.parse(res):res);
	return isoRes;
}


const doAsyncCall = async (url) => {
	let res = await request(url);
	var isoRes = (typeof(res) === 'string'?JSON.parse(res):res);
	return isoRes;
}

const _geocodesearch = async(searchText) => {
	logging.info(`geocodesearch for ${searchText}`);
	let searchUrl = `${oprServiceConfig.baseurl}/geocode/search?api_key=${oprServiceConfig.api_key}&text=${searchText}&boundary.country=FR`;
	let searchRes = await doAsyncCall(searchUrl);
	return searchRes;	
}

const _geocodereverse = async(lat, lng) => {
	logging.info(`geocodereverse for lat=${lat} and lng=${lng}`);
	let reverseUrl = `${oprServiceConfig.baseurl}/geocode/reverse?api_key=${oprServiceConfig.api_key}&point.lat=${lat}&point.lon=${lng}&layers=address`;
	let reverseRes = await doAsyncCall(reverseUrl);
	return reverseRes;	
}

const _computeIsochrones = async (center, time_limits) => {
	logging.info(`computeIsochrones for center=${center} and time_limits=${time_limits}`);
	let allgeojson = {
		"type": "FeatureCollection",
		"features": [

		]
	};
	let isochrones = [];
	
	let lnglat = center.split(',').reverse().join(',');
	let ranges = time_limits.map(x=> parseInt(x)*60).join(',');
	let baseUrl = `${oprServiceConfig.baseurl}/isochrones?api_key=${oprServiceConfig.api_key}&profile=driving-car&locations=${lnglat}&range=${ranges}`;
	try {
		let isoRes = await queryIsochrone(baseUrl);
		isoRes.features.forEach((iso,idx) => {
			console.log(`iso ${idx}`);
			delete iso.properties.group_index;
			delete iso.properties.center;

			iso.properties['bucket'] = idx;//iso.properties.value / 60;
			let minutes = iso.properties.value / 60;

			iso.properties.value = minutes;
			iso.properties.label = minutes + ' min';
			isochrones.push(iso);				
		});
	}  catch (ex) { 
		console.error(`    Failed to compute isochrone for time limit ${time_limits[s]} ${ex}`);
	}
	var nbIsochrones = isochrones.length-1;
	for (var i=nbIsochrones;i>0; i--){
		isochrones[i] = turf.difference(isochrones[i], isochrones[i-1]);
	}
	allgeojson.features = isochrones.reverse();
	return allgeojson;
}

module.exports = {
	computeIsochrones: _computeIsochrones,
	geocodesearch: _geocodesearch,
	geocodereverse: _geocodereverse
};

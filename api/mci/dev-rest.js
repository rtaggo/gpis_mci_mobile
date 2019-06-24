'use strict';

const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');

const doAsyncGET = async url => {
  let res = await rp(url);
  var jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
  return jsonRes;
};

const doAsyncPOST = async options => {
  let res = await rp(options);
  var jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
  return jsonRes;
};

const _login = async (username, password) => {
  let loginUrl = `${require('../../config').get('BACKEND_URL')}/connexion.php`;
  let options = {
    method: 'POST',
    uri: loginUrl,
    body: {
      username: username,
      password: password
    },
    json: true // Automatically stringifies the body to JSON
  };
  let loginResponse = await doAsyncPOST(options);
  return loginResponse;
};

const _getPatrouilles = async () => {
  let patrouilleUrl = `${require('../../config').get('BACKEND_URL')}/patrouilles.php`;
  let patrouilles = await doAsyncGET(patrouilleUrl);
  return patrouilles;
};

const _getSousSecteurs = function() {
  return {
    'sous-secteurs': fakeSousSecteurs
  };
};

const _getSecteurs = function() {
  return {
    secteurs: fakeSecteurs
  };
};

const _getPatrimoineSousSecteur = function(patrimoine, soussecteurs) {
  const patrimoine_file = './data/mock/patrimoine.json';
  // old: './data/secteurs.geojson'
  let patrimoine_sssecteurs = JSON.parse(fs.readFileSync(patrimoine_file));
  let patrimoine_geojson = patrimoine_sssecteurs['patrimoine'];
  const no_min = 0;
  const no_max = 5;

  patrimoine_geojson.features.forEach(f => {
    f.properties.niveau_operationnel = (Math.floor(Math.random() * (no_max - no_min + 1)) + no_min).toFixed(0);
  });
  return {
    code: 200,
    'sous-secteur': patrimoine_sssecteurs['sous_secteur'],
    patrimoine: patrimoine_geojson
  };
};

const _getMission = function(patrouilleId) {
  idxMission++;
  if (idxMission >= missions.length) {
    idxMission = 0;
  }
  let mission = missions[idxMission];
  const mision_file = './data/mock/mission.json';
  let missionGeoJSON = JSON.parse(fs.readFileSync(mision_file));

  return missionGeoJSON;
};

module.exports = {
  login: _login,
  getPatrouilles: _getPatrouilles,
  getSousSecteurs: _getSousSecteurs,
  getSecteurs: _getSecteurs,
  getPatrimoineSousSecteur: _getPatrimoineSousSecteur,
  getMission: _getMission
};

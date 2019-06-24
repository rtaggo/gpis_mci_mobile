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
  try {
    let res = await rp(options);
    var jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
    return jsonRes;
  } catch (err) {
    console.log('Error: ', err);
    return { ode: 500 };
  }
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
  console.log('Resp: ' + loginResponse);
  return loginResponse;
};

const _getPatrouilles = async () => {
  let patrouilleUrl = `${require('../../config').get('BACKEND_URL')}/patrouilles.php`;
  let patrouilles = await doAsyncGET(patrouilleUrl);
  return patrouilles;
};

const _getSousSecteurs = async () => {
  let sousSecteurseUrl = `${require('../../config').get('BACKEND_URL')}/sous_secteurs.php`;
  let sssecteurs = await doAsyncGET(sousSecteurseUrl);
  return sssecteurs;
};

const _getSecteurs = async () => {
  let secteurseUrl = `${require('../../config').get('BACKEND_URL')}/secteurs.php`;
  let secteurs = await doAsyncGET(secteurseUrl);
  return secteurs;
};

const _getPatrimoineSousSecteur = async (patrouilleId, soussecteurs) => {
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/patrimoine_sous_secteur.php?patrouille=${patrouilleId}&sssecteurs=${soussecteurs}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

const _getMission = async patrouilleId => {
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/mission_sous_secteur.php?patrouille=${patrouilleId}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

module.exports = {
  login: _login,
  getPatrouilles: _getPatrouilles,
  getSousSecteurs: _getSousSecteurs,
  getSecteurs: _getSecteurs,
  getPatrimoineSousSecteur: _getPatrimoineSousSecteur,
  getMission: _getMission
};

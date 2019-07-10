'use strict';

const express = require('express');
const request = require('request');
const rp = require('request-promise');
const bodyParser = require('body-parser');

const doAsyncGET = async url => {
  let res = null;
  try {
    res = await rp(url);
    //console.log(res);
    let jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
    return jsonRes;
  } catch (err) {
    console.log('Error: ', err);
    console.log(' resquest response: ', res);
    return { code: 500 };
  }
};

const doAsyncPOST = async options => {
  try {
    let res = await rp(options);
    console.log(res);
    var jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
    jsonRes.code = 200;
    return jsonRes;
  } catch (err) {
    console.log('Error: ', err);
    return { code: 500 };
  }
};

const doAsyncPostREQUEST = async (url, data) => {
  console.log(`doAsyncPostREQUEST: ${JSON.stringify(data)}`);
  request.post(
    url,
    {
      json: data
    },
    (error, res, body) => {
      console.log(body);
      if (error) {
        console.error(error);
        return { code: 500 };
      }
      return body;
    }
  );
};

const _login = async (loginInput, passwordInput) => {
  let loginUrl = `${require('../../config').get('BACKEND_URL')}/connexion.php`;

  let options = {
    method: 'POST',
    uri: loginUrl,
    body: {
      login: loginInput,
      password: passwordInput
    },
    json: true // Automatically stringifies the body to JSON
  };
  let loginResponse = await doAsyncPOST(options);
  //let loginResponse = await doAsyncPostREQUEST(loginUrl, { login: usernameInput, password: passwordInput });
  console.log('Resp: ' + loginResponse);
  return loginResponse;
};

const _getPatrouilles = async () => {
  console.log(`[dev-rest] _getPatrouilles`);
  let patrouilleUrl = `${require('../../config').get('BACKEND_URL')}/patrouilles.php`;
  let patrouilles = await doAsyncGET(patrouilleUrl);
  return patrouilles;
};

const _libererPatrouille = async patrouilleId => {
  console.log(`[dev-rest] _libererPatrouille patrouilleId=${patrouilleId}`);
  let revokePatrouilleUrl = `${require('../../config').get('BACKEND_URL')}/liberer_patrouille.php?patrouille=${patrouilleId}`;
  let resp = await doAsyncGET(revokePatrouilleUrl);
  return resp;
};

const _getSousSecteurs = async patrouilleId => {
  console.log(`[dev-rest] _getSousSecteurs patrouilleId=${patrouilleId}`);
  let sousSecteurseUrl = `${require('../../config').get('BACKEND_URL')}/sous_secteurs.php?patrouille=${patrouilleId}`;
  let sssecteurs = await doAsyncGET(sousSecteurseUrl);
  if (sssecteurs.code !== 200) {
    if (!sssecteurs.message) {
      sssecteurs.message = 'Erreur lors de la récupération des sous-secteurs';
    }
  }
  return sssecteurs;
};

const _getSecteurs = async () => {
  console.log(`[dev-rest] _getSecteurs`);
  let secteurseUrl = `${require('../../config').get('BACKEND_URL')}/secteurs.php`;
  let secteurs = await doAsyncGET(secteurseUrl);
  return secteurs;
};

const _getPatrimoineSecteur = async secteurs => {
  console.log(`[dev-rest] _getPatrimoineSecteur secteurs=${secteurs}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/patrimoine_secteur.php?secteurs=${secteurs}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

const _getPatrimoineSousSecteur = async (patrouilleId, soussecteurs) => {
  console.log(`[dev-rest] _getPatrimoineSousSecteur patrouilleId=${patrouilleId} sous-secteurs=${soussecteurs}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/patrimoine_sous_secteur.php?patrouille=${patrouilleId}&sssecteurs=${soussecteurs}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

const _getMission = async patrouilleId => {
  console.log(`[dev-rest] _getMission patrouilleId=${patrouilleId}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/mission_sous_secteur.php?patrouille=${patrouilleId}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

// getMissionSecteurs
const _getMissionSecteurs = async secteurIds => {
  console.log(`[dev-rest] _getMissionSecteurs secteurIds=${secteurIds}`);
  let missionSecteursUrl = `${require('../../config').get('BACKEND_URL')}/mission_secteur.php?secteurs=${secteurIds}`;
  let missionSecteursResponse = await doAsyncGET(missionSecteursUrl);
  return missionSecteursResponse;
};

// getMissionDetails
const _getMissionDetails = async missionId => {
  console.log(`[dev-rest] _getMissionDetails missionId=${missionId}`);
  let missionDetailsUrl = `${require('../../config').get('BACKEND_URL')}/selection_mission.php?mission=${missionId}`;
  let missionDetailsResponse = await doAsyncGET(missionDetailsUrl);
  return missionDetailsResponse;
};

// joinMission
const _joinMission = async reqQuery => {
  console.log(`[dev-rest] _joinMission request query=${JSON.stringify(reqQuery)}`);
  let joinMissionUrl = `${require('../../config').get('BACKEND_URL')}/rejoindre.php?mission=${reqQuery.mission}&chef_groupe=${reqQuery.chef_groupe}`;
  let joinMissionResponse = await doAsyncGET(joinMissionUrl);
  return joinMissionResponse;
};

/*
const _getNeighborhood = async (patrouilleId, sssecteurs) => {
  console.log(`[dev-rest] _getNeighborhood`);
  let neighborhoodUrl = `${require('../../config').get('BACKEND_URL')}/voisinage.php?patrouille=${patrouilleId}&sssecteurs=${sssecteurs}`;
  let neighborhoodResponse = await doAsyncGET(neighborhoodUrl);
  return neighborhoodResponse;
};
*/
const _getNeighborhood = async reqQuery => {
  console.log(`[dev-rest] _getNeighborhood`);
  //let neighborhoodUrl = `${require('../../config').get('BACKEND_URL')}/voisinage.php?patrouille=${patrouilleId}&sssecteurs=${sssecteurs}`;
  const requestParams = Object.keys(reqQuery)
    .map(k => `${k}=${reqQuery[k]}`)
    .join('&');
  console.log(`Request parameters: ${requestParams}`);
  let neighborhoodUrl = `${require('../../config').get('BACKEND_URL')}/voisinage.php?${requestParams}`;
  let neighborhoodResponse = await doAsyncGET(neighborhoodUrl);
  return neighborhoodResponse;
};

const _getSignalement = async (mission_id, type_signalement, categorie) => {
  console.log(`[dev-rest] _getSignalement`);
  let signalementUrl = `${require('../../config').get('BACKEND_URL')}/signalement.php?mission_id=${mission_id}&type_signalement=${type_signalement}&categorie=${categorie}`;
  let signalementResponse = await doAsyncGET(signalementUrl);
  return signalementResponse;
};

const _getSignalementPost = async formSignalement => {
  console.log(`[dev-rest] _getSignalementPost`);
  let signalementUrlPost = `${require('../../config').get('BACKEND_URL')}/signalement.php`;

  let options = {
    method: 'POST',
    uri: signalementUrlPost,
    body: formSignalement.body,
    json: true // Automatically stringifies the body to JSON
  };

  let signalementResponse = await doAsyncPOST(options);
  console.log('Resp: ' + signalementResponse);
  return signalementResponse;
};

const _getReaffectationSignalement = async signalement_id => {
  console.log(`[dev-rest] _getReaffectationSignalement`);
  let reaffectationUrl = `${require('../../config').get('BACKEND_URL')}/reaffectation.php?signalement_id=${signalement_id}`;
  let reaffectationResponse = await doAsyncGET(reaffectationUrl);
  return reaffectationResponse;
};

const _getReaffectationPost = async formreaffectation => {
  console.log(`[dev-rest] _getReaffectationPost`);
  let reaffectationUrlPost = `${require('../../config').get('BACKEND_URL')}/reaffectation.php`;

  let options = {
    method: 'POST',
    uri: reaffectationUrlPost,
    body: formreaffectation.body,
    json: true // Automatically stringifies the body to JSON
  };

  let reaffectationResponse = await doAsyncPOST(options);
  console.log('Resp: ' + reaffectationResponse);

  return reaffectationResponse;
};

const _postMaJMission = async missionStatus => {
  console.log(`[dev-rest] _postMaJMission`);
  let majMissionUrlPost = `${require('../../config').get('BACKEND_URL')}/maj_mission.php`;

  let options = {
    method: 'POST',
    uri: majMissionUrlPost,
    body: missionStatus.body,
    json: true // Automatically stringifies the body to JSON
  };

  let majMissionnResponse = await doAsyncPOST(options);
  console.log('Resp: ' + majMissionnResponse);

  return majMissionnResponse;
};

const _getStatutMission = async (patrouilleId, missionId) => {
  console.log(`[dev-rest] _getStatutMission missionid=${missionId}, patrouilleId=${patrouilleId}`);
  let statutMissionUrl = `${require('../../config').get('BACKEND_URL')}/statut_mission.php?patrouille=${patrouilleId}&mission=${missionId}`;
  let statutMissionResponse = await doAsyncGET(statutMissionUrl);
  return statutMissionResponse;
};

/* list to exports */
module.exports = {
  login: _login,
  getPatrouilles: _getPatrouilles,
  libererPatrouille: _libererPatrouille,
  getSousSecteurs: _getSousSecteurs,
  getSecteurs: _getSecteurs,
  getPatrimoineSousSecteur: _getPatrimoineSousSecteur,
  getMission: _getMission,
  getNeighborhood: _getNeighborhood,
  getSignalement: _getSignalement,
  getSignalementPost: _getSignalementPost,
  getReaffectationSignalement: _getReaffectationSignalement,
  getReaffectationPost: _getReaffectationPost,
  postMaJMission: _postMaJMission,
  getStatutMission: _getStatutMission,
  getPatrimoineSecteur: _getPatrimoineSecteur,
  getMissionSecteurs: _getMissionSecteurs,
  getMissionDetails: _getMissionDetails,
  joinMission: _joinMission
};

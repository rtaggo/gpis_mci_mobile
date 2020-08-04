'use strict';

const express = require('express');
const request = require('request');
const rp = require('request-promise');
const bodyParser = require('body-parser');

const doAsyncGET = async (url) => {
  let res = null;
  try {
    res = await rp(url);
    //console.log(res);
    let jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
    return jsonRes;
  } catch (err) {
    console.error('Error: ', err);
    console.error(' resquest response: ', res);
    return { code: 500 };
  }
};

const doAsyncPOST = async (options) => {
  try {
    let res = await rp(options);
    //console.log(res);
    var jsonRes = typeof res === 'string' ? JSON.parse(res) : res;
    jsonRes.code = 200;
    return jsonRes;
  } catch (err) {
    console.error('Error: ', err);
    return { code: 500 };
  }
};

const doAsyncPostREQUEST = async (url, data) => {
  //console.log(`doAsyncPostREQUEST: ${JSON.stringify(data)}`);
  request.post(
    url,
    {
      json: data,
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
      password: passwordInput,
    },
    json: true, // Automatically stringifies the body to JSON
  };
  let loginResponse = await doAsyncPOST(options);
  //let loginResponse = await doAsyncPostREQUEST(loginUrl, { login: usernameInput, password: passwordInput });
  console.log('Resp: ' + loginResponse);
  return loginResponse;
};

const _newPassword = async (loginInput, passwordInput) => {
  let newPasswordUrl = `${require('../../config').get('BACKEND_URL')}/save_password.php`;

  let options = {
    method: 'POST',
    uri: newPasswordUrl,
    body: {
      login: loginInput,
      password: passwordInput,
    },
    json: true, // Automatically stringifies the body to JSON
  };
  let newPasswordResponse = await doAsyncPOST(options);
  //console.log('Resp: ' + newPasswordResponse);
  return newPasswordResponse;
};

const _getPatrouilles = async () => {
  //console.log(`[dev-rest] _getPatrouilles`);
  let patrouilleUrl = `${require('../../config').get('BACKEND_URL')}/patrouilles.php`;
  let patrouilles = await doAsyncGET(patrouilleUrl);
  return patrouilles;
};

const _libererPatrouille = async (patrouilleId) => {
  //console.log(`[dev-rest] _libererPatrouille patrouilleId=${patrouilleId}`);
  let revokePatrouilleUrl = `${require('../../config').get('BACKEND_URL')}/liberer_patrouille.php?patrouille=${patrouilleId}`;
  let resp = await doAsyncGET(revokePatrouilleUrl);
  return resp;
};

const _finVacation = async (patrouilleId) => {
  //console.log(`[dev-rest] _finVacation patrouilleId=${patrouilleId}`);
  let finVacationUrl = `${require('../../config').get('BACKEND_URL')}/fin_vacation.php?patrouille=${patrouilleId}`;
  let resp = await doAsyncGET(finVacationUrl);
  return resp;
};

const _getSousSecteurs = async (patrouilleId) => {
  //console.log(`[dev-rest] _getSousSecteurs patrouilleId=${patrouilleId}`);
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
  //console.log(`[dev-rest] _getSecteurs`);
  let secteurseUrl = `${require('../../config').get('BACKEND_URL')}/secteurs.php`;
  let secteurs = await doAsyncGET(secteurseUrl);
  return secteurs;
};

const _getChefsGroupe = async (chefGroupeConnected) => {
  //console.log(`[dev-rest] _getChefsGroupe`);
  let chefsGroupeUrl = `${require('../../config').get('BACKEND_URL')}/chefs_groupe.php?chef_connected=${chefGroupeConnected}`;
  let chefsGroupe = await doAsyncGET(chefsGroupeUrl);
  return chefsGroupe;
};

const _getPatrimoineSecteur = async (secteurs) => {
  //console.log(`[dev-rest] _getPatrimoineSecteur secteurs=${secteurs}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/patrimoine_secteur.php?secteurs=${secteurs}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

const _getPatrimoineSousSecteur = async (patrouilleId, soussecteurs) => {
  //console.log(`[dev-rest] _getPatrimoineSousSecteur patrouilleId=${patrouilleId} sous-secteurs=${soussecteurs}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/patrimoine_sous_secteur.php?patrouille=${patrouilleId}&sssecteurs=${soussecteurs}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

const _getVerification = async (missionId, soussecteurs) => {
  //console.log(`[dev-rest] _getVerification missionId=${missionId} sous-secteurs=${soussecteurs}`);
  let verificationUrl = `${require('../../config').get('BACKEND_URL')}/verification.php?mission=${missionId}&sssecteurs=${soussecteurs}`;
  let verificationResponse = await doAsyncGET(verificationUrl);
  return verificationResponse;
};

const _getMission = async (patrouilleId) => {
  //console.log(`[dev-rest] _getMission patrouilleId=${patrouilleId}`);
  let patrimoineUrl = `${require('../../config').get('BACKEND_URL')}/mission_sous_secteur.php?patrouille=${patrouilleId}`;
  let patrimoineResponse = await doAsyncGET(patrimoineUrl);
  return patrimoineResponse;
};

// getMissionSecteurs
/*
const _getMissionSecteurs = async (secteurIds, chefGroupeId) => {
  console.log(`[dev-rest] _getMissionSecteurs secteurIds=${secteurIds}`);
  let missionSecteursUrl = `${require('../../config').get('BACKEND_URL')}/mission_secteur.php?secteurs=${secteurIds}&id_chef_groupe=${chefGroupeId}`;
  let missionSecteursResponse = await doAsyncGET(missionSecteursUrl);
  return missionSecteursResponse;
};
*/
const _getMissionSecteurs = async (reqQuery) => {
  //console.log(`[dev-rest] _getMissionSecteurs`);
  const requestParams = Object.keys(reqQuery)
    .map((k) => `${k}=${reqQuery[k]}`)
    .join('&');
  //console.log(`Request parameters: ${requestParams}`);
  let missionSecteursUrl = `${require('../../config').get('BACKEND_URL')}/mission_secteur.php?${requestParams}`;
  let missionSecteursResponse = await doAsyncGET(missionSecteursUrl);
  return missionSecteursResponse;
};

// getMissionDetails
const _getMissionDetails = async (missionId) => {
  //console.log(`[dev-rest] _getMissionDetails missionId=${missionId}`);
  let missionDetailsUrl = `${require('../../config').get('BACKEND_URL')}/selection_mission.php?mission=${missionId}`;
  let missionDetailsResponse = await doAsyncGET(missionDetailsUrl);
  return missionDetailsResponse;
};

// joinMission
const _joinMission = async (reqQuery) => {
  //console.log(`[dev-rest] _joinMission request query=${JSON.stringify(reqQuery)}`);
  let joinMissionUrl = `${require('../../config').get('BACKEND_URL')}/rejoindre.php?mission=${reqQuery.mission}&chef_groupe=${reqQuery.chef_groupe}&chefs_groupe=${reqQuery.chefs_groupe}`;
  let joinMissionResponse = await doAsyncGET(joinMissionUrl);
  return joinMissionResponse;
};

// positionMission
const _positionMission = async (reqQuery) => {
  //console.log(`[dev-rest] _positionMission request query=${JSON.stringify(reqQuery)}`);
  let positionMissionUrl = `${require('../../config').get('BACKEND_URL')}/position.php?mission=${reqQuery.mission}&chef_groupe=${reqQuery.chef_groupe}&chefs_groupe=${reqQuery.chefs_groupe}`;
  let positionMissionResponse = await doAsyncGET(positionMissionUrl);
  return positionMissionResponse;
};

const _getNeighborhood = async (reqQuery) => {
  console.log(`[dev-rest] _getNeighborhood`);
  //let neighborhoodUrl = `${require('../../config').get('BACKEND_URL')}/voisinage.php?patrouille=${patrouilleId}&sssecteurs=${sssecteurs}`;
  const requestParams = Object.keys(reqQuery)
    .map((k) => `${k}=${reqQuery[k]}`)
    .join('&');
  //console.log(`Request parameters: ${requestParams}`);
  let neighborhoodUrl = `${require('../../config').get('BACKEND_URL')}/voisinage.php?${requestParams}`;
  let neighborhoodResponse = await doAsyncGET(neighborhoodUrl);
  return neighborhoodResponse;
};

const _getSignalement = async (mission_id, type_signalement, categorie, patrouille_id) => {
  //console.log(`[dev-rest] _getSignalement`);
  let signalementUrl = `${require('../../config').get('BACKEND_URL')}/signalement.php?patrouille_id=${patrouille_id}&mission_id=${mission_id}&type_signalement=${type_signalement}&categorie=${categorie}`;
  let signalementResponse = await doAsyncGET(signalementUrl);
  return signalementResponse;
};

const _getPause = async (id_patrouille) => {
  //console.log(`[dev-rest] _getPause`);
  let pauseUrl = `${require('../../config').get('BACKEND_URL')}/pause.php?id_patrouille=${id_patrouille}`;
  let pauseResponse = await doAsyncGET(pauseUrl);
  return pauseResponse;
};

const _getSignalementPost = async (formSignalement) => {
  //console.log(`[dev-rest] _getSignalementPost`);
  let signalementUrlPost = `${require('../../config').get('BACKEND_URL')}/signalement.php`;

  let options = {
    method: 'POST',
    uri: signalementUrlPost,
    body: formSignalement.body,
    json: true, // Automatically stringifies the body to JSON
  };

  let signalementResponse = await doAsyncPOST(options);
  console.log('Resp: ' + signalementResponse);
  return signalementResponse;
};

const _getPausePost = async (formPause) => {
  //console.log(`[dev-rest] _getPausePost`);
  let pauseUrlPost = `${require('../../config').get('BACKEND_URL')}/pause.php`;

  let options = {
    method: 'POST',
    uri: pauseUrlPost,
    body: formPause.body,
    json: true, // Automatically stringifies the body to JSON
  };

  let pauseResponse = await doAsyncPOST(options);
  //console.log('Resp: ' + pauseResponse);
  return pauseResponse;
};

const _activiteMapPost = async (formActiviteMap) => {
  //console.log(`[dev-rest] _activitePost`);
  let activiteMapUrlPost = `${require('../../config').get('BACKEND_URL')}/activite_map.php`;

  let options = {
    method: 'POST',
    uri: activiteMapUrlPost,
    body: formActiviteMap.body,
    json: true, // Automatically stringifies the body to JSON
  };

  let activiteMapResponse = await doAsyncPOST(options);
  //console.log('Resp: ' + activiteMapResponse);
  return activiteMapResponse;
};

const _getReaffectationSignalement = async (signalement_id, patrouille_id) => {
  //console.log(`[dev-rest] _getReaffectationSignalement`);
  let reaffectationUrl = `${require('../../config').get('BACKEND_URL')}/reaffectation.php?patrouille_id=${patrouille_id}&signalement_id=${signalement_id}`;
  let reaffectationResponse = await doAsyncGET(reaffectationUrl);
  return reaffectationResponse;
};

const _getIncidente = async (incidente_id, patrouille_id) => {
  //console.log(`[dev-rest] _getIncidente`);
  let incidenteUrl = `${require('../../config').get('BACKEND_URL')}/incidente.php?patrouille_id=${patrouille_id}&incidente_id=${incidente_id}`;
  let incidenteResponse = await doAsyncGET(incidenteUrl);
  return incidenteResponse;
};

const _getReaffectationPost = async (formreaffectation) => {
  //console.log(`[dev-rest] _getReaffectationPost`);
  let reaffectationUrlPost = `${require('../../config').get('BACKEND_URL')}/reaffectation.php`;

  let options = {
    method: 'POST',
    uri: reaffectationUrlPost,
    body: formreaffectation.body,
    json: true, // Automatically stringifies the body to JSON
  };

  let reaffectationResponse = await doAsyncPOST(options);
  //console.log('Resp: ' + reaffectationResponse);

  return reaffectationResponse;
};

const _postMaJMission = async (missionStatus) => {
  //console.log(`[dev-rest] _postMaJMission`);
  let majMissionUrlPost = `${require('../../config').get('BACKEND_URL')}/maj_mission.php`;

  let options = {
    method: 'POST',
    uri: majMissionUrlPost,
    body: missionStatus.body,
    json: true, // Automatically stringifies the body to JSON
  };

  let majMissionnResponse = await doAsyncPOST(options);
  //console.log('Resp: ' + majMissionnResponse);

  return majMissionnResponse;
};

const _getStatutMission = async (patrouilleId, missionId) => {
  //console.log(`[dev-rest] _getStatutMission missionid=${missionId}, patrouilleId=${patrouilleId}`);
  let statutMissionUrl = `${require('../../config').get('BACKEND_URL')}/statut_mission.php?patrouille=${patrouilleId}&mission=${missionId}`;
  let statutMissionResponse = await doAsyncGET(statutMissionUrl);
  return statutMissionResponse;
};

const _getRenfortsMission = async (patrouilleId, missionId) => {
  //console.log(`[dev-rest] _getRenfortsMission missionid=${missionId}, patrouilleId=${patrouilleId}`);
  let renfortsMissionUrl = `${require('../../config').get('BACKEND_URL')}/renforts.php?patrouille=${patrouilleId}&mission=${missionId}`;
  let renfortsMissionResponse = await doAsyncGET(renfortsMissionUrl);
  return renfortsMissionResponse;
};

const _getStatutMissionEnCours = async (missionId) => {
  //console.log(`[dev-rest] _getStatutMissionEnCours missionid=${missionId}`);
  let statutMissionEnCoursUrl = `${require('../../config').get('BACKEND_URL')}/mission_en_cours.php?mission=${missionId}`;
  let statutMissionEnCoursResponse = await doAsyncGET(statutMissionEnCoursUrl);
  return statutMissionEnCoursResponse;
};

const _getActivite = async (patrouille_id) => {
  //console.log(`[dev-rest] _getActivite patrouilleId=${patrouille_id}`);
  let activiteUrl = `${require('../../config').get('BACKEND_URL')}/activite.php?patrouille_id=${patrouille_id}`;
  let activiteResponse = await doAsyncGET(activiteUrl);
  return activiteResponse;
};

const _getSummaryVacation = async (patrouille_id, chef_groupe, chefs_groupe) => {
  //console.log(`[dev-rest] _getActivite patrouilleId=${patrouille_id}`);
  let params = [];
  if (patrouille_id) {
    params.push(`patrouille_id=${patrouille_id}`);
  }
  if (chef_groupe) {
    params.push(`chef_groupe=${chef_groupe}`);
  }
  if (chefs_groupe) {
    params.push(`chefs_groupe=${chefs_groupe}`);
  }
  let vacationUrl = `${require('../../config').get('BACKEND_URL')}/bilan_vacation.php?${params.join('&')}`;
  let vacationResponse = await doAsyncGET(vacationUrl);
  return vacationResponse;
};

const _getRestrictionsForCookie = async () => {
  //console.log(`[dev-rest] _getRestrictionsForCookie `);
  let cookieUrl = `${require('../../config').get('BACKEND_URL')}/cookie_restrictions.php`;
  let cookieResponse = await doAsyncGET(cookieUrl);
  return cookieResponse;
};

const _getCrise = async () => {
  //console.log(`[dev-rest] _getRestrictionsForCookie `);
  let criseUrl = `${require('../../config').get('BACKEND_URL')}/crise.php`;
  let criseResponse = await doAsyncGET(criseUrl);
  return criseResponse;
};

const _getImmatriculations = async () => {
  //console.log(`[dev-rest] _getImmatriculations`);
  let immatriculationUrl = `${require('../../config').get('BACKEND_URL')}/immatriculations.php`;
  let immatriculations = await doAsyncGET(immatriculationUrl);
  return immatriculations;
};

/* list to exports */
module.exports = {
  login: _login,
  newPassword: _newPassword,
  getPatrouilles: _getPatrouilles,
  libererPatrouille: _libererPatrouille,
  finVacation: _finVacation,
  getSousSecteurs: _getSousSecteurs,
  getSecteurs: _getSecteurs,
  getChefsGroupe: _getChefsGroupe,
  getPatrimoineSousSecteur: _getPatrimoineSousSecteur,
  getMission: _getMission,
  getVerification: _getVerification,
  getNeighborhood: _getNeighborhood,
  getSignalement: _getSignalement,
  getPause: _getPause,
  getSignalementPost: _getSignalementPost,
  getPausePost: _getPausePost,
  activiteMapPost: _activiteMapPost,
  getReaffectationSignalement: _getReaffectationSignalement,
  getIncidente: _getIncidente,
  getReaffectationPost: _getReaffectationPost,
  postMaJMission: _postMaJMission,
  getStatutMission: _getStatutMission,
  getRenfortsMission: _getRenfortsMission,
  getStatutMissionEnCours: _getStatutMissionEnCours,
  getPatrimoineSecteur: _getPatrimoineSecteur,
  getMissionSecteurs: _getMissionSecteurs,
  getMissionDetails: _getMissionDetails,
  getActivite: _getActivite,
  getSummaryVacation: _getSummaryVacation,
  getRestrictionsForCookie: _getRestrictionsForCookie,
  getCrise: _getCrise,
  getImmatriculations: _getImmatriculations,
  joinMission: _joinMission,
  positionMission: _positionMission,
};

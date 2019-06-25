'use strict';

/**
 * Mock MCI module for dev
 */
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

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
/*
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
*/

const missionsFilesMocked = ['mission_signalement_incidente_renfort.json', 'mission_signalement_incidente.json', 'mission_no_renfort.json'];
let idxMission = 0;

const _login = async (loginInput, passwordInput) => {
  console.log(`[DEV_MOCKED] >> login. '${loginInput}'  '${passwordInput}'`);
  let filteredUsers = fakeUsers.filter(u => {
    return u.username === loginInput && u.password === passwordInput;
  });
  console.log(`Filtered users: ${filteredUsers.length}`);
  if (filteredUsers.length === 0) {
    return {
      code: 5001,
      message: "Nom d'utilisateur et mot de passe ne correspondent pas"
    };
  }
  return {
    code: 200,
    authentification: true,
    role: filteredUsers[0].role
  };
};

const _getPatrouilles = async () => {
  return { patrouilles: fakePatrouilles, code: 200 };
};

const _libererPatrouille = async patrouilleId => {
  return { code: 200 };
};

const _getSousSecteurs = async patrouilleId => {
  return {
    code: 200,
    'sous-secteurs': fakeSousSecteurs
  };
};

const _getSecteurs = async () => {
  return {
    secteurs: fakeSecteurs
  };
};

const _getPatrimoineSousSecteur = async (patrouilleId, soussecteurs) => {
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

const _getMission = async patrouilleId => {
  /*
  idxMission++;
  if (idxMission >= missions.length) {
    idxMission = 0;
  }
  let mission = missions[idxMission];
  */
  //const mission_file = './data/mock/mission.json';
  //idxMission = 1;
  const mission_file = `./data/mock/${missionsFilesMocked[idxMission]}`;
  console.log(`Loading mocked mission file ${mission_file}`);
  idxMission = ++idxMission % missionsFilesMocked.length;
  let missionGeoJSON = JSON.parse(fs.readFileSync(mission_file));

  return missionGeoJSON;
};

const _getNeighborhood = async (patrouilleId, sssecteurs) => {
  console.log(`[dev-mocked] _getNeighborhood`);
  const voisinage_file = './data/mock/voisinage.json';
  let voisinage = JSON.parse(fs.readFileSync(voisinage_file));
  return voisinage;
};

module.exports = {
  login: _login,
  getPatrouilles: _getPatrouilles,
  libererPatrouille: _libererPatrouille,
  getSousSecteurs: _getSousSecteurs,
  getSecteurs: _getSecteurs,
  getPatrimoineSousSecteur: _getPatrimoineSousSecteur,
  getMission: _getMission,
  getNeighborhood: _getNeighborhood
};

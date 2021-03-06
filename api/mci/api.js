'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const getMCIModule = function () {
  return require(`./${require('../../config').get('MCI_MODE')}`);
};

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.json({ message: 'GPIS MCI Mobile services are running ...', code: 200 });
});

router.post('/connexion.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /login ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.login(req.body.login, req.body.password).then((loginResponse) => {
    if (loginResponse.code !== 200) {
      console.error(`Login error with code ${loginResponse.code}: ${JSON.stringify(loginResponse)}`);
      res.status(500).json(loginResponse);
    } else {
      req.session.loggedin = true;
      req.session.username = req.body.username;
      res.status(200).json(loginResponse);
    }
  });
});

router.post('/save_password.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /newPassword ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.newPassword(req.body.login, req.body.password).then((newPasswordResponse) => {
    if (newPasswordResponse.code !== 200) {
      console.error(`Save Password error with code ${newPasswordResponse.code}: ${JSON.stringify(newPasswordResponse)}`);
      res.status(500).json(newPasswordResponse);
    } else {
      req.session.loggedin = true;
      req.session.username = req.body.username;
      res.status(200).json(newPasswordResponse);
    }
  });
});

router.post('/signalement.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /signalement`);
  const mcimodule = getMCIModule();
  mcimodule.getSignalementPost(req).then((resp) => {
    //console.log(resp)
    if (resp.code !== 200) {
      console.error(`Get Signalement error with code ${resp.code}: ${JSON.stringify(resp)}`);
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.post('/pause.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /pause`);
  const mcimodule = getMCIModule();
  mcimodule.getPausePost(req).then((resp) => {
    //console.log(resp);
    if (resp.code !== 200) {
      console.error(`Pause error with code ${resp.code}: ${JSON.stringify(resp)}`);
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.post('/activite_map.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /activite_map ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.activiteMapPost(req).then((resp) => {
    //console.log(resp);
    if (resp.code !== 200) {
      console.error(`Activite Map error with code ${resp.code}: ${JSON.stringify(resp)}`);
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.post('/reaffectation.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /reaffectation ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.getReaffectationPost(req).then((resp) => {
    //console.log(resp)
    if (resp.code !== 200) {
      console.error(`Reaffectation error with code ${resp.code}: ${JSON.stringify(resp)}`);
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.get('/patrouilles.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /patrouilles.php`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrouilles().then((patrouilles) => {
    res.header('Content-Type', 'application/json');
    res.json(patrouilles);
  });
});

router.get('/liberer_patrouille.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.libererPatrouille(req.query.patrouille, req.query.immatriculation).then((resp) => {
    res.header('Content-Type', 'application/json');
    res.json(resp);
  });
});

router.get('/fin_vacation.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /fin_vacation.php`);
  const mcimodule = getMCIModule();
  mcimodule.finVacation(req.query.patrouille, req.query.immatriculation).then((resp) => {
    res.header('Content-Type', 'application/json');
    res.json(resp);
  });
});

router.get('/sous_secteurs.php', (req, res, next) => {
  //console.log(`[MCI API][GET] /sous_secteurs.php`);
  const mcimodule = getMCIModule();
  mcimodule.getSousSecteurs(req.query.patrouille).then((sssecteurs) => {
    res.header('Content-Type', 'application/json');
    res.json(sssecteurs);
  });
});

router.get('/secteurs.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /secteurs`);
  const mcimodule = getMCIModule();
  mcimodule.getSecteurs().then((secteurs) => {
    res.header('Content-Type', 'application/json');
    res.json(secteurs);
  });
});

router.get('/chefs_groupe.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /chefs_groupe ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getChefsGroupe(req.query.chef_connected).then((chefs_groupe) => {
    res.header('Content-Type', 'application/json');
    res.json(chefs_groupe);
  });
});

router.get('/patrimoine_secteur.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /patrimoine_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrimoineSecteur(req.query.secteurs).then((patrimoineResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(patrimoineResponse);
  });
});

router.get('/mission_secteur.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /mission_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMissionSecteurs(req.query).then((missionResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

// selection_mission.php
router.get('/selection_mission.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /selection_mission.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMissionDetails(req.query.mission).then((missionResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

// rejoindre.php
router.get('/rejoindre.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /rejoindre.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.joinMission(req.query).then((response) => {
    res.header('Content-Type', 'application/json');
    res.json(response);
  });
});

// position.php
router.get('/position.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /position.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.positionMission(req.query).then((response) => {
    res.header('Content-Type', 'application/json');
    res.json(response);
  });
});

router.get('/patrimoine_sous_secteur.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /patrimoine_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrimoineSousSecteur(req.query.patrouille, req.query.sssecteurs).then((patrimoineResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(patrimoineResponse);
  });
});

router.get('/mission_sous_secteur.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /mission_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMission(req.query.patrouille).then((missionResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

router.get('/verification.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /verification.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getVerification(req.query.mission, req.query.sssecteurs).then((verificationResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(verificationResponse);
  });
});

router.get('/voisinage.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /voisinage.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getNeighborhood(req.query).then((voisinageResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(voisinageResponse);
  });
});

router.get('/signalement.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /signalement.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getSignalement(req.query.mission_id, req.query.type_signalement, req.query.categorie, req.query.patrouille_id).then((signalementResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(signalementResponse);
  });
});

router.get('/pause.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /pause.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPause(req.query.id_patrouille).then((pauseResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(pauseResponse);
  });
});

router.post('/maj_mission.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][POST] /maj_mission ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.postMaJMission(req).then((resp) => {
    //console.log(resp)
    if (resp.code !== 200) {
      console.error(`MaJ Mission error with code ${resp.code}: ${JSON.stringify(resp)}`);
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.get('/statut_mission.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /statut_mission.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getStatutMission(req.query.patrouille, req.query.mission).then((signalementResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(signalementResponse);
  });
});

router.get('/renforts.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /renforts.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getRenfortsMission(req.query.patrouille, req.query.mission).then((renfortsResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(renfortsResponse);
  });
});

router.get('/mission_en_cours.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /mission_en_cours.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getStatutMissionEnCours(req.query.mission).then((statutMissionEnCoursResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(statutMissionEnCoursResponse);
  });
});

router.get('/reaffectation.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /reaffectation.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getReaffectationSignalement(req.query.signalement_id, req.query.patrouille_id).then((reaffectationResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(reaffectationResponse);
  });
});

router.get('/incidente.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /incidente.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getIncidente(req.query.incidente_id, req.query.patrouille_id).then((incidenteResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(incidenteResponse);
  });
});

router.get('/activite.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /activite.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getActivite(req.query.patrouille_id).then((activiteResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(activiteResponse);
  });
});

router.get('/bilan_vacation.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /activite.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getSummaryVacation(req.query.patrouille_id, req.query.chef_groupe, req.query.chefs_groupe).then((vacationResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(vacationResponse);
  });
});

router.get('/cookie_restrictions.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /activite.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getRestrictionsForCookie().then((cookieResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(cookieResponse);
  });
});

router.get('/crise.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /activite.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getCrise().then((criseResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(criseResponse);
  });
});

router.get('/immatriculations.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /immatriculations.php`);
  const mcimodule = getMCIModule();
  mcimodule.getImmatriculations().then((immatriculations) => {
    res.header('Content-Type', 'application/json');
    res.json(immatriculations);
  });
});

router.get('/liste_cdg.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /immatriculations.php`);
  const mcimodule = getMCIModule();
  mcimodule.getCDG().then((cdg) => {
    res.header('Content-Type', 'application/json');
    res.json(cdg);
  });
});

router.get('/affecter_vehicule.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.affecterVehicule(req.query.immatriculation, req.query.patrouille).then((assignVehicleResponse) => {
    res.header('Content-Type', 'application/json');
    if (assignVehicleResponse.code !== 200) {
      console.error(`MaJ Mission error with code ${assignVehicleResponse.code}: ${JSON.stringify(assignVehicleResponse)}`);
      res.status(500).json(assignVehicleResponse);
    } else {
      res.status(200).json(assignVehicleResponse);
    }
  });
});

router.get('/liberer_vehicule.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.libererVehicule(req.query.immatriculation, req.query.patrouille).then((revokeVehicleResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(revokeVehicleResponse);
  });
});

router.get('/immat_patrouilles.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.getImmatPatCouple().then((assocImmatVehicleResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(assocImmatVehicleResponse);
  });
});

router.get('/verif_vehicule.php', (req, res, next) => {
  //console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.verifierVehicule(req.query.immatriculation).then((verifyVehicleResponse) => {
    res.header('Content-Type', 'application/json');
    res.json(verifyVehicleResponse);
  });
});

/**
 * Errors on "/mci/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;

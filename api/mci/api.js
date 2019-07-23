'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const getMCIModule = function() {
  return require(`./${require('../../config').get('MCI_MODE')}`);
};

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.json({ message: 'GPIS MCI Mobile services are running ...', code: 200 });
});

router.post('/connexion.php', (req, res, next) => {
  console.log(`[MCI_REST_API][POST] /login ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.login(req.body.login, req.body.password).then(loginResponse => {
    if (loginResponse.code !== 200) {
      res.status(500).json(loginResponse);
    } else {
      req.session.loggedin = true;
      req.session.username = req.body.username;
      res.status(200).json(loginResponse);
    }
  });
});

router.post('/signalement.php', (req, res, next) => {
  console.log(`[MCI_REST_API][POST] /signalement`);
  const mcimodule = getMCIModule();
  mcimodule.getSignalementPost(req).then(resp => {
    //console.log(resp)
    if (resp.code !== 200) {
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.post('/reaffectation.php', (req, res, next) => {
  console.log(`[MCI_REST_API][POST] /reaffectation ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.getReaffectationPost(req).then(resp => {
    //console.log(resp)
    if (resp.code !== 200) {
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.get('/patrouilles.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /patrouilles.php`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrouilles().then(patrouilles => {
    res.header('Content-Type', 'application/json');
    res.json(patrouilles);
  });
});

router.get('/liberer_patrouille.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.libererPatrouille(req.query.patrouille).then(resp => {
    res.header('Content-Type', 'application/json');
    res.json(resp);
  });
});

router.get('/sous_secteurs.php', (req, res, next) => {
  console.log(`[MCI API][GET] /sous_secteurs.php`);
  const mcimodule = getMCIModule();
  mcimodule.getSousSecteurs(req.query.patrouille).then(sssecteurs => {
    res.header('Content-Type', 'application/json');
    res.json(sssecteurs);
  });
});

router.get('/secteurs.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /secteurs`);
  const mcimodule = getMCIModule();
  mcimodule.getSecteurs().then(secteurs => {
    res.header('Content-Type', 'application/json');
    res.json(secteurs);
  });
});

router.get('/chefs_groupe.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /chefs_groupe ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getChefsGroupe(req.query.chef_connected).then(chefs_groupe => {
    res.header('Content-Type', 'application/json');
    res.json(chefs_groupe);
  });
});

router.get('/patrimoine_secteur.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /patrimoine_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrimoineSecteur(req.query.secteurs).then(patrimoineResponse => {
    res.header('Content-Type', 'application/json');
    res.json(patrimoineResponse);
  });
});

router.get('/mission_secteur.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /mission_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  /*
  mcimodule.getMissionSecteurs(req.query.secteurs, req.query.id_chef_groupe).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
  */
  mcimodule.getMissionSecteurs(req.query).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

// selection_mission.php
router.get('/selection_mission.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /selection_mission.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMissionDetails(req.query.mission).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

// rejoindre.php
router.get('/rejoindre.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /rejoindre.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.joinMission(req.query).then(response => {
    res.header('Content-Type', 'application/json');
    res.json(response);
  });
});

router.get('/patrimoine_sous_secteur.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /patrimoine_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrimoineSousSecteur(req.query.patrouille, req.query.sssecteurs).then(patrimoineResponse => {
    res.header('Content-Type', 'application/json');
    res.json(patrimoineResponse);
  });
});

router.get('/mission_sous_secteur.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /mission_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMission(req.query.patrouille).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

router.get('/voisinage.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /voisinage.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  /*
  mcimodule.getNeighborhood(req.query.patrouille, req.query.sssecteurs).then(voisinageResponse => {
    res.header('Content-Type', 'application/json');
    res.json(voisinageResponse);
  });
  */
  mcimodule.getNeighborhood(req.query).then(voisinageResponse => {
    res.header('Content-Type', 'application/json');
    res.json(voisinageResponse);
  });
});

router.get('/signalement.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /signalement.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getSignalement(req.query.mission_id, req.query.type_signalement, req.query.categorie).then(signalementResponse => {
    res.header('Content-Type', 'application/json');
    res.json(signalementResponse);
  });
});

router.post('/maj_mission.php', (req, res, next) => {
  console.log(`[MCI_REST_API][POST] /maj_mission ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  mcimodule.postMaJMission(req).then(resp => {
    //console.log(resp)
    if (resp.code !== 200) {
      res.status(500).json(resp);
    } else {
      res.status(200).json(resp);
    }
  });
});

router.get('/statut_mission.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /statut_mission.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getStatutMission(req.query.patrouille, req.query.mission).then(signalementResponse => {
    res.header('Content-Type', 'application/json');
    res.json(signalementResponse);
  });
});

router.get('/reaffectation.php', (req, res, next) => {
  console.log(`[MCI_REST_API][GET] /reaffectation.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getReaffectationSignalement(req.query.signalement_id).then(reaffectationResponse => {
    res.header('Content-Type', 'application/json');
    res.json(reaffectationResponse);
  });
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

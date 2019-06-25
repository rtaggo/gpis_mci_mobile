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
  console.log(`[POST] /login ${JSON.stringify(req.body)}`);
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

router.get('/patrouilles.php', (req, res, next) => {
  console.log(`[MCI API] /patrouilles.php`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrouilles().then(patrouilles => {
    res.header('Content-Type', 'application/json');
    res.json(patrouilles);
  });
});

router.get('/liberer_patrouille.php', (req, res, next) => {
  console.log(`[MCI API] /liberer_patrouille.php`);
  const mcimodule = getMCIModule();
  mcimodule.libererPatrouille(req.query.patrouille).then(resp => {
    res.header('Content-Type', 'application/json');
    res.json(resp);
  });
});

router.get('/sous_secteurs.php', (req, res, next) => {
  console.log(`[MCI API] /sous_secteurs.php`);
  const mcimodule = getMCIModule();
  mcimodule.getSousSecteurs(req.query.patrouille).then(sssecteurs => {
    res.header('Content-Type', 'application/json');
    res.json(sssecteurs);
  });
});

router.get('/secteurs.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/secteurs`);
  const mcimodule = getMCIModule();
  mcimodule.getSecteurs().then(secteurs => {
    res.header('Content-Type', 'application/json');
    res.json(secteurs);
  });
});

router.get('/patrimoine_sous_secteur.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/patrimoine_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getPatrimoineSousSecteur(req.query.patrouille, req.query.sssecteurs).then(patrimoineResponse => {
    res.header('Content-Type', 'application/json');
    res.json(patrimoineResponse);
  });
});

router.get('/mission_sous_secteur.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/mission_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getMission(req.query.patrouille).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
  });
});

router.get('/voisinage.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/voisinage.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  mcimodule.getNeighborhood(req.query.patrouille, req.query.sssecteurs).then(missionResponse => {
    res.header('Content-Type', 'application/json');
    res.json(missionResponse);
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

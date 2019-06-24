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
  console.log(`/login ${JSON.stringify(req.body)}`);
  const mcimodule = getMCIModule();
  const loginResponse = mcimodule.login(req.body.username, req.body.password);
  console.log(`RESPONSE: ${JSON.stringify(loginResponse)}`);
  if (loginResponse.code !== 200) {
    return res.status(500).json(loginResponse);
  }
  req.session.loggedin = true;
  req.session.username = req.body.username;
  return res.status(200).json(loginResponse);

  /*
  const username = req.body.username;
  const password = req.body.password;
  let filteredUsers = fakeUsers.filter(u => {
    return u.name === username && u.password === password;
  });
  console.log(`Filtered users: ${filteredUsers.length}`);
  if (filteredUsers.length === 0) {
    return res.status(500).json({
      code: 5001,
      message: "Nom d'utilisateur et mot de passe ne correspondent pas"
    });
  }
  req.session.loggedin = true;
  req.session.username = username;

  return res.status(200).json({
    authentification: true,
    role: filteredUsers[0].role
  });
  */
});

router.get('/patrouilles.php', (req, res, next) => {
  console.log(`[MCI API] /patrouilles.php`);
  const mcimodule = getMCIModule();
  const patrouilles = mcimodule.getPatrouilles();
  res.header('Content-Type', 'application/json');
  res.json(patrouilles);
});

router.get('/sous_secteurs.php', (req, res, next) => {
  console.log(`[MCI API] /sous_secteurs.php`);
  const mcimodule = getMCIModule();
  const sssecteurs = mcimodule.getSousSecteurs();
  res.header('Content-Type', 'application/json');
  res.json(sssecteurs);
});

router.get('/secteurs.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/secteurs`);
  const mcimodule = getMCIModule();
  const secteurs = mcimodule.getSecteurs();
  res.header('Content-Type', 'application/json');
  res.json(secteurs);
});

router.get('/patrimoine_sous_secteur.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/patrimoine_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  const patrimoineResponse = mcimodule.getPatrimoineSousSecteur(req.query.patrouille, req.query.sssecteurs);
  res.header('Content-Type', 'application/json');
  res.json(patrimoineResponse);
});

router.get('/mission_sous_secteur.php', (req, res, next) => {
  console.log(`/[MCI_REST_API]/mission_sous_secteur.php ${JSON.stringify(req.query)}`);
  const mcimodule = getMCIModule();
  const missionResponse = mcimodule.getMission(req.query.patrouille);
  res.header('Content-Type', 'application/json');
  res.json(missionResponse);
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

'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const router = express.Router();

const maxRadiusFiltering = 30; // max radius in KM when results need to be filtered i.e when sending coordinates

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.json({ message: 'User Module services are running ...', code: 200 });
});

router.get('/info', (req, res, next) => {
  //console.log(`/user/info' + ${JSON.stringify(req.query)}`);
  let userInfo = {
    user: req.session.username
  };
  res.header('Content-Type', 'application/json');
  res.json(userInfo);
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

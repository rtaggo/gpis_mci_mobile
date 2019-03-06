'use strict';

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');


const config = require('./config');

const PORT = process.env.PORT || 5000

const app = express();

app.disable('etag');

app.use(bodyParser.urlencoded({ extended: true }));
// [END enable_parser]

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/mobile.html'));
});


// WAKEME UP SERVICES
app.use('/services/wakeup', (req, res) =>{
  res.json({message : 'alive', code:200}); 
});

// ELEPHANTBLEU SERVICES
app.use('/services/rest/elephantbleu', require('./api/elephantbleu/api'));

// GEOSERVICE
app.use('/services/rest/geoservice', require('./api/geoservice/api'));


// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res) => {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

app
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));
/*
app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/


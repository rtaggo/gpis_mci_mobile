'use strict';

const express = require('express');
var session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const config = require('./config');

const PORT = process.env.PORT || 5000;

const app = express();

const fakeUsers = [{ id: 1, username: 'mana', password: 'mana', role: 'india' }, { id: 2, username: 'laura', password: 'laura', role: 'charly' }, { id: 3, username: 'pdx', password: 'pdx', role: 'alpha' }];

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.disable('etag');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// [END enable_parser]

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.session.loggedin && req.session.soussecteur) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '/views/login.html'));
  }
});

app.get('/map.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

/*
app.post('/login', (req, res, next) => {
  console.log(`/login ${JSON.stringify(req.body)}`);
  var username = req.body.username;
  var password = req.body.password;
  req.session.loggedin = true;
  req.session.username = username;
  res.redirect('/');
  res.end();
});
*/

app.post('/login', (req, res, next) => {
  console.log(`/login ${JSON.stringify(req.body)}`);
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
});

app.get('/logout', (req, res, next) => {
  console.log(`/logout`);
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        console.log(`Error while destroying session ${err}`);
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

/*
app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/mobile.html'));
});
*/
// WAKEME UP SERVICES
app.use('/services/wakeup', (req, res) => {
  res.json({ message: 'alive', code: 200 });
});

// GPIS MCI SERVICES
app.use('/services/rest/user', require('./api/user/api'));

// GPIS MCI SERVICES
app.use('/services/rest/mci', require('./api/mci/api'));

// ELEPHANTBLEU SERVICES
// app.use('/services/rest/elephantbleu', require('./api/elephantbleu/api'));

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

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
/*
app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/

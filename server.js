const DEFAULT_PORT = 9000;
const DEFAULT_SECRET = '321LEGO';
const DEFAULT_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // day
const COOKIE_KEY = 'user-auth';
const HEADER_KEY = 'auth-token'; // Following the FIRST LEGO League System module standard v1.0

var express = require('express'),
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var templates = require('template-file');
var jwt = require('jsonwebtoken');
var Users = require('./users');
var config = require('config');

var port = config.has('port') ? config.get('port') : DEFAULT_PORT;
var secret = config.has('secret') ? config.get('secret') : DEFAULT_SECRET;
var tokenExpiration = config.has('tokenExpiration') ? config.get('tokenExpiration') : DEFAULT_TOKEN_EXPIRATION;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, 'client')));

app.use((req, res, next) => {
  req.callbackUrl = req.query['callbackUrl'] || req.params['callbackUrl'] || req.body['callbackUrl'];

  res.redirectToCallbackUrl = function(token) {
    res.redirect(`${req.callbackUrl}?token=${token}`);
  };

  res.renderLoginPage = function(options) {
    var templateParams = Object.assign(Object.assign({}, config), options);
    templates.renderTemplateFile(path.resolve(__dirname,'login.html'), templateParams)
      .then(content => res.send(content));
  };

  if(req.callbackUrl) {
    next();
  } else {
    res.renderLoginPage({ 'error': config.get('language.login.errors.noCallbackUrl') });
  }

});

app.post('/login', function(req, res) {
  Users.get(req.body['username'])
    .catch(err => {
      var error = err || config.get('language.login.errors.userNotFound');
      res.renderLoginPage({ 'error': error, 'callbackUrl': req.callbackUrl });
    })
    .then(user => Users.authenticate(user, req.body['password']))
    .catch(err => {
      var error = err || config.get('language.login.errors.passwordIncorrect');
      res.renderLoginPage({ 'error': error, 'callbackUrl': req.callbackUrl });
    })
    .then(user => {
      delete user.password;
      var token = jwt.sign(user, secret);
      res.cookie(COOKIE_KEY, token, { maxAge: tokenExpiration });
      res.redirectToCallbackUrl(token);
    });
});

app.get('/login', function(req, res) {
  var existingAuthToken = req.get(HEADER_KEY) || req.cookies[COOKIE_KEY];
  if(existingAuthToken) {
    try {
      jwt.verify(existingAuthToken, secret);
      res.redirectToCallbackUrl(existingAuthToken);
      return;
    } catch(err) {
      console.log(`Someone tried bypassing the system with a wrongly encoded web token: ${existingAuthToken}`)
    }
  } else {
    res.renderLoginPage({ 'callbackUrl': req.callbackUrl });
  }
  
});

app.listen(port, function() {
  console.log(`Identity Provider listening on port ${port}`);
});

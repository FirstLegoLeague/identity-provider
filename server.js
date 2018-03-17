const DEFAULT_PORT = 9000;
const DEFAULT_SECRET = '321LEGO';

var express = require('express'),
	app = express(),
	path = require('path'),
	templates = require('template-file')
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	sha256 = require('sha256'),
	Users = require('./users'),
	config = require('config');

var port = config.has('port') ? config.get('port') : DEFAULT_PORT;
var secret = config.has('secret') ? config.get('secret') : DEFAULT_SECRET;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, 'default_client')));

app.use((req, res, next) => {
	req.callback_url = req.query['callback_url'] || req.params['callback_url'] || req.body['callback_url'];

	res.redirectToIssuer = function(token) {
		res.redirect(`${req.callback_url}?token=${token}`);
	};

	res.renderLoginPage = function(options) {
		var templateParams = Object.assign({}, config);
		templateParams = Object.assign(templateParams, options);
		
		templates.renderTemplateFile(__dirname + '/login.html', templateParams)
			.then(content => res.send(content));
	};

	if(!req.callback_url) {
		res.renderLoginPage({ 'error': config.get('language.login.errors.noIssuer') });
	} else {
		next();
	}

});

app.post('/login', function(req, res) {
	Users.get(req.body['username']).then(user => {

		if(!user) {
			res.renderLoginPage({ 'error': config.get('language.login.errors.userNotFound'), 'callback_url': req.callback_url });
			return;
		}

		if(sha256(req.body['password']) !== user.password) {
			console.log(`authentication failed for user: ${req.body['username']}`)
			res.renderLoginPage({ 'error': config.get('language.login.errors.passwordIncorrect'), 'callback_url': req.callback_url });
			return;
		}

		delete user.password;
		var token = jwt.sign(user, secret);
		res.cookie('user-auth', token, { maxAge: 24 * 60 * 60 * 1000 /* day */ });
		res.redirectToIssuer(token);
		
	});
});

app.get('/login', function(req, res) {
	if(req.cookies['user-auth']) {
		try {
			jwt.verify(req.cookies['user-auth'], secret);
			res.redirectToIssuer(req.cookies['user-auth']);
			return;
		} catch(e) {
			console.log(`Someone tried bypassing the system with a wrongly encoded web token: ${req.cookies['user-auth']}`)
		}
	}
	
	res.renderLoginPage({ 'callback_url': req.callback_url });
});

app.listen(port, function() {
	console.log(`Identity Provider listening on port ${port}`);
});

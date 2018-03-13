var express = require('express'),
	app = express(),
	path = require('path'),
	templates = require('template-file')
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	sha256 = require('sha256'),
	Users = require('./users'),
	config = require('config')
	serverConfig = config.get('server'),
	clientConfig = config.get('client');


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, 'default_client')));

app.use((req, res, next) => {
	req.issuer = req.query['issuer'] || req.params['issuer'] || req.body['issuer'];

	res.redirectToIssuer = function(token) {
		res.redirect(`${req.issuer}?token=${token}`);
	}

	res.renderLoginPage = function(options) {
		options = Object.assign(options, clientConfig);
		templates.renderTemplateFile(__dirname + '/login.html', options)
			.then(content => res.send(content));
	}

	if(!req.issuer) {
		res.renderLoginPage({ 'error': config.get('errors.noIssuer') });
	} else {
		next();
	}

});

app.post('/login', function(req, res) {
	Users.get(req.body['username']).then(user => {

		if(!user) {
			res.renderLoginPage({ 'error': config.get('errors.userNotFound') });
			return;
		}

		if(sha256(req.body['password']) !== user.password) {
			console.log(`authentication successful for user: ${req.body['username']}`)
			res.renderLoginPage({ 'error': config.get('errors.passwordIncorrect'), 'issuer': req.issuer });
			return;
		}

		console.log(`authentication successful for user: ${req.body['username']}`)
		delete user.password;
		let token = jwt.sign(user, serverConfig.secret);
		res.cookie('user-auth', token, { maxAge: 24 * 60 * 60 * 1000 /* day */ });
		res.redirectToIssuer(token);
		
	});
});

app.get('/login', function(req, res) {
	if(req.cookies['user-auth']) {
		try {
			decoded = jwt.verify(req.cookies['user-auth'], serverConfig.secret);
			res.redirectToIssuer(req.cookies['user-auth']);
			return;
		} catch(e) {
			console.log(`Someone tried bypassing the system with a wrongly encoded web token: ${req.cookies['user-auth']}`)
		}
	}
	
	res.renderLoginPage({ 'issuer': req.issuer });
});

app.listen(, function() {
	console.log(`Identity Provider listening on port ${PORT}`);
});

var express = require('express'),
	app = express(),
	templates = require('template-file')
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	sha256 = require('sha256'),
	Users = require('./users');

const PORT = 9000;
const SECRET = '321LEGO';

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
	req.issuer = req.query['issuer'] || req.params['issuer'] || req.body['issuer'];

	res.redirectToIssuer = function(token) {
		res.redirect(`${req.issuer}?token=${token}`);
	}

	res.renderLoginPage = function(options) {
		templates.renderTemplateFile(__dirname + '/login.html', options)
			.then(content => res.send(content));
	}

	if(!req.issuer) {
		res.renderLoginPage({ 'issuer': req.issuer });	
	} else {
		next();
	}

});

app.post('/login', function(req, res) {
	user = Users.get(req.body['username']);

	if(!user) {
		res.renderLoginPage({ 'error': 'user not found.' });
		return;
	}

	if(sha256(req.body['password']) !== user.password) {
		console.log(`authentication successful for user: ${req.body['username']}`)
		res.renderLoginPage({ 'error': 'Incorrect password.', 'issuer': req.issuer });
		return;
	}

	console.log(`authentication successful for user: ${req.body['username']}`)
	delete user.password;
	let token = jwt.sign(user, SECRET);
	res.cookie('user-auth', token, { maxAge: 24 * 60 * 60 * 1000 /* day */ });
	res.redirectToIssuer(token);
});

app.get('/login', function(req, res) {
	if(req.cookies['user-auth']) {
		try {
			decoded = jwt.verify(req.cookies['user-auth'], SECRET);
			res.redirectToIssuer(req.cookies['user-auth']);
			return;
		} catch {
			console.log(`Someone tried bypassing the system with a wrongly encoded web token: ${req.cookies['user-auth']}`)
		}
	}
	
	res.renderLoginPage({ 'issuer': req.issuer });
});


app.listen(PORT, function() {
	console.log(`Identity Provider listening on port ${PORT}`);
});

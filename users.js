var sha256 = require('sha256'),
	users = [{
		username: 'idanstark42',
		password: sha256('Password1'),
		anotherProperty: 'value1'
	}, {
		username: 'taltaub',
		password: sha256('Password2'),
		anotherProperty: 'value3'
	}, {
		username: 'alang',
		password: sha256('Password3'),
		anotherProperty: 'value2'
	}];

exports.get = function(username) {
	return users.find(user => user.username === username);
};


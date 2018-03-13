var sha256 = require('sha256'),
	mongo = require('mongodb-promise');

const MONGO_URL = 'mongodb://127.0.0.1:3000/dbname';
const DB_NAME = 'users';
const COLLECTION_NAME = 'users';

exports.get = function(username) {
	return mongo.MongoClient.connect(MONGO_URL).then(mongoServer => {
		let db = mongoServer.db(DB_NAME);
		let collection = db.collection(COLLECTION_NAME);
		let users = collection.find({ username: username }).toArray();
		db.close();
		return users;
	}).then(users => users[0]).catch(err => {
		console.error(err);
		return null;
	});
};

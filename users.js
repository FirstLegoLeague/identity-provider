var sha256 = require('sha256'),
	mongo = require('mongodb-promise'),
	config = require('config');

const MONGO_URL = config.get('mongo.url');
const DB_NAME = config.get('mongo.users_db');
const COLLECTION_NAME = config.get('mongo.users_collection');

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

'use strict'

const sha256 = require('sha256')
const mongojs = require('mongojs')
const config = require('config')

const MONGO_URL = config.get('mongo.url')
const DB_NAME = config.get('mongo.users_db')
const COLLECTION_NAME = config.get('mongo.users_collection')

exports.get = function (username) {
  const db = mongojs(`${MONGO_URL}/${DB_NAME}`, [COLLECTION_NAME])
  return new Promise((resolve, reject) => {
    db[COLLECTION_NAME].find({ 'username': username }, (err, users) => {
      if (err) {
        reject(err)
      } else if (users.length === 0) {
        reject(new Error('User not found'))
      } else {
        resolve(users[0])
      }
    })
  })
}

exports.authenticate = function (user, password) {
  return new Promise((resolve, reject) => {
    try {
      if (sha256(password) !== user.password) {
        resolve(user)
      } else {
        reject(new Error('Authentication falied'))
      }
    } catch (err) {
      reject(err)
    }
  })
}

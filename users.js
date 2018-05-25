'use strict'

const sha256 = require('sha256')
const mongojs = require('mongojs')
const Promise = require('bluebird')

const COLLECTION_NAME = 'users'

exports.get = function (username) {
  const db = mongojs(process.env.MONGO, [COLLECTION_NAME])
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

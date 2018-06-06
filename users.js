'use strict'

const sha256 = require('sha256')
const config = require('@first-lego-league/ms-configuration')
const Promise = require('bluebird')

function generateUser (username, password) {
  // TODO add mhub password here as well
  return { username, password }
}

exports.get = function (username) {
  return config.get(username)
    .then(password => generateUser(username, password))
    .then(user => {
      if (!user.username || user.password) {
        throw new Error('User not found')
      }
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

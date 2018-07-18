'use strict'

const config = require('@first-lego-league/ms-configuration')
const Promise = require('bluebird')
const crypto = require('crypto')

function generateUser (username, password) {
  // TODO add mhub password here as well
  return { username, password: password.hash, salt: password.salt }
}

function sha256 (password, salt) {
  crypto.createHash('sha256').update(password + salt).digest('base64')
}

exports.get = function (username, req) {
  return config.get(username, req)
    .then(password => {
      if (!password) {
        throw new Error('User not found')
      }
      return generateUser(username, password)
    })
}

exports.authenticate = function (user, password) {
  return new Promise((resolve, reject) => {
    try {
      if (user.password !== sha256(password, user.salt)) {
        resolve(user)
      } else {
        reject(new Error('Authentication falied'))
      }
    } catch (err) {
      reject(err)
    }
  })
}

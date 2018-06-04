'use strict'

const DEFAULT_PORT = 9000
const DEFAULT_SECRET = '321LEGO'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const TOKEN_KEY = 'auth-token' // Following the FIRST LEGO League System module standard v1.0

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const templates = require('template-file')
const jwt = require('jsonwebtoken')
// const config = require('@first-lego-league/ms-configuration')
const correlationMiddleware = require('@first-lego-league/ms-correlation').correlationMiddleware
const loggerMiddleware = require('@first-lego-league/ms-logger').loggerMiddleware

const Users = require('./users')

const port = process.env.PORT || DEFAULT_PORT
const secret = process.env.SECRET || DEFAULT_SECRET
const tokenExpiration = TOKEN_EXPIRATION // TODO token expiration

const app = express()

app.use(correlationMiddleware)
app.use(loggerMiddleware)

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/webfonts', express.static(path.resolve(__dirname, 'client/node_modules/@first-lego-league/user-interface/current/assets/fonts')))
app.use(express.static(path.resolve(__dirname, 'client')))

app.use((req, res, next) => {
  req.callbackUrl = req.query['callbackUrl'] || req.params['callbackUrl'] || req.body['callbackUrl']

  res.redirectToCallbackUrl = function (token) {
    res.redirect(`${req.callbackUrl}?token=${token}`)
  }

  res.renderLoginPage = function (options) {
    templates.renderTemplateFile(path.resolve(__dirname, 'login.html'), options)
      .then(content => res.send(content))
      .catch(err => res.send(err))
  }

  if (req.callbackUrl) {
    next()
  } else {
    res.renderLoginPage({ 'error': 'No callback url specified' })
  }
})

app.post('/login', (req, res) => {
  Users.get(req.body['username'])
    .catch(err => {
      const error = err || 'User not found'
      res.renderLoginPage({ 'error': error, 'callbackUrl': req.callbackUrl })
    })
    .then(user => Users.authenticate(user, req.body['password']))
    .catch(err => {
      const error = err || 'Incorrect password'
      res.renderLoginPage({ 'error': error, 'callbackUrl': req.callbackUrl })
    })
    .then(user => {
      delete user.password
      const token = jwt.sign(user, secret)
      res.cookie(TOKEN_KEY, token, { maxAge: tokenExpiration })
      res.redirectToCallbackUrl(token)
    }).catch(err => res.renderLoginPage({ 'error': err, 'callbackUrl': req.callbackUrl }))
})

app.get('/login', (req, res) => {
  const existingAuthToken = req.get(TOKEN_KEY) || req.cookies[TOKEN_KEY]
  if (existingAuthToken) {
    try {
      jwt.verify(existingAuthToken, secret)
      res.redirectToCallbackUrl(existingAuthToken)
      return
    } catch (err) {
      console.log(`Someone tried bypassing the system with a wrongly encoded web token: ${existingAuthToken}`)
    }
  } else {
    res.renderLoginPage({ 'callbackUrl': req.callbackUrl })
  }
})

app.listen(port, () => {
  console.log(`Identity Provider listening on port ${port}`)
})

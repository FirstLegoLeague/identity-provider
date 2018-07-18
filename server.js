'use strict'
/* eslint node/no-deprecated-api: 0 */
/* eslint node/no-unsupported-features: 0 */

const DEFAULT_PORT = 9000
const DEFAULT_SECRET = '321LEGO'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const TOKEN_KEY = 'auth-token' // Following the FIRST LEGO League System module standard v1.0

const express = require('express')
const path = require('path')
const domain = require('domain')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const templates = require('template-file')
const domain = require('domain')
const jwt = require('jsonwebtoken')

const { correlationMiddleware, correlateSession } = require('@first-lego-league/ms-correlation')
const { Logger, loggerMiddleware } = require('@first-lego-league/ms-logger')

const Users = require('./users')

const port = process.env.PORT || DEFAULT_PORT
const secret = process.env.SECRET || DEFAULT_SECRET
const tokenExpiration = TOKEN_EXPIRATION // TODO token expiration
const logger = new Logger()

const app = express()
const logger = new Logger()

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
    if (!req.callbackUrl.match(/^http(s)?:\/\//)) {
      req.callbackUrl = `http://${req.callbackUrl}`
    }
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
  Users.get(req.body['username'], req)
    .then(user => {
      user = Users.authenticate(user, req.body['password'])
      const token = jwt.sign({ username: user.username }, secret)
      res.cookie(TOKEN_KEY, token, { maxAge: tokenExpiration })
      res.redirectToCallbackUrl(token)
    })
    .catch(error => res.renderLoginPage({ 'error': error, 'callbackUrl': req.callbackUrl }))
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

app.get('/logout', (req, res) => {
  res.clearCookie(TOKEN_KEY)
  res.redirect(`/login?callbackUrl=${req.callbackUrl}`)
})

app.listen(port, () => {
  domain.create().run(() => {
    correlateSession()
    logger.info(`Identity provider listening on port ${port}`)
  })
})

process.on('SIGINT', () => {
  domain.create().run(() => {
    correlateSession()
    logger.info('Process received SIGINT: shutting down')
    process.exit(1)
  })
})

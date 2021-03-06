const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const TOKEN_KEY = 'auth-token' // Following the FIRST LEGO League System module standard v1.0

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const templates = require('template-file')
const jwt = require('jsonwebtoken')

const { correlationMiddleware } = require('@first-lego-league/ms-correlation')
const { Logger, loggerMiddleware } = require('@first-lego-league/ms-logger')

const Users = require('./lib/users')

const port = process.env.PORT
const secret = process.env.SECRET
const tokenExpiration = TOKEN_EXPIRATION // TODO token expiration

const app = express()
const logger = new Logger()

let _usernamesPromise
function getUsernames () {
  if (!_usernamesPromise) {
    _usernamesPromise = Users.usernames()
      .then(usernames => usernames.join(','))
      .catch(() => '')
  }
  return _usernamesPromise
}

app.use(correlationMiddleware)
app.use(loggerMiddleware)

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, 'public')))

app.use((req, res, next) => {
  req.callbackUrl = req.query['callbackUrl'] || req.params['callbackUrl'] || req.body['callbackUrl']

  res.redirectToCallbackUrl = function (token) {
    if (!req.callbackUrl.match(/^http(s)?:\/\//)) {
      req.callbackUrl = `http://${req.callbackUrl}`
    }
    req.logger.debug(`Redirecting to callback URL ${req.callbackUrl} with token ${token}`)
    res.redirect(`${req.callbackUrl}?token=${token}`)
  }

  res.renderLoginPage = function (options) {
    templates.renderTemplateFile(path.resolve(__dirname, 'public/login.html'), options)
      .then(content => {
        req.logger.debug(`Rending login page with options ${Object.entries(options).filter(([key, value]) => value).map(([key, value]) => `${key}:${value}`).join(',')}`)
        res.send(content)
      })
      .catch(err => {
        req.logger.error(`Error while rendering login page: ${err}`)
        res.send(err)
      })
  }

  if (req.callbackUrl || req.path === '/login') {
    next()
  } else {
    res.redirect('/login?error=No callback url specified')
  }
})

app.post('/login', (req, res) => {
  Users.get(req.body['username'], req)
    .then(user => Users.authenticate(user, req.body['password']))
    .then(user => {
      const token = jwt.sign({ username: user.username }, secret)
      res.cookie(TOKEN_KEY, token, { maxAge: tokenExpiration })
      res.redirectToCallbackUrl(token)
    })
    .catch(error => res.redirect(`/login?error=${error}&callbackUrl=${req.callbackUrl}`))
})

app.get('/login', (req, res) => {
  const existingAuthToken = req.get(TOKEN_KEY) || req.cookies[TOKEN_KEY]
  if (existingAuthToken) {
    try {
      jwt.verify(existingAuthToken, secret)
      res.redirectToCallbackUrl(existingAuthToken)
      return
    } catch (err) {
      logger.warn(`Someone tried bypassing the system with a wrongly encoded web token: ${existingAuthToken}`)
      getUsernames().then(usernames => {
        res.renderLoginPage({ 'callbackUrl': req.callbackUrl, error: req.query.error, usernames })
      })
    }
  } else {
    getUsernames().then(usernames => {
      res.renderLoginPage({ 'callbackUrl': req.callbackUrl, error: req.query.error, usernames })
    })
  }
})

app.get('/logout', (req, res) => {
  res.clearCookie(TOKEN_KEY)
  res.redirect(`/login?callbackUrl=${req.callbackUrl}`)
})

app.listen(port, () => {
  logger.info(`Identity provider listening on port ${port}`)
})

process.on('SIGINT', () => {
  logger.info('Process received SIGINT: shutting down')
  process.exit(130)
})

process.on('uncaughtException', err => {
  logger.fatal(err.message)
  process.exit(1)
})

process.on('unhandledRejection', err => {
  logger.fatal(err.message)
  process.exit(1)
})


const connect = require('connect')
const url = require('url')

const app = connect()

const htmlTemplate = body => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dummy Module</title>
</head>
<body>
    <h1>Dummy Module</h1>
    ${body}
</body>
</html>
`

app.use('/logged', (req, res, next) => {
  if (req.method === 'GET') {
    // eslint-disable-next-line node/no-deprecated-api
    const token = url.parse(req.url, true).query.token
    res.end(htmlTemplate(`<h2>You have logged in!</h2><p>Your token is ${token}</p>`))
  } else {
    next()
  }
})

app.use('/forbidden', (req, res) => {
  res.statusCode = 302
  res.setHeader('location', 'http://localhost:3000/login?callbackUrl=http://localhost:3001/logged')
  res.end()
})

app.use((req, res) => {
  res.end(htmlTemplate(`<h2><a href="forbidden">Forbidden</a></h2>`))
})

app.listen(3001)

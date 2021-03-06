[![npm](https://img.shields.io/npm/v/@first-lego-league/idp.svg)](https://www.npmjs.com/package/@first-lego-league/identity-provider)
[![codecov](https://codecov.io/gh/FirstLegoLeague/identity-provider/branch/master/graph/badge.svg)](https://codecov.io/gh/FirstLegoLeague/identity-provider)
[![Build status](https://ci.appveyor.com/api/projects/status/qnt44wgdsq156p14/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/identity-provider/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/identity-provider.svg)](https://github.com/FirstLegoLeague/identity-provider/blob/master/LICENSE)


[![David Dependency Status](https://david-dm.org/FirstLegoLeague/identity-provider.svg)](https://david-dm.org/FirstLegoLeague/identity-provider)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/identity-provider/dev-status.svg)](https://david-dm.org/FirstLegoLeague/identity-provider#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/identity-provider/peer-status.svg)](https://david-dm.org/FirstLegoLeague/identity-provider?type=peer)


# IdP
Identity Provider based on the First Lego League Module Standard

# Basic usage
Run using `node server.js`  or `npm run start`

# Principle of operation
The JWT IdP is based upon the redirect binding in SAML, but simpler:  
1. The Service Provider(SP), weather using the [SP library](https://github.com/FirstLegoLeagueIL/SP) or not, redirects the user to the Identity Provider(IdP) login URL `<idp_url>/login?callbackUrl=<sp_callbackUrl>`.
2. The IdP authenticates the user and pulls its details out of the mongodb. **NOTICE** There is no verification on the callbackUrl parameter, or on the refferer of the redirection, and thereafore anyone can ask to use the IdP without authentication, but without the secret the IdP has, the SP cannot be sure the response was correct and protected.
3. The IdP redirects to the callbackUrl parameter, adding to it the parameter `token` with the value of the JWT of the user, signed with the secret. The secret must be shared across servers upon startup.

## Development
1. Fork this repository
2. make some changes
3. create a Pull Request
4. Wait for a CR from the code owner
5. make sure everything is well
6. merge

A few things to notice while developing:
* Use `yarn` not `npm`
* Follow javascript standard as described [here](https://standardjs.com/)
* Keep the service lightweight
* Don't break API if not neccessary, and if you do, change the [SP library](https://github.com/FirstLegoLeagueIL/SP) accordingly.
* Be creative and have fun

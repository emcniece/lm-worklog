/*
 * config-sample.js
 *
 * Sample configuration file - rename to config.js before
 * attempting to run this app with `npm run start` !
 *
 */

var config = {
    basicAuth:  { user: 'user', pass: 'pass'},
    redis:      { port: 6379, host: '127.0.0.1', auth: 'password' },
    express:    { port: 3000 },
    toggl: {
      test1: '8974611fcc012b0d33093da0e2ed8cd5'
      // , test2: '' ...
    },
    mongo: {
      server: 'localhost:27017',
      db: 'lmserver',
      user: 'mongoUser',
      pass: 'mongoPass'
    }
};

module.exports = config;
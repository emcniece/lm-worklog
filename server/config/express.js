
/**
 * Module dependencies.
 */

var basicAuth = require('basic-auth-connect');
var config = require('./config');

/**
 * Expose
 */

module.exports = function (app, express) {

  app.use(basicAuth( config.basicAuth.user, config.basicAuth.pass));

    // Kue GUI _really_ wants to be at web root...
  app.use(function(req, res, next) {
    if(req.path === '/') {
      return res.redirect('/active');
    }
    next();
  });



};
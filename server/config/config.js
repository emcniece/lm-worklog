
/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;

var dev = require('./env/dev');
var prod = require('./env/prod');

var defaults = {
  root: path.join(__dirname, '..')
};

/**
 * Expose
 */

module.exports = {
  dev: extend(dev, defaults),
  //test: extend(test, defaults),
  prod: extend(prod, defaults)
}[process.env.NODE_ENV || 'dev'];

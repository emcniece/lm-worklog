
/**
 * Module dependencies.
 */


//var utils = require('../../lib/utils');
var MongoClient = require('mongodb').MongoClient;
var TogglClient = require('toggl-api');

var jobs = require('./jobs');

/**
 * Add
 */

// This gets called each time a job finishes in order
// to create a recurring instance.
exports.add = function(req, res){
  if( !req.params.key){ res.json({error: 'No key provided'}); return; }
  var toggl = new TogglClient({apiToken: req.params.key});

  console.log('HERE', req.params.key)

  toggl.getUserData( {}, function(status, user){
    console.log( status, typeof(user) );
    if(!user){
      res.json({error: 'Invalid user'});
    }
    else{
      jobs.add( user.id);
      mdbInsertUser( user);
      mdbInsertJob({ user: user.id, email: user.email, api_token: user.api_token });
      res.json({success: true, message: "User valid - added job"});
    }
  });
};

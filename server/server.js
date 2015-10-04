/*============================
=            Init            =
============================*/
var basicAuth = require('basic-auth-connect');
var express     = require('express');
//var kue         = require('kue');
var TogglClient = require('toggl-api');
var MongoClient = require('mongodb').MongoClient;
var assert      = require('assert');

var config      = require('./config/config');

/*==========================================
=            LiveReload for Dev            =
==========================================*/
livereload = require('livereload');
server = livereload.createServer();
server.watch(__dirname);


/*======================================
=            MongoDB Config            =
======================================*/
var url = 'mongodb://'+config.mongo.user+':'+config.mongo.pass+'@'+config.mongo.server+'/'+config.mongo.db+'';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to mongodb server.");
  db.close();
});





/*======================================
=            Express Routes            =
======================================*/

var app = express();
var port = process.env.PORT || config.express.port || 3000;


// Bootstrap kue
var Queue;
require('./config/kq')(app, Queue);

// Bootstrap application settings
require('./config/express')(app, express);

// Bootstrap routes
require('./config/routes')(app);

// Listen up...
app.listen( port );
console.log('Express app started on port ' + port);



/*=================================
=            Toggl API            =
=================================*/

// Raw API test
function tgTestAPI(){
    // Create a test API user
    var toggl = new TogglClient({ apiToken: config.toggl.test1 });

    // Testing a report request. First response object is null, why?
    toggl.detailedReport( {workspace_id: 309840}, function(thisIsNull, data){
        console.log('Detailed Report:', data.length);
    });
}

function tgGetDetailedReport(tgid){

}





/*===========================================
=            MongoDB Interaction            =
===========================================*/
var _writeResult = function(err, affected, raw){
    console.log('Write Result: ', affected.result);
};
var _insertDocument = function(collection, data, db, callback) {
   db.collection( collection ).update(data, data, {upsert: true}, function(err, affected, raw){
    console.log(collection+' write Result: ', affected.result);
   });
};

function mdbInsertUser(user){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        _insertDocument('users', user, db, function() {
            db.close();
        });
    });
}

function mdbInsertJob(job){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        _insertDocument('jobs', job, db, function() {
            db.close();
        });
    });
}
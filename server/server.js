/*============================
=            Init            =
============================*/
var config      = require('./config');
var basicAuth   = require('basic-auth-connect');
var express     = require('express');
var kue         = require('kue');
var TogglClient = require('toggl-api');
var MongoClient = require('mongodb').MongoClient;
var assert      = require('assert');


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


/*==================================
=            Kue Queue             =
==================================*/

// Spool a queue - must be done before express
var Queue = kue.createQueue({
  // see https://github.com/mranney/node_redis#rediscreateclient
  prefix: 'q',
  redis: config.redis
});


/*======================================
=            Express Routes            =
======================================*/
var app = express();
app.use(basicAuth( config.basicAuth.user, config.basicAuth.pass));

// Kue GUI _really_ wants to be at web root...
app.use(function(req, res, next) {
  if(req.path === '/') {
    return res.redirect('/active');
  }
  next();
});

// /active/ - Let express handle the Kue GUI
app.use(kue.app);

// Clear Kue jobs
app.get('/clear/', expClearQueue);
app.get('/clear/:state', expClearQueue);
function expClearQueue(req, res){

    var jState = [req.params.state] || ['active'];
    var states = ['inactive', 'active', 'failed', 'complete', 'delayed']; // user indication

    var clearStates = ('all' === req.params.state) ? states : jState;   // possible all clear

    clearStates.forEach(function(curState, i){
        var totalCleared = 0;

        kue.Job.rangeByState (curState, 0, 1000, 'asc', function (err, selectedJobs) {
            totalCleared += selectedJobs.length;

            selectedJobs.forEach(function(job){
                job.remove();
            });

            // Last state? send res
            if( clearStates.length === (i+1) ){
                res.json({success: true, message: "Cleared jobs", numJobs: totalCleared, jobState: jState, states: states});
            }
        });
    });
}

// intake of new toggl key
app.get('/users/add/', expAddKey);
app.get('/users/add/:key', expAddKey);
function expAddKey(req, res){
    if( !req.params.key){ res.json({error: 'No key provided'}); return; }
    var toggl = new TogglClient({apiToken: req.params.key});

    toggl.getUserData( {}, function(status, user){
        console.log( status, typeof(user) );
        if(!user){ res.json({error: 'Invalid user'}); }
        else{
            newJob( user.id);
            mdbInsertUser( user);
            mdbInsertJob({ user: user.id, email: user.email, api_token: user.api_token });
            res.json({success: true, message: "User valid - added job"});
        }
    });
}
app.get('/users/delete/:id', function(req, res){});    // @todo

// Jobs
app.get('/jobs/', expListJobs);
function expListJobs(req, res){

}
app.get('/jobs/delete/:id', function(req, res){});    // @todo

// Logs
app.get('/logs/', expListLogs);
function expListLogs(req, res){

}
app.get('/logs/:project', function(req, res){});    // @todo



// Start the express listener
app.listen( config.express.port );


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


/*======================================
=            Queue Handlers            =
======================================*/

// This is how jobs are REALLY created, Mr. Trump...
// This gets called each time a job finishes in order
// to create a recurring instance.
function newJob (uid){

    // Toggl data?
    var data = {user: uid};
    var jobName = 'user_'+uid;

    // unique job creation
    var job = Queue
                .createJob( jobName, data)
                .attempts(1)
                .delay(10000)
                .priority('normal');

    // Schedule!
    job.save();
    Queue.process(jobName, kueJobProcessor);
    console.log("Job scheduled!");
}

// Handle the job once it goes through
function kueJobProcessor(job, done){

    console.log('Job', job.id, 'is done');
    newJob( job.data.user);
    done && done();
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
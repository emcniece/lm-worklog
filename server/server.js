/*============================
=            Init            =
============================*/
var config      = require('./config');
var basicAuth   = require('basic-auth-connect');
var express     = require('express');
var kue         = require('kue');
var TogglClient = require('toggl-api');

// LiveReload for dev
livereload = require('livereload');
server = livereload.createServer();
server.watch(__dirname);


/*==================================
=            Kue Queue             =
==================================*/

// Spool a queue - must be done before express
var Queue = kue.createQueue({
  // see https://github.com/mranney/node_redis#rediscreateclient
  prefix: 'q',
  redis: config.redis
});

// Check for existing jobs and begin processing


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

// Let express handle the Kue GUI
app.use(kue.app);

// intake of new toggl key
app.get('/add/', expAddKey);
app.get('/add/:key', expAddKey);
function expAddKey(req, res){
    if( !req.params.key){ res.json({error: 'No key provided'}); return; }
    var toggl = new TogglClient({apiToken: req.params.key});

    toggl.getUserData( {}, function(status, user){
        console.log( status, typeof(user) );
        if(!user){ res.json({error: 'Invalid user'}); }
        else{
            newJob( user.id);
            res.json({success: true, message: "User valid - added job"});
        }
    });
}

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
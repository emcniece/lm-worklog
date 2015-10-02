
var express     = require('express');
var kue         = require('kue');
var TogglClient = require('toggl-api');

// Web responses
var app = express();
app.get('/', function(req, res){
    res.send('id: ' + req.query_id);
});

// Start the express listener
app.listen(3001);

// Spool a queue, enable the web interface
var jobs = kue.createQueue();
kue.app.listen(4000);

// Create a test API user
var tgid = '8974611fcc012b0d33093da0e2ed8cd5';
var toggl = new TogglClient({apiToken: tgid})

// Testing a report request. First response object is null, why?
toggl.detailedReport( {workspace_id: 309840}, function(thisIsNull, data){
    console.log('Detailed Report:', data);
});

// This is how jobs are REALLY created, Mr. Trump...
function newJob (){
    var job = jobs.create('new_job');
    job.save();
}

// Handle the job once it goes through
jobs.process('new_job', function (job, done){
    console.log('Job', job.id, 'is done');
    done && done();
});

// Test job creation
//setInterval(newJob, 3000);
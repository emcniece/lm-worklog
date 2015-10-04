
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

var users = require('../app/controllers/users');
var kue         = require('kue');
/**
 * Expose routes
 */

module.exports = function (app) {

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
  app.get('/users/add/:key', users.add);

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

};
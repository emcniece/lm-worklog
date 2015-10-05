
/**
 * Module dependencies.
 */

var MongoClient = require('mongodb').MongoClient;
var TogglClient = require('toggl-api');
var kq = require('../../config/kq');

/* @TODO: Figure out how to share the kq module from server.js in here. */
console.log('--', kq.newtest );

/* @TODO: PAttern looks promising, but data isn't persisting thru server.js init(4); */
var sg = require('../../config/singleton-test');
console.log('-sg jobs: ', sg.test);

/**
 * Add
 */

exports.add = function (uid){
  var data = {user: uid};
  var jobName = 'user_'+uid;



  // unique job creation
  //var job = kq.createQueue(jobName);
  /*var job = Queue
              .createJob( jobName, data)
              .attempts(1)
              .delay(10000)
              .priority('normal');
*/
  // Schedule!
  job.save();
  //Queue.process(jobName, kq.process);
  console.log("Job scheduled!");
};
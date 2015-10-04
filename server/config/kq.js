
/**
 * Module dependencies.
 */

var config = require('./config');
var redis = require('redis');
var kue = require('kue');

/**
 * Expose
 */

module.exports = function (app, Queue) {

  // see https://github.com/mranney/node_redis#rediscreateclient
  kue.redis.createClient = function(){
      var client = redis.createClient( config.redis.port,config.redis.host);
      client.auth( config.redis.auth );
      return client;
  };

  // Spool a queue - must be done before express
  Queue = kue.createQueue({
    prefix: 'q'
  });

  // /active/ - Let express handle the Kue GUI
  app.use(kue.app);

  var createQueue = function(jobName){
    return Queue
              .createJob( jobName, data)
              .attempts(1)
              .delay(10000)
              .priority('normal');
  }

};

// Handle the job once it goes through
exports.process = function(job, done){

    console.log('Job', job.id, 'is done');
    jobs.add( job.data.user);
    done && done();
}

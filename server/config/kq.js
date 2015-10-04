
/**
 * Module dependencies.
 */

var config = require('./config');
var redis = require('redis');
var kue = require('kue');

/**
 * Expose
 */

// Constructor
function KueQueue(app){
  if (!(this instanceof KueQueue)) {
    c
    return new KueQueue(app);
  }

  this.Queue = null;
  this.test = 1234;

  this.createClient();
  console.log("[SERVICE] Kue connected: " + config.redis.host + ':' + config.redis.port);

  app.use(kue.app);
  console.log("Kue UI available at [url]:"+config.express.port+"/active/")

  this.createQueue();
}

// Prototypes
KueQueue.prototype.createClient = function createClient(){
  kue.redis.createClient = function(){
    var client = redis.createClient( config.redis.port,config.redis.host);
    client.auth( config.redis.auth );
    return client;
  };
};

// Spool a queue - must be done before express
KueQueue.prototype.createQueue = function createQueue(){
  this.Queue = kue.createQueue({
    prefix: 'q'
  });
  return this.Queue;
};

// Better than any republican on the market
KueQueue.prototype.createJob = function createJob(){
  console.log( 'createJob');
  return this.Queue
    .createJob( jobName, data)
    .attempts(1)
    .delay(10000)
    .priority('normal');
};

// Work work...
KueQueue.prototype.processQueue = function processQueue(job, done){
  console.log( 'processQueue');
  console.log('Job', job.id, 'is done');
  jobs.add( job.data.user);
  done && done();
  return done;
};

module.exports = KueQueue;
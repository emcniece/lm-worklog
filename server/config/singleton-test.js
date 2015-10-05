/*
  TEST 2: maybe?
*/
var Singleton = (function() {
  var private_variable = 'value';
  var self = this;
  var test = 1;

  // Spool services!
  init(105);

  function init(num){
    console.log('INIT: ', num, test);
    test = num;
  }
  function private_function() {
  }
  function public_function() {
  }

  return {
    test: test,
    init: init,
    public_function: public_function
  };
})();

module.exports = Singleton;



/*
  TEST 1: THIS WORKS!!!

var socketList = {};
var test = 0;

exports.socketList = socketList;
exports.test = test;

exports.add = function(userId, socket) {
  if (!socketList[userId]) {
    socketList[userId] = socket;
  }
};

exports.remove = function(userId) {
  if (socketList[userId]) {
    delete socketList[userId];
  }
};

*/
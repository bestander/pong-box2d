var Physics = require('physics/box2dPhysics.js');
var PongGame = require('pongGame,js');

exports.create = function (width, height) {
  return new PongGame(width, height, new Physics());
};


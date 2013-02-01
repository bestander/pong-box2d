/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
'use strict';

var Physics = require('./physics/box2dPhysics.js');
var PongGame = require('./pongGame.js');

/**
 * create Pong Game field of specified width and height
 * @param width width in Box2d scale
 * @param height height in Box2d scale
 * @returns {PongGame}
 */
exports.create = function (width, height) {
  return new PongGame(new Physics(width, height));
};


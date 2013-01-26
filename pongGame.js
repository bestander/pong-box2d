/**
 * Box2d-based engine for a pong game.
 * This script can be used both in web browser or Node.js.
 * See ReadMe.md for usage details.
 *
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
"use strict";



var EventEmitter = require('events').EventEmitter;
require('es6-shim');

var MAX_USERS_PER_GAME = 2;
var SIMULATION_FRAME_RATE = 1 / 60;
var TICK_INTERVAL_MILLIS = SIMULATION_FRAME_RATE * 1000;
var SIMULATION_ACCURACY = 10;

function PongGame (physicsEngine) {
  this._physics = physicsEngine;
  this._emitter = new EventEmitter();
  this._players = new Map();
  this._boundTick = this._tick.bind(this);
}

module.exports = PongGame;

/**
 * @return {object} returns positions of all objects at current moment.
 * keys:
 * TODO define
 */
PongGame.prototype.getObjectPositions = function () {
  return {
  }
};

/**
 * @return {object} returns game's size, scale, connected players etc
 */
PongGame.prototype.getParametersAndState = function () {
  return {
    field: {
      width: this._physics._width,
      height: this._physics._height
    },
    players: this._players.values()
  }
   
};

/**
 * @return {EventEmitter} game events emitter: when players join, quit and do things the game object notifies subscribers
 * with events emitted to this object
 */
PongGame.prototype.getEventsEmitter = function () {
  return this._emitter;
};

/**
 * join player to game, after joining player can issue commands
 * @param playerObj {Object} player object that has id property which should be unique within the game
 * @throws Error if max users per game limit is reached
 */
PongGame.prototype.joinPlayer = function (playerObj) {
  if(!playerObj.id){
    throw new Error('Argument must have id property');
  }
  if(this._players.get(playerObj.id)){
    throw new Error('Player with this id has already joined');
  }
  if(this._players.size >= MAX_USERS_PER_GAME){
    throw new Error('Maximum players limit has been reached');
  }
  this._players.set(playerObj.id, playerObj);
  this._emitter.emit("PLAYER_JOINED", playerObj);
};

/**
 * quit player from game
 * @param playerId player id
 * @throws Error if player is not present
 */
PongGame.prototype.quitPlayer = function (playerId) {
  var player = this._players.get(playerId);
  if(!player){
    throw new Error('No such player present')
  }
  this._emitter.emit('PLAYER_QUIT', playerId)
  this._players.delete(playerId);
};

/**
 * handle player's command
 * @param {Number} player player id
 * @param {String} command command
 * @param {Object} [data] command parameters
 */
PongGame.prototype.handlePlayerCommand = function (player, command, data) {
  switch (command){
    case "READY":
      // TODO position ball
      // start ticking
      this._tick();
      break;

    default :
      throw new Error("Unknown command " + command);
  }
};

/**
 * do simulation
 */
PongGame.prototype._tick = function () {
  var now = Date.now();
  this._previousTick = this._previousTick || now;
  var period = now - this._previousTick;
  this._previousTick = now;
  
  this._physics.tick(period, SIMULATION_ACCURACY);
  setTimeout(this._boundTick, TICK_INTERVAL_MILLIS);
};

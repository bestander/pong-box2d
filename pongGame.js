/**
 * Box2d-based engine for a pong game.
 * This script can be used both in web browser or Node.js.
 * See ReadMe.md for usage details.
 *
 * The script exposes PongGame class that has the following interface:
 * PongGame() - constructor
 * [number] joinPlayer() - joins a player to the game, returns player id
 * quitPlayer([number]) - quits a player from game, making game available
 * [EventEmitter] getEventEmitter() - returns game event emitter that notifies listener about game events
 * handlePlayerCommand([number] player, [String] command, data...) - handle player match command: READY, MOVE_PADDLE
 * [Object] getObjectPositions() - returns array of game objects and their positions
 * [Object] getParametersAndState() - returns game's size, scale, connected players etc
 *
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
"use strict";



var EventEmitter = require('events').EventEmitter;

var MAX_USERS_PER_GAME = 2;
var SIMULATION_FRAME_RATE = 1 / 60;
var TICK_INTERVAL_MILLIS = SIMULATION_FRAME_RATE * 1000;

function PongGame (width, height, physicsEngine) {

  this._emitter = new EventEmitter();
  this._players = [];
  this._boundTick = this._tick.bind(this);
}

module.exports = PongGame;

/**
 * @return {object} returns positions of all objects at current moment.
 * keys:
 * BALL - pong ball position
 * P1 - left paddle position
 * P2 - right paddle position
 */
PongGame.prototype.getObjectPositions = function () {
  return {
    BALL: {
      x : this._ball.position().x,
      y: this._ball.position().y
    }
  }
};

/**
 * @return {object} returns game's size, scale, connected players etc
 */
PongGame.prototype.getParametersAndState = function () {
  return {
    scale: this._scale,
    width: this._width,
    height: this._height
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
 * @throws Error if max users per game limit is reached
 * @return {Number} player id
 */
PongGame.prototype.joinPlayer = function () {
  // we don't really care about player object now because it has no business value
  if(this._players.length >= MAX_USERS_PER_GAME){
    throw new Error("Maximum players limit has been reached");
  }
  this._players.push({player: "dummy"});
  var newId = this._players.length;
  this._emitter.emit("PLAYER_JOINED", newId);
  return newId;
};

PongGame.prototype.quitPlayer = function () {
  // TODO game state events
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
      // test readiness of all players and start game if all ready
      this._emitter.emit("GAME_STARTED");
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
  this._world.Step(
    SIMULATION_FRAME_RATE   //frame-rate
    ,  10       //velocity iterations
    ,  10       //position iterations
  );
  this._world.ClearForces();
  setTimeout(this._boundTick, TICK_INTERVAL_MILLIS);
};

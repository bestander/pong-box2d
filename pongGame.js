/**
 * Box2d-based engine for a pong game.
 * This script can be used both in web browser or Node.js.
 * See ReadMe.md for usage details.
 *
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
'use strict';


var EventEmitter = require('events').EventEmitter;
require('es6-shim');

// simulation accuracy constants
var SIMULATION_FRAME_RATE = 1 / 60;
var TICK_INTERVAL_MILLIS = SIMULATION_FRAME_RATE * 1000;
var SIMULATION_ACCURACY = 10;

function PongGame(physicsEngine) {
  var that = this;

  this._physics = physicsEngine;
  this._emitter = new EventEmitter();
  // ES6 Map shimmed for now but actually I would do fine with a regular object acting as map
  this._players = new Map();
  this._vacantPlaces = [];
  Object.keys(this._physics.playerType).forEach(function (key) {
    that._vacantPlaces.push(that._physics.playerType[key]);
  });
  this._matchStarted = false;
  this._boundTick = this._tick.bind(this);
  this._physics.onBallScored(function (player) {
    that._players.values().forEach(function (elem) {
      if (elem.type === player) {
        elem.score += 1;
      }
    });
    var score = that._players.values().map(function (elem) {
      return {id : elem.object.id, score : elem.score};
    });
    that._emitter.emit('PLAYER_SCORE_CHANGED', score);
  });

}

module.exports = PongGame;

/**
 * directions for MOVE_PADDLE command
 * @type {{UP: string, DOWN: string}}
 */
PongGame.prototype.paddleMoveDirection = {
  'UP' : 'up',
  'DOWN' : 'down'
};

/**
 * @return {object} returns positions of all objects at current moment.
 * see Physics.prototype.getBallAndPaddlePositions for notation
 */
PongGame.prototype.getBallAndPaddlePositions = function () {
  return this._physics.getBallAndPaddlePositions();
};

/**
 * @return {object} returns game's size, scale, connected players etc
 */
PongGame.prototype.getParametersAndState = function () {
  return {
    field : {
      width : this._physics._width,
      height : this._physics._height
    },
    players : this._players.values()
  };
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
  if (!playerObj.id) {
    throw new Error('Argument must have id property');
  }
  if (this._players.get(playerObj.id)) {
    throw new Error('Player with this id has already joined');
  }
  if (this._players.size >= Object.keys(this._physics.playerType).length) {
    throw new Error('Maximum players limit has been reached');
  }
  // clear score
  this._players.values().every(function (elem) {
    elem.score = 0;
  });
  var player = {
    object : playerObj,
    score : 0,
    ready : false,
    type : this._vacantPlaces.pop()
  };
  this._players.set(playerObj.id, player);
  this._physics.addPaddle(player.type, {width : 0.1, height : 1});
  this._emitter.emit('PLAYER_JOINED', player);
};

/**
 * quit player from game
 * @param playerId player id
 * @throws Error if player is not present
 */
PongGame.prototype.quitPlayer = function (playerId) {
  var player = this._players.get(playerId);
  if (!player) {
    throw new Error('No such player present');
  }
  if (this._matchStarted) {
    this._emitter.emit('MATCH_STOPPED');
  }
  this._matchStarted = false;
  this._vacantPlaces.push(player.type);
  this._physics.positionBall({x : this._physics._width / 2, y : this._physics._height / 2}, {x : 0, y : 0});
  this._physics.removePaddle(player.type);
  this._emitter.emit('PLAYER_QUIT', playerId);
  this._players.delete(playerId);
};

/**
 * handle playerId's command
 * @param {Number} playerId player id
 * @param {String} command command
 * @param {Object/String} [data] command parameters
 */
PongGame.prototype.handlePlayerCommand = function (playerId, command, data) {
  var direction;
  var player = this._players.get(playerId);
  if (!player) {
    throw new Error('Unknown player ' + playerId);
  }
  switch (command) {
  case 'READY':
    if (!player.ready) {
      player.ready = true;
      this._emitter.emit('PLAYER_READY', playerId);
    }
    // start ticking
    if (!this._matchStarted && this._players.values().reduce(function (memo, player) {
      return memo + (player.ready ? 1 : 0);
    }, 0) === Object.keys(this._physics.playerType).length) {
      // start match
      this._matchStarted = true;
      this._emitter.emit('MATCH_STARTED');
      this._physics.positionBall({x : this._physics._width / 2, y : this._physics._height / 2},
        {x : Math.random() * 5 + 5, y : Math.random() * 2 + 1});
      this._tick();
    }
    break;
  case 'MOVE_PADDLE':
    direction = {x : 0, y : 50};
    if (data === this.paddleMoveDirection.UP) {
      direction.y = -direction.y;
    }
    this._physics.giveImpulseToPaddle(player.type, direction);
    break;

  default :
    throw new Error('Unknown command ' + command);
  }
};

/**
 * do simulation
 */
PongGame.prototype._tick = function () {
  if (!this._matchStarted) {
    this._previousTick = null;
    return;
  }
  var now = Date.now();
  this._previousTick = this._previousTick || now;
  var period = now - this._previousTick;
  this._previousTick = now;

  this._physics.tick(period / 1000, SIMULATION_ACCURACY);
  setTimeout(this._boundTick, TICK_INTERVAL_MILLIS);
};

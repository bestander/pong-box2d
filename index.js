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

var Box2D = require('box2dweb-commonjs').Box2D;
var EventEmitter = require('events').EventEmitter;

var MAX_USERS_PER_GAME = 2;
var MIN_USERS_FOR_GAME_START = 1;
var SIMULATION_FRAME_RATE = 1 / 60;
var TICK_INTERVAL_MILLIS = SIMULATION_FRAME_RATE * 1000;
var BALL_RADIUS = 0.5;

/**
 * Pong game constructor
 * @param width {number} game field width
 * @param height {number} game field height
 * @param SCALE {number} game scale pixels to box2d units
 * @constructor
 */
function PongGame (width, height, SCALE) {
  this._scale = SCALE || 30;
  this._height = height || 400;
  this._width = width || 400;
  
  this._emitter = new EventEmitter();
  this._players = [];
  this._world = null;
  this._ball = null;
  this._initBox2dObjects(this._width, this._height, this._scale);
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
  // game state events
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



PongGame.prototype._initBox2dObjects = function (width, height, SCALE) {
  var   b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ;

  this._world = new b2World(
    new b2Vec2(0, 0)    //gravity
    ,  true                 //allow sleep
  );

  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 1;
  fixDef.restitution = 0.8;

  var bodyDef = new b2BodyDef;

  //create ground
  bodyDef.type = b2Body.b2_staticBody;
  // positions the center of the object (not upper left!)
  bodyDef.position.x = width / 2 / SCALE;
  bodyDef.position.y = height / SCALE;
  fixDef.shape = new b2PolygonShape;
  // half width, half height. eg actual height here is 1 unit
  fixDef.shape.SetAsBox((600 / SCALE) / 2, (10/SCALE) / 2);
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // create ceiling
  bodyDef.position.x = width / 2 / SCALE;
  bodyDef.position.y = 0;
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // left wall
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;
  fixDef.shape.SetAsBox((10 / SCALE) / 2, height/SCALE);
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // right wall
  bodyDef.position.x = width / SCALE;
  bodyDef.position.y = 0;
  fixDef.shape.SetAsBox((10 / SCALE) / 2, height/SCALE);
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);



  //create some objects
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(
    BALL_RADIUS
  );
  bodyDef.position.x = Math.random() * 25;
  bodyDef.position.y = Math.random() * 10;
  var ball = this._world.CreateBody(bodyDef);
  ball.CreateFixture(fixDef);
  ball.SetLinearVelocity(new b2Vec2(5, 5));
  this._ball = {
    position: function  () {
      return ball.GetPosition(); 
    },
    radius: fixDef.shape.GetRadius()
  }


};


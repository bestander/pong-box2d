/**
 * Box2d-based engine for a pong game.
 * This script can be used both in web browser or Node.js.
 * See ReadMe.md for usage details.
 * 
 * The sctipt exposes PongGame class that has the following interface:
 * TODO 
 * 
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
"use strict";

var Box2D = require('box2dweb-commonjs').Box2D;
var EventEmitter = require('events').EventEmitter;

var PongGame = function () {
  this._emitter = new EventEmitter();
  this._players = null;
  this._ball = null;
  this._paddles = null;
  this._b2world = null
};

module.exports = PongGame;

PongGame.prototype._initBox2dObjects = function () {
  // init code
};

PongGame.prototype.getObjectPositions = function () {
  // array of object-position pairs
};

PongGame.prototype.getEventsEmitter = function () {
  return this._emitter;
};

PongGame.prototype.playerJoin = function () {
  // game state events
};

PongGame.prototype.playerQuit = function () {
  // game state events
};

/**
 * READY, MOVE_PADDLE
 */
PongGame.prototype.playerCommand = function (command) {
  // apply forces
  // start loop
  // send game state events
};

PongGame.prototype._tick = function (command) {
  
};



var PongGameB2D = function (width, height, SCALE) {

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

  this.world = new b2World(
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
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // create ceiling
  bodyDef.position.x = width / 2 / SCALE;
  bodyDef.position.y = 0;
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // left wall
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;
  fixDef.shape.SetAsBox((10 / SCALE) / 2, height/SCALE);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);

  // right wall
  bodyDef.position.x = width / SCALE;
  bodyDef.position.y = 0;
  fixDef.shape.SetAsBox((10 / SCALE) / 2, height/SCALE);
  this.world.CreateBody(bodyDef).CreateFixture(fixDef);



  //create some objects
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(
    0.5
  );
  bodyDef.position.x = Math.random() * 25;
  bodyDef.position.y = Math.random() * 10;
  var ball = this.world.CreateBody(bodyDef);
  ball.CreateFixture(fixDef);
  ball.SetLinearVelocity(new b2Vec2(5, 5));


};

PongGameB2D.prototype.update = function () {
  this.world.Step(
    1 / 60   //frame-rate
    ,  10       //velocity iterations
    ,  10       //position iterations
  );
  this.world.ClearForces();
  this.loop();
};

PongGameB2D.prototype.loop = function () {
  setTimeout(this.update.bind(this), 1000 / 60);
};

PongGameB2D.prototype.getWorld = function () {
  return this.world;
};


"use strict";

/**
 * Box2d engine for a pong game
 */
var Box2D = require('box2dweb-commonjs').Box2D;

var PongGame = function (width, height, SCALE) {

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

PongGame.prototype.update = function () {
  this.world.Step(
    1 / 60   //frame-rate
    ,  10       //velocity iterations
    ,  10       //position iterations
  );
  this.world.ClearForces();
  this.loop();
};

PongGame.prototype.loop = function () {
  setTimeout(this.update.bind(this), 1000 / 60);
};

PongGame.prototype.getWorld = function () {
  return this.world;
};

module.exports = PongGame;
"use strict";

var Box2D = require('box2dweb-commonjs').Box2D;

var b2Vec2;
var b2BodyDef;
var b2Body;
var b2FixtureDef;
var b2Fixture;
var b2World;
var b2MassData;
var b2PolygonShape;
var b2CircleShape;
var fixDef;
var bodyDef;

b2Vec2 = Box2D.Common.Math.b2Vec2;
b2BodyDef = Box2D.Dynamics.b2BodyDef;
b2Body = Box2D.Dynamics.b2Body;
b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
b2Fixture = Box2D.Dynamics.b2Fixture;
b2World = Box2D.Dynamics.b2World;
b2MassData = Box2D.Collision.Shapes.b2MassData;
b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 1;
fixDef.restitution = 1.0;

bodyDef = new b2BodyDef;


function Physics (width, height) {
  this._height = height;
  this._width = width;
  this._world = null;
  this._ball = null;
  this._initField();
}

module.exports = Physics;

Physics.prototype.addPaddle = function (type, size) {
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.Set(type === "left" ? size.width / 2 : this._width - size.width / 2, this._height / 2);
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(size.width, size.height);
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

};

Physics.prototype.addBall = function (size) {
  //create some objects
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(
    size
  );
  bodyDef.position.Set(this._width / 2, this._height / 2);
  var ball = this._world.CreateBody(bodyDef);
  ball.CreateFixture(fixDef);
  ball.SetLinearVelocity(new b2Vec2(5, 5));
  this._ball = {
    position: function  () {
      return ball.GetPosition();
    },
    radius: fixDef.shape.GetRadius()
  };

};

Physics.prototype.positionBall = function (position) {

};

Physics.prototype.tick = function (period, accuracy) {
  this._world.Step(
    period   //frame-rate
    ,  accuracy       //velocity iterations
    ,  accuracy       //position iterations
  );
  this._world.ClearForces();
};

Physics.prototype.getBallAndPaddlePositions = function () {

};

Physics.prototype.giveImpulseToPaddle = function (direction) {

};

Physics.prototype.onBallTouchedPlayerZone = function (callback) {

};

Physics.prototype._initField = function () {

  this._world = new b2World(
    new b2Vec2(0, 0)    //gravity
    ,  true                 //allow sleep
  );

  // ground 
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.Set(0, this._height);
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(this._width, 0) );
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // ceiling
  bodyDef.position.Set(0, 0);
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // left wall
  bodyDef.position.Set(0, 0);
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  var leftWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // right wall
  bodyDef.position.Set(this._width, 0);
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  var rightWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);



};
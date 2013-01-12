"use strict";

var Box2D = require('box2dweb-commonjs').Box2D;

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 1;
fixDef.restitution = 1.0;

var bodyDef = new b2BodyDef;


function Physics (width, height, ballRadius) {
  this._height = height;
  this._width = width;
  this._ballRadius = ballRadius || 0.2;
  this._world = null;
  this._ballScored = function  () {};
  this._init();
}

Physics.playerType = {
  LEFT: "left",
  RIGHT: "right"
};

module.exports = Physics;

Physics.prototype.addPaddle = function (playerType, size) {
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.Set(0, this._height / 2);
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(size.width / 2, size.height / 2);
  var paddle = this._world.CreateBody(bodyDef).CreateFixture(fixDef);
  if(playerType === Physics.playerType.LEFT){
    this._leftPaddle = paddle;
    this._jointPaddleToWall(paddle.GetBody(), this._leftWall.GetBody(), -0.2);
  } else {
    this._rightPaddle = paddle;
    this._jointPaddleToWall(paddle.GetBody(), this._rightWall.GetBody(), 0.2);
  }
};

Physics.prototype._jointPaddleToWall = function (paddleBody, wallBody, distanceFromWall) {
  var jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
  jointDef.bodyA = paddleBody
  jointDef.bodyB = wallBody;
  jointDef.collideConnected = false;
  jointDef.localAxisA.Set(0.0, 1.0);
  jointDef.localAnchorA.Set(distanceFromWall, 0);
  this._world.CreateJoint(jointDef);
};

Physics.prototype.positionBall = function (position, speed) {
  this._ball.GetBody().SetPosition(position);
  this._ball.GetBody().SetLinearVelocity(speed);

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
  // TODO
};

Physics.prototype.giveImpulseToPaddle = function (player, direction) {
  var paddle = player === Physics.playerType.LEFT ? this._leftPaddle : this._rightPaddle;
  paddle.GetBody().ApplyForce(direction, paddle.GetBody().GetWorldCenter());
};

Physics.prototype.onBallScored = function (callback) {
  this._ballScored = callback;
};

Physics.prototype._init = function () {

  var that = this;
  this._world = new b2World(
    new b2Vec2(0, 0)    //gravity
    ,  true                 //allow sleep
  );

  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(
    that._ballRadius
  );
  bodyDef.position.Set(this._width / 2, this._height / 2);
  this._ball = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

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
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  this._leftWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);
  
  // right wall
  bodyDef.position.Set(this._width, 0);
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  this._rightWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // important callbacks
  var contactListener = new Box2D.Dynamics.b2ContactListener();
  contactListener.BeginContact = function (contact) {
    if(contact.GetFixtureA() === that._leftWall || contact.GetFixtureB() === that._leftWall){
      that._ballScored(Physics.playerType.RIGHT);
    }
    if(contact.GetFixtureA() === that._rightWall || contact.GetFixtureB() === that._rightWall){
      that._ballScored(Physics.playerType.LEFT);
    }
  };
  this._world.SetContactListener(contactListener);


};
"use strict";

var Box2D = require('box2dweb-commonjs').Box2D;

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;


var bodyDef = new b2BodyDef;
var PADDLE_WALL_DISTANCE = 0.2;

var COLLISION_FILTER_CATEGORIES = {
  DEFAULT: 1,
  PADDLE: 2
};
var PADDLE_STOPPER = "paddle_stopper";



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
  var fixDef = new b2FixtureDef;
  fixDef.density = 2.0;
  fixDef.friction = 1;
  fixDef.restitution = 1.0;
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.Set(0, this._height / 2);
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(size.width / 2, size.height / 2);
  fixDef.filter.categoryBits = COLLISION_FILTER_CATEGORIES.PADDLE;
  var paddle = this._world.CreateBody(bodyDef).CreateFixture(fixDef);
  paddle._size = size;
  if(playerType === Physics.playerType.LEFT){
    this._leftPaddle = paddle;
    this._jointPaddleToWall(paddle, this._leftWall, -PADDLE_WALL_DISTANCE);
  } else {
    this._rightPaddle = paddle;
    this._jointPaddleToWall(paddle, this._rightWall, PADDLE_WALL_DISTANCE);
  }
};

Physics.prototype._jointPaddleToWall = function (paddleFixture, wallFixture, distanceFromWall) {
  var jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
  jointDef.bodyA = paddleFixture.GetBody();
  jointDef.bodyB = wallFixture.GetBody();
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
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 1;
  fixDef.restitution = 1.0;

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
  fixDef.filter.categoryBits = COLLISION_FILTER_CATEGORIES.DEFAULT;
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(this._width, 0) );
  
  this._floor = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // ceiling
  bodyDef.position.Set(0, 0);
  fixDef.filter.categoryBits = COLLISION_FILTER_CATEGORIES.DEFAULT;
  this._ceiling = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // left wall
  bodyDef.position.Set(0, 0);
  fixDef.filter.categoryBits = COLLISION_FILTER_CATEGORIES.DEFAULT;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  this._leftWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);
  
  // right wall
  bodyDef.position.Set(this._width, 0);
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(0, this._height) );
  this._rightWall = this._world.CreateBody(bodyDef).CreateFixture(fixDef);
  
  // inertia dampers for paddles
  bodyDef.position.Set(this._width - 0.2, this._height - 2);
  fixDef.filter.maskBits = COLLISION_FILTER_CATEGORIES.PADDLE;
  fixDef.shape.SetAsBox(0.1, 0.1);
  fixDef.userData = PADDLE_STOPPER;
  this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // important callbacks
  var contactListener = new Box2D.Dynamics.b2ContactListener();
  
  contactListener.PreSolve = function (contact, manifold) {
    var fixA = contact.GetFixtureA();
    var fixB = contact.GetFixtureB();

    // slow down paddle
    if(fixA.GetUserData() === PADDLE_STOPPER){
//      fixB.GetBody().     
    } 
  };
  contactListener.BeginContact = function (contact) {
    var fixA = contact.GetFixtureA();
    var fixB = contact.GetFixtureB();
    // ball score callback
    if(fixA === that._leftWall || fixB === that._leftWall){
      that._ballScored(Physics.playerType.RIGHT);
    }
    if(fixA === that._rightWall || fixB === that._rightWall){
      that._ballScored(Physics.playerType.LEFT);
    }
  };
  this._world.SetContactListener(contactListener);
};

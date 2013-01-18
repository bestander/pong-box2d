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

/**
 * Initialize physics environment
 * @param width field width
 * @param height field height
 * @param ballRadius ball game radius
 * @constructor
 */
function Physics (width, height, ballRadius) {
  this._height = height;
  this._width = width;
  this._ballRadius = ballRadius || 0.2;
  this._world = null;
  this._ballScored = function  () {};
  this._init();
}

/**
 * player types enum
 * @type {{LEFT: string, RIGHT: string}}
 */
Physics.playerType = {
  LEFT: "left",
  RIGHT: "right"
};

module.exports = Physics;

/**
 * add paddle to game
 * @param playerType [Physics.playerType] type
 * @param size [{width, height}] paddle dimensions
 */
Physics.prototype.addPaddle = function (playerType, size) {
  var fixDef = new b2FixtureDef;
  fixDef.density = 5.0;
  fixDef.friction = 1;
  fixDef.restitution = 1.0;
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.Set(0, this._height / 2);
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(size.width / 2, size.height / 2);
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

Physics.prototype.removePaddle = function (playerType) {
  // TODO
};

Physics.prototype._jointPaddleToWall = function (paddleFixture, wallFixture, distanceFromWall) {
  var jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
  jointDef.bodyA = paddleFixture.GetBody();
  jointDef.bodyB = wallFixture.GetBody();
  jointDef.collideConnected = false;
  jointDef.localAxisA.Set(0.0, 1.0);
  jointDef.localAnchorA.Set(distanceFromWall, 0);
  jointDef.enableMotor = true;
  jointDef.maxMotorForce = 2;
  this._world.CreateJoint(jointDef);
};

/**
 * Change position and speed of the ball
 * @param position [{x, y}]
 * @param speed [Box2D.Common.Math.b2Vec2]
 */
Physics.prototype.positionBall = function (position, speed) {
  this._ball.GetBody().SetPosition(position);
  this._ball.GetBody().SetLinearVelocity(speed);

};

/**
 * iteration of physics iteration
 * @param period [Number] in seconds
 * @param accuracy [Number] accuracy of collisions and speeds
 */
Physics.prototype.tick = function (period, accuracy) {
  this._world.Step(
    period   //frame-rate
    ,  accuracy       //velocity iterations
    ,  accuracy       //position iterations
  );
  this._world.ClearForces();
};

/**
 * Get positions of game objects
 * @return {{ball_pos: {x, y}, paddles: Array}}
 */
Physics.prototype.getBallAndPaddlePositions = function () {
  return {
    ball_pos: this._ball.GetBody().GetPosition(),
    paddles: [this._leftPaddle.GetBody().GetPosition(), this._rightPaddle.GetBody().GetPosition()]
  };  
};

/**
 * push paddle
 * @param player [Physics.playerType]
 * @param direction [Box2D.Common.Math.b2Vec2]
 */
Physics.prototype.giveImpulseToPaddle = function (player, direction) {
  var paddle = player === Physics.playerType.LEFT ? this._leftPaddle : this._rightPaddle;
  paddle.GetBody().ApplyForce(direction, paddle.GetBody().GetWorldCenter());
};

/**
 * Register callback for ball scored event
 * @param callback [function (Physics.playerType)]
 */
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
  fixDef.shape.SetAsEdge(new b2Vec2( 0, 0), new b2Vec2(this._width, 0) );
  
  this._floor = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

  // ceiling
  bodyDef.position.Set(0, 0);
  this._ceiling = this._world.CreateBody(bodyDef).CreateFixture(fixDef);

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
    var fixA = contact.GetFixtureA();
    var fixB = contact.GetFixtureB();
    // ball score callback
    if(containsAll([fixA, fixB], [that._leftWall, that._ball])){
      that._ballScored(Physics.playerType.RIGHT);
    }
    if(containsAll([fixA, fixB], [that._rightWall, that._ball])){
      that._ballScored(Physics.playerType.LEFT);
    }
  };
  this._world.SetContactListener(contactListener);
};

/**
 * NON-IE
 * @param array1 array 1
 * @param array2 array 2
 * @return {boolean} if array1 contains all members of array2 
 */
function containsAll (array1, array2) {
  return array1.every(function (v) {
    return array2.indexOf(v) !== -1;
  });
}

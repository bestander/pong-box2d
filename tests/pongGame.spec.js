/**
 * Unit tests for the game.
 * Should be run with jasmine-node on server.
 * Client side testing will be supported in the next releases.
 * 
 * To execute run 'jasmine-node --verbose test' from project root
 */

"use strict";

var mockery = require('mockery');
var _ = require('lodash');


describe('Pong Game', function () {
  
  var game;
  var physicsMock;
  
  beforeEach(function () {
    var PongGame;
    
    mockery.enable();
    mockery.registerAllowable('../pongGame.js');
    mockery.registerMock('events', {
      EventEmitter: function () {
        return jasmine.createSpyObj('EventEmitter', ['emit', 'on']);
      }
    });
    PongGame = require('../pongGame.js');

    physicsMock = jasmine.createSpyObj('physicsMock', ['addPaddle', 'removePaddle', 'positionBall', 'getBallAndPaddlePositions',
      'giveImpulseToPaddle', 'onBallScored', 'tick']);

    game = new PongGame(physicsMock);

  });
  
  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
  });


  describe('should have joinPlayer function', function () {
    it("that returns a unique player id", function () {
      var id = game.joinPlayer();
      var id2 = game.joinPlayer();
      expect(id).not.toEqual(id2);
    });

    it("that does not allow more than 2 players at the same time", function () {
      var playerId;
      playerId = game.joinPlayer();
      game.joinPlayer();
      var throwing = function () {
        game.joinPlayer();
      };
      expect(throwing).toThrow(new Error("Maximum players limit has been reached"));
      
      game.quitPlayer(playerId);
      // ok
      game.joinPlayer();
    });

    it("that makes game emit PLAYER_JOINED event with unique player id", function () {
      var player1, player2;

      function getJoinEvents () {
        return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_JOINED'
        });
      }

      expect(getJoinEvents().length).toBe(0);
      player1 = game.joinPlayer();
      expect(getJoinEvents().length).toBe(1);
      expect(_.last(getJoinEvents()).args[1]).toBe(player1);

      player2 = game.joinPlayer();

      expect(getJoinEvents().length).toBe(2);
      expect(_.last(getJoinEvents()).args[1]).toBe(player2);
    });
  });

  describe('should have function handlePlayerCommand', function () {
    it('that throws an error for unsupported commands', function () {
      var player1;

      player1 = game.joinPlayer();
      game.handlePlayerCommand(player1, "READY");
      var throwing = function () {
        game.handlePlayerCommand(player1, "SHMREADY");
      };
      expect(throwing).toThrow(new Error("Unknown command SHMREADY"));

    });

    describe('that handles READY command:', function () {
      it('when all players send READY the ball is placed in the field and is given an impulse', function () {
        var player1, player2;

        jasmine.Clock.useMock();

        player1 = game.joinPlayer();
        player2 = game.joinPlayer();

        jasmine.Clock.tick(2000);
        game.getObjectPositions()

        // todo advance time

        // todo no ball moved

        // todo p1 ready

        // todo p2 ready

        // todo advance time

        // todo ball moving


      });
    });
  });

  

  describe('should have playerQuit command', function () {
    it('that throws an error if an unknown playerID was passed as argument ', function () {
      
    });

    it('that removes the ball if it was present on the field', function () {
      
    });

    it('that makes game emit PLAYER_QUIT event with the playerId as argument', function () {
      
    });
  });

  describe('should have function', function () {
    it('getObjectPositions that passes the request to physics engine', function () {
      var initialPosition;
      var player1;
      var game = new PongGame();
      var objects;

      jasmine.Clock.useMock();
      objects = game.getObjectPositions();
      expect(objects.BALL).toBeDefined();
      initialPosition = objects.BALL;
      expect(initialPosition.x).toBeDefined();
      expect(initialPosition.y).toBeDefined();

      player1 = game.joinPlayer();

      expect(initialPosition.x).toBeCloseTo(game.getObjectPositions().BALL.x, 12);
      expect(initialPosition.y).toBeCloseTo(game.getObjectPositions().BALL.y, 12);
      game.handlePlayerCommand(player1, 'READY');

      jasmine.Clock.tick(2000);
      expect(initialPosition.x).not.toBeCloseTo(game.getObjectPositions().BALL.x, 12);
      expect(initialPosition.y).not.toBeCloseTo(game.getObjectPositions().BALL.y, 12);
    });

    it('getParametersAndState that returns game field size and joined players', function () {
      var game = new PongGame(500, 600, 20);
      var params = game.getParametersAndState();
      expect(params).toBeDefined();
      expect(params.scale).toBe(20);
      expect(params.width).toBe(500);
      expect(params.height).toBe(600);

    });

    it('getEventsEmitter that returns event emitter object', function () {
      expect(game.getEventsEmitter()).toBeDefined();
    });


  });


  
});
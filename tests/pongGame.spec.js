/**
 * Unit tests for the game.
 * Should be run with jasmine-node on server.
 * Client side testing will be supported in the next releases.
 * 
 * To execute run 'jasmine-node --verbose test' from project root
 */
/*global it:true describe:true expect:true spyOn:true beforeEach:true afterEach:true jasmine:true runs waitsFor*/

'use strict';

var mockery = require('mockery');
var _ = require('lodash');
var jns = require('jasmine-node-sugar');

describe('Pong Game', function () {
  
  var game;
  var physicsMock;
  
  beforeEach(function () {
    var PongGame;

    jns.addJasmineMatchers(this);
    
    mockery.enable();
    mockery.registerAllowable('../pongGame.js');
    mockery.registerAllowable('es6-shim');
    mockery.registerMock('events', {
      EventEmitter: function () {
        return jasmine.createSpyObj('EventEmitter', ['emit', 'on']);
      }
    });
    PongGame = require('../pongGame.js');

    physicsMock = jasmine.createSpyObj('physicsMock', ['addPaddle', 'removePaddle', 'positionBall', 'getBallAndPaddlePositions',
      'giveImpulseToPaddle', 'onBallScored', 'tick']);
    physicsMock._width = 20;
    physicsMock._height = 20;
    physicsMock.playerType = {
      LEFT: "left",
      RIGHT: "right"
    };

    game = new PongGame(physicsMock);

  });
  
  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
  });


  describe('should have joinPlayer function', function () {
    it('that expects an argument "player" object with unique id as property', function () {
      var player = {
      };
      var throwing = function () {
        game.joinPlayer(player);
      };
      
      expect(throwing).toThrow(new Error('Argument must have id property'));
      
      player.id = 123;
      throwing();

      expect(throwing).toThrow(new Error('Player with this id has already joined'));

      player.id = 124;
      throwing();
    });

    it('that does not allow more than 2 players at the same time', function () {
      var player = {
        id: 123
      };
      game.joinPlayer(player);
      player.id = 124;
      game.joinPlayer(player);

      player.id = 125;
      var throwing = function () {
        game.joinPlayer(player);
      };
      expect(throwing).toThrow(new Error('Maximum players limit has been reached'));
      
      game.quitPlayer(124);
      // ok
      game.joinPlayer(player);
    });

    it('that makes game emit PLAYER_JOINED event with player object as argument', function () {
      var player1, player2;
      
      player1 = {
        id: 123
      };

      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_JOINED').length).toBe(0);
      game.joinPlayer(player1);
      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_JOINED').length).toBe(1);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_JOINED')).args[1].object).toBe(player1);

      player2 = {
        id: 124
      };
      game.joinPlayer(player2);

      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_JOINED').length).toBe(2);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_JOINED')).args[1].object).toBe(player2);
    });

    it('that adds a paddle to physics engine', function () {
      var player;
      var player2;
      
      player = {
        id : 123
      };
      expect(physicsMock.addPaddle).not.toHaveBeenCalled();
      game.joinPlayer(player);
      expect(physicsMock.addPaddle.mostRecentCall.args[0]).toBe(physicsMock.playerType.RIGHT);
      player2 = {
        id : 124
      };
      game.joinPlayer(player2);
      expect(physicsMock.addPaddle.mostRecentCall.args[0]).toBe(physicsMock.playerType.LEFT);
    });
  });

  describe('should have handlePlayerCommand function', function () {
    it('that throws an error for unsupported commands', function () {
      var player1 = {
        id: 123
      };

      game.joinPlayer(player1);
      game.handlePlayerCommand(player1.id, "READY");
      var throwing = function () {
        game.handlePlayerCommand(player1.id, "SHMREADY");
      };
      expect(throwing).toThrow(new Error("Unknown command SHMREADY"));

    });

    it('that throws error if comes from player that is not present in the game', function () {
      var throwing = function () {
        game.handlePlayerCommand(123, "READY");
      };
      expect(throwing).toThrow(new Error("Unknown player " + 123));
    });

    describe('that handles READY command:', function () {
      it('when all players send READY the ball is placed in the field and is given an impulse and game periodically calls tick function of physics engine', function () {
        var player1, player2;

        expect(physicsMock.positionBall.calls.length).toBe(0);
        player1 = {
          id: 123
        };
        game.joinPlayer(player1);

        expect(physicsMock.positionBall.calls.length).toBe(0);
        player2 = {
          id: 122
        };
        game.joinPlayer(player2);

        expect(physicsMock.positionBall.calls.length).toBe(0);
        game.handlePlayerCommand(player1.id, "READY");
        expect(physicsMock.positionBall.calls.length).toBe(0);

        // same player
        game.handlePlayerCommand(player1.id, "READY");
        expect(physicsMock.positionBall.calls.length).toBe(0);

        game.handlePlayerCommand(player2.id, "READY");
        expect(physicsMock.positionBall.calls.length).toBe(1);
      });

      it('when all players send READY game periodically calls tick function of physics engine', function () {
        var tickDuration;
        var player1, player2;

        jasmine.Clock.useMock();

        player1 = {
          id: 123
        };
        game.joinPlayer(player1);

        player2 = {
          id: 122
        };
        game.joinPlayer(player2);
        game.handlePlayerCommand(player1.id, "READY");

        // same player
        game.handlePlayerCommand(player1.id, "READY");
        expect(physicsMock.tick.calls.length).toBe(0);

        game.handlePlayerCommand(player2.id, "READY");
        expect(physicsMock.positionBall.calls.length).toBe(1);

        // starting ticking
        tickDuration = 1000 / 60;
        expect(physicsMock.tick.calls.length).toBe(1);
        jasmine.Clock.tick(tickDuration);
        expect(physicsMock.tick.calls.length).toBe(2);
        
        jasmine.Clock.tick(tickDuration);
        expect(physicsMock.tick.calls.length).toBe(3);
      });

      it('when all players send READY game emits MATCH_STARTED event', function () {
        var player1;
        var player2;
        player1 = {
          id:123
        };
        game.joinPlayer(player1);
        player2 = {
          id:122
        };
        game.joinPlayer(player2);
        game.handlePlayerCommand(player1.id, "READY");
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'MATCH_STARTED').length).toBe(0);
        game.handlePlayerCommand(player2.id, "READY");
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'MATCH_STARTED').length).toBe(1);
      });

      it('when player quits and joins again READY state is reset', function () {
        var player1, player2;

        player1 = {
          id: 123
        };
        player2 = {
          id: 122
        };
        game.joinPlayer(player1);
        game.joinPlayer(player2);
        game.handlePlayerCommand(player1.id, "READY");
        game.quitPlayer(player1.id);
        game.joinPlayer(player1);

        game.handlePlayerCommand(player2.id, "READY");
        expect(physicsMock.tick.calls.length).toBe(0);

        game.handlePlayerCommand(player1.id, "READY");
        expect(physicsMock.tick.calls.length).toBe(1);
      });

      it('and emits PLAYER_READY event with player id', function () {
        var player2;
        player2 = {
          id : 122
        };
        game.joinPlayer(player2);
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY').length).toBe(0);
        
        game.handlePlayerCommand(player2.id, 'READY');
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY').length).toBe(1);
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY')[0].args[1]).toBe(player2.id);
      });

      it('and ignores players READY command if he is already READY', function () {
        var player1;
        player1 = {
          id: 123
        };
        game.joinPlayer(player1);
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY').length).toBe(0);
        game.handlePlayerCommand(player1.id, "READY");
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY').length).toBe(1);
        game.handlePlayerCommand(player1.id, "READY");
        expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_READY').length).toBe(1);
      });

    });

    describe('that handles MOVE_PADDLE command', function () {
      it('and calls game physics giveImpulseToPaddle function', function () {
        var player1 = {
          id: 123
        };
        game.joinPlayer(player1);
        game.handlePlayerCommand(player1.id, 'MOVE_PADDLE', game.paddleMoveDirection.UP);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[0]).toBe(physicsMock.playerType.RIGHT);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[1].x).toBe(0);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[1].y).toBeLessThan(0);
        game.handlePlayerCommand(player1.id, 'MOVE_PADDLE', game.paddleMoveDirection.DOWN);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[0]).toBe(physicsMock.playerType.RIGHT);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[1].x).toBe(0);
        expect(physicsMock.giveImpulseToPaddle.mostRecentCall.args[1].y).toBeGreaterThan(0);
      });
    });
  });

  

  describe('should have playerQuit function', function () {
    it('that throws an error if an unknown playerID was passed as argument ', function () {
      var throwing = function () {
        game.quitPlayer(123);
      };
      expect(throwing).toThrow(new Error('No such player present'));
    });

    it('that stops the ball if it was present on the field and stops ticking physics engine and emits MATCH_STOPPED event', function () {
      var currentTime;
      var tickDuration;
      var player1, player2;

      jasmine.Clock.useMock();

      player1 = {
        id: 123
      };
      player2 = {
        id: 122
      };
      game.joinPlayer(player1);
      game.joinPlayer(player2);
      game.handlePlayerCommand(player1.id, "READY");
      game.handlePlayerCommand(player2.id, "READY");
      expect(physicsMock.positionBall.calls.length).toBe(1);

      tickDuration = 1000 / 60;
      currentTime = Date.now();
      spyOn(Date, 'now').andReturn(currentTime);

      currentTime += tickDuration;
      Date.now.andReturn(currentTime);
      jasmine.Clock.tick(tickDuration);
      expect(physicsMock.tick.calls.length).toBe(2);

      game.quitPlayer(player1.id);
      expect(physicsMock.positionBall.calls.length).toBe(2);
      expect(physicsMock.positionBall.mostRecentCall.args[1]).toEqual({x:0, y:0});

      // stopped ticking
      currentTime += tickDuration;
      Date.now.andReturn(currentTime);
      jasmine.Clock.tick(tickDuration);
      expect(physicsMock.tick.calls.length).toBe(2);

      currentTime += tickDuration * 5;
      Date.now.andReturn(currentTime);
      jasmine.Clock.tick(tickDuration * 5);
      expect(physicsMock.tick.mostRecentCall.args[0]).toBeCloseTo(tickDuration / 1000, -1);
      expect(physicsMock.tick.calls.length).toBe(2);

      // join again and tick should resume
      game.joinPlayer(player1);
      game.handlePlayerCommand(player1.id, "READY");
      game.handlePlayerCommand(player2.id, "READY");

      // period for tick should be within tick duration
      expect(physicsMock.tick.calls.length).toBe(3);
      expect(physicsMock.tick.mostRecentCall.args[0]).toBeCloseTo(0, -1);

      currentTime += tickDuration;
      Date.now.andReturn(currentTime);
      jasmine.Clock.tick(tickDuration);
      expect(physicsMock.tick.calls.length).toBe(4);
      expect(physicsMock.tick.mostRecentCall.args[0]).toBeCloseTo(tickDuration / 1000, -1);
    });

    it('that makes game emit MATCH_STOPPED if it was started', function () {
      var player1, player2;
      player1 = {
        id: 123
      };
      player2 = {
        id: 122
      };
      game.joinPlayer(player1);
      game.joinPlayer(player2);
      game.quitPlayer(player2.id);
      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'MATCH_STOPPED').length).toBe(0);

      game.joinPlayer(player2);
      game.handlePlayerCommand(player1.id, "READY");
      game.handlePlayerCommand(player2.id, "READY");
      game.quitPlayer(player2.id);
      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'MATCH_STOPPED').length).toBe(1);
    });

    it('that makes game emit PLAYER_QUIT event with the playerId as argument', function () {
      var player1;

      player1 = {
        id: 123
      };
      game.joinPlayer(player1);
      game.quitPlayer(player1.id);

      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_QUIT')).args[1]).toBe(player1.id);
    });

    it('that removes paddle from physics engine and when another player joins he occupies a vacant place', function () {
      var player;
      var player2;

      player = {
        id : 123
      };
      expect(physicsMock.addPaddle).not.toHaveBeenCalled();
      
      game.joinPlayer(player);
      expect(physicsMock.addPaddle).toHaveBeenCalled();
      expect(physicsMock.addPaddle.mostRecentCall.args[0]).toEqual(physicsMock.playerType.RIGHT);
      player2 = {
        id : 124
      };
      game.joinPlayer(player2);
      expect(physicsMock.addPaddle.mostRecentCall.args[0]).toEqual(physicsMock.playerType.LEFT);

      expect(physicsMock.removePaddle).not.toHaveBeenCalled();
      game.quitPlayer(player2.id);
      expect(physicsMock.removePaddle).toHaveBeenCalledWith(physicsMock.playerType.LEFT);

      game.joinPlayer(player2);
      expect(physicsMock.addPaddle.mostRecentCall.args[0]).toEqual(physicsMock.playerType.LEFT);
    });
  });

  describe('should have function', function () {
    it('getBallAndPaddlePositions that passes the request to physics engine', function () {
      // this is na integration test, no logic to test
      expect(game.getBallAndPaddlePositions).toBeDefined();
    });

    it('getParametersAndState that returns game field size and joined players', function () {
      var params;
      var player1, player2;
      
      params = game.getParametersAndState();
      
      expect(params.field.width).toBeDefined();
      expect(params.field.height).toBeDefined();
      expect(params.players).toEqual([]);

      player1 = {
        id: 123
      };
      player2 = {
        id: 122
      };
      game.joinPlayer(player1);
      params = game.getParametersAndState();
      expect(params.players.length).toEqual(1);
      expect(params.players[0].object).toEqual(player1);

      game.joinPlayer(player2);
      params = game.getParametersAndState();
      expect(params.players.length).toEqual(2);
      expect(params.players[0].object).toEqual(player1);
      expect(params.players[1].object).toEqual(player2);

      game.quitPlayer(player2.id);
      params = game.getParametersAndState();
      expect(params.players.length).toEqual(1);
      expect(params.players[0].object).toEqual(player1);
    });

    it('getEventsEmitter that returns event emitter object', function () {
      expect(game.getEventsEmitter()).toBeDefined();
    });


  });

  describe('should hook to physics engine SCORE events and', function () {

    it('generate BALL scored event with current game score', function () {
      var player2;
      var player1;
      var scoreCallback;

      player1 = {
        id : 123
      };
      player2 = {
        id : 122
      };
      game.joinPlayer(player1);
      game.joinPlayer(player2);

      expect(physicsMock.onBallScored).toHaveBeenCalled();

      scoreCallback = physicsMock.onBallScored.mostRecentCall.args[0];
      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED').length).toBe(0);
      
      scoreCallback(physicsMock.playerType.LEFT);
      expect(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED').length).toBe(1);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 1}, {id: 123, score: 0}]);

      scoreCallback(physicsMock.playerType.LEFT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 2}, {id: 123, score: 0}]);

      scoreCallback(physicsMock.playerType.RIGHT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 2}, {id: 123, score: 1}]);

    });

    it('reset count game score every time a player joins', function () {
      var player2;
      var player1;
      var scoreCallback;

      player1 = {
        id : 123
      };
      player2 = {
        id : 122
      };
      game.joinPlayer(player1);
      game.joinPlayer(player2);

      scoreCallback = physicsMock.onBallScored.mostRecentCall.args[0];

      scoreCallback(physicsMock.playerType.LEFT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 1}, {id: 123, score: 0}]);

      scoreCallback(physicsMock.playerType.LEFT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 2}, {id: 123, score: 0}]);

      scoreCallback(physicsMock.playerType.RIGHT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 2}, {id: 123, score: 1}]);

      game.quitPlayer(player2.id);
      game.joinPlayer(player2);

      scoreCallback(physicsMock.playerType.RIGHT);
      expect(_.last(jns.getCallsFilteredByFirstArg(game.getEventsEmitter().emit.calls, 'PLAYER_SCORE_CHANGED')).args[1]).toContainAll([{id: 122, score: 0}, {id: 123, score: 1}]);
    });
  });


  
});
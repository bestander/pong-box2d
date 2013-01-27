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

// timeout hack for Node.js
jasmine.getGlobal().setTimeout = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setTimeout.apply) {
    return jasmine.Clock.installed.setTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setTimeout(funcToCall, millis);
  }
};


describe('Pong Game', function () {
  
  var game;
  var physicsMock;
  
  beforeEach(function () {
    var PongGame;
    
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

      function getJoinEvents () {
        return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_JOINED'
        });
      }
      
      player1 = {
        id: 123
      };

      expect(getJoinEvents().length).toBe(0);
      game.joinPlayer(player1);
      expect(getJoinEvents().length).toBe(1);
      expect(_.last(getJoinEvents()).args[1]).toBe(player1);

      player2 = {
        id: 124
      };
      game.joinPlayer(player2);

      expect(getJoinEvents().length).toBe(2);
      expect(_.last(getJoinEvents()).args[1]).toBe(player2);
    });

    it('that adds a paddle to physics engine', function () {
      expect(true).toBeFalsy();
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
        var tickDuration = 1000 / 60;
        expect(physicsMock.tick.calls.length).toBe(1);
        jasmine.Clock.tick(tickDuration);
        expect(physicsMock.tick.calls.length).toBe(2);
        
        jasmine.Clock.tick(tickDuration);
        expect(physicsMock.tick.calls.length).toBe(3);
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

        function getJoinEvents () {
          return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
            return elem.args[0] === 'PLAYER_READY'
          });
        }
        player2 = {
          id : 122
        };
        game.joinPlayer(player2);
        expect(getJoinEvents().length).toBe(0);
        
        game.handlePlayerCommand(player2.id, 'READY');
        expect(getJoinEvents().length).toBe(1);
        expect(getJoinEvents()[0].args[1]).toBe(player2.id);
      });

      it('and ignores players READY command if he is already READY', function () {
        var player1;

        function getReadyEvents () {
          return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
            return elem.args[0] === 'PLAYER_READY'
          });
        }


        player1 = {
          id: 123
        };
        game.joinPlayer(player1);
        expect(getReadyEvents().length).toBe(0);
        game.handlePlayerCommand(player1.id, "READY");
        expect(getReadyEvents().length).toBe(1);
        game.handlePlayerCommand(player1.id, "READY");
        expect(getReadyEvents().length).toBe(1);
      });

    });
  });

  

  describe('should have playerQuit function', function () {
    it('that throws an error if an unknown playerID was passed as argument ', function () {
      var throwing = function () {
        game.quitPlayer(123);
      };
      expect(throwing).toThrow(new Error('No such player present'))
    });

    it('that stops the ball if it was present on the field and stops ticking physics engine', function () {
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
      game.handlePlayerCommand(player2.id, "READY");
      expect(physicsMock.positionBall.calls.length).toBe(1);
      game.quitPlayer(player1.id);
      expect(physicsMock.positionBall.calls.length).toBe(2);
      expect(physicsMock.positionBall.mostRecentCall.args[1]).toEqual({x:0, y:0});

      // stopped ticking
      expect(true).toBeFalsy();
      
      // TODO restart ticking, this one is tricky as we don't want restart to be expenisve, i.e. don't tick for 5 minutes of waiting

    });

    it('that makes game emit PLAYER_QUIT event with the playerId as argument', function () {
      var player1;

      player1 = {
        id: 123
      };
      game.joinPlayer(player1);
      game.quitPlayer(player1.id);

      function getQuitEvents () {
        return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_QUIT'
        });
      }
      
      expect(_.last(getQuitEvents()).args[1]).toBe(player1.id);
    });

    it('that resets game score for all players', function () {
      expect(true).toBeFalsy();

    });

    it('that removes paddle from physics engine', function () {
      expect(true).toBeFalsy();
    });
  });

  describe('should have function', function () {
    it('getObjectPositions that passes the request to physics engine', function () {
      // this is na integration test, no logic to test
      expect(game.getObjectPositions).toBeDefined();
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
      expect(params.players).toEqual([player1]);

      game.joinPlayer(player2);
      params = game.getParametersAndState();
      expect(params.players).toEqual([player1, player2]);

      game.quitPlayer(player2.id);
      params = game.getParametersAndState();
      expect(params.players).toEqual([player1]);
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

      function getScoreEvents () {
        return _.filter(game.getEventsEmitter().emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_SCORE_CHANGED'
        });
      }

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
      expect(getScoreEvents().length).toBe(0);
      
      scoreCallback(physicsMock.playerType.LEFT);
      expect(getScoreEvents().length).toBe(1);
      expect(_.last(getScoreEvents()).args[1]).toBe({123: 1, 122: 0});

      scoreCallback(physicsMock.playerType.LEFT);
      expect(_.last(getScoreEvents()).args[1]).toBe({123: 2, 122: 0});

      scoreCallback(physicsMock.playerType.RIGHT);
      expect(_.last(getScoreEvents()).args[1]).toBe({123: 2, 122: 1});

    });
  });


  
});
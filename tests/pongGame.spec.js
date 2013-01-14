/**
 * Unit tests for the game.
 * Should be run with jasmine-node on server.
 * Client side testing will be supported in the next releases.
 * 
 * To execute run 'jasmine-node --verbose test' from project root
 */

"use strict";

var PongGame = require('../index.js');

describe('Pong Game', function () {

  it("should expose game emitter object after creation", function () {
    var game = new PongGame();
    expect(game.getEventsEmitter()).toBeDefined();
  });

  it("should return a unique player id on join method call", function () {
    var game = new PongGame();
    var id = game.joinPlayer();
    var id2 = game.joinPlayer();
    expect(id).not.toEqual(id2);
  });

  it("should not allow more than 2 players to join", function () {
    var game = new PongGame();
    game.joinPlayer();
    game.joinPlayer();
    var throwing = function () {
      game.joinPlayer();
    };
    expect(throwing).toThrow(new Error("Maximum players limit has been reached"));
  });

  it("should emit event 'player joined' when player a joins", function () {
    var game = new PongGame();
    var eventPlayerId = null;
    var returnedPlayerId = null;
    game.getEventsEmitter().on("PLAYER_JOINED", function (data) {
      eventPlayerId = data;
    });
    runs(function () {
      returnedPlayerId = game.joinPlayer();
    });
    waitsFor(function () {
      return eventPlayerId != null;
    }, "Event should have been emitted", 100);
    runs(function () {
      expect(eventPlayerId).toEqual(returnedPlayerId);
    });
  });
  
  it("should accept player commands only after all players joined", function () {
    var game = new PongGame();
    var returnedPlayerId;
    
    returnedPlayerId = game.joinPlayer();
    game.handlePlayerCommand(returnedPlayerId, "READY");
    
  });

  it("should throw an error for unknown commands", function () {
    var game = new PongGame();
    var player1;

    player1 = game.joinPlayer();
    game.handlePlayerCommand(player1, "READY");
    var throwing = function () {
      game.handlePlayerCommand(player1, "SHMREADY");
    };
    expect(throwing).toThrow(new Error("Unknown command SHMREADY"));
    
  });

  it("should start a game once all players sent ready command", function () {
    var game = new PongGame();
    var player1;
    var gameStarted = false;

    player1 = game.joinPlayer();
    game.getEventsEmitter().on("GAME_STARTED", function () {
      gameStarted = true;
    });
    
    runs(function () {
      game.handlePlayerCommand(player1, "READY");
    });
    waitsFor(function () {
      return gameStarted; 
    }, "Game started event should have been emitted", 100);
    
  });


  xit("should emit 'player quit' when a player quits game", function () {
    expect(true).toBeFalsy();

  });

  xit("should emit 'game empty' event when last player quits", function () {
    expect(true).toBeFalsy();

  });

  xit("should emit 'game full' event when 2 players join", function () {
    expect(true).toBeFalsy();
    
  });

  it("should return current game object positions when requested", function () {
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
    game.handlePlayerCommand(player1, "READY");

    jasmine.Clock.tick(2000);
    expect(initialPosition.x).not.toBeCloseTo(game.getObjectPositions().BALL.x, 12);
    expect(initialPosition.y).not.toBeCloseTo(game.getObjectPositions().BALL.y, 12);
  });

  it("should return game parameters and state when requested", function () {
    var game = new PongGame(500, 600, 20);
    var params = game.getParametersAndState();
    expect(params).toBeDefined();
    expect(params.scale).toBe(20);
    expect(params.width).toBe(500);
    expect(params.height).toBe(600);

  });

  
});
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

  xit("should emit event 'player joined' when player a joins", function () {
    expect(true).toBeFalsy();
  });
  
  xit("should accept player commands only after all players joined", function () {
    expect(true).toBeFalsy();
    
  });

  xit("should start a game once all players sent ready command", function () {
    expect(false).toBeFalsy();
    
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

  
});
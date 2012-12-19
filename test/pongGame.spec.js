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
    expect(false).toBeFalsy();
    
  });

  it("should not allow more than 2 players to join", function () {
    expect(true).toBeFalsy();
    
  });

  it("should emit event 'player joined' when player a joins", function () {
    expect(true).toBeFalsy();

  });
  
  it("should accept player commands only after all players joined", function () {
    expect(true).toBeFalsy();
    
  });

  it("should start a game once all players sent ready command", function () {
    expect(false).toBeFalsy();
    
  });


  it("should emit 'player quit' when a player quits game", function () {
    expect(true).toBeFalsy();

  });

  it("should emit 'game empty' event when last player quits", function () {
    expect(true).toBeFalsy();

  });

  it("should emit 'game full' event when 2 players join", function () {
    expect(true).toBeFalsy();
    
  });

  
});
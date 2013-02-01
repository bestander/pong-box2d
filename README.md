pong-box2d
==========

![screenshot](https://raw.github.com/bestander/pong-box2d/master/demo/screenshot.png)

A JavaScript Pong engine for Node.js and Browsers.  
This repo has two parts:
- A physics engine, `box2dPhysics.js` based on [box2d](http://code.google.com/p/box2dweb/) engine
- A game engine, `pongGame.js` which wraps the physics engine and adds game logic such as player and score management

This package is designed to be generic and could be used both for Hot Seat games in a browser or as a logic core for client-server multiplayer application.    
This package does not address any network or rendering features and is focused only on the game.  

See [Pong MMO game documentation](https://github.com/bestander/pong-mmo-www/tree/master/documentation) for design docs of a real client-server application that utilizes this package.

### Contents

- `./index.js` - main script and wrapper to everything, methods:
  - `create(width, height)` - method that creates a PongGame object with default Physics engine
- `./pongGame.js` - exposes PongGame, game logic container, properties:
  - `constructor(physicsEngine)`
  - `getBallAndPaddlePositions()` - returns current locations of paddles and the ball
  - `getParametersAndState()` - returns game field size and players who joined the game
  - `getEventsEmitter()` - returns [EventEmitter](https://raw.github.com/component/emitter) that emits game events like:
      - `PLAYER_SCORE_CHANGED` - when score changes
      - `PLAYER_JOINED` - when a player joins the game
      - `PLAYER_QUIT` - when a player disconnects
      - `PLAYER_READY` - when a player sent command `READY`
      - `MATCH_STARTED` - when a match has started after all players are READY and ball started moving
      - `MATCH_STOPPED` - when a match has stopped after a player quites and if match was started before
  - `joinPlayer(playerObj)` - join game, where playerObj is any object that has unique `id` property 
  - `quitPlayer(playerId)` - quit game, playerId is the same `id` property from `joinPlayer` function
  - `handlePlayerCommand(playerId, command, data)` - handle command from player where `command` argument can be:
      - `READY` - indicates that the player is ready for a match, once all players are ready the ball will start moving
      - `MOVE_PADDLE` - move paddle in direction PongGame.paddleMoveDirection.UP or PongGame.paddleMoveDirection.DOWN
- `./physics/box2dPhysics.js` - physics engine that registers bounces, properties:
  - `constructor(width, height, ballRadius)`
  - `addPaddle(playerType, size)` - add paddle to field, playerType is Physics.playerType.LEFT/Physics.playerType.RIGHT, size is Object{width, height}
  - `removePaddle(playerType)` - remove paddle
  - `positionBall(position, speed)` - place a ball at `position` Object{x, y} and give it an impulse `speed` Object{x, y}
  - `tick(period, accuracy)` - perform physics simulation, `period` is amount of seconds to simulate, `accuracy` is number of iterations for algorithms
  - `getBallAndPaddlePositions()` - returns current positions {{ball: {x, y}, paddles: Array}}
  - `giveImpulseToPaddle(playerType, direction)` - move paddle up or down, `direction` is Object{x, y}
  - `onBallScored(callback)` - register `callback` event for situation when a ball touches left or right wall `playerType` is passed to callback, while score must be kept in game logic
- `./tests/` - Jasmine unit tests
- `./demo/` - html files for integration testing and debuggin in browser
  - `physics-engine-standalone-demo.html` - a simple HTML page with box2d `DebugDraw`, very convenient to debug the physics engine in isolation
  - `pong-game-integration-demo.html` - a demo/integration test of the whole package with all available functions and callbacks
- `Makefile` - make file with some common tasks

### Browser support

The game works in Chrome Version 24 but should work in older browsers as well.  
The code uses EcmaScript 5 map/reduce/forEach functions, you may want to shim them if you want to run it in IE8.  
EcmaScript 6 shim is used for Map functionality as well.

### Compilation for running demos in Browsers

To compile client version run: 
- `make components` to download all dependencies
- `make build` to build a component


### Running tests

Use [jasmine-node](https://github.com/mhevery/jasmine-node) for unit tests execution.  
Run `make test` to execute tests in console.

License MIT
--------
Copyright 2012 Konstantin Raev (bestander@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

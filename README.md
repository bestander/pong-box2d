pong-box2d
==========

![screenshot](https://raw.github.com/bestander/pong-box2d/master/demo/screenshot.png)

CommonJS box2d pong engine for client and server
Is distributed both as an npm package and a [component](https://github.com/component/component/) element.

See [documentation](https://github.com/bestander/pong-mmo-www/tree/master/documentation) for details about goals, design and usage.

### Motivation

The engine was supposed to run on a Node server originally.  
But because I use [component](https://github.com/component/component/) module manager I can use the same script on client side.  
Nay, client side execution using `demo/debug.html` makes development much easier and faster.

### Contents

- `index.js` contains game logic and API
- `box2dPhysics.js` contains implementation of physical part using box2d engine, it is not intended to be exposed
- `tests` folder contains test scripts
- `demo/debug.html` open this file in a browser to see client side demo. Build the module before running it.

### Compilation

Run: 
- `make components` to download all dependencies
- `make build` to build a component


### Running tests

Use [jasmine-node](https://github.com/mhevery/jasmine-node) for unit tests execution.  
Run `make test` to execute tests in console.

License
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

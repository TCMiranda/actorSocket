# ActorEmitter.js

_Actoremitter.js_ is lightweight, independent, event emitter library which provides the
[observer pattern](http://en.wikipedia.org/wiki/Observer_pattern) to javascript objects.
It works on node.js and browser. It is a single .js file.

## Why

This package is meant to be single instance, lightweight, async and scope-full event emitter, in order to provide communication between objects in different scopes.
Binding on an event, maintains the worker scope, so they can continue to process the call in a non blocking way, with the next() method.

## How to Use It

Actor emitter is single instance, so it listens and emits the same events all across your app.

    var emitter = require('actor-emitter');

Check this websocket implementation with actor-emitter!

    var WebSocketClient = require('websocket').client,
        emitter = require('actor-emitter'),
        client = new WebSocketClient();

    var _connection = null;

    var _wsSend = function (data) {

        try {

    	    _connection.sendUTF(data);
    	    console.log('-> ', data);

        } catch (err) {

    	    console.error(err);
        }
    }

    var wsSend = function (data) {

        data = JSON.stringify(data);

        // declare next function call, with scope and non blocking
        emitter.next(_wsSend, data);
    };

    var wsOnMessage = function (data) {

        var key = data.header + ':' + data.action + (data.__code__ ? ':' + data.__code__ : '');

        emitter.trigger(key, data);
    };

    emitter.bind('socket:send', wsSend);

    client.on('connectFailed', function(error) {

        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {

        console.log('WebSocket Client Connected');

        connection.on('error', function(error) {

    	    console.log("Connection Error: " + error.toString());
        });

        connection.on('close', function() {

    	    console.log('Connection Closed');
        });

        connection.on('message', function(message) {

    	    if (message.type === 'utf8') {

    	        console.log('<- ',  message.utf8Data);

    	        emitter.next(wsOnMessage, JSON.parse(message.utf8Data));
    	        emitter.trigger('socket:onmessage', JSON.parse(message.utf8Data));
    	    }
        });

        _connection = connection;

        emitter.trigger('socket:onopen', connection);
    });

    client.connect('ws://someserver:8888/');


Its all assync, non-block and easy

Then, a worker should be like:

    var emitter = require('actor-emitter'),
    uuid     = require('node-uuid');

    var worker = (function() {

        var _id;

        var onAuthenticationRequested = function (data) {

    	    _id = uuid();
    	    data._id = _id;
    	    data.appKey = 'myapp';

            // send authentication request!
    	    emitter.trigger('socket:send', data);
        };

        var requestUserPublicProfile = function () {

            var data = {
                header: 'myapp',
                action: 'user_get_public',
                nick: 'mynick'
            }

            emitter.trigger('socket.send', data);
        }

        emitter.bind('authentication:announce', onAuthenticationRequested);
        emitter.bind('authentication:announce:200', requestUserPublicProfile);
    }


That example outputs something like this, assuming your server requests an authentication when connected

    <-  {"action":"announce","header":"authentication"}
    ->  {"action":"announce","header":"authentication","_id":"77e5b21e-4494-481c-9591-621680bf0772","appKey":"myapp"}
    <-  {"action":"announce","header":"authentication","__code__":200}
    ->  {"header":"myapp","action":"user_get_public","nick":"mynick"}
    <-  ...

Thats it.

You need a single file "actoremitter.js".
Include it in a webpage via the usual script tag.

    <script src="actoremitter.js"></script>

To include it in a nodejs code isnt much harder

    var aEmitter = require('actor-emitter.js')

MIT license.
If you hit bugs, fill issues on github.
Feel free to fork, modify and have fun with it :)

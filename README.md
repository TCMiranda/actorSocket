# Actor Socket

_Actor-socket_ is lightweight, independent, async, event based, websocket interface library, built with the "Websocket" module;

## Why

This package is meant to be single instance, lightweight, async and scope-full, in order to provide communication between objects in different scopes.
Binding on an event, maintains the worker scope, so they can continue to process the call in a non blocking way, with the next() method.

## How to Use It

Actor Socket is single instance, so it listens and emits the same events all across your app.

    var emitter = require('actor-emitter'),
        uuid    = require('node-uuid');

    require('actor-socket')(emitter);

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

MIT license.
If you hit bugs, fill issues on github.
Feel free to fork, modify and have fun with it :)

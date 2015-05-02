# Actor Socket

_Actor-socket_ is lightweight, independent, async, event based, websocket client library, built with the "Websocket" module;

## Why

This package is meant to be single instance, lightweight, async and scope-full, in order to provide communication between objects in different scopes.
Binding on an event, maintains the worker scope, so they can continue to process the call in a non blocking way, with the next() method.

## How to Use It

It uses json

    {"header": "someheader", "action": "someaction" ... }

When some message is recieved, it emmits and event, that can be bound with

    emitter.bind('someheader:someaction', myCallback);

Actor Socket is single instance, so it listens and emits the same events all across your app.

    var emitter = require('actor-emitter'),
        uuid    = require('node-uuid');

    require('actor-socket');

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

            emitter.trigger('socket:wait', data)
                   .then(onRequestedUserPublic);
        }

        var onRequestedUserPublic = function (user) {

            // for the "wait" function to work, your server
            //  needs to send back the "future" param with the
            //  data sent, and yes, im overwritting "future" attr.
            console.log(user)
            ...

        }

        emitter.bind('authentication:announce', onAuthenticationRequested);
        emitter.bind('authentication:announce:200', requestUserPublicProfile);

        emitter.trigger('socket:connect', 'ws.yourserver.com:3000');
    })()


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

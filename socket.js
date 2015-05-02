'use strict';

var WebSocketClient = require('websocket').client,
    emitter = require('actor-emitter'),
    client = new WebSocketClient(),
    uuid = require('node-uuid');

var _connection = null;
var _reconnect = null;
var _queue = [];

var _trigger = function (data, type) {

    let code = data.future || data.__code__ || '';

    let key = data.header + ':' +
            data.action + (code ? ':' + code : '');

    if (type == 'in') {

        console.log('<- ', key);
        emitter.trigger(data.future || key, data);

    } else {

        console.log('-> ', key);
    }
};

var _wsSend = function (data) {

    try {

	    _connection.sendUTF(data);

    } catch (err) {

        _queue.push(data);
	    console.error('Err, not connected:', err);
    }
};

var wsSend = function (data) {

    emitter.next(_trigger, data, 'out');

    data = JSON.stringify(data);

    emitter.next(_wsSend, data);
};

var wsWait = function (cb, data) {

    data = data || {};

    data.future = uuid();

    emitter.next(wsSend, data);
    emitter.bind(data.future, future.bind(this, cb));
};

var future = function(cb, data) {

    emitter.unbind(data.future, future);
    emitter.next(cb.bind(cb, data));
};

var wsOnMessage = function (msg) {

    let data = JSON.parse(msg);

    emitter.next(_trigger, data, 'in');
};

var wsOpen = function() {

    _queue = _queue.filter(function(data) {

        emitter.next(_wsSend, data);
    });
};

var wsConnect = function(url) {

    client.connect(url);
};

emitter.bind('socket:send', wsSend);
emitter.bind('socket:wait', wsWait);
emitter.bind('socket:open', wsOpen);
emitter.bind('socket:connect', wsConnect);

client.on('connectFailed', function(error) {

    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {

    _connection = connection;

    clearInterval(_reconnect);

    console.log('WebSocket Client Connected');

    connection.on('error', function(error) {

	    console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {

        _reconnect = setInterval(function(){

            client.connect('ws://localhost:6455/');
        }, 1000);
	    console.log('Connection Closed');
    });

    connection.on('message', function(message) {

	    message.type === 'utf8'
            && emitter.next(wsOnMessage, message.utf8Data)
            && emitter.trigger('socket:onmessage', JSON.parse(message.utf8Data));
    });

    emitter.trigger('socket:open', connection);
});

module.exports = {
    send: wsSend
};

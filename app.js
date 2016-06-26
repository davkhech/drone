'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var WebSocketServer = require('ws').Server;
var server = require('http').createServer();
var wss = new WebSocketServer({
    server
});
var url = require('url');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var RedisClient = require('./redisClient.js');
var redisClient = new RedisClient;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 8080);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

wss.on('connection', (ws) => {
    console.log('Socket connection established: Drone Client');

    ws.on('message', (message) => {
        console.log('received: %s', message);
        redisClient.writeToRedis(JSON.stringify(message))
            .then((status) => {
                ws.send('Ok');
            })
            .catch((err) => {
                ws.send('Error -> ', err);
            });
    });

    ws.send('Socket connection established: Drone Server');
});

server.on('request', app);

server.listen(app.get('port'), () => {
    console.log('Listening on ' + server.address().port);
});

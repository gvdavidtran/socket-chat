// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use(express.static(__dirname + '/public'));
//app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

var users = {};

io.on('connection', (socket) => {
    console.log('a user has connected');

    socket.on('new user', (name) => {
        users[socket.id] = {nickname: name};
        socket.broadcast.emit('new user connected', users[socket.id].nickname);
    })

    socket.on('disconnect', () => {
        console.log('a user has disconnected');
    });

    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', {sender: users[socket.id].nickname, message: msg});
    });
});

server.listen(5000, () => {
    console.log('listening on :5000');
})
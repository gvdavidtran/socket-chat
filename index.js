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
// Why the line below doesn't work the same as line above
//app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

var users = {};


io.on('connection', (socket) => {
    console.log('a user has connected');

    // Everytime new user connects, collect nickname entered and broadcast to rest of users
    socket.on('new user', (name) => {
        users[socket.id] = {nickname: name};
        socket.broadcast.emit('new user connected', users[socket.id].nickname);
    })

    // Everytime a user disconnects
    socket.on('disconnect', () => {
        console.log('a user has disconnected');
    });

    // Broadcast new messages to all users except sender
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', {sender: users[socket.id].nickname, message: msg});
    });
});

server.listen(5000, () => {
    console.log('listening on :5000');
})
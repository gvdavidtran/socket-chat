// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set("port", 5000);
app.use(express.static(__dirname + "/public"));
// Why the line below doesn't work the same as line above
//app.use('/public', express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

var users = {};
let channels = {
    ch1: {
        users: []
    },
    ch2: {
        users: []
    }
};

updateOnlineUsers = () => {
    io.emit("online users", users);
};

updateChannels = () => {
    io.emit("update channels", channels);
};

io.on("connection", socket => {
    console.log("a user has connected");

    anotherUserIsNoLongerTyping = () => {
        io.emit("anotherUserIsNoLongerTyping");
    };

    // Everytime new user connects, collect nickname entered and broadcast to rest of users
    socket.on("new user", name => {
        users[socket.id] = { nickname: name, channel: "ch1" };
        socket.join(users[socket.id].channel);
        channels.ch1.users.push(name);
        console.log(channels);
        socket
            .to(users[socket.id].channel)
            .emit("new user connected", users[socket.id].nickname);
        updateOnlineUsers();
        updateChannels();
    });

    // Everytime a user disconnects
    socket.on("disconnect", () => {
        if (users[socket.id]) {
            console.log("a user has disconnected");
            socket.broadcast.emit(
                "user disconnected",
                users[socket.id].nickname
            );
            anotherUserIsNoLongerTyping();
            var index = channels.ch1.users.indexOf(users[socket.id].nickname);
            if (index > -1) {
                channels.ch1.users.splice(index, 1);
            }
            delete users[socket.id];
            // console.log(users)
            updateOnlineUsers();
            updateChannels();
        }
    });

    // Broadcast new messages to all users in user's current room except sender
    socket.on("chat message", msg => {
        socket.to(users[socket.id].channel).emit("chat message", {
            sender: users[socket.id].nickname,
            message: msg
        });
    });

    //
    socket.on("userIsTyping", () => {
        socket.broadcast.emit("anotherUserIsTyping", {
            sender: users[socket.id].nickname
        });
    });

    socket.on("userIsNoLongerTyping", () => {
        anotherUserIsNoLongerTyping();
    });

    var socketInfo = "socket info";
    socket.on("joining ch1", room => {
        console.log(`${socket.id} joining ${room}`);
        socket.join(room);
        socket.leave(socket.id);
        console.log(io.sockets.adapter.rooms);
        io.to(room).emit("room message", `${socket.id} joined ${room}`);
    });

    //io.to('ch1').emit('room message');
});

server.listen(5000, () => {
    console.log("listening on :5000");
});

// Only initialize socket after user has entered a username

// On username submit, hide the username bar and initialize socket
$("#username").submit(() => {
    $("#username").addClass("hidden");
    var username = $("#u").val();
    var socket = io();

    console.log("user online");
    console.log(username);

    // Emit username to server
    socket.emit("new user", username);

    // Emit message on Send
    $("#chat").submit(function() {
        var message = $("#m").val();
        if (message) {
            $("#messages").append($("<li>").text(username + ": " + message));
            socket.emit("chat message", message);
            $("#m").val("");
            timeoutFunction();
        }
        return false;
    });

    // Everytime a message is received
    socket.on("chat message", data => {
        $("#messages").append(
            $("<li>").text(data.sender + ": " + data.message)
        );
    });

    // Display name of new user, everytime new user connects to server
    socket.on("new user connected", name => {
        // console.log(name)
        $("#messages").append($("<li>").text(name + " has connected"));
    });

    socket.on("user disconnected", name => {
        $("#messages").append($("<li>").text(name + " has disconnected"));
    });

    // onKeyDown
    var typing = false;
    var timeout = undefined;

    timeoutFunction = () => {
        if (typing == true) {
            typing = false;
            socket.emit("userIsNoLongerTyping");
        }
    };

    $("#m").keydown(e => {
        // only record typing if enter not pressed
        if (e.which != 13 && e.keyCode != 13) {
            if (typing == false) {
                typing = true;
                socket.emit("userIsTyping");
                timeout = setTimeout(timeoutFunction, 5000);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
            }
        }
    });

    // another user is typing
    socket.on("anotherUserIsTyping", data => {
        $(".is-typing").html(data.sender + " is typing...");
    });

    // another user is no longer typing
    socket.on("anotherUserIsNoLongerTyping", () => {
        $(".is-typing").html("");
    });

    // update online users list
    socket.on("online users", users => {
        var userList = "";
        // console.log(`userList = ${userList}`)
        for (var user in users) {
            var username = users[user].username;
            // console.log(`username = ${username}`)
            userList += `<li>${username}</li>`;
            // console.log(`userList = ${userList}`)
        }
        $("#online").html(userList);
    });

    socket.on("room message", data => {
        $("#messages").append($("<li>").text(data));
    });

    socket.on("update channels", channels => {
        var channelsList = document.createElement("ul");
        channelsList.className = "channels";
        for (var channel in channels) {
            var li = document.createElement("li");
            li.className = "channel-name";
            // li.id = channel;
            li.append(channel);
            var joinButton = document.createElement("button");
            joinButton.className = "join-channel";
            joinButton.id = channel;
            joinButton.append("Join Channel");
            li.append(joinButton);
            // console.log(li);

            var subul = document.createElement("ul");
            subul.className = "users-in-channel";
            for (var user of channels[channel].users) {
                // console.log(`user: ${user}`);
                var subli = document.createElement("li");
                subli.innerHTML = user;
                subul.append(subli);
            }
            li.append(subul);
            console.log(li);
            channelsList.append(li);
        }
        console.log(channelsList);
        document.getElementById("channel-list").innerHTML = "";
        document.getElementById("channel-list").appendChild(channelsList);
    });

    // $("#ch1").click(() => {
    //     var room = "ch1";
    //     console.log("clicked!!");
    //     socket.emit("joining ch1", room);
    // });

    // $("#ch2").click(() => {
    //     console.log("clicked!!");
    //     socket.emit("switching channel", "ch2");
    // });

    $("#channel-list").on("click", "button.join-channel", () => {
        var channelToJoin = event.target.id;
        console.log("clicked!!");
        socket.emit("switching channel", channelToJoin);
    });

    $("#create-channel").submit(() => {
        var newChannel = $("#c").val();
        $("#c").val("");
        console.log("creating", newChannel);
        socket.emit("creating new channel", newChannel);
        return false;
    });

    return false;
});

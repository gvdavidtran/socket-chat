// Only initialize socket after user has entered a nickname

// On nickname submit, hide the nickname bar and initialize socket
$('#nickname').submit(() => {
    $('#nickname').addClass('hidden');
    var nickname = $('#n').val();
    var socket = io();
    console.log('user online')

    // Emit nickname to server
    socket.emit('new user', nickname);

    // Emit message on Send
    $('#chat').submit(function(){
        var message = $('#m').val();
        $('#messages').append($('<li>').text(nickname + ': ' + message ));
        socket.emit('chat message', message);
        $('#m').val('');
        return false;
    });

    // Everytime a message is received
    socket.on('chat message', (data) => {
        $('#messages').append($('<li>').text(data.sender + ': ' + data.message ));
    })

    // Display name of new user, everytime new user connects to server
    socket.on('new user connected', (name) => {
        console.log(name)
        $('#messages').append($('<li>').text(name + ' has connected'));
    })
    return false;
})

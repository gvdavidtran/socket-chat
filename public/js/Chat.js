$('#nickname').submit(() => {
    $('#nickname').addClass('hidden');
    var nickname = $('#n').val();
    var socket = io();
    console.log('user online')

    socket.emit('new user', nickname);

    $('#chat').submit(function(){
        var message = $('#m').val();
        $('#messages').append($('<li>').text(nickname + ': ' + message ));
        socket.emit('chat message', message);
        $('#m').val('');
        return false;
    });

    socket.on('chat message', (data) => {
        $('#messages').append($('<li>').text(data.sender + ': ' + data.message ));
    })

    socket.on('new user connected', (name) => {
        console.log(name)
        $('#messages').append($('<li>').text(name + ' has connected'));
    })



    return false;
})

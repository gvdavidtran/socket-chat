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

    // onKeyDown
    var typing = false;
    var timeout = undefined;

    timeoutFunction = () => {
      typing = false;
      socket.emit('userIsNoLongerTyping');
    }

    $('#m').keydown((e) => {
        // only record typing if enter not pressed
        if(e.which!=13 && e.keyCode!=13) {
            if (typing == false) {
                typing = true
                socket.emit('userIsTyping');
                timeout = setTimeout(timeoutFunction, 5000);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
            }
        }   
    });

    // another user is typing
    socket.on('anotherUserIsTyping', (data) => {
        $('.is-typing').html(data.sender + ' is typing...');
    })

    // another user is no longer typing
    socket.on('anotherUserIsNoLongerTyping', (data) => {
        $('.is-typing').html('');
    })
       

    return false;
})

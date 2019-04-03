var express = require('express');
var http = require('http')
var socketio = require('socket.io');

var app = express();
var server = http.Server(app);
var websocket = socketio(server);
server.listen(3000, () => console.log('listening on *:3000'));

// Mapping objects to easily map sockets and users.
var clients = {};
var rooms = {};
// var dedicatedRooms = {room0, room1, room2, room3};
var users = {};

var caller = 0;

websocket.on('connection', (socket) => {
    clients[socket.id] = socket;
    caller++;
    socket.on('ice', msg => {
    socket.broadcast.emit('ice', msg);
    });
    socket.on('offer', msg => {
      socket.broadcast.emit('offer', msg);
    });
    socket.on('answer', msg => {
      socket.broadcast.emit('answer', msg);
    });
    socket.on('userJoined', (userId) => onUserJoined(userId, socket, caller%2));
    socket.on('message', (message) => onMessageReceived(message, socket));
    socket.on('disconnect', () => {
      delete clients[socket.id];
    })
});

// Event listeners.
// When a user joins the chatroom.
function onUserJoined(userId, socket, caller) {
  users[socket.id] = userId;
socket.emit('role', !!caller);
}

// When a user sends a message in the chatroom.
function onMessageReceived(message, senderSocket) {
  var userId = users[senderSocket.id];
  _sendMessage(message, senderSocket);
  console.log(message)
  // Safety check.
  if (!userId) return;

}

// Helper functions.
// Send the pre-existing messages to the user that just joined.

//send all sockets but the sender.
function _sendMessage(message, socket, fromServer) {
    // If the message is from the server, then send to everyone.
    var emitter = fromServer ? websocket : socket.broadcast;
    emitter.emit('message', [message]);
}

// Allow the server to participate in the chatroom through stdin.
var stdin = process.openStdin();
stdin.addListener('data', function(d) {
  _sendMessage({
    text: d.toString().trim(),
    createdAt: new Date(),
    user: { _id: 'NiHS Alert' }
  }, null /* no socket */, true /* send from server */);
});
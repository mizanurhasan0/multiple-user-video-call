const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        // Get all users in the room except the new user
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log({ usersInRoom });
        const otherUsers = usersInRoom.filter(id => id !== userId);
        console.log({ otherUsers });
        // Send list of existing users to the new user
        socket.emit('existing-users', otherUsers);

        socket.broadcast.to(roomId).emit('user-connected', userId);
    });
    // Receive and forward "sending-signal" event
    socket.on('sending-signal', ({ userToSignal, signal }) => {
        io.to(userToSignal).emit('receive-signal', { signal, from: socket.id });
    });

    socket.on('returning-signal', ({ signal, to }) => {
        io.to(to).emit('receive-returned-signal', { signal, from: socket.id });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});

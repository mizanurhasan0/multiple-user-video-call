const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
// const cors = require('cors');

const io = new Server({
    cors: true
});
const app = express();
// app.use(cors({}))
app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketIdToEMail = new Map();
// socket signal
io.on('connection', (socket) => {
    socket.on("join-room", (data) => {
        const { room, name } = data;
        emailToSocketMapping.set(name, socket.id);
        socketIdToEMail.set(socket.id, name);
        socket.join(room);
        console.log("user:", name, "join Room:", room);
        socket.emit('joined-room', { room });
        // console.log("emailToSocketMapping:", emailToSocketMapping);
        // console.log("Socket rooms:", socket.rooms);
        // console.log("socketIdToEMail:", socketIdToEMail);
        socket.broadcast.to(room.toString()).emit("user-joined", { name });
    });
    socket.on('call-user', async ({ name, offer }) => {
        // console.log(name);
        const socketId = await emailToSocketMapping.get(name);
        const fromEmail = await socketIdToEMail.get(socketId);
        console.log({ socketId, fromEmail, room: socket.id });
        io.to(socket.id).emit('incomming-call', { from: fromEmail, offer });
    });
    socket.on("call-accepted", ({ email, ans }) => {
        const socketId = emailToSocketMapping.get(email);
        console.log({ socketId, ans, emailToSocketMapping, email });
        io.to(socket.id).emit("call-accepted", { ans });
    })
});

app.listen(4000, () => console.log('Server is running port:4000'));
io.listen(4001, () => console.log('socket server running port:4001'))
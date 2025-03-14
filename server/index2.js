const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});
const users = {};
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    users[socket.id] = socket.id;
    io.emit("user-list", Object.keys(users));
    console.log({ users });
    socket.on("call-user", ({ to, offer }) => {
        console.log({ "call-user": to, "id": socket.id })
        io.to(to).emit("incoming-call", { from: socket.id, offer });
    });

    socket.on("answer-call", ({ to, answer }) => {
        io.to(to).emit("call-answered", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        console.log({ to });
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("user-list", Object.keys(users));
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

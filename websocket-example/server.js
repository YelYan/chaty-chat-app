import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // print out chat message received from client
  socket.on("chat message", (msg) => {
    console.log("Message received:", msg);
  });

  // Send to EVERYONE (including sender)
  io.emit("welcome", `Welcome on onboard`);

  // Send to ONLY the current client
  socket.emit("only-socket", `Hello Socket - ${socket.id}`);

  // Send to EVERYONE EXCEPT the sender
  socket.broadcast.emit("user:joined", `A Socket ${socket.id} joined`);

  // Join a room in socket.io
  socket.join("room1");

  // Send to a specific room (example: room1 group)
  io.to("room1").emit("room1:message", `Welcome to room1`);

  //Send to all in a room EXCEPT the sender
  io.to("room1").except(socket.id).emit("Someone joined the room");

  // Send to all in a room EXCEPT the sender
  socket.to("room1").emit("room1:message", "New message from  ", socket.id);

  //Listen to event (.on())
  socket.on("welcome", (msg) => {
    console.log(msg);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

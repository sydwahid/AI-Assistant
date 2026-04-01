const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

let agentSocket = null;

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // Agent connects
    socket.on("agent-connect", () => {
        agentSocket = socket;
        console.log("Agent connected");
    });

    // Frontend sends command (legacy literal matched)
    socket.on("command", (cmd) => {
        console.log("Command received:", cmd);
        if (agentSocket) {
            agentSocket.emit("run", cmd);
        } else {
            socket.emit("error", "Agent not connected");
        }
    });

    // ─── NEW NLP Routing ─────────────────────────────────────
    
    // 1. Frontend asks: "What intent is this text?"
    socket.on("check_intent", (text) => {
        if (agentSocket) {
            agentSocket.emit("check_intent", text);
        }
    });

    // 2. Agent replies with the determined intent
    socket.on("intent_detected", (result) => {
        io.emit("intent_detected", result);
    });

    // 3. Frontend commits to running the exact intent
    socket.on("execute_intent", (data) => {
        if (agentSocket) {
            agentSocket.emit("execute_intent", data);
        }
    });

    // ────────────────────────────────────────────────────────

    // Agent sends string result after running a command
    socket.on("result", (msg) => {
        io.emit("result", msg);
    });
});

server.listen(5000, () => {
    console.log("WebSocket server running on port 5000");
});

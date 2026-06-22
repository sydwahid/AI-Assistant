const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Health check for Render (prevents unnecessary spin-downs)
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("QuickGPT WebSocket Server is Live!"));

const server = http.createServer(app);

// CORS — allow Vercel frontend in production, everything in dev
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, "http://localhost:5173"]
    : "*";

const io = new Server(server, {
    cors: { origin: allowedOrigins }
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

    // ─── NLP Routing ─────────────────────────────────────

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

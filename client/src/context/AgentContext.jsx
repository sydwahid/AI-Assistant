import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const AgentContext = createContext();

// Socket created ONCE outside the component tree — persists across re-renders
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";
const socket = io(WS_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const AgentContextProvider = ({ children }) => {
    const [agentConnected, setAgentConnected] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    // Listen for results and connection events
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket connected to ws-server");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected from ws-server");
            setAgentConnected(false);
        });

        // Server tells us if agent is online/offline (optional — see server.js note below)
        socket.on("agent-status", (status) => {
            setAgentConnected(status === "online");
        });

        socket.on("result", (msg) => {
            console.log("Agent result:", msg);
            setLastResult({ text: msg, id: Date.now() });
            setIsExecuting(false);
        });

        socket.on("error", (msg) => {
            toast.error(`Agent error: ${msg}`);
            setIsExecuting(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("agent-status");
            socket.off("result");
            socket.off("error");
        };
    }, []);

    /**
     * Send raw string to ML NLP engine and wait for prediction
     */
    const checkNLPIntent = (text) => {
        return new Promise((resolve) => {
            if (!socket.connected) {
                toast.error("WebSocket server not connected. Ensure ws-server and Python agent are running.");
                resolve({ match: false, intent: null });
                return;
            }

            // Fallback timeout in case agent doesn't respond
            const timeout = setTimeout(() => {
                socket.off("intent_detected");
                resolve({ match: false, intent: null });
            }, 3000);

            socket.once("intent_detected", (result) => {
                clearTimeout(timeout);
                resolve(result);
            });

            socket.emit("check_intent", text);
        });
    };

    /**
     * Send parsed intent back to agent for execution
     * @param {Object} intentData
     * @param {string} userName
     */
    const executeIntent = (intentData, userName = "") => {
        if (!socket.connected) return;
        setIsExecuting(true);
        const payload = { ...intentData, userName };
        socket.emit("execute_intent", payload);
    };

    const value = {
        agentConnected,
        lastResult,
        isExecuting,
        checkNLPIntent,
        executeIntent,
    };

    return (
        <AgentContext.Provider value={value}>
            {children}
        </AgentContext.Provider>
    );
};

export const useAgentContext = () => useContext(AgentContext);

"""
Jarvis Local Agent — connects to ws-server via WebSocket,
receives commands, executes them, speaks results via TTS,
and sends results back to the frontend.
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import re
import threading
import queue
import socketio
from commands import dispatch_command
from nlp_engine_clean import engine
from scheduler import start_scheduler_with_callback

# ═══════════════════════════════════════════════════════════════════════════
# TTS (Text-to-Speech) — runs in a separate thread to avoid blocking
# ═══════════════════════════════════════════════════════════════════════════

import subprocess

TTS_ENABLED = True

def _clean_for_speech(text: str) -> str:
    """Remove emojis and markdown for cleaner speech output."""
    # Remove emojis
    text = re.sub(
        r'[\U0001F300-\U0001F9FF\U00002600-\U000027BF\u2700-\u27BF'
        r'\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]', '', text
    )
    # Remove markdown bold
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    # Remove markdown italic
    text = re.sub(r'_([^_]+)_', r'\1', text)
    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def speak(text: str, user_name: str = ""):
    """Non-blocking TTS using native Windows PowerShell."""
    if not TTS_ENABLED:
        return
        
    # Append personalized greeting
    if user_name:
        text = f"{text}, {user_name} Sir"
    else:
        text = f"{text}, Sir"
        
    clean = _clean_for_speech(text)
    if clean:
        # Escape single quotes for PowerShell
        safe_text = clean.replace("'", "''")
        
        # Native Windows System.Speech API (100% Maximum Volume, Clean Voice)
        ps_cmd = (
            "Add-Type -AssemblyName System.Speech; "
            "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
            "$synth.Volume = 100; "
            "$synth.Rate = 0; "
            f"$synth.Speak('{safe_text}')"
        )
        try:
            # 0x08000000 = CREATE_NO_WINDOW (Silently runs in background)
            subprocess.Popen(
                ["powershell", "-Command", ps_cmd], 
                creationflags=0x08000000
            )
        except Exception as e:
            print(f"  TTS PowerShell Execution error: {e}")

print("🔊 Native PowerShell TTS enabled")


# ═══════════════════════════════════════════════════════════════════════════
# Socket.IO Client — connects to the ws-server
# ═══════════════════════════════════════════════════════════════════════════

import os
from dotenv import load_dotenv
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

WS_SERVER_URL = os.getenv("WS_SERVER_URL", "http://localhost:5000")

sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=0,  # Infinite retries
    reconnection_delay=2,
)


@sio.event
def connect():
    print(f"✅ Agent connected to {WS_SERVER_URL}")
    sio.emit("agent-connect")


@sio.event
def disconnect():
    print("  Agent disconnected from ws-server")


@sio.on("run")
def on_run(cmd):
    """Fallback exact string runner if needed by React"""
    print(f"📥 Received raw command: {cmd}")
    result = dispatch_command(cmd)
    print(f"📤 Result: {result}")
    sio.emit("result", result)
    speak(result)


@sio.on("check_intent")
def on_check_intent(user_text):
    """
    ML prediction phase. 
    React sends "what time is it in london".
    We predict and send back {intent: "weather", args: "london", ...}
    """
    print(f"🧠 Checking intent for: '{user_text}'")
    result = engine.predict_intent(user_text)
    print(f"   -> {result}")
    
    # Send the prediction back to React so React can ask for passwords
    # or forward the message to Gemini if confidence is too low.
    sio.emit("intent_detected", result)


@sio.on("execute_intent")
def on_execute_intent(data):
    """
    Execution phase. React confirmed we can run.
    data = { "intent": "shutdown", "args": "", "userName": "John" }
    """
    intent = data.get("intent")
    args = data.get("args", "").strip()
    user_name = data.get("userName", "").strip()
    parameterized = bool(data.get("parameterized"))
    
    # Reconstruct the string for the dispatcher
    if intent:
        cmd_string = f"{intent}:{args}" if parameterized or args else intent
        print(f"📥 Executing Confirmed Intent: {cmd_string}")
        result = dispatch_command(cmd_string)
        print(f"📤 Result: {result}")
        
        sio.emit("result", result)
        speak(result, user_name)


# ═══════════════════════════════════════════════════════════════════════════
# Mainn
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 50)
    print("  🤖 JARVIS Local Agent")
    print("=" * 50)
    print(f"  Connecting to: {WS_SERVER_URL}")
    print(f"  TTS: {'Enabled' if TTS_ENABLED else 'Disabled'}")
    print("=" * 50)

    try:
        sio.connect(WS_SERVER_URL)

        # Start background scheduler and forward reminders via socket.io
        def _forward_reminder(msg: str):
            try:
                # Emit as a normal result so frontend shows it in the chat stream
                sio.emit('result', msg)
            except Exception as e:
                print(f"  Failed to forward reminder via socket: {e}")

        try:
            start_scheduler_with_callback(_forward_reminder)
            print("⏰ Scheduler started and will forward reminders to frontend.")
        except Exception as e:
            print(f"  Scheduler failed to start: {e}")
        sio.wait()  # Keeps the process alive
    except KeyboardInterrupt:
        print("\n👋 Agent shutting down...")
        sio.disconnect()
    except Exception as e:
        print(f"  Connection failed: {e}")
        print("   Is the ws-server running? Start it with: node server.js")

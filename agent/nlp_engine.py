import sys
sys.stdout.reconfigure(encoding='utf-8')

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 1. DEFINE THE TRAINING DATASET
# Keys are the exact commands mapped in __init__.py.
# Values are dozens of ways a human might phrase that command.
TRAINING_DATA = {
    # ── 앱 (Apps) ──────────────────────
    "open notepad": ["open notepad", "launch text editor", "i need to type", "open text file", "start notepad", "blank document"],
    "open calculator": ["open calculator", "math time", "launch calc", "do some math", "open calc", "start calculator"],
    "open browser": ["open browser", "open chrome", "internet", "launch edge", "open web browser", "surf the web"],
    "open file explorer": ["open file explorer", "show my files", "open files", "file manager", "where are my files"],
    "open task manager": ["open task manager", "processes", "kill process", "show memory usage apps", "taskmgr"],
    "open terminal": ["open terminal", "command prompt", "powershell", "open cmd", "launch terminal"],
    "open paint": ["open paint", "draw something", "mspaint", "let's draw", "launch painting app"],
    "open wordpad": ["open wordpad", "write a document", "rich text editor"],
    "open camera": ["open camera", "webcam", "turn on video", "launch camera"],
    "open settings": ["open settings", "system settings", "change settings", "pc options"],
    "open snipping tool": ["open snipping tool", "snip", "cut screen", "snipping tool"],
    "open control panel": ["open control panel", "control panel", "system control"],
    "open clock": ["open clock", "timer", "stopwatch", "alarm", "set alarm"],
    "open store": ["open store", "microsoft store", "app store", "download apps"],
    "open device manager": ["open device manager", "devices", "hardware devices"],
    "open youtube": ["open youtube", "watch videos", "launch youtube", "go to youtube"],
    "open github": ["open github", "launch github", "go to github", "code repo"],
    "open spotify": ["open spotify", "play music", "music player", "launch spotify"],

    # ── 시스템 (System) ──────────────────────
    "shutdown": ["shutdown", "turn off pc", "shut down the computer", "kill power", "power off", "go to sleep forever"],
    "restart": ["restart", "reboot", "restart computer", "reboot pc", "restart the machine"],
    "sleep": ["sleep", "hibernate", "put pc to sleep", "sleep mode", "suspend"],
    "lock screen": ["lock screen", "lock pc", "lock computer", "secure pc", "lock the desktop"],
    "log off": ["log off", "sign out", "logout", "logoff"],
    "cancel shutdown": ["cancel shutdown", "abort shutdown", "stop turning off", "don't shutdown"],

    # ── 미디어 (Media) ──────────────────────
    "mute": ["mute", "silence", "shut up", "turn off sound", "mute volume", "quiet"],
    "unmute": ["unmute", "turn on sound", "i want to hear", "unmute volume"],
    "volume up": ["volume up", "louder", "increase sound", "too quiet", "turn it up", "raise volume"],
    "volume down": ["volume down", "quieter", "decrease sound", "too loud", "drop the volume", "lower volume"],
    "brightness up": ["brightness up", "too dark", "make it brighter", "increase brightness", "more light"],
    "brightness down": ["brightness down", "too bright", "my eyes hurt", "dim the screen", "decrease brightness", "darker screen", "eyes protection mode"],
    "screenshot": ["screenshot", "capture screen", "print screen", "take a picture of my screen", "save screen"],
    "play pause track": ["play my music", "pause music", "stop song", "play song", "resume track", "pause the video", "play pause"],
    "next track": ["next song", "skip track", "next track", "skip this ad", "forward media"],

    # ── 정보 (Info) ──────────────────────
    "time": ["what time is it", "current time", "time now", "tell me the time"],
    "date": ["what's today's date", "current date", "what day is it", "today's date", "tell me the date"],
    "ip address": ["ip address", "what is my ip", "public ip", "local ip", "show my ip"],
    "battery": ["battery", "battery percentage", "charge level", "battery status", "how much battery"],
    "system info": ["system info", "computer specs", "pc info", "what are my specs", "hardware info"],
    "cpu usage": ["cpu usage", "cpu load", "processor usage", "is my cpu hot", "cpu status"],
    "ram usage": ["ram usage", "memory usage", "how much ram", "memory status"],

    # ── 재미 (Fun) ──────────────────────
    "joke": ["tell me a joke", "make me laugh", "say something funny", "joke", "amuse me"],
    "coin flip": ["flip a coin", "heads or tails", "toss a coin", "coin flip"],
    "roll dice": ["roll a dice", "throw a dice", "roll dice", "random dice"],
    "random number": ["random number", "pick a number", "give me a random number"],
    "magic 8ball": ["magic 8-ball", "8ball", "fortune tell", "predict the future", "magic 8 ball"],

    # ── 자동화 (Automation) ──────────────────────
    "scroll up": ["scroll up", "page up", "go up"],
    "scroll down": ["scroll down", "page down", "go down"],
    "click": ["click", "mouse click", "click here", "tap"],
    "empty recycle bin": ["empty recycle bin", "clear trash", "empty trash", "delete trash", "empty the bin"],
    "copy text": ["copy that", "copy text", "copy to clipboard"],
    "paste text": ["paste it here", "paste text", "paste from clipboard"],
    "save file": ["save file", "save my work", "save this document", "save"],
    "select all": ["select everything", "select all", "highlight all", "grab all text"],
    "minimize windows": ["minimize everything", "hide my screens", "minimize all windows", "show desktop", "hide apps"],
    "maximize window": ["maximize window", "make it full screen", "maximize this", "full screen"],
    "start deep work": ["start deep work", "i'm ready to work", "start my workflow", "begin deep work routine", "open my workflow"],
    "click picture": ["click picture", "take a picture", "take photo", "click a photo", "open camera and snap", "capture image", "take a selfie"],

    # ── 매개변수 (Parameterized) ──────────────────────
    # Because parameterized commands rely heavily on the word itself, 
    # we train it on the stem and common connecting words.
    "wikipedia": ["wikipedia", "search wikipedia", "look up on wiki", "wiki"],
    "weather": ["weather", "temperature", "forecast", "is it raining in", "how is the weather in"],
    "news": ["news", "headlines", "latest news", "top news about", "show me news for"],
    "search": ["search google", "google", "look up", "search the web for", "find"],
    "type": ["type", "write this down", "type out"],
    "write in notepad": ["write in notepad", "take a note", "open notepad and type"],
    "open url": ["open url", "go to website", "visit site", "open link"]
}

# Dangerous commands that require an explicit round-trip confirmation
DANGEROUS_COMMANDS = {
    "shutdown", "restart", "sleep", "log off", "empty recycle bin"
}

# Parameterized commands that have arguments mapped to them
PARAM_COMMANDS = {
    "wikipedia", "weather", "news", "search", "type", "open url", "write in notepad"
}

class NLPEngine:
    def __init__(self):
        print("🧠 Initializing Scikit-Learn NLP Brain...")
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        
        self.intents = []  # List of exact command strings (e.g. "open notepad")
        self.corpus = []   # List of all the training sentences
        self.intent_mapping = [] # Maps corpus index to intents index

        # Flatten training data
        for intent, phrases in TRAINING_DATA.items():
            for phrase in phrases:
                self.corpus.append(phrase)
                self.intent_mapping.append(intent)
                if intent not in self.intents:
                    self.intents.append(intent)
        
        # Train the TF-IDF vectorizer memory
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        print(f"✅ Trained on {len(self.corpus)} phrases across {len(self.intents)} intents.")

    def predict_intent(self, text: str, threshold: float = 0.35) -> dict:
        """
        Takes raw user text, vectorizes it, and finds the closest matching intent
        using Cosine Similarity space.
        """
        clean_text = text.lower().strip()
        
        # 1. Transform input to vector
        input_vec = self.vectorizer.transform([clean_text])
        
        # 2. Calculate cosine similarity against all training data
        similarities = cosine_similarity(input_vec, self.tfidf_matrix)[0]
        
        # 3. Find the index of the highest similarity score
        best_match_idx = np.argmax(similarities)
        best_score = similarities[best_match_idx]
        
        # 4. If the score is too low, we assume they are just talking to Gemini
        if best_score < threshold:
            return {
                "match": False,
                "confidence": round(float(best_score), 2),
                "intent": None
            }
        
        intent = self.intent_mapping[best_match_idx]
        matched_trigger = self.corpus[best_match_idx]
        
        # 5. Handle extraction of arguments for parameterized commands (e.g., "wikipedia python")
        args = ""
        if intent in PARAM_COMMANDS:
            # Simple extraction: remove the matched trigger or core verb from the input
            # Example: "search wikipedia for quantum computing" -> "quantum computing"
            regex_pattern = r'\b(' + '|'.join(TRAINING_DATA[intent]) + r'|for|about|in|on)\b'
            args_clean = re.sub(regex_pattern, '', clean_text).strip()
            args = args_clean

        return {
            "match": True,
            "intent": intent,
            "confidence": round(float(best_score), 2),
            "dangerous": intent in DANGEROUS_COMMANDS,
            "parameterized": intent in PARAM_COMMANDS,
            "args": args,
            "matched_trigger": matched_trigger
        }

# Create a singleton instance to be imported by agent.py
engine = NLPEngine()

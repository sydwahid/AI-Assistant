import re
import sys
from pathlib import Path

import numpy as np
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

sys.stdout.reconfigure(encoding="utf-8")

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _get_env(name, default):
    value = os.getenv(name, "")
    cleaned = value.strip().strip('"').strip("'")
    return cleaned or default


DEFAULT_WEATHER_CITY = _get_env("DEFAULT_WEATHER_CITY", "Thane")

WEATHER_KEYWORDS = (
    "weather",
    "temperature",
    "forecast",
    "raining",
    "rainy",
    "humidity",
    "climate",
)

NEWS_KEYWORDS = (
    "news",
    "headline",
    "headlines",
    "latest news",
    "breaking news",
    "what's happening",
    "whats happening",
    "what is happening",
    "current affairs",
)

TRAINING_DATA = {
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
    "shutdown": ["shutdown", "turn off pc", "shut down the computer", "kill power", "power off", "go to sleep forever"],
    "restart": ["restart", "reboot", "restart computer", "reboot pc", "restart the machine"],
    "sleep": ["sleep", "hibernate", "put pc to sleep", "sleep mode", "suspend"],
    "lock screen": ["lock screen", "lock pc", "lock computer", "secure pc", "lock the desktop"],
    "log off": ["log off", "sign out", "logout", "logoff"],
    "cancel shutdown": ["cancel shutdown", "abort shutdown", "stop turning off", "don't shutdown"],
    "mute": ["mute", "silence", "shut up", "turn off sound", "mute volume", "quiet"],
    "unmute": ["unmute", "turn on sound", "i want to hear", "unmute volume"],
    "volume up": ["volume up", "louder", "increase sound", "too quiet", "turn it up", "raise volume"],
    "volume down": ["volume down", "quieter", "decrease sound", "too loud", "drop the volume", "lower volume"],
    "brightness up": ["brightness up", "too dark", "make it brighter", "increase brightness", "more light"],
    "brightness down": ["brightness down", "too bright", "my eyes hurt", "dim the screen", "decrease brightness", "darker screen", "eyes protection mode"],
    "screenshot": ["screenshot", "capture screen", "print screen", "take a picture of my screen", "save screen"],
    "play pause track": ["play my music", "pause music", "stop song", "play song", "resume track", "pause the video", "play pause"],
    "next track": ["next song", "skip track", "next track", "skip this ad", "forward media"],
    "time": ["what time is it", "current time", "time now", "tell me the time"],
    "date": ["what's today's date", "current date", "what day is it", "today's date", "tell me the date"],
    "ip address": ["ip address", "what is my ip", "public ip", "local ip", "show my ip"],
    "battery": ["battery", "battery percentage", "charge level", "battery status", "how much battery"],
    "system info": ["system info", "computer specs", "pc info", "what are my specs", "hardware info"],
    "cpu usage": ["cpu usage", "cpu load", "processor usage", "is my cpu hot", "cpu status"],
    "ram usage": ["ram usage", "memory usage", "how much ram", "memory status"],
    "joke": ["tell me a joke", "make me laugh", "say something funny", "joke", "amuse me"],
    "coin flip": ["flip a coin", "heads or tails", "toss a coin", "coin flip"],
    "roll dice": ["roll a dice", "throw a dice", "roll dice", "random dice"],
    "random number": ["random number", "pick a number", "give me a random number"],
    "magic 8ball": ["magic 8-ball", "8ball", "fortune tell", "predict the future", "magic 8 ball"],
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
    "wikipedia": ["wikipedia", "search wikipedia", "look up on wiki", "wiki"],
    "weather": ["weather", "temperature", "forecast", "is it raining in", "how is the weather in", "what's the weather", "hows the weather", "weather in mumbai"],
    "news": ["news", "headlines", "latest news", "top news", "show me news", "what's happening", "whats happening", "latest headlines", "breaking news"],
    "search": ["search google", "google", "look up", "search the web for", "find"],
    "type": ["type", "write this down", "type out"],
    "write in notepad": ["write in notepad", "take a note", "open notepad and type"],
    "open url": ["open url", "go to website", "visit site", "open link"],
}

DANGEROUS_COMMANDS = {
    "shutdown",
    "restart",
    "sleep",
    "log off",
    "empty recycle bin",
}

PARAM_COMMANDS = {
    "wikipedia",
    "weather",
    "news",
    "search",
    "type",
    "open url",
    "write in notepad",
    "set alarm",
}


class NLPEngine:
    def __init__(self):
        print("Initializing Scikit-Learn NLP Brain...")
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.intents = []
        self.corpus = []
        self.intent_mapping = []

        for intent, phrases in TRAINING_DATA.items():
            for phrase in phrases:
                self.corpus.append(phrase)
                self.intent_mapping.append(intent)
                if intent not in self.intents:
                    self.intents.append(intent)

        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        print(f"Trained on {len(self.corpus)} phrases across {len(self.intents)} intents.")

    def _build_result(self, intent, args="", confidence=1.0, matched_trigger=None):
        return {
            "match": True,
            "intent": intent,
            "confidence": round(float(confidence), 2),
            "dangerous": intent in DANGEROUS_COMMANDS,
            "parameterized": intent in PARAM_COMMANDS,
            "args": args,
            "matched_trigger": matched_trigger or intent,
        }

    def _extract_weather_city(self, clean_text):
        patterns = [
            r"\bweather\s+(?:in|at|for)\s+([a-zA-Z\s]+)$",
            r"\btemperature\s+(?:in|at|for)\s+([a-zA-Z\s]+)$",
            r"\bforecast\s+(?:in|at|for)\s+([a-zA-Z\s]+)$",
            r"\bhow(?:'s| is|s)?\s+the\s+weather\s+(?:in|at|for)\s+([a-zA-Z\s]+)$",
            r"\bis\s+it\s+raining\s+(?:in|at|for)\s+([a-zA-Z\s]+)$",
        ]

        for pattern in patterns:
            match = re.search(pattern, clean_text)
            if match:
                city = re.sub(r"\s+", " ", match.group(1)).strip(" ?!.,")
                if city:
                    return city.title()

        return DEFAULT_WEATHER_CITY

    def _handle_priority_intents(self, clean_text):
        if any(keyword in clean_text for keyword in WEATHER_KEYWORDS):
            city = self._extract_weather_city(clean_text)
            return self._build_result("weather", args=city, matched_trigger="weather")

        if any(keyword in clean_text for keyword in NEWS_KEYWORDS):
            return self._build_result("news", args="", matched_trigger="news")

        return None

    def _extract_param_args(self, intent, clean_text):
        if intent == "weather":
            return self._extract_weather_city(clean_text)

        if intent == "news":
            return ""

        regex_pattern = r"\b(" + "|".join(re.escape(phrase) for phrase in TRAINING_DATA[intent]) + r"|for|about|in|on)\b"
        args = re.sub(regex_pattern, "", clean_text).strip(" ?!.,")
        return re.sub(r"\s+", " ", args).strip()

    def predict_intent(self, text, threshold=0.35):
        clean_text = text.lower().strip()
        if not clean_text:
            return {
                "match": False,
                "confidence": 0.0,
                "intent": None,
            }

        priority_result = self._handle_priority_intents(clean_text)
        if priority_result:
            return priority_result

        input_vec = self.vectorizer.transform([clean_text])
        similarities = cosine_similarity(input_vec, self.tfidf_matrix)[0]
        best_match_idx = np.argmax(similarities)
        best_score = similarities[best_match_idx]

        if best_score < threshold:
            return {
                "match": False,
                "confidence": round(float(best_score), 2),
                "intent": None,
            }

        intent = self.intent_mapping[best_match_idx]
        matched_trigger = self.corpus[best_match_idx]
        args = self._extract_param_args(intent, clean_text) if intent in PARAM_COMMANDS else ""

        return self._build_result(
            intent,
            args=args,
            confidence=best_score,
            matched_trigger=matched_trigger,
        )


engine = NLPEngine()

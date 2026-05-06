import time

try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False

try:
    import pyttsx3
    TTS_AVAILABLE = True
except Exception:
    TTS_AVAILABLE = False

try:
    from .. import scheduler as _scheduler
    SCHEDULER_AVAILABLE = True
except Exception:
    # scheduler may not be importable in all contexts (module path), try direct import
    try:
        import scheduler as _scheduler
        SCHEDULER_AVAILABLE = True
    except Exception:
        SCHEDULER_AVAILABLE = False


def type_text(text):
    """Type text at the current cursor position."""
    if not PYAUTOGUI_AVAILABLE:
        return "  pyautogui not installed — cannot type text"
    if not text:
        return "  Please provide text to type. Example: 'type Hello World'"
    # Small delay so user can switch to target window
    time.sleep(2)
    pyautogui.typewrite(text, interval=0.03)
    return f" Typed: '{text}'"


def write_in_notepad(text):
    """Opens notepad and types the text inside it."""
    if not PYAUTOGUI_AVAILABLE:
        return "  pyautogui not installed"
    import os
    os.startfile("notepad.exe")
    time.sleep(1.5) # Wait for notepad to gain focus
    if text:
        pyautogui.typewrite(text, interval=0.03)
    return f" Wrote in Notepad: '{text}'"


def take_picture():
    """Captures a selfie using OpenCV (without keyboard) with 3s timer."""
    import time
    import winsound
    import cv2
    import os
    from datetime import datetime

    # Initialize the default webcam natively in background first so the lens turns on
    cap = cv2.VideoCapture(0)
    
    # 3 second countdown beep while the user looks at the active camera len
    winsound.Beep(1000, 500)
    time.sleep(0.5)
    winsound.Beep(1000, 500)
    time.sleep(0.5)
    winsound.Beep(1000, 500)
    time.sleep(0.5)
    winsound.Beep(2000, 800) # Final capture sound
    
    if not cap.isOpened():
        return "  Failed to access your hardware camera."

    ret, frame = cap.read()
    cap.release()
    cv2.destroyAllWindows()

    if not ret:
        return "  The camera failed to capture a clear image."

    # Force save exclusively to the requested folder
    save_folder = r"C:\Users\sayye\OneDrive\Pictures\Camera Roll"
    os.makedirs(save_folder, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filepath = os.path.join(save_folder, f"Jarvis_Selfie_{timestamp}.jpg")
    cv2.imwrite(filepath, frame)

    return "picture taken and it saved"


def scroll_up():
    if not PYAUTOGUI_AVAILABLE:
        return "  pyautogui not installed"
    pyautogui.scroll(5)
    return " Scrolled up"


def scroll_down():
    if not PYAUTOGUI_AVAILABLE:
        return "  pyautogui not installed"
    pyautogui.scroll(-5)
    return " Scrolled down"


def click_mouse():
    if not PYAUTOGUI_AVAILABLE:
        return "  pyautogui not installed"
    pyautogui.click()
    return " Clicked at current mouse position"


def empty_recycle_bin():
    """Empty the recycle bin (Windows)."""
    import ctypes
    try:
        ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 0x07)
        return " Recycle Bin emptied"
    except Exception as e:
        return f"  Could not empty Recycle Bin: {e}"


# ── Windows & Hotkey Macros ────────────────────────────────

def copy_text():
    if not PYAUTOGUI_AVAILABLE: return "  pyautogui not installed"
    pyautogui.hotkey('ctrl', 'c')
    return " Copied"

def paste_text():
    if not PYAUTOGUI_AVAILABLE: return "  pyautogui not installed"
    pyautogui.hotkey('ctrl', 'v')
    return " Pasted"

def save_file():
    if not PYAUTOGUI_AVAILABLE: return "  pyautogui not installed"
    pyautogui.hotkey('ctrl', 's')
    return " Saved"

def select_all():
    if not PYAUTOGUI_AVAILABLE: return "  pyautogui not installed"
    pyautogui.hotkey('ctrl', 'a')
    return "🟦 Selected all text"

def minimize_windows():
    if not PYAUTOGUI_AVAILABLE: return "  pyautogui not installed"
    pyautogui.hotkey('win', 'd')
    return " Minimized everything to desktop"

def maximize_window():
    import ctypes
    import time
    import winsound
    # Beep to notify user to click their target window
    winsound.Beep(1500, 200)
    time.sleep(1.5) 
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    ctypes.windll.user32.ShowWindow(hwnd, 3) # 3 = SW_MAXIMIZE
    return " Maximized current window"

def start_deep_work():
    import os
    import subprocess
    try:
        # Launch browser to github
        os.system("start msedge https://github.com")
        # Launch WhatsApp Windows Client
        os.system("start whatsapp:")
        time.sleep(1)
        # Try to launch Visual Studio Code in a detached shell
        subprocess.Popen("code .", shell=True)
        return "🧠 Deep Work Mode Activated: Opened GitHub, WhatsApp, and VS Code"
    except Exception as e:
        return f"  Deep Work routine failed: {e}"


def set_alarm(raw):
    """Set an alarm. Expect input containing a time (HH:MM). Optional trailing text becomes the task."""
    import re
    if not raw or not isinstance(raw, str):
        return "  Please provide a time. Example: set alarm 07:30 to wake up"

    m = re.search(r"(\d{1,2}:\d{2})", raw)
    if not m:
        return "  Could not find a time. Use HH:MM format (e.g. 07:30)."

    time_str = m.group(1)
    # Remove the matched time from the text to use remaining as task
    task = re.sub(r"(\d{1,2}:\d{2})", '', raw).strip()
    if not task:
        task = 'Alarm'

    if SCHEDULER_AVAILABLE:
        try:
            _scheduler.add_schedule(time_str, task)
        except Exception as e:
            return f"  Scheduler error: {e}"
    else:
        return "  Scheduler not available (make sure agent/scheduler.py exists and is importable)."

    # Speak confirmation if possible
    confirm = f"Alarm set for {time_str}: {task}"
    if TTS_AVAILABLE:
        try:
            engine = pyttsx3.init()
            engine.say(confirm)
            engine.runAndWait()
        except Exception:
            pass

    return f" {confirm}"


# Simple commands (no arguments)
AUTOMATION_COMMANDS = {
    "scroll up":        scroll_up,
    "scroll down":      scroll_down,
    "click":            click_mouse,
    "empty recycle bin": empty_recycle_bin,
    "copy text":        copy_text,
    "paste text":       paste_text,
    "save file":        save_file,
    "select all":       select_all,
    "minimize windows": minimize_windows,
    "maximize window":  maximize_window,
    "start deep work":  start_deep_work,
    "click picture":    take_picture,
}

# Parameterized commands (take a string argument)
AUTOMATION_PARAM_COMMANDS = {
    "type": type_text,
    "write in notepad": write_in_notepad,
    "set alarm": set_alarm,
}

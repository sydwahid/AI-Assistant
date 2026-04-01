import time

try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    pyautogui = None
    PYAUTOGUI_AVAILABLE = False

try:
    import pyttsx3
    TTS_AVAILABLE = True
except Exception:
    pyttsx3 = None
    TTS_AVAILABLE = False

try:
    from .. import scheduler as _scheduler
    SCHEDULER_AVAILABLE = True
except Exception:
    try:
        import scheduler as _scheduler
        SCHEDULER_AVAILABLE = True
    except Exception:
        _scheduler = None
        SCHEDULER_AVAILABLE = False


def type_text(text):
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed, so typing is unavailable."
    if not text:
        return "ERROR: Please provide text to type. Example: type Hello World"

    time.sleep(2)
    pyautogui.typewrite(text, interval=0.03)
    return f"Typed: '{text}'"


def write_in_notepad(text):
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."

    import os

    os.startfile("notepad.exe")
    time.sleep(1.5)
    if text:
        pyautogui.typewrite(text, interval=0.03)
    return f"Wrote in Notepad: '{text}'"


def take_picture():
    import os
    import winsound
    from datetime import datetime

    try:
        import cv2
    except ImportError:
        return "ERROR: opencv-python is not installed in the agent environment."

    def open_camera():
        backend_candidates = [
            ("MSMF", cv2.CAP_MSMF),
            ("DSHOW", cv2.CAP_DSHOW),
            ("ANY", cv2.CAP_ANY),
        ]

        for camera_index in (0, 1, 2):
            for backend_name, backend_flag in backend_candidates:
                try:
                    cap = cv2.VideoCapture(camera_index, backend_flag)
                except Exception:
                    continue

                if cap is not None and cap.isOpened():
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                    return cap, camera_index, backend_name

                if cap is not None:
                    cap.release()

        return None, None, None

    cap, camera_index, backend_name = open_camera()
    if cap is None:
        return (
            "ERROR: Failed to access your hardware camera. "
            "Check Windows camera permissions and whether another app is using it."
        )

    frame = None
    try:
        warmup_deadline = time.time() + 2.5
        while time.time() < warmup_deadline:
            ret, latest_frame = cap.read()
            if ret and latest_frame is not None:
                frame = latest_frame
            time.sleep(0.08)

        winsound.Beep(1000, 250)
        time.sleep(0.15)
        winsound.Beep(1000, 250)
        time.sleep(0.15)
        winsound.Beep(1800, 500)

        ret, latest_frame = cap.read()
        if ret and latest_frame is not None:
            frame = latest_frame
    finally:
        cap.release()
        cv2.destroyAllWindows()

    if frame is None:
        return "ERROR: The camera opened, but no frame was captured."

    save_folder = r"C:\Users\sayye\OneDrive\Pictures\Camera Roll"
    os.makedirs(save_folder, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(save_folder, f"Jarvis_Selfie_{timestamp}.jpg")
    if not cv2.imwrite(filepath, frame):
        return "ERROR: The picture was captured but could not be saved."

    return f"Picture taken and saved to {filepath} using camera {camera_index} ({backend_name})."


def scroll_up():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.scroll(5)
    return "Scrolled up"


def scroll_down():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.scroll(-5)
    return "Scrolled down"


def click_mouse():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.click()
    return "Clicked at the current mouse position"


def empty_recycle_bin():
    import ctypes

    try:
        ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 0x07)
        return "Recycle Bin emptied"
    except Exception as e:
        return f"ERROR: Could not empty Recycle Bin: {e}"


def copy_text():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.hotkey("ctrl", "c")
    return "Copied"


def paste_text():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.hotkey("ctrl", "v")
    return "Pasted"


def save_file():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.hotkey("ctrl", "s")
    return "Saved"


def select_all():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.hotkey("ctrl", "a")
    return "Selected all text"


def minimize_windows():
    if not PYAUTOGUI_AVAILABLE:
        return "ERROR: pyautogui is not installed."
    pyautogui.hotkey("win", "d")
    return "Minimized everything to the desktop"


def maximize_window():
    import ctypes
    import winsound

    winsound.Beep(1500, 200)
    time.sleep(1.5)
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    ctypes.windll.user32.ShowWindow(hwnd, 3)
    return "Maximized the current window"


def start_deep_work():
    import os
    import subprocess

    try:
        os.system("start msedge https://github.com")
        os.system("start whatsapp:")
        time.sleep(1)
        subprocess.Popen("code .", shell=True)
        return "Deep Work Mode activated: opened GitHub, WhatsApp, and VS Code"
    except Exception as e:
        return f"ERROR: Deep Work routine failed: {e}"


def set_alarm(raw):
    import re

    if not raw or not isinstance(raw, str):
        return "ERROR: Please provide a time. Example: set alarm 07:30 to wake up"

    match = re.search(r"(\d{1,2}:\d{2})", raw)
    if not match:
        return "ERROR: Could not find a time. Use HH:MM format, for example 07:30."

    time_str = match.group(1)
    task = re.sub(r"(\d{1,2}:\d{2})", "", raw).strip()
    if not task:
        task = "Alarm"

    if not SCHEDULER_AVAILABLE:
        return "ERROR: Scheduler is not available."

    try:
        _scheduler.add_schedule(time_str, task)
    except Exception as e:
        return f"ERROR: Scheduler error: {e}"

    confirmation = f"Alarm set for {time_str}: {task}"
    if TTS_AVAILABLE:
        try:
            engine = pyttsx3.init()
            engine.say(confirmation)
            engine.runAndWait()
        except Exception:
            pass

    return confirmation


AUTOMATION_COMMANDS = {
    "scroll up": scroll_up,
    "scroll down": scroll_down,
    "click": click_mouse,
    "empty recycle bin": empty_recycle_bin,
    "copy text": copy_text,
    "paste text": paste_text,
    "save file": save_file,
    "select all": select_all,
    "minimize windows": minimize_windows,
    "maximize window": maximize_window,
    "start deep work": start_deep_work,
    "click picture": take_picture,
}


AUTOMATION_PARAM_COMMANDS = {
    "type": type_text,
    "write in notepad": write_in_notepad,
    "set alarm": set_alarm,
}

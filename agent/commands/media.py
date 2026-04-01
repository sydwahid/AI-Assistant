import os
from datetime import datetime

try:
    import pyautogui
except ImportError:
    pyautogui = None

try:
    import comtypes
    from ctypes import cast, POINTER
    from comtypes import CLSCTX_ALL
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
    PYCAW_AVAILABLE = True
except ImportError:
    PYCAW_AVAILABLE = False
except Exception:
    PYCAW_AVAILABLE = False

try:
    import screen_brightness_control as sbc
    SBC_AVAILABLE = True
except ImportError:
    SBC_AVAILABLE = False


# ─── Volume helpers ───────────────────────────────────────────────────────

def _get_volume_interface():
    comtypes.CoInitialize()
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
    return cast(interface, POINTER(IAudioEndpointVolume))


def mute():
    if not PYCAW_AVAILABLE:
        return "❌ pycaw not installed — cannot control volume"
    volume = _get_volume_interface()
    volume.SetMute(1, None)
    return "🔇 Sound muted"


def unmute():
    if not PYCAW_AVAILABLE:
        return "❌ pycaw not installed — cannot control volume"
    volume = _get_volume_interface()
    volume.SetMute(0, None)
    return "🔊 Sound unmuted"


def volume_up():
    if not PYCAW_AVAILABLE:
        return "❌ pycaw not installed — cannot control volume"
    vol = _get_volume_interface()
    current = vol.GetMasterVolumeLevelScalar()
    new_level = min(1.0, current + 0.1)
    vol.SetMasterVolumeLevelScalar(new_level, None)
    return f"🔊 Volume: {int(new_level * 100)}%"


def volume_down():
    if not PYCAW_AVAILABLE:
        return "❌ pycaw not installed — cannot control volume"
    vol = _get_volume_interface()
    current = vol.GetMasterVolumeLevelScalar()
    new_level = max(0.0, current - 0.1)
    vol.SetMasterVolumeLevelScalar(new_level, None)
    return f"🔉 Volume: {int(new_level * 100)}%"


# ─── Brightness helpers ──────────────────────────────────────────────────

def brightness_up():
    if not SBC_AVAILABLE:
        return "❌ screen_brightness_control not installed"
    try:
        current = sbc.get_brightness()[0]
        new_val = min(100, current + 10)
        sbc.set_brightness(new_val)
        return f"🔆 Brightness: {new_val}%"
    except Exception as e:
        return f"❌ Brightness error: {e}"


def brightness_down():
    if not SBC_AVAILABLE:
        return "❌ screen_brightness_control not installed"
    try:
        current = sbc.get_brightness()[0]
        new_val = max(0, current - 10)
        sbc.set_brightness(new_val)
        return f"🔅 Brightness: {new_val}%"
    except Exception as e:
        return f"❌ Brightness error: {e}"


# ─── Screenshot ───────────────────────────────────────────────────────────

def screenshot():
    try:
        from PIL import ImageGrab
    except ImportError:
        return "❌ Pillow (PIL) library not installed — cannot take screenshot"
        
    try:
        # Ensure the custom personal directory explicitly exists
        target_dir = r"C:\Users\sayye\OneDrive\Pictures\Screenshots"
        os.makedirs(target_dir, exist_ok=True)
        
        filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        path = os.path.join(target_dir, filename)
        
        # Using Pillow directly bypasses the fatal pyscreeze conflict in PyAutoGUI!
        img = ImageGrab.grab(all_screens=True)
        img.save(path)
        
        # Clean, concise Voice Feedback
        return "📸 screenshot taken and it saved"
    except Exception as e:
        return f"❌ Screenshot failed: {e}"


# ─── Media Controls ───────────────────────────────────────────────────────

def play_pause_media():
    if not pyautogui:
        return "❌ pyautogui not installed"
    pyautogui.press('playpause')
    return "⏯️ Toggled Play/Pause"

def next_track():
    if not pyautogui:
        return "❌ pyautogui not installed"
    pyautogui.press('nexttrack')
    return "⏭️ Skipped to next track"


MEDIA_COMMANDS = {
    "mute":            mute,
    "unmute":          unmute,
    "volume up":       volume_up,
    "volume down":     volume_down,
    "brightness up":   brightness_up,
    "brightness down": brightness_down,
    "screenshot":      screenshot,
    "play pause track": play_pause_media,
    "next track":      next_track,
}

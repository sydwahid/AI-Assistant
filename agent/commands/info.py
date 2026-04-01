import platform
import socket
from datetime import datetime

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


def get_time():
    now = datetime.now()
    return f"🕐 Current time: **{now.strftime('%I:%M %p')}**"


def get_date():
    now = datetime.now()
    return f"📅 Today's date: **{now.strftime('%A, %B %d, %Y')}**"


def get_ip():
    if not REQUESTS_AVAILABLE:
        return "❌ requests library not installed"
    try:
        response = requests.get("https://api.ipify.org?format=json", timeout=5)
        ip = response.json()["ip"]
        # Also get local IP
        local_ip = socket.gethostbyname(socket.gethostname())
        return f"🌐 **IP Address**\n\nPublic: {ip}\nLocal: {local_ip}"
    except Exception as e:
        return f"❌ Could not fetch IP: {e}"


def get_battery():
    if not PSUTIL_AVAILABLE:
        return "❌ psutil not installed"
    battery = psutil.sensors_battery()
    if battery is None:
        return "❌ No battery detected (desktop PC?)"
    percent = battery.percent
    charging = "🔌 Plugged in" if battery.power_plugged else "🔋 On battery"
    # Estimate time remaining
    if battery.secsleft > 0 and not battery.power_plugged:
        hours = battery.secsleft // 3600
        mins = (battery.secsleft % 3600) // 60
        remaining = f"\n⏱️ Time remaining: {hours}h {mins}m"
    else:
        remaining = ""
    return f"🔋 **Battery: {percent}%**\n{charging}{remaining}"


def get_system_info():
    info_lines = [f"💻 **System Information**\n"]
    info_lines.append(f"OS: {platform.system()} {platform.version()}")
    info_lines.append(f"Machine: {platform.machine()}")
    info_lines.append(f"Processor: {platform.processor()}")
    info_lines.append(f"Hostname: {socket.gethostname()}")
    if PSUTIL_AVAILABLE:
        cpu_count = psutil.cpu_count(logical=True)
        ram = psutil.virtual_memory()
        ram_total = round(ram.total / (1024 ** 3), 1)
        info_lines.append(f"CPU Cores: {cpu_count}")
        info_lines.append(f"RAM: {ram_total} GB")
    return "\n".join(info_lines)


def get_cpu_usage():
    if not PSUTIL_AVAILABLE:
        return "❌ psutil not installed"
    cpu_percent = psutil.cpu_percent(interval=1)
    return f"⚡ **CPU Usage: {cpu_percent}%**"


def get_ram_usage():
    if not PSUTIL_AVAILABLE:
        return "❌ psutil not installed"
    ram = psutil.virtual_memory()
    used = round(ram.used / (1024 ** 3), 1)
    total = round(ram.total / (1024 ** 3), 1)
    percent = ram.percent
    return f"🧠 **RAM Usage: {used} GB / {total} GB ({percent}%)**"


INFO_COMMANDS = {
    "time":        get_time,
    "date":        get_date,
    "ip address":  get_ip,
    "battery":     get_battery,
    "system info": get_system_info,
    "cpu usage":   get_cpu_usage,
    "ram usage":   get_ram_usage,
}

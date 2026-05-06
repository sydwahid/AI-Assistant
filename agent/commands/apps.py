import os
import webbrowser


def open_notepad():
    os.startfile("notepad.exe")
    return " Notepad opened"


def open_calculator():
    os.startfile("calc.exe")
    return " Calculator opened"


def open_browser():
    webbrowser.open("https://google.com")
    return " Browser opened"


def open_file_explorer():
    os.startfile("explorer.exe")
    return " File Explorer opened"


def open_task_manager():
    os.system("taskmgr")
    return " Task Manager opened"


def open_terminal():
    os.system("start cmd")
    return "Terminal opened"


def open_paint():
    os.startfile("mspaint.exe")
    return " Paint opened"


def open_wordpad():
    os.system("write")
    return " WordPad opened"


def open_camera():
    os.system("start microsoft.windows.camera:")
    return " Camera opened"


def open_settings():
    os.system("start ms-settings:")
    return " Settings opened"


def open_snipping_tool():
    os.system("snippingtool")
    return " Snipping Tool opened"


def open_control_panel():
    os.system("control")
    return " Control Panel opened"


def open_clock():
    os.system("start ms-clock:")
    return " Clock opened"


def open_store():
    os.system("start ms-windows-store:")
    return " Microsoft Store opened"


def open_device_manager():
    os.system("devmgmt.msc")
    return " Device Manager opened"


def open_youtube():
    webbrowser.open("https://youtube.com")
    return " YouTube opened"


def open_github():
    webbrowser.open("https://github.com")
    return " GitHub opened"


def open_spotify():
    os.system("start spotify:")
    return " Spotify opened"


APP_COMMANDS = {
    "open notepad":        open_notepad,
    "open calculator":     open_calculator,
    "open browser":        open_browser,
    "open file explorer":  open_file_explorer,
    "open task manager":   open_task_manager,
    "open terminal":       open_terminal,
    "open paint":          open_paint,
    "open wordpad":        open_wordpad,
    "open camera":         open_camera,
    "open settings":       open_settings,
    "open snipping tool":  open_snipping_tool,
    "open control panel":  open_control_panel,
    "open clock":          open_clock,
    "open store":          open_store,
    "open device manager": open_device_manager,
    "open youtube":        open_youtube,
    "open github":         open_github,
    "open spotify":        open_spotify,
}

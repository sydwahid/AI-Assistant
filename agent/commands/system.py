import os
import ctypes


def shutdown():
    os.system("shutdown /s /t 5")
    return " Shutting down in 5 seconds..."


def restart():
    os.system("shutdown /r /t 5")
    return " Restarting in 5 seconds..."


def sleep():
    # SetSuspendState(hibernate, force, wakeupEventsDisabled)
    ctypes.windll.powrprof.SetSuspendState(0, 1, 0)
    return " Going to sleep..."


def lock_screen():
    ctypes.windll.user32.LockWorkStation()
    return " Screen locked"


def log_off():
    os.system("shutdown /l")
    return " Logging off..."


def cancel_shutdown():
    os.system("shutdown /a")
    return " Shutdown cancelled"


SYSTEM_COMMANDS = {
    "shutdown":        shutdown,
    "restart":         restart,
    "sleep":           sleep,
    "lock screen":     lock_screen,
    "log off":         log_off,
    "cancel shutdown": cancel_shutdown,
}

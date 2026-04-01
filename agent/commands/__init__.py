"""
Command dispatcher — routes incoming command strings to the correct handler.

Command format:
  - Simple:       "open notepad"
  - Parameterized: "wikipedia:Albert Einstein"
"""

from .apps import APP_COMMANDS
from .system import SYSTEM_COMMANDS
from .media import MEDIA_COMMANDS
from .web_clean import WEB_PARAM_COMMANDS
from .info import INFO_COMMANDS
from .fun import FUN_COMMANDS
from .automation_clean import AUTOMATION_COMMANDS, AUTOMATION_PARAM_COMMANDS


# ─── Merge all simple commands into one dict ──────────────────────────────
ALL_SIMPLE_COMMANDS = {
    **APP_COMMANDS,
    **SYSTEM_COMMANDS,
    **MEDIA_COMMANDS,
    **INFO_COMMANDS,
    **FUN_COMMANDS,
    **AUTOMATION_COMMANDS,
}

# ─── Merge all parameterized commands ─────────────────────────────────────
ALL_PARAM_COMMANDS = {
    **WEB_PARAM_COMMANDS,
    **AUTOMATION_PARAM_COMMANDS,
}


def dispatch_command(cmd: str) -> str:
    """
    Dispatch a command string to the appropriate handler.

    Args:
        cmd: Either a simple command ("open notepad") or
             parameterized ("wikipedia:Albert Einstein")

    Returns:
        Result string to send back to frontend
    """
    try:
        # 1. Check for parameterized commands (contains ":")
        if ":" in cmd:
            prefix, _, args = cmd.partition(":")
            prefix = prefix.strip().lower()
            args = args.strip()
            if prefix in ALL_PARAM_COMMANDS:
                return ALL_PARAM_COMMANDS[prefix](args)

        # 2. Allow bare parameterized commands like "news" or "weather"
        cmd_lower = cmd.strip().lower()
        if cmd_lower in ALL_PARAM_COMMANDS:
            return ALL_PARAM_COMMANDS[cmd_lower]("")

        # 3. Check simple commands (exact match)
        if cmd_lower in ALL_SIMPLE_COMMANDS:
            return ALL_SIMPLE_COMMANDS[cmd_lower]()

        return f"❌ Unknown command: '{cmd}'"

    except Exception as e:
        return f"❌ Error executing '{cmd}': {e}"

import random

try:
    import pyjokes
    PYJOKES_AVAILABLE = True
except ImportError:
    PYJOKES_AVAILABLE = False


def tell_joke():
    if not PYJOKES_AVAILABLE:
        # Fallback jokes
        fallback = [
            "Why do programmers prefer dark mode? Because light attracts bugs.",
            "There are only 10 types of people in the world: those who understand binary and those who don't.",
            "A SQL query walks into a bar, walks up to two tables, and asks: 'Can I join you?'",
            "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
            "!false — it's funny because it's true.",
        ]
        return f"😄 {random.choice(fallback)}"
    return f"😄 {pyjokes.get_joke()}"


def coin_flip():
    result = random.choice(["Heads", "Tails"])
    emoji = "🪙" if result == "Heads" else "🪙"
    return f"{emoji} Coin flip: **{result}!**"


def roll_dice():
    result = random.randint(1, 6)
    dice_emoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]
    return f"🎲 {dice_emoji[result - 1]} You rolled a **{result}!**"


def random_number():
    num = random.randint(1, 100)
    return f"🔢 Random number (1-100): **{num}**"


def magic_8ball():
    responses = [
        "It is certain.", "Without a doubt.", "Yes, definitely.",
        "You may rely on it.", "Most likely.", "Outlook good.",
        "Signs point to yes.", "Reply hazy, try again.",
        "Ask again later.", "Better not tell you now.",
        "Cannot predict now.", "Concentrate and ask again.",
        "Don't count on it.", "My reply is no.",
        "My sources say no.", "Outlook not so good.", "Very doubtful."
    ]
    return f"🎱 **{random.choice(responses)}**"


FUN_COMMANDS = {
    "joke":          tell_joke,
    "coin flip":     coin_flip,
    "roll dice":     roll_dice,
    "random number": random_number,
    "magic 8ball":   magic_8ball,
}

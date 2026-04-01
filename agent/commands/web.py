import os
import webbrowser

try:
    import wikipedia
    WIKI_AVAILABLE = True
except ImportError:
    WIKI_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from dotenv import load_dotenv
load_dotenv()


def wikipedia_search(query):
    """Search Wikipedia and return a 2-sentence summary."""
    if not WIKI_AVAILABLE:
        return "❌ wikipedia library not installed"
    if not query:
        return "❌ Please provide a search query. Example: 'wikipedia Albert Einstein'"
    try:
        summary = wikipedia.summary(query, sentences=2)
        return f"📖 **{query.title()}**\n\n{summary}"
    except wikipedia.DisambiguationError as e:
        options = ", ".join(e.options[:5])
        return f"🔀 Multiple results. Did you mean: {options}?"
    except wikipedia.PageError:
        return f"❌ No Wikipedia page found for '{query}'"
    except Exception as e:
        return f"❌ Wikipedia error: {e}"


def get_weather(city):
    """Get current weather using OpenWeatherMap API."""
    if not REQUESTS_AVAILABLE:
        return "❌ requests library not installed"
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "❌ OPENWEATHER_API_KEY not set in agent/.env"
    if not city:
        return "❌ Please provide a city. Example: 'weather London'"
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        data = requests.get(url, timeout=10).json()
        if data.get("cod") != 200:
            return f"❌ Weather error: {data.get('message', 'City not found')}"
        temp = data["main"]["temp"]
        feels = data["main"]["feels_like"]
        desc = data["weather"][0]["description"].title()
        humidity = data["main"]["humidity"]
        wind = data["wind"]["speed"]
        name = data["name"]
        return (
            f"🌡️ **Weather in {name}**\n\n"
            f"🌤️ {desc}\n"
            f"🌡️ Temperature: {temp}°C (feels like {feels}°C)\n"
            f"💧 Humidity: {humidity}%\n"
            f"💨 Wind: {wind} m/s"
        )
    except Exception as e:
        return f"❌ Weather error: {e}"


def get_news(topic=""):
    """Get top news headlines using NewsAPI."""
    if not REQUESTS_AVAILABLE:
        return "❌ requests library not installed"
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        return "❌ NEWS_API_KEY not set in agent/.env"
    try:
        if topic:
            url = f"https://newsapi.org/v2/everything?q={topic}&pageSize=5&apiKey={api_key}"
        else:
            url = f"https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey={api_key}"
        data = requests.get(url, timeout=10).json()
        if data.get("status") != "ok":
            return f"❌ News error: {data.get('message', 'Unknown error')}"
        articles = data.get("articles", [])
        if not articles:
            return "❌ No news articles found"
        lines = [f"📰 **Top Headlines{' — ' + topic.title() if topic else ''}**\n"]
        for i, article in enumerate(articles[:5], 1):
            title = article.get("title", "No title")
            source = article.get("source", {}).get("name", "Unknown")
            lines.append(f"{i}. **{title}** — _{source}_")
        return "\n".join(lines)
    except Exception as e:
        return f"❌ News error: {e}"


def google_search(query):
    """Open Google search in browser."""
    if not query:
        return "❌ Please provide a search query. Example: 'search Python tutorials'"
    webbrowser.open(f"https://www.google.com/search?q={query}")
    return f"🔍 Searching Google for: **{query}**"


def open_url(url):
    """Open a URL in browser."""
    if not url:
        return "❌ Please provide a URL"
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    webbrowser.open(url)
    return f"🌐 Opening: {url}"


# Parameterized commands (take a string argument)
WEB_PARAM_COMMANDS = {
    "wikipedia":  wikipedia_search,
    "weather":    get_weather,
    "news":       get_news,
    "search":     google_search,
    "open url":   open_url,
}

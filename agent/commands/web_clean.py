import os
import webbrowser
from pathlib import Path

from dotenv import load_dotenv

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    requests = None
    REQUESTS_AVAILABLE = False

try:
    import wikipedia
    WIKI_AVAILABLE = True
except ImportError:
    wikipedia = None
    WIKI_AVAILABLE = False

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _get_env(name, default):
    value = os.getenv(name, "")
    cleaned = value.strip().strip('"').strip("'")
    return cleaned or default


DEFAULT_WEATHER_CITY = _get_env("DEFAULT_WEATHER_CITY", "Thane")
DEFAULT_NEWS_COUNTRY = _get_env("NEWS_COUNTRY", "in").lower()
DEFAULT_NEWS_FALLBACK_QUERY = _get_env("NEWS_FALLBACK_QUERY", "India")


def _build_session():
    session = requests.Session()
    session.trust_env = False
    return session


def _fetch_json(url, params):
    session = _build_session()
    response = session.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def _extract_news_titles(data):
    articles = data.get("articles", [])[:5]
    return [
        (article.get("title") or "No title").strip()
        for article in articles
        if (article.get("title") or "").strip()
    ]


def _format_news_lines(titles):
    return "\n".join(f"{index}. {title}" for index, title in enumerate(titles, 1))


def wikipedia_search(query):
    if not WIKI_AVAILABLE:
        return "ERROR: wikipedia library is not installed."
    if not query:
        return "Please clarify your request"

    try:
        summary = wikipedia.summary(query, sentences=2)
        return f"{query.title()}: {summary}"
    except wikipedia.DisambiguationError as e:
        options = ", ".join(e.options[:5])
        return f"Multiple results found for {query}. Try one of these: {options}"
    except wikipedia.PageError:
        return f"No Wikipedia page found for {query}"
    except Exception as e:
        return f"Wikipedia error: {e}"


def get_weather(city=""):
    if not REQUESTS_AVAILABLE:
        return "ERROR: requests library is not installed."

    api_key = _get_env("OPENWEATHER_API_KEY", "")
    if not api_key:
        return "ERROR: OPENWEATHER_API_KEY is not set in agent/.env"

    target_city = city.strip() or DEFAULT_WEATHER_CITY

    try:
        data = _fetch_json(
            "https://api.openweathermap.org/data/2.5/weather",
            {
                "q": target_city,
                "appid": api_key,
                "units": "metric",
            },
        )
        if data.get("cod") != 200:
            return f"Weather error: {data.get('message', 'City not found')}"

        resolved_city = data.get("name", target_city)
        temp = round(float(data["main"]["temp"]))
        description = data["weather"][0]["description"]
        return f"The current weather in {resolved_city} is {temp}°C with {description}"
    except Exception as e:
        return f"Weather error: {e}"


def get_news(topic=""):
    if not REQUESTS_AVAILABLE:
        return "ERROR: requests library is not installed."

    api_key = _get_env("NEWS_API_KEY", "")
    if not api_key:
        return "ERROR: NEWS_API_KEY is not set in agent/.env"

    try:
        if topic.strip():
            data = _fetch_json(
                "https://newsapi.org/v2/everything",
                {
                    "q": topic.strip(),
                    "pageSize": 5,
                    "sortBy": "publishedAt",
                    "language": "en",
                    "apiKey": api_key,
                },
            )
            if data.get("status") != "ok":
                return f"News error: {data.get('message', 'Unknown error')}"

            titles = _extract_news_titles(data)
            return _format_news_lines(titles) if titles else f"No recent news articles found for {topic.strip()}"

        data = _fetch_json(
            "https://newsapi.org/v2/top-headlines",
            {
                "country": DEFAULT_NEWS_COUNTRY,
                "pageSize": 5,
                "apiKey": api_key,
            },
        )
        if data.get("status") != "ok":
            return f"News error: {data.get('message', 'Unknown error')}"

        titles = _extract_news_titles(data)
        if titles:
            return _format_news_lines(titles)

        fallback_data = _fetch_json(
            "https://newsapi.org/v2/everything",
            {
                "q": DEFAULT_NEWS_FALLBACK_QUERY,
                "pageSize": 5,
                "sortBy": "publishedAt",
                "language": "en",
                "apiKey": api_key,
            },
        )
        if fallback_data.get("status") != "ok":
            return f"News error: {fallback_data.get('message', 'Unknown error')}"

        fallback_titles = _extract_news_titles(fallback_data)
        if fallback_titles:
            return _format_news_lines(fallback_titles)

        return (
            f"No news articles found for country '{DEFAULT_NEWS_COUNTRY}'. "
            f"Tried fallback query '{DEFAULT_NEWS_FALLBACK_QUERY}' too."
        )
    except Exception as e:
        return f"News error: {e}"


def google_search(query):
    if not query:
        return "Please clarify your request"
    webbrowser.open(f"https://www.google.com/search?q={query}")
    return f"Searching Google for {query}"


def open_url(url):
    if not url:
        return "Please clarify your request"
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    webbrowser.open(url)
    return f"Opening {url}"


WEB_PARAM_COMMANDS = {
    "wikipedia": wikipedia_search,
    "weather": get_weather,
    "news": get_news,
    "search": google_search,
    "open url": open_url,
}

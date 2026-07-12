"""Live-data briefings backing the welcome-screen suggestions.

Each suggestion has a dedicated function:
- ``get_stock_market_update``  -> Yahoo Finance chart API (no API key required)
- ``get_weather_forecast``     -> Open-Meteo forecast (no API key required)
- ``get_sports_update``        -> TheSportsDB free tier (shared public key)

``ChatService`` routes a matching chat message to the right function and lets
the LLM present the fetched data; without an LLM the raw briefing is returned.
"""
from __future__ import annotations

import logging
import re
from typing import Dict, List, Optional

import httpx

from app.core.config import Settings

logger = logging.getLogger("ai_secretary.briefing")

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php"

# Yahoo rejects requests without a browser-like user agent.
_YAHOO_HEADERS = {"User-Agent": "Mozilla/5.0"}

_INDEX_NAMES = {
    "^GSPC": "S&P 500",
    "^DJI": "Dow Jones",
    "^IXIC": "Nasdaq",
}

# WMO weather interpretation codes used by Open-Meteo.
_WEATHER_CODES = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "fog", 48: "depositing rime fog",
    51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle",
    61: "slight rain", 63: "moderate rain", 65: "heavy rain",
    66: "freezing rain", 67: "heavy freezing rain",
    71: "slight snow", 73: "moderate snow", 75: "heavy snow", 77: "snow grains",
    80: "slight rain showers", 81: "moderate rain showers", 82: "violent rain showers",
    85: "slight snow showers", 86: "heavy snow showers",
    95: "thunderstorm", 96: "thunderstorm with slight hail", 99: "thunderstorm with heavy hail",
}

_INTENT_PATTERNS = {
    "stocks": re.compile(r"\bstock(s| market)?\b|\bmarket update\b", re.IGNORECASE),
    "weather": re.compile(r"\bweather\b|\bforecast\b", re.IGNORECASE),
    "sports": re.compile(r"\bsports?\b", re.IGNORECASE),
}


class BriefingError(Exception):
    """Raised when a briefing's upstream data source fails."""


class BriefingService:
    """Fetches live stock, weather, and sports data for chat briefings."""

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient) -> None:
        self._settings = settings
        self._http = http_client

    @staticmethod
    def match_intent(message: str) -> Optional[str]:
        """Return the briefing intent a message asks for, if any."""
        for intent, pattern in _INTENT_PATTERNS.items():
            if pattern.search(message):
                return intent
        return None

    async def run(self, intent: str) -> str:
        handlers = {
            "stocks": self.get_stock_market_update,
            "weather": self.get_weather_forecast,
            "sports": self.get_sports_update,
        }
        return await handlers[intent]()

    # ── stock market ──────────────────────────────────────────────
    async def get_stock_market_update(self) -> str:
        symbols = [s.strip() for s in self._settings.stock_symbols.split(",") if s.strip()]
        lines: List[str] = []
        for symbol in symbols:
            try:
                data = await self._get_json(
                    YAHOO_CHART_URL.format(symbol=symbol),
                    params={"range": "1d", "interval": "1d"},
                    headers=_YAHOO_HEADERS,
                    source="Yahoo Finance",
                )
                meta = data["chart"]["result"][0]["meta"]
                price = float(meta["regularMarketPrice"])
                prev = float(meta.get("chartPreviousClose") or meta["previousClose"])
            except (BriefingError, KeyError, IndexError, TypeError, ValueError) as exc:
                logger.warning("Stock quote for %s failed: %s", symbol, exc)
                continue
            move = (price - prev) / prev * 100 if prev else 0.0
            arrow = "▲" if move >= 0 else "▼"
            name = _INDEX_NAMES.get(symbol, symbol)
            lines.append(f"- **{name}**: {price:,.2f} {arrow} {move:+.2f}% vs previous close")
        if not lines:
            raise BriefingError("No stock quotes could be fetched.")
        return "Stock market update:\n" + "\n".join(lines)

    # ── weather ───────────────────────────────────────────────────
    async def get_weather_forecast(self) -> str:
        params = {
            "latitude": self._settings.weather_latitude,
            "longitude": self._settings.weather_longitude,
            "current": "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
            "timezone": "auto",
            "forecast_days": 1,
        }
        data = await self._get_json(OPEN_METEO_URL, params=params, source="Open-Meteo")

        current = data.get("current") or {}
        daily = data.get("daily") or {}
        place = self._settings.weather_location_name
        desc = _WEATHER_CODES.get(current.get("weather_code"), "unknown conditions")
        lines = [
            f"Today's forecast for {place}:",
            f"- Now: {current.get('temperature_2m', '?')}°C ({desc}), "
            f"feels like {current.get('apparent_temperature', '?')}°C, "
            f"humidity {current.get('relative_humidity_2m', '?')}%, "
            f"wind {current.get('wind_speed_10m', '?')} km/h",
        ]
        try:
            day_desc = _WEATHER_CODES.get((daily.get("weather_code") or [None])[0], "unknown conditions")
            lines.append(
                f"- Today: high {daily['temperature_2m_max'][0]}°C / low {daily['temperature_2m_min'][0]}°C, "
                f"{day_desc}, {daily['precipitation_probability_max'][0]}% chance of rain"
            )
        except (KeyError, IndexError, TypeError):
            pass
        return "\n".join(lines)

    # ── sports ────────────────────────────────────────────────────
    async def get_sports_update(self) -> str:
        league_ids = [l.strip() for l in self._settings.sports_leagues.split(",") if l.strip()]
        sections: List[str] = []
        for league_id in league_ids:
            try:
                data = await self._get_json(
                    SPORTSDB_URL, params={"id": league_id}, source="TheSportsDB"
                )
            except BriefingError as exc:
                logger.warning("Sports feed %s failed: %s", league_id, exc)
                continue
            events = data.get("events") or []
            games = [_format_event(e) for e in events[:3]]
            games = [g for g in games if g]
            if games:
                label = events[0].get("strLeague") or f"League {league_id}"
                sections.append(f"**{label}**\n" + "\n".join(games))
        if not sections:
            raise BriefingError("No recent games found for any configured league.")
        return "Sports update (latest results):\n" + "\n\n".join(sections)

    # ── http helper ───────────────────────────────────────────────
    async def _get_json(
        self, url: str, *, params: Dict, source: str, headers: Optional[Dict] = None
    ) -> Dict:
        try:
            resp = await self._http.get(url, params=params, headers=headers, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as exc:
            raise BriefingError(f"{source} request failed: {exc}") from exc
        except ValueError as exc:
            raise BriefingError(f"{source} returned invalid JSON.") from exc


def _format_event(event: Dict) -> Optional[str]:
    home, away = event.get("strHomeTeam"), event.get("strAwayTeam")
    if not home or not away:
        return None
    home_score, away_score = event.get("intHomeScore"), event.get("intAwayScore")
    score = (
        f" {home_score}-{away_score}"
        if home_score is not None and away_score is not None
        else ""
    )
    date = event.get("dateEvent") or ""
    return f"- {home} vs {away}{score} ({date})".replace("  ", " ")

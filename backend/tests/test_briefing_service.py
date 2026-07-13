"""Tests for the live-data briefings behind the welcome-screen suggestions."""
from __future__ import annotations

import json

import httpx
import pytest

from app.services.briefing_service import BriefingError, BriefingService
from app.services.chat_service import ChatService
from app.services.llm_service import LLMService

from tests.conftest import FakeLLMProvider

def _yahoo_chart(symbol: str, price: float, prev_close: float) -> dict:
    return {
        "chart": {
            "result": [
                {"meta": {
                    "symbol": symbol,
                    "regularMarketPrice": price,
                    "chartPreviousClose": prev_close,
                }}
            ]
        }
    }


_YAHOO_QUOTES = {
    "^GSPC": _yahoo_chart("^GSPC", 6262.0, 6200.0),
    "^DJI": _yahoo_chart("^DJI", 43890.0, 44000.0),
}


def yahoo_handler(request: httpx.Request) -> httpx.Response:
    symbol = request.url.path.rsplit("/", 1)[-1]
    if symbol not in _YAHOO_QUOTES:
        return httpx.Response(404)
    return httpx.Response(200, text=json.dumps(_YAHOO_QUOTES[symbol]))

OPEN_METEO_JSON = {
    "current": {
        "temperature_2m": 31.2,
        "apparent_temperature": 36.0,
        "relative_humidity_2m": 70,
        "weather_code": 80,
        "wind_speed_10m": 12.5,
    },
    "daily": {
        "temperature_2m_max": [33.1],
        "temperature_2m_min": [26.4],
        "precipitation_probability_max": [60],
        "weather_code": [95],
    },
}

SPORTSDB_JSON = {
    "events": [
        {
            "strLeague": "MLB",
            "strHomeTeam": "Yankees",
            "strAwayTeam": "Red Sox",
            "intHomeScore": "5",
            "intAwayScore": "3",
            "dateEvent": "2026-07-09",
        }
    ]
}


def _service(settings, handler) -> BriefingService:
    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return BriefingService(settings, client)


# ── intent matching ───────────────────────────────────────────────
def test_match_intent_recognizes_each_suggestion():
    assert BriefingService.match_intent("Show me today's stock market update.") == "stocks"
    assert BriefingService.match_intent("What's today's weather forecast?") == "weather"
    assert BriefingService.match_intent("Give me the latest sports update.") == "sports"


def test_match_intent_ignores_ordinary_chat():
    assert BriefingService.match_intent("summarize this document for me") is None
    assert BriefingService.match_intent("how many vacation days do I get?") is None


# ── stocks ────────────────────────────────────────────────────────
async def test_stock_update_parses_quotes_and_skips_failed_symbols(settings):
    # ^IXIC 404s in the fake feed; the other two indices still come through.
    text = await _service(settings, yahoo_handler).get_stock_market_update()

    assert "S&P 500" in text
    assert "6,262.00" in text
    assert "+1.00%" in text  # (6262 - 6200) / 6200
    assert "Dow Jones" in text
    assert "-0.25%" in text  # (43890 - 44000) / 44000
    assert "Nasdaq" not in text


async def test_stock_update_raises_when_feed_is_down(settings):
    def handler(request):
        return httpx.Response(500)

    with pytest.raises(BriefingError):
        await _service(settings, handler).get_stock_market_update()


# ── weather ───────────────────────────────────────────────────────
async def test_weather_forecast_formats_current_and_daily(settings):
    def handler(request):
        return httpx.Response(200, text=json.dumps(OPEN_METEO_JSON))

    text = await _service(settings, handler).get_weather_forecast()

    assert "Manila" in text
    assert "31.2°C" in text
    assert "high 33.1°C / low 26.4°C" in text
    assert "60% chance of rain" in text


# ── sports ────────────────────────────────────────────────────────
async def test_sports_update_lists_games_per_league(settings):
    def handler(request):
        return httpx.Response(200, text=json.dumps(SPORTSDB_JSON))

    text = await _service(settings, handler).get_sports_update()

    assert "MLB" in text
    assert "Yankees vs Red Sox 5-3" in text
    assert "2026-07-09" in text


async def test_sports_update_raises_when_all_feeds_fail(settings):
    def handler(request):
        return httpx.Response(500)

    with pytest.raises(BriefingError):
        await _service(settings, handler).get_sports_update()


# ── chat routing ──────────────────────────────────────────────────
async def test_chat_routes_briefing_through_llm(settings):
    provider = FakeLLMProvider(reply="Markets are up today.")
    service = ChatService(
        settings=settings,
        llm=LLMService(provider),
        pipeline=None,
        briefing=_service(settings, yahoo_handler),
    )

    reply = await service.respond("Show me today's stock market update.")

    assert reply.reply == "Markets are up today."
    # The LLM was given the fetched data, not asked to invent it.
    assert "S&P 500" in provider.chat_calls[-1][-1]["content"]


async def test_chat_returns_raw_briefing_without_llm(settings):
    service = ChatService(
        settings=settings, llm=None, pipeline=None, briefing=_service(settings, yahoo_handler)
    )

    reply = await service.respond("Show me today's stock market update.")

    assert reply.degraded is True
    assert "S&P 500" in reply.reply


async def test_chat_falls_back_to_llm_when_briefing_fails(settings):
    def handler(request):
        return httpx.Response(500)

    provider = FakeLLMProvider(reply="Sorry, I couldn't fetch live data.")
    service = ChatService(
        settings=settings,
        llm=LLMService(provider),
        pipeline=None,
        briefing=_service(settings, handler),
    )

    reply = await service.respond("Show me today's stock market update.")

    assert reply.reply == "Sorry, I couldn't fetch live data."

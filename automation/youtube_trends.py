#!/usr/bin/env python3
"""Genera el radar editorial de armas a partir de la API oficial de YouTube.

El resultado NO representa uso competitivo ni una métrica oficial de YouTube.
Es una clasificación editorial de WZ Meta basada en una muestra de videos
recientes que mencionan cada arma del meta.

Seguridad y cumplimiento:
  - la API key solo se lee desde YOUTUBE_API_KEY y nunca se escribe ni imprime;
  - solo se consultan las 20 armas ya marcadas ``inMeta`` en armas-data.json;
  - la salida conserva como máximo 14 días de posiciones históricas;
  - cada arma se consulta en cuatro ventanas semanales equilibradas;
  - ante falta de credencial, cualquier búsqueda incompleta o una muestra vacía, se conserva
    el último JSON válido para no romper el sitio;
  - los nombres, slugs e imágenes publicados salen del catálogo local.

Uso normal:
    python _build/youtube_trends.py

Primera carga sin consumir la API (usa el cache oficial videos-armas.json):
    python _build/youtube_trends.py --bootstrap
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import re
import tempfile
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE = Path(__file__).resolve().parent.parent
ARMAS_DATA = BASE / "armas-data.json"
VIDEO_CACHE = BASE / "videos-armas.json"
OUTPUT = BASE / "youtube-trends.json"

SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
SCHEMA_VERSION = 1
TRACKED_LIMIT = 20
SEARCH_LIMIT = 50
WINDOW_DAYS = 28
WEEK_DAYS = 7
SEARCH_WINDOWS = WINDOW_DAYS // WEEK_DAYS
HISTORY_DAYS = 14
MAX_RESPONSE_BYTES = 5_000_000
USER_AGENT = "WZMeta-YouTube-Trends/1.0 (+https://wzmetaloadouts.com/)"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_z(value: datetime) -> str:
    return value.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace(
        "+00:00", "Z"
    )


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(
            timezone.utc
        )
    except (TypeError, ValueError):
        return None


def normalize(value: str | None) -> str:
    text = unicodedata.normalize("NFD", (value or "").lower())
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def contains_weapon(text: str, weapon_name: str) -> bool:
    haystack = f" {normalize(text)} "
    tokens = [token for token in normalize(weapon_name).split() if len(token) >= 2]
    return bool(tokens) and all(f" {token} " in haystack for token in tokens)


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return default


def tracked_weapons(catalog: dict, limit: int = TRACKED_LIMIT) -> list[dict]:
    candidates = []
    for slug, weapon in (catalog.get("armas") or {}).items():
        rank = weapon.get("_autoRank")
        if not weapon.get("inMeta") or not isinstance(rank, (int, float)):
            continue
        if not re.fullmatch(r"[a-z0-9-]+", slug):
            continue
        name = str(weapon.get("nombre") or "").strip()
        image = str(weapon.get("imagen") or "").strip()
        if not name or not image.startswith("/"):
            continue
        candidates.append(
            {
                "slug": slug,
                "name": name,
                "image": image,
                # Solo se usa para elegir las 20 armas a consultar. No forma
                # parte del radar ni se combina con las métricas de YouTube.
                "_catalogRank": int(rank),
            }
        )
    candidates.sort(key=lambda item: (item["_catalogRank"], item["name"]))
    return candidates[:limit]


def api_get(url: str, params: dict) -> dict:
    request = Request(
        f"{url}?{urlencode(params)}",
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
    )
    with urlopen(request, timeout=25) as response:
        raw = response.read(MAX_RESPONSE_BYTES + 1)
    if len(raw) > MAX_RESPONSE_BYTES:
        raise ValueError("La respuesta de YouTube excede el límite seguro")
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Respuesta inesperada de YouTube")
    return data


def weekly_windows(now: datetime) -> list[tuple[datetime, datetime]]:
    """Cuatro semanas calendario completas, incluida la fecha UTC actual."""
    first_day = now.date() - timedelta(days=WINDOW_DAYS - 1)
    first = datetime.combine(first_day, datetime.min.time(), tzinfo=timezone.utc)
    return [
        (
            first + timedelta(days=offset),
            first + timedelta(days=offset + WEEK_DAYS) - timedelta(seconds=1),
        )
        for offset in range(0, WINDOW_DAYS, WEEK_DAYS)
    ]


def search_weapon(api_key: str, weapon: dict, now: datetime) -> list[str]:
    """Hasta 50 resultados por semana; evita que una semana tape a las demás."""
    ids = []
    for published_after, published_before in weekly_windows(now):
        data = api_get(
            SEARCH_URL,
            {
                "key": api_key,
                "part": "snippet",
                "q": f'"{weapon["name"]}" warzone',
                "type": "video",
                "relevanceLanguage": "es",
                "order": "date",
                "maxResults": SEARCH_LIMIT,
                "publishedAfter": iso_z(published_after),
                "publishedBefore": iso_z(published_before),
                "safeSearch": "moderate",
            },
        )
        for item in data.get("items") or []:
            snippet = item.get("snippet") or {}
            searchable = f'{snippet.get("title", "")} {snippet.get("description", "")}'
            video_id = (item.get("id") or {}).get("videoId")
            if (
                isinstance(video_id, str)
                and re.fullmatch(r"[A-Za-z0-9_-]{6,20}", video_id)
                and contains_weapon(searchable, weapon["name"])
                and "warzone" in normalize(searchable)
            ):
                ids.append(video_id)
    return list(dict.fromkeys(ids))


def video_details(api_key: str, video_ids: list[str]) -> dict[str, dict]:
    details: dict[str, dict] = {}
    for offset in range(0, len(video_ids), 50):
        batch = video_ids[offset : offset + 50]
        if not batch:
            continue
        data = api_get(
            VIDEOS_URL,
            {
                "key": api_key,
                "part": "snippet,statistics",
                "id": ",".join(batch),
            },
        )
        for item in data.get("items") or []:
            video_id = item.get("id")
            snippet = item.get("snippet") or {}
            if not isinstance(video_id, str):
                continue
            statistics = item.get("statistics") or {}

            def as_int(key: str) -> int:
                try:
                    return max(0, int(statistics.get(key, 0)))
                except (TypeError, ValueError):
                    return 0

            details[video_id] = {
                "publishedAt": snippet.get("publishedAt") or "",
                "channelId": snippet.get("channelId") or "",
                "views": as_int("viewCount"),
            }
    return details


def daily_video_counts(valid: list[tuple[dict, datetime]], now: datetime) -> list[dict]:
    """Conteo diario crudo de videos para los últimos 28 días calendario."""
    start = now.date() - timedelta(days=WINDOW_DAYS - 1)
    counts = {start + timedelta(days=offset): 0 for offset in range(WINDOW_DAYS)}
    for _, published in valid:
        day = published.date()
        if day in counts:
            counts[day] += 1
    return [
        {"date": day.isoformat(), "count": counts[day]}
        for day in sorted(counts)
    ]


def in_chart_window(published: datetime, now: datetime) -> bool:
    start = now.date() - timedelta(days=WINDOW_DAYS - 1)
    return start <= published.date() <= now.date() and published <= now + timedelta(minutes=10)


def aggregate(
    weapons: list[dict],
    ids_by_slug: dict[str, list[str]],
    details: dict[str, dict],
    now: datetime,
) -> list[dict]:
    rows = []
    for weapon in weapons:
        valid = []
        for video_id in ids_by_slug.get(weapon["slug"], []):
            item = details.get(video_id)
            published = parse_date((item or {}).get("publishedAt"))
            if item and published and in_chart_window(published, now):
                valid.append((item, published))
        creators = {item.get("channelId") for item, _ in valid if item.get("channelId")}
        views = sum(int(item.get("views") or 0) for item, _ in valid)
        newest = max((published for _, published in valid), default=None)
        rows.append(
            {
                **weapon,
                "videoCount": len(valid),
                "creatorCount": len(creators),
                "viewCount": views,
                "newestPublishedAt": iso_z(newest) if newest else None,
                "dailyVideos": daily_video_counts(valid, now),
                "_newestTimestamp": newest.timestamp() if newest else 0,
            }
        )
    # Orden transparente basado únicamente en datos de la API: suma de vistas
    # y, para desempatar, cantidad de videos, creadores y fecha más reciente.
    rows.sort(
        key=lambda item: (
            -item["viewCount"],
            -item["videoCount"],
            -item["creatorCount"],
            -item["_newestTimestamp"],
            item["name"],
        )
    )
    return rows


def bootstrap_rows(weapons: list[dict], cache: dict, now: datetime) -> list[dict]:
    """Crea una muestra inicial real desde el cache generado por la API oficial."""
    rows = []
    for weapon in weapons:
        entries = cache.get(weapon["slug"], [])
        if isinstance(entries, dict):
            entries = [entries]
        valid = []
        for item in entries if isinstance(entries, list) else []:
            published = parse_date((item or {}).get("published"))
            if published and in_chart_window(published, now):
                valid.append((item, published))
        creators = {str(item.get("channel") or "").strip() for item, _ in valid}
        creators.discard("")
        newest = max((published for _, published in valid), default=None)
        rows.append(
            {
                **weapon,
                "videoCount": len(valid),
                "creatorCount": len(creators),
                "viewCount": None,
                "newestPublishedAt": iso_z(newest) if newest else None,
                "dailyVideos": daily_video_counts(valid, now),
                "_newestTimestamp": newest.timestamp() if newest else 0,
            }
        )
    # El cache inicial no guarda vistas: se ordena por conteos crudos, sin una
    # puntuación derivada ni datos inventados.
    rows.sort(
        key=lambda item: (
            -item["videoCount"],
            -item["creatorCount"],
            -item["_newestTimestamp"],
            item["name"],
        )
    )
    return rows


def previous_positions(previous: dict) -> dict[str, int]:
    ranking = previous.get("ranking") if isinstance(previous, dict) else None
    if not isinstance(ranking, list):
        return {}
    output = {}
    for row in ranking:
        slug = (row or {}).get("slug")
        rank = (row or {}).get("rank")
        if isinstance(slug, str) and isinstance(rank, int):
            output[slug] = rank
    return output


def finalize_rows(rows: list[dict], previous: dict) -> list[dict]:
    old = previous_positions(previous)
    output = []
    for index, original in enumerate(rows, start=1):
        row = {key: value for key, value in original.items() if not key.startswith("_")}
        prior = old.get(row["slug"])
        if prior is None:
            direction, delta = "new", None
        elif prior > index:
            direction, delta = "up", prior - index
        elif prior < index:
            direction, delta = "down", prior - index
        else:
            direction, delta = "stable", 0
        row.update({"rank": index, "direction": direction, "deltaRank": delta})
        output.append(row)
    return output


def clean_history(previous: dict, now: datetime, ranking: list[dict]) -> list[dict]:
    cutoff = now - timedelta(days=HISTORY_DAYS)
    history = []
    for snapshot in previous.get("history", []) if isinstance(previous, dict) else []:
        generated = parse_date((snapshot or {}).get("generatedAt"))
        positions = (snapshot or {}).get("positions")
        if generated and generated >= cutoff and isinstance(positions, dict):
            history.append(
                {
                    "generatedAt": iso_z(generated),
                    "positions": {
                        slug: rank
                        for slug, rank in positions.items()
                        if re.fullmatch(r"[a-z0-9-]+", str(slug))
                        and isinstance(rank, int)
                    },
                }
            )
    history.append(
        {
            "generatedAt": iso_z(now),
            "positions": {row["slug"]: row["rank"] for row in ranking},
        }
    )
    return history[-50:]


def build_output(
    rows: list[dict], previous: dict, now: datetime, *, bootstrap: bool
) -> dict:
    ranking = finalize_rows(rows, previous)
    return {
        "schemaVersion": SCHEMA_VERSION,
        "source": "youtube-data-api-v3",
        "method": "cached_verified_sample" if bootstrap else "recent_search_sample",
        "generatedAt": iso_z(now),
        "windowDays": WINDOW_DAYS,
        "freshForHours": 336 if bootstrap else 36,
        "trackedWeapons": TRACKED_LIMIT,
        "sampleLimitPerWeapon": 5 if bootstrap else SEARCH_LIMIT * SEARCH_WINDOWS,
        "sampleLimitPerWeek": None if bootstrap else SEARCH_LIMIT,
        "searchWindows": 0 if bootstrap else SEARCH_WINDOWS,
        "notice": (
            "Muestra inicial de 4 semanas; no equivale a uso dentro del juego."
            if bootstrap
            else "Muestra equilibrada por semana durante 4 semanas; no equivale a uso dentro del juego."
        ),
        "ranking": ranking,
        "history": clean_history(previous, now, ranking),
    }


def atomic_write(path: Path, data: dict) -> None:
    payload = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", newline="", dir=path.parent, delete=False
    ) as handle:
        handle.write(payload)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bootstrap", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--min-age-hours",
        type=float,
        default=0,
        help="No consulta la API si el radar oficial anterior es más reciente.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    now = utc_now()
    catalog = load_json(ARMAS_DATA, {})
    weapons = tracked_weapons(catalog)
    if len(weapons) < 5:
        print("Catálogo inválido: no se modifica youtube-trends.json")
        return 1

    previous = load_json(OUTPUT, {})
    if args.bootstrap:
        rows = bootstrap_rows(weapons, load_json(VIDEO_CACHE, {}), now)
    else:
        previous_date = parse_date(previous.get("generatedAt")) if isinstance(previous, dict) else None
        if (
            args.min_age_hours > 0
            and previous.get("method") == "recent_search_sample"
            and previous_date
            and now - previous_date < timedelta(hours=args.min_age_hours)
        ):
            print("Radar aún vigente: no se consume cuota de YouTube")
            return 0
        api_key = os.environ.get("YOUTUBE_API_KEY", "").strip()
        if not api_key:
            print("Falta YOUTUBE_API_KEY: no se actualizó el radar; se conserva la muestra anterior")
            return 2
        ids_by_slug: dict[str, list[str]] = {}
        failures = 0
        for weapon in weapons:
            try:
                ids_by_slug[weapon["slug"]] = search_weapon(api_key, weapon, now)
                print(f'{weapon["slug"]}: {len(ids_by_slug[weapon["slug"]])} videos')
            except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
                failures += 1
                print(f'{weapon["slug"]}: error {type(error).__name__}')
        all_ids = sorted({video_id for ids in ids_by_slug.values() for video_id in ids})
        try:
            details = video_details(api_key, all_ids)
        except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
            print(f"No se pudieron validar los videos ({type(error).__name__}); se conserva lo anterior")
            return 1
        if failures:
            print(f"Fallaron {failures} búsquedas de armas; se conserva el radar anterior completo")
            return 1
        rows = aggregate(weapons, ids_by_slug, details, now)

    if sum(1 for row in rows if row.get("videoCount", 0) > 0) < 3:
        print("Muestra insuficiente; se conserva el radar anterior")
        return 1

    result = build_output(rows, previous, now, bootstrap=args.bootstrap)
    if args.dry_run:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        atomic_write(OUTPUT, result)
        print(f"youtube-trends.json actualizado: {len(result['ranking'])} armas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

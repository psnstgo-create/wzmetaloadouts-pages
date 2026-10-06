"""Public, isolated radar updater. Never builds or deploys the website."""
import base64
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from urllib.request import Request, urlopen

import youtube_trends as collector

REPO = "psnstgo-create/wzmetaloadouts-pages"
CONTENT = f"repos/{REPO}/contents/site/youtube-trends.json"


def api(path, body=None):
    args = ["gh", "api", path]
    if body is not None:
        args += ["--method", "PUT", "--input", "-"]
    result = subprocess.run(args, input=json.dumps(body) if body else None,
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def validate(data, now):
    generated = collector.parse_date(data.get("generatedAt"))
    if not generated or not timedelta(0) <= now - generated < timedelta(hours=24):
        raise ValueError("No current observation was generated")
    if data.get("method") != "recent_search_sample" or data.get("schemaVersion") != 1:
        raise ValueError("Not an official API sample")
    rows = data.get("ranking", [])
    if sum(row.get("videoCount", 0) > 0 for row in rows) < 3:
        raise ValueError("Insufficient sample")
    expected = [(generated.date() - timedelta(days=27-i)).isoformat() for i in range(28)]
    for row in rows:
        days = row.get("dailyVideos", [])
        if [day.get("date") for day in days] != expected:
            raise ValueError("Incomplete or misaligned observation window")
        if any(type(day.get("count")) is not int or day["count"] < 0 for day in days):
            raise ValueError("Invalid counts")
    return generated


def main():
    metadata = api(f"repos/{REPO}")
    if metadata.get("private") is not False or metadata.get("visibility") != "public":
        raise ValueError("Only the public repository may run this updater")
    current = api(CONTENT)
    previous = json.loads(base64.b64decode(current["content"]))
    with tempfile.TemporaryDirectory() as folder:
        folder = Path(folder)
        request = Request("https://wzmetaloadouts.com/armas-data.json", headers={
            "User-Agent": "Mozilla/5.0 WZMeta-Radar", "Accept": "application/json"})
        with urlopen(request, timeout=30) as response:
            raw = response.read(5_000_001)
        if len(raw) > 5_000_000:
            raise ValueError("Catalog too large")
        collector.ARMAS_DATA = folder / "armas-data.json"
        collector.ARMAS_DATA.write_bytes(raw)
        collector.OUTPUT = folder / "youtube-trends.json"
        collector.atomic_write(collector.OUTPUT, previous)
        sys.argv = [sys.argv[0], "--min-age-hours", "20"]
        status = collector.main()
        if status:
            return status
        candidate = json.loads(collector.OUTPUT.read_text(encoding="utf-8"))
        generated = validate(candidate, datetime.now(timezone.utc))
        # Read SHA again immediately before writing; never replace a newer sample.
        latest = api(CONTENT)
        latest_data = json.loads(base64.b64decode(latest["content"]))
        latest_date = collector.parse_date(latest_data.get("generatedAt"))
        if latest_date and generated <= latest_date:
            print("Existing sample is equally recent or newer; no write.")
            return 0
        encoded = base64.b64encode(collector.OUTPUT.read_bytes()).decode("ascii")
        api(CONTENT, {"message": "Update public YouTube radar " + candidate["generatedAt"],
                      "content": encoded, "sha": latest["sha"], "branch": "main"})
        summary = f"Updated {len(candidate['ranking'])} weapons at {candidate['generatedAt']}. Only site/youtube-trends.json changed."
        print(summary)
        if os.environ.get("GITHUB_STEP_SUMMARY"):
            Path(os.environ["GITHUB_STEP_SUMMARY"]).write_text(summary, encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        # Do not echo request URLs, tokens or subprocess payloads.
        print("Radar refresh failed; previous data preserved:", type(error).__name__)
        raise SystemExit(1)

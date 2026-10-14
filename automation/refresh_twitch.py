"""Refresh only the public Twitch feed. Never build or deploy the website."""
import base64
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen

REPO = 'psnstgo-create/wzmetaloadouts-pages'
CONTENT = f'repos/{REPO}/contents/site/streams-live.json'
GAME = 'Call of Duty: Warzone'


def github(path, body=None):
    args = ['gh', 'api', path]
    if body is not None:
        args += ['--method', 'PUT', '--input', '-']
    result = subprocess.run(args, input=json.dumps(body) if body else None,
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def request_json(request):
    for attempt in range(3):
        try:
            with urlopen(request, timeout=20) as response:
                return json.load(response)
        except OSError:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def normalize(streams, avatars):
    rows = []
    seen = set()
    for stream in streams:
        login = stream['user_login']
        if (not re.fullmatch(r'[a-z0-9_]{1,25}', login) or login in seen or
                stream.get('type') != 'live' or stream.get('language') != 'es' or
                stream.get('game_name') != GAME):
            raise ValueError('Unexpected Twitch stream')
        viewers = stream['viewer_count']
        if type(viewers) is not int or viewers < 0:
            raise ValueError('Invalid audience count')
        seen.add(login)
        rows.append({'login': login, 'name': stream.get('user_name') or login,
                     'title': stream.get('title', ''), 'viewers': viewers,
                     'thumb': stream.get('thumbnail_url', '').replace('{width}', '440').replace('{height}', '248'),
                     'avatar': avatars.get(stream['user_id'], ''), 'game': GAME})
    return sorted(rows, key=lambda row: row['viewers'], reverse=True)


def collect(client_id, secret):
    token = request_json(Request('https://id.twitch.tv/oauth2/token',
        data=urlencode({'client_id': client_id, 'client_secret': secret,
                        'grant_type': 'client_credentials'}).encode(), method='POST'))['access_token']

    def helix(path, params):
        return request_json(Request('https://api.twitch.tv/helix/' + path + '?' + urlencode(params),
            headers={'Client-ID': client_id, 'Authorization': 'Bearer ' + token}))['data']

    games = helix('games', {'name': GAME})
    if len(games) != 1:
        raise ValueError('Warzone category unavailable')
    streams = helix('streams', {'game_id': games[0]['id'], 'language': 'es', 'first': 12, 'type': 'live'})
    avatars = {}
    if streams:
        users = helix('users', [('id', row['user_id']) for row in streams])
        avatars = {row['id']: row.get('profile_image_url', '') for row in users}
    return {'schemaVersion': 1, 'status': 'ok', 'language': 'es',
            'generado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'streams': normalize(streams, avatars)}


def main():
    # Defense in depth, before accessing Twitch or writing anything.
    if os.environ.get('GITHUB_REPOSITORY') != REPO:
        raise ValueError('This updater is restricted to its public repository')
    metadata = github('repos/' + REPO)
    if metadata.get('private') is not False or metadata.get('visibility') != 'public':
        raise ValueError('Private repository execution is forbidden')
    client_id = os.environ.get('TWITCH_CLIENT_ID', '').strip()
    secret = os.environ.get('TWITCH_CLIENT_SECRET', '').strip()
    if not client_id or not secret:
        raise ValueError('Missing Twitch credentials')
    candidate = collect(client_id, secret)
    payload = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
    for attempt in range(3):
        latest = github(CONTENT)
        previous = json.loads(base64.b64decode(latest['content']))
        if previous.get('generado', '') >= candidate['generado']:
            print('A newer observation already exists; no write.')
            return
        try:
            github(CONTENT, {'message': 'Refresh public Twitch streams ' + candidate['generado'],
                'content': base64.b64encode(payload).decode(), 'sha': latest['sha'], 'branch': 'main'})
            break
        except subprocess.CalledProcessError:
            if attempt == 2:
                raise
            time.sleep(2)
    summary = f"Updated {len(candidate['streams'])} Spanish Warzone streams at {candidate['generado']}. Only site/streams-live.json changed."
    print(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        Path(os.environ['GITHUB_STEP_SUMMARY']).write_text(summary, encoding='utf-8')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Never print credentials, token request bodies, or authenticated URLs.
        print('Twitch refresh failed; previous observation preserved:', type(error).__name__)
        raise SystemExit(1)

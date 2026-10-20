"""Refresh a strictly public GitHub snapshot; no credentials are read or sent."""
from datetime import date, datetime, timezone, timedelta
from html.parser import HTMLParser
from pathlib import Path
import argparse
import json
import re
import urllib.request

USER = 'gvemmanuel3712-cyber'

class CalendarParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells = {}
        self.tooltips = {}
        self.current = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'td' and attrs.get('data-date'):
            self.cells[attrs['id']] = {'date': attrs['data-date'], 'level': int(attrs['data-level'])}
        if tag == 'tool-tip':
            self.current = attrs.get('for')
            self.tooltips[self.current] = ''
    def handle_data(self, data):
        if self.current:
            self.tooltips[self.current] += data
    def handle_endtag(self, tag):
        if tag == 'tool-tip':
            self.current = None

def parse_calendar(source):
    parser = CalendarParser()
    parser.feed(source)
    days = []
    for key, cell in parser.cells.items():
        tooltip = ' '.join(parser.tooltips.get(key, '').split())
        match = re.match(r'(No|[\d,]+) contributions? on ', tooltip)
        if not match:
            raise ValueError(f'Unrecognized contribution tooltip for {cell["date"]}')
        count = 0 if match[1] == 'No' else int(match[1].replace(',', ''))
        date.fromisoformat(cell['date'])
        if not 0 <= cell['level'] <= 4 or (count == 0) != (cell['level'] == 0):
            raise ValueError('Inconsistent contribution count and level')
        days.append({**cell, 'count': count})
    days.sort(key=lambda day: day['date'])
    if not 350 <= len(days) <= 380 or len({d['date'] for d in days}) != len(days):
        raise ValueError('Missing or duplicate calendar dates')
    for a, b in zip(days, days[1:]):
        if date.fromisoformat(b['date']) - date.fromisoformat(a['date']) != timedelta(days=1):
            raise ValueError('Calendar contains date gaps')
    summary = re.search(r'([\d,]+)\s+contributions?\s+in the last year', source)
    if not summary or int(summary[1].replace(',', '')) != sum(d['count'] for d in days):
        raise ValueError('Calendar total does not match GitHub summary')
    return days

def fetch(url, *, as_json=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'Emmanuel-Public-Portfolio/2.0', 'Accept': 'application/json' if as_json else 'text/html'})
    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read().decode('utf-8')
    return json.loads(body) if as_json else body

def collect():
    profile = fetch(f'https://api.github.com/users/{USER}', as_json=True)
    if profile['login'].lower() != USER:
        raise ValueError('Unexpected account')
    repositories = []
    page = 1
    while True:
        batch = fetch(f'https://api.github.com/users/{USER}/repos?type=owner&per_page=100&page={page}', as_json=True)
        if any(repo['private'] for repo in batch):
            raise ValueError('Private repository returned by public endpoint')
        repositories += [{k: repo[k] for k in ('name', 'html_url', 'description', 'language', 'fork', 'stargazers_count')} for repo in batch]
        if len(batch) < 100:
            break
        page += 1
    days = parse_calendar(fetch(f'https://github.com/users/{USER}/contributions'))
    return {
        'schemaVersion': 1,
        'account': USER,
        'checkedAt': datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        'source': f'https://github.com/{USER}',
        'calendarSource': f'https://github.com/users/{USER}/contributions',
        'visibility': 'Unauthenticated, publicly visible GitHub profile. Contributions are events, not a commit count or a proficiency score.',
        'profile': {k: profile[k] for k in ('name', 'bio', 'location', 'public_repos', 'followers', 'following')},
        'repositories': repositories,
        'calendar': {'start': days[0]['date'], 'end': days[-1]['date'], 'total': sum(d['count'] for d in days), 'activeDays': sum(d['count'] > 0 for d in days), 'days': days},
    }

if __name__ == '__main__':
    args = argparse.ArgumentParser()
    args.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'data/github.json')
    options = args.parse_args()
    snapshot = collect()
    options.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = options.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(options.output)
    print(f'Public snapshot: {snapshot["calendar"]["total"]} contributions, {snapshot["calendar"]["activeDays"]} active days, {len(snapshot["repositories"])} public repositories. No private endpoints or tokens used.')

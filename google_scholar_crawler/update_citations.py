"""Update only the public profile's total citations; preserve data on failure."""
import json
import re
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

PROFILE = 'https://scholar.google.com/citations?user=lu17sj4AAAAJ&hl=en'
DESTINATION = Path(__file__).resolve().parents[1] / '_data' / 'scholar.json'


def parse_citations(html):
    soup = BeautifulSoup(html, 'html.parser')
    rows = soup.select('#gsc_rsb_st tbody tr')
    for row in rows:
        label = row.select_one('.gsc_rsb_sc1')
        value = row.select_one('.gsc_rsb_std')
        if label and label.get_text(strip=True) == 'Citations' and value:
            digits = value.get_text(strip=True).replace(',', '')
            if re.fullmatch(r'\d+', digits):
                return int(digits)
    raise ValueError('No valid total citation count found; keeping existing data.')


if __name__ == '__main__':
    request = urllib.request.Request(PROFILE, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        count = parse_citations(response.read())
    data = {'citations': count, 'profile': PROFILE}
    DESTINATION.write_text(json.dumps(data, indent=2) + '\n')
    print(f'Google Scholar citations: {count}')

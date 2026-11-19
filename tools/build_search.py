"""Build assets/search-index.json: the words of each study's own page, so the project search on the home page
also finds terms that appear only in a study (a method, a dataset, a place), not just on its card.

Reads the local clones of the nine study repositories next to this one. The navigation blocks that every study
page shares (study bar, next-study card, Other studies line) are removed first, so a study is not found by the
names of the others.

    python3 tools/build_search.py
"""
import html
import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = {
    '01': 'observational-hydrology-extremes/docs/index.html',
    '02': 'ogun-catchment-coast-observatory/docs/index.html',
    '03': 'oueme-ogun-groundwater-recharge/docs/index.html',
    '04': 'groundwater-storage-gravimetry/docs/index.html',
    '05': 'lagos-urban-heat-analytics/docs/index.html',
    '06': 'coastal-hydrogeology-modeling/docs/index.html',
    '07': 'mau-forest-land-cover/docs/index.html',
    '08': 'mozambique-health-access/docs/index.html',
    '09': 'open-geodata-catalogue/docs/about.html',
}
STOP = set('''the and for with from that this are was were has have had not but its into than then them they their there
which what when where who whom how why can could would should will may might also more most less such each other only
over under between about after before both all any some our out per via one two three four five six seven eight nine ten
been being does did done use used using within without these those very much many same here page study studies figure
figures table tables data see shows shown show while because however although whether under upon onto off across'''.split())


def words(page):
    s = page.read_text(encoding='utf-8')
    for block in ('study-bar', 'study-nav', 'study-others'):
        s = re.sub(rf'<!-- {block}:start -->.*?<!-- {block}:end -->', ' ', s, flags=re.S)
    s = re.sub(r'<(script|style|svg|nav|footer|head)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    toks = re.findall(r'[a-z][a-z0-9]+', s)
    return sorted({t for t in toks if len(t) > 2 and t not in STOP and not t.isdigit()})


def main():
    out = {}
    for n, rel in PAGES.items():
        p = ROOT.parent / rel
        if not p.exists():
            raise SystemExit(f'missing {p}: clone the study repositories next to this one')
        out[n] = ' '.join(words(p))
    dst = ROOT / 'assets' / 'search-index.json'
    dst.write_text(json.dumps(out, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'wrote {dst.name}: ' + ', '.join(f'{n} {len(v.split())} words' for n, v in out.items()))


if __name__ == '__main__':
    main()

"""Build the French and German pages from the English page and the dictionaries in i18n/.

English (index.html) is the source. For each language this writes <lang>/index.html with:
  - visible text, attributes, image captions and the composite paragraphs translated,
  - asset paths pointed one level up,
  - lang, title, description, canonical, og:url, og:locale and the switcher state set,
  - the strings used by the scripts injected as window.I18N (English stays the fallback).

The build stops if a dictionary entry no longer matches the page, if a composite paragraph changed shape,
or if any visible English text is left that the dictionary does not cover.

    python3 tools/build_i18n.py
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://oloyededavid.github.io/geospatial-rs-portfolio/'
LANGS = ['fr', 'de']

# Composite paragraphs: their inline elements are kept and only their text changes.
BLOCKS = {
    'hello-body': r'(<p class="hello-body">)(.*?)(</p>)',
    'ab-lead': r'(<p class="ab-lead">)(.*?)(</p>)',
    'ab-p1': r'(<p class="ab-p1">)(.*?)(</p>)',
    'ab-p2': r'(<p class="ab-p2">)(.*?)(</p>)',
    'ab-p3': r'(<p class="ab-p3">)(.*?)(</p>)',
}
INLINE = re.compile(r'<b\b[^>]*>.*?</b>|<span class="chip[^"]*">.*?</span>|<a class="ab-chip"[^>]*>.*?</a>', re.S)


def fail(msg):
    sys.exit(f'build_i18n: {msg}')


def text_nodes(page):
    body = re.sub(r'<script\b.*?</script>|<style\b.*?</style>', '', page, flags=re.S)
    out = []
    for m in re.finditer(r'>([^<>]+)<', body):
        t = m.group(1).strip()
        if re.search(r'[A-Za-z]{2}', t):
            out.append(t)
    return out


def translate_block(name, en_inner, template):
    elems = INLINE.findall(en_inner)
    def sub(m):
        i, txt = int(m.group(1)), m.group(2)
        if i < 1 or i > len(elems):
            fail(f'{name}: placeholder <<{i}>> but the English paragraph has {len(elems)} inline elements')
        el = elems[i - 1]
        new = re.sub(r'>([^<>]*)</(b|span|a)>$', lambda k: '>' + txt + '</' + k.group(2) + '>', el)
        return '\x00' + new + '\x01'
    out = re.sub(r'<<(\d+):(.*?)>>', sub, template)
    used = {int(n) for n in re.findall(r'<<(\d+):', template)}
    if used != set(range(1, len(elems) + 1)):
        fail(f'{name}: template uses elements {sorted(used)}, English has {len(elems)}')
    # keep an element together with punctuation that follows it
    out = re.sub(r'\x00(.*?)\x01([,.;:]?)', lambda m: ('<span class="nw">' + m.group(1) + m.group(2) + '</span>') if m.group(2) else m.group(1), out)
    return out


def build(lang):
    en = (ROOT / 'index.html').read_text(encoding='utf-8')
    d = json.loads((ROOT / 'i18n' / f'{lang}.json').read_text(encoding='utf-8'))
    s = en

    en_caps = {c for v in re.findall(r'data-caps="([^"]*)"', en) for c in json.loads(html.unescape(v))}

    # 1. composite paragraphs
    for name, pat in BLOCKS.items():
        m = re.search(pat, s, re.S)
        if not m:
            fail(f'{lang}: block {name} not found')
        s = s[:m.start(2)] + translate_block(name, m.group(2), d['blocks'][name]) + s[m.end(2):]

    # 2. image captions (JSON in data-caps)
    def caps(m):
        items = json.loads(html.unescape(m.group(1)))
        tr = []
        for c in items:
            if c not in d['text']:
                fail(f'{lang}: caption not in dictionary: {c!r}')
            tr.append(d['text'][c])
        return 'data-caps="' + html.escape(json.dumps(tr, ensure_ascii=False), quote=True) + '"'
    s = re.sub(r'data-caps="([^"]*)"', caps, s)

    # 3. attributes, then text nodes
    for k, v in d['attr'].items():
        n = 0
        for a in ('content', 'aria-label', 'alt', 'title'):
            needle = f'{a}="{k}"'
            n += s.count(needle)
            s = s.replace(needle, f'{a}="{v}"')
        if not n:
            fail(f'{lang}: attribute text not found: {k!r}')
    for k, v in sorted(d['text'].items(), key=lambda kv: -len(kv[0])):
        pat = re.compile(r'(>\s*)' + re.escape(k) + r'(\s*<)')
        s, n = pat.subn(lambda m: m.group(1) + v + m.group(2), s)
        if not n and k not in en_caps:
            fail(f'{lang}: text not found on the page: {k!r}')

    # 4. head: lang, title, description, canonical, og
    s = s.replace('<html lang="en">', f'<html lang="{lang}">', 1)
    s = re.sub(r'<title>.*?</title>', '<title>' + d['meta']['title'] + '</title>', s, count=1)
    s = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + d['meta']['description'], s, count=1)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + d['meta']['og_description'], s, count=1)
    s = s.replace(f'<link rel="canonical" href="{BASE}">', f'<link rel="canonical" href="{BASE}{lang}/">', 1)
    s = s.replace(f'<meta property="og:url" content="{BASE}">', f'<meta property="og:url" content="{BASE}{lang}/">', 1)
    others = [x for x in ['en_GB', 'fr_FR', 'de_DE'] if x != d['locale']]
    s = re.sub(r'<meta property="og:locale" content="[^"]*">\n<meta property="og:locale:alternate" content="[^"]*">\n<meta property="og:locale:alternate" content="[^"]*">',
               f'<meta property="og:locale" content="{d["locale"]}">\n<meta property="og:locale:alternate" content="{others[0]}">\n<meta property="og:locale:alternate" content="{others[1]}">', s, count=1)
    s = re.sub(r'<script data-i18n-redirect>.*?</script>\n?', '', s, flags=re.S)

    # 5. switcher: current language and links relative to /<lang>/
    target = {'en': '../', 'fr': '../fr/', 'de': '../de/'}
    target[lang] = './'
    def sw(m):
        code = m.group(2)
        tag = re.sub(r'href="[^"]*"', f'href="{target[code]}"', m.group(0), count=1)
        tag = tag.replace(' aria-current="true"', '')
        if code == lang:
            tag = tag.replace(f'data-lang="{code}"', f'data-lang="{code}" aria-current="true"')
        return tag
    s = re.sub(r'<a href="([^"]*)" data-lang="(en|fr|de)"[^>]*>', sw, s)

    # 6. asset paths one level up (switcher links are already final)
    def up(m):
        attr, val = m.group(1), m.group(2)
        if re.match(r'(#|https?:|mailto:|data:|/|\.\./|\./)', val):
            return m.group(0)
        return f'{attr}="../{val}"'
    s = re.sub(r'\b(src|href)="([^"]*)"', up, s)
    s = re.sub(r'\bsrcset="([^"]*)"', lambda m: 'srcset="' + re.sub(r'(^|,\s*)(?!https?:|\.\./)([^\s,]+)', r'\1../\2', m.group(1)) + '"', s)
    s = s.replace('&quot;assets/', '&quot;../assets/')

    # 7. strings for the scripts
    inject = '<script>window.SITE_ROOT = "../"; window.I18N = ' + json.dumps(d['js'], ensure_ascii=False) + ';</script>\n'
    i = s.index('<script src=')
    s = s[:i] + inject + s[i:]

    # 8. checks: no English left that the dictionary does not cover
    en_texts = set(text_nodes(en))
    block_words = {w for v in d['blocks'].values() for w in re.findall(r'<<\d+:(.*?)>>', v)}
    leftover = []
    for t in text_nodes(s):
        if t in en_texts and t not in set(d['text'].values()) and t not in block_words and t not in ('EN', 'FR', 'DE'):
            leftover.append(t)
    if leftover:
        fail(f'{lang}: English text left untranslated: {leftover[:8]}')
    for k, v in d['attr'].items():
        if k != v and f'="{k}"' in s:
            fail(f'{lang}: attribute left in English: {k!r}')

    out = ROOT / lang / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(s, encoding='utf-8')
    return out


if __name__ == '__main__':
    for lang in LANGS:
        print('wrote', build(lang).relative_to(ROOT))

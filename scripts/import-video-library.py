"""Import the curated video library spreadsheet into app/videography/video-library.json.

    python scripts/import-video-library.py [Video_Library_Module_by_Module_Merged.xlsx]

One entry per row, ids are <module>-<n> in sheet order (B01-1, B01-2, ...). YouTube links get a youtubeId;
the first timestamp in "Watch this section" becomes the start time. Needs openpyxl.
"""
import json, re, sys
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'Video_Library_Module_by_Module_Merged.xlsx'
rows = [list(r) for r in openpyxl.load_workbook(src, read_only=True, data_only=True).worksheets[0].iter_rows(values_only=True)]
head_i = next(i for i, r in enumerate(rows) if r and 'Level' in [str(c) for c in r])
cols = {str(h).strip(): i for i, h in enumerate(rows[head_i]) if h}
col = lambda prefix: next(i for h, i in cols.items() if h.startswith(prefix))
C = {k: col(p) for k, p in {'module': 'Module ID', 'skill': 'Exact skill', 'title': 'Video / named', 'section': 'Watch this section',
     'why': 'Why it fits', 'role': 'Learning role', 'pathway': 'Pathway', 'creator': 'Provider', 'software': 'Software',
     'access': 'Access', 'url': 'Video / course URL', 'limits': 'Scope'}.items()}
clean = lambda v: re.sub(r'\s+', ' ', str(v)).strip() if v is not None else ''

def start_of(section):
    m = re.search(r'\b(\d{1,2}):(\d{2})\b', section)
    return int(m.group(1)) * 60 + int(m.group(2)) if m else 0

out, module, count = [], None, {}
for r in rows[head_i + 1:]:
    if not any(r): continue
    get = lambda k: r[C[k]] if C[k] < len(r) else None
    if get('module'): module = clean(get('module')).split(' ')[0]
    if not get('title') or not module: continue
    count[module] = count.get(module, 0) + 1
    url, section = clean(get('url')), clean(get('section'))
    yt = re.search(r'(?:v=|youtu\.be/|embed/)([\w-]{11})', url)
    out.append({'id': f'{module}-{count[module]}', 'module': module, 'skill': clean(get('skill')), 'title': clean(get('title')),
                'section': section, 'why': clean(get('why')), 'role': clean(get('role')), 'pathway': clean(get('pathway')),
                'creator': clean(get('creator')), 'software': clean(get('software')), 'paid': clean(get('access')).lower().startswith('paid'),
                'url': url, 'youtubeId': yt.group(1) if yt else None, 'start': start_of(section), 'limits': clean(get('limits'))})

dest = ROOT / 'app/videography/video-library.json'
dest.write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
print(f'{len(out)} videos from {len(count)} modules -> {dest.relative_to(ROOT)}')

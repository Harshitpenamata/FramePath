"""Import the filled-in lesson video sheet into app/videography/lesson-videos.json.

    python scripts/import-lesson-videos.py Lesson_Videos_Needed.csv      (or the same sheet saved as .xlsx)

Rows without a YouTube URL are skipped. Each URL is checked with YouTube's oEmbed endpoint: it must exist and
allow embedding, or the row is reported and left out. A row with "Replaces this link" swaps out that video.
"""
import csv, json, re, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'Lesson_Videos_Needed.csv'

def read_rows(path):
    if path.suffix.lower() == '.xlsx':
        import openpyxl
        rows = [[('' if c is None else str(c)) for c in r] for r in openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0].iter_rows(values_only=True)]
    else:
        with open(path, encoding='utf-8-sig', newline='') as f: rows = list(csv.reader(f))
    head = [h.strip() for h in rows[0]]
    return [dict(zip(head, r)) for r in rows[1:] if any(c.strip() for c in r)]

def pick(row, prefix): return next((v.strip() for k, v in row.items() if k.startswith(prefix)), '')

def start_of(text):
    m = re.search(r'(\d{1,2}):(\d{2})(?::(\d{2}))?', text or '')
    if not m: return 0
    a, b, c = int(m.group(1)), int(m.group(2)), m.group(3)
    return a * 3600 + b * 60 + int(c) if c else a * 60 + b

def embeddable(video_id):
    url = 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote('https://www.youtube.com/watch?v=' + video_id)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=20) as r:
            return True, json.load(r)
    except urllib.error.HTTPError as e:
        return False, {401: 'embedding is turned off', 403: 'private', 404: 'not found'}.get(e.code, 'HTTP %d' % e.code)
    except Exception as e:
        return False, str(e)

out, problems = {}, []
for row in read_rows(src):
    lesson, url = pick(row, 'Lesson ID'), pick(row, 'YouTube URL')
    if not url: continue
    m = re.search(r'(?:v=|youtu\.be/|embed/|shorts/)([\w-]{11})', url)
    if not re.fullmatch(r'[BIA]\d{2}-\d{1,2}', lesson) or not m:
        problems.append(f'{lesson}: not a lesson ID or YouTube link ({url})'); continue
    ok, info = embeddable(m.group(1))
    if not ok:
        problems.append(f'{lesson}: {url} {info}'); continue
    out.setdefault(lesson, []).append({
        'youtubeId': m.group(1), 'title': pick(row, 'Video title') or info.get('title', ''),
        'creator': pick(row, 'Creator') or info.get('author_name', ''), 'start': start_of(pick(row, 'Start at')),
        'focus': pick(row, 'Watch for'), 'style': pick(row, 'Style'), 'replaces': pick(row, 'Replaces')})

missing_focus = [k for k, vs in out.items() if any(not v['focus'] for v in vs)]
(ROOT / 'app/videography/lesson-videos.json').write_text(json.dumps(dict(sorted(out.items())), ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{sum(len(v) for v in out.values())} videos for {len(out)} lessons written to app/videography/lesson-videos.json')
if missing_focus: print('No "Watch for" line yet:', ', '.join(missing_focus))
if problems: print('Left out:\n  ' + '\n  '.join(problems)); sys.exit(1)

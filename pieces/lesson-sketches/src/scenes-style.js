// =====================================================================
//  STYLE EXTRA lesson sketches (23 Oct 2026): one page per extra lesson for Wedding, Corporate or Social media.
//  Ids are <module>-<style>-<n> (I05-wedding-1), matching sketchId() in app/videography/lessons.ts.
//  Content stays between y 250 and 680 (the caption sits at 800); fpWave and fpTrack start at their x.
// =====================================================================
const xp = (tag, cap, hi) => fpPage(tag + ' extra', [cap], [[0, hi]]);
const wed = (id, cap, hi, f) => lesson(id + '-wedding-1', () => { xp('wedding', cap, hi); f(); });
const corp = (id, cap, hi, f) => lesson(id + '-corporate-1', () => { xp('corporate', cap, hi); f(); });
const soc = (id, cap, hi, f) => lesson(id + '-social-media-1', () => { xp('social', cap, hi); f(); });

// ---- Intermediate ----
soc('I01', 'start with the result', 'result', () => {
  fpPhone(330, 440, 2, 0.02); fpLoaf(330, 450, 0.8, 0.1);
  [['result', 700], ['problem', 900], ['steps', 1100], ['result', 1300]].forEach(([n, x], i) => { fpFrame(x, 420, 170, 120, 0.16 + i * 0.07); label(n, x, 540, 0.2 + i * 0.07, { size: 36, col: i === 0 || i === 3 ? SK.terra : SK.ink }); });
});
corp('I02', 'who signs it off?', 'signs', () => {
  hero(330, 500, 80, 0.02); fpSpeech(560, 320, 400, 120, 'who approves it?', 0.1);
  person(950, 560, 1.4, 0.24); person(1130, 560, 1.4, 0.28); person(1330, 540, 1.7, 0.32); check(1330, 330, 1, 0.44); label('the boss', 1330, 680, 0.48, { size: 40 });
});
wed('I03', 'plan around the rituals', 'rituals', () => {
  fpClock(330, 440, 110, 0.02);
  fpList(1000, 260, 640, 'function day', ['haldi (can move)', 'muhurat 7:42 (fixed)', 'pheras (fixed)', 'photos (can move)'], 0.14);
});
wed('I04', 'faces first at night', 'faces', () => {
  [300, 470, 640].forEach((x, i) => fpBulb(x, 330, 46, 0.02 + i * 0.05));
  hero(470, 560, 80, 0.2); fpDial(1000, 440, 110, 'white balance', 0.5, 0.3); fpPadlock(1250, 400, 1.2, 0.42); label('lock it', 1250, 520, 0.48, { size: 44, face: 'marker' });
});
wed('I05', 'cover it from two angles', 'two angles', () => {
  fpCamera(300, 360, 1.1, 0.02); fpCamera(300, 580, 1.1, 0.06);
  hero(900, 460, 80, 0.14); person(1080, 480, 1.5, 0.18); fpHeart(990, 300, 0.3);
  arrow([[420, 360], [780, 420]], 0.34); arrow([[420, 580], [780, 520]], 0.4); label('wide + close + reaction', 900, 660, 0.46, { size: 40 });
});
soc('I05', 'cut on the beat', 'beat', () => {
  fpTrack(300, 360, 1000, 'music', 0.02, { amp: 40 });
  [500, 700, 900, 1100].forEach((x, i) => L([[x, 300], [x, 560]], 0.2 + i * 0.05, { col: SK.terra, w: 4, second: false, d: 0.05 }));
  fpStrip(800, 500, 2.6, 0.32, 4); label('a cut on each beat', 800, 640, 0.48, { size: 40 });
});
corp('I06', 'soft light, lit background', 'soft', () => {
  fpSoftbox(380, 420, 1.4, 0.02); hero(780, 480, 90, 0.14); fpLamp(1180, 420, 0.24);
  label('soft on the face', 600, 660, 0.36, { size: 40 }); label('light behind', 1180, 600, 0.42, { size: 40 });
});
wed('I07', 'mic close, noise far', 'close', () => {
  hero(420, 480, 90, 0.02); L(circ(450, 600, 10), 0.12, { closed: true, w: 4, d: 0.04 }); label('lapel mic', 420, 680, 0.16, { size: 40 });
  fpWaves(1160, 440, 4, 40, 30, 0.26); label('dhol and DJ', 1220, 640, 0.36, { size: 40, col: SK.graph }); arrow([[620, 440], [900, 440]], 0.42);
});
corp('I07', 'chat first, then roll', 'chat', () => {
  hero(380, 500, 80, 0.02); fpSpeech(620, 320, 460, 120, 'how was your morning?', 0.1);
  person(1120, 560, 1.6, 0.24); fpSpeech(1120, 320, 380, 120, 'busy, but good!', 0.34, { tail: 'right' }); fpCamera(800, 600, 0.9, 0.44);
});
soc('I09', 'best moment first', 'first', () => {
  fpPhone(360, 440, 2, 0.02); fpHeart(360, 420, 0.12);
  fpStrip(950, 420, 2.4, 0.2, 4, { fills: [SK.yellow] }); label('the best bit, first second', 950, 560, 0.36, { size: 40 }); fpClock(1380, 440, 70, 0.44);
});
wed('I10', 'ask about the music rights', 'rights', () => {
  fpNote(360, 440, 2, 0.02); fpPadlock(560, 500, 1.4, 0.12);
  fpList(1080, 270, 600, 'for Instagram', ['the film song', 'licensed music', 'platform music'], 0.22, { cross: [0] });
});
soc('I10', 'use cleared sounds', 'cleared', () => {
  fpPhone(360, 440, 2, 0.02); fpNote(360, 430, 1, 0.12);
  fpList(1060, 270, 620, 'business account', ['film song from YouTube', 'platform library', 'original sound'], 0.22, { cross: [0] });
});
corp('I11', 'match the brand colour', 'brand', () => {
  fpCard3(380, 440, 360, 280, 0.02, { bar: SK.terra, title: 'brand red' }); FL(box(300, 450, 160, 90, 8), SK.red, 0.12);
  fpScope(950, 440, 400, 300, 0.2, 'vector'); arrow([[600, 440], [720, 440]], 0.32); check(1260, 440, 1, 0.44);
});
wed('I12', 'small enough to share', 'share', () => {
  fpPhone(360, 440, 1.8, 0.02); arrow([[500, 440], [700, 440]], 0.16); fpPhone(840, 440, 1.8, 0.2); fpPhone(1060, 440, 1.6, 0.26);
  label('60 sec, under 30 MB', 960, 660, 0.4, { size: 44 });
});
corp('I12', 'one film, many versions', 'versions', () => {
  fpFrame(380, 440, 420, 260, 0.02, { label: 'the film', size: 40 });
  [['website', 820, 340], ['LinkedIn', 1100, 340], ['staff, Hindi', 820, 540], ['9:16', 1100, 540]].forEach(([n, x, y], i) => { fpFrame(x, y, 220, 140, 0.16 + i * 0.07); label(n, x, y + 12, 0.2 + i * 0.07, { size: 34 }); });
  arrow([[600, 440], [690, 440]], 0.12);
});
soc('I12', 'keep text in the safe zone', 'safe zone', () => {
  const P = box(560, 250, 260, 460, 18); L(P, 0.02, { closed: true, d: 0.1 });
  L(box(590, 320, 160, 300, 8), 0.14, { closed: true, col: SK.green, d: 0.08 }); label('text here', 670, 470, 0.22, { size: 34, col: SK.green });
  [600, 640, 680].forEach((y, i) => L(circ(790, y - 120, 12), 0.26 + i * 0.04, { closed: true, d: 0.04 }));
  label('buttons and captions', 1200, 450, 0.4, { size: 36 }); label('cover the edges', 1200, 500, 0.44, { size: 36 }); arrow([[970, 470], [840, 470]], 0.48);
});

// ---- Advanced ----
wed('A01', 'find their story', 'their', () => {
  hero(400, 480, 80, 0.02); person(560, 500, 1.5, 0.06); fpHeart(480, 320, 0.12);
  fpSpeech(1000, 360, 600, 130, 'he learned her language for the vows', 0.24); check(1000, 520, 1, 0.4);
});
corp('A01', 'see it through someone', 'someone', () => {
  fpFrame(560, 440, 560, 340, 0.02); person(520, 500, 1.8, 0.1); L(box(590, 470, 90, 70, 6), 0.16, { closed: true, d: 0.06 });
  label("a rider's first day", 560, 660, 0.24, { size: 40 }); fpCard3(1180, 440, 380, 220, 0.34, { title: 'not a list of features' }); cross(1180, 470, 1, 0.46);
});
soc('A01', 'a format people recognise', 'format', () => {
  [0, 1, 2].forEach((i) => { fpPhone(420 + i * 260, 440, 1.6, 0.02 + i * 0.08); label('rate my desk', 420 + i * 260, 650, 0.1 + i * 0.08, { size: 30 }); });
  fpCalendar(1260, 440, 1.3, 0.34); label('every Friday', 1260, 620, 0.44, { size: 40 });
});
wed('A02', 'listen with care', 'care', () => {
  person(400, 560, 1.7, 0.02); hero(660, 520, 70, 0.06); fpHeart(530, 320, 0.16);
  fpList(1120, 260, 560, 'before it goes in', ['names spelled right', 'what not to show', 'who is who'], 0.26);
});
corp('A02', 'check every claim', 'claim', () => {
  fpCard3(560, 440, 560, 280, 0.02, { bar: SK.terra, title: 'script' }); label('"No. 1 in India"', 540, 480, 0.12, { size: 44 });
  fpMagnifier(900, 330, 70, 0.24); fpSpeech(1220, 380, 380, 120, 'source?', 0.34, { tail: 'right' }); cross(1220, 560, 1, 0.46);
});
soc('A02', 'test before you shoot', 'test', () => {
  fpPhone(400, 420, 1.7, 0.02); label('hook A', 400, 640, 0.1, { size: 40 }); fpPhone(700, 420, 1.7, 0.12); label('hook B', 700, 640, 0.2, { size: 40 });
  fpMeter(1000, 380, 420, 0.3, 0.3, { name: 'A' }); fpMeter(1000, 500, 420, 0.8, 0.36, { name: 'B' }); check(1470, 500, 0.8, 0.46);
});
wed('A03', 'budget for every day', 'every day', () => {
  fpCalendar(330, 440, 1.6, 0.02, 3); fpCoins(660, 480, 1.4, 0.14);
  fpList(1150, 260, 520, 'three days', ['crew and travel', 'backup camera', 'food and stay', 'edit days'], 0.24);
});
corp('A03', 'paperwork before the shoot', 'before', () => {
  [['NDA', 400], ['location', 640], ['releases', 880]].forEach(([n, x], i) => { fpFile(x, 430, 1.6, n, 0.02 + i * 0.08); check(x + 60, 330, 0.8, 0.3 + i * 0.06); });
  arrow([[1000, 440], [1130, 440]], 0.4); fpClapper(1280, 440, 1.2, 0.44);
});
soc('A03', 'leave room for a trend', 'room', () => {
  fpCalendar(330, 440, 1.6, 0.02);
  fpList(1000, 260, 600, 'this week', ['Mon: recipe', 'Wed: behind the scenes', 'Fri: open for a trend'], 0.16);
  L(box(710, 405, 580, 56, 10), 0.4, { closed: true, col: SK.terra, d: 0.08 });
});
wed('A04', 'test both cameras together', 'together', () => {
  fpCamera(300, 360, 1, 0.02); fpCamera(300, 580, 1, 0.06);
  fpFrame(760, 440, 320, 200, 0.14); hero(760, 440, 50, 0.18); fpFrame(1140, 440, 320, 200, 0.22); FL(box(980, 340, 320, 200, 8), '#cfe3c0', 0.26, { a: 0.5 }); hero(1140, 440, 50, 0.3);
  label('greener? fix it now', 950, 640, 0.4, { size: 40 });
});
corp('A04', 'write the setup down', 'write', () => {
  fpCamera(340, 440, 1.3, 0.02); hero(620, 480, 70, 0.08);
  fpList(1100, 260, 560, 'interview setup', ['50mm lens', '5600K white balance', 'key light on the left', '25 fps'], 0.18);
});
soc('A04', 'test after the upload', 'upload', () => {
  fpPhone(330, 440, 1.8, 0.02); arrow([[460, 440], [620, 440]], 0.12); fpCloud(760, 420, 1.2, 0.16); arrow([[900, 440], [1020, 440]], 0.24);
  fpFrame(1220, 440, 340, 220, 0.28); [0, 1, 2, 3].forEach((i) => FL(box(1080 + i * 70, 470, 60, 60, 2), '#3a342e', 0.34 + i * 0.03, { a: 0.6 }));
  label('dark parts break up', 1220, 620, 0.46, { size: 36 });
});
wed('A05', 'actions, not poses', 'actions', () => {
  hero(420, 480, 80, 0.02); person(580, 500, 1.5, 0.06); arrow([[380, 640], [700, 640]], 0.16);
  fpSpeech(1060, 360, 560, 130, 'walk and tell her a memory', 0.24); cross(1060, 560, 0.7, 0.42); label('"smile more"', 1240, 560, 0.42, { size: 36, col: SK.graph });
});
corp('A05', '15 minutes, planned', 'planned', () => {
  fpClock(330, 440, 110, 0.02);
  fpList(960, 250, 620, 'the 15 minutes', ['greet and explain', 'sound check', 'the key questions', 'one more take'], 0.14);
});
soc('A05', 'get the reaction', 'reaction', () => {
  person(360, 560, 1.6, 0.02); fpSpeech(400, 330, 380, 120, 'the punchline', 0.08);
  fpFrame(1000, 440, 460, 300, 0.2); hero(1000, 460, 80, 0.26); label('the reaction', 1000, 640, 0.36, { size: 40 }); check(1260, 320, 0.9, 0.44);
});
wed('A06', 'light the faces', 'faces', () => {
  [300, 460].forEach((x, i) => fpBulb(x, 320, 44, 0.02 + i * 0.05)); label('stage lights', 380, 420, 0.1, { size: 34, col: SK.graph });
  fpSoftbox(720, 380, 1.1, 0.16); hero(1060, 480, 80, 0.26); person(1240, 500, 1.5, 0.3);
});
corp('A06', 'one look, every time', 'one look', () => {
  fpFrame(480, 440, 420, 260, 0.02, { label: 'March', size: 36 }); hero(480, 430, 60, 0.08);
  label('=', 800, 460, 0.16, { size: 80, face: 'marker' }); fpFrame(1120, 440, 420, 260, 0.2, { label: 'October', size: 36 }); hero(1120, 430, 60, 0.26);
});
soc('A06', 'same set every week', 'same', () => {
  fpFrame(560, 440, 560, 340, 0.02); fpLamp(400, 420, 0.1); hero(620, 480, 80, 0.16);
  fpCalendar(1200, 440, 1.4, 0.3); label('every week', 1200, 620, 0.42, { size: 40 });
});
wed('A07', 'two recordings for the vows', 'two', () => {
  hero(420, 480, 80, 0.02); L(circ(450, 600, 10), 0.1, { closed: true, w: 4, d: 0.04 }); label('lapel', 420, 680, 0.14, { size: 40 });
  fpRecorder(820, 460, 1.4, 0.2); label('backup', 820, 640, 0.26, { size: 40 }); fpPadlock(1180, 460, 1.4, 0.36); label('vows happen once', 1180, 620, 0.42, { size: 36 });
});
corp('A07', 'take a feed from the desk', 'feed', () => {
  person(300, 560, 1.4, 0.02); person(460, 560, 1.4, 0.04); fpMic(380, 400, 0.8, 0.08);
  L(box(700, 380, 240, 140, 10), 0.16, { closed: true, d: 0.08 }); label('mixer', 820, 470, 0.2, { size: 40 });
  arrow([[960, 450], [1080, 450]], 0.28); fpRecorder(1200, 450, 1.3, 0.32);
});
soc('A07', 'one mic per voice', 'per voice', () => {
  person(520, 560, 1.7, 0.02); fpMic(600, 420, 0.7, 0.1); person(1000, 560, 1.7, 0.16); fpMic(1080, 420, 0.7, 0.22);
  label('two people, two mics', 760, 680, 0.36, { size: 40 });
});
wed('A08', 'two copies, two places', 'two', () => {
  fpCard(330, 440, 1.4, 0.02); arrow([[430, 440], [560, 440]], 0.1);
  fpDrive(700, 380, 1.4, 0.14); fpDrive(700, 520, 1.4, 0.2); fpCloud(1040, 440, 1.4, 0.28); label('until it is delivered', 1040, 620, 0.4, { size: 36 });
});
corp('A08', 'hand over clean folders', 'clean', () => {
  fpFolder(340, 440, 1.6, 'project', 0.02); fpFile(640, 440, 1.3, 'licences', 0.12); fpFile(840, 440, 1.3, 'read-me', 0.18);
  arrow([[960, 450], [1060, 450]], 0.28); person(1220, 540, 1.6, 0.32);
});
soc('A08', 'start from a template', 'template', () => {
  fpCard3(480, 440, 480, 320, 0.02, { bar: SK.terra, title: 'weekly template' }); label('fonts, captions, folders', 480, 480, 0.12, { size: 34 });
  arrow([[740, 440], [860, 440]], 0.24); fpStrip(1100, 440, 2, 0.28, 3); label('new episode', 1100, 560, 0.4, { size: 36 });
});
wed('A09', 'one list from one person', 'one', () => {
  [280, 400, 520].forEach((x, i) => { person(x, 580, 1.1, 0.02 + i * 0.04); fpSpeech(x, 360 - (i % 2) * 40, 120, 70, '...', 0.06 + i * 0.04); });
  arrow([[620, 480], [760, 480]], 0.24); person(880, 560, 1.5, 0.28); fpList(1260, 280, 400, 'one list', ['change 1', 'change 2'], 0.36);
});
corp('A09', 'show the trade-off', 'trade-off', () => {
  fpFrame(420, 400, 300, 180, 0.02, { label: 'shorter', size: 36 }); fpFrame(820, 400, 300, 180, 0.08, { label: 'more history', size: 36 });
  fpSpeech(1260, 380, 360, 120, 'who decides?', 0.24, { tail: 'right' }); hero(620, 620, 50, 0.36);
});
soc('A09', 'let the numbers speak', 'numbers', () => {
  fpMeter(480, 360, 520, 0.85, 0.02, { name: 'views A' }); fpMeter(480, 470, 520, 0.4, 0.08, { name: 'watched A' });
  fpMeter(480, 580, 520, 0.6, 0.14, { name: 'watched B' }); check(1080, 580, 0.9, 0.3); label('keep B, fix its hook', 1260, 470, 0.4, { size: 36 });
});
wed('A10', 'words first, then music', 'words', () => {
  fpTrack(300, 380, 1000, 'vows', 0.02, { amp: 30 }); fpTrack(300, 500, 1000, 'music', 0.1, { amp: 30, quiet: [[0.1, 0.6]] });
  label('music dips under the vows', 800, 640, 0.3, { size: 40 });
});
corp('A10', 'check it on big speakers', 'big', () => {
  fpLaptop(400, 470, 1.2, 0.02); cross(400, 330, 0.7, 0.14);
  [880, 1240].forEach((x, i) => { const P = box(x - 90, 300, 180, 300, 12); FL(P, '#d8d2c6', 0.2 + i * 0.06); L(P, 0.18 + i * 0.06, { closed: true, d: 0.08 }); L(circ(x, 400, 40), 0.24 + i * 0.06, { closed: true, d: 0.05 }); L(circ(x, 520, 26), 0.26 + i * 0.06, { closed: true, d: 0.05 }); });
  check(1060, 330, 0.9, 0.4);
});
soc('A10', 'mix for a phone speaker', 'phone', () => {
  fpPhone(330, 440, 1.8, 0.02); fpWaves(420, 440, 3, 30, 22, 0.1);
  fpTrack(700, 380, 700, 'voice', 0.18, { amp: 40 }); fpTrack(700, 500, 700, 'music', 0.24, { amp: 12 });
});
wed('A11', 'true skin, true colours', 'true', () => {
  fpFrame(480, 440, 480, 320, 0.02); hero(420, 450, 70, 0.08); person(560, 470, 1.4, 0.12);
  fpCard3(1010, 420, 340, 220, 0.24, { title: 'the real lehenga' }); FL(box(930, 440, 160, 70, 6), SK.red, 0.3);
  fpScope(1370, 430, 240, 220, 0.36, 'vector');
});
corp('A11', 'match the brand guide', 'guide', () => {
  fpCard3(420, 440, 400, 300, 0.02, { bar: SK.terra, title: 'brand guide' }); [0, 1, 2].forEach((i) => FL(box(290 + i * 90, 460, 70, 70, 6), [SK.red, SK.ink, SK.yellow][i], 0.12 + i * 0.04));
  arrow([[660, 440], [780, 440]], 0.26); fpScope(1000, 440, 360, 280, 0.3, 'vector'); check(1260, 330, 0.9, 0.44);
});
soc('A11', 'a look that survives', 'survives', () => {
  fpFrame(460, 440, 420, 260, 0.02, { label: 'heavy grain', size: 36 }); [0, 1, 2].forEach((i) => FL(box(300 + i * 100, 380, 80, 80, 2), '#3a342e', 0.1 + i * 0.03, { a: 0.6 }));
  arrow([[700, 440], [820, 440]], 0.22); fpPhone(1000, 440, 1.8, 0.26); label('keep it gentle', 1300, 450, 0.38, { size: 40 });
});
wed('A12', 'teaser first, film later', 'teaser', () => {
  fpCalendar(330, 440, 1.6, 0.02);
  fpList(1000, 250, 600, 'deliver in order', ['same-day edit', 'teaser', 'highlight film', 'full film'], 0.16);
});
corp('A12', 'one shoot, every channel', 'every', () => {
  fpClapper(320, 440, 1.3, 0.02); arrow([[440, 440], [560, 440]], 0.1);
  [['website', 720], ['LinkedIn', 940], ['office screens', 1160], ['subtitled', 1380]].forEach(([n, x], i) => { fpFrame(x, 420, 190, 130, 0.16 + i * 0.06); label(n, x, 540, 0.2 + i * 0.06, { size: 30 }); });
});
soc('A12', 'note what worked', 'worked', () => {
  fpPhone(330, 440, 1.8, 0.02);
  fpList(1000, 260, 640, 'campaign notes', ['who stayed past 3 seconds', 'saves and shares', 'best posting time'], 0.14);
});

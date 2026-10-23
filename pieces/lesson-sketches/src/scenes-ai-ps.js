// =====================================================================
//  AI and WORKING WITH PEOPLE lesson sketches (curriculum update, 22 Oct 2026). Same page, props and timing.
//  The AI lessons sit at the end of their module; the B-PS, I-PS and A-PS modules are new.
//  Content stays between y 250 and 680 (the caption sits at 800); fpWave and fpTrack start at their x.
// =====================================================================
function fpAI(x, y, t, s = 1) {                        // a small "AI" box: the tool's suggestion, never the final say
  const P = box(x - 80 * s, y - 55 * s, 160 * s, 110 * s, 16 * s);
  FL(P, '#fffaf0', t + 0.04, { off: [4, 4] }); L(P, t, { closed: true, d: 0.08 });
  label('AI', x, y + 18 * s, t + 0.06, { face: 'marker', size: 56 * s, col: SK.terra });
}

// ---- Beginner: AI ----
lesson('B02-6', () => { pg(6, 'AI sketches, you choose', 'choose');
  fpAI(260, 420, 0.02); arrow([[360, 420], [450, 420]], 0.1);
  fpFrame(640, 420, 300, 200, 0.14, { label: 'wide of the market', size: 32 }); fpFrame(1020, 420, 300, 200, 0.22, { label: 'drone shot', size: 32 });
  cross(1020, 400, 1.2, 0.34); hero(1340, 470, 70, 0.4, { look: [-1, -0.2], arms: [1.1, null] }); });
lesson('B03-7', () => { pg(7, 'check the AI breakdown', 'check');
  fpAI(300, 440, 0.02); arrow([[400, 440], [520, 440]], 0.1);
  fpList(860, 250, 600, 'shot list', ['wide of the shop', 'baker kneading', 'street at night, rain', 'bread close-up'], 0.14, { cross: [2] });
  hero(1350, 520, 60, 0.46, { look: [-1, -0.3] }); });
lesson('B04-6', () => { pg(6, 'auto framing: watch it', 'watch');
  fpPhone(420, 440, 2, 0.02); hero(420, 430, 54, 0.12); L(box(340, 340, 160, 190, 8), 0.2, { closed: true, col: SK.terra, d: 0.08 });
  fpFrame(1040, 430, 520, 320, 0.3); person(930, 490, 1.3, 0.36); person(1150, 490, 1.3, 0.38);
  L(box(870, 330, 130, 250, 8), 0.44, { closed: true, col: SK.terra, d: 0.08 }); cross(1250, 330, 0.8, 0.52); });
lesson('B09-7', () => { pg(7, 'edit from the transcript', 'transcript');
  fpLaptop(430, 470, 1.4, 0.02);
  fpCard3(1060, 440, 620, 340, 0.14, { bar: SK.terra, title: 'transcript' });
  label('we bake at five', 1040, 470, 0.24, { size: 40 }); label('um, so, er', 1040, 540, 0.3, { size: 40, col: SK.graph });
  L([[930, 528], [1150, 522]], 0.4, { col: SK.red, w: 5, second: false, d: 0.06 }); });
lesson('B10-7', () => { pg(7, 'clean up speech, gently', 'gently');
  fpWave(150, 420, 380, 70, 0.02); arrow([[560, 420], [640, 420]], 0.16); fpAI(760, 420, 0.2);
  arrow([[870, 420], [950, 420]], 0.28); fpWave(980, 420, 380, 34, 0.32);
  fpHeadphones(1170, 600, 56, 0.44); label('still her voice?', 900, 620, 0.5, { size: 40 }); });
lesson('B12-6', () => { pg(6, 'AI captions: read every line', 'read');
  fpPhone(400, 440, 2, 0.02);
  fpCard3(1000, 430, 640, 340, 0.12, { bar: SK.terra, title: 'captions' });
  label('Anjali bakes at five', 980, 470, 0.22, { size: 40 }); label('Angeli', 980, 540, 0.3, { size: 40, col: SK.red });
  L([[900, 530], [1060, 524]], 0.38, { col: SK.red, w: 5, second: false, d: 0.06 }); check(1240, 470, 0.9, 0.46); });

// ---- Beginner: Work with people and present your work ----
lesson('B-PS-1', () => { pg(1, 'speak so people listen', 'listen');
  hero(360, 500, 90, 0.02, { arms: [0.4, -0.6] });
  fpSpeech(760, 330, 520, 130, 'one point, then an example', 0.14);
  person(1180, 540, 1.5, 0.3); person(1380, 560, 1.3, 0.34); fpHeart(1280, 330, 0.5); });
lesson('B-PS-2', () => { pg(2, 'ask, then listen', 'listen');
  hero(360, 500, 80, 0.02); fpSpeech(620, 320, 420, 120, 'who is it for?', 0.12);
  person(1200, 560, 1.6, 0.3); fpSpeech(1100, 330, 400, 120, 'my regulars', 0.4, { tail: 'right' });
  fpCard3(720, 590, 300, 150, 0.5, { bar: SK.terra, title: 'notes' }); });
lesson('B-PS-3', () => { pg(3, 'feedback: kind and specific', 'specific');
  fpFrame(380, 440, 420, 280, 0.02); hero(380, 440, 50, 0.08);
  fpSpeech(1020, 330, 560, 120, 'the opening is slow', 0.16); fpSpeech(1020, 520, 560, 120, 'cut the first 5 seconds?', 0.3);
  check(1350, 520, 0.9, 0.42); });
lesson('B-PS-4', () => { pg(4, 'run a first meeting', 'meeting');
  person(300, 560, 1.6, 0.02); hero(560, 520, 80, 0.06);
  fpList(1080, 250, 560, 'agenda', ['the goal', 'who it is for', 'date and budget', 'next step'], 0.16); });
lesson('B-PS-5', () => { pg(5, 'show what you can do', 'show');
  fpLaptop(420, 460, 1.4, 0.02);
  [0, 1, 2].forEach((i) => fpFrame(880 + i * 230, 400, 200, 140, 0.14 + i * 0.06)); label('your best three', 1110, 540, 0.34, { size: 40 });
  person(1110, 680, 1.1, 0.42, { wave: true }); });

// ---- Intermediate: AI ----
lesson('I03-7', () => { pg(7, 'AI changed the schedule: check it', 'check');
  fpCalendar(330, 440, 1.6, 0.02); fpAI(680, 440, 0.16); arrow([[780, 440], [870, 440]], 0.22);
  fpList(1190, 280, 520, 'new plan', ['interview 10:00', 'sunset at 2:00', 'travel 15 min'], 0.26, { cross: [1] }); });
lesson('I08-7', () => { pg(7, 'find footage with AI search', 'search');
  fpMagnifier(330, 430, 110, 0.02); fpSpeech(780, 320, 520, 120, 'baker smiling, close', 0.14);
  fpStrip(1080, 520, 2, 0.3, 4); check(1080, 640, 0.8, 0.46); });
lesson('I09-7', () => { pg(7, 'fix the AI multicam cut', 'fix');
  fpTrack(360, 340, 1000, 'cam A', 0.02); fpTrack(360, 460, 1000, 'cam B', 0.08);
  L([[860, 290], [860, 510]], 0.22, { col: SK.red, w: 5, second: false, d: 0.06 }); L([[1010, 290], [1010, 510]], 0.34, { col: SK.green, w: 5, second: false, d: 0.06 });
  label('AI cut', 860, 600, 0.3, { size: 40, col: SK.red }); label('on the reaction', 1060, 640, 0.42, { size: 40, col: SK.green }); });
lesson('I10-7', () => { pg(7, 'repair, don\'t ruin, the voice', 'voice');
  fpWave(150, 400, 360, 70, 0.02); fpSlider(800, 400, 360, 'strength', 0.4, 0.16); fpWave(1090, 400, 360, 40, 0.3);
  fpHeadphones(800, 600, 56, 0.4); });
lesson('I14-5', () => { pg(5, 'plan where AI helps', 'helps');
  fpList(500, 250, 600, 'my film', ['story and people', 'transcript search', 'caption draft', 'final choices'], 0.02);
  fpAI(1080, 420, 0.3); arrow([[990, 400], [820, 380]], 0.36); arrow([[990, 450], [820, 470]], 0.4);
  hero(1340, 520, 70, 0.46); });

// ---- Intermediate: Win clients and pitch your ideas ----
lesson('I-PS-1', () => { pg(1, 'diagnose before you sell', 'diagnose');
  person(320, 560, 1.6, 0.02); fpSpeech(420, 320, 420, 120, 'we need a reel', 0.1);
  hero(860, 520, 80, 0.2); fpSpeech(1120, 320, 460, 120, 'why? and for whom?', 0.3, { tail: 'right' }); fpMagnifier(1260, 560, 80, 0.42); });
lesson('I-PS-2', () => { pg(2, 'sell the idea with a treatment', 'treatment');
  fpCard3(540, 450, 620, 400, 0.02, { bar: SK.terra, title: 'treatment' });
  fpFrame(430, 470, 200, 140, 0.12); fpFrame(660, 470, 200, 140, 0.18); label('the look and the story', 540, 600, 0.26, { size: 36 });
  person(1160, 560, 1.6, 0.34); fpHeart(1160, 330, 0.44); });
lesson('I-PS-3', () => { pg(3, 'when notes clash', 'clash');
  fpSpeech(360, 320, 440, 120, 'make it shorter', 0.02); fpSpeech(1240, 320, 440, 120, 'add the history', 0.1, { tail: 'right' });
  hero(800, 330, 60, 0.24); fpList(800, 530, 460, 'two options', ['a short cut', 'a long cut'], 0.34); });
lesson('I-PS-4', () => { pg(4, 'say your price, then stop', 'price');
  hero(330, 500, 80, 0.02); fpSpeech(720, 330, 560, 130, 'Rs 25,000, with two edits', 0.12);
  fpCoins(1200, 520, 1.6, 0.3); label('then wait', 760, 600, 0.42, { size: 44, face: 'marker' }); });
lesson('I-PS-5', () => { pg(5, 'a simple marketing plan', 'plan');
  fpCalendar(380, 440, 1.6, 0.02);
  fpList(1040, 270, 620, 'every week', ['one piece of work', 'one behind the scenes', 'reply to messages'], 0.18); });

// ---- Advanced: AI ----
lesson('A04-7', () => { pg(7, 'plan the hybrid shot on set', 'hybrid');
  fpCamera(300, 440, 1.4, 0.02);
  fpFrame(800, 430, 520, 320, 0.14); person(700, 500, 1.4, 0.22);
  L(box(840, 300, 210, 200, 8), 0.3, { closed: true, col: SK.terra, d: 0.08 }); label('AI sky', 945, 410, 0.36, { size: 40, col: SK.terra });
  fpList(1340, 280, 360, 'on set', ['match the light', 'lock the camera', 'a clean plate'], 0.42); });
lesson('A08-8', () => { pg(8, 'hand over AI masks safely', 'masks');
  fpFolder(340, 440, 1.6, 'project', 0.02);
  fpFile(660, 440, 1.3, 'masks', 0.14); fpFile(860, 440, 1.3, 'read-me', 0.2);
  arrow([[960, 460], [1060, 460]], 0.3); person(1200, 540, 1.6, 0.34); check(1380, 380, 0.9, 0.44); });
lesson('A11-7', () => { pg(7, 'check AI masks before you grade', 'masks');
  fpFrame(500, 440, 600, 380, 0.02); person(500, 520, 1.8, 0.1);
  L(circ(500, 420, 120), 0.2, { closed: true, col: SK.terra, d: 0.1 }); fpMagnifier(760, 300, 60, 0.3);
  label('edges flicker?', 1150, 400, 0.36, { size: 44, col: SK.red }); label('check frame by frame', 1150, 480, 0.44, { size: 40 }); });
lesson('A13-5', () => { pg(5, 'mix AI shots with live action', 'mix');
  fpStrip(800, 430, 2.6, 0.02, 4);
  label('live', 548, 540, 0.2, { size: 40, col: SK.graph }); label('AI', 716, 540, 0.24, { size: 40, col: SK.terra }); label('live', 884, 540, 0.28, { size: 40, col: SK.graph }); label('AI', 1052, 540, 0.32, { size: 40, col: SK.terra });
  label('same light, grain and lens', 800, 650, 0.4, { size: 44 }); });

// ---- Advanced: Lead teams and win approval ----
lesson('A-PS-1', () => { pg(1, 'turn a crew into a team', 'team');
  hero(620, 440, 80, 0.02);
  person(360, 520, 1.3, 0.12); person(880, 520, 1.3, 0.16); person(480, 640, 1.1, 0.2); person(760, 640, 1.1, 0.24);
  fpList(1260, 260, 440, 'briefing', ['the goal', 'who does what', 'call times'], 0.32); });
lesson('A-PS-2', () => { pg(2, 'calm with difficult clients', 'calm');
  person(1200, 560, 1.7, 0.02, { wave: true }); fpSpeech(1140, 310, 460, 120, 'this is all wrong!', 0.08, { tail: 'right' });
  hero(420, 500, 80, 0.24); fpSpeech(560, 310, 460, 120, 'which part first?', 0.34); });
lesson('A-PS-3', () => { pg(3, 'price on value', 'value');
  fpCoins(330, 460, 1.8, 0.02); arrow([[470, 440], [580, 440]], 0.12);
  fpList(1000, 270, 680, 'what the client gets', ['more bookings', 'a film for three years', 'one less worry'], 0.16); });
lesson('A-PS-4', () => { pg(4, 'pick your niche', 'niche');
  [['weddings', 300], ['brands', 390], ['reels', 480], ['events', 570]].forEach(([w, y], i) => label(w, 380, y, 0.02 + i * 0.05, { size: 48, col: i === 1 ? SK.ink : SK.graph }));
  L(box(250, 345, 260, 64, 30), 0.3, { closed: true, col: SK.terra, d: 0.1 }); arrow([[540, 390], [780, 390]], 0.36);
  hero(1040, 440, 90, 0.4); label('known for one thing', 1040, 640, 0.46, { size: 44 }); });
lesson('A-PS-5', () => { pg(5, 'pitch for a yes', 'yes');
  hero(330, 500, 80, 0.02, { arms: [0.4, -0.6] });
  fpCard3(800, 440, 520, 320, 0.12, { bar: SK.terra, title: 'the pitch' }); label('start on the 5th?', 800, 500, 0.24, { size: 44 });
  person(1280, 560, 1.6, 0.34); check(1280, 330, 1.1, 0.46); });

import type {Pathway} from './programme';

// Curated, credited videos per curriculum module. Every YouTube ID was checked
// against YouTube's oEmbed endpoint (public + embeddable) on 9 Oct 2026.
export type ModuleVideo={title:string;creator:string;youtubeId?:string;vimeoId?:string;focus:string};
export type ModuleImage={base:string;alt:string};

const v=(youtubeId:string,title:string,creator:string,focus:string):ModuleVideo=>({youtubeId,title,creator,focus});
const vm=(vimeoId:string,title:string,focus:string):ModuleVideo=>({vimeoId,title,creator:'Blackmagic Design',focus});

const V={
 storytelling:v('WMcWLFtGnAs','Directing Without Words: Visual Storytelling in Film','StudioBinder','Notice the intended feeling and the visual evidence that creates it.'),
 shotSizes:v('AyML8xuKfoc','Every Shot Size Explained','StudioBinder','Connect each shot size to what the viewer needs to see.'),
 editingCuts:v('FVR8zz8ci2k','Six Essential Film Editing Techniques','StudioBinder','Watch how each cut moves the story or the viewer’s attention.'),
 shutter:v('SsIEcGbwgN0','Shutter Speed and the Exposure Triangle','StudioBinder','See how shutter choice changes motion and brightness.'),
 iso:v('cy9wPDKd-dU','Camera ISO and the Exposure Triangle','StudioBinder','Balance ISO against noise once aperture and shutter are set.'),
 whiteBalance:v('APLq7aPlDhk','Colour Temperature and White Balance','StudioBinder','Spot colour casts and keep white balance consistent between shots.'),
 framing:v('qQNiqzuXjoM','Camera Framing and Visual Storytelling','StudioBinder','Look at headroom, looking space and what the frame leaves out.'),
 aspect:v('T0YHA2yxCwM','Aspect Ratios in Film','StudioBinder','Consider how each delivery shape changes framing decisions.'),
 lightTypes:v('r2nD_knsNrc','Cinematic Lighting: Types of Light','StudioBinder','Name key, fill, back and practical light in each example.'),
 lightBasics:v('hGEsOcF3PoM','The Basics of Lighting for Film','Cinecom.net','Notice direction and softness before adding more lights.'),
 betterSound:v('wbEt3IBCMI8','A Vlogger’s Guide to Better Sound','RØDE','Microphone distance matters more than the price of the microphone.'),
 wind:v('SBG3KXLyGcQ','Reduce Wind Noise When Recording Outside','RØDE','Protect outdoor speech before it reaches the recorder.'),
 movement:v('iAZvLA_K94w','Panning and Tilting Camera Movements','StudioBinder','Give every camera move a reason.'),
 axis:v('iW0bKUfvH2c','The 180 Degree Rule in Film','StudioBinder','Keep screen direction consistent so action stays easy to follow.'),
 resolveIntro:v('fYlwId_z_yU','Introduction to Editing · DaVinci Resolve 17','Blackmagic Design','Follow the full first-edit workflow from import to timeline.'),
 threeActs:v('tvqjp1CxxD8','Three Act Structure Explained','StudioBinder','Find the beginning, development and ending in any short piece.'),
 shortFilm:v('3QRrsiMe4wI','The Pen · A Short Film','StudioBinder','Analyse how each image moves a simple story forward.'),
 shotList:v('BdyhNmVFXdw','What is a Shot List? (and How to Make One)','StudioBinder Academy','Turn a story outline into specific, filmable shots.'),
 storyboard:v('Wnbo_PVfMfE','What is a Storyboard and How to Make One','StudioBinder Academy','Rough frames are enough; the goal is a shared plan.'),
 treatment:v('SCi4tj0D10E','Director’s Treatment: The Ultimate Guide to a Winning Pitch','Nur Niaz','A treatment explains concept, structure, picture and sound.'),
 schedule:v('9IyI1YAVBW8','How to Create a Shooting Schedule Using Stripboards','StudioBinder','Order the shoot around locations, people and risk.'),
 interview:v('PTnXvWLR-A4','How to Interview Someone On Camera (7 Easy Steps)','Jacob LE','Prepare questions that let people answer in their own words.'),
 interviewSetup:v('FElRjwAeiRw','How to Shoot an Interview','B&H Photo Video Pro Audio','Plan framing, light and microphone placement together.'),
 organise:v('I7U18PBWYZk','Organizing Media · Learning Premiere Pro, Episode 04','chinfat','Build bins and naming you can still understand next week.'),
 bins:v('s4yTISffZl4','Quick Tip: How To Organize Footage in Premiere Pro Using Bins','Mike Murphy','A bin is a folder inside the project; use it from the first import.'),
 budget:v('I2XlR0BIIVU','Video Budget Template: Creating Yours and Determining Costs','Pull My Focus','Every cost follows from scope, people, time and equipment.'),
 dataMgmt:v('G83k5aZ1Gr8','Data Management for Film and Video Part 1: Transferring Media','chinfat','Verify every copy before a card is reused.'),
 backup321:v('2imTvT1L-AI','The ultimate 3-2-1 Backup method','DimusTech','Three copies, two kinds of media, one copy elsewhere.'),
 editStructure:v('X7W2rTeR5MQ','How To Tell A Story in Video Editing (3-Act Structure)','Unsplice','Structure is decided in the edit as much as on set.'),
 docEditing:v('2BvIoOjyIHg','9 Documentary Editing Techniques I Use on Every Project','Adorama Cinema · Aidin Robbins','Start with the pieces you are sure of, then build outwards.'),
 proEditor:v('vdX0JkqzrAY','Documentary Filmmaking: Process of a Pro Editor','This Guy Edits','Watch how revision rounds change a complex story.'),
 dualSound:v('dkTYpP6eec0','How to Record Sound for Video: Dual System Sync Sound','Curtis Judd','Record a backup and sync reference on every take.'),
 cameraLimits:v('kVxh-R6XE04','How To Test Your Camera’s Limitations','KINETEK','Test highlights, shadows and noise before the shoot depends on them.'),
 preShoot:v('qnz7oR0C2CI','The Cinematographer’s Pre-Shoot Blueprint: Gear & Workflow','Marcus Ferguson','Prepare and check every piece of the capture chain the night before.'),
 docStepByStep:v('KfirJkk7dnI','How to Make a Documentary Film: A Step-By-Step Guide','Camp Films','Research, access and a test change the story before principal filming.'),
 resolveAudio:vm('659185216','Introduction to audio · DaVinci Resolve','Clean dialogue first, then add music and effects.'),
 resolveSoundDesign:vm('659185384','Introduction to sound design · DaVinci Resolve','Build ambience and effects that support the picture.'),
 resolveMixing:vm('659185402','Introduction to mixing · DaVinci Resolve','Balance levels for the destination, then measure.'),
 resolveColour:vm('662444535','Introduction to colour · DaVinci Resolve','Correct exposure and balance before any creative look.'),
 resolveAdvColour:vm('662444855','Advanced colour · DaVinci Resolve','Match shots with scopes, then refine with secondaries.'),
 resolveColourMgmt:vm('662489460','Colour management · DaVinci Resolve','Keep input, timeline and output colour spaces deliberate.'),
 resolveDelivery:vm('662445335','Delivering content · DaVinci Resolve','Match export settings to each destination’s specification.'),
 resolveRefine:vm('659481873','Refining an edit · DaVinci Resolve','Trim and reorder until the sequence reads clearly.'),
 resolveMulticam:vm('659481886','Multicam editing · DaVinci Resolve','Sync multiple sources before cutting between them.'),
};

export const moduleVideos:Record<string,ModuleVideo[]>={
 B01:[V.storytelling,V.shortFilm],B02:[V.threeActs,V.shotList],B03:[V.shotList,V.storyboard],B04:[V.shutter,V.iso],
 B05:[V.shotSizes,V.framing],B06:[V.lightBasics,V.lightTypes],B07:[V.betterSound,V.wind],B08:[V.bins,V.organise],
 B09:[V.resolveIntro,V.editingCuts],B10:[V.resolveAudio,V.betterSound],B11:[V.resolveColour,V.whiteBalance],B12:[V.resolveDelivery,V.aspect],
 B14:[V.threeActs,V.shotList],
 I01:[V.storytelling,V.threeActs],I02:[V.treatment,V.storytelling],I03:[V.schedule,V.shotList],I04:[V.whiteBalance,V.shutter],
 I05:[V.axis,V.movement],I06:[V.lightTypes,V.lightBasics],I07:[V.interview,V.interviewSetup],I08:[V.organise,V.resolveMulticam],
 I09:[V.editStructure,V.resolveRefine],I10:[V.resolveSoundDesign,V.resolveAudio],I11:[V.resolveAdvColour,V.resolveColour],I12:[V.resolveDelivery,V.aspect],
 I14:[V.treatment,V.schedule],
 A01:[V.storytelling,V.treatment],A02:[V.docStepByStep,V.interview],A03:[V.budget,V.schedule],A04:[V.cameraLimits,V.preShoot],
 A05:[V.axis,V.interviewSetup],A06:[V.lightTypes,V.lightBasics],A07:[V.dualSound,V.wind],A08:[V.dataMgmt,V.backup321],
 A09:[V.docEditing,V.proEditor],A10:[V.resolveMixing,V.resolveSoundDesign],A11:[V.resolveColourMgmt,V.resolveAdvColour],A12:[V.resolveDelivery,V.backup321],
 A14:[V.budget,V.proEditor],
};

// The selected-pathway modules (B13 / I13 / A13) follow the learner's primary interest.
export const pathwayVideos:Record<Pathway,ModuleVideo[]>={
 Wedding:[v('sGWhLNi1tf8','8 Shots Every Wedding Filmmaker Should Know','How To Film Weddings','Plan the moments that cannot be repeated.'),v('c2GVF71Uv9k','How to Film a Wedding Ceremony Solo','How To Film Weddings','Position cameras and audio before the ceremony starts.')],
 Events:[v('CmVA3cWllB8','How To Shoot An Event Video: Shooting + Editing Tips','Josh Winiarski','There are no retakes at a live event; protect key moments.'),v('gGy7XHVj08A','Get Better Footage · Filming your First Event','Ben&Jack Studio','Simplify equipment so you can focus on coverage.')],
 Corporate:[v('3u3WP04I9-w','How to make Corporate Films Captivating','Ben&Jack Studio','Show people and purpose, not only logos and offices.'),v('6Tc7LBx7XzE','Top Ten Tips for a Great Corporate Video','Bailey Cooper Photography and Video','Agree the single message with the client first.')],
 Documentary:[v('uBBF6EZm9a8','How To Make a Short Documentary','The Documentary Couple','Find a character, build access, then plan coverage.'),v('B9E0dnd8y7g','6 Essential Documentary Filmmaking Tips','Documentary Film Academy','Let real moments lead; never stage them as spontaneous.')],
 'Social media':[v('43CwOUNbcAU','How to Make More Cinematic Instagram Reels','teemu.mp4','Design for vertical, short attention and sound-off viewing.'),V.aspect],
 YouTube:[v('mUAOaAkAWNU','How to use storytelling to make better YouTube videos','Film Booth','Hook, tension and payoff keep viewers watching.'),v('Q8_TxVQKVpg','5 storytelling tips for content creators','Fulaan Creative','Structure a creator video like a short story.')],
 Travel:[v('MGhjvist4gk','How To Make a Travel Video · 10 Tips','Lost LeBlanc','Capture place, people and detail, not only scenery.'),v('ztm5xBNByCU','How to Turn your Family Vacation into a Cinematic Film','Youssef Hallouly','A simple shot framework keeps filming from taking over the trip.')],
 Advertising:[v('n8o4ON2vePA','8 Tips to Make Better Product Videos','Austen Paul','Every shot should show a product benefit.'),v('jt6DVwCwZPk','5 Tips to Make Cinematic Product Commercials','Austen Paul','Use light and movement to reveal the product.')],
};

export function videosFor(moduleId:string,pathway:Pathway):ModuleVideo[]{return /13$/.test(moduleId)?pathwayVideos[pathway]:moduleVideos[moduleId]||[]}

// Owned illustrations (v15 media library), chosen per stage/topic.
const img=(base:string,alt:string):ModuleImage=>({base,alt});
const I={
 story:img('/lessons/story-01','Water pours from a steel kettle into a blue cup, showing a small everyday change.'),
 context:img('/lessons/story-02','A blue bicycle and helmet beside an open sunlit doorway, showing place and context.'),
 plan:img('/lessons/edit-04','A blank notebook with coloured tabs and neat pencils on a wooden desk.'),
 prepare:img('/lessons/event-prepare-1','A phone secured on a broad stand beside a power bank and cable, ready for a shoot.'),
 camera:img('/onboarding/focus-medium','A sharply focused subject in a medium shot.'),
 frame:img('/onboarding/frame-medium','A medium frame with clear subject placement.'),
 light:img('/lessons/light-01','A terracotta bowl catches morning light beside a teal-framed window.'),
 lightShape:img('/lessons/light-02','Crumpled silver paper casts a sharp afternoon shadow beside a sheer curtain.'),
 sound:img('/lessons/edit-03','Headphones beside a closed audio recorder on dark fabric.'),
 interview:img('/shared/A06','Two adults have a calm recorded conversation at a library table.'),
 organise:img('/lessons/edit-05','An external drive, coiled cable and plain archive box in morning light.'),
 archive:img('/shared/A16','A hand organising labelled storage drives beside archive folders.'),
 edit:img('/lessons/edit-01','Hands arrange three blank cards beside a wooden toy train, like shots in a sequence.'),
 pace:img('/lessons/edit-02','A wooden metronome on a teal worktable.'),
 colour:img('/lessons/light-03','Dark plums and a white porcelain cup keep delicate highlights against indigo fabric.'),
 deliver:img('/lessons/teach-finish-0','Hands check a lesson image on a phone beside an open laptop.'),
 event:img('/shared/A05','A small community hall with a camera operator at the side.'),
 field:img('/shared/A14','A hand holding a field notebook overlooking a public plaza.'),
};
export const moduleImages:Record<string,ModuleImage>={
 B01:I.story,B02:I.plan,B03:I.prepare,B04:I.camera,B05:I.frame,B06:I.light,B07:I.sound,B08:I.organise,B09:I.edit,B10:I.sound,B11:I.colour,B12:I.deliver,B13:I.context,B14:I.story,
 I01:I.story,I02:I.plan,I03:I.prepare,I04:I.camera,I05:I.frame,I06:I.lightShape,I07:I.interview,I08:I.organise,I09:I.pace,I10:I.sound,I11:I.colour,I12:I.deliver,I13:I.event,I14:I.field,
 A01:I.context,A02:I.field,A03:I.plan,A04:I.camera,A05:I.interview,A06:I.lightShape,A07:I.sound,A08:I.archive,A09:I.pace,A10:I.sound,A11:I.colour,A12:I.deliver,A13:I.event,A14:I.field,
};
const sizes=[480,960,1440];
export function imageSrcSet(image:ModuleImage){return sizes.map(w=>`${image.base}-${w}.webp ${w}w`).join(', ')}

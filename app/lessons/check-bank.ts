// Teaching checks, not evidence of the quality of an unseen film.
// Tuple: question, correct choice, two distractors, explanation.
export type CheckItem=[string,string,string,string,string];
export const checkBank:Record<string,CheckItem[]>={
framing:[
 ['A background object competes with your subject. What should you try first?','Change your position or framing','Increase the music volume','Export at a higher resolution','A small change of position can remove a distraction before you record.'],
 ['What does a wider shot help the viewer understand?','Where the action happens','The finest detail of a small object','Whether the microphone is working','A wider view establishes the surroundings; a close view reveals detail.'],
 ['What does cropping a recorded shot change?','How much of the frame is shown','The original camera perspective','The direction of the light','Cropping removes the edges. Moving the camera changes perspective.']
],
focus:[
 ['What should stay sharp in a close-up?','The detail the viewer needs to see','Only the background','Nothing; blur always looks better','Choose focus according to the story, not the amount of blur.'],
 ['Your subject moves towards the camera. What needs checking?','Whether focus follows the subject','Only the file name','Only the caption colour','A moving subject may leave the focused distance. Test before a real take.'],
 ['When might more depth of field help?','When several important subjects are at different distances','Whenever you want everything blurred','Only when recording sound','Greater depth of field keeps a larger range of distances acceptably sharp.']
],
exposure:[
 ['A face is too dark beside a bright window. What is a useful first test?','Change the position or add light to the face','Raise brightness without checking highlights','Turn up the microphone','Improve the light on the subject and check both face detail and bright areas.'],
 ['What is a common trade-off when raising ISO?','A brighter image with potentially more noise','A wider field of view','Automatically sharper focus','Higher ISO can brighten the image but can make noise more visible.'],
 ['What should you inspect after brightening a shot?','Whether bright details have been lost','Only the file size','Only the title spelling','Excessive exposure can clip highlights; a brighter image is not always a better one.']
],
motion:[
 ['What must you capture for useful slow motion?','Enough frames during the action','Only a longer pause after the action','A louder soundtrack','Slow playback spreads captured frames out in time; it cannot reliably recover missing detail.'],
 ['What changes when exposure time per frame becomes shorter?','Motion blur usually decreases','The lens automatically becomes wider','Audio becomes clearer','A shorter exposure records less movement within each frame and needs enough light.'],
 ['What should you test before filming fast movement?','The frame rate, exposure and actual playback','Only the opening title','Only the battery icon','A real motion test reveals problems that a still cannot show.']
],
colour:[
 ['A white object looks blue. Which setting is relevant?','White balance','Audio gain','Caption duration','White balance helps neutral objects look neutral under the current light.'],
 ['Why can mixed indoor and window light be difficult?','Different sources may give different colour casts','It always makes the picture sharper','It removes the need for exposure checks','One white-balance setting may not neutralise every light source at once.'],
 ['Two shots of the same scene look different. What should you compare?','A neutral reference and skin or object colours','Only their file names','Only their sound levels','Match the visible reference colours before adding a creative look.']
],
light:[
 ['How can you usually soften a shadow?','Use a larger light source relative to the subject','Make the source smaller','Change the file extension','The apparent size of the source affects shadow softness.'],
 ['A face has a very dark shadow side. What could help?','A safe reflector or gentle fill','Cropping the audio','Adding a faster title','Fill light can lift shadows; check that the shape still suits your shot.'],
 ['What makes a lighting setup easier to repeat?','Notes about subject, source and reflector positions','Only noting the camera brand','Deleting the test shot','Record the positions and keep a reference image.']
],
sound:[
 ['The room is louder than the voice. What should you test?','Move the microphone closer and reduce room noise','Move the microphone farther away','Brighten the picture','Microphone placement and a quieter space usually help more than boosting everything.'],
 ['The voice sounds distorted. What is a useful check?','Lower the recording level and record another test','Raise the volume even more','Change the picture orientation','Clipping can damage the recorded sound; listen to a fresh test.'],
 ['Can a single still prove that your sound is clear?','No; someone needs to listen to the recording','Yes, if the face is visible','Yes, if it is high resolution','Sound needs listening evidence. The AI still review cannot hear your recording.']
],
stability:[
 ['How can you reduce unwanted shake?','Use a safe support or a steadier stance','Wave the camera more quickly','Increase the music','A stable setup helps you keep the intended frame.'],
 ['Where is it safest to practise a supported shot?','On a stable surface away from edges and walkways','Balanced on an unstable ledge','Blocking a busy exit','Protect people and equipment before trying a camera setup.'],
 ['How do you judge whether a clip stayed steady?','Watch the full recorded movement','Inspect only its file name','Look at one still and assume','A still cannot reveal shake across time.']
],
pan:[
 ['Why hold the frame briefly at the end of a pan?','To let viewers see where the move ended','To change the lens focal length','To record more room noise','A settled ending gives the viewer time to read the destination.'],
 ['What should guide the direction of a camera move?','The action or information the viewer needs','Movement for its own sake','The length of the file name','Camera movement should reveal or follow something useful.'],
 ['How should you check a pan?','Watch the start, movement and ending together','Check only the middle still','Judge only by the duration','The complete move reveals timing, shake and whether the destination is clear.']
],
sequence:[
 ['A close-up makes little sense on its own. What might help?','A view showing where the detail belongs','An unrelated transition','A longer logo animation','Context connects the detail to the action or place.'],
 ['What should determine the order of your shots?','What the viewer needs to understand next','Alphabetical file names','Always putting the longest clip first','Choose a sequence that makes the idea clear.'],
 ['An edit feels slow. What is a useful first change?','Remove waiting while keeping essential context','Speed up every shot equally','Add more introductory text','Cutting empty time can improve pace without confusing the story.']
],
purpose:[
 ['What makes a useful video goal?','A clear change you want for a specific viewer','A list of every camera setting','A promise to include everything','A specific viewer and purpose help you decide what belongs in the film.'],
 ['A shot looks beautiful but does not help your message. What should you consider?','Leaving it out','Making it the longest shot automatically','Repeating it three times','Choose shots for their contribution to the intended outcome.'],
 ['What should your opening help a viewer understand?','Why this video is useful or interesting to them','Every detail you might cover later','Only the recording device','A clear opening gives a reason to keep watching.']
],
line:[
 ['Two people appear to face the same direction after a cut. What may have happened?','The camera crossed their axis without a clear transition','The microphone was too close','The export resolution was too high','Crossing the axis can reverse screen direction and confuse the relationship.'],
 ['How can you keep a conversation spatially clear?','Plan camera positions on one side of the axis','Move randomly between both sides','Use only tighter crops','Consistent screen direction helps viewers follow who is facing whom.'],
 ['Can you deliberately cross the line?','Yes, if you make the change clear to the viewer','No, it is physically impossible','Yes, without considering continuity','A motivated transition or visible move can establish a new relationship.']
],
format:[
 ['What should guide portrait versus landscape framing?','The destination and the action you need to show','Whichever gives the largest file','The microphone type','Choose a shape that suits the intended screen and subject.'],
 ['What needs checking when making a vertical crop?','That important action and text stay inside','Only the export file name','Only the original duration','Reframing can cut away information near the edges.'],
 ['How should you check the final export?','Play it on the target type of screen','Assume the editor preview is enough','Check only the folder size','Real playback can reveal cropping, caption and audio problems.']
],
titles:[
 ['What makes a caption easier to read on a phone?','Enough size, contrast and reading time','Very small decorative letters','A new colour for every word','Readability depends on size, contrast, placement and time.'],
 ['Where should you place captions?','Away from essential action and interface overlays','Across the only important detail','Always partly outside the frame','Keep the message visible without hiding the subject.'],
 ['What needs checking in automatic captions?','The actual words, timing and important sounds','Only the typeface','Nothing; they are always correct','Automatic captions can mishear names and technical terms.']
],
files:[
 ['Which is a better backup?','A checked copy on a separate device or service','A second folder on the same failing drive','Only a renamed original','Separate storage reduces the risk of losing both copies together.'],
 ['How do you check a copied video?','Open it and test playback','Only count the folders','Assume a copy dialog proves it plays','A completed transfer does not by itself prove a usable copy.'],
 ['When should you delete the only original?','Not before verified copies and retention needs are considered','As soon as an upload starts','Before checking the edit','Protect source material until you know what must be kept.']
],
memory:[
 ['How can you avoid cutting off a special moment?','Start early and leave some time after it','Record only the expected final second','Keep restarting during the action','Time before and after the action preserves context.'],
 ['If a real milestone is missed, what is honest?','Keep the gap clear rather than presenting a restaging as original','Pretend a restaging is the original moment','Change the date to match another clip','A recreated shot should not be passed off as the real event.'],
 ['Before sharing a personal moment, what should you check?','The agreed audience and people’s permission','Only the filter','Only the duration','Recording permission and sharing permission are separate.']
],
evidence:[
 ['A close-up shows damage but no location. What is missing?','An overview linking the detail to its surroundings','A dramatic soundtrack','A beauty filter','Context helps someone understand where the detail belongs.'],
 ['How should you treat a source recording used as a factual record?','Keep the original unchanged and label any copies or edits','Overwrite it with a filtered version','Remove context without noting it','Preserving the source and documenting changes supports an honest record, not legal certification.'],
 ['Can a learning score establish that a video is legally sufficient?','No; qualified advice may be needed','Yes, if it is over 75','Yes, if it was recorded in portrait','Framepath teaches recording skills and does not provide legal approval.']
],
process:[
 ['What does a repeatable demonstration need?','Starting state, essential action and visible result','Only the finished result','Only a list of tools','Show the information a viewer needs to understand the change.'],
 ['An important step happens off-camera. What should you do?','Show it clearly or explain the missing step honestly','Hide the gap with music','Claim nothing was skipped','A missing step can stop someone from following the process.'],
 ['How can you check whether instructions are understandable?','Ask someone to explain or safely try the steps','Count the transitions','Only increase resolution','Check the learner’s understanding, using safe practice appropriate to the task.']
],
event:[
 ['What should you do before an unrepeatable event?','Test the recording setup and a practical fallback','Try the equipment for the first time during it','Rely only on a full battery icon','A rehearsal can reveal sound, storage and placement problems.'],
 ['Where should you record an event from?','An agreed position that keeps routes and sightlines clear','An emergency exit for a better angle','Anywhere without asking','Respect the venue, participants and access routes.'],
 ['What does a backup plan need?','A tested way to preserve essential coverage if the main setup fails','Only another empty folder','A promise that nothing will fail','A fallback must be practical with the people and equipment available.']
],
interview:[
 ['Which question leaves room for the speaker’s own account?','What was that experience like?','You loved it, didn’t you?','You agree with me, right?','Open questions avoid pushing a particular answer.'],
 ['What should you agree before an interview?','Recording, intended use and sharing audience','Only which chair looks best','That every answer must be positive','Explain the purpose and get suitable permission before recording.'],
 ['What is a fair way to edit an answer?','Keep its meaning and relevant context','Join fragments to reverse its meaning','Remove uncertainty to make it sound certain','An edit should not misrepresent what the person said.']
],
place:[
 ['What helps a viewer understand a place?','Connected views from entrance to destination','Only decorative close-ups','Unrelated slow-motion clips','A connected route makes the layout understandable.'],
 ['What can make a property video misleading?','Framing or edits that exaggerate space without context','Showing a doorway between rooms','Keeping room order clear','Represent the space honestly; avoid implying connections or scale that are not there.'],
 ['Before recording inside a property, what should you check?','Permission and visible private belongings or information','Only the weather','Only the soundtrack','Access to a space does not automatically mean permission to record or publish it.']
],
creator:[
 ['What is a useful opening for a short tutorial?','Show the benefit, then explain how','A long introduction before any value','An unrelated shocking claim','Give the viewer the value you promised early.'],
 ['How should the video relate to its title?','Deliver the promised topic honestly','Change topics without explanation','Promise results it cannot support','The opening promise should match what the video provides.'],
 ['Where should essential information remain in a social crop?','Inside the visible area, clear of interface overlays','Under the app controls','Outside the portrait frame','Preview on the intended screen so information is not hidden.']
],
claims:[
 ['What makes a product demonstration more credible?','A visible action and an honest description of the result','An unsupported universal promise','A hidden cut at the crucial moment','Show what the sample establishes and avoid claiming more.'],
 ['A sample works once. What can you safely claim from that alone?','What happened in this sample, with its limits','That it always works for everyone','That it is certified safe','One demonstration cannot establish universal performance or safety.'],
 ['What should you avoid when editing a demonstration?','Changing the apparent result through misleading cuts','Showing a clear close-up','Including a limitation','Do not make an object appear to do something the recording does not support.']
],
teaching:[
 ['After showing a new action, what helps the learner practise?','A clear pause and a small task','Another long explanation immediately','A fast cut to a different topic','A manageable action and time to try it turn watching into practice.'],
 ['What is a useful objective for one short lesson?','One thing the learner can do afterwards','Every skill in the subject','Only the teacher’s biography','A focused objective makes examples and practice easier to choose.'],
 ['How can you check learning?','Ask the learner to apply the idea to a small example','Ask only whether the video looked nice','Count how many facts you said','Applying an idea gives better evidence than simply recognising it.']
],
screen:[
 ['What should you record for a short software demonstration?','Only the useful window or area','Every private tab and notification','The whole desktop regardless of the task','Limit the capture area and inspect a test for private information.'],
 ['Text looks tiny in a phone preview. What should you try?','Zoom or simplify the view before recording','Add more panels','Only raise the music','Make the relevant interface readable at the destination size.'],
 ['What should you do before capturing a real account?','Use safe sample data and hide notifications','Assume passwords are the only sensitive information','Publish first and inspect later','Names, messages and account details can be exposed accidentally.']
],
live:[
 ['What can a separate local recording help with?','Preserving the event if the connection fails','Keeping a failed internet connection working','Guaranteeing every viewer sees the stream','A local copy preserves footage but does not repair the live feed.'],
 ['What should you test before going live?','The full sound, picture and connection chain','Only the title card','Only the camera colour','A complete rehearsal catches problems across the whole setup.'],
 ['What is useful if a live feed fails?','A prepared message and a practical fallback','Pretending the audience can still see it','Deleting the local recording','Prepare how you will communicate and preserve the event.']
],
verification:[
 ['A person tells you what happened. How should you describe it?','As their account unless independently checked','As a proven fact immediately','As your own observation','Separate a source’s account from what you directly observed or verified.'],
 ['What should you keep when documenting a claim?','Source, context and what remains uncertain','Only the most dramatic detail','Only a confident headline','Clear attribution and uncertainty help avoid overstating evidence.'],
 ['Does a convincing-looking video prove every claim in it?','No; context and verification still matter','Yes, if it is sharp','Yes, if it has music','Image quality and confidence are not substitutes for verification.']
],
measurement:[
 ['What makes a visual comparison fairer?','A consistent viewpoint and relevant reference','Different angles for each sample','A different zoom every time','Changing geometry can make differences appear larger or smaller.'],
 ['Where should a size reference be placed?','In the relevant subject plane when practical','At an unrelated distance','Only in the file name','Perspective changes apparent scale; a reference must relate to the measured subject.'],
 ['Can an uncalibrated video provide a certified measurement?','No; calibrated methods and qualified review may be needed','Yes, if it is 4K','Yes, if a learning quiz is passed','A teaching comparison does not certify measurement accuracy or safety.']
],
archive:[
 ['What makes a recording easier to find later?','Date, context and a consistent description','Only an automatic file number','Deleting all notes','Useful metadata connects a file to its meaning.'],
 ['What should you check when preserving an old recording?','That the retained copy plays and its source is documented','Only whether the icon is attractive','Only its upload speed','Preservation includes usable playback and reliable context.'],
 ['How should private archive material be shared?','Only with the agreed audience and appropriate access','Automatically with a public link','Without checking consent','Archiving does not remove privacy and permission responsibilities.']
],
aerial:[
 ['What is a safe starting exercise for an aerial idea?','Plan viewpoints from the ground and identify constraints','Fly through people to test the route','Assume any open space permits flight','A ground plan helps you think without granting flight permission.'],
 ['What must happen before a real flight?','Check current local requirements, permissions and safe conditions','Only choose music','Only pass this learning quiz','The actual operation requires current rules and suitable qualified judgement.'],
 ['Does this course approve an aerial operation?','No; it teaches planning and image-making only','Yes, after three questions','Yes, for any phone-controlled drone','A learning score is not a licence or safety clearance.']
],
spatial:[
 ['A person looks broken at a 360° join. What needs checking?','Stitching alignment and subject position','Only the file name','Only the soundtrack','Seams can distort subjects, particularly near a join.'],
 ['What should you inspect before sharing a spatial scene?','The full surrounding view for private or unwanted content','Only the view facing forward','Only the title','A 360° recording can reveal people or information behind the camera.'],
 ['How do you check the viewer experience?','Test the export on the intended device','Assume a flat preview is sufficient','Judge only by resolution','The target device can reveal navigation, seam and comfort problems.']
],
temporal:[
 ['What usually makes stop-motion smoother?','Small, consistent changes between frames','Large irregular jumps','Changing light at every frame','Even increments help the movement feel continuous.'],
 ['What should remain stable during a stop-motion sequence?','The camera and lighting unless changes are intentional','Only the file names','Nothing; random changes always help','Unintended camera or light shifts can create distracting jumps.'],
 ['How should you check the motion before finishing?','Play a short sequence at the intended speed','Look only at the final still','Count the folders','Playback shows timing and jumps that individual frames cannot reveal.']
],
access:[
 ['What helps a viewer who cannot hear the video?','Accurate captions for speech and relevant sound','Music without captions','A brighter picture alone','Captions make audio information available visually.'],
 ['What helps when essential information is only visual?','A spoken or written description appropriate to the format','Removing all spoken words','Only adding background music','Describe the information needed to follow the action.'],
 ['How can you check an accessibility alternative?','Review it in the mode a viewer will use','Assume automatic output is correct','Check only the font name','Test captions, descriptions and playback for completeness and usability.']
],
privacy:[
 ['Does permission to record automatically allow public sharing?','No; agree the intended audience separately','Yes, always','Only if the clip is short','Recording and publishing are different decisions.'],
 ['What should you use for a safe practice involving sensitive contexts?','Fictional information or owned objects without identifying details','Real private records without asking','Identifying children for convenience','Practise the skill without exposing people or private information.'],
 ['You notice a private message in the background. What should you do?','Remove it from the practice and check the result before sharing','Ignore it because the subject is elsewhere','Upload first and ask later','Inspect the whole frame, not only the main subject.']
],
revision:[
 ['What is a useful way to improve a draft?','Change one clear issue and compare versions','Change everything without a reference','Delete the original immediately','A specific change is easier to judge against the original.'],
 ['An opening contains a long wait. What should you test?','Trim the wait while preserving essential context','Remove all context too','Repeat the wait twice','A shorter opening can help if the viewer still understands the action.'],
 ['How do you know a revision helps?','Compare it against the goal and intended viewer','Assume any change is better','Count how many effects were added','Judge the result against the purpose, not the number of edits.']
]
};

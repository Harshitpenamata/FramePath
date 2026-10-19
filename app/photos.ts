// Photos used by the Studio Grid pages: twelve Unsplash photos (Unsplash License, free to use; sources below),
// resized to public/photos/<nn>-900.jpg and -1800.jpg. Each page slot names the photo it shows.
// They show in black and white by default; an admin can switch the whole site to colour (/admin → Look).
export const photoSources:Record<string,string>={
 '01':'Videography camera rig · unsplash.com/photos/xWZvpkR4eNE',
 '02':'Photography camera · unsplash.com/photos/DoPyrO-kpsE',
 '03':'Clapperboard · unsplash.com/photos/33LxhLSWQx0',
 '04':'Animation and creative workspace · unsplash.com/photos/PT2YtblHq1w',
 '05':'Film production · unsplash.com/photos/oZ9kA_MlQKI',
 '06':'Video editing · unsplash.com/photos/25OWIrAtGMM',
 '07':'Studio interior · unsplash.com/photos/yxRLYkmhTVg',
 '08':'Storyboarding and planning · unsplash.com/photos/O-yzou-yeeo',
 '09':'Camera lenses · unsplash.com/photos/v7dnh1wfbDk',
 '10':'Analog film · unsplash.com/photos/Q1JB5XRwJkQ',
 '11':'Kettle and cup · unsplash.com/photos/J4Poo0r0qEk',
 '12':'Studio lighting · unsplash.com/photos/Av26vuQmQ_I',
};
export const photoSlots={
 'home-videography':'01','home-photography':'02','home-filmmaking':'03','home-animation':'04','home-motion':'06',
 'interests':'10','self-paced':'06','mentor-led':'05','project':'11','make':'01','community':'05',
 'help-1':'07','help-2':'09','help-3':'04','account':'08','safety':'12','privacy':'06',
} as const;
export type PhotoSlot=keyof typeof photoSlots;

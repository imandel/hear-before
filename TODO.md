Hear, Before 

Features
	
	PRIORITY:
        1. Recording Upload - Ilan
        2. Upload Approval (basic) tooling w some kind of security- Amrit
        3. Welcome modal - Ilan
        4. Accessibility for audio dropout - david
        5. Text2speech pipeline - David 
        6. <br>
        7. Styling
        8. Caching
        9. Accessibility button tags 

Recording Upload
	- Switch to Howler 
		- transcode recordings to .wav or .mp3
		- WIP not complete - playback bug in safari <- Amrit
	- set recording length limit
		- either by error message or progress bar
	
	- record meta-data about a recording (gps lat long)
	- allow short text comment to be attached to submitted comment

Caching?

Recording Upload Approval
	- is easy
	- can be pretty bad but functional
	- SHOULD:
		- Needs to be able to move files from submitted dir -> live dir
		- Needs to update the source data that mapbox will reference (is this done on a clock or on approval.
		- Needs to push the new source data to mapbox programatically - https://blog.mapbox.com/designing-the-vintage-style-in-mapbox-studio-9da4aa2a627f


Welcome Splash Modal
	- simple 

Change styling for audio indication
	- audio sprite?	
	- do we indicated true source at all?
	- do we indicated the primary current

Bugs/Testing	

PRIORITY:
        1. WASD - Amrit
        2. Dropout Curve - David ?

Audio dropout Curve 
	- option to play nearest only
 Add back WASD debug

Content 

How much content do we need?
	- 50k H3 tags
 	- streets & parks
	- non one-to-one mappings

Figure out how many points we need in order to have good coverage of content in the city - Ilan

Content Ideas:
	- Synthesized audio:
		- old news text - David
		- news archive - https://news.google.com/newspapers?nid=KEtq3P1Vf8oC&dat=19691204&printsec=frontpage&hl=en
		- vintage styled map - https://blog.mapbox.com/designing-the-vintage-style-in-mapbox-studio-9da4aa2a627f
        - NYC historic arcades - Amrit
        - Metropolitan Diaries - Amrit
        - Poetry sites https://hellopoetry.com/
    - Found Audio
        - People busking in MTA stations - Amrit
        - Piped audio for historic riots/speeches
        - Graveyard spooky sounds - Ilan
	- Ask Ilan’s open mic curator friend for poem recordings
	- Pay people?

(Not gr8)
Currently - Audiobook chapters randomly split

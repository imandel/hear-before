Hear, Before 

Features
	PRIORITY:
        1. Recording Upload
        2. Upload Approval (basic) tooling
        3. Welcome modal
        4. Accessibility for audio dropout
        5. Accessibility for text and button tags 
        6. Styling
        7. Caching

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
        1. WASD
        2. Dropout Curve

Audio dropout Curve 
	- option to play nearest only
 Add back WASD debug

Content 

How much content do we need?
	- 50k H3 tags
 	- streets & parks
	- non one-to-one mappings

Figure out how many points we need in order to have good coverage of content in the city

Content Ideas:
	- Synthesized audio:
		- old news text 
		- news archive - https://news.google.com/newspapers?nid=KEtq3P1Vf8oC&dat=19691204&printsec=frontpage&hl=en
		- vintage styled map - https://blog.mapbox.com/designing-the-vintage-style-in-mapbox-studio-9da4aa2a627f
        - NYC historic arcades 
        - Metropolitan Diaries speech2texted
        - Poetry sites https://hellopoetry.com/
    - Found Audio
        - People busking in MTA stations
        - Piped audio for historic riots/speeches
        - Graveyard spooky sounds
	- Ask Ilan’s open mic curator friend for poem recordings
	- Pay people?

(Not gr8)
Currently - Audiobook chapters randomly split

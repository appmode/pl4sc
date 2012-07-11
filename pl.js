//----------------------------------------------------------------------------//
// Playlists 4 SoundCloud
//----------------------------------------------------------------------------//
/*
 * Playlists 4 SoundCloud (c) Copyright 2012 Flame Herbohn
 * 
 * author    : Flame Herbohn
 * license   : GNU Affero General Public License version 3
 */

//------------------------------------------------------------------------//
// PL
//------------------------------------------------------------------------//
/**
 * PL
 *
 * the playlist manager object
 */
PL              = {}


//############################################################################//
// PROPERTIES
//############################################################################//

// object to hold cached elements
PL.objElement   = {};

// object to hold selected list item elements
PL.objSelect    = {};

// object to hold cached tracks
PL.objTracks    = {};

// object to hold language text
PL.i18n         = {};

// object to hold config values
PL.conf         = {};


//############################################################################//
// HELPER METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.getElementById
//------------------------------------------------------------------------//
/**
 * PL.getElementById()
 *
 * get (and cache) element by id
 *
 * @param  string   Element     id of the element to get
 *
 * @return element
 */
PL.getElementById = function(strElement)
{
	if (!this.objElement[strElement])
	{
		this.objElement[strElement] = document.getElementById(strElement);
	}
	return this.objElement[strElement];
}

//------------------------------------------------------------------------//
// PL.setInnerText
//------------------------------------------------------------------------//
/**
 * PL.setInnerText()
 *
 * set inner text of a DOM element
 *
 * @param  element  Target      target DOM element
 * @param  string   Value       text to set
 *
 * @return void
 */
PL.setInnerText = function(elmTarget, strValue)
{
    if(elmTarget.innerText)
    {
        elmTarget.innerText = strValue;
    }
    else
    {
        elmTarget.textContent = strValue;
    }
}

//------------------------------------------------------------------------//
// PL.getEventTarget
//------------------------------------------------------------------------//
/**
 * PL.getEventTarget()
 *
 * get event target
 *
 * @param  object   Event       the event object
 *
 * @return element              the target element for the event
 */
PL.getEventTarget = function(objEvent)
{
	objEvent = objEvent || window.event;
	return objEvent.target || objEvent.srcElement;
}

//------------------------------------------------------------------------//
// PL.getEventKeyCode
//------------------------------------------------------------------------//
/**
 * PL.getEventKeyCode()
 *
 * get event key code
 *
 * @param  object  Event       the event object
 *
 * @return integer             the key code of the key pressed during the event
 */
PL.getEventKeyCode = function(objEvent)
{
	objEvent = objEvent || window.event;
	return objEvent.keyCode || objEvent.which;
}

//------------------------------------------------------------------------//
// PL.select
//------------------------------------------------------------------------//
/**
 * PL.select()
 *
 * select a list item
 * 
 * if there is already a selected list item of the same select Type then the 
 * existing selected item will be deselected.
 *
 * @param  element  Target      the list item to be selected
 * @param  string   Type        the type of select
 *
 * @return void
 */
PL.select = function(elmTarget, strType)
{	
	this.deselect(strType);
	
	if (elmTarget.tagName == 'LI')
	{
		this.objSelect[strType] = elmTarget;
		elmTarget.className     = "selected";
	}
}

//------------------------------------------------------------------------//
// PL.deselect
//------------------------------------------------------------------------//
/**
 * PL.deselect()
 *
 * deselect a list item
 *
 * @param  string   Select      the type of select
 *
 * @return void
 */
PL.deselect = function(strSelect)
{
	if (strSelect in this.objSelect)
	{
		this.objSelect[strSelect].className = "";
		delete(this.objSelect[strSelect]);
	}
}

//------------------------------------------------------------------------//
// PL.getSelected
//------------------------------------------------------------------------//
/**
 * PL.getSelected()
 *
 * return the selected list item
 *
 * @param  string   Select      the type of select
 *
 * @return element              the selected element
 *                              or Undefined if there is no selected element of Type
 */
PL.getSelected = function(strSelect)
{
	return this.objSelect[strSelect];
}


//############################################################################//
// SYSTEM METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.init
//------------------------------------------------------------------------//
/**
 * PL.init()
 *
 * initialize the system
 *
 * this method needs to be called once the HTML page has been loaded
 * 
 * @return void
 */
PL.init = function()
{
	SC.initialize({
		client_id: this.conf.soundCloudClientId
	});

	// clear inputs
	this.clearPlaylistInputs();
	
	// load playlists
	this.load();
}

//------------------------------------------------------------------------//
// PL.save
//------------------------------------------------------------------------//
/**
 * PL.save()
 *
 * save all playlists to browser local storage
 * 
 * also saves the track cache
 *
 * @return void
 */
PL.save = function()
{
	// update data for current playlist
	this.updatePlaylistData();
	
	// convert playlists to JSON safe objects
	var arrPlaylists = [];
	var elmTrack;
	var elmPlaylist  = this.getElementById("playlists").firstChild;
	while (elmPlaylist)
	{
		var objPlaylist = {};
		
		// title & description
		objPlaylist.title		= elmPlaylist.getAttribute("data-title");
		objPlaylist.description = elmPlaylist.getAttribute("data-description");
		
		// track list
		objPlaylist.tracks		= [];
		elmTrack = elmPlaylist.elmTracklist.firstChild;
		while (elmTrack)
		{
			// add track
			objPlaylist.tracks.push(elmTrack.getAttribute("data-id"));
			
			// next track
			elmTrack = elmTrack.nextSibling;
		}
		
		// add playlist to playlists array
		arrPlaylists.push(objPlaylist);
		
		// next playlist
		elmPlaylist = elmPlaylist.nextSibling;
	}
	
	// save playlists
	localStorage.setItem('playlists', JSON.stringify(arrPlaylists));
	
	// save track cache
	localStorage.setItem('trackCache', JSON.stringify(this.objTracks));	
}

//------------------------------------------------------------------------//
// PL.load
//------------------------------------------------------------------------//
/**
 * PL.load()
 *
 * load all playlists from browser local storage
 * 
 * also load the track cache
 *
 * @return void
 */
PL.load = function()
{
	// load track cache
	this.objTracks = JSON.parse(localStorage.getItem('trackCache')) || {};
	
	// load playlists
	var arrPlaylists = JSON.parse(localStorage.getItem('playlists'));
	
	// display playlists
	if (arrPlaylists)
	{
		var i = 0;
		var objPlaylist;
		for( ; objPlaylist = arrPlaylists[i++] ; )
		{
			// playlist
			var elmPlaylist           = document.createElement("li");
			elmPlaylist.innerHTML     = objPlaylist.title || this.i18n.unnamedPlaylist;
			elmPlaylist.elmTracklist  = document.createElement("ul");
			elmPlaylist.setAttribute("data-title",       objPlaylist.title);
			elmPlaylist.setAttribute("data-description", objPlaylist.description);
			elmPlaylist.setAttribute("title",            objPlaylist.description);
			elmPlaylist.arrUndo = [];
			elmPlaylist.arrRedo = [];
			
			// tracks
			var n = 0;
			var strTrack;
			for( ; strTrack = objPlaylist.tracks[n++] ; )
			{
				var elmTrack = document.createElement("li");
				this.setInnerText(elmTrack, this.objTracks[strTrack].title);
				elmTrack.setAttribute("data-id", strTrack);
				elmPlaylist.elmTracklist.appendChild(elmTrack);
			}
			
			// append to playlist list
			this.getElementById("playlists").appendChild(elmPlaylist);
		}
	}
	
	// load crate
	var arrCrate = JSON.parse(localStorage.getItem('trackCrate'));
	
	// display tracks in crate
	if (arrCrate)
	{
		var elmCrate = this.getElementById('crate');
		
		var i = 0;
		var strTrack;
		for( ; strTrack = arrCrate[i++] ; )
		{
			var elmTemp = document.createElement('li');	
			elmTemp.setAttribute('data-id', strTrack);
			elmCrate.appendChild(elmTemp);
			if (strTrack in this.objTracks)
			{
				// set track name from cache
				this.setInnerText(elmTemp, this.objTracks[strTrack].title);
			}
			else
			{
				// hide track
				elmTemp.style.display = "none";
				// get track name from SoundCloud
				SC.get("/tracks/" + strTrack, {}, this.callback_crateResult);
			}
		}
	}
}

//------------------------------------------------------------------------//
// PL.callback_crateResult
//------------------------------------------------------------------------//
/**
 * PL.callback_crateResult()
 *
 * callback for crate results
 * 
 * caches the track details & updates the crate
 *
 * @param  object   Track       a track object in the format returned by
 *                              the SoundCloud API,
 *                              see http://developers.soundcloud.com/docs/api/reference#tracks
 *
 * @return void
 */
PL.callback_crateResult = function(objTrack)
{
	if ('kind' in objTrack && objTrack.kind == "track")
	{
		// cache track
		PL.cacheTrack(objTrack.id, objTrack.title);
		
		// update tracks in crate
		var elmTrack = PL.getElementById('crate').firstChild;
		while (elmTrack)
		{
			if (elmTrack.getAttribute("data-id") == objTrack.id)
			{
				PL.setInnerText(elmTrack, objTrack.title);
				elmTrack.style.display = "";
			}
			elmTrack = elmTrack.nextSibling;
		}
	}
}


//############################################################################//
// VIEW METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.showEditor
//------------------------------------------------------------------------//
/**
 * PL.showEditor()
 *
 * show the Editor View
 *
 * @return void
 */
PL.showEditor = function()
{
	this.getElementById("view").className = "edit";
}

//------------------------------------------------------------------------//
// PL.showPlayer
//------------------------------------------------------------------------//
/**
 * PL.showPlayer()
 *
 * show the Player View
 *
 * @return void
 */
PL.showPlayer = function()
{
	this.getElementById("view").className = "play";
}

//------------------------------------------------------------------------//
// PL.showSearch
//------------------------------------------------------------------------//
/**
 * PL.showSearch()
 *
 * show the Search View
 *
 * @return void
 */
PL.showSearch = function()
{
	this.getElementById("view").className = "search";
	this.getElementById("search").focus();
}


//############################################################################//
// SEARCH METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.search
//------------------------------------------------------------------------//
/**
 * PL.search()
 *
 * search for SoundCloud tracks
 * 
 * uses the query string from the search input
 *
 * @return void
 */
PL.search = function()
{
	this.deselect("search");
	this.getElementById("searchResults").innerHTML = "";
	var strSearch = this.getElementById("search").value;
	if (strSearch)
	{
		SC.get("/tracks", {"q":strSearch}, this.callback_searchResult);
	}
}

//------------------------------------------------------------------------//
// PL.callback_searchResult
//------------------------------------------------------------------------//
/**
 * PL.callback_searchResult()
 *
 * callback for search results
 * 
 * passes search results the the actual search result handler method
 *
 * @param  object   Tracks      contains track objects in the format returned by
 *                              the SoundCloud API,
 *                              see http://developers.soundcloud.com/docs/api/reference#tracks
 *
 * @return void
 */
PL.callback_searchResult = function(objTracks)
{
	PL.displaySearchResults(objTracks);
}

//------------------------------------------------------------------------//
// PL.displaySearchResults
//------------------------------------------------------------------------//
/**
 * PL.displaySearchResults()
 *
 * display search results
 *
 * @param  object   Tracks      contains track objects in the format returned by
 *                              the SoundCloud API,
 *                              see http://developers.soundcloud.com/docs/api/reference#tracks
 *
 * @return void
 */
PL.displaySearchResults = function(objTracks)
{
	var elmResults = PL.getElementById("searchResults");
	for (var n in objTracks)
	{
		var elmTemp = document.createElement('li');
		this.setInnerText(elmTemp, objTracks[n].title);
		elmTemp.setAttribute('data-id', objTracks[n].id);
		elmResults.appendChild(elmTemp);
	}
}

//------------------------------------------------------------------------//
// PL.clearSearch
//------------------------------------------------------------------------//
/**
 * PL.clearSearch()
 *
 * clear search results & search input on the search page
 *
 * @return void
 */
PL.clearSearch = function()
{
	this.deselect("search");
	this.getElementById("searchResults").innerHTML = "";
	this.getElementById("search").value            = "";
	this.getElementById("search").focus();
}

//------------------------------------------------------------------------//
// PL.openSoundCloud
//------------------------------------------------------------------------//
/**
 * PL.openSoundCloud()
 *
 * open SoundCloud search page 
 *
 * @return void
 */
PL.openSoundCloud = function()
{
	window.open("http://soundcloud.com/search");
}

//------------------------------------------------------------------------//
// PL.onSearchKeyup
//------------------------------------------------------------------------//
/**
 * PL.onSearchKeyup()
 *
 * search keyup event handler
 *
 * @param  object  Event       the event object
 *
 * @return void
 */
PL.onSearchKeyup = function(objEvent)
{
	if (this.getEventKeyCode(objEvent) == 13)
	{
		this.search();
	}
}


//############################################################################//
// TRACK METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.addTrack
//------------------------------------------------------------------------//
/**
 * PL.addTrack()
 *
 * add selected track from search results or crate to the current tracklist
 *
 * @return void
 */
PL.addTrack = function()
{
	var elmSearch   = this.getSelected("search");
	var elmEdit     = this.getSelected("edit");
	var elmHead     = this.getSelected("track");
	if (elmSearch && elmEdit)
	{
		// cache track
		this.cacheTrack(elmSearch.getAttribute('data-id'), elmSearch.innerHTML);
		
		// add track
		var elmTrack = elmSearch.cloneNode(true);
		if (elmHead)
		{
			// add to undo stack
			this.do(["add", "remove", elmTrack, elmHead.nextSibling]);
			// insert after current selected track
			elmEdit.elmTracklist.insertBefore(elmTrack, elmHead.nextSibling);
		}
		else
		{
			// add to undo stack
			this.do(["add", "remove", elmTrack, null]);
			// insert at end of track list
			elmEdit.elmTracklist.appendChild(elmTrack);
		}
		
		// select the new track
		this.select(elmTrack, 'track');
	}
}

//------------------------------------------------------------------------//
// PL.deleteTrack
//------------------------------------------------------------------------//
/**
 * PL.deleteTrack()
 *
 * delete current selected track from the tracklist
 *
 * @return void
 */
PL.deleteTrack = function()
{
	// delete current selected track
	var elmTrack = this.getSelected("track");
	if (elmTrack)
	{
		// deselect track
		this.deselect("track");
		
		// select next track
		if (elmTrack.nextSibling)
		{
			this.select(elmTrack.nextSibling, "track");
		}
		else if (elmTrack.previousSibling)
		{
			this.select(elmTrack.previousSibling, "track");
		}
		
		// add to undo stack
		this.do(["remove", "add", elmTrack, elmTrack.nextSibling]);
		
		// detatch track
		elmTrack.parentNode.removeChild(elmTrack);
	}
}

//------------------------------------------------------------------------//
// PL.trackUp
//------------------------------------------------------------------------//
/**
 * PL.trackUp()
 *
 * move the current selected track up one position in the tracklist
 *
 * @return void
 */
PL.trackUp = function()
{
	var elmTrack = this.getSelected("track");
	if (elmTrack)
	{
		var elmTrack    = this.objSelect.track;
		var elmPrevious = elmTrack.previousSibling;
		if (elmPrevious)
		{
			// add to undo stack
			this.do(["up", "down", elmTrack]);
		
			elmTrack.parentNode.insertBefore(elmTrack, elmPrevious);
		}
	}
}

//------------------------------------------------------------------------//
// PL.trackDown
//------------------------------------------------------------------------//
/**
 * PL.trackDown()
 *
 * move the current selected track down one position in the tracklist
 *
 * @return void
 */
PL.trackDown = function()
{
	var elmTrack = this.getSelected("track");
	if (elmTrack)
	{
		var elmNext = elmTrack.nextSibling;
		if (elmNext)
		{
			// add to undo stack
			this.do(["down", "up", elmTrack]);
			
			elmTrack.parentNode.insertBefore(elmTrack, elmNext.nextSibling);
		}
	}
}

//------------------------------------------------------------------------//
// PL.onSelectTrack
//------------------------------------------------------------------------//
/**
 * PL.onSelectTrack()
 *
 * track selected event handler
 *
 * @param  object  Event       the event object
 * @param  string  Select      the select type
 *
 * @return void
 */
PL.onSelectTrack = function(objEvent, strSelect)
{
	this.select(this.getEventTarget(objEvent), strSelect);
}


//############################################################################//
// PLAYLIST METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.addPlaylist
//------------------------------------------------------------------------//
/**
 * PL.addPlaylist()
 *
 * add a new playlist
 *
 * @return void
 */
PL.addPlaylist = function()
{
	// show search view
	this.getElementById("view").className = "search";
	
	// create new playlist
	var elmPlaylist             = document.createElement("li");
	elmPlaylist.innerHTML       = this.i18n.newPlaylist;
	elmPlaylist.elmTracklist    = document.createElement("ul");
	elmPlaylist.setAttribute("data-title",       "");
	elmPlaylist.setAttribute("data-description", "");
	elmPlaylist.arrUndo = [];
	elmPlaylist.arrRedo = [];
	
	// append to playlist list
	this.getElementById("playlists").appendChild(elmPlaylist);
	
	// edit the playlist
	this.editPlaylist(elmPlaylist);
		
	// focus the playlist name input
	this.getElementById("playlistTitle").focus();
	
}

//------------------------------------------------------------------------//
// PL.editPlaylist
//------------------------------------------------------------------------//
/**
 * PL.editPlaylist()
 *
 * edit a playlist
 *
 * @param  element  Target      the playlist to be edited
 *
 * @return bool     true        if the playlist is valid
 *                  false       if the playlist is invalid            
 */
PL.editPlaylist = function(elmTarget)
{
	// target must be a list item
	if (elmTarget.tagName != 'LI')
	{
		return false;
	}
	
	// deselect current editing playlist
	var elmEdit = this.getSelected("edit");
	if (elmEdit)
	{
		// update playlist data
		this.updatePlaylistData();
		
		// detatch track list
		elmEdit.elmTracklist.parentNode.removeChild(elmEdit.elmTracklist);
		
		// deselect track
		this.deselect("track");
		
		// deselect playlist
		this.deselect("edit");
	}
	
	// select new playlist for editing
	this.select(elmTarget, "edit");
	
	// load tracklist, title & description
	this.getElementById("tracks").appendChild(elmTarget.elmTracklist);
	this.getElementById("playlistTitle").value       = elmTarget.getAttribute("data-title");
	this.getElementById("playlistDescription").value = elmTarget.getAttribute("data-description");
	
	return true;
}

//------------------------------------------------------------------------//
// PL.deletePlaylist
//------------------------------------------------------------------------//
/**
 * PL.deletePlaylist()
 *
 * delete the current selected playlist
 *
 * @return void
 */
PL.deletePlaylist = function()
{
	// delete current selected playlist
	var elmEdit = this.getSelected("edit");
	if (elmEdit)
	{
		// deselect playlist
		this.deselect("edit");
		
		// detatch track list
		elmEdit.elmTracklist.parentNode.removeChild(elmEdit.elmTracklist);
		
		// detatch playlist
		elmEdit.parentNode.removeChild(elmEdit);
		
		// remove track list
		elmEdit.elmTracklist = null;
		
		// clear inputs
		this.clearPlaylistInputs();
		
		// save
		//TODO!!!! autosave?	
	}
}

//------------------------------------------------------------------------//
// PL.updatePlaylistData
//------------------------------------------------------------------------//
/**
 * PL.updatePlaylistData()
 *
 * update playlist data
 *
 * gets the current values from the title & description inputs
 * 
 * @return void
 */
PL.updatePlaylistData = function()
{
	var elmEdit = this.getSelected("edit");
	if (elmEdit)
	{
		// title
		var strTitle = this.getElementById("playlistTitle").value;
		this.setInnerText(elmEdit, strTitle || this.i18n.unnamedPlaylist);
		elmEdit.setAttribute("data-title",       strTitle);
		// description
		var strDescription = this.getElementById("playlistDescription").value;
		elmEdit.setAttribute("data-description", strDescription);
		elmEdit.setAttribute("title",            strDescription);
	}
}

//------------------------------------------------------------------------//
// PL.clearPlaylistInputs
//------------------------------------------------------------------------//
/**
 * PL.clearPlaylistInputs()
 *
 * clears the current values from the title & description inputs
 *
 * @return void
 */
PL.clearPlaylistInputs = function()
{
	this.getElementById("playlistTitle").value       = "";
	this.getElementById("playlistDescription").value = "";
}

//------------------------------------------------------------------------//
// PL.cacheTrack
//------------------------------------------------------------------------//
/**
 * PL.cacheTrack()
 *
 * cache a track
 * 
 * the system keeps a cache of every track ever added to a playlist so that we
 * don't need to do a SoundCloud lookup each time we need track details.
 * 
 * cached track objects can be accessed at PL.objTracks[strId] where strID is 
 * the SoundCloud id of the track.
 *
 * For now we only use the track ID & Title so that's all we are caching.
 * 
 * @param  string  Id          SoundCloud track id
 * @param  string  Title       track title
 *
 * @return void
 */
PL.cacheTrack = function(strId, strTitle)
{
	if (!(strId in this.objTracks))
	{
		this.objTracks[strId] = {"id":strId, "title":strTitle};
	}
}

//------------------------------------------------------------------------//
// PL.onSelectPlaylist
//------------------------------------------------------------------------//
/**
 * PL.onSelectPlaylist()
 *
 * playlist selected event handler
 *
 * @param  object  Event       the event object
 *
 * @return void
 */
PL.onSelectPlaylist = function(objEvent)
{
	this.editPlaylist(this.getEventTarget(objEvent));
}

//------------------------------------------------------------------------//
// PL.onTitleKeyup
//------------------------------------------------------------------------//
/**
 * PL.onTitleKeyup()
 *
 * title keyup event handler
 *
 * @param  object  Event       the event object
 *
 * @return void
 */
PL.onTitleKeyup = function(objEvent)
{
	if (this.getEventKeyCode(objEvent) == 13)
	{
		this.getElementById("playlistDescription").focus();
	}
}


//############################################################################//
// PLAYER METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.play
//------------------------------------------------------------------------//
/**
 * PL.play()
 *
 * play a playlist
 * 
 * if there is not already a playlist loaded in the player:
 *     load & play the current selected playlist, starting at the first track
 * if a playlist is loaded in the player and currently playing:
 *     pause the currently playing playlist
 * if a playlist is loaded in the player and currently paused:
 *     resume playing the currently paused playlist
 *
 * if a preview is currently playing, the play method will cancel the preview
 * when playing or resuming the playlist, but will not cancel it when pausing
 * the playlist.
 * 
 * @return void
 */
PL.play = function()
{
	if (this.elmCurrentPlayList)
	{
		if (this.bolPause)
		{
			// resume paused track
			this.resumeTrack();
		}
		else
		{
			// pause playing track
			this.pauseTrack();
		}
	}
	else
	{
		// start playing selected playlist
		this.elmCurrentPlayList	= this.getSelected("edit");
		if (this.elmCurrentPlayList)
		{
			// update player display
			var strTitle = this.elmCurrentPlayList.getAttribute("data-title");
			this.setInnerText(this.getElementById("playerTitle"), strTitle);
			
			// play first track
			this.playTrack(this.elmCurrentPlayList.elmTracklist.firstChild);
		}
	}
}

//------------------------------------------------------------------------//
// PL.eject
//------------------------------------------------------------------------//
/**
 * PL.eject()
 *
 * eject the currently loaded playlist from the player
 * 
 * the current playlist must be ejected before a new playlist can be loaded.
 *
 * @return void
 */
PL.eject = function()
{
	// pause current track
	this.pauseTrack();
	
	// destroy current track
	if (this.currentTrack)
	{
		this.currentTrack.destruct();
	}
	
	// remove playlist
	if (this.elmCurrentPlayList)
	{
		this.elmCurrentPlayList = null;
	}
	
	// update player display
	this.getElementById("playerTitle").innerHTML = "";
	this.getElementById("playerTrack").innerHTML = "";
}

//------------------------------------------------------------------------//
// PL.callback_endTrack
//------------------------------------------------------------------------//
/**
 * PL.callback_endTrack()
 *
 * callback for end of track
 * 
 * plays the next track in the playlist
 *
 * @return void
 */
PL.callback_endTrack = function()
{
	PL.nextTrack();
}

//------------------------------------------------------------------------//
// PL.nextTrack
//------------------------------------------------------------------------//
/**
 * PL.nextTrack()
 *
 * play next track in current playlist
 *
 * @return void
 */
PL.nextTrack = function()
{
	if (this.elmCurrentTrack)
	{
		this.playTrack(this.elmCurrentTrack.nextSibling);
	}
}

//------------------------------------------------------------------------//
// PL.playTrack
//------------------------------------------------------------------------//
/**
 * PL.playTrack()
 *
 * play the current track
 * 
 * cancels the currently playing track (if there is one), and uses the 
 * SoundCloud API to start streaming a new track.
 *
 * @param  element  Track       the track to be played
 *
 * @return void
 */
PL.playTrack = function(elmTrack)
{
	// destroy current sound object
	if (this.currentTrack)
	{
		this.currentTrack.destruct();
		this.currentTrack = null;
	}
	
	// set current track
	this.elmCurrentTrack = elmTrack;
	
	if (elmTrack)
	{
		// show pause button
		this.getElementById("play").className = "pause";
		
		// turn off preview mode
		this.bolPreview = false;
		
		// turn off pause mode
		this.bolPause	= false;
		
		// update player display
		this.setInnerText(this.getElementById("playerTrack"), elmTrack.innerHTML);
		
		// start playing track
		var strTrack = elmTrack.getAttribute('data-id');
		SC.stream("/tracks/" + strTrack, {
				autoPlay: true,
				onfinish: this.callback_endTrack
			}, this.callback_trackReady);
	}
	else
	{
		// pause if we don't have a track to play
		this.pauseTrack();
		
		// update player display
		this.getElementById("playerTrack").innerHTML = "";
	}
}

//------------------------------------------------------------------------//
// PL.pauseTrack
//------------------------------------------------------------------------//
/**
 * PL.pauseTrack()
 *
 * pause the currently playing track
 *
 * @return  return_type
 */
PL.pauseTrack = function()
{
	// turn on pause mode
	this.bolPause = true;
	
	// show play button
	this.getElementById("play").className = "play";
	
	// pause current track
	if (this.currentTrack)
	{
		this.currentTrack.pause();
	}
}

//------------------------------------------------------------------------//
// PL.resumeTrack
//------------------------------------------------------------------------//
/**
 * PL.resumeTrack()
 *
 * resume playing of the currently paused track
 * 
 * if a preview is currently playing, it will be canceled.
 *
 * @return void
 */
PL.resumeTrack = function()
{
	// destroy any current preview
	this.destroyPreview();
	
	// turn off pause mode
	this.bolPause = false;
	
	// show pause button
	this.getElementById("play").className = "pause";
	
	// play track
	if (this.currentTrack)
	{
		this.currentTrack.resume();
	}
}

//------------------------------------------------------------------------//
// PL.callback_trackReady
//------------------------------------------------------------------------//
/**
 * PL.callback_trackReady()
 *
 * callback for track ready
 * 
 * cancels the currently playing track (if there is one), and sets the new
 * track as the currently playing track.
 * 
 * cancels the currently previewing track (if there is one), unless preview mode 
 * is set.
 * 
 * the new track will be paused if preview mode or pause mode is set, for example
 * if the user has hit the pause or preview button after the track was requested
 * via the SoundCloud API but before the track is ready.
 * 
 *
 * @param  object  Sound       a sound manager sound object for the current
 *                             playing track,
 *                             see : http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods
 *
 * @return void
 */
PL.callback_trackReady = function(objSound)
{
	// destroy any current track
	if (PL.currentTrack)
	{
		PL.currentTrack.destruct();
	}
	
	// set new current track
	PL.currentTrack = objSound;
	
	if (PL.bolPreview)
	{
		// pause if we are in preview mode
		objSound.pause();
	}
	else
	{
		// destroy any current preview
		PL.destroyPreview();
		
		// pause if we are in pause mode
		if (PL.bolPause)
		{
			objSound.pause();
		}
	}
}


//############################################################################//
// PREVIEW METHODS
//############################################################################//

//------------------------------------------------------------------------//
// PL.startPreview
//------------------------------------------------------------------------//
/**
 * PL.startPreview()
 *
 * preview selected track from search results or crate
 * 
 * if a track is already previewing, both the current preview and the newly 
 * requested preview will be canceled.
 * 
 * if a playlist is loaded in the player and currently playing, the currently 
 * playing playlist will be put on hold and resume playing when the preview 
 * finishes or is canceled.
 *
 * @return void
 */
PL.startPreview = function()
{
	// stop current preview
	if (this.bolPreview)
	{
		this.stopPreview();
		return;
	}
	
	var elmSearch = this.getSelected("search");
	if (elmSearch)
	{
		// get preview id
		var strTrack = elmSearch.getAttribute('data-id');
	
		// pause current track
		if (this.currentTrack)
		{
			this.currentTrack.pause();
		}
		
		// destroy current preview
		this.destroyPreview();
		
		// turn on preview mode
		this.bolPreview = true;
		
		// start preview
		SC.stream("/tracks/" + strTrack, {
			autoPlay: true,
			onfinish: this.callback_endPreview
			}, this.callback_previewReady);
	}
}

//------------------------------------------------------------------------//
// PL.stopPreview
//------------------------------------------------------------------------//
/**
 * PL.stopPreview()
 *
 * stop preview
 * 
 * resumes playing of the current playlist if required
 *
 * @return void
 */
PL.stopPreview = function()
{
	// destroy preview
	this.destroyPreview();
	
	// play current track
	if (this.currentTrack && !this.bolPause)
	{
		this.currentTrack.resume();
	}
}

//------------------------------------------------------------------------//
// PL.destroyPreview
//------------------------------------------------------------------------//
/**
 * PL.destroyPreview()
 *
 * destroy preview
 *
 * stops the preview but does NOT resume playing of the current playlist
 *
 * @return void
 */
PL.destroyPreview = function()
{
	this.bolPreview = false;
	if (this.previewTrack)
	{
		this.previewTrack.destruct();
		this.previewTrack = null;
	}
}

//------------------------------------------------------------------------//
// PL.callback_endPreview
//------------------------------------------------------------------------//
/**
 * PL.callback_endPreview()
 *
 * callback for end of preview
 *
 * stop preview and resumes playing of the current playlist if required
 *
 * @return void
 */
PL.callback_endPreview = function()
{
	PL.stopPreview();
}

//------------------------------------------------------------------------//
// PL.callback_previewReady
//------------------------------------------------------------------------//
/**
 * PL.callback_previewReady()
 *
 * callback for preview ready
 *
 * cancels the current preview (if there is one), and sets the new sound object
 * as the current preview.
 * 
 * the new preview will be canceled if preview mode is NOT set, for example
 * if the user has hit the play button or cancled the preview after the preview
 * was requested via the SoundCloud API but before the preview is ready.
 *
 * @param  object  Sound       a sound manager sound object for the preview,
 *                             see : http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods
 *
 * @return void
 */
PL.callback_previewReady = function(objSound)
{
	// destroy existing preview
	if (PL.previewTrack)
	{
		PL.previewTrack.destruct();
	}
	
	// check for preview mode
	if (PL.bolPreview)
	{
		// set new preview
		PL.previewTrack = objSound;
	}
	else
	{
		// destroy preview if we are not in preview mode
		objSound.destruct();
	}
}


//############################################################################//
// UNDO METHODS
//############################################################################//
/*
 * When an undoable action is performed a command is added to the undo stack,
 * the command is an array in the following format:
 * @param  array   Command     details for the undo & redo commands
 *                 Command[0]  the original command, used to redo the action
 *                 Command[1]  the undo command, used to undo the action
 *                 Command[2]  the target element
 *                 Command[3]  the optional related element
 * 
 * Currently the undo system only supports:add, remove, up & down for tracks in 
 * a playlist.
 * 
 * Each playlist has its own undo stack and stores up to 100 undoable actions.
 * 
 * TODO!!!! - this could easily be expanded to undo changes to the playlist 
 * title & description but I don't have the time to do work on that right now.
 */
 
//------------------------------------------------------------------------//
// PL.do
//------------------------------------------------------------------------//
/**
 * PL.do()
 *
 * record an undoable action
 *
 * adds the action Command to the undo stack
 * also clears the redo stack
 * 
 * @param  array   Command     details for the undo & redo commands
 *                             see PL.runCommand for more details
 *
 * @return void
 */
PL.do = function(arrCommand)
{
	var elmPlaylist = this.getSelected("edit");
	if (elmPlaylist)
	{
		// clear redo stack
		elmPlaylist.arrRedo = [];
		
		// add command to undo stack
		elmPlaylist.arrUndo.push(arrCommand);
		
		// limit undo stack length to 100
		if (elmPlaylist.arrUndo.length > 100)
		{
			elmPlaylist.arrUndo.shift();
		}
	}
}

//------------------------------------------------------------------------//
// PL.undo
//------------------------------------------------------------------------//
/**
 * PL.undo()
 *
 * undo the most recent undoable action
 * 
 * also adds the action Command to the redo stack
 *
 * @return void
 */
PL.undo = function()
{
	var elmPlaylist = this.getSelected("edit");
	if (elmPlaylist && elmPlaylist.arrUndo.length > 0)
	{
		// get undo object
		var arrCommand = elmPlaylist.arrUndo.pop();
		
		// run command
		this.runCommand(arrCommand[1], arrCommand);
		
		// push redo object
		elmPlaylist.arrRedo.push(arrCommand);
	}
}

//------------------------------------------------------------------------//
// PL.redo
//------------------------------------------------------------------------//
/**
 * PL.redo()
 *
 * redo the most recent redoable action
 *
 * also adds the action Command to the undo stack
 *
 * @return void
 */
PL.redo = function()
{
	var elmPlaylist = this.getSelected("edit");
	if (elmPlaylist && elmPlaylist.arrRedo.length > 0)
	{
		// get redo object
		var arrCommand = elmPlaylist.arrRedo.pop();
		
		// run command
		this.runCommand(arrCommand[0], arrCommand);
		
		// push undo object
		elmPlaylist.arrUndo.push(arrCommand);
	}
}

//------------------------------------------------------------------------//
// PL.runCommand
//------------------------------------------------------------------------//
/**
 * PL.runCommand()
 *
 * run an action Command
 *
 * @param  string  Command     the command to run
 *                             valid commands are:
 *                                 add
 *                                 remove
 *                                 up
 *                                 down
 * @param  array   Command     details for the undo & redo commands
 *                 Command[0]  the original command (ignored here)
 *                 Command[1]  the undo command (ignored here)
 *                 Command[2]  the target element
 *                 Command[3]  the optional related element
 *
 * @return void
 */
PL.runCommand = function(strCommand, arrCommand)
{
	var elmTracklist = this.getSelected("edit").elmTracklist;
	switch (strCommand)
	{
		case "add":
			elmTracklist.insertBefore(arrCommand[2], arrCommand[3]);
			this.select(arrCommand[2], "track");
			break;
		case "remove":
			this.deselect(arrCommand[2]);
			if (arrCommand[2].nextSibling)
			{
				this.select(arrCommand[2].nextSibling, "track");
			}
			else if (arrCommand[2].previousSibling)
			{
				this.select(arrCommand[2].previousSibling, "track");
			}
			elmTracklist.removeChild(arrCommand[2]);
			break;
		case "up":
			elmTracklist.insertBefore(arrCommand[2], arrCommand[2].previousSibling);
			this.select(arrCommand[2], "track");
			break;
		case "down":
			var elmAfter = arrCommand[2].nextSibling;
			if (elmAfter)
			{
				elmTracklist.insertBefore(arrCommand[2], elmAfter.nextSibling);
			}
			else
			{
				elmTracklist.appendChild(arrCommand[2]);
			}
			this.select(arrCommand[2], "track");
			break;
	}
}

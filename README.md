pl4sc
=====

Playlists 4 SoundCloud

use it online at : http://pl4sc.appmo.de/

A minimalist playlist editor and player for SoundCloud.

Concept
--------------------------------

A minimalist playlist player, you load a playlist, it starts playing, and you go get on with partying or working or whatever it is you are doing.

Playlists are created in advance in the playlist editor from SoundCloud tracks.

Designed to work just as well on a tablet as on a desktop web browser.

Features
--------------------------------

Create multiple playlists
Delete playlist
Save playlists in browser local-storage
Add name & description to playlist
Search for tracks (maximum 50 results displayed)
Preview track in search results
Auto-hold playlist while previewing track
Add track to playlist (from search results)
Remove track from playlist
Move track up or down in playlist
Undo up to 100 Add/Remove/Move actions in each playlist
Redo up to 100 undone actions
Play a playlist
Pause a playlist
Add tracks directly from SoundCloud via the included bookmarklet

Bookmarklet
--------------------------------

The bookmarklet adds the track from the first SoundCloud player on any SoundCloud  page, so if you use it from a page with multiple players (for example a search results page) it will only add the first track.

New tracks added by the bookmarklet do not automatically show up in the "tracks from SoundCloud bookmarklet" section of the Find Tracks page, you will need to refresh the browser before they will be shown.

Only the most recent 100 tracks added via the SoundCloud bookmarklet will be shown.

To do (or not to do?)
--------------------------------

Error handling of results from SoundCloud.
Error handling of track streaming, for example: what happens if a track in a playlist is no longer available on SoundCloud?
Auto refresh of "tracks from SoundCloud bookmarklet" list.
Allow removal of tracks from the "tracks from SoundCloud bookmarklet" list.
Use image sprite for icons.
Add onclick feedback to buttons so it is clear when they have been pressed.
Show buttons as disabled when they can not be used.
Auto save playlists & track cache.
Visual indicator of the current playing playlist in the playlists list.
Visual indicator of the current playing track in the tracklist.
Visual indicator that a track is being previewed.
Make sure that the current selected track in the tracklist is visible (not scrolled off the screen) when an action is being performed on it (move, add, undo, redo).
Start with player visible if there is at least 1 playlist with at least one track in it.
Display (and cache) more track details, play time for example.
Display total play time for each playlist in the playlists list.
Display remaining time for track/playlist in the player.
Display additional search results.
Test on IE
Test on Safari
Store playlists to backend server.
Allow sharing of playlists.
Option to show more player controls (a skip forward button may be useful if a track is bad).
Ability to undo/redo changes to title & description.
Ability to undelete playlists.

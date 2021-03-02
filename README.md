# vgmdb_CUE_creator
JS script to download CUE file (cue sheet) from [vgmdb](https://vgmdb.net/).

**Tampermonkey or other similar extension is required(Maybe???)**

Usage
---
The script will add a `create CUE` button next to the RSS feed button.
Click and **have bugs**.

Notice
---
- The language of CUE content (Japanese/Romaji/English) depends on which `tracklist` tab you have selected.
- VGMDB only provides track time information as second. Therefore the microsecond part will always be `00`.
- VGMDB track info doesn't contain performer of a specific track, so you may need to edit manually.
- The filename of audio should be input manually.

Dependency
---
The script use `FileSaver.js` to save file(s). It should have a broad support for browsers.
Thanks to the [author](http://eligrey.com) of [FileSaver.js](https://github.com/eligrey/FileSaver.js).
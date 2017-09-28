What is it
==========
Simple NodeJS script that finds orphaned iTunes tracks that are not tracked by
iTunes itself and just occupy disk space. This seems to happen when you have
playlists that get auto-updated (such as `new track for you` that are updated
weekly) and tracks that were removed from the playlist are not cleaned up
by iTunes.

Tested on macOS only. Might work on Windows with little-to-no modifications.

Installation on macOS
=====================

1. NodeJS >= 6.11 (8.x will do)

```
brew install node
```

2. Download [latest source code](https://github.com/kompot/itunes-find-orphaned-files/archive/master.zip) and unzip

3. Install dependencies via npm inside unzipped folder

```
npm install
```

4. Export iTunes library to XML format (File -> Library -> Export Library).

5. Run this command to create `rm-orphaned-files.sh` file that should be reviewed.
No modifications are made at this point. The script just finds intersection
between file system and iTunes library.

```
node index.js --itunes-library-xml "./iTunes Library.xml" --apple-music-path "/Users/username/Music/iTunes/iTunes Media/Apple Music" > rm-orphaned-files.sh
```

6. Review `rm-orphaned-files.sh` file to check whether everything looks ok

7. Run (`bash rm-orphaned-files.sh`) to reclaim some disk space that Apple has been stealing from you ;)

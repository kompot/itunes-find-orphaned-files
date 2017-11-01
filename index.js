#!/usr/bin/env node
const argv = require("yargs")
  .usage(
    "Usage: node $0 --itunes-library-xml [string] --apple-music-path [string] > rm.sh"
  )
  .example('node index.js --itunes-library-xml "./iTunes Library.xml" --apple-music-path "/Users/username/Music/iTunes/iTunes Media/Apple Music" > rm.sh')
  .demandOption(["itunes-library-xml", "apple-music-path"]).argv;

const fs = require("fs");
const itunes = require("itunes-data");
const glob = require("glob");

const parser = itunes.parser();
const stream = fs.createReadStream(argv.itunesLibraryXml);

const appleMusicFolder = argv.appleMusicPath;
const appleMusicGlobPattern = "**/*.m4p";

const iTunesFilesSet = new Set();
const filesOnDiskSet = new Set();

const finished = {
  iTunesLibrary: false,
  diskRead: false
};

parser.on("track", track => {
  const loc = decodeURI(track.Location).substring("file://".length);
  if (loc.startsWith(appleMusicFolder)) {
    iTunesFilesSet.add(loc);
  }
});

parser.on("end", () => {
  finished.iTunesLibrary = true;
});

stream.pipe(parser);

glob(appleMusicGlobPattern, { cwd: appleMusicFolder }, (er, files) => {
  // TODO will likely break on Windows
  files.forEach(file => filesOnDiskSet.add(appleMusicFolder + "/" + file));
  finished.diskRead = true;
});

const escapeForBash = (file) =>
  file.replace(/\$/g,"\\$");

const findOrphanedFiles = () => {
  console.log("#!/usr/bin/env bash");
  console.log("# path to iTunes library xml:", argv.itunesLibraryXml);
  console.log("# path to Apple Music folder:", appleMusicFolder);
  console.log(
    "# total Apple Music files in iTunes library:",
    iTunesFilesSet.size
  );
  console.log("# total files in Apple Music directory:", filesOnDiskSet.size);
  const orphanedFiles = new Set(
    [...filesOnDiskSet].filter(x => !iTunesFilesSet.has(x))
  );
  // TODO extra info to debug your library
  // const isInLibraryButNotOnDisk = new Set(
  //   [...iTunesFilesSet].filter(x => !filesOnDiskSet.has(x))
  // );
  console.log(
    "# total orphaned files in Apple Music directory to be deleted:",
    orphanedFiles.size
  );
  [...orphanedFiles].map(file => console.log(`rm "${escapeForBash(file)}"`));
};

const intervalId = setInterval(() => {
  if (finished.diskRead && finished.iTunesLibrary) {
    findOrphanedFiles();
    clearInterval(intervalId);
  }
}, 1000);

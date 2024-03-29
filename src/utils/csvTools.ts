import { isSpotifyTrackId } from "./constants";

// I still don't like how these 3 functions work
function escapeForCSV(field: string) {
  return `"${field.replace(/"/g, "\"\"")}"`;
}

export function prepareSongForCSV(song: SpotifyApi.TrackObjectFull) {
  return [
    song.uri,
    song.name,
    song.album.name,
    song.artists[0].name,
  ].map(field => escapeForCSV(field)).join(",") + "\n";
}

export function getCSV(library: SpotifyApi.TrackObjectFull[]) {
  let csv = "uri,name,album,artist\n";

  library.forEach((song) => {
    csv += prepareSongForCSV(song);
  });

  return csv;
}

export function downloadCSV(name: string, csvContent: string) {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `spotify_export_${name}_${new Date(Date.now()).toISOString()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseCSVIntoTrackIds(CSVContent: string) {
  const rows = CSVContent.split("\n");
  const trackIds: string[] = [];

  rows.forEach((row) => {
    const entries = row.split(",");
    entries.forEach((entry) => {
      if (isSpotifyTrackId(entry)) {
        trackIds.push(entry.replaceAll("\"", ""));
      }
    });
  });

  return trackIds;
}

import { isSpotifyTrackId, Track } from './constants';

export function prepareSongForCSV(song: Track) {
  let row: string[] = [];
  for (let field of Object.values(song)) {
    row.push(`"${field?.replace(/"/g, '""')}"`);
  }

  return row.join(",") + "\n";
}

export function getCSV(library: Track[]) {
  let csv = Object.keys(library[0]).join(",") + "\n";

  library.forEach((song) => {
    csv += prepareSongForCSV(song);
  });

  return csv;
}

export function downloadCSV(csvContent: string) {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `library_export_${new Date(Date.now()).toISOString()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseCSV(CSVContent: string) {
  let rows = CSVContent.split("\n");
  let trackIds: string[] = [];

  rows.forEach((row) => {
    let entries = row.split(",");
    entries.forEach((entry) => {
      if (isSpotifyTrackId(entry)) {
        trackIds.push(entry.replaceAll('"', ""));
      }
    });
  });

  return trackIds;
}

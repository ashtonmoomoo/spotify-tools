import { useEffect, useState } from "react";

function isSpotifyTrackId(str: string) {
  const pattern = /spotify:track:[a-zA-Z0-9]{22}/;
  return pattern.test(str);
}

function parseCSV(CSVContent: string) {
  let rows = CSVContent.split("\n");
  let trackIds: string[] = [];

  for (let row of rows) {
    let entries = row.split(",");
    for (let entry of entries) {
      if (isSpotifyTrackId(entry)) trackIds.push(entry.replaceAll('"', ""));
    }
  }

  return trackIds;
}

function Import() {
  let [file, setFile] = useState();
  let [readFile, setReadFile] = useState<string | undefined>();
  let [trackIds, setTrackIds] = useState<string[]>([]);

  function handleChange(event: any) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    if (!file) return;

    let reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = (event: any) => {
      setReadFile(event.target.result);
    };
  }, [file]);

  useEffect(() => {
    if (!readFile) return;

    setTrackIds(parseCSV(readFile));
  }, [readFile]);

  return (
    <>
      <p>
        Upload a CSV file with Spotify track IDs (e.g.
        spotify:track:4cOdK2wGLETKBW3PvgPWqT) in the first column.
      </p>
      <input type="file" accept=".csv" onChange={handleChange} />
      {trackIds.length && (
        <ul>
          {trackIds.map((trackId) => (
            <li>{trackId}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Import;

import { useEffect, useState } from "react";
import { getLibrary } from "../utils/constants";
import { Track } from "../utils/constants";
import getTokenFromCookie from "../utils/getTokenFromCookie";

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
  let [trackIds, setTrackIds] = useState<string[]>([]);
  let [currentLibraryFetchCompletion, setCurrentLibraryFetchCompletion] =
    useState("0.00");
  let [fetchingCurrentLibrary, setFetchingCurrentLibrary] = useState(false);
  let [currentLibrary, setCurrentLibrary] = useState<Track[]>([]);
  let [songsToLike, setSongsToLike] = useState<string[]>([]);
  let [okToFetch, setOkToFetch] = useState(false);

  const token = getTokenFromCookie();

  function handleChange(event: any) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    if (!token || !okToFetch) return;

    const fetchCurrentLibrary = async () => {
      setFetchingCurrentLibrary(true);
      const library = await getLibrary(token, setCurrentLibraryFetchCompletion);
      setCurrentLibrary(library);
      setFetchingCurrentLibrary(false);
    };

    fetchCurrentLibrary();
  }, [token, okToFetch]);

  useEffect(() => {
    if (!file) return;

    let reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = (event: any) => {
      setTrackIds(parseCSV(event.target.result));
    };
  }, [file]);

  useEffect(() => {
    let currentLibrarySet = new Set(currentLibrary.map((x) => x.uri));
    const missingSongs = [...trackIds].filter((x) => !currentLibrarySet.has(x));
    setSongsToLike(missingSongs);
  }, [currentLibrary, trackIds]);

  return (
    <>
      <p>
        Upload a CSV file with Spotify track IDs (e.g.
        spotify:track:4cOdK2wGLETKBW3PvgPWqT) in the first column.
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleChange}
        onClick={() => setOkToFetch(true)}
      />
      {fetchingCurrentLibrary ? (
        <p>
          Fetching your current Spotify library (to determine the delta){" "}
          {currentLibraryFetchCompletion}% complete.
        </p>
      ) : null}
      {songsToLike.length ? (
        <ul>
          {songsToLike.map((x) => (
            <li>{x}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default Import;

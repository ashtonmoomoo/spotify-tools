import { useEffect, useState } from "react";
import { getLibrary, likeSongs } from "../utils/constants";
import { Track } from "../utils/constants";
import Button from "./Button";

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
  let [progressRestoringLibrary, setProgressRestoringLibrary] =
    useState("0.00");

  function handleUpload(event: any) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    if (!okToFetch) return;

    const fetchCurrentLibrary = async () => {
      setFetchingCurrentLibrary(true);
      const library = await getLibrary(setCurrentLibraryFetchCompletion);
      setCurrentLibrary(library);
      setFetchingCurrentLibrary(false);
    };

    fetchCurrentLibrary();
  }, [okToFetch]);

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

  function likeMissingSongs() {
    if (!songsToLike) return;

    likeSongs(songsToLike, setProgressRestoringLibrary);
  }

  let [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <>
      <p>
        Upload a CSV file with Spotify track IDs (e.g.
        spotify:track:4cOdK2wGLETKBW3PvgPWqT) in the first column.
      </p>
      <label htmlFor="csv-upload" className="form-button csv-upload">
        Upload CSV
      </label>
      <input
        id="csv-upload"
        className="hidden-input"
        type="file"
        accept=".csv"
        onChange={handleUpload}
        onClick={() => setOkToFetch(true)}
      />
      {fetchingCurrentLibrary ? (
        <p>
          Fetching your current Spotify library (to determine the delta){" "}
          {currentLibraryFetchCompletion}% complete.
        </p>
      ) : null}
      {!fetchingCurrentLibrary && songsToLike.length ? (
        <>
          <h4>
            Here are the IDs of the songs missing from your library that are on
            the .csv you uploaded. You can paste the ID into your browser URL
            bar (in a different tab) and press enter to check which song it is.
          </h4>
          <ul>
            {songsToLike.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <label htmlFor="fate-accepted">
            I accept this might rek my library but I want to do it anyway
          </label>
          <input
            id="fate-accepted"
            type="checkbox"
            onChange={() => setAcceptedTerms(!acceptedTerms)}
          />
          <br />
          <Button
            buttonProps={{
              type: "button",
              disabled: !acceptedTerms || progressRestoringLibrary !== "0.00",
              onClick: likeMissingSongs,
            }}
            text="Like missing songs"
          />
        </>
      ) : null}
    </>
  );
}

export default Import;

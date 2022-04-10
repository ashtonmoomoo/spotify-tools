import { useEffect, useState } from "react";
import { findMissingSongs, getLibrary } from "../utils/constants";
import { readFile } from "../utils/tools";
import { parseCSVIntoTrackIds } from "../utils/csvTools";
import {
  UploadCSV,
  PresentResults,
  NoDiff,
  Instructions,
} from "./importComponents";

function Import() {
  let [file, setFile] = useState<File>();
  let [trackIds, setTrackIds] = useState<string[]>([]);
  let [currentLibrary, setCurrentLibrary] = useState<
    SpotifyApi.TrackObjectFull[]
  >([]);
  let [songsToLike, setSongsToLike] = useState<string[]>([]);
  let [okToFetch, setOkToFetch] = useState(false);

  useEffect(() => {
    const fetchCurrentLibrary = async () => {
      const library = await getLibrary();
      setCurrentLibrary(library);
    };

    if (okToFetch) {
      fetchCurrentLibrary();
    }
  }, [okToFetch]);

  useEffect(() => {
    const fetchSongsFromCSV = async (file: File) => {
      const csvContent = await readFile(file);
      const parsedTrackIds = parseCSVIntoTrackIds(csvContent);
      setTrackIds(parsedTrackIds);
    };

    if (file) {
      fetchSongsFromCSV(file);
    }
  }, [file]);

  useEffect(() => {
    const missingSongs = findMissingSongs(
      currentLibrary.map((x) => x.uri),
      trackIds
    );
    setSongsToLike(missingSongs);
  }, [currentLibrary, trackIds]);

  if (file && songsToLike.length) {
    return <PresentResults songsToLike={songsToLike} />;
  }

  if (file && !songsToLike.length) {
    return <NoDiff />;
  }

  return (
    <>
      <Instructions />
      <UploadCSV setFile={setFile} setOkToFetch={setOkToFetch} />
    </>
  );
}

export default Import;

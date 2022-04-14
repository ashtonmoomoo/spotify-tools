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
  const [file, setFile] = useState<File>();
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [currentLibrary, setCurrentLibrary] = useState<
    SpotifyApi.TrackObjectFull[]
  >([]);
  const [songsToLike, setSongsToLike] = useState<string[]>([]);
  const [okToFetch, setOkToFetch] = useState(false);

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

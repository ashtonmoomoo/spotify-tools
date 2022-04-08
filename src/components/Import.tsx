import { useEffect, useState } from "react";
import { getLibrary, Track } from "../utils/constants";
import { parseCSV } from "../utils/csvTools";
import {
  UploadCSV,
  PresentResults,
  NoDiff,
  Instructions,
} from "./importComponents";

function Import() {
  let [file, setFile] = useState<File>();
  let [trackIds, setTrackIds] = useState<string[]>([]);
  let [currentLibrary, setCurrentLibrary] = useState<Track[]>([]);
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
    const readFile = (file: File) => {
      let reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = (event: any) => {
        setTrackIds(parseCSV(event?.target?.result));
      };
    };

    if (file) {
      readFile(file);
    }
  }, [file]);

  useEffect(() => {
    let currentLibrarySet = new Set(currentLibrary.map((x) => x.uri));
    const missingSongs = [...trackIds].filter((x) => !currentLibrarySet.has(x));
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

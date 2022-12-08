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
import Button from "./Button";
import { addSongsToPlaylist, createPlaylist } from "../utils/playlists";

export function Import({ libraryMode }: { libraryMode: boolean }) {
  if (libraryMode) {
    return <ImportToLibrary />;
  }

  return <ImportToPlaylist />;
}

export function ImportToLibrary() {
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

export function ImportToPlaylist() {
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [file, setFile] = useState<File>();
  const [importComplete, setImportComplete] = useState(false);

  useEffect(() => {
    const fetchSongsFromCSV = async (file: File) => {
      const csvContent = await readFile(file);
      const parsedTrackIds = parseCSVIntoTrackIds(csvContent);
      setTrackIds(parsedTrackIds);
    };

    if (file) {
      fetchSongsFromCSV(file);
      setShowNewPlaylistInput(true);
    }
  }, [file]);

  const submit = async () => {
    const playlistId = await createPlaylist(newPlaylistName);
    if (!playlistId) return;

    const snapshotIds = await addSongsToPlaylist(trackIds, playlistId);
    if (snapshotIds?.length) {
      setImportComplete(true);
    }
  };

  return (
    <>
      <Instructions />
      {!showNewPlaylistInput && (
        <UploadCSV setFile={setFile} setOkToFetch={() => false} />
      )}
      {showNewPlaylistInput && (
        <>
          <p>New playlist name:</p>
          <input
            type={"text"}
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <Button text="Submit" buttonProps={{ onClick: () => submit() }} />
        </>
      )}
      {importComplete && <p>{newPlaylistName} created!</p>}
    </>
  );
}

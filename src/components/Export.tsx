import { useEffect, useState } from "react";
import {
  getFullPlaylists,
  getLibrary,
  getTrackArraysFromPlaylists,
  getUserPlaylists,
  removeDuplicateTracks,
} from "../utils/constants";
import { downloadCSV, getCSV } from "../utils/csvTools";
import Button from "./Button";

function ExportLibraryButton({ handleClick }: { handleClick: () => void }) {
  return (
    <>
      <p>Click below to download a CSV of your Spotify liked songs:</p>
      <Button
        buttonProps={{ type: "button", onClick: handleClick }}
        text="Export Library"
      />
    </>
  );
}

function CSVDownload({ name, csvContent }: DownloadLink) {
  return (
    <Button
      buttonProps={{
        type: "button",
        onClick: () => downloadCSV(name, csvContent),
      }}
      text={`Download ${name}`}
    />
  );
}

function Progress({ completion }: { completion: string }) {
  return (
    <>
      <label htmlFor="progress">{completion} % </label>
      <progress id="progress" max="100.00" value={completion} />
    </>
  );
}

function ExportInstance() {
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState("0.00");
  const [CSVContent, setCSVContent] = useState("");

  async function exportLibrary() {
    setLoading(true);
    const response = await getLibrary(setCompletion);
    const content = getCSV(removeDuplicateTracks(response));
    setCSVContent(content);
    setLoading(false);
  }

  if (loading) {
    return <Progress completion={completion} />;
  }

  if (CSVContent) {
    return <CSVDownload name="Library" csvContent={CSVContent} />;
  }

  return <ExportLibraryButton handleClick={exportLibrary} />;
}

type DownloadLink = {
  name: string;
  csvContent: string;
};

function Export({ libraryMode }: { libraryMode: boolean }) {
  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);

  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => setPlaylists(await getUserPlaylists());
    fetchPlaylists();
  }, []);

  async function createPlaylistDownloadLinks(
    selectedPlaylists: SpotifyApi.PlaylistObjectSimplified[]
  ) {
    const fullPlaylists = await getFullPlaylists(selectedPlaylists);
    const trackArrayArray = getTrackArraysFromPlaylists(fullPlaylists);
    const downloadData = trackArrayArray.map((trackArray) => {
      return { name: trackArray.name, csvContent: getCSV(trackArray.tracks) };
    });
    setDownloadLinks(downloadData);
  }

  if (downloadLinks.length) {
    return (
      <>
        {downloadLinks.map((downloadLink) => (
          <>
            <CSVDownload
              key={downloadLink.name}
              name={downloadLink.name}
              csvContent={downloadLink.csvContent}
            />
            <br />
          </>
        ))}
      </>
    );
  }

  return (
    <>
      {!libraryMode && (
        <>
          <PlaylistSelect
            playlists={playlists}
            selectedPlaylists={selectedPlaylists}
            setSelectedPlaylists={setSelectedPlaylists}
          />
          <button
            type="submit"
            onClick={() => createPlaylistDownloadLinks(selectedPlaylists)}
          >
            Submit
          </button>
        </>
      )}
      {libraryMode && <ExportInstance />}
    </>
  );
}

type SetSelectedPlaylists = (
  playlists: SpotifyApi.PlaylistObjectSimplified[]
) => void;

function PlaylistSelect({
  playlists,
  selectedPlaylists,
  setSelectedPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
  selectedPlaylists: SpotifyApi.PlaylistObjectSimplified[];
  setSelectedPlaylists: SetSelectedPlaylists;
}) {
  return (
    <div className="scrollable">
      {playlists.map((playlist) => (
        <div key={playlist.id}>
          <input
            id={playlist.id}
            type="checkbox"
            key={playlist.id}
            onChange={() =>
              setSelectedPlaylists([...selectedPlaylists, playlist])
            }
          />
          <label htmlFor={playlist.id}>{playlist.name}</label>
        </div>
      ))}
    </div>
  );
}

export default Export;

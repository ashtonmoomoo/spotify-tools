import { useEffect, useState } from "react";
import {
  getLibrary,
  getUserPlaylists,
  removeDuplicateTracks,
} from "../utils/constants";
import { getTokenFromCookie } from "../utils/tools";
import { downloadCSV, getCSV } from "../utils/csvTools";
import Button from "./Button";
import ExpiredSession from "./ExpiredSession";

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

function CSVDownload({ csvContent }: { csvContent: string }) {
  return (
    <Button
      buttonProps={{ type: "button", onClick: () => downloadCSV(csvContent) }}
      text="Download"
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
  const token = getTokenFromCookie();

  async function exportLibrary() {
    if (!token) return null;

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
    return <CSVDownload csvContent={CSVContent} />;
  }

  if (token) {
    return <ExportLibraryButton handleClick={exportLibrary} />;
  }

  return <ExpiredSession />;
}

function Export() {
  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setPlaylists(await getUserPlaylists());
    };

    fetchPlaylists();
  }, []);

  return (
    <>
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
      <button type="submit" onClick={() => console.log(selectedPlaylists)}>
        Submit
      </button>
    </>
  );
}

export default Export;

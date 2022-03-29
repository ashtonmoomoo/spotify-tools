import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Track, getLibrary } from "../utils/constants";
import getTokenFromCookie from "../utils/getTokenFromCookie";

function prepareSongForCSV(song: Track) {
  let row: string[] = [];
  for (let field of Object.values(song)) {
    row.push(`"${field?.replace(/"/g, '""')}"`);
  }

  return row.join(",") + "\n";
}

function getCSV(library: Track[]) {
  let csv = Object.keys(library[0]).join(",") + "\n";

  library.forEach((song) => {
    csv += prepareSongForCSV(song);
  });

  return csv;
}

function removeDuplicates(library: Track[]) {
  let idToTrack = new Map<string, Track>();
  library.forEach((t) => idToTrack.set(t.uri, t));

  let tracksToReturn: Track[] = [];
  for (let track of idToTrack.values()) {
    tracksToReturn.push(track);
  }

  return tracksToReturn;
}

function Export() {
  let [loading, setLoading] = useState(false);
  let [completion, setCompletion] = useState("0.00");
  let [CSVContent, setCSVContent] = useState("");
  let [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const t = getTokenFromCookie();
    setToken(t);
  }, []);

  async function handleClick() {
    if (!token) return null;

    setLoading(true);
    const response = await getLibrary(setCompletion);
    const content = getCSV(removeDuplicates(response));
    setCSVContent(content);
    setLoading(false);
  }

  if (loading) {
    return <Progress completion={completion} />;
  }

  if (CSVContent) {
    return <CSVDownload CSVContent={CSVContent} />;
  }

  if (token) {
    return <ExportLibraryButton handleClick={handleClick} />;
  }

  return <Link to="/">Something is wrong... go home.</Link>;
}

function ExportLibraryButton({ handleClick }: { handleClick: () => void }) {
  return (
    <>
      <p>Click below to download a CSV of your Spotify liked songs:</p>
      <button type="button" onClick={handleClick}>
        Export Library
      </button>
    </>
  );
}

function CSVDownload({ CSVContent }: { CSVContent: string }) {
  function handleClick() {
    const blob = new Blob([CSVContent], {
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

  return (
    <>
      <button type="button" onClick={handleClick}>
        Download
      </button>
      <br />
      <Link to="/">Go home</Link>
    </>
  );
}

function Progress({ completion }: { completion: string }) {
  return (
    <>
      <p>{completion} % Completed...</p>
      <p>
        ya it takes a while for big libraries - Spotify API only lets you get 50
        songs at a time.
      </p>
    </>
  );
}

export default Export;

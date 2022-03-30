import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getLibrary,
  getTokenFromCookie,
  removeDuplicates,
} from "../utils/constants";
import { downloadCSV, getCSV } from "../utils/csvTools";

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

function CSVDownload({ csvContent }: { csvContent: string }) {
  return (
    <button type="button" onClick={() => downloadCSV(csvContent)}>
      Download
    </button>
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

function Export() {
  let [loading, setLoading] = useState(false);
  let [completion, setCompletion] = useState("0.00");
  let [CSVContent, setCSVContent] = useState("");
  const token = getTokenFromCookie();

  async function exportLibrary() {
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
    return <CSVDownload csvContent={CSVContent} />;
  }

  if (token) {
    return <ExportLibraryButton handleClick={exportLibrary} />;
  }

  return (
    <Link to="/login">
      Your session has expired, you will need to log in again.
    </Link>
  );
}

export default Export;

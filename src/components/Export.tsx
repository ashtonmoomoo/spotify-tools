import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getLibrary,
  getTokenFromCookie,
  removeDuplicates,
} from "../utils/constants";
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

  return <ExpiredSession />;
}

export default Export;

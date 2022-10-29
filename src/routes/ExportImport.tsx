import { useState } from "react";
import ExpiredSession from "../components/ExpiredSession";
import Export from "../components/Export";
import { Import } from "../components/Import";
import { getTokenFromCookie } from "../utils/tools";
import "../styles/exportImport.css";

function ExportImport() {
  const [exportVisible, setExportVisible] = useState(true);
  const [libraryMode, setLibraryMode] = useState(true);

  function showExport() {
    setExportVisible(true);
    document.getElementById("export")?.classList.remove("not-selected");
    document.getElementById("export")?.classList.add("selected");

    document.getElementById("import")?.classList.remove("selected");
    document.getElementById("import")?.classList.add("not-selected");
  }

  function showImport() {
    setExportVisible(false);
    document.getElementById("import")?.classList.remove("not-selected");
    document.getElementById("import")?.classList.add("selected");

    document.getElementById("export")?.classList.remove("selected");
    document.getElementById("export")?.classList.add("not-selected");
  }

  if (!getTokenFromCookie()) {
    return <ExpiredSession />;
  }

  return (
    <>
      <span id="export" className="selected" onClick={() => showExport()}>
        Export
      </span>
      <span> / </span>
      <span id="import" className="not-selected" onClick={() => showImport()}>
        Import
      </span>
      <span className="non-header">
        {" "}
        your <LibraryOrPlaylists setLibraryMode={setLibraryMode} />
      </span>
      <div>
        {exportVisible && <Export libraryMode={libraryMode} />}
        {!exportVisible && <Import libraryMode={libraryMode} />}
      </div>
    </>
  );
}

function LibraryOrPlaylists({
  setLibraryMode,
}: {
  setLibraryMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <select onChange={(e) => setLibraryMode(e.target.value === "library")}>
      <option key="library" value={"library"}>
        library
      </option>
      <option key="playlists" value={"playlists"}>
        playlists
      </option>
    </select>
  );
}

export default ExportImport;

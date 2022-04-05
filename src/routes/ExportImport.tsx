import { useState } from "react";
import Export from "../components/Export";
import Import from "../components/Import";

import "../styles/exportImport.css";

function ExportImport() {
  const [exportVisible, setExportVisible] = useState(true);

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

  return (
    <>
      <span id="export" className="selected" onClick={() => showExport()}>
        Export
      </span>
      <span> / </span>
      <span id="import" className="not-selected" onClick={() => showImport()}>
        Import
      </span>
      <span className="non-header"> your library</span>
      <div>
        {exportVisible && <Export />}
        {!exportVisible && <Import />}
      </div>
    </>
  );
}

export default ExportImport;

export function UploadCSV({
  setFile,
  setOkToFetch,
}: {
  setFile: (f: File) => void;
  setOkToFetch: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  function handleUpload(event: any) {
    setFile(event?.target?.files[0]);
  }

  return (
    <>
      <label htmlFor="csv-upload" className="form-button csv-upload">
        Upload CSV
      </label>
      <input
        id="csv-upload"
        className="hidden-input"
        type="file"
        accept=".csv"
        onChange={handleUpload}
        onClick={() => setOkToFetch(true)}
      />
    </>
  );
}

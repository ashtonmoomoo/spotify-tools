import { useState } from "react";
import { detectDuplicates, Track } from "../utils/detectDuplicates";

type PromptProps = {
  token: string;
};

function Prompt(props: PromptProps) {
  const { token } = props;
  let [duplicates, setDuplicates] = useState<Track[]>([]);
  let [loading, setLoading] = useState<Boolean>(false);

  async function handleClick() {
    setLoading(true);
    const dups = await detectDuplicates(token);
    setLoading(false);
    setDuplicates(dups);
  }

  return (
    <>
      <p>
        Click below to detect duplicates - before the process is begun, you will
        have an opportunity to review.
      </p>
      {!duplicates.length && !loading ? (
        <button type="button" onClick={handleClick}>
          Detect Duplicate Songs
        </button>
      ) : !duplicates.length && loading ? (
        <p>Loading...</p>
      ) : (
        <DuplicateSongs duplicates={duplicates} />
      )}
    </>
  );
}

function DuplicateSongs(props: { duplicates: Track[] }) {
  const { duplicates } = props;

  return (
    <table>
      <tr>
        <th>Count</th>
        <th>Song</th>
        <th>Album</th>
        <th>Artist</th>
      </tr>
      {duplicates.map((dup, index: number) => (
        <tr key={dup.id}>
          <td>{index + 1}</td>
          <td>{dup.name}</td>
          <td>{dup.album}</td>
          <td>{dup.artist}</td>
        </tr>
      ))}
    </table>
  );
}

export default Prompt;

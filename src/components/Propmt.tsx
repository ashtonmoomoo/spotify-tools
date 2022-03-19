import { useState } from "react";
import { detectDuplicates, Track } from "../utils/detectDuplicates";

type PromptProps = {
  token: string;
};

function Prompt(props: PromptProps) {
  const { token } = props;
  let [duplicates, setDuplicates] = useState<Track[]>([]);

  async function handleClick() {
    const dups = await detectDuplicates(token);
    console.log(dups);
    setDuplicates(dups);
  }

  return (
    <>
      <p>
        Click below to detect duplicates - before the process is begun, you will
        have an opportunity to review.
      </p>
      {!duplicates.length ? (
        <button type="button" onClick={handleClick}>
          Detect Duplicates
        </button>
      ) : (
        <ul>
          {duplicates.map((dup) => (
            <li>
              {dup.name} {dup.album} {dup.artist}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Prompt;

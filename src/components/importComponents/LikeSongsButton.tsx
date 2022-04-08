import { likeSongs } from "../../utils/constants";
import Button from "../Button";

export function LikeSongsButton({
  acceptedTerms,
  progressRestoringLibrary,
  setProgressRestoringLibrary,
  songsToLike,
}: {
  acceptedTerms: boolean;
  progressRestoringLibrary: string;
  setProgressRestoringLibrary: React.Dispatch<React.SetStateAction<string>>;
  songsToLike: string[];
}) {
  function likeMissingSongs() {
    if (!songsToLike) {
      return;
    }

    likeSongs(songsToLike, setProgressRestoringLibrary);
  }

  return (
    <Button
      buttonProps={{
        type: "button",
        disabled: !acceptedTerms || progressRestoringLibrary !== "0.00",
        onClick: likeMissingSongs,
      }}
      text="Like missing songs"
    />
  );
}

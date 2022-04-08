import { useState } from "react";
import { AcceptFate, LikeSongsButton, ShowMissingSongs } from ".";

export function PresentResults({ songsToLike }: { songsToLike: string[] }) {
  let [acceptedTerms, setAcceptedTerms] = useState(false);
  let [progressRestoringLibrary, setProgressRestoringLibrary] =
    useState("0.00");

  return (
    <>
      <ShowMissingSongs songsToLike={songsToLike} />
      <AcceptFate
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
      />
      <LikeSongsButton
        acceptedTerms={acceptedTerms}
        progressRestoringLibrary={progressRestoringLibrary}
        setProgressRestoringLibrary={setProgressRestoringLibrary}
        songsToLike={songsToLike}
      />
    </>
  );
}

export function ShowMissingSongs({ songsToLike }: { songsToLike: string[] }) {
  return (
    <>
      <h4>
        Here are the IDs of the songs missing from your library that are on the
        .csv you uploaded. You can paste the ID into your browser URL bar (in a
        different tab) and press enter to check which song it is.
      </h4>
      <ul>
        {songsToLike.map((song) => (
          <li key={song}>{song}</li>
        ))}
      </ul>
    </>
  );
}

export function AcceptFate({
  acceptedTerms,
  setAcceptedTerms,
}: {
  acceptedTerms: boolean;
  setAcceptedTerms: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <label htmlFor="fate-accepted">
        I accept this might rek my library but I want to do it anyway
      </label>
      <input
        id="fate-accepted"
        type="checkbox"
        onChange={() => setAcceptedTerms(!acceptedTerms)}
      />
    </>
  );
}

// Revisit this method
export function setTokenCookie(token: string) {
  document.cookie = `spotify_token=${token};path=/;max-age=${
    60 * 60
  };samesite=lax;`;
}

export function getTokenFromCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("spotify_token"))
    ?.split("=")[1];
}

export function getAuthHeaders() {
  return {
    Authorization: `Bearer ${getTokenFromCookie()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function readFile(file: File): Promise<string> {
  const result = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    // fml it's an Event but EventTarget doesn't know it has a result prop
    /* eslint-disable @typescript-eslint/no-explicit-any */
    reader.onload = (event: any) => resolve(event?.target?.result);
    reader.onerror = (err: any) => reject(err);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  return result;
}

export function batchifyArray<T>(arrayToBatchify: T[], batchSize: number): T[][] {
  const result: T[][] = [];
  const total = arrayToBatchify.length;

  const numberOfBatches = Math.ceil(total / batchSize);
  let processed = 0;

  for (let batchNumber = 0; batchNumber < numberOfBatches; batchNumber++) {
    const offset = batchNumber * batchSize;
    const thisBatchSize = Math.min(batchSize, total - processed);
    const batch: T[] = [];

    for (let i = 0; i < thisBatchSize; i++) {
      batch.push(arrayToBatchify[offset + i]);
      processed++;
    }

    result.push(batch);
  }

  return result;
}

export function objectToQueryString(obj: object) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function getAuthUrl() {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing config");
  }

  const params = {
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "user-library-modify \
            user-library-read \
            user-read-private \
            playlist-read-private \
            playlist-modify-private \
            playlist-modify-public \
            playlist-read-collaborative",
  };

  return "https://accounts.spotify.com/authorize?" + objectToQueryString(params);
}

export function getTokenFromUrl() {
  return window.location.hash
    ?.replace("#", "")
    .split("&")
    .filter((x) => x.startsWith("access_token"))[0]
    ?.split("=")[1];
}

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

export async function readFile(file: File): Promise<string> {
  let result = await new Promise<string>((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsText(file, "utf-8");
    // fml it's an Event but EventTarget doesn't know it has a result prop
    reader.onload = (event: any) => resolve(event?.target?.result);
    reader.onerror = (err: any) => reject(err);
  });

  return result;
}

export function batchifyArray<T>(arrayToBatchify: T[], batchSize: number): T[][] {
  let result: T[][] = [];
  const total = arrayToBatchify.length;

  const numberOfBatches = Math.ceil(total / batchSize);
  let processed = 0;

  for (let batchNumber = 0; batchNumber < numberOfBatches; batchNumber++) {
    let offset = batchNumber * batchSize;
    let thisBatchSize = Math.min(batchSize, total - processed);
    let batch: T[] = [];

    for (let i = 0; i < thisBatchSize; i++) {
      batch.push(arrayToBatchify[offset + i]);
      processed++;
    }

    result.push(batch);
  }

  return result;
}

function objectToQueryString(obj: any) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function getAuthUrl() {
  const spotifyAuthEndpoint = "https://accounts.spotify.com/authorize?";
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing config");
  }

  const params = {
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "user-library-modify user-library-read user-read-private",
  };

  const queryString = objectToQueryString(params);

  return spotifyAuthEndpoint + queryString;
}

export function getTokenFromUrl() {
  return window.location.hash
    ?.replace("#", "")
    .split("&")
    .filter((x) => x.startsWith("access_token"))[0]
    ?.split("=")[1];
}

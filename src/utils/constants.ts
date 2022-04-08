const BATCH_SIZE = 50; // API limit

type FetchParams = {
  endpoint: string;
  method?: "GET" | "PUT" | "POST";
  options?: string;
}

type FetchTrackParams = {
  limit: number;
  offset: number;
  market: string;
};

type SetCompletion = (completion: string) => void;

export type Track = {
  uri: string;
  name: string;
  album: string;
  artist: string;
};

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

export async function spotifyFetch({endpoint, options='', method="GET"}: FetchParams) {
  const spotifyApiBase = "https://api.spotify.com/v1";
  return fetch(spotifyApiBase + endpoint + options, {
    method,
    headers: {
      Authorization: `Bearer ${getTokenFromCookie()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function getTotalNumberOfSongs() {
  const endpoint = "/me/tracks";
  const options = "?limit=1";
  const response = await spotifyFetch({ endpoint, options });

  if (!response.ok) {
    throw new Error("Something went wrong fetching library count");
  }

  const { total } = await response.json();

  return total;
}

async function batchFetchTracks({
  limit = 50,
  offset = 0,
  market
}: Partial<FetchTrackParams>): Promise<Track[]> {
  const endpoint = "/me/tracks";
  const options = `?limit=${limit}&offset=${offset}&market=${market}`;
  const response = await spotifyFetch({ endpoint, options });

  if (!response.ok) {
    throw new Error("Something went wrong fetching tracks :(");
  }

  const { items } = await response.json();

  const itemsReduced = items.map((item: any) => {
    return {
      uri: item.track.uri,
      name: item.track.name,
      album: item.track.album.name,
      artist: item.track.artists[0].name,
    };
  });

  return itemsReduced;
}

async function getUserMarket() {
  const user = await spotifyFetch({ endpoint: "/me" })
  const body = await user.json();
  return body.country;
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

export async function getLibrary(setCompletion?: SetCompletion) {
  const market = await getUserMarket();
  // const total = await getTotalNumberOfSongs();
  const total = 200;

  const numberOfBatches = Math.ceil(total / BATCH_SIZE);
  let processed = 0;
  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = BATCH_SIZE * i;
    let limit = Math.min(BATCH_SIZE, total - processed);

    const tracks = await batchFetchTracks({ offset, market, limit });

    library.push(...tracks);
    processed += limit;

    if (setCompletion) {
      setCompletion(((i / numberOfBatches) * 100).toFixed(2));
    }
  }

  return library;
}

function getTrackId(uri: string) {
  return uri.split(':')[2];
}

export function isSpotifyTrackId(str: string) {
  const pattern = /spotify:track:[a-zA-Z0-9]{22}/;
  return pattern.test(str);
}

export async function likeSongs(songsToLike: string[], setCompletion: SetCompletion) {
  const endpoint = '/me/tracks';
  const method = "PUT";
  const batches = batchifyArray(songsToLike, BATCH_SIZE);
  let currentBatch = 0;

  batches.forEach(async (batch) => {
    let response = await spotifyFetch({
      endpoint,
      method,
      options: `?ids=${batch.map(song => getTrackId(song)).join(',')}`,
    });

    if (!response.ok) {
      throw new Error("Oh god");
    }

    setCompletion(((++currentBatch / batches.length) * 100).toFixed(2));
  });
}

export function removeDuplicates(library: Track[]): Track[] {
  let idToTrack = new Map<string, Track>();
  library.forEach((t) => idToTrack.set(t.uri, t));
  return [...idToTrack.values()];
}

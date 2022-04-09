import { getTokenFromCookie, batchifyArray } from "./tools";

const BATCH_SIZE = 50; // API limit

type FetchParams = {
  endpoint: string;
  method?: "GET" | "PUT" | "POST";
  options?: string;
}

type BatchFetchParams = {
  endpoint: string;
  limit: number;
  offset: number;
  market?: string;
};

type SetCompletion = (completion: string) => void;

export type Track = {
  uri: string;
  name: string;
  album: string;
  artist: string;
};

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

export async function getTotalNumberOfItems(endpoint: string) {
  const options = "?limit=1";
  const response = await spotifyFetch({ endpoint, options });

  if (!response.ok) {
    throw new Error(`Something went wrong fetching count for endpoint ${endpoint}`);
  }

  const { total } = await response.json();

  return total;
}

function responseToTrack(items: any): Track[] {
  return items.map((item: any) => {
    return {
      uri: item.track.uri,
      name: item.track.name,
      album: item.track.album.name,
      artist: item.track.artists[0].name,
    };
  });
}

async function batchFetchItems({
  endpoint,
  limit = BATCH_SIZE,
  offset = 0,
  market
}: BatchFetchParams): Promise<any> {
  const options = `?limit=${limit}&offset=${offset}&market=${market}`;
  const response = await spotifyFetch({ endpoint, options });

  if (!response.ok) {
    throw new Error(`Something went wrong fetching items for endpoint ${endpoint}`);
  }

  const { items } = await response.json();

  return items;
}

async function getUser() {
  const user = await spotifyFetch({ endpoint: "/me" })
  const body = await user.json();
  return body;
}

export async function getUsername() {
  const user = await getUser();
  return user.display_name;
}

export async function getUserMarket() {
  const user = await getUser();
  return user.country;
}

export async function getLibrary(setCompletion?: SetCompletion) {
  const market = await getUserMarket();
  const endpoint = "/me/tracks";
  const total = process.env.NODE_ENV === "production" ? await getTotalNumberOfItems(endpoint) : 200;

  const numberOfBatches = Math.ceil(total / BATCH_SIZE);
  let processed = 0;
  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = BATCH_SIZE * i;
    let limit = Math.min(BATCH_SIZE, total - processed);

    const tracks = await batchFetchItems({ endpoint, offset, market, limit });

    library.push(...responseToTrack(tracks));
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

export async function likeSongs(songsToLike: string[], setCompletion?: SetCompletion) {
  const batches = batchifyArray(songsToLike, BATCH_SIZE);
  let currentBatch = 0;

  batches.forEach(async (batch) => {
    let response = await spotifyFetch({
      endpoint: "/me/tracks",
      method: "PUT",
      options: `?ids=${batch.map(song => getTrackId(song)).join(',')}`,
    });

    if (!response.ok) {
      throw new Error("Oh god");
    }

    if (setCompletion) {
      setCompletion(((++currentBatch / batches.length) * 100).toFixed(2));
    }
  });
}

export function removeDuplicateTracks(library: Track[]): Track[] {
  let idToTrack = new Map<string, Track>();
  library.forEach((t) => idToTrack.set(t.uri, t));
  return [...idToTrack.values()];
}

export function findMissingSongs(currentLibrary: string[], source: string[]) {
  let currentLibrarySet = new Set(currentLibrary);
  return source.filter((song) => !currentLibrarySet.has(song));
}

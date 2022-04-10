import { getTokenFromCookie, batchifyArray } from "./tools";

const BATCH_SIZE = 50; // API limit

type FetchParams = {
  endpoint: string;
  method?: "GET" | "PUT" | "POST";
  options?: string;
}

type SetCompletion = (completion: string) => void;

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

async function getUser(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
  const user = await spotifyFetch({ endpoint: "/me" })
  const body = await user.json();
  return body;
}

export async function getUsername(): Promise<string | undefined> {
  const user = await getUser();
  return user?.display_name;
}

export async function getUserMarket(): Promise<string | undefined> {
  const user = await getUser();
  return user?.country;
}

export async function getLibrary(setCompletion?: SetCompletion) {
  const market = await getUserMarket();
  const endpoint = "/me/tracks";
  let library: SpotifyApi.TrackObjectFull[] = [];
  let next: string | null;
  let offset = 0;

  do {
    let response = await spotifyFetch({ endpoint, options: `?limit=${BATCH_SIZE}&market=${market}&offset=${offset}`}); // come back to this - use object to params method and pass in object instead
    let body: SpotifyApi.UsersSavedTracksResponse = await response.json();
    library.push(...body.items.map((savedTrack) => savedTrack.track)); // tidy this line up

    next = body.next;
    offset += BATCH_SIZE;

    if (setCompletion) {
      setCompletion(((offset / body.total) * 100).toFixed(2));
    }
  } while (next);

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

export function removeDuplicateTracks(library: SpotifyApi.TrackObjectFull[]): SpotifyApi.TrackObjectFull[] {
  let idToTrack = new Map<string, SpotifyApi.TrackObjectFull>();
  library.forEach((t) => idToTrack.set(t.id, t));
  return [...idToTrack.values()];
}

export function findMissingSongs(currentLibrary: string[], source: string[]) {
  let currentLibrarySet = new Set(currentLibrary);
  return source.filter((song) => !currentLibrarySet.has(song));
}

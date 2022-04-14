import {
  getTokenFromCookie,
  batchifyArray,
  objectToQueryString,
} from "./tools";

const BATCH_SIZE = 50; // API limit

type HTTPMethod = "GET" | "POST" | "PUT";

type OptionsObject = {
  ids?: string;
  market?: string;
  limit?: number;
  offset?: number;
};

type SetCompletion = (completion: string) => void;

export async function spotifyFetch(
  endpoint: string,
  method: HTTPMethod = "GET",
  options: OptionsObject = {}
) {
  return fetch(
    `https://api.spotify.com/v1${endpoint}?${objectToQueryString(options)}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${getTokenFromCookie()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

async function getUser(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
  const user = await spotifyFetch("/me");
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

function getTracksFromSavedTrackResponse(
  tracksResponse: SpotifyApi.UsersSavedTracksResponse
) {
  return tracksResponse.items.map((savedTrack) => savedTrack.track);
}

export async function getLibrary(setCompletion?: SetCompletion) {
  const market = await getUserMarket();
  const library: SpotifyApi.TrackObjectFull[] = [];
  let next: string | null;
  let offset = 0;

  do {
    const response = await spotifyFetch("/me/tracks", "GET", {
      limit: BATCH_SIZE,
      offset,
      market,
    });
    const body: SpotifyApi.UsersSavedTracksResponse = await response.json();
    library.push(...getTracksFromSavedTrackResponse(body));

    next = body.next;
    offset += BATCH_SIZE;

    if (setCompletion) {
      setCompletion(((offset / body.total) * 100).toFixed(2));
    }
  } while (next);

  return library;
}

function getTrackId(uri: string) {
  return uri.split(":")[2];
}

export function isSpotifyTrackId(str: string) {
  const pattern = /spotify:track:[a-zA-Z0-9]{22}/;
  return pattern.test(str);
}

export async function likeSongs(
  songsToLike: string[],
  setCompletion?: SetCompletion
) {
  const batches = batchifyArray(songsToLike, BATCH_SIZE);
  let currentBatch = 0;

  batches.forEach(async (batch) => {
    const response = await spotifyFetch("/me/tracks", "PUT", {
      ids: batch.map((song) => getTrackId(song)).join(","),
    });

    if (!response.ok) {
      throw new Error("Oh god");
    }

    if (setCompletion) {
      setCompletion(((++currentBatch / batches.length) * 100).toFixed(2));
    }
  });
}

export function removeDuplicateTracks(
  library: SpotifyApi.TrackObjectFull[]
): SpotifyApi.TrackObjectFull[] {
  const idToTrack = new Map<string, SpotifyApi.TrackObjectFull>();
  library.forEach((t) => idToTrack.set(t.id, t));
  return [...idToTrack.values()];
}

export function findMissingSongs(currentLibrary: string[], source: string[]) {
  const currentLibrarySet = new Set(currentLibrary);
  return source.filter((song) => !currentLibrarySet.has(song));
}

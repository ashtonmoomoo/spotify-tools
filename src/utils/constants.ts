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

export type Track = {
  uri: string;
  name: string;
  album: string;
  artist: string;
};

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
  const tracks = "/me/tracks";
  const options = "?limit=1";

  const response = await spotifyFetch({ endpoint: tracks, options });

  if (!response.ok) {
    throw new Error("Something went wrong fetching library count");
  }

  const body = await response.json();
  const { total } = body;

  return total;
}

async function batchFetchTracks({
  limit = 50,
  offset = 0,
  market
}: Partial<FetchTrackParams>): Promise<Track[]> {
  const tracks = "/me/tracks";
  const options = `?limit=${limit}&offset=${offset}&market=${market}`;

  const response = await spotifyFetch({ endpoint: tracks, options });

  if (!response.ok) {
    throw new Error("Something went wrong fetching tracks :(");
  }

  const body = await response.json();
  const { items } = body;

  // idk what to do about this lol
  const itemsReduced = items.map((item: any) => {
    return {
      uri: item.track.uri,
      name: item.track.name,
      album: item.track.album.name,
      artist: item.track.artists[0].name, // secondary artists btfo
    };
  });

  return itemsReduced;
}

type SetCompletion = (completion: string) => void;

export async function getLibrary(setCompletion: SetCompletion) {
  const user = await spotifyFetch({ endpoint: "/me" })
  const body = await user.json();
  const market = body.country;

  /*
    DEBUG MODE
  */

  const total = await getTotalNumberOfSongs();
  // const total = 700;
  const numberOfBatches = Math.ceil(total / BATCH_SIZE);

  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = BATCH_SIZE * i;

    const tracks = await batchFetchTracks({ offset, market });
    library = [...library, ...tracks];

    setCompletion(((i / numberOfBatches) * 100).toFixed(2));
  }

  return library;
}

function getTrackId(uri: string) {
  return uri.split(':')[2];
}

export async function likeSongs(songsToLike: string[], setCompletion: SetCompletion) {
  const total = songsToLike.length;
  const numberOfBatches = Math.ceil(total / BATCH_SIZE);
  let processed = 0;

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = BATCH_SIZE * i;
    let toProcessThisBatch = Math.min(BATCH_SIZE, total - processed); // probably uhhhh check this
    let queryString = '?ids=';

    for (let j = 0; j < toProcessThisBatch; j++) {
      processed++;
      queryString += getTrackId(songsToLike[offset + j]) + ',';
    }

    queryString = queryString.slice(0, -1);

    await spotifyFetch({endpoint: '/me/tracks', options: queryString, method: "PUT"});

    setCompletion(((i / numberOfBatches) * 100).toFixed(2));
  }
}

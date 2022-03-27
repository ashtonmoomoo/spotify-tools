type FetchParams = {
  endpoint: string;
  options?: any;
  token?: string;
}

type FetchTrackParams = {
  limit: number;
  offset: number;
  token: string;
  market: string;
};

export type Track = {
  uri: string;
  name: string;
  album: string;
  artist: string;
};

export async function spotifyGet({endpoint, token, options=''}: FetchParams) {
  const spotifyApiBase = "https://api.spotify.com/v1";
  return fetch(spotifyApiBase + endpoint + options, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function getTotalNumberOfSongs(token: string) {
  const tracks = "/me/tracks";
  const options = "?limit=1";

  const response = await spotifyGet({ endpoint: tracks, token, options });

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
  token,
  market
}: Partial<FetchTrackParams>): Promise<Track[]> {
  const tracks = "/me/tracks";
  const options = `?limit=${limit}&offset=${offset}&market=${market}`;

  const response = await spotifyGet({ endpoint: tracks, token, options });

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

export async function getLibrary(token: string, setCompletion: SetCompletion) {
  const batchSize = 50; // API limit
  const user = await spotifyGet({ endpoint: "/me", token })
  const body = await user.json();
  const market = body.country;

  /*
    DEBUG MODE
  */

  // const total = await getTotalNumberOfSongs(token);
  const total = 700;
  const numberOfBatches = Math.ceil(total / batchSize);

  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = batchSize * i;

    const tracks = await batchFetchTracks({ offset, token, market });
    library = [...library, ...tracks];

    setCompletion(((i / numberOfBatches) * 100).toFixed(2));
  }

  return library;
}

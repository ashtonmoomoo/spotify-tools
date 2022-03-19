const spotifyApiBase = 'https://api.spotify.com/v1';

type BatchParams = {
  limit: number;
  offset: number;
  token: string;
}

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
}
export type {Track};

async function batchFetchTracks({limit=50, offset=0, token}: Partial<BatchParams>) {
  const tracks = '/me/tracks';

  const params = `?limit=${limit}&offset=${offset}`

  const response = await fetch(spotifyApiBase + tracks + params, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Something went wrong fetching tracks');
  }

  const body = await response.json();
  const { items } = body;

  const itemsReduced: Track[] = items.map((item: any) => {
    return {
      id: item.track.id,
      name: item.track.name,
      album: item.track.album.name,
      artist: item.track.artists[0].name, // secondary artists btfo
    }
  });

  return itemsReduced;
}

async function getTotalNumberOfSongs(token: string) {
  const tracks = '/me/tracks';

  const response = await fetch(spotifyApiBase + tracks, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Something went wrong fetching tracks');
  }

  const body = await response.json();
  const { total } = body;

  return total;
}

async function getLibrary(token: string) {
  const batchSize = 50;

  /*
    DEBUG MODE
  */

  // const total = await getTotalNumberOfSongs(token);
  const total = 1000;
  const numberOfBatches = Math.ceil(total / batchSize);


  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = batchSize * i;

    const tracks = await batchFetchTracks({offset, token});
    library = [...library, ...tracks];
  }

  return library;
}

export async function detectDuplicates(token: string) {
  const tracks = await getLibrary(token);

  let trackIds: string[] = [];
  let duplicates: Track[] = [];

  for (let track of tracks) {
    let trackId = track.name + track.album + track.artist;

    if (!trackIds.includes(trackId)) {
      trackIds.push(trackId);
    } else {
      duplicates.push(track);
    }
  }

  return duplicates.sort((a, b) => {
    let aUpper = a.name.toUpperCase();
    let bUpper = b.name.toUpperCase();
    if (aUpper < bUpper) return -1;
    if (aUpper > bUpper) return 1;
    else return 0;
  });
}
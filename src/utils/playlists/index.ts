import { getUserId } from "../constants";
import { batchifyArray, getAuthHeaders } from "../tools";

const MAX_SONGS_BATCH = 100;

export async function createPlaylist(name: string): Promise<string | null> {
  const userId = await getUserId();
  const result = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        public: false,
      }),
    }
  );

  if (result.status !== 201) {
    return null;
  }

  const playlistResponse = await result.json();

  return playlistResponse.id;
}

export async function addSongsToPlaylist(
  songIdsToAdd: string[],
  playlistId: string
): Promise<string[] | null> {
  const batchedSongs = batchifyArray(songIdsToAdd, MAX_SONGS_BATCH);
  const snapshotIds: string[] = [];

  for (const batch of batchedSongs) {
    const result = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          uris: batch,
        }),
      }
    );

    if (result.status !== 201) {
      return null;
    }

    const addToPlaylistResult = await result.json();
    snapshotIds.push(addToPlaylistResult.snapshot_id);
  }

  return snapshotIds;
}

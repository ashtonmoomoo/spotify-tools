import { getUserId } from "../constants";
import { batchifyArray } from "../tools";

const MAX_SONGS_BATCH = 100;

export async function createPlaylist(name: string): Promise<string | null> {
  const userId = getUserId();
  const result = await fetch(`/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name,
      public: false,
    }),
  });

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
    const result = await fetch(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        uris: batch,
      }),
    });

    if (result.status !== 201) {
      return null;
    }

    const addToPlaylistResult = await result.json();
    snapshotIds.push(addToPlaylistResult.snapshot_id);
  }

  return snapshotIds;
}

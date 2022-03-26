import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getTokenFromCookie from "../utils/getTokenFromCookie";

const spotifyApiBase = "https://api.spotify.com/v1";

type FetchTrackParams = {
  limit: number;
  offset: number;
  token: string;
};

type Track = {
  uri: string;
  name: string;
  album: string;
  artist: string;
};

async function batchFetchTracks({
  limit = 50,
  offset = 0,
  token,
}: Partial<FetchTrackParams>): Promise<Track[]> {
  const tracks = "/me/tracks";
  const params = `?limit=${limit}&offset=${offset}`;

  const response = await fetch(spotifyApiBase + tracks + params, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

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

async function getTotalNumberOfSongs(token: string) {
  const tracks = "/me/tracks";

  const response = await fetch(spotifyApiBase + tracks + "?limit=1", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong fetching tracks");
  }

  const body = await response.json();
  const { total } = body;

  return total;
}

type SetCompletion = (completion: string) => void;

async function getLibrary(token: string, setCompletion: SetCompletion) {
  const batchSize = 50; // API limit

  /*
    DEBUG MODE
  */

  // const total = await getTotalNumberOfSongs(token);
  const total = 700;
  const numberOfBatches = Math.ceil(total / batchSize);

  let library: Track[] = [];

  for (let i = 0; i < numberOfBatches; i++) {
    let offset = batchSize * i;

    const tracks = await batchFetchTracks({ offset, token });
    library = [...library, ...tracks];

    setCompletion(((i / numberOfBatches) * 100).toFixed(2));
  }

  return library;
}

function prepareSongForCSV(song: Track) {
  let row: string[] = [];
  for (let field of Object.values(song)) {
    row.push(`"${field.replace(/"/g, '""')}"`);
  }

  return row.join(",") + "\n";
}

function getCSV(library: Track[]) {
  let csv = Object.keys(library[0]).join(",") + "\n";

  library.forEach((song) => {
    csv += prepareSongForCSV(song);
  });

  return csv;
}

function Export() {
  let [loading, setLoading] = useState(false);
  let [completion, setCompletion] = useState("0.00");
  let [CSVContent, setCSVContent] = useState("");
  let [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const t = getTokenFromCookie();
    setToken(t);
  }, []);

  async function handleClick() {
    if (!token) return null;

    setLoading(true);
    const response = await getLibrary(token, setCompletion);
    const content = getCSV(response);
    setCSVContent(content);
    setLoading(false);
  }

  if (loading) {
    return <Progress completion={completion} />;
  }

  if (CSVContent) {
    return <CSVDownload CSVContent={CSVContent} />;
  }

  if (token) {
    return <ExportLibraryButton handleClick={handleClick} />;
  }

  return <Link to="/">Something is wrong... go home.</Link>;
}

function ExportLibraryButton({ handleClick }: { handleClick: () => void }) {
  return (
    <button type="button" onClick={handleClick}>
      Export Library
    </button>
  );
}

function CSVDownload({ CSVContent }: { CSVContent: string }) {
  function handleClick() {
    const blob = new Blob([CSVContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `library_export_${new Date(Date.now()).toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <button type="button" onClick={handleClick}>
        Download
      </button>
      <br />
      <Link to="/">Go home</Link>
    </>
  );
}

function Progress({ completion }: { completion: string }) {
  return (
    <>
      <p>{completion} % Completed...</p>
      <p>
        ya it takes a while for big libraries - Spotify API only lets you get 50
        songs at a time.
      </p>
    </>
  );
}

export default Export;

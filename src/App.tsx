import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getTokenFromCookie from "./utils/getTokenFromCookie";
import "./styles/global.css";

function App() {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = getTokenFromCookie();
    setToken(t);
  }, []);

  return (
    <>
      <h1>Spotify Tools</h1>
      {!token ? <Link to="/login">Login</Link> : null}
      <ul>
        <li>
          <Link to="/export-import">
            [WIP] Export / Import your liked songs and playlists
          </Link>
        </li>
        <li>
          <Link to="duplicates">
            [WIP] Remove duplicate songs and albums from your liked songs and
            playlists
          </Link>
        </li>
        <li>
          <Link to="like-missing-songs">
            [WIP] Like all the songs from albums you have liked
          </Link>
        </li>
        <li>
          <Link to="remove-liked-songs">
            [WIP] Experimental: Remove liked songs from albums you <i>don't</i>{" "}
            like
          </Link>
        </li>
        <li>
          <Link to="lastfm-tools">
            [WIP] Create Spotify playlists based on your Last.fm listening
            history
          </Link>
        </li>
      </ul>
    </>
  );
}

export default App;

import { useEffect, useState } from "react";
import { FeatureList } from "./components/FeatureList";
import {
  getTokenFromCookie,
  setTokenCookie,
  spotifyFetch,
} from "./utils/constants";
import "./styles/global.css";

const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;

function objectToQueryString(obj: any) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function getAuthUrl() {
  const spotifyAuthEndpoint = "https://accounts.spotify.com/authorize?";

  if (!clientId || !redirectUri) {
    throw new Error("Missing config");
  }

  const params = {
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-library-modify user-library-read user-read-private",
  };

  const queryString = objectToQueryString(params);

  return spotifyAuthEndpoint + queryString;
}

function App() {
  const [user, setUser] = useState();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token =
      getTokenFromCookie() ||
      new URLSearchParams(window.location.search).get("token");

    if (token) {
      setTokenCookie(token);
      setHasToken(true);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await spotifyFetch({ endpoint: "/me" });
      if (!response.ok) {
        throw new Error("failed to get user's name :(");
      }

      const body = await response.json();
      setUser(body.display_name);
    };

    if (hasToken) {
      fetchUser();
    }
  }, [hasToken]);

  return (
    <>
      <h1>Spotify Tools</h1>
      {!hasToken && <a href={getAuthUrl()}>Login</a>}
      {user && <p>Hi, {user}!</p>}
      <FeatureList />
    </>
  );
}

export default App;

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
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "user-library-modify user-library-read user-read-private",
  };

  const queryString = objectToQueryString(params);

  return spotifyAuthEndpoint + queryString;
}

function getTokenFromUrl() {
  return window.location.hash
    ?.replace("#", "")
    .split("&")
    .filter((x) => x.startsWith("access_token"))[0]
    ?.split("=")[1];
}

function App() {
  const [user, setUser] = useState();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    setToken(getTokenFromCookie() || getTokenFromUrl());
  }, []);

  useEffect(() => {
    if (token) {
      setTokenCookie(token);
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await spotifyFetch({ endpoint: "/me" });
      if (!response.ok) {
        throw new Error("failed to get user's name :(");
      }

      const body = await response.json();
      setUser(body.display_name);
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  return (
    <>
      <h1>Spotify Tools</h1>
      {!token && <a href={getAuthUrl()}>Login</a>}
      {user && <p>Hi, {user}!</p>}
      <FeatureList />
    </>
  );
}

export default App;

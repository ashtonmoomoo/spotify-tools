import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import Prompt from "./components/Prompt";

function objectToQueryString(obj: any) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function getAuthUrl() {
  const spotifyAuthEndpoint = "https://accounts.spotify.com/authorize?";
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing config");
  }

  const params = {
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-library-modify user-library-read",
  };

  const queryString = objectToQueryString(params);

  return spotifyAuthEndpoint + queryString;
}

async function getAuthToken(authCode: string) {
  const spotifyTokenEndpoint = "https://accounts.spotify.com/api/token";
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  if (!redirectUri) {
    throw new Error("Missing config");
  }

  const params = {
    code: authCode,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  function getEncodedAuthString() {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
    const encoded = Buffer.from(clientId + ":" + clientSecret).toString(
      "base64"
    );

    return "Basic " + encoded;
  }

  const response = await fetch(spotifyTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getEncodedAuthString(),
    },
    body: objectToQueryString(params),
  });

  return response;
}

function Login() {
  return <a href={getAuthUrl()}>Log in with Spotify</a>;
}

function App() {
  const url = new URL(window.location.href);
  const authCode = url.searchParams.get("code");
  let [authToken, setAuthToken] = useState<string>("");

  useEffect(() => {
    if (!authCode) return;

    const fetchAuthToken = async () => {
      const response = await getAuthToken(authCode);
      if (!response.ok) throw new Error("Failed to get access token :(");

      const body = await response.json();
      console.log(body);

      setAuthToken(body["access_token"]);
    };

    fetchAuthToken();
  }, [authCode]);

  return (
    <>
      <h1>Spotify deduplicater</h1>
      {authToken ? <Prompt token={authToken} /> : <Login />}
    </>
  );
}

export default App;

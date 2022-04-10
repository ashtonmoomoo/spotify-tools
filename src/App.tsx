import { useEffect, useState } from "react";
import { FeatureList } from "./components/FeatureList";
import { getUsername } from "./utils/constants";
import {
  getAuthUrl,
  getTokenFromCookie,
  getTokenFromUrl,
  setTokenCookie,
} from "./utils/tools";
import "./styles/global.css";

function App() {
  const [username, setUsername] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    setToken(getTokenFromCookie() || getTokenFromUrl());
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const username = await getUsername();
      setUsername(username);
    };

    if (token && !getTokenFromCookie()) {
      setTokenCookie(token);
    }

    if (token) {
      fetchUsername();
    }
  }, [token]);

  return (
    <>
      <h1>Spotify Tools</h1>
      {!token && <a href={getAuthUrl()}>Login</a>}
      {username && <p>Hi, {username}!</p>}
      <FeatureList />
    </>
  );
}

export default App;

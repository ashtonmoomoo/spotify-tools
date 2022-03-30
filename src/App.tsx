import { useEffect, useState } from "react";
import { FeatureList } from "./components/FeatureList";
import { Link } from "react-router-dom";
import { getTokenFromCookie, spotifyFetch } from "./utils/constants";
import "./styles/global.css";

function App() {
  const [user, setUser] = useState();
  const token = getTokenFromCookie();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await spotifyFetch({ endpoint: "/me" });
      if (!response.ok) {
        throw new Error("failed to get user's name :(");
      }

      const body = await response.json();
      setUser(body.display_name);
    };

    fetchUser();
  }, [token]);

  return (
    <>
      <h1>Spotify Tools</h1>
      {!token && <Link to="/login">Login</Link>}
      {user && <p>Hi, {user}!</p>}
      <FeatureList />
    </>
  );
}

export default App;

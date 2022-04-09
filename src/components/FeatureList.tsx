import { Link } from "react-router-dom";

const FEATURES = [
  {
    url: "/export-import",
    text: "[WIP] Export / Import your liked songs and playlists",
  },
  {
    url: "/duplicates",
    text: "[WIP] Remove duplicate songs and albums from your liked songs and playlists",
  },
  {
    url: "/like-missing-songs",
    text: "[WIP] Like all the songs from albums you have liked",
  },
  {
    url: "/remove-liked-songs",
    text: "[WIP] Experimental: Remove liked songs from albums you <i>don't</i>like",
  },
  {
    url: "/lastfm-tools",
    text: "[WIP] Create Spotify playlists based on your Last.fm listening history",
  },
];

export function FeatureList() {
  return (
    <ul>
      {FEATURES.map((feature) => (
        <li>
          <Link to={feature.url}>{feature.text}</Link>
        </li>
      ))}
    </ul>
  );
}

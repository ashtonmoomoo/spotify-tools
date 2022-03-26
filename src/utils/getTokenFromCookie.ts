function getTokenFromCookie() {
  return document.cookie
  .split("; ")
  .find((row) => row.startsWith("spotify_token"))
  ?.split("=")[1];
}

export default getTokenFromCookie;